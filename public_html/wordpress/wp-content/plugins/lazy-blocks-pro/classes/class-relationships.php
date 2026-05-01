<?php
/**
 * Lazy Blocks relationships.
 *
 * @package lazyblocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Relationships class. Class to work with LazyBlocks Relationships.
 */
class Lazy_Blocks_Pro_Relationships {
	/**
	 * Register block context.
	 *
	 * @var array
	 */
	private $register_block_relationships = array();

	/**
	 * Cached third-party uses context.
	 *
	 * @var array|null
	 */
	private $third_party_uses_context = null;

	/**
	 * Lazy_Blocks_Pro_Relationships constructor.
	 */
	public function __construct() {
		$this->init_hooks();
	}

	/**
	 * Initialize WordPress hooks.
	 */
	private function init_hooks() {
		// Clear blocks cache when context relationships change.
		add_action( 'updated_post_meta', array( $this, 'clear_blocks_cache' ), 10, 3 );

		add_action( 'init', array( $this, 'cache_block_relationships' ), 18 );

		add_filter( 'lzb/block_data', array( $this, 'add_relationships_to_block_data' ), 12, 2 );

		add_filter( 'lzb/register_block_type_data', array( $this, 'register_block_type_data' ), 10, 2 );

		add_filter( 'lzb/register_blocks', array( $this, 'register_blocks' ) );

		add_filter( 'lzb/block_defaults', array( $this, 'register_block_relationships_options' ), 10, 2 );

		add_filter( 'get_block_type_uses_context', array( $this, 'register_uses_context_to_3rd_blocks' ), 12, 2 );

		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
	}

	/**
	 * Get or build third-party uses context cache.
	 *
	 * @return array
	 */
	private function get_third_party_uses_context() {
		if ( null !== $this->third_party_uses_context ) {
			return $this->third_party_uses_context;
		}

		// Get all blocks to calculate uses context for 3rd party blocks.
		$blocks                         = lazyblocks()->blocks()->get_blocks();
		$this->third_party_uses_context = array();

		// Get all registered block types.
		$block_types = WP_Block_Type_Registry::get_instance()->get_all_registered();

		foreach ( $block_types as $block_name => $block_type ) {
			// Extract all slugs from blocks array and check if current block type exists.
			$block_slugs = array_column( $blocks, 'slug' );

			if ( ! in_array( $block_name, $block_slugs, true ) ) {
				$lzb_uses_context = $this->get_uses_context( $block_name );

				if ( ! empty( $lzb_uses_context ) ) {
					$this->third_party_uses_context[ $block_name ] = $lzb_uses_context;
				}
			}
		}

		return $this->third_party_uses_context;
	}

	/**
	 * Register uses context for third-party blocks.
	 *
	 * Hooked to 'get_block_type_uses_context' filter. Adds LazyBlocks context
	 * to third-party blocks that are configured to receive it.
	 *
	 * @param array         $uses_context The existing uses_context array.
	 * @param WP_Block_Type $block_type   The block type being registered.
	 * @return array        Modified uses_context array with LazyBlocks context added.
	 */
	public function register_uses_context_to_3rd_blocks( $uses_context, $block_type ) {
		$third_party_uses_context = $this->get_third_party_uses_context();

		if ( isset( $third_party_uses_context[ $block_type->name ] ) ) {
			$uses_context = array_unique(
				array_merge(
					$third_party_uses_context[ $block_type->name ],
					$uses_context
				)
			);
		}

		return $uses_context;
	}

	/**
	 * Adds relationship configuration to block data.
	 *
	 * This method injects relationship-related meta values into the block data array,
	 * including context provision settings, custom context slugs, allowed blocks, and
	 * ancestor relationships. This configuration is used during block registration to
	 * establish various relationships between blocks.
	 *
	 * @param array    $block_data      The block data array being processed.
	 * @param callable $get_meta_value  Function to retrieve meta values for the block.
	 *
	 * @return array The modified block data array with relationship configuration added.
	 */
	public function add_relationships_to_block_data( $block_data, $get_meta_value ) {
		if ( isset( $block_data['id'] ) ) {
			$block_data = array_merge(
				$block_data,
				array(
					'provide_context_to_blocks' => $get_meta_value( 'lazyblocks_provide_context_to_blocks' ),
					'custom_context_slug'       => $get_meta_value( 'lazyblocks_custom_context_slug' ),
					'allowed_blocks'            => $get_meta_value( 'lazyblocks_allowed_blocks' ),
					'ancestor'                  => $get_meta_value( 'lazyblocks_ancestor' ),
				)
			);
		}
		return $block_data;
	}

