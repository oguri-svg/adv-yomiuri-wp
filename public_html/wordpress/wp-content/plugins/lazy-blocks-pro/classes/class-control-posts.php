<?php
/**
 * Control Posts
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Control_Posts class.
 *
 * LazyBlocks_Control - https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php
 */
class Lazy_Blocks_Pro_Control_Posts extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Control unique name.
		$this->name = 'posts';

		// Control icon SVG.
		// You may use these icons https://material.io/resources/icons/?icon=accessibility&style=outline .
		$this->icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 3.5H16C16.2761 3.5 16.5 3.72386 16.5 4V16C16.5 16.2761 16.2761 16.5 16 16.5H6C5.72386 16.5 5.5 16.2761 5.5 16V4C5.5 3.72386 5.72386 3.5 6 3.5ZM16 2H6C4.89543 2 4 2.89543 4 4V16C4 17.1046 4.89543 18 6 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2ZM15 5.75H7V7.25H15V5.75ZM7 9H15V10.5H7V9ZM13 12.25H7V13.75H13V12.25Z" fill="currentColor"/><path d="M21 6V19C21 20.1046 20.1066 21 19.0021 21C16.3813 21 11.6836 21 8 21" stroke="currentColor" stroke-width="1.5"/></svg>';

		// Control value type [string, number, boolean, array].
		$this->type = 'string';

		// Control label.
		$this->label = __( 'Posts', 'lazy-blocks' );

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
			'posts_post_type'     => array(),
			'posts_post_status'   => array(),
			'posts_taxonomy'      => array(),
			'posts_output_format' => '',
			'multiple'            => 'false',
		);

		// Filters.
		add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );

		// Actions.
		add_action( 'wp_ajax_lzb_pro_control_posts_get_posts', array( $this, 'ajax_get_posts' ) );

		parent::__construct();
	}

	/**
	 * Register control assets.
	 */
	public function register_assets() {
		Lazy_Blocks_Pro_Assets::register_script( 'lzb-pro-control-posts', 'build/control-posts' );
		wp_localize_script(
			'lzb-pro-control-posts',
			'LZBProControlPosts',
			array(
				'nonce' => wp_create_nonce( 'lzb-pro-control-posts' ),
			)
		);
	}

	/**
	 * Enqueue control scripts.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lzb-pro-control-posts' );
	}

	/**
	 * Get posts array.
	 *
	 * @param array $args The query args.
	 *
	 * @return array
	 */
	public function get_posts( $args = array() ) {
		// Vars.
		$posts = array();

		if ( ! isset( $args['post__in'] ) || empty( $args['post__in'] ) ) {
			return $posts;
		}

		// Apply default args.
		$args = wp_parse_args(
			$args,
			array(
				'posts_per_page'         => -1,
				'post_type'              => 'any',
				'post_status'            => 'any',
				'orderby'                => 'post__in',
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		$is_single = is_string( $args['post__in'] );

		// Fix post string to array.
		if ( $is_single ) {
			$args['post__in'] = array( $args['post__in'] );
		}

		// Query posts.
		$posts = get_posts( $args );

		// Remove any potential empty results.
		$posts = array_filter( $posts );

		// Return single object.
		if ( $is_single && ! empty( $posts ) ) {
			$posts = $posts[0];
		}

		// Return posts.
		return $posts;
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
		if ( ! isset( $control_data['posts_output_format'] ) || ! $control_data['posts_output_format'] || 'object' !== $control_data['posts_output_format'] || ( ! is_string( $result ) && ! is_array( $result ) ) ) {
			return $result;
		}

		$result = $this->get_posts(
			array(
				'post__in' => $result,
			)
		);

		if ( is_array( $result ) && 'false' === $control_data['multiple'] ) {
			$result = $result[0];
		}

		return $result;
	}

	/**
	 * Register control assets.
	 */
	public function ajax_get_posts() {
		check_ajax_referer( 'lzb-pro-control-posts', 'nonce' );

		$result = array();
		$attrs  = array(
			'post_type'   => 'any',
			'numberposts' => 100,
		);

		if ( isset( $_POST['search'] ) ) {
			// phpcs:ignore
			$attrs['s'] = $_POST['search'];
		}
		if ( isset( $_POST['post_ids'] ) ) {
			// phpcs:ignore
			$attrs['post__in'] = $_POST['post_ids'];
		}
		if ( isset( $_POST['post_type'] ) ) {
			// phpcs:ignore
			$attrs['post_type'] = $_POST['post_type'];
		}
		if ( isset( $_POST['post_status'] ) ) {
			// phpcs:ignore
			$attrs['post_status'] = $_POST['post_status'];
		}
		if ( isset( $_POST['taxonomy'] ) && is_array( $_POST['taxonomy'] ) ) {
			// phpcs:ignore
			$attrs['tax_query'] = array(
				'relation' => 'OR',
			);

			// phpcs:ignore
			foreach ( $_POST['taxonomy'] as $taxonomy ) {
				$taxonomy             = explode( ':', $taxonomy );
				$attrs['tax_query'][] = array(
					'taxonomy' => $taxonomy[0],
					'field'    => 'slug',
					'terms'    => $taxonomy[1],
				);
			}
		}

		$find_query = new WP_Query( $attrs );

		if ( $find_query->have_posts() ) {
			while ( $find_query->have_posts() ) {
				$find_query->the_post();
				$result[] = array(
					'label'     => get_the_title() ? get_the_title() : esc_attr__( '(no title)', 'lazy-blocks' ),
					'value'     => (string) get_the_ID(),
					'thumbnail' => get_the_post_thumbnail_url( null, 'thumbnail' ),
					'post_type' => get_post_type( get_the_ID() ),
				);
			}
			$find_query->reset_postdata();
		}

		// phpcs:ignore
		echo json_encode(
			array(
				'response' => $result,
				'success'  => true,
			)
		);

		wp_die();
	}
}

// Init.
new Lazy_Blocks_Pro_Control_Posts();
