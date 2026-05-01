<?php
/**
 * Conditional Logic
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Conditional_Logic class.
 */
class Lazy_Blocks_Pro_Conditional_Logic {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Actions.
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_assets' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );
	}

	/**
	 * Enqueue editor assets.
	 */
	public function enqueue_editor_assets() {
		Lazy_Blocks_Pro_Assets::enqueue_script( 'lzb-pro-conditional-logic', 'build/conditional-logic' );
	}

	/**
	 * Enqueue block assets.
	 */
	public function enqueue_block_assets() {
		if ( ! is_admin() ) {
			return;
		}

		Lazy_Blocks_Pro_Assets::enqueue_style( 'lzb-pro-conditional-logic', 'build/conditional-logic' );
		wp_style_add_data( 'lzb-pro-conditional-logic', 'rtl', 'replace' );
	}
}

// Init.
new Lazy_Blocks_Pro_Conditional_Logic();
