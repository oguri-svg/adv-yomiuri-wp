<?php
/**
 * Updater API.
 *
 * @package Lazy Blocks Pro
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Updater_Api
 */
class Lazy_Blocks_Pro_Updater_Api {
	/**
	 * Plugin data to work with API.
	 *
	 * @var array
	 */
	public $data;

	/**
	 * Constructor.
	 *
	 * @param array $data Optional data to send with API calls.
	 */
	public function __construct( $data ) {
		$this->data = array(
			'plugin_file'      => $data['plugin_file'],
			'plugin_basename'  => plugin_basename( $data['plugin_file'] ),
			'plugin_slug'      => dirname( plugin_basename( $data['plugin_file'] ) ),
			'license'          => $data['license'] ?? '',
			'license_page_url' => $data['license_page_url'] ?? '',
			'purchase_url'     => $data['purchase_url'] ?? '',
			'version'          => $data['version'] ?? '',
			'api_url'          => $data['api_url'],

			// Only disable this for debugging.
			'cache_allowed'    => $data['cache_allowed'] ?? true,
		);

		$this->data['cache_key'] = str_replace( '-', '_', $this->data['plugin_slug'] ) . '_updater';

		$this->init_hooks();
	}

	/**
	 * Set up WordPress filters to hook into WP's update process.
	 *
	 * @uses add_filter()
	 *
	 * @return void
	 */
	public function init_hooks() {
		add_filter( 'plugins_api', array( $this, 'info' ), 20, 3 );
		add_filter( 'pre_set_site_transient_update_plugins', array( $this, 'update' ), 10, 1 );

		add_action( 'in_plugin_update_message-' . $this->data['plugin_basename'], array( $this, 'extend_plugin_update_message' ) );

		add_action( 'upgrader_process_complete', array( $this, 'purge' ), 10, 2 );
		add_filter( 'upgrader_pre_download', array( $this, 'intercept_plugin_update_download' ), 10, 4 );
	}

	/**
	 * Intercept plugin update download to check and refresh expired download URLs.
	 *
	 * This method hooks into WordPress's plugin update process via the 'upgrader_pre_download'
	 * filter to intercept download requests for this specific plugin. It checks if the download
	 * URL has expired by examining the 'expires' parameter in the URL. If the URL is expired
	 * or about to expire (within buffer time), it clears the update cache and requests a fresh
	 * download URL from the API, then downloads the plugin file directly.
	 *
	 * @see https://developer.wordpress.org/reference/hooks/upgrader_pre_download/
	 * @uses parse_url() to extract query parameters from the download URL
	 * @uses download_url() to download the plugin file when using a refreshed URL
	 * @uses delete_transient() to clear cached update data when URL is expired
	 *
	 * @param false|string $reply     The default return value (usually false). If a non-falsy value
	 *                                is returned, the download will be skipped and this value used instead.
	 * @param string       $package   The download URL for the plugin update package.
	 * @param WP_Upgrader  $upgrader  The WP_Upgrader instance performing the update.
	 * @param array        $hook_extra {
	 *     Additional context about the update being performed.
	 *
	 *     @type string $plugin      The plugin basename (e.g., 'plugin-folder/plugin-file.php').
	 *     @type array  $temp_backup Information about temporary backup if enabled.
	 * }
	 *
	 * @return false|string|WP_Error {
	 *     The download result.
	 *
	 *     @type false    Continue with WordPress's default download process.
	 *     @type string   Local file path if download was handled by this method.
	 *     @type WP_Error Error object if download failed or URL refresh failed.
	 * }
	 */
	public function intercept_plugin_update_download( $reply, $package, $upgrader, $hook_extra ) {
		// Only intercept downloads for our specific plugin.
		if ( ! isset( $hook_extra['plugin'] ) || $hook_extra['plugin'] !== $this->data['plugin_basename'] ) {
			return $reply;
		}

		// Check if license key provided.
		if ( empty( $this->data['license'] ) ) {
			return new WP_Error(
				'invalid_package_url',
				$this->get_license_key_message()
			);
		}

		// Validate that we have a valid package URL.
		if ( empty( $package ) || ! is_string( $package ) ) {
			return new WP_Error( 'invalid_package_url', __( 'Invalid package URL provided.', 'lazy-blocks' ) );
		}

		// Check if URL needs refreshing due to expiration.
		if ( ! $this->is_download_url_expired( $package ) ) {
			return $reply;
		}

		// URL is expired or about to expire, attempt to refresh it.
		return $this->handle_expired_download_url();
	}

