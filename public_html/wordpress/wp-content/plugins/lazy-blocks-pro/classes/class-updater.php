<?php
/**
 * Updater class
 *
 * @package Lazy Blocks Pro
 */

/**
 * Lazy_Blocks_Pro_Updater Class
 */
class Lazy_Blocks_Pro_Updater {
	/**
	 * Updater API instance.
	 *
	 * @var object
	 */
	public $api_instance;

	/**
	 * Lazy_Blocks_Pro_Updater construct
	 */
	public function __construct() {
		// Init updater class.
		add_action( 'init', array( $this, 'init_updater' ) );

		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
		add_action( 'admin_init', array( $this, 'register_license_option' ) );
		add_action( 'admin_init', array( $this, 'activate_license' ) );
		add_action( 'admin_notices', array( $this, 'admin_notices' ) );
	}

	/**
	 * Init updater.
	 */
	public function init_updater() {
		// retrieve license key from the DB.
		$license_key = get_option( 'lazy_blocks_pro_license_key' );

		// load updater class.
		if ( ! class_exists( 'Lazy_Blocks_Pro_Updater_Api' ) ) {
			include lazy_blocks_pro()->plugin_path . '/classes/class-updater-api.php';
		}

		$this->api_instance = new Lazy_Blocks_Pro_Updater_Api(
			array(
				'api_url'          => 'https://api.lazyblocks.com',
				'plugin_file'      => lazy_blocks_pro()->plugin_file_path,
				'version'          => LAZY_BLOCKS_VERSION,
				'license'          => $license_key,
				'license_page_url' => admin_url( 'edit.php?post_type=lazyblocks&page=lazyblocks_updates' ),
				'purchase_url'     => 'https://www.lazyblocks.com/pro/',
			)
		);
	}

	/**
	 * Admin menu.
	 */
	public function admin_menu() {
		add_submenu_page(
			'edit.php?post_type=lazyblocks',
			esc_html__( 'Updates', 'lazy-blocks' ),
			esc_html__( 'Updates', 'lazy-blocks' ),
			'manage_options',
			'lazyblocks_updates',
			array( $this, 'render_updates_page' )
		);
	}

	/**
	 * Mask string, used for license key in settings.
	 *
	 * @param string $str string to mask.
	 * @param number $visible_chars characters to keep visible.
	 *
	 * @return string
	 */
	public function mask_string( $str, $visible_chars ) {
		$length = strlen( $str ?? '' );

		if ( ! $length || $length <= $visible_chars ) {
			return $str;
		}

		return substr( $str, 0, $visible_chars ) . str_repeat( '*', $length - $visible_chars );
	}

	/**
	 * Updates page render.
	 */
	public function render_updates_page() {
		$license = get_option( 'lazy_blocks_pro_license_key' );

		if ( $license ) {
			$license = $this->mask_string( $license, 6 );
		}

		?>
		<div class="wrap">
			<h1 class="wp-heading-inline"><?php echo esc_html__( 'Updates', 'lazy-blocks' ); ?></h1>

			<form method="post" action="options.php" class="lazy-blocks-pro-license-form">
				<?php settings_fields( 'lazy_blocks_pro_license' ); ?>

				<?php // Default WordPress page structure. ?>
				<div class="metabox-holder"><div class="postbox-container"><div class="normal-sortables"><div class="postbox-container"><div class="postbox"><div class="inside">

					<label for="lazy_blocks_pro_license_key">
						<strong><?php echo esc_html__( 'License Key', 'lazy-blocks' ); ?></strong>
					</label>
					<div>
						<input id="lazy_blocks_pro_license_key" name="lazy_blocks_pro_license_key" type="text" class="regular-text" value="<?php echo esc_attr( $license ); ?>" <?php echo $license ? 'disabled' : ''; ?> />
						<p class="description">
							<?php
							if ( $license ) {
								echo wp_kses_post(
									sprintf(
										// translators: %s - troubleshooting page.
										__( 'Your license is active. If you can\'t get updates, please see <a href="%s" target="_blank" rel="noopener noreferrer">troubleshooting page</a>.', 'lazy-blocks' ),
										'https://www.lazyblocks.com/docs/troubleshooting/download-failed-unauthorized/'
									)
								);
							} else {
								echo wp_kses_post(
									sprintf(
										// translators: %s - purchase page.
										__( 'To unlock updates, please enter your license key. If you don\'t have a license key, please see <a href="%s" target="_blank" rel="noopener noreferrer">details & pricing</a>.', 'lazy-blocks' ),
										'https://lazyblocks.com/pro/'
									)
								);
							}
							?>
						</p>
					</div>
					<div>
						<?php wp_nonce_field( 'lazy_blocks_pro_license_nonce', 'lazy_blocks_pro_license_nonce' ); ?>

						<?php if ( $license ) { ?>
							<input type="submit" class="button-secondary" name="lazy_blocks_pro_license_deactivate" value="<?php echo esc_attr__( 'Deactivate License', 'lazy-blocks' ); ?>" />
							<?php
						} else {
							?>
							<input type="submit" class="button-primary" name="lazy_blocks_pro_license_activate" value="<?php echo esc_attr__( 'Activate License', 'lazy-blocks' ); ?>" />
						<?php } ?>
					</div>

				<?php // Default WordPress page structure. ?>
				</div></div></div></div></div></div>

				<?php submit_button(); ?>
			</form>

			<style>
				.lazy-blocks-pro-license-form label {
					display: inline-block;
					margin-bottom: 5px;
				}
				.lazy-blocks-pro-license-form [type="submit"] {
					margin-top: 7px;
				}
				.lazy-blocks-pro-license-form [name="lazy_blocks_pro_license_key"] {
					margin-bottom: 3px;
				}
				.lazy-blocks-pro-license-form .inside {
					margin-bottom: 0;
				}

				.submit {
					display: none;
				}
			</style>
		</div>
		<?php
	}

