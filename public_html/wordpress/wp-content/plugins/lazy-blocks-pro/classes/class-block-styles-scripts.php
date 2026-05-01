<?php
/**
 * Enqueue block styles and scripts.
 *
 * @package Lazy Blocks Pro
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lazy_Blocks_Pro_Block_Styles_Scripts class.
 */
class Lazy_Blocks_Pro_Block_Styles_Scripts {
	/**
	 * Constructor
	 */
	public function __construct() {
		// Filters.
		add_filter( 'lzb/register_block_type_data', array( $this, 'lzb_register_block_type_data' ), 10, 2 );

		// Higher priority used to prevent the possible conflicts
		// with 3rd-party code, which uses these filters for customizations.
		// Lazy_Blocks_Pro_Blocks_Preload uses this filter with priority 200.
		add_filter( 'lzb/block_render/output', array( $this, 'block_render_output' ), 199, 4 );
	}

	/**
	 * Additional block data.
	 *
	 * @param array $data  - register block data.
	 * @param array $block - get block meta.
	 *
	 * @return array
	 */
	public function lzb_register_block_type_data( $data, $block ) {
		$style_handle        = str_replace( '/', '-', $block['slug'] ) . '-block';
		$script_handle       = str_replace( '/', '-', $block['slug'] ) . '-view';
		$editor_style_handle = $style_handle . '-block-editor';

		// Theme template file.
		if ( isset( $block['code']['output_method'] ) && 'template' === $block['code']['output_method'] ) {
			$template_slug        = str_replace( '/', '-', $block['slug'] );
			$template_path        = 'blocks/' . $template_slug . '/block.css';
			$template_path_editor = 'blocks/' . $template_slug . '/editor.css';
			$script_template_path = 'blocks/' . $template_slug . '/view.js';

			$style_template        = $this->find_style_template( $template_path, $block, 'block' );
			$style_editor_template = $this->find_style_template( $template_path_editor, $block, 'editor' );
			$script_template       = $this->find_script_template( $script_template_path, $block, 'view' );

			// Register styles and add to block.
			if ( $style_template ) {
				$this->register_style( $style_handle, $style_template );

				if ( isset( $data['style'] ) ) {
					$data['style'][] .= $style_handle;
				} else {
					$data['style'] = array( $style_handle );
				}
			}
			if ( $style_editor_template ) {
				$this->register_style( $editor_style_handle, $style_editor_template );

				if ( isset( $data['editor_style'] ) ) {
					$data['editor_style'][] .= $editor_style_handle;
				} else {
					$data['editor_style'] = array( $editor_style_handle );
				}
			}

			// Register scripts and add to block.
			if ( $script_template ) {
				$this->register_script( $script_handle, $script_template );

				if ( isset( $data['view_script'] ) ) {
					$data['view_script'][] .= $script_handle;
				} else {
					$data['view_script'] = array( $script_handle );
				}
			}
		} else {
			// Register inline styles and add to block.
			if ( ! empty( $block['style']['block'] ) ) {
				$this->register_custom_css( $style_handle, $block['style']['block'] );

				if ( isset( $data['style'] ) ) {
					$data['style'][] .= $style_handle;
				} else {
					$data['style'] = array( $style_handle );
				}
			}
			if ( ! empty( $block['style']['editor'] ) ) {
				$this->register_custom_css( $editor_style_handle, $block['style']['editor'] );

				if ( isset( $data['editor_style'] ) ) {
					$data['editor_style'][] .= $editor_style_handle;
				} else {
					$data['editor_style'] = array( $editor_style_handle );
				}
			}

			// Register inline scripts and add to block.
			if ( ! empty( $block['script']['view'] ) ) {
				$this->register_custom_js( $script_handle, $block['script']['view'] );

				if ( isset( $data['view_script'] ) ) {
					$data['view_script'][] .= $script_handle;
				} else {
					$data['view_script'] = array( $script_handle );
				}
			}
		}

		return $data;
	}

