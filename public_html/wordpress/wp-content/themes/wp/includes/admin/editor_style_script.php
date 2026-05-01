<?php

function add_custom_admin_style_script()
{
    // css
    wp_enqueue_style('custom-admin-css', get_stylesheet_directory_uri() . '/includes/admin/css/custom.css');
    // js
    wp_enqueue_script('jquery-ui-sortable');
    wp_enqueue_script('functions-js',  get_stylesheet_directory_uri() . '/includes/admin/js/functions.js', [], 1, ['in_footer' => true]);
}
add_action('admin_enqueue_scripts', 'add_custom_admin_style_script');