	/**
	 * Creates our settings in the options table.
	 */
	public function register_license_option() {
		register_setting( 'lazy_blocks_pro_license', 'lazy_blocks_pro_license_key', array( $this, 'sanitize_license' ) );
	}

	/**
	 * Sanitizes the license key.
	 *
	 * @param string $new_license - new license string.
	 *
	 * @return string
	 */
	public function sanitize_license( $new_license ) {
		$old_license = get_option( 'lazy_blocks_pro_license_key' );

		if ( $old_license && $old_license !== $new_license ) {
			// Once the new license entered, we must reactivate.
			delete_option( 'lazy_blocks_pro_license_status' );
		}

		return sanitize_text_field( $new_license );
	}

	/**
	 * Safe redirect to the updates screen with additional GET data.
	 *
	 * @param array $data - additional data for redirection.
	 */
	public function redirect( $data ) {
		$data = array_merge(
			array(
				'post_type' => 'lazyblocks',
				'page'      => 'lazyblocks_updates',
			),
			$data
		);

		$redirect = add_query_arg(
			$data,
			admin_url( 'edit.php' )
		);

		wp_safe_redirect( $redirect );

		exit();
	}

	/**
	 * Activates the license key.
	 */
	public function activate_license() {
		// Check if the activation or deactivation button was clicked.
		if ( ! isset( $_POST['lazy_blocks_pro_license_activate'] ) && ! isset( $_POST['lazy_blocks_pro_license_deactivate'] ) ) {
			return;
		}

		// Run a quick security check.
		if ( ! check_admin_referer( 'lazy_blocks_pro_license_nonce', 'lazy_blocks_pro_license_nonce' ) ) {
			return;
		}

		$is_error      = false;
		$error_message = '';

		$type         = isset( $_POST['lazy_blocks_pro_license_activate'] ) ? 'activate' : 'deactivate';
		$license_key  = isset( $_POST['lazy_blocks_pro_license_key'] ) ? sanitize_text_field( wp_unslash( $_POST['lazy_blocks_pro_license_key'] ) ) : null;
		$license_data = get_option( 'lazy_blocks_pro_license_key_data' );

		// Deactivate license.
		if ( 'deactivate' === $type ) {
			$result = $this->api_instance->request_deactivate( $license_key ?? get_option( 'lazy_blocks_pro_license_key' ), $license_data['instance_id'] ?? '' );

			// Remove license.
			if ( isset( $result['success'] ) && $result['success'] ) {
				delete_option( 'lazy_blocks_pro_license_key' );
				delete_option( 'lazy_blocks_pro_license_key_data' );
			} else {
				$is_error      = true;
				$error_message = $result['error_message'] ?? __( 'Something went wrong.', 'lazy-blocks' );
			}

			// Activate license.
		} elseif ( $license_key ) {
			$result = $this->api_instance->request_activate( $license_key );

			// Save license.
			if ( isset( $result['success'] ) && $result['success'] ) {
				update_option( 'lazy_blocks_pro_license_key', $license_key );
				update_option( 'lazy_blocks_pro_license_key_data', $result );
			} else {
				$is_error      = true;
				$error_message = $result['error_message'] ?? __( 'Something went wrong.', 'lazy-blocks' );
			}
		}

		$redirect_nonce = wp_create_nonce( 'lazy_blocks_pro_activation_redirect_nonce' );

		// Error.
		if ( $is_error ) {
			$this->redirect(
				array(
					'sl_activation' => 'false',
					'sl_message'    => rawurlencode( $error_message ),
					'sl_nonce'      => $redirect_nonce,
				)
			);
		}

		// Deactivation message.
		if ( 'deactivate' === $type ) {
			$this->redirect(
				array(
					'sl_activation' => 'true',
					'sl_message'    => rawurlencode( esc_html__( 'Your license is deactivated.', 'lazy-blocks' ) ),
					'sl_nonce'      => $redirect_nonce,
				)
			);

			// Activation message.
		} else {
			$this->redirect(
				array(
					'sl_activation' => 'true',
					'sl_message'    => rawurlencode( esc_html__( 'Your license is activated!', 'lazy-blocks' ) ),
					'sl_nonce'      => $redirect_nonce,
				)
			);
		}
	}

	/**
	 * This is a means of catching errors from the activation method above and displaying it to the customer
	 */
	public function admin_notices() {
		// Correct page check.
		if ( ! isset( $_GET['page'] ) || 'lazyblocks_updates' !== $_GET['page'] ) {
			return;
		}

		// Message and nonce check.
		if ( ! isset( $_GET['sl_activation'] ) || empty( $_GET['sl_message'] ) || ! isset( $_GET['sl_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['sl_nonce'] ) ), 'lazy_blocks_pro_activation_redirect_nonce' ) ) {
			return;
		}

		$message = urldecode( sanitize_text_field( wp_unslash( $_GET['sl_message'] ) ) );

		switch ( $_GET['sl_activation'] ) {
			case 'false':
				?>
				<div class="notice notice-error">
					<p><?php echo wp_kses_post( $message ); ?></p>
				</div>
				<?php
				break;

			case 'true':
			default:
				?>
				<div class="notice notice-success">
					<p><?php echo wp_kses_post( $message ); ?></p>
				</div>
				<?php
				break;
		}
		// phpcs:enable
	}
}

new Lazy_Blocks_Pro_Updater();
