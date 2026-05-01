<?php
/**
 * Control Users
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Control_Users class.
 *
 * LazyBlocks_Control - https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php
 */
class Lazy_Blocks_Pro_Control_Users extends LazyBlocks_Control {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Control unique name.
		$this->name = 'users';

		// Control icon SVG.
		// You may use these icons https://material.io/resources/icons/?icon=accessibility&style=outline .
		$this->icon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="10" r="2.25" stroke="currentColor" stroke-width="1.5"/><path d="M6 18C7.57183 15.9042 9.38028 15 12 15C14.6197 15 16.4282 15.9042 18 18" stroke="currentColor" stroke-width="1.5"/></svg>';

		// Control value type [string, number, boolean, array].
		$this->type = 'string';

		// Control label.
		$this->label = __( 'Users', 'lazy-blocks' );

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
			'users_role'          => array(),
			'users_output_format' => '',
			'multiple'            => 'false',
		);

		// Filters.
		add_filter( 'lzb/prepare_block_attribute', array( $this, 'filter_lzb_prepare_block_attribute' ), 10, 2 );

		// Actions.
		add_action( 'wp_ajax_lzb_pro_control_users_get_users', array( $this, 'ajax_get_users' ) );
		add_action( 'wp_ajax_lzb_pro_control_users_get_roles', array( $this, 'ajax_get_roles' ) );

		parent::__construct();
	}

	/**
	 * Register control assets.
	 */
	public function register_assets() {
		Lazy_Blocks_Pro_Assets::register_script( 'lzb-pro-control-users', 'build/control-users' );
		wp_localize_script(
			'lzb-pro-control-users',
			'LZBProControlUsers',
			array(
				'nonce' => wp_create_nonce( 'lzb-pro-control-users' ),
			)
		);
	}

	/**
	 * Enqueue control scripts.
	 *
	 * @return array script dependencies.
	 */
	public function get_script_depends() {
		return array( 'lzb-pro-control-users' );
	}

	/**
	 * Get users array.
	 *
	 * @param array $args The query args.
	 *
	 * @return array
	 */
	public function get_users( $args = array() ) {
		// Vars.
		$users = array();

		// Fix user id string to array.
		if ( isset( $args['include'] ) && is_string( $args['include'] ) ) {
			$args['include'] = array( $args['include'] );
		}

		// Query users.
		$users = get_users( $args );

		// Remove any potential empty results.
		$users = array_filter( $users );

		$result = array();

		foreach ( $users as $user ) {
			$user_object = new stdClass();

			$user_object->ID               = (string) $user->ID;
			$user_object->user_firstname   = $user->user_firstname;
			$user_object->user_lastname    = $user->user_lastname;
			$user_object->nickname         = $user->nickname;
			$user_object->user_nicename    = $user->user_nicename;
			$user_object->display_name     = $user->display_name;
			$user_object->user_email       = $user->user_email;
			$user_object->user_url         = $user->user_url;
			$user_object->user_registered  = $user->user_registered;
			$user_object->user_description = $user->user_description;
			$user_object->user_avatar      = get_avatar( $user->ID );

			$result[] = $user_object;
		}

		// Return users.
		return $result;
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
		if ( ! isset( $control_data['users_output_format'] ) || ! $control_data['users_output_format'] || 'object' !== $control_data['users_output_format'] || empty( $result ) || ( ! is_string( $result ) && ! is_array( $result ) ) ) {
			return $result;
		}

		$result = $this->get_users(
			array(
				'include' => $result,
			)
		);

		if ( is_array( $result ) && 'false' === $control_data['multiple'] ) {
			$result = $result[0];
		}

		return $result;
	}

	/**
	 * AJAX get registered user roles.
	 */
	public function ajax_get_roles() {
		check_ajax_referer( 'lzb-pro-control-users', 'nonce' );

		$result         = array();
		$editable_roles = array_reverse( get_editable_roles() );

		foreach ( $editable_roles as $role => $details ) {
			$name     = translate_user_role( $details['name'] );
			$result[] = array(
				'label' => $name,
				'value' => esc_attr( $role ),
			);
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

	/**
	 * AJAX find users.
	 */
	public function ajax_get_users() {
		check_ajax_referer( 'lzb-pro-control-users', 'nonce' );

		$args = array();

		// phpcs:ignore
		if ( isset( $_POST['search'] ) && $_POST['search'] ) {
			// phpcs:ignore
			$args['search'] = '*' . esc_attr( $_POST['search'] ) . '*';
		}
		// phpcs:ignore
		if ( isset( $_POST['include'] ) && $_POST['include'] ) {
			// phpcs:ignore
			$args['include'] = $_POST['include'];
		}
		// phpcs:ignore
		if ( isset( $_POST['role'] ) && $_POST['role'] ) {
			// phpcs:ignore
			$args['role__in'] = $_POST['role'];
		}

		$users = $this->get_users( $args );

		// phpcs:ignore
		echo json_encode(
			array(
				'response' => $users,
				'success'  => true,
			)
		);

		wp_die();
	}
}

// Init.
new Lazy_Blocks_Pro_Control_Users();
