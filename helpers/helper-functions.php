<?php
/**
 * Helper functions for Language Switcher Block
 *
 * @package Language_Switcher_Block_For_Polylang
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get flag code from flag URL
 *
 * @param string $flag_url Flag URL from Polylang.
 * @return string|false Flag code or false.
 */
function lsbg_get_flag_code( $flag_url ) {
	$flag_code = preg_match( '/polylang\/flags\/([a-z]+)\.(png|svg|jpg|jpeg)$/i', $flag_url, $matches ) ? $matches[1] : false;
	return $flag_code;
}

/**
 * Get spacing values from attributes
 *
 * @param array  $attributes Block attributes.
 * @param string $type Spacing type (margin or padding).
 * @return array Spacing values [top, right, bottom, left].
 */
function lsbg_get_spacing_values( $attributes, $type ) {
	$prefix = $type === 'margin' ? 'margin' : 'padding';
	return array(
		isset( $attributes[ $prefix . 'Top' ] ) ? intval( $attributes[ $prefix . 'Top' ] ) : 0,
		isset( $attributes[ $prefix . 'Right' ] ) ? intval( $attributes[ $prefix . 'Right' ] ) : 0,
		isset( $attributes[ $prefix . 'Bottom' ] ) ? intval( $attributes[ $prefix . 'Bottom' ] ) : 0,
		isset( $attributes[ $prefix . 'Left' ] ) ? intval( $attributes[ $prefix . 'Left' ] ) : 0,
	);
}

/**
 * Get border values from attributes
 *
 * @param array $attributes Block attributes.
 * @return array Border values [color, style, width].
 */
function lsbg_get_border_values( $attributes ) {
	return array(
		'color' => isset( $attributes['borderColor'] ) ? sanitize_text_field( $attributes['borderColor'] ) : '',
		'style' => isset( $attributes['borderStyle'] ) ? sanitize_text_field( $attributes['borderStyle'] ) : 'solid',
		'width' => isset( $attributes['borderWidth'] ) ? sanitize_text_field( $attributes['borderWidth'] ) : '',
	);
}

/**
 * Get flag values from attributes
 *
 * @param array $attributes Block attributes.
 * @return array Flag values [ratio, width, radius].
 */
function lsbg_get_flag_values( $attributes ) {
	return array(
		'ratio'  => isset( $attributes['flagRatio'] ) ? sanitize_text_field( $attributes['flagRatio'] ) : '1/1',
		'width'  => isset( $attributes['flagWidth'] ) ? intval( $attributes['flagWidth'] ) : 24,
		'radius' => isset( $attributes['flagRadius'] ) ? intval( $attributes['flagRadius'] ) : 0,
	);
}

