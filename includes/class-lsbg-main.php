<?php
/**
 * Main plugin class
 *
 * @package Language_Switcher_Block_For_Polylang
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
	 * Block ID counter for unique block IDs
	 *
	 * @var int
	 */
	private $block_id = 0;

	/**
	 * Array to store unique block identifiers
	 *
	 * @var array
	 */
	private $block_instances = array();

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
	public function __wakeup() {}

	/**
	 * Get the singleton instance
	 *
	 * @return LSBG_Language_Switcher_Block
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
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
		if ( ! $this->check_polylang_dependency() ) {
			return;
		}

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
						/* translators: %s: Plugin name */
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
		if ( ! function_exists( 'PLL' ) ) {
			return;
		}

		$polylang = PLL();

		if ( $polylang && isset( $polylang->model ) && method_exists( $polylang->model, 'has_languages' ) ) {
			if ( ! $polylang->model->has_languages() ) {
				return;
			}
		}

		$this->register_block_assets();

		$switcher_options = $this->get_switcher_options();

		wp_localize_script(
			'lsbg-language-switcher-block',
			'lsbgBlockSettings',
			array(
				'options' => $switcher_options,
			)
		);

		$attributes = $this->get_block_attributes( $switcher_options );

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
		$asset_file = LSBG_PLUGIN_DIR . 'build/index.asset.php';
		$asset      = file_exists( $asset_file )
			? require $asset_file
			: array(
				'dependencies' => array(),
				'version'      => LSBG_VERSION,
			);

		wp_register_script(
			'lsbg-language-switcher-block',
			LSBG_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			false
		);

		wp_register_script(
			'lsbg-custom-dropdown',
			LSBG_PLUGIN_URL . 'build/dropdown.js',
			array(),
			LSBG_VERSION,
			true
		);

		wp_register_style(
			'lsbg-language-switcher-block-editor',
			LSBG_PLUGIN_URL . 'build/editor.css',
			array( 'wp-edit-blocks' ),
			LSBG_VERSION
		);

		wp_register_style(
			'lsbg-language-switcher-block',
			LSBG_PLUGIN_URL . 'build/style.css',
			array(),
			LSBG_VERSION
		);

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
			'show_names'             => array(
				'label'   => __( 'Displays language names', 'language-switcher-block-for-polylang' ),
				'default' => 1,
			),
			'show_flags'             => array(
				'label'   => __( 'Displays flags', 'language-switcher-block-for-polylang' ),
				'default' => 0,
			),
			'show_language_codes'    => array(
				'label'   => __( 'Show Language Codes', 'language-switcher-block-for-polylang' ),
				'default' => 0,
			),
			'hide_current'           => array(
				'label'   => __( 'Hides the current language', 'language-switcher-block-for-polylang' ),
				'default' => 0,
			),
			'hide_if_no_translation' => array(
				'label'   => __( 'Hides languages with no translation', 'language-switcher-block-for-polylang' ),
				'default' => 0,
			),
			'dropdown'               => array(
				'label'   => __( 'Layout', 'language-switcher-block-for-polylang' ),
				'type'    => 'select',
				'default' => 'vertical',
				'options' => array(
					'dropdown'   => __( 'Dropdown', 'language-switcher-block-for-polylang' ),
					'vertical'   => __( 'Vertical', 'language-switcher-block-for-polylang' ),
					'horizontal' => __( 'Horizontal', 'language-switcher-block-for-polylang' ),
				),
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
			'className'     => array(
				'type'    => 'string',
				'default' => '',
			),
			'marginTop'     => array(
				'type'    => 'number',
				'default' => 0,
			),
			'marginRight'   => array(
				'type'    => 'number',
				'default' => 0,
			),
			'marginBottom'  => array(
				'type'    => 'number',
				'default' => 0,
			),
			'marginLeft'    => array(
				'type'    => 'number',
				'default' => 0,
			),
			'paddingTop'    => array(
				'type'    => 'number',
				'default' => 0,
			),
			'paddingRight'  => array(
				'type'    => 'number',
				'default' => 0,
			),
			'paddingBottom' => array(
				'type'    => 'number',
				'default' => 0,
			),
			'paddingLeft'   => array(
				'type'    => 'number',
				'default' => 0,
			),
			'borderColor'   => array(
				'type'    => 'string',
				'default' => '',
			),
			'borderStyle'   => array(
				'type'    => 'string',
				'default' => 'solid',
			),
			'borderWidth'   => array(
				'type'    => 'string',
				'default' => '',
			),
			'flagRatio'     => array(
				'type'    => 'string',
				'default' => '1/1',
			),
			'flagWidth'     => array(
				'type'    => 'number',
				'default' => 24,
			),
			'flagRadius'    => array(
				'type'    => 'number',
				'default' => 0,
			),
		);

		foreach ( $switcher_options as $option => $data ) {
			if ( isset( $data['type'] ) && 'select' === $data['type'] ) {
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
	 * Generate a unique block identifier
	 *
	 * @param array $attributes Block attributes.
	 * @return string Unique block identifier.
	 */
	private function get_unique_block_id( $attributes ) {
		++$this->block_id;
		$unique_hash = substr( md5( $this->block_id . microtime() . serialize( $attributes ) ), 0, 8 );
		$unique_id   = 'lsbg-block-' . $this->block_id . '-' . $unique_hash;
		$this->block_instances[] = $unique_id;
		return $unique_id;
	}

	/**
	 * Get custom flag URL for a language
	 *
	 * @param array $lang Language data from Polylang.
	 * @return string Flag HTML or empty string.
	 */
	private function get_custom_flag( $lang ) {
		$flag_url     = $lang['flag'];
		$country_code = lsbg_get_flag_code( $flag_url );
		$flag         = array(
			'path' => LSBG_PLUGIN_DIR . 'assets/flags/' . esc_html( $country_code ) . '.svg',
			'url'  => esc_url( LSBG_PLUGIN_URL . 'assets/flags/' . esc_html( $country_code ) . '.svg' ),
		);
		$flag['src']  = $flag['url'];
		return \PLL_Language::get_flag_html( $flag, '', $lang['name'] );
	}

	/**
	 * Generate custom spacing, border, and flag CSS
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $block_class Block class name.
	 * @return string Custom CSS.
	 */
	private function generate_spacing_css( $attributes, $block_class ) {
		$css = '';

		$margin  = lsbg_get_spacing_values( $attributes, 'margin' );
		$padding = lsbg_get_spacing_values( $attributes, 'padding' );
		$border  = lsbg_get_border_values( $attributes );
		$flag    = lsbg_get_flag_values( $attributes );

		$has_margin  = array_sum( $margin ) > 0;
		$has_padding = array_sum( $padding ) > 0;
		$has_border  = ! empty( $border['width'] ) && ! empty( $border['color'] );
		$show_flags  = ! empty( $attributes['show_flags'] );

		if ( ! $has_margin && ! $has_padding && ! $has_border && ! $show_flags ) {
			return '';
		}

		$css .= '<style>';

		// For horizontal/vertical layouts - list items
		$css .= '.' . $block_class . '.lsbg-layout-horizontal .lsep-lang-item,';
		$css .= '.' . $block_class . '.lsbg-layout-vertical .lsep-lang-item {';

		if ( $has_margin ) {
			$css .= 'margin: ' . implode( 'px ', $margin ) . 'px;';
		}

		if ( $has_padding ) {
			$css .= 'padding: ' . implode( 'px ', $padding ) . 'px;';
		}

		if ( $has_border ) {
			$css .= 'border: ' . $border['width'] . ' ' . $border['style'] . ' ' . $border['color'] . ';';
		}

		$css .= '}';

		// For dropdown button only
		$css .= '.' . $block_class . '.lsbg-layout-dropdown .lsbg-dropdown-button.lsep-lang-item {';

		if ( $has_margin ) {
			$css .= 'margin: ' . implode( 'px ', $margin ) . 'px;';
		}

		if ( $has_padding ) {
			$css .= 'padding: ' . implode( 'px ', $padding ) . 'px !important;';
		}

		if ( $has_border ) {
			$css .= 'border: ' . $border['width'] . ' ' . $border['style'] . ' ' . $border['color'] . ' !important;';
		}

		$css .= '}';

		// Flag styles
		if ( $show_flags ) {
			$flag_height = $flag['ratio'] === '4/3' ? round( $flag['width'] * 0.75 ) : $flag['width'];

			$css .= '.' . $block_class . ' .lsep-lang-image {';
			$css .= 'width: ' . $flag['width'] . 'px;';
			$css .= 'height: ' . $flag_height . 'px;';
			$css .= 'overflow: hidden;';
			$css .= '}';

			$css .= '.' . $block_class . ' .lsep-lang-image img {';
			$css .= 'width: 100%;';
			$css .= 'height: 100%;';
			$css .= 'object-fit: cover;';
			if ( $flag['radius'] ) {
				$css .= 'border-radius: ' . $flag['radius'] . 'px;';
			}
			$css .= '}';
		}

		$css .= '</style>';

		return $css;
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

		$layout     = isset( $attributes['dropdown'] ) ? $attributes['dropdown'] : 'vertical';
		$show_names = ! empty( $attributes['show_names'] );
		$show_flags = ! empty( $attributes['show_flags'] );

		if ( ! $show_names && ! $show_flags ) {
			return '';
		}

		if ( 'dropdown' === $layout ) {
			return $this->render_custom_dropdown( $attributes );
		}

		return $this->render_horizontal_vertical_layout( $attributes );
	}

	/**
	 * Render horizontal and vertical layouts
	 *
	 * @param array $attributes Block attributes.
	 * @return string Block HTML.
	 */
	private function render_horizontal_vertical_layout( $attributes ) {
		if ( ! function_exists( 'pll_the_languages' ) ) {
			return '';
		}

		$layout                 = isset( $attributes['dropdown'] ) ? $attributes['dropdown'] : 'vertical';
		$show_names             = ! empty( $attributes['show_names'] );
		$show_flags             = ! empty( $attributes['show_flags'] );
		$show_language_codes    = ! empty( $attributes['show_language_codes'] );
		$hide_current           = ! empty( $attributes['hide_current'] );
		$hide_if_no_translation = ! empty( $attributes['hide_if_no_translation'] );

		$args = array(
			'echo'                   => 0,
			'raw'                    => 1,
			'show_flags'             => 0,
			'show_names'             => $show_names,
			'hide_current'           => $hide_current,
			'hide_if_no_translation' => $hide_if_no_translation,
		);

		$languages = pll_the_languages( $args );

		if ( empty( $languages ) || ! is_array( $languages ) ) {
			return '';
		}

		$unique_class       = $this->get_unique_block_id( $attributes );
		$layout_class       = 'lsbg-layout-' . esc_attr( $layout );
		$custom_class       = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$wrapper_class      = trim( $unique_class . ' ' . $layout_class . ' ' . $custom_class );
		$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => $wrapper_class ) );
		$aria_label         = __( 'Choose a language', 'language-switcher-block-for-polylang' );
		$spacing_css        = $this->generate_spacing_css( $attributes, $unique_class );
		$switcher_output    = '';

		foreach ( $languages as $lang ) {
			$is_current = ! empty( $lang['current_lang'] );

			$switcher_output .= '<li class="lsep-lang-item' . ( $is_current ? ' current-lang' : '' ) . '">';

			$link_attrs = array(
				'href' => esc_url( $lang['url'] ),
			);

			if ( $is_current ) {
				$link_attrs['aria-current'] = 'true';
			}

			if ( ! empty( $lang['locale'] ) ) {
				$link_attrs['lang']     = esc_attr( $lang['locale'] );
				$link_attrs['hreflang'] = esc_attr( $lang['locale'] );
			}

			$switcher_output .= '<a';
			foreach ( $link_attrs as $attr => $value ) {
				$switcher_output .= ' ' . $attr . '="' . $value . '"';
			}
			$switcher_output .= '>';

			if ( $show_flags ) {
				$custom_flag = $this->get_custom_flag( $lang );
				if ( $custom_flag ) {
					$switcher_output .= '<div class="lsep-lang-image">' . $custom_flag . '</div>';
				}
			}

			if ( $show_names && ! empty( $lang['name'] ) ) {
				$switcher_output .= '<div class="lsep-lang-name">' . esc_html( $lang['name'] ) . '</div>';
			}

			if ( $show_language_codes && ! empty( $lang['slug'] ) ) {
				$switcher_output .= '<div class="lsep-lang-code">' . esc_html( $lang['slug'] ) . '</div>';
			}

			$switcher_output .= '</a></li>';
		}

		return sprintf(
			'%s<nav role="navigation" aria-label="%s"><ul %s>%s</ul></nav>',
			$spacing_css,
			esc_attr( $aria_label ),
			$wrapper_attributes,
			$switcher_output
		);
	}

	/**
	 * Render custom dropdown
	 *
	 * @param array $attributes Block attributes.
	 * @return string Block HTML.
	 */
	private function render_custom_dropdown( $attributes ) {
		if ( ! function_exists( 'pll_the_languages' ) ) {
			return '';
		}

		$show_names             = ! empty( $attributes['show_names'] );
		$show_flags             = ! empty( $attributes['show_flags'] );
		$show_language_codes    = ! empty( $attributes['show_language_codes'] );
		$hide_current           = ! empty( $attributes['hide_current'] );
		$hide_if_no_translation = ! empty( $attributes['hide_if_no_translation'] );

		$args = array(
			'echo'                   => 0,
			'raw'                    => 1,
			'show_flags'             => 0,
			'show_names'             => $show_names,
			'hide_current'           => $hide_current,
			'hide_if_no_translation' => $hide_if_no_translation,
		);

		$languages = pll_the_languages( $args );

		if ( empty( $languages ) || ! is_array( $languages ) ) {
			return '';
		}

		wp_enqueue_script( 'lsbg-custom-dropdown' );

		$unique_class = $this->get_unique_block_id( $attributes );
		$dropdown_id  = ++$this->dropdown_id;
		$unique_id    = 'lsbg-dropdown-' . $dropdown_id . '-' . substr( $unique_class, -8 );

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

		$layout_class       = 'lsbg-layout-dropdown lsbg-custom-dropdown';
		$custom_class       = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$wrapper_class      = trim( $unique_class . ' ' . $layout_class . ' ' . $custom_class );
		$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => $wrapper_class ) );
		$aria_label         = __( 'Choose a language', 'language-switcher-block-for-polylang' );
		$spacing_css        = $this->generate_spacing_css( $attributes, $unique_class );

		$output  = $spacing_css;
		$output .= '<div ' . $wrapper_attributes . '>';
		$output .= '<div class="lsbg-dropdown-container" id="' . esc_attr( $unique_id ) . '">';
		$output .= '<button type="button" class="lsbg-dropdown-button lsep-lang-item" aria-haspopup="listbox" aria-expanded="false" aria-label="' . esc_attr( $aria_label ) . '">';

		if ( $show_flags ) {
			$custom_flag = $this->get_custom_flag( $current_lang );
			if ( $custom_flag ) {
				$output .= '<div class="lsep-lang-image">' . $custom_flag . '</div>';
			}
		}

		if ( $show_names && ! empty( $current_lang['name'] ) ) {
			$output .= '<div class="lsbg-dropdown-button-name">' . esc_html( $current_lang['name'] );
			if ( $show_language_codes && ! empty( $current_lang['slug'] ) ) {
				$output .= ' <span class="lsbg-language-code">' . esc_html( $current_lang['slug'] ) . '</span>';
			}
			$output .= '</div>';
		}

		$output .= '<span class="lsbg-dropdown-arrow" aria-hidden="true">▼</span>';
		$output .= '</button>';
		$output .= '<ul class="lsbg-dropdown-menu" role="listbox" style="display: none;">';

		foreach ( $languages as $lang ) {
			$is_current = ! empty( $lang['current_lang'] );
			$classes    = array( 'lsbg-dropdown-item' );

			if ( $is_current ) {
				$classes[] = 'current-lang';
			}

			$output .= '<li role="option" class="' . esc_attr( implode( ' ', $classes ) ) . '">';
			$output .= '<a href="' . esc_url( $lang['url'] ) . '">';

			if ( $show_flags ) {
				$custom_flag = $this->get_custom_flag( $lang );
				if ( $custom_flag ) {
					$output .= '<div class="lsep-lang-image">' . $custom_flag . '</div>';
				}
			}

			if ( $show_names && ! empty( $lang['name'] ) ) {
				$output .= '<div class="lsbg-dropdown-item-name">' . esc_html( $lang['name'] );
				if ( $show_language_codes && ! empty( $lang['slug'] ) ) {
					$output .= ' <span class="lsbg-language-code">' . esc_html( $lang['slug'] ) . '</span>';
				}
				$output .= '</div>';
			}

			$output .= '</a></li>';
		}

		$output .= '</ul></div></div>';

		return $output;
	}
}

