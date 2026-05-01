<?php
/**
 * Plugin Name:       Lazy Blocks Pro
 * Description:       Easily create custom blocks and custom meta fields for Gutenberg without hard coding.
 * Version:           4.1.0
 * Requires at least: 6.2
 * Requires PHP:      8.0
 * Author:            Lazy Blocks Team
 * Author URI:        https://lazyblocks.com/?utm_source=plugin_pro&utm_medium=readme&utm_campaign=byline
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       lazy-blocks
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'LAZY_BLOCKS_PRO' ) ) {
	define( 'LAZY_BLOCKS_PRO', true );
}

// Include core plugin.
require_once plugin_dir_path( __FILE__ ) . 'core-plugin/lazy-blocks.php';

/**
 * Class Lazy_Blocks_Pro
 */
class Lazy_Blocks_Pro {
	/**
	 * The single class instance.
	 *
	 * @var $instance
	 */
	private static $instance = null;

	/**
	 * Main Instance
	 * Ensures only one instance of this class exists in memory at any one time.
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
			self::$instance->init_options();
		}
		return self::$instance;
	}

	/**
	 * Plugin Name in EDD
	 *
	 * @var $plugin_name
	 */
	public $plugin_name = 'Lazy Blocks Pro';

	/**
	 * Path to the plugin main php file.
	 *
	 * @var $plugin_file_path
	 */
	public $plugin_file_path;

	/**
	 * Path to the plugin directory
	 *
	 * @var $plugin_path
	 */
	public $plugin_path;

	/**
	 * URL to the plugin directory
	 *
	 * @var $plugin_url
	 */
	public $plugin_url;

	/**
	 * Lazy_Blocks constructor.
	 */
	public function __construct() {
		/* We do nothing here! */
	}

	/**
	 * Activation Hook
	 */
	public function activation_hook() {
		// We should run the core plugin activation hook manually once Pro is activated.
		lazyblocks()->activation_hook();
	}

	/**
	 * Deactivation Hook
	 */
	public function deactivation_hook() {
		// We should run the core plugin deactivation hook manually once Pro is activated.
		lazyblocks()->deactivation_hook();
	}

	/**
	 * Get plugin_path.
	 */
	public function plugin_path() {
		return apply_filters( 'lzb_pro/plugin_path', $this->plugin_path );
	}

	/**
	 * Get plugin_url.
	 */
	public function plugin_url() {
		return apply_filters( 'lzb_pro/plugin_url', $this->plugin_url );
	}

	/**
	 * Init options
	 */
	public function init_options() {
		$this->plugin_file_path = __FILE__;
		$this->plugin_path      = plugin_dir_path( __FILE__ );
		$this->plugin_url       = plugin_dir_url( __FILE__ );

		// include classes.
		require_once $this->plugin_path() . '/classes/class-assets.php';

		require_once $this->plugin_path() . 'classes/class-updater.php';
		require_once $this->plugin_path() . 'classes/class-migration.php';
		require_once $this->plugin_path() . 'classes/class-rest.php';

		require_once $this->plugin_path() . 'classes/class-blocks-custom-slug-namespace.php';
		require_once $this->plugin_path() . 'classes/class-blocks-preload.php';
		require_once $this->plugin_path() . 'classes/class-conditional-logic.php';
		require_once $this->plugin_path() . 'classes/class-block-styles-scripts.php';
		require_once $this->plugin_path() . 'classes/3rd/class-seo-plugins.php';
		require_once $this->plugin_path() . 'classes/class-relationships.php';

		add_action( 'lzb/init', array( $this, 'init_hook' ), 6 );
	}

	/**
	 * Register the text domain and add custom controls to extend the basic plugin functionality.
	 */
	public function init_hook() {
		$this->load_text_domain();

		$this->include_control_dependencies();
	}

	/**
	 * Sets the text domain with the plugin translated into other languages.
	 */
	public function load_text_domain() {
		// load textdomain.
		load_plugin_textdomain( 'lazy-blocks', false, basename( __DIR__ ) . '/languages' );
	}

	/**
	 * Set control Dependencies.
	 * Include these dependencies in the init hook
	 * Because the control class comes from the LazyBlocks_Controls class's include_controls method.
	 * Including dependencies without init will cause an error during inheritance since the control class won't exist yet.
	 */
	public function include_control_dependencies() {
		require_once $this->plugin_path() . 'classes/class-control-panel.php';
		require_once $this->plugin_path() . 'classes/class-control-divider.php';
		require_once $this->plugin_path() . 'classes/class-control-message.php';
		require_once $this->plugin_path() . 'classes/class-control-posts.php';
		require_once $this->plugin_path() . 'classes/class-control-taxonomy.php';
		require_once $this->plugin_path() . 'classes/class-control-users.php';
		require_once $this->plugin_path() . 'classes/class-control-units.php';
		require_once $this->plugin_path() . 'classes/class-extend-control-code-editor.php';
		require_once $this->plugin_path() . 'classes/class-extend-control-url.php';
	}
}

/**
 * Function works with the Lazy_Blocks_Pro class instance
 *
 * @return object Lazy_Blocks_Pro
 */
function lazy_blocks_pro() {
	return Lazy_Blocks_Pro::instance();
}

// Initialize.
lazy_blocks_pro();

// Activation / Deactivation hooks.
register_activation_hook( __FILE__, array( lazy_blocks_pro(), 'activation_hook' ) );
register_deactivation_hook( __FILE__, array( lazy_blocks_pro(), 'deactivation_hook' ) );
