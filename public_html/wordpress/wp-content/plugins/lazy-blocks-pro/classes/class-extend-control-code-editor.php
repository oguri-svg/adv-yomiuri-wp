<?php
/**
 * Extend Control Code Editor.
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Extend_Control_Code_Editor class.
 */
class Lazy_Blocks_Pro_Extend_Control_Code_Editor {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Actions.
		// Add priority 12 to override standard script, which uses 11 priority.
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ), 12 );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ), 12 );
	}

	/**
	 * Enqueue block editor assets.
	 */
	public function enqueue_block_editor_assets() {
		if ( ! is_admin() ) {
			return;
		}

		Lazy_Blocks_Pro_Assets::enqueue_script( 'lzb-pro-extend-control-code-editor', 'build/extend-control-code-editor' );
	}

	/**
	 * Enqueue block assets.
	 */
	public function enqueue_block_assets() {
		if ( ! is_admin() ) {
			return;
		}

		Lazy_Blocks_Pro_Assets::enqueue_style( 'lzb-pro-extend-control-code-editor', 'build/extend-control-code-editor' );
		wp_style_add_data( 'lzb-pro-extend-control-code-editor', 'rtl', 'replace' );
	}
}

// Init.
new Lazy_Blocks_Pro_Extend_Control_Code_Editor();