	/**
	 * Get context slug from custom control if not empty.
	 * Or just getting block slug as context slug if custom not set.
	 *
	 * @param string $slug The full block slug.
	 * @param string $custom_context_slug The custom context slug.
	 * @return string The context slug.
	 */
	private function get_context_slug( $slug, $custom_context_slug = null ) {
		if ( ! empty( $custom_context_slug ) ) {
			return $custom_context_slug;
		}
		return $slug;
	}

	/**
	 * Adds relationship-related keys to the block defaults array.
	 *
	 * This ensures that when a new Lazy Block is created, it has default, empty values
	 * for the post meta fields that store various block relationship configurations,
	 * including context provision, custom context slugs, allowed blocks, and ancestors.
	 *
	 * @param array $block_defaults The default attributes and settings for a Lazy Block.
	 * @return array The modified block defaults array.
	 */
	public function register_block_relationships_options( $block_defaults ) {
		$block_defaults['lazyblocks_provide_context_to_blocks'] = '';
		$block_defaults['lazyblocks_custom_context_slug']       = '';
		$block_defaults['lazyblocks_allowed_blocks']            = '';
		$block_defaults['lazyblocks_ancestor']                  = '';
		return $block_defaults;
	}

	/**
	 * Augments registered block data with relationship configuration arrays.
	 *
	 * This function hooks into the list of blocks right before they are registered. It iterates
	 * through each block and attaches the pre-calculated relationship data that was generated by
	 * `cache_block_relationships()`. This includes context provision/usage, allowed child blocks,
	 * and ancestor relationships, making all relationship configurations available to the block
	 * editor and other parts of WordPress.
	 *
	 * @param array $blocks An array of all Lazy Blocks being registered.
	 * @return array The modified array of blocks with relationship data included.
	 */
	public function register_blocks( $blocks ) {
		foreach ( $blocks as $key => $block ) {
			if ( isset( $this->register_block_relationships[ $block['id'] ] ) ) {
				$relationships_data = $this->register_block_relationships[ $block['id'] ];

				// Always add provides_context and uses_context.
				$blocks[ $key ]['provides_context'] = $relationships_data['provides'];
				$blocks[ $key ]['uses_context']     = $relationships_data['uses'];

				if ( isset( $relationships_data['allowed_blocks'] ) ) {
					$blocks[ $key ]['allowed_blocks'] = $relationships_data['allowed_blocks'];
				}

				if ( isset( $relationships_data['ancestor'] ) ) {
					$blocks[ $key ]['ancestor'] = $relationships_data['ancestor'];
				}
			}
		}
		return $blocks;
	}

	/**
	 * Enqueue editor assets.
	 */
	public function enqueue_editor_assets() {
		Lazy_Blocks_Pro_Assets::enqueue_script( 'lzb-pro-context', 'build/relationships' );

		$third_party_uses_context = $this->get_third_party_uses_context();

		// Pass the uses context data to JavaScript.
		wp_localize_script(
			'lzb-pro-context',
			'lzbThirdPartyUsesContext',
			$third_party_uses_context
		);
	}