	/**
	 * Register and add custom inline CSS.
	 *
	 * @param string $name - handle name.
	 * @param string $css - code.
	 * @param array  $deps - dependencies.
	 */
	public function register_custom_css( $name, $css, $deps = array() ) {
		if ( ! wp_style_is( $name, 'registered' ) ) {
			$css     = wp_kses( $css, array( '\'', '\"' ) );
			$css     = str_replace( '&gt;', '>', $css );
			$version = md5( $name . $css );

			wp_register_style( $name, false, $deps, $version );
			wp_add_inline_style( $name, $css );
		}
	}

	/**
	 * Register style file.
	 *
	 * @param string $name - handle name.
	 * @param string $file - file path.
	 * @param array  $deps - dependencies.
	 */
	public function register_style( $name, $file, $deps = array() ) {
		if ( ! wp_style_is( $name, 'registered' ) ) {
			$url = $this->get_template_url( $file );

			if ( $url ) {
				$version = md5( $name . (string) filemtime( $file ) );

				wp_register_style( $name, $url, $deps, $version );
			}
		}
	}

	/**
	 * Check if style template exists and return the URL to it.
	 *
	 * @param string $template_name file name.
	 * @param array  $block block data.
	 * @param string $context context.
	 *
	 * @return string|bool
	 */
	public function find_style_template( $template_name, $block, $context = 'block' ) {
		// template in theme folder.
		$template = locate_template( array( $template_name ) );

		// Allow 3rd party plugin filter style template file from their plugin.
		$template = apply_filters( 'lzb_pro/block_style/template', $template, $template_name, $block, $context );
		// phpcs:ignore
		$template = apply_filters( $block['slug'] . '/' . $context . '_style_template', $template, $template_name, $block );
		// phpcs:ignore
		$template = apply_filters( $block['slug'] . '/style_template', $template, $template_name, $block, $context );

		return file_exists( $template ) ? $template : false;
	}

	/**
	 * Register and add custom inline JS.
	 *
	 * @param string $name - handle name.
	 * @param string $js - code.
	 * @param array  $deps - dependencies.
	 */
	public function register_custom_js( $name, $js, $deps = array() ) {
		if ( ! wp_script_is( $name, 'registered' ) ) {
			$version = md5( $name . $js );

			wp_register_script(
				$name,
				false,
				$deps,
				$version,
				array(
					'in_footer' => true,
				)
			);
			wp_add_inline_script( $name, $js );
		}
	}

	/**
	 * Register script file.
	 *
	 * @param string $name - handle name.
	 * @param string $file - file path.
	 * @param array  $deps - dependencies.
	 */
	public function register_script( $name, $file, $deps = array() ) {
		if ( ! wp_script_is( $name, 'registered' ) ) {
			$url = $this->get_template_url( $file );

			if ( $url ) {
				$version = md5( $name . (string) filemtime( $file ) );

				wp_register_script(
					$name,
					$url,
					$deps,
					$version,
					array(
						'in_footer' => true,
					)
				);
			}
		}
	}

	/**
	 * Check if script template exists and return the URL to it.
	 *
	 * @param string $template_name file name.
	 * @param array  $block block data.
	 * @param string $context context.
	 *
	 * @return string|bool
	 */
	public function find_script_template( $template_name, $block, $context = 'block' ) {
		// template in theme folder.
		$template = locate_template( array( $template_name ) );

		// Allow 3rd party plugin filter script template file from their plugin.
		$template = apply_filters( 'lzb_pro/block_script/template', $template, $template_name, $block, $context );
		// phpcs:ignore
		$template = apply_filters( $block['slug'] . '/' . $context . '_script_template', $template, $template_name, $block );
		// phpcs:ignore
		$template = apply_filters( $block['slug'] . '/script_template', $template, $template_name, $block, $context );

		return file_exists( $template ) ? $template : false;
	}

