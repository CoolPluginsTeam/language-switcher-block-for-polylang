<?php
/**
 * Plugin Name: Language Switcher Block for Polylang
 * Plugin URI: 
 * Description: A plugin that adds a language switcher block to Gutenberg.
 * Version: 1.0.0
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * Author: Cool Plugins
 * Author URI: 
 * License: GPL2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: language-switcher-block-for-polylang
 * 
 * **/

if( ! defined( 'ABSPATH' ) ) {
   exit;
}

define('LSBG_VERSION', '1.0.0');
define('LSBG_PLUGIN_NAME', 'Language Switcher Block for');
define('LSBG_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('LSBG_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class - Singleton pattern
 */
class LSBG_Language_Switcher_Block {
    
    /**
     * Single instance of the class
     *
     * @var LSBG_Language_Switcher_Block
     */
    private static $instance = null;
    
    /**
     * Dropdown ID counter for unique dropdown IDs
     *
     * @var int
     */
    private $dropdown_id = 0;
    
    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Prevent cloning of the instance
     */
    private function __clone() {}
    
    /**
     * Prevent unserializing of the instance
     */
    public function __wakeup() {
        throw new Exception( "Cannot unserialize singleton" );
    }
    
    /**
     * Get the singleton instance
     *
     * @return LSBG_Language_Switcher_Block
     */
    public static function get_instance() {
        if ( self::$instance === null ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action( 'plugins_loaded', array( $this, 'load_blocks' ) );
    }
    
    /**
     * Load language switcher block
     */
    public function load_blocks() {
        // Check Polylang dependency
        if ( ! $this->check_polylang_dependency() ) {
            return;
        }
        
        // Register block on init
        add_action( 'init', array( $this, 'register_language_switcher_block' ) );
    }
    
    /**
     * Check Polylang dependency
     *
     * @return bool
     */
    private function check_polylang_dependency() {
        if ( ! function_exists( 'PLL' ) && ! class_exists( 'Polylang' ) ) {
            add_action( 'admin_notices', array( $this, 'polylang_missing_notice' ) );
            return false;
        }
        return true;
    }
    
    /**
     * Display admin notice when Polylang is missing
     */
    public function polylang_missing_notice() {
        ?>
        <div class="notice notice-error">
            <p>
                <?php 
                echo wp_kses_post( 
                    sprintf( 
                        __( '<strong>%s</strong> requires Polylang or Polylang Pro to be installed and activated.', 'language-switcher-block-for-polylang' ),
                        LSBG_PLUGIN_NAME
                    ) 
                );
                ?>
            </p>
        </div>
        <?php
    }
    
    /**
     * Register language switcher block
     */
    public function register_language_switcher_block() {
        // Check PLL function availability
        if ( ! function_exists( 'PLL' ) ) {
            return;
        }
        
        // Get Polylang instance
        $polylang = PLL();
        
        // Check language availability
        if ( $polylang && isset( $polylang->model ) && method_exists( $polylang->model, 'has_languages' ) ) {
            if ( ! $polylang->model->has_languages() ) {
                return;
            }
        }
        
        // Register block assets
        $this->register_block_assets();
        
        // Get switcher options
        $switcher_options = $this->get_switcher_options();
        
        // Localize block script
        wp_localize_script(
            'lsbg-language-switcher-block',
            'lsbgBlockSettings',
            array(
                'options' => $switcher_options,
            )
        );
        
        // Define block attributes
        $attributes = $this->get_block_attributes( $switcher_options );
        
        // Register block type
        register_block_type(
            'lsbg/language-switcher',
            array(
                'attributes'      => $attributes,
                'editor_script'   => 'lsbg-language-switcher-block',
                'editor_style'    => 'lsbg-language-switcher-block-editor',
                'style'           => 'lsbg-language-switcher-block',
                'render_callback' => array( $this, 'render_language_switcher_block' ),
            )
        );
    }
    
    /**
     * Register block assets (scripts and styles)
     */
    private function register_block_assets() {
        // Register block assets
        $asset_file = LSBG_PLUGIN_DIR . 'build/index.asset.php';
        $asset = file_exists( $asset_file )
            ? require $asset_file
            : array( 'dependencies' => array(), 'version' => LSBG_VERSION );
        
        // Register block script
        wp_register_script(
            'lsbg-language-switcher-block',
            LSBG_PLUGIN_URL . 'build/index.js',
            $asset['dependencies'],
            $asset['version'],
            false
        );
        
        // Register custom dropdown script
        wp_register_script(
            'lsbg-custom-dropdown',
            LSBG_PLUGIN_URL . 'build/dropdown.js',
            array(),
            LSBG_VERSION,
            true
        );
        
        // Register editor style
        wp_register_style(
            'lsbg-language-switcher-block-editor',
            LSBG_PLUGIN_URL . 'build/editor.css',
            array( 'wp-edit-blocks' ),
            LSBG_VERSION
        );
        
        // Register frontend style
        wp_register_style(
            'lsbg-language-switcher-block',
            LSBG_PLUGIN_URL . 'build/style.css',
            array(),
            LSBG_VERSION
        );
        
        // Enqueue dropdown script for editor
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_dropdown_script' ) );
    }
    
    /**
     * Enqueue dropdown script in the block editor
     */
    public function enqueue_editor_dropdown_script() {
        wp_enqueue_script( 'lsbg-custom-dropdown' );
    }
    
    /**
     * Get switcher options
     *
     * @return array
     */
    private function get_switcher_options() {
        return array(
            'show_names'             => array( 'label' => __( 'Displays language names', 'language-switcher-block-for-polylang' ), 'default' => 1 ),
            'show_flags'             => array( 'label' => __( 'Displays flags', 'language-switcher-block-for-polylang' ), 'default' => 0 ),
            'show_language_codes'    => array( 'label' => __( 'Show Language Codes', 'language-switcher-block-for-polylang' ), 'default' => 0 ),
            'hide_current'           => array( 'label' => __( 'Hides the current language', 'language-switcher-block-for-polylang' ), 'default' => 0 ),
            'hide_if_no_translation' => array( 'label' => __( 'Hides languages with no translation', 'language-switcher-block-for-polylang' ), 'default' => 0 ),
            'dropdown'               => array( 
                'label' => __( 'Layout', 'language-switcher-block-for-polylang' ), 
                'type' => 'select',
                'default' => 'vertical',
                'options' => array(
                    'dropdown' => __( 'Dropdown', 'language-switcher-block-for-polylang' ),
                    'vertical' => __( 'Vertical', 'language-switcher-block-for-polylang' ),
                    'horizontal' => __( 'Horizontal', 'language-switcher-block-for-polylang' ),
                )
            ),
        );
    }
    
    /**
     * Get block attributes
     *
     * @param array $switcher_options Switcher options.
     * @return array
     */
    private function get_block_attributes( $switcher_options ) {
        $attributes = array(
            'className' => array(
                'type'    => 'string',
                'default' => '',
            ),
        );
        
        foreach ( $switcher_options as $option => $data ) {
            if ( isset( $data['type'] ) && $data['type'] === 'select' ) {
                $attributes[ $option ] = array(
                    'type'    => 'string',
                    'default' => $data['default'],
                );
            } else {
                $attributes[ $option ] = array(
                    'type'    => 'boolean',
                    'default' => (bool) $data['default'],
                );
            }
        }
        
        return $attributes;
    }
    
    /**
     * Render language switcher block
     *
     * @param array $attributes Block attributes.
     * @return string Block HTML.
     */
    public function render_language_switcher_block( $attributes ) {
        if ( ! function_exists( 'pll_the_languages' ) ) {
            return '';
        }
        
        // Prepare switcher arguments
        $layout = isset( $attributes['dropdown'] ) ? $attributes['dropdown'] : 'vertical';
        
        $show_names = ! empty( $attributes['show_names'] );
        $show_flags = ! empty( $attributes['show_flags'] );
        $show_language_codes = ! empty( $attributes['show_language_codes'] );
        $hide_current = ! empty( $attributes['hide_current'] );
        $hide_if_no_translation = ! empty( $attributes['hide_if_no_translation'] );
        $is_dropdown = ( $layout === 'dropdown' );
        
        if ( ! $show_names && ! $show_flags ) {
            return '';
        }
        
        // Use custom dropdown for dropdown layout
        if ( $is_dropdown ) {
            return $this->render_custom_dropdown( $attributes );
        }
        
        // Use standard Polylang output
        $args = array(
            'echo'                   => 0,
            'show_names'             => $show_names,
            'show_flags'             => $show_flags,
            'hide_current'           => $hide_current,
            'hide_if_no_translation' => $hide_if_no_translation,
            'dropdown'               => $is_dropdown ? ++$this->dropdown_id : 0,
        );
        
        // Get switcher output
        $switcher_output = pll_the_languages( $args );
        
        if ( empty( $switcher_output ) ) {
            return '';
        }
        
        // Add language codes if enabled
        if ( $show_language_codes && $show_names ) {
            $raw_args = array(
                'echo'                   => 0,
                'raw'                    => 1,
                'hide_current'           => $hide_current,
                'hide_if_no_translation' => $hide_if_no_translation,
            );
            $languages = pll_the_languages( $raw_args );
            
            if ( is_array( $languages ) ) {
                foreach ( $languages as $lang ) {
                    if ( ! empty( $lang['name'] ) && ! empty( $lang['slug'] ) ) {
                        $pattern = '/>(' . preg_quote( $lang['name'], '/' ) . ')<\//';
                        $replacement = '>' . $lang['name'] . ' <span class="lsbg-language-code">' . esc_html( $lang['slug'] ) . '</span></';
                        $switcher_output = preg_replace( $pattern, $replacement, $switcher_output );
                    }
                }
            }
        }
        
        // Build wrapper attributes with layout class
        $layout_class = 'lsbg-layout-' . esc_attr( $layout );
        $custom_class = isset( $attributes['className'] ) ? $attributes['className'] : '';
        $wrapper_class = trim( $layout_class . ' ' . $custom_class );
        
        $wrapper_attributes = get_block_wrapper_attributes( 
            array( 'class' => $wrapper_class )
        );
        
        $aria_label = __( 'Choose a language', 'language-switcher-block-for-polylang' );
        
        if ( $args['dropdown'] ) {
            $switcher_output = '<label class="screen-reader-text" for="' . esc_attr( 'lang_choice_' . $args['dropdown'] ) . '">' . esc_html( $aria_label ) . '</label>' . $switcher_output;
            $wrap_tag = '<div %1$s>%2$s</div>';
        } else {
            $wrap_tag = '<nav role="navigation" aria-label="' . esc_attr( $aria_label ) . '"><ul %1$s>%2$s</ul></nav>';
        }
        
        return sprintf( $wrap_tag, $wrapper_attributes, $switcher_output );
    }
    
    /**
     * Render custom dropdown with flags support
     *
     * @param array $attributes Block attributes.
     * @return string Block HTML.
     */
    private function render_custom_dropdown( $attributes ) {
        if ( ! function_exists( 'pll_the_languages' ) ) {
            return '';
        }
        
        $show_names = ! empty( $attributes['show_names'] );
        $show_flags = ! empty( $attributes['show_flags'] );
        $show_language_codes = ! empty( $attributes['show_language_codes'] );
        $hide_current = ! empty( $attributes['hide_current'] );
        $hide_if_no_translation = ! empty( $attributes['hide_if_no_translation'] );
        
        // Get languages as array
        $args = array(
            'echo'                   => 0,
            'raw'                    => 1,
            'show_flags'             => $show_flags,
            'show_names'             => $show_names,
            'hide_current'           => $hide_current,
            'hide_if_no_translation' => $hide_if_no_translation,
        );
        
        $languages = pll_the_languages( $args );
        
        if ( empty( $languages ) || ! is_array( $languages ) ) {
            return '';
        }
        
        // Enqueue custom dropdown script
        wp_enqueue_script(
            'lsbg-custom-dropdown',
            LSBG_PLUGIN_URL . 'build/dropdown.js',
            array(),
            LSBG_VERSION,
            true
        );
        
        // Generate unique ID for this dropdown
        $dropdown_id = ++$this->dropdown_id;
        $unique_id = 'lsbg-dropdown-' . $dropdown_id;
        
        // Find current language
        $current_lang = null;
        foreach ( $languages as $lang ) {
            if ( ! empty( $lang['current_lang'] ) ) {
                $current_lang = $lang;
                break;
            }
        }
        
        if ( ! $current_lang ) {
            $current_lang = reset( $languages );
        }
        
        // Build wrapper attributes
        $layout_class = 'lsbg-layout-dropdown lsbg-custom-dropdown';
        $custom_class = isset( $attributes['className'] ) ? $attributes['className'] : '';
        $wrapper_class = trim( $layout_class . ' ' . $custom_class );
        
        $wrapper_attributes = get_block_wrapper_attributes( 
            array( 'class' => $wrapper_class )
        );
        
        $aria_label = __( 'Choose a language', 'language-switcher-block-for-polylang' );
        
        // Build dropdown HTML
        $output = '<div ' . $wrapper_attributes . '>';
        $output .= '<div class="lsbg-dropdown-container" id="' . esc_attr( $unique_id ) . '">';
        
        // Dropdown button (shows current language)
        $output .= '<button type="button" class="lsbg-dropdown-button" aria-haspopup="listbox" aria-expanded="false" aria-label="' . esc_attr( $aria_label ) . '">';
        
        if ( $show_flags && ! empty( $current_lang['flag'] ) ) {
            $output .= '<div class="lsbg-dropdown-button-image">';
            $output .= $current_lang['flag'];
            $output .= '</div>';
        }
        
        if ( $show_names && ! empty( $current_lang['name'] ) ) {
            $output .= '<div class="lsbg-dropdown-button-name">';
            $output .= esc_html( $current_lang['name'] );
            if ( $show_language_codes && ! empty( $current_lang['slug'] ) ) {
                $output .= ' <span class="lsbg-language-code">'  . esc_html( $current_lang['slug'] ) . '</span>';
            }
            $output .= '</div>';
        }
        
        $output .= '<span class="lsbg-dropdown-arrow" aria-hidden="true">▼</span>';
        $output .= '</button>';
        
        // Dropdown menu
        $output .= '<ul class="lsbg-dropdown-menu" role="listbox" style="display: none;">';
        
        foreach ( $languages as $lang ) {
            $is_current = ! empty( $lang['current_lang'] );
            $classes = array( 'lsbg-dropdown-item' );
            
            if ( $is_current ) {
                $classes[] = 'current-lang';
            }
            
            $output .= '<li role="option" class="' . esc_attr( implode( ' ', $classes ) ) . '">';
            $output .= '<a href="' . esc_url( $lang['url'] ) . '">';
            
            if ( $show_flags && ! empty( $lang['flag'] ) ) {
                $output .= '<div class="lsbg-dropdown-item-image">';
                $output .= $lang['flag'];
                $output .= '</div>';
            }
            
            if ( $show_names && ! empty( $lang['name'] ) ) {
                $output .= '<div class="lsbg-dropdown-item-name">';
                $output .= esc_html( $lang['name'] );
                if ( $show_language_codes && ! empty( $lang['slug'] ) ) {
                    $output .= ' <span class="lsbg-language-code">' . esc_html( $lang['slug'] ) . '</span>';
                }
                $output .= '</div>';
            }
            
            $output .= '</a>';
            $output .= '</li>';
        }
        
        $output .= '</ul>';
        $output .= '</div>';
        
        // Add inline initialization script for editor compatibility
        $output .= '<script>
        (function() {
            var container = document.getElementById("' . esc_js( $unique_id ) . '");
            if (!container || container.hasAttribute("data-lsbg-initialized")) return;
            
            var button = container.querySelector(".lsbg-dropdown-button");
            var menu = container.querySelector(".lsbg-dropdown-menu");
            
            if (!button || !menu) return;
            
            container.setAttribute("data-lsbg-initialized", "true");
            
            // Detect if we are in the editor context
            function isInEditor() {
                try {
                    // Check if in iframe (ServerSideRender)
                    if (window.self !== window.top) {
                        return true;
                    }
                    // Check for editor-specific classes
                    if (document.body.classList.contains("block-editor-page") ||
                        document.body.classList.contains("wp-admin")) {
                        return true;
                    }
                    // Check for editor elements
                    if (document.querySelector(".block-editor") || 
                        document.querySelector(".edit-post-visual-editor")) {
                        return true;
                    }
                } catch (e) {
                    // If we cannot access top window, assume we are in iframe/editor
                    return true;
                }
                return false;
            }
            
            var inEditor = isInEditor();
            
            function toggleDropdown() {
                var isExpanded = button.getAttribute("aria-expanded") === "true";
                if (isExpanded) {
                    button.setAttribute("aria-expanded", "false");
                    menu.style.display = "none";
                } else {
                    button.setAttribute("aria-expanded", "true");
                    menu.style.display = "block";
                }
            }
            
            function closeDropdown() {
                button.setAttribute("aria-expanded", "false");
                menu.style.display = "none";
            }
            
            button.addEventListener("click", function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdown();
            });
            
            button.addEventListener("keydown", function(e) {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                    e.preventDefault();
                    button.setAttribute("aria-expanded", "true");
                    menu.style.display = "block";
                    var firstItem = menu.querySelector("a");
                    if (firstItem) firstItem.focus();
                } else if (e.key === "Escape") {
                    closeDropdown();
                }
            });
            
            menu.addEventListener("keydown", function(e) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    closeDropdown();
                    button.focus();
                } else if (e.key === "Tab") {
                    closeDropdown();
                }
            });
            
            // Prevent link navigation in editor
            if (inEditor) {
                var links = menu.querySelectorAll("a");
                links.forEach(function(link) {
                    link.addEventListener("click", function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        closeDropdown();
                    });
                });
            }
            
            document.addEventListener("click", function(e) {
                if (!container.contains(e.target)) {
                    closeDropdown();
                }
            });
            
            menu.addEventListener("click", function(e) {
                e.stopPropagation();
            });
        })();
        </script>';
        
        $output .= '</div>';
        
        return $output;
    }
}

// Initialize the plugin singleton
LSBG_Language_Switcher_Block::get_instance();