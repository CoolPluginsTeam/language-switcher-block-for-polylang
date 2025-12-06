<?php
/**
 * Plugin Name: Language Switcher Block for Polylang
 * Plugin URI: 
 * Description: A plugin that adds a language switcher block to Gutenberg.
 * Version: 1.0.0
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * Author: Vishabjeet Singh
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
            'force_home'             => array( 'label' => __( 'Forces link to front page', 'language-switcher-block-for-polylang' ), 'default' => 0 ),
            'hide_current'           => array( 'label' => __( 'Hides the current language', 'language-switcher-block-for-polylang' ), 'default' => 0 ),
            'hide_if_no_translation' => array( 'label' => __( 'Hides languages with no translation', 'language-switcher-block-for-polylang' ), 'default' => 0 ),
            'dropdown'               => array( 'label' => __( 'Displays as dropdown', 'language-switcher-block-for-polylang' ), 'default' => 0 ),
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
            $attributes[ $option ] = array(
                'type'    => 'boolean',
                'default' => (bool) $data['default'],
            );
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
        $args = array(
            'echo'                   => 0,
            'show_names'             => ! empty( $attributes['show_names'] ),
            'show_flags'             => ! empty( $attributes['show_flags'] ),
            'force_home'             => ! empty( $attributes['force_home'] ),
            'hide_current'           => ! empty( $attributes['hide_current'] ),
            'hide_if_no_translation' => ! empty( $attributes['hide_if_no_translation'] ),
            'dropdown'               => ! empty( $attributes['dropdown'] ) ? ++$this->dropdown_id : 0,
        );
        
        // Get switcher output
        $switcher_output = pll_the_languages( $args );

        
        if ( empty( $switcher_output ) ) {
            return '';
        }
        
        // Build wrapper attributes
        $wrapper_attributes = get_block_wrapper_attributes( 
            array( 'class' => isset( $attributes['className'] ) ? $attributes['className'] : '' )
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
}

// Initialize the plugin singleton
LSBG_Language_Switcher_Block::get_instance();