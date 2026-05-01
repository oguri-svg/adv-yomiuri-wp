<?php

use WPTheme\Admin\Route;
use WPTheme\Admin\NewApiController;

Route::get('/news/lists', [NewApiController::class, 'lists'], 'ニュース一覧を取得する');
Route::post(
    '/news/update/{category}/{id}',
    [NewApiController::class, 'update'],
    [
        'headers'   => [
            'Content-Type'  => 'application/json'
        ],
        'body'      => [
            'type'          =>   'JSON.stringify',
            'data'          => [
                'name'          => 'string',
                'email'         => 'string'
            ]

        ],
        'guide'     => 'ニュースを更新する'
    ]
);
