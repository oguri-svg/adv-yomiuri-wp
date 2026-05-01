<?php
/**
 * Control Message
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Control_Message class.
 *
 * LazyBlocks_Control - https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php
 */
class Lazy_Blocks_Pro_Control_Message extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Control unique name.
		$this->name = 'message';

		// Control icon SVG.
		// You may use these icons https://material.io/resources/icons/?icon=accessibility&style=outline .
		$this->icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H20" stroke="currentColor" stroke-width="1.5"/><path d="M4 10H20" stroke="currentColor" stroke-width="1.5"/><path d="M4 14H20" stroke="currentColor" stroke-width="1.5"/><path d="M4 18H13" stroke="currentColor" stroke-width="1.5"/></svg>';

		// Control value type [string, number, boolean, array].
		$this->type = 'string';

		// Control label.
		$this->label = __( 'Message', 'lazy-blocks' );

		// Category name [basic, content, choice, advanced, layout]
		// How to add custom category - https://lazyblocks.com/docs/php-filters/lzb-controls-categories/.
		$this->category = 'layout';

		// Add/remove some options from control settings.
		// More options see in https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php .
		$this->restrictions = array(
			'name_settings'         => false,
			'default_settings'      => false,
			'help_settings'         => false,
			'required_settings'     => false,
			'save_in_meta_settings' => false,
		);

		// Optional additional attributes, that will be saved in control data.
		$this->attributes = array(
			'message_text'      => '',
			'message_new_lines' => 'paragraphs',
		);

		// Filters.
		add_filter( 'lzb/block_save/array_attributes/textarea_items', array( $this, 'block_save_array_items' ) );
		add_filter( 'lzb/sanitize_block_control_data', array( $this, 'sanitize_block_message_control' ) );

		parent::__construct();
	}

	/**
	 * Register control assets.
	 */
	public function register_assets() {
		Lazy_Blocks_Pro_Assets::register_script( 'lzb-pro-control-message', 'build/control-message' );
	}

	/**
	 * Enqueue control scripts.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lzb-pro-control-message' );
	}

	/**
	 * Escape 'message_text' array item as textarea.
	 *
	 * @param array $block_data_array_textarea - array items.
	 *
	 * @return array - array items.
	 */
	public function block_save_array_items( $block_data_array_textarea ) {
		$block_data_array_textarea[] = 'message_text';

		return $block_data_array_textarea;
	}

	/**
	 * Sanitize block message control.
	 *
	 * @param array $data - list with keys to sanitize.
	 *
	 * @return array
	 */
	public function sanitize_block_message_control( $data ) {
		if ( isset( $data['message_text'] ) ) {
			return $data;
		}

		$data[] = 'message_text';

		return $data;
	}
}

// Init.
new Lazy_Blocks_Pro_Control_Message();
