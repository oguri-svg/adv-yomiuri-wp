<?php
/**
 * Control Divider
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Control_Divider class.
 *
 * LazyBlocks_Control - https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php
 */
class Lazy_Blocks_Pro_Control_Divider extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Control unique name.
		$this->name = 'divider';

		// Control icon SVG.
		// You may use these icons https://material.io/resources/icons/?icon=accessibility&style=outline .
		$this->icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H21" stroke="currentColor" stroke-width="1.5"/></svg>';

		// Control value type [string, number, boolean, array].
		$this->type = 'string';

		// Control label.
		$this->label = __( 'Divider', 'lazy-blocks' );

		// Category name [basic, content, choice, advanced, layout]
		// How to add custom category - https://lazyblocks.com/docs/php-filters/lzb-controls-categories/.
		$this->category = 'layout';

		// Add/remove some options from control settings.
		// More options see in https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php .
		$this->restrictions = array(
			'label_settings'        => false,
			'name_settings'         => false,
			'default_settings'      => false,
			'help_settings'         => false,
			'required_settings'     => false,
			'save_in_meta_settings' => false,
		);

		parent::__construct();
	}

	/**
	 * Register control assets.
	 */
	public function register_assets() {
		Lazy_Blocks_Pro_Assets::register_script( 'lzb-pro-control-divider', 'build/control-divider' );
		Lazy_Blocks_Pro_Assets::register_style( 'lzb-pro-control-divider', 'build/control-divider' );
		wp_style_add_data( 'lzb-pro-control-divider', 'rtl', 'replace' );
	}

	/**
	 * Enqueue control scripts.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lzb-pro-control-divider' );
	}

	/**
	 * Enqueue control styles.
	 *
	 * @return array script dependencies.
	 */
	public function get_style_depends() {
		return array( 'lzb-pro-control-divider' );
	}
}

// Init.
new Lazy_Blocks_Pro_Control_Divider();