	/**
	 * Check if a download URL is expired or about to expire.
	 *
	 * @param string $package_url The download URL to check.
	 * @return bool True if URL is expired or about to expire, false otherwise.
	 */
	private function is_download_url_expired( $package_url ) {
		$parsed_url = parse_url( $package_url );

		// If we can't parse the URL or there's no query string, assume it's valid.
		if ( ! $parsed_url || ! isset( $parsed_url['query'] ) ) {
			return false;
		}

		parse_str( $parsed_url['query'], $query_params );

		// If there's no expires parameter, URL doesn't expire.
		if ( ! isset( $query_params['expires'] ) ) {
			return false;
		}

		$expires_timestamp = intval( $query_params['expires'] );
		$current_timestamp = time();

		// Add buffer time (5 minutes) to refresh before actual expiration.
		$buffer_time = 5 * MINUTE_IN_SECONDS;

		return ( $expires_timestamp - $buffer_time ) <= $current_timestamp;
	}

	/**
	 * Handle expired download URL by fetching a fresh one and downloading the package.
	 *
	 * @return string|WP_Error Local file path on success, WP_Error on failure.
	 */
	private function handle_expired_download_url() {
		// Clear the update cache to force fresh API call.
		$this->clear_update_cache();

		// Get fresh update info with new download link.
		$fresh_response = $this->request_update();

		if ( ! isset( $fresh_response->success ) || ! $fresh_response->success ) {
			$error_msg = __( 'Failed to refresh expired download URL', 'lazy-blocks' );

			if ( isset( $fresh_response->error_message ) ) {
				$error_msg .= ': ' . $fresh_response->error_message;
			}

			return new WP_Error( 'download_refresh_failed', $error_msg );
		}

		if ( empty( $fresh_response->package ) ) {
			return new WP_Error( 'empty_package_url', __( 'Fresh download URL is empty.', 'lazy-blocks' ) );
		}

		// Validate the fresh URL before attempting download.
		if ( ! wp_http_validate_url( $fresh_response->package ) ) {
			return new WP_Error( 'invalid_fresh_url', __( 'Fresh download URL is not valid.', 'lazy-blocks' ) );
		}

		// Download the package with the new URL.
		$download_file = download_url( $fresh_response->package );

		if ( is_wp_error( $download_file ) ) {
			return $download_file;
		}

		// Verify the downloaded file exists and is readable.
		if ( ! file_exists( $download_file ) || ! is_readable( $download_file ) ) {
			return new WP_Error( 'download_file_invalid', __( 'Downloaded file is not accessible.', 'lazy-blocks' ) );
		}

		return $download_file;
	}


	/**
	 * Get the license key requirement message.
	 *
	 * @return string The formatted message for license key requirement.
	 */
	private function get_license_key_message() {
		return wp_kses_post(
			sprintf(
				// translators: %1$s - settings updates page url.
				// translators: %2$s - purchase page.
				__( 'To enable updates, please enter your license key on the <a href="%1$s">Updates</a> page. If you don\'t have a license key, please see <a href="%2$s" target="_blank">details & pricing</a>.', 'lazy-blocks' ),
				$this->data['license_page_url'],
				$this->data['purchase_url']
			)
		);
	}

	/**
	 * Clear the update cache to force fresh API call.
	 *
	 * This method clears the cached update data to ensure that the next call to request_update()
	 * will fetch fresh data from the API instead of using potentially stale cached data.
	 */
	private function clear_update_cache() {
		// Generate the same cache key that request_update() would use.
		$params = array(
			'license' => ! empty( $this->data['license'] ) ? $this->data['license'] : '',
		);

		$url = $this->data['api_url'] . '/update';

		$request_cache_key = md5( serialize( array_merge( $params, array( 'request_url' => $url ) ) ) );
		$request_cache_key = $this->data['cache_key'] . '_' . $request_cache_key;

		// Delete the specific cache entry.
		delete_transient( $request_cache_key );
	}

