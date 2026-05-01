<?php

if (! defined('ABSPATH')) exit;

$all_blocks = require __DIR__ . '/block_list.php';

function handle_block_init()
{
    global $all_blocks;

    // Register block editor assets
    foreach ($all_blocks as $block) :
        register_block_type(__DIR__ . '/..' . $block['dir']);
    endforeach;
    //
    if (function_exists('wp_set_script_translations')) :
        foreach ($all_blocks as $block) :
            $script_handle = generate_block_asset_handle($block['block_name'], 'editorScript');
            wp_set_script_translations($script_handle, 'cwc-blocks', __DIR__ . '/../languages');
        endforeach;
    endif;
}

// Register layout category
function register_layout_category($categories)
{
    $categories[] = array(
        'slug'  => 'cwc-blocks',
        'title' => __('ORIGINAL BLOCKS')
    );

    return $categories;
}

if (version_compare(get_bloginfo('version'), '5.8', '>=')) {
    add_filter('block_categories_all', 'register_layout_category');
} else {
    add_filter('block_categories', 'register_layout_category');
}

load_plugin_textdomain('cwc-blocks', false, dirname(plugin_basename(__FILE__)) . "/../languages/ja.mo");
add_action('init', 'handle_block_init');
