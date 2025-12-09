<?php
/**
 * Plugin Name: Language Switcher Block for Polylang
 * Plugin URI: 
 * Description: A plugin that adds a language switcher block to Gutenberg.
 * Version: 1.0.0
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * Requires Plugins: polylang
 * Author: Cool Plugins
 * Author URI: 
 * License: GPL2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: language-switcher-block-for-polylang
 *
 * @package Language_Switcher_Block_For_Polylang
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'LSBG_VERSION', '1.0.0' );
define( 'LSBG_PLUGIN_NAME', 'Language Switcher Block for Polylang' );
define( 'LSBG_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'LSBG_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'LSBG_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Check if Polylang is active
 *
 * @return bool
 */
function lsbg_is_polylang_active() {
	return function_exists( 'PLL' ) || class_exists( 'Polylang' );
}

/**
 * Deactivate plugin if Polylang is not active
 */
function lsbg_check_dependency() {
	if ( is_admin() && current_user_can( 'activate_plugins' ) && ! lsbg_is_polylang_active() ) {
		// Check if plugin is active
		if ( is_plugin_active( LSBG_PLUGIN_BASENAME ) ) {
			// Deactivate the plugin
			deactivate_plugins( LSBG_PLUGIN_BASENAME );
			
			// Add admin notice
			add_action( 'admin_notices', 'lsbg_dependency_notice' );
			
			// Prevent further execution
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Only suppressing WordPress's own activation message, not processing user data.
			if ( isset( $_GET['activate'] ) ) {
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Safe to unset WordPress internal parameter.
				unset( $_GET['activate'] );
			}
		}
	}
}
add_action( 'admin_init', 'lsbg_check_dependency' );

/**
 * Show admin notice when plugin is deactivated due to missing dependency
 */
function lsbg_dependency_notice() {
	?>
	<div class="notice notice-error is-dismissible">
		<p>
			<?php
			echo wp_kses_post(
				sprintf(
					/* translators: %s: Plugin name */
					__( '<strong>%s</strong> has been deactivated because it requires Polylang or Polylang Pro to be installed and activated.', 'language-switcher-block-for-polylang' ),
					LSBG_PLUGIN_NAME
				)
			);
			?>
		</p>
	</div>
	<?php
}

/**
 * Prevent activation if Polylang is not active
 */
function lsbg_activation_check() {
	if ( ! lsbg_is_polylang_active() ) {
		deactivate_plugins( LSBG_PLUGIN_BASENAME );
		wp_die(
			sprintf(
				'<h1>%s</h1><p>%s</p><p><a href="%s">%s</a></p>',
				esc_html__( 'Plugin Activation Failed', 'language-switcher-block-for-polylang' ),
			sprintf(
				/* translators: %s: Plugin name */
				esc_html__( '%s requires Polylang or Polylang Pro to be installed and activated.', 'language-switcher-block-for-polylang' ),
				'<strong>' . esc_html( LSBG_PLUGIN_NAME ) . '</strong>'
			),
				esc_url( admin_url( 'plugins.php' ) ),
				esc_html__( 'Return to Plugins', 'language-switcher-block-for-polylang' )
			),
			esc_html__( 'Plugin Dependency Error', 'language-switcher-block-for-polylang' ),
			array( 'back_link' => true )
		);
	}
}
register_activation_hook( __FILE__, 'lsbg_activation_check' );

/**
 * Auto-deactivate when Polylang is deactivated
 */
function lsbg_deactivate_with_polylang( $plugin ) {
	// Check if Polylang or Polylang Pro is being deactivated
	if ( 'polylang/polylang.php' === $plugin || 'polylang-pro/polylang.php' === $plugin ) {
		if ( is_plugin_active( LSBG_PLUGIN_BASENAME ) ) {
			deactivate_plugins( LSBG_PLUGIN_BASENAME );
		}
	}
}
add_action( 'deactivate_plugin', 'lsbg_deactivate_with_polylang' );

// Only load plugin if Polylang is active
if ( ! lsbg_is_polylang_active() ) {
	return;
}

// Load helper functions
require_once LSBG_PLUGIN_DIR . 'helpers/helper-functions.php';

// Load main class
require_once LSBG_PLUGIN_DIR . 'includes/class-lsbg-main.php';

// Initialize the plugin
LSBG_Language_Switcher_Block::get_instance();