	/**
	 * Clears WordPress plugin update cache and forces a fresh update check.
	 *
	 * This method removes the cached plugin update information stored in the
	 * 'update_plugins' site transient and immediately triggers WordPress to
	 * check for available plugin updates from the WordPress.org repository.
	 *
	 * @access private
	 *
	 * @return bool True if cache was cleared successfully, false otherwise
	 *
	 * @see delete_site_transient() For clearing the cached update data
	 * @see wp_update_plugins() For triggering the update check
	 */
	private function clear_update_plugins_cache() {
		// Clear the plugin updates cache.
		$cache_cleared = delete_site_transient( 'update_plugins' );

		// Force WordPress to check for plugin updates immediately.
		wp_update_plugins();

		return $cache_cleared;
	}

	/**
	 * Fetch the update info from the remote server running the Lemon Squeezy plugin.
	 *
	 * @param string  $url - request URL.
	 * @param array   $params - body params.
	 * @param boolean $cache - cache time.
	 *
	 * @return object
	 */
	public function request( $url, $params = array(), $cache = false ) {
		$with_cache = $cache && $this->data['cache_allowed'];
		$api_params = array_merge(
			array(
				'url'         => home_url(),
				'php_version' => phpversion(),
				'wp_version'  => get_bloginfo( 'version' ),
			),
			$params
		);

		if ( $with_cache ) {
			$request_cache_key = md5( serialize( array_merge( $params, array( 'request_url' => $url ) ) ) );
			$request_cache_key = $this->data['cache_key'] . '_' . $request_cache_key;

			$response = get_transient( $request_cache_key );

			if ( false !== $response ) {
				if ( isset( $response->error ) ) {
					return $response;
				}

				return json_decode( $response );
			}
		}

		$response = wp_remote_post(
			$url,
			array(
				'headers'   => array( 'Content-Type' => 'application/json' ),
				'timeout'   => 15,
				'sslverify' => false,
				'body'      => json_encode( $api_params ),
			)
		);

		if (
			is_wp_error( $response )
			|| 200 !== wp_remote_retrieve_response_code( $response )
			|| empty( wp_remote_retrieve_body( $response ) )
		) {
			$error_response = (object) array(
				'error'         => true,
				'error_message' => __( 'An error occurred, please try again.', 'lazy-blocks' ),
			);

			if ( ! empty( $response->get_error_message ) && ! empty( $response->get_error_message() ) ) {
				$error_response->error_message = $response->get_error_message();
			} elseif ( ! empty( wp_remote_retrieve_body( $response ) ) ) {
				$error_response = wp_remote_retrieve_body( $response );
				$error_response = json_decode( $error_response );
			}

			// Force error cache.
			if ( $this->data['cache_allowed'] ) {
				set_transient( $request_cache_key, $error_response, MINUTE_IN_SECONDS * 10 );
			}

			return $error_response;
		}

		$payload = wp_remote_retrieve_body( $response );

		if ( $with_cache ) {
			set_transient( $request_cache_key, $payload, DAY_IN_SECONDS );
		}

		return json_decode( $payload );
	}

	/**
	 * Activation request.
	 *
	 * @param string $license_key - license key to activate.
	 *
	 * @return array
	 */
	public function request_activate( $license_key ) {
		$error_message = '';

		// Verify license key.
		if ( empty( $license_key ) ) {
			$error_message = __( 'License key was not specified.', 'lazy-blocks' );
		} else {
			$response = $this->request(
				$this->data['api_url'] . '/activate_license',
				array(
					'license' => $license_key,
				),
				true
			);

			// make sure the response came back okay.
			if ( ! $response->success ) {
				$error_message = $response->error_message ?? __( 'Something went wrong.', 'lazy-blocks' );
			}
		}

		$this->clear_update_cache();
		$this->clear_update_plugins_cache();

		// Check if anything passed on a message constituting a failure.
		if ( ! empty( $error_message ) ) {
			return array(
				'error'         => true,
				'error_message' => 'Error: ' . $error_message,
			);
		}

		return array(
			'success'     => true,
			'instance_id' => $response->instance_id ?? '',
		);
	}

	/**
	 * Deactivation request.
	 *
	 * @param string $license_key - license key to deactivate.
	 * @param string $instance_id - instance ID for LSQ to deactivate.
	 *
	 * @return array
	 */
	public function request_deactivate( $license_key, $instance_id ) {
		$error_message = '';

		// Verify license key.
		if ( empty( $license_key ) ) {
			$error_message = __( 'License key was not specified.', 'lazy-blocks' );
		} else {
			$response = $this->request(
				$this->data['api_url'] . '/deactivate_license',
				array(
					'license'     => $license_key,
					'instance_id' => $instance_id,
				),
				true
			);

			// make sure the response came back okay.
			if ( ! $response->success ) {
				$error_message = $response->error_message ?? __( 'Something went wrong.', 'lazy-blocks' );
			}
		}

		$this->clear_update_cache();
		$this->clear_update_plugins_cache();

		// Check if anything passed on a message constituting a failure.
		if ( ! empty( $error_message ) ) {
			return array(
				'error'         => true,
				'error_message' => 'Error: ' . $error_message,
			);
		}

		return array(
			'success' => true,
		);
	}