	/**
	 * Convert a file path to a URL
	 *
	 * @param string $file_path The file path to convert.
	 * @return string The URL to the file.
	 */
	private function get_template_url( $file_path ) {
		// Get the absolute path to the WordPress content directory.
		$content_dir = WP_CONTENT_DIR;
		$content_url = content_url();

		// Check if the file is in the content directory.
		if ( strpos( $file_path, $content_dir ) !== false ) {
			return str_replace( $content_dir, $content_url, $file_path );
		}

		// If the file is in the theme directory.
		$theme_dir = get_template_directory();
		$theme_url = get_template_directory_uri();

		if ( strpos( $file_path, $theme_dir ) !== false ) {
			return str_replace( $theme_dir, $theme_url, $file_path );
		}

		// If it's a child theme.
		$child_theme_dir = get_stylesheet_directory();
		$child_theme_url = get_stylesheet_directory_uri();

		if ( strpos( $file_path, $child_theme_dir ) !== false ) {
			return str_replace( $child_theme_dir, $child_theme_url, $file_path );
		}

		// If it's 3rd-party plugin.
		$plugins_dir = WP_PLUGIN_DIR;
		$plugins_url = plugins_url();

		if ( strpos( $file_path, $plugins_dir ) !== false ) {
			return str_replace( $plugins_dir, $plugins_url, $file_path );
		}

		// If none of the above, try a more general approach
		// Get the site root directory and URL.
		$site_root = ABSPATH;
		$site_url  = site_url();

		if ( strpos( $file_path, $site_root ) !== false ) {
			return str_replace( $site_root, $site_url, $file_path );
		}

		return false;
	}

	/**
	 * Prepare styles and scripts for lazy blocks.
	 *
	 * @param string $output - block output.
	 * @param array  $attributes - block attributes.
	 * @param array  $context - block context.
	 * @param array  $block - block data.
	 *
	 * @return string
	 */
	public function block_render_output( $output, $attributes, $context, $block ) {
		global $lzb_block_builder_preview;

		if ( ! $lzb_block_builder_preview ) {
			return $output;
		}

		// Start capturing output.
		ob_start();

		$inline_styles = '';

		// Check if block has template-based styles.
		if ( isset( $block['code']['output_method'] ) && 'template' === $block['code']['output_method'] ) {
			$template_slug = str_replace( '/', '-', $block['slug'] );

			// Always include block.css (frontend styles).
			$template_path  = 'blocks/' . $template_slug . '/block.css';
			$style_template = $this->find_style_template( $template_path, $block, 'block' );

			if ( $style_template ) {
				$file_content = file_get_contents( $style_template );
				if ( $file_content ) {
					$inline_styles .= $file_content;
				}
			}

			// Include editor.css only in editor context.
			if ( 'editor' === $context ) {
				$template_path_editor  = 'blocks/' . $template_slug . '/editor.css';
				$style_editor_template = $this->find_style_template( $template_path_editor, $block, 'editor' );

				if ( $style_editor_template ) {
					$file_content = file_get_contents( $style_editor_template );
					if ( $file_content ) {
						$inline_styles .= $file_content;
					}
				}
			}
		} else {
			// Always include block styles (frontend).
			if ( ! empty( $block['style']['block'] ) ) {
				$inline_styles .= $block['style']['block'];
			}

			// Include editor styles only in editor context.
			if ( 'editor' === $context && ! empty( $block['style']['editor'] ) ) {
				$inline_styles .= $block['style']['editor'];
			}
		}

		// Output the styles inline for the preview.
		if ( ! empty( $inline_styles ) ) {
			echo '<style id="lzb-block-builder-preview-styles-' . esc_attr( $block['slug'] ) . '">';
			echo wp_kses( $inline_styles, array( '\'', '\"' ) );
			echo '</style>';
		}

		// Return the output with the styles prepended.
		return $output . ob_get_clean();
	}
}

// Init.
new Lazy_Blocks_Pro_Block_Styles_Scripts();
