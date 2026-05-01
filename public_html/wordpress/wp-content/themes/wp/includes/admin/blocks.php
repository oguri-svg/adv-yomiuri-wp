<?php

// SVG icons from
// https://www.svgrepo.com/
$blocks = [
    'test-block' => [
        'label'     => 'test block',
        'icon'      => '<svg fill="#000000" width="256px" height="256px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20,13.2928932 L20,9.5 C20,8.67157288 19.3284271,8 18.5,8 L13.5,8 C12.6715729,8 12,8.67157288 12,9.5 L12,12.2928932 L13.1464466,11.1464466 C13.3417088,10.9511845 13.6582912,10.9511845 13.8535534,11.1464466 L16.5,13.7928932 L18.1464466,12.1464466 C18.3417088,11.9511845 18.6582912,11.9511845 18.8535534,12.1464466 L20,13.2928932 L20,13.2928932 Z M19.9874925,14.6945992 L18.5,13.2071068 L16.8535534,14.8535534 C16.6582912,15.0488155 16.3417088,15.0488155 16.1464466,14.8535534 L13.5,12.2071068 L12,13.7071068 L12,14.5 C12,15.3284271 12.6715729,16 13.5,16 L18.5,16 C19.2624802,16 19.8920849,15.4310925 19.9874925,14.6945992 L19.9874925,14.6945992 Z M13.5,7 L18.5,7 C19.8807119,7 21,8.11928813 21,9.5 L21,14.5 C21,15.8807119 19.8807119,17 18.5,17 L13.5,17 C12.1192881,17 11,15.8807119 11,14.5 L11,9.5 C11,8.11928813 12.1192881,7 13.5,7 Z M17.5,9 L18.5,9 C18.7761424,9 19,9.22385763 19,9.5 L19,10.5 C19,10.7761424 18.7761424,11 18.5,11 L17.5,11 C17.2238576,11 17,10.7761424 17,10.5 L17,9.5 C17,9.22385763 17.2238576,9 17.5,9 Z M3.5,15 C3.22385763,15 3,14.7761424 3,14.5 C3,14.2238576 3.22385763,14 3.5,14 L8.5,14 C8.77614237,14 9,14.2238576 9,14.5 C9,14.7761424 8.77614237,15 8.5,15 L3.5,15 Z M3.5,10 C3.22385763,10 3,9.77614237 3,9.5 C3,9.22385763 3.22385763,9 3.5,9 L8.5,9 C8.77614237,9 9,9.22385763 9,9.5 C9,9.77614237 8.77614237,10 8.5,10 L3.5,10 Z M3.5,5 C3.22385763,5 3,4.77614237 3,4.5 C3,4.22385763 3.22385763,4 3.5,4 L20.5,4 C20.7761424,4 21,4.22385763 21,4.5 C21,4.77614237 20.7761424,5 20.5,5 L3.5,5 Z M3.5,20 C3.22385763,20 3,19.7761424 3,19.5 C3,19.2238576 3.22385763,19 3.5,19 L20.5,19 C20.7761424,19 21,19.2238576 21,19.5 C21,19.7761424 20.7761424,20 20.5,20 L3.5,20 Z"></path> </g></svg>',
    ],
];

add_filter('allowed_block_types_all', function ($allowed_block_types, $post) use ($blocks) {
    $allowed_block_types = [
        'cwc/wrapper',
        'cwc/heading',
        'cwc/image',
        'cwc/media',
        'cwc/button',
        'cwc/file',
        'cwc/content-image', // 画像回り込み
        'cwc/image-content', // 画像＆テキスト（２列）
        'cwc/three-image-content', // 画像＆テキスト（３列）
        'cwc/table-of-contents',
        'core/paragraph',
        'core/list',
        'core/list-item',

        'flexible-table-block/table',

        'lazyblock/ai-block',
        'lazyblock/test1'
    ];

    foreach ($blocks as $block_name => $block_data) {
        $allowed_block_types[] = 'acf/' . $block_name;
    }

    return $allowed_block_types;
}, 10, 2);


// ACF Blocks
add_action('acf/init', function () use ($blocks) {
    // plugin afc
    if (function_exists('acf_register_block_type')) {
  
    foreach ($blocks as $block_name => $block_data) {
            acf_register_block_type(
                [
                    'name'            => $block_name,
                    'title'           => __($block_data['label']),
                    'description'     => __($block_data['label']),
                    'render_template' => 'blocks/afc-' . $block_name . '/block.php',
                    'category'        => 'cwc-blocks',
                    'icon'            => $block_data['icon'],
                    'keywords'        => [$block_data['label']],
                    'mode'            => 'auto',
                ]
            );
        }
    }
});
