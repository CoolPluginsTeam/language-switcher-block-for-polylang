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
 * @return array Border values [color, style, width, individual widths, radius].
 */
function lsbg_get_border_values( $attributes ) {
	// Get individual border widths
	$top    = isset( $attributes['borderWidthTop'] ) ? intval( $attributes['borderWidthTop'] ) : 0;
	$right  = isset( $attributes['borderWidthRight'] ) ? intval( $attributes['borderWidthRight'] ) : 0;
	$bottom = isset( $attributes['borderWidthBottom'] ) ? intval( $attributes['borderWidthBottom'] ) : 0;
	$left   = isset( $attributes['borderWidthLeft'] ) ? intval( $attributes['borderWidthLeft'] ) : 0;
	
	// Get individual border radius values
	$radius_top_left     = isset( $attributes['borderRadiusTopLeft'] ) ? intval( $attributes['borderRadiusTopLeft'] ) : 0;
	$radius_top_right    = isset( $attributes['borderRadiusTopRight'] ) ? intval( $attributes['borderRadiusTopRight'] ) : 0;
	$radius_bottom_right = isset( $attributes['borderRadiusBottomRight'] ) ? intval( $attributes['borderRadiusBottomRight'] ) : 0;
	$radius_bottom_left  = isset( $attributes['borderRadiusBottomLeft'] ) ? intval( $attributes['borderRadiusBottomLeft'] ) : 0;
	
	// Check if any individual widths are set
	$has_individual_widths = ( $top + $right + $bottom + $left ) > 0;
	
	// Check if any individual radius values are set
	$has_border_radius = ( $radius_top_left + $radius_top_right + $radius_bottom_right + $radius_bottom_left ) > 0;
	
	return array(
		'color'  => isset( $attributes['borderColor'] ) ? sanitize_text_field( $attributes['borderColor'] ) : '',
		'style'  => isset( $attributes['borderStyle'] ) ? sanitize_text_field( $attributes['borderStyle'] ) : 'solid',
		'width'  => isset( $attributes['borderWidth'] ) ? sanitize_text_field( $attributes['borderWidth'] ) : '',
		'top'    => $top,
		'right'  => $right,
		'bottom' => $bottom,
		'left'   => $left,
		'has_individual_widths' => $has_individual_widths,
		'radius_top_left'       => $radius_top_left,
		'radius_top_right'      => $radius_top_right,
		'radius_bottom_right'   => $radius_bottom_right,
		'radius_bottom_left'    => $radius_bottom_left,
		'has_border_radius'     => $has_border_radius,
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
		'ratio'  => isset( $attributes['flagRatio'] ) ? sanitize_text_field( $attributes['flagRatio'] ) : '4/3',
		'width'  => isset( $attributes['flagWidth'] ) ? intval( $attributes['flagWidth'] ) : 24,
		'radius' => isset( $attributes['flagRadius'] ) ? intval( $attributes['flagRadius'] ) : 0,
	);
}