	/**
	 * Pre-calculates and caches relationship configuration for all registered Lazy Blocks.
	 *
	 * Fired on the 'init' action, this method iterates through every block and determines
	 * its relationship configuration including context provision/usage, ancestor requirements,
	 * and allowed child blocks. This data is cached in the instance property to prevent
	 * re-calculating relationships on every block render.
	 */
	public function cache_block_relationships() {
		$blocks = lazyblocks()->blocks()->get_blocks();
		foreach ( $blocks as $block ) {
			if ( ! empty( $block['id'] ) ) {
				$relationship_data = array_merge(
					$this->get_context_configuration( $block ),
					array(
						'ancestor'       => isset( $block['ancestor'] ) ? $block['ancestor'] : array(),
						'allowed_blocks' => isset( $block['allowed_blocks'] ) ? $block['allowed_blocks'] : array(),
					)
				);

				// CRITICAL: Remove empty arrays to allow unrestricted placement.
				if ( empty( $relationship_data['allowed_blocks'] ) ) {
					unset( $relationship_data['allowed_blocks'] );
				}

				if ( empty( $relationship_data['ancestor'] ) ) {
					unset( $relationship_data['ancestor'] );
				}

				$this->register_block_relationships[ $block['id'] ] = $relationship_data;
			}
		}
	}

	/**
	 * Modifies the block type registration data to add relationship support.
	 *
	 * This function filters the data passed to `register_block_type()`. It adds relationship
	 * configuration including context provision/usage, ancestor requirements, and allowed
	 * child blocks. Additionally, it overrides the 'render_callback' to wrap the original
	 * Lazy Blocks callback, injecting the block's context data supplied by the Gutenberg editor.
	 *
	 * @param array $data The original block type registration data.
	 * @param array $block The Lazy Block data array.
	 * @return array The modified block type registration data with relationship support.
	 */
	public function register_block_type_data( $data, $block ) {
		// Get context configuration.
		if ( isset( $this->register_block_relationships[ $block['id'] ] ) ) {
			$relationships_configuration = $this->register_block_relationships[ $block['id'] ];
		}

		$data = array_merge(
			$data,
			array(
				'provides_context' => $relationships_configuration['provides'] ?? array(),
				'uses_context'     => $relationships_configuration['uses'] ?? array(),
				'ancestor'         => $relationships_configuration['ancestor'] ?? array(),
				'allowed_blocks'   => $relationships_configuration['allowed_blocks'] ?? array(),
				'render_callback'  => function ( $render_attributes, $render_content = null, $block_instance = null ) use ( $block ) {
					// Modified render callback to include block context.
					$render_location = is_admin() ? 'editor' : 'frontend';
					$context         = null;

					if ( $block_instance && isset( $block_instance->context ) ) {
						$context = $block_instance->context;
					}

					return lazyblocks()->blocks()->render_callback( $render_attributes, $context, $render_content, $render_location, $block );
				},
			)
		);

		// CRITICAL: Remove empty arrays to avoid blocking child placement.
		if ( empty( $data['allowed_blocks'] ) ) {
			unset( $data['allowed_blocks'] );
		}

		if ( empty( $data['ancestor'] ) ) {
			unset( $data['ancestor'] );
		}

		return $data;
	}

	/**
	 * Get provides context configuration for a block.
	 * This is used during block registration to declare what context a block provides.
	 *
	 * @param array $block_data Block data.
	 * @return array
	 */
	public function get_provides_context( $block_data ) {
		$provides_context = array();

		if ( empty( $block_data['id'] ) ) {
			return $provides_context;
		}

		$provide_context_to_blocks = $block_data['provide_context_to_blocks'] ?? null;

		// Only proceed if the block is configured to provide context to at least one other block.
		if ( ! empty( $provide_context_to_blocks ) ) {
			$custom_context_slug = $block_data['custom_context_slug'] ?? null;
			$context_slug        = $this->get_context_slug( $block_data['slug'], $custom_context_slug );

			// Provide all of the block's controls as context.
			if ( ! empty( $block_data['controls'] ) ) {
				foreach ( $block_data['controls'] as $control ) {
					if ( ! empty( $control['name'] ) ) {
						$context_key                      = $context_slug . '/' . $control['name'];
						$provides_context[ $context_key ] = $control['name'];
					}
				}
			}

			// Also provide standard block data attributes as context.
			$provides_context[ $context_slug . '/blockId' ]   = 'blockId';
			$provides_context[ $context_slug . '/className' ] = 'className';
			$provides_context[ $context_slug . '/anchor' ]    = 'anchor';
		}

		return $provides_context;
	}

