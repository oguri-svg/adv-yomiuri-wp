<?php
/**
 * Extend Control URL.
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Extend_Control_URL class.
 */
class Lazy_Blocks_Pro_Extend_Control_URL {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Actions.
		// Add priority 12 to override standard script, which uses 11 priority.
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_assets' ), 12 );
	}

	/**
	 * Enqueue assets.
	 */
	public function enqueue_assets() {
		Lazy_Blocks_Pro_Assets::enqueue_script( 'lzb-pro-extend-control-url', 'build/extend-control-url' );
	}
}

// Init.
new Lazy_Blocks_Pro_Extend_Control_URL();
