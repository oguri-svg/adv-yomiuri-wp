<?php
/**
 * Control Panel
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Control_Panel class.
 *
 * LazyBlocks_Control - https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php
 */
class Lazy_Blocks_Pro_Control_Panel extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Control unique name.
		$this->name = 'panel';

		// Control icon SVG.
		// You may use these icons https://material.io/resources/icons/?icon=accessibility&style=outline .
		$this->icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 18.5H21V20H3V18.5Z" fill="currentColor"/><path d="M3 4H21V5.5H3V4Z" fill="currentColor"/><path d="M4 8.75H20C20.1381 8.75 20.25 8.86193 20.25 9V15C20.25 15.1381 20.1381 15.25 20 15.25H4C3.86193 15.25 3.75 15.1381 3.75 15V9C3.75 8.86193 3.86193 8.75 4 8.75Z" stroke="currentColor" stroke-width="1.5"/></svg>';

		// Control value type [string, number, boolean, array].
		$this->type = 'string';

		// Control label.
		$this->label = __( 'Panel', 'lazy-blocks' );

		// Category name [basic, content, choice, advanced, layout]
		// How to add custom category - https://lazyblocks.com/docs/php-filters/lzb-controls-categories/.
		$this->category = 'layout';

		// Add/remove some options from control settings.
		// More options see in https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php .
		$this->restrictions = array(
			'as_child'              => false,
			'name_settings'         => false,
			'default_settings'      => false,
			'help_settings'         => false,
			'width_settings'        => false,
			'required_settings'     => false,
			'save_in_meta_settings' => false,
		);

		// Optional additional attributes, that will be saved in control data.
		$this->attributes = array(
			'icon'         => '',
			'initial_open' => 'true',
			'endpoint'     => 'false',
		);

		parent::__construct();
	}

	/**
	 * Register control assets.
	 */
	public function register_assets() {
		Lazy_Blocks_Pro_Assets::register_script( 'lzb-pro-control-panel', 'build/control-panel' );
		Lazy_Blocks_Pro_Assets::register_style( 'lzb-pro-control-panel', 'build/control-panel' );
		wp_style_add_data( 'lzb-pro-control-panel', 'rtl', 'replace' );
	}

	/**
	 * Enqueue control scripts.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lzb-pro-control-panel' );
	}

	/**
	 * Enqueue control styles.
	 *
	 * @return array script dependencies.
	 */
	public function get_style_depends() {
		return array( 'lzb-pro-control-panel' );
	}
}

// Init.
new Lazy_Blocks_Pro_Control_Panel();
