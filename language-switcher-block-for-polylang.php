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
// if ( ! lsbg_is_polylang_active() ) {
// 	return;
// }

// Load helper functions
require_once LSBG_PLUGIN_DIR . 'helpers/helper-functions.php';

// Load main class
require_once LSBG_PLUGIN_DIR . 'includes/class-lsbg-main.php';

// Initialize the plugin
LSBG_Language_Switcher_Block::get_instance();
