<?php
/**
 * Control Taxonomy
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Control_Taxonomy class.
 *
 * LazyBlocks_Control - https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php
 */
class Lazy_Blocks_Pro_Control_Taxonomy extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Control unique name.
		$this->name = 'taxonomy';

		// Control icon SVG.
		// You may use these icons https://material.io/resources/icons/?icon=accessibility&style=outline .
		$this->icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.545 13.9296L13.9351 19.5409C13.7898 19.6865 13.6172 19.8019 13.4272 19.8807C13.2373 19.9595 13.0336 20 12.828 20C12.6224 20 12.4187 19.9595 12.2288 19.8807C12.0388 19.8019 11.8662 19.6865 11.7209 19.5409L5 12.8261V5H12.8241L19.545 11.7226C19.8364 12.0159 20 12.4126 20 12.8261C20 13.2396 19.8364 13.6363 19.545 13.9296Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 10C9.55228 10 10 9.55228 10 9C10 8.44772 9.55228 8 9 8C8.44772 8 8 8.44772 8 9C8 9.55228 8.44772 10 9 10Z" fill="currentColor"/></svg>';

		// Control value type [string, number, boolean, array].
		$this->type = 'string';

		// Control label.
		$this->label = __( 'Taxonomy', 'lazy-blocks' );

		// Category name [basic, content, choice, advanced, layout]
		// How to add custom category - https://lazyblocks.com/docs/php-filters/lzb-controls-categories/.
		$this->category = 'advanced';

		// Add/remove some options from control settings.
		// More options see in https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php .
		$this->restrictions = array(
			'default_settings' => false,
		);

		// Optional additional attributes, that will be saved in control data.
		$this->attributes = array(
			'taxonomy'               => 'category',
			'taxonomy_appearance'    => '',
			'taxonomy_output_format' => '',
			'multiple'               => 'false',
		);

		// Filters.
		add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );

		parent::__construct();
	}

	/**
	 * Register control assets.
	 */
	public function register_assets() {
		Lazy_Blocks_Pro_Assets::register_script( 'lzb-pro-control-taxonomy', 'build/control-taxonomy' );
		Lazy_Blocks_Pro_Assets::register_style( 'lzb-pro-control-taxonomy', 'build/control-taxonomy' );
		wp_style_add_data( 'lzb-pro-control-taxonomy', 'rtl', 'replace' );
	}

	/**
	 * Enqueue control scripts.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lzb-pro-control-taxonomy' );
	}

	/**
	 * Enqueue control style.
	 *
	 * @return array style dependencies.
	 */
	public function get_style_depends() {
		return array( 'lzb-pro-control-taxonomy' );
	}

	/**
	 * Get terms array.
	 *
	 * @param string       $taxonomy taxonomy name.
	 * @param string|array $slug_or_id slug or ID.
	 *
	 * @return array
	 */
	public function get_terms( $taxonomy, $slug_or_id ) {
		$is_slug = false;

		if ( is_string( $slug_or_id ) ) {
			$is_slug = (string) (int) $slug_or_id !== $slug_or_id;
		} elseif ( is_array( $slug_or_id ) ) {
			$is_slug = (string) (int) $slug_or_id[0] !== $slug_or_id[0];
		}

		$args = array(
			'taxonomy' => $taxonomy,
		);

		$args[ $is_slug ? 'slug' : 'include' ] = $slug_or_id;

		$args = wp_parse_args(
			$args,
			array(
				'taxonomy'               => null,
				'include'                => null,
				'hide_empty'             => false,
				'update_term_meta_cache' => false,
			)
		);

		return get_terms( $args );
	}

	/**
	 * Filter block attribute.
	 *
	 * @param array $attribute_data - attribute data.
	 * @param array $control - control data.
	 *
	 * @return array filtered attribute data.
	 */
	public function filter_lzb_prepare_block_attribute( $attribute_data, $control ) {
		if (
			! $control ||
			! isset( $control['type'] ) ||
			$this->name !== $control['type'] ||
			! isset( $control['multiple'] )
		) {
			return $attribute_data;
		}

		if ( 'true' === $control['multiple'] ) {
			$attribute_data['type']    = 'array';
			$attribute_data['items']   = array( 'type' => 'string' );
			$attribute_data['default'] = array();
		}

		return $attribute_data;
	}

	/**
	 * Change control output to array.
	 *
	 * @param mixed  $result - control value.
	 * @param array  $control_data - control data.
	 * @param array  $block_data - block data.
	 * @param string $context - block render context.
	 *
	 * @return string|array filtered control value.
	 */
	// phpcs:ignore
	public function filter_control_value( $result, $control_data, $block_data, $context ) {
		if ( ! isset( $control_data['taxonomy_output_format'] ) || ! $control_data['taxonomy_output_format'] || 'object' !== $control_data['taxonomy_output_format'] || ( ! is_string( $result ) && ! is_array( $result ) ) ) {
			return $result;
		}

		$result = $this->get_terms( $control_data['taxonomy'], $result );

		if ( is_array( $result ) && 'false' === $control_data['multiple'] ) {
			$result = $result[0];
		}

		return $result;
	}
}

// Init.
new Lazy_Blocks_Pro_Control_Taxonomy();
