<?php
/**
 * Migrations
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Lazy_Blocks_Pro_Migrations
 */
class Lazy_Blocks_Pro_Migrations {
	/**
	 * Initial version.
	 *
	 * @var string
	 */
	protected $initial_version = '1.0.0';

	/**
	 * Lazy_Blocks_Pro_Migrations constructor.
	 */
	public function __construct() {
		if ( is_admin() ) {
			add_action( 'admin_init', array( $this, 'init' ), 3 );
		} else {
			add_action( 'wp', array( $this, 'init' ), 3 );
		}
	}

	/**
	 * Init.
	 */
	public function init() {
		// Migration code added after `$this->initial_version` plugin version.
		$saved_version   = get_option( 'lzb_pro_db_version', $this->initial_version );
		$current_version = LAZY_BLOCKS_VERSION;

		foreach ( $this->get_migrations() as $migration ) {
			if ( version_compare( $saved_version, $migration['version'], '<' ) ) {
				call_user_func( $migration['cb'] );
			}
		}

		if ( version_compare( $saved_version, $current_version, '<' ) ) {
			update_option( 'lzb_pro_db_version', $current_version );
		}
	}

	/**
	 * Get all available migrations.
	 *
	 * @return array
	 */
	public function get_migrations() {
		return array(
			array(
				'version' => '1.0.1',
				'cb'      => array( $this, 'v_1_0_1' ),
			),
		);
	}

	/**
	 * 1.0.1 migration example.
	 */
	public function v_1_0_1() {
		// Nothing.
	}
}

new Lazy_Blocks_Pro_Migrations();
