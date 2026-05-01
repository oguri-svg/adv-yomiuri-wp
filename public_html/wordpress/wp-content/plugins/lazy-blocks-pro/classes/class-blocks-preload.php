<?php
/**
 * Blocks Preload
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Blocks_Preload class.
 */
class Lazy_Blocks_Pro_Blocks_Preload {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Actions.
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_assets' ) );

		// Filters.
		// Higher priority used to prevent the possible conflicts
		// with 3rd-party code, which uses these filters for customizations.
		add_filter( 'lzb/block_render/output', array( $this, 'block_render_output' ), 200, 2 );
		add_filter( 'lzb/block_render/attributes', array( $this, 'skip_editor_inner_blocks_attribute' ), 101, 3 );
	}

	/**
	 * Enqueue assets.
	 */
	public function enqueue_assets() {
		global $lzb_preloaded_blocks;

		// Allows to disable this feature.
		if ( ! apply_filters( 'lzb_pro/preload_blocks', true ) ) {
			return;
		}

		Lazy_Blocks_Pro_Assets::enqueue_script( 'lzb-pro-blocks-preload', 'build/blocks-preload' );

		// During the edit screen loading, WordPress renders all blocks in its own attempt to preload data.
		// Retrieve any cached block HTML and include this in the localized data.
		wp_localize_script(
			'lzb-pro-blocks-preload',
			'lzbProBlocksPreloaded',
			is_array( $lzb_preloaded_blocks ) ? $lzb_preloaded_blocks : array()
		);
	}

	/**
	 * Prepare caches for lazy blocks (editor HTML only).
	 *
	 * @param string $output     Block output.
	 * @param array  $attributes Block attributes.
	 *
	 * @return string
	 */
	public function block_render_output( $output, $attributes ) {
		global $lzb_preloaded_blocks;

		if ( ! empty( $attributes['blockId'] ) ) {
			if ( empty( $lzb_preloaded_blocks ) ) {
				$lzb_preloaded_blocks = array();
			}

			$lzb_preloaded_blocks[ $attributes['blockId'] ] = $output;
		}

		return $output;
	}

	/**
	 * Remove inner-block attribute from editor, which is added in the preloaded block,
	 * as it is not working with the block preview JS update and looks like a bug.
	 *
	 * @link https://wordpress.org/support/topic/inner-blocks-in-v3/
	 *
	 * @param array $attributes - block attributes.
	 * @param mixed $content - block content.
	 * @param mixed $block - block data.
	 *
	 * @return array filtered attribute data.
	 */
	public function skip_editor_inner_blocks_attribute( $attributes, $content, $block ) {
		if ( ! is_admin() || ! isset( $block['controls'] ) || empty( $block['controls'] ) ) {
			return $attributes;
		}

		// prepare decoded array to actual array.
		foreach ( $block['controls'] as $control ) {
			if ( 'inner_blocks' === $control['type'] && ! empty( $attributes[ $control['name'] ] ) ) {
				$attributes[ $control['name'] ] = '';
			}
		}

		return $attributes;
	}
}

// Init.
new Lazy_Blocks_Pro_Blocks_Preload();
