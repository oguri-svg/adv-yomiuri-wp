<?php
/**
 * Custom Slug Namespace
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Custom_Slug_Namespace class.
 */
class Lazy_Blocks_Pro_Custom_Slug_Namespace {
	/**
	 * Collections added using lazyblocks()->add_collection().
	 *
	 * @var array
	 */
	public $collections = array(
		array(
			'namespace' => 'lazyblock',
			'label'     => 'Lazy Blocks',
			'isDefault' => true,
		),
	);

	/**
	 * Constructor
	 */
	public function __construct() {
		// Filters.
		add_filter( 'lzb/block_data', array( $this, 'filter_block_data' ), 10, 2 );

		// Actions.
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_block_editor_assets' ) );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );

		add_action( 'lzb/add_collection', array( $this, 'add_collection' ) );
	}

	/**
	 * Add support for custom slug namespace.
	 *
	 * @param array  $block_data Block data.
	 * @param string $get_meta_value Get meta value function.
	 *
	 * @return array
	 */
	public function filter_block_data( $block_data, $get_meta_value ) {
		$slug = $get_meta_value( 'lazyblocks_slug' );

		if ( strpos( $slug, '/' ) !== false ) {
			$block_data['slug'] = $slug;
		}

		return $block_data;
	}

	/**
	 * Enqueue block editor assets.
	 */
	public function enqueue_block_editor_assets() {
		if ( ! is_admin() ) {
			return;
		}

		Lazy_Blocks_Pro_Assets::enqueue_script( 'lzb-pro-blocks-custom-slug-namespace', 'build/blocks-custom-slug-namespace' );
		wp_localize_script(
			'lzb-pro-blocks-custom-slug-namespace',
			'LZBProBlocksCustomSlugNamespace',
			array(
				'collections'       => $this->get_block_collections(),
				'collections_nonce' => wp_create_nonce( 'lzb-pro-collections' ),
			)
		);
	}

	/**
	 * Enqueue block assets.
	 */
	public function enqueue_block_assets() {
		if ( ! is_admin() ) {
			return;
		}

		Lazy_Blocks_Pro_Assets::enqueue_style( 'lzb-pro-blocks-custom-slug-namespace', 'build/blocks-custom-slug-namespace' );
		wp_style_add_data( 'lzb-pro-blocks-custom-slug-namespace', 'rtl', 'replace' );
	}

	/**
	 * Get block collections.
	 */
	public function get_block_collections() {
		$process_collection = function ( $collection, &$all_collections, $is_editable = false ) {
			$existing_namespaces = array_column( $all_collections, 'namespace' );

			if ( ! in_array( $collection['namespace'], $existing_namespaces, true ) ) {
				$all_collections[] = array(
					'namespace'  => $collection['namespace'],
					'label'      => $collection['label'],
					'register'   => $collection['register'] ?? false,
					'isDefault'  => $collection['isDefault'] ?? false,
					'isEditable' => $is_editable,
				);
			}
		};

		// Process default collections first.
		$collections = array();
		foreach ( $this->collections as $collection ) {
			$process_collection( $collection, $collections );
		}

		// Add saved collections only if namespace doesn't exist in defaults.
		$saved_collections = get_option( 'lazy_blocks_pro_block_collections', array() );
		foreach ( $saved_collections as $collection ) {
			$process_collection( $collection, $collections, true );
		}

		return $collections;
	}

	/**
	 * Add collection.
	 *
	 * @param array $data Collection data.
	 */
	public function add_collection( $data ) {
		$this->collections[] = $data;
	}
}

// Init.
new Lazy_Blocks_Pro_Custom_Slug_Namespace();