	/**
	 * Get uses context configuration for a block during registration.
	 * This works by scanning all other blocks to see if any of them provide context TO this block.
	 *
	 * @param array|string $block Current block data (array for LazyBlocks) or block name (string for 3rd party blocks).
	 * @return array
	 */
	public function get_uses_context( $block ) {
		$uses_context = array();
		$block_data   = null;

		// Handle different input types.
		if ( is_string( $block ) ) {
			// 3rd party block - just a block name/slug
			$block_data = array(
				'id'   => null,
				'slug' => $block,
			);
		}

		if ( is_array( $block ) ) {
			// LazyBlock or structured data.
			$block_data = array(
				'id'   => $block['id'] ?? null,
				'slug' => $block['slug'] ?? null,
			);
		}

		// Process only if we have valid block data and slug.
		if ( $block_data && ! empty( $block_data['slug'] ) ) {
			$all_blocks = lazyblocks()->blocks()->get_blocks();

			// Filter out the current block and blocks without required data.
			$potential_providers = array_filter(
				$all_blocks,
				function ( $b ) use ( $block_data ) {
					// Skip if provider doesn't have required data.
					if ( empty( $b['id'] ) || empty( $b['slug'] ) ) {
						return false;
					}

					// Skip self (for LazyBlocks with ID).
					if ( $block_data['id'] && $b['id'] === $block_data['id'] ) {
						return false;
					}

					// Skip self (by slug comparison).
					if ( $b['slug'] === $block_data['slug'] ) {
						return false;
					}

					return true;
				}
			);

			foreach ( $potential_providers as $provider_block ) {
				if ( empty( $provider_block['id'] ) || empty( $provider_block['slug'] ) ) {
					continue;
				}

				// The meta value is an array of full slugs ('namespace/block-name').
				$provide_context_to = $provider_block['provide_context_to_blocks'] ?? array();

				if ( empty( $provide_context_to ) || ! is_array( $provide_context_to ) ) {
					continue;
				}

				// Check if the provider is configured to provide to the current block, using the full slug for accuracy.
				if ( in_array( $block_data['slug'], $provide_context_to, true ) ) {

					if ( ! empty( $provider_block['controls'] ) ) {
						$custom_context_slug = $provider_block['custom_context_slug'] ?? null;
						// Get the context slug.
						$context_slug = $this->get_context_slug( $provider_block['slug'], $custom_context_slug );

						// Add all attributes from the provider block to uses_context in 'block-name/control-name' format.
						foreach ( $provider_block['controls'] as $control ) {
							if ( ! empty( $control['name'] ) ) {
								$uses_context[] = $context_slug . '/' . $control['name'];
							}
						}

						// Add standard block data.
						$uses_context[] = $context_slug . '/blockId';
						$uses_context[] = $context_slug . '/className';
						$uses_context[] = $context_slug . '/anchor';
					}
				}
			}

			$uses_context = array_unique( $uses_context );
		}

		return $uses_context;
	}

	/**
	 * Get the complete context configuration for a block.
	 * This acts as a wrapper function, calling private methods to get the provides/uses configuration.
	 *
	 * @param array $block The block data array.
	 * @return array An array containing 'provides' and 'uses' context arrays.
	 */
	public function get_context_configuration( $block ) {
		return array(
			'provides' => $this->get_provides_context( $block ),
			'uses'     => $this->get_uses_context( $block ),
		);
	}

	/**
	 * Clear blocks cache when context relationships change.
	 * This ensures the new context configuration is picked up on the next load.
	 *
	 * @param int    $meta_id    ID of the metadata entry.
	 * @param int    $post_id    Post ID.
	 * @param string $meta_key   Meta key.
	 */
	public function clear_blocks_cache( $meta_id, $post_id, $meta_key ) {
		if ( 'lazyblocks_provide_context_to_blocks' === $meta_key && 'lazyblocks' === get_post_type( $post_id ) ) {
			// A context relationship was changed. Force a rebuild of the block cache.
			lazyblocks()->blocks()->get_blocks( false, true );

			// Clear the third-party uses context cache as well.
			$this->third_party_uses_context = null;
		}
	}
}

new Lazy_Blocks_Pro_Relationships();