	/**
	 * Fetch the update info.
	 *
	 * @return object
	 */
	public function request_update() {
		$response = $this->request(
			$this->data['api_url'] . '/update',
			array(
				'license' => ! empty( $this->data['license'] ) ? $this->data['license'] : '',
			),
			true
		);

		if ( isset( $response->success ) && $response->success ) {
			// Convert nested objects to array.
			foreach ( $response as $key => $val ) {
				if ( is_object( $val ) ) {
					$response->{$key} = json_decode( json_encode( $val ), true );
				}
			}

			$response->id          = $this->data['plugin_basename'];
			$response->slug        = $this->data['plugin_slug'];
			$response->plugin      = $this->data['plugin_basename'];
			$response->new_version = $response->version ?? $this->data['version'];
			$response->package     = $response->download_link ?? '';

			return $response;
		}

		if ( isset( $response->error ) && $response->error ) {
			return (object) array(
				'success'       => false,
				'error'         => true,
				'error_message' => $response->error_message ?? __( 'Unknown error occurred during update check.', 'lazy-blocks' ),
			);
		}

		return (object) array(
			'success' => false,
		);
	}

	/**
	 * Override the WordPress request to return the correct plugin info.
	 *
	 * @see https://developer.wordpress.org/reference/hooks/plugins_api/
	 *
	 * @param false|array $result default filter data.
	 * @param string      $action action name.
	 * @param object      $args plugin data.
	 *
	 * @return object|bool
	 */
	public function info( $result, $action, $args ) {
		if ( 'plugin_information' !== $action ) {
			return $result;
		}
		if ( $this->data['plugin_slug'] !== $args->slug ) {
			return $result;
		}

		$response = $this->request_update();

		if ( ! $response->success ) {
			return false;
		}

		return $response;
	}

	/**
	 * Override the WordPress request to check if an update is available.
	 *
	 * @see https://make.wordpress.org/core/2020/07/30/recommended-usage-of-the-updates-api-to-support-the-auto-updates-ui-for-plugins-and-themes-in-wordpress-5-5/
	 *
	 * @param object $transient transient data.
	 *
	 * @return object
	 */
	public function update( $transient ) {
		if ( empty( $transient->checked ) ) {
			return $transient;
		}

		$response = $this->request_update();

		if (
			$response->success && isset( $response->version )
			&& version_compare( $this->data['version'], $response->version, '<' )
		) {
			$transient->response[ $this->data['plugin_basename'] ] = $response;
		} else {
			$transient->no_update[ $this->data['plugin_basename'] ] = $response;
		}

		return $transient;
	}

	/**
	 * Displays an update message for plugin list screens.
	 */
	public function extend_plugin_update_message() {
		if ( ! empty( $this->data['license'] ) ) {
			return;
		}

		echo '<br />' . $this->get_license_key_message();
	}

	/**
	 * When the update is complete, purge the cache.
	 *
	 * @see https://developer.wordpress.org/reference/hooks/upgrader_process_complete/
	 *
	 * @param WP_Upgrader $upgrader - upgrader data.
	 * @param array       $options - options.
	 */
	public function purge( $upgrader, $options ) {
		global $wpdb;

		if (
			$this->data['cache_allowed']
			&& 'update' === $options['action']
			&& 'plugin' === $options['type']
			&& ! empty( $options['plugins'] )
		) {
			foreach ( $options['plugins'] as $plugin ) {
				if ( $plugin === $this->data['plugin_basename'] ) {
					// Similar to:
					// delete_transient( $this->data['cache_key'] );.
					// But we delete all transients with the same prefix. Like wildcard.
					$wpdb->query(
						$wpdb->prepare(
							"DELETE FROM {$wpdb->options} WHERE `option_name` LIKE %s",
							'_transient_' . $this->data['cache_key'] . '_%'
						)
					);
				}
			}
		}
	}
}
