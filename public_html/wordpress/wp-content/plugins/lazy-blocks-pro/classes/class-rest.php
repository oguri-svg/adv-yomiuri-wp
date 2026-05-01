<?php
/**
 * Rest API functions
 *
 * @package Lazy Blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class LazyBlocksPro_Rest
 */
class LazyBlocksPro_Rest extends WP_REST_Controller {
	/**
	 * Namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'lazy-blocks-pro/v';

	/**
	 * Version.
	 *
	 * @var string
	 */
	protected $version = '1';

	/**
	 * LazyBlocksPro_Rest constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register rest routes.
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		// Update Lazy Block Data.
		register_rest_route(
			$namespace,
			'/update-collections/',
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_collections' ),
				'permission_callback' => array( $this, 'update_collections_permission' ),
			)
		);
	}

	/**
	 * Update collections permissions.
	 *
	 * @return WP_REST_Response|true
	 */
	public function update_collections_permission() {
		if ( current_user_can( 'edit_posts' ) ) {
			return true;
		}

		return $this->error( 'not_allowed', esc_html__( 'Sorry, you are not allowed to update block collections.', 'lazy-blocks' ), true );
	}

	/**
	 * Update collections.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 *
	 * @return WP_REST_Response
	 */
	public function update_collections( $request ) {
		$collections = isset( $request['collections'] ) ? $request['collections'] : false;

		if ( is_array( $collections ) ) {
			update_option( 'lazy_blocks_pro_block_collections', $collections );
		}

		return $this->success( esc_html__( 'Block data updated successfully.', 'lazy-blocks' ) );
	}

	/**
	 * Success rest.
	 *
	 * @param mixed $response response data.
	 *
	 * @return WP_REST_Response
	 */
	public function success( $response ) {
		return new WP_REST_Response(
			array(
				'success'  => true,
				'response' => $response,
			),
			200
		);
	}

	/**
	 * Error rest.
	 *
	 * @param mixed   $code       error code.
	 * @param mixed   $response   response data.
	 * @param boolean $true_error use true error response to stop the code processing.
	 * @return mixed
	 */
	public function error( $code, $response, $true_error = false ) {
		if ( $true_error ) {
			return new WP_Error( $code, $response, array( 'status' => 401 ) );
		}

		return new WP_REST_Response(
			array(
				'error'      => true,
				'success'    => false,
				'error_code' => $code,
				'message'    => $response,
			),
			401
		);
	}
}
new LazyBlocksPro_Rest();
