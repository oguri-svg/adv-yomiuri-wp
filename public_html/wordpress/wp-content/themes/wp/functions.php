<?php
if (!defined('ABSPATH')) exit;
if (!session_id()) {
    session_start();
}
add_theme_support('post-thumbnails');
// Difine　変数
include_once get_parent_theme_file_path('/includes/paths.php');
// 関数が全て入っている
include_once get_parent_theme_file_path('/includes/functions.php');
// Gutenberg Blocks
include_once get_parent_theme_file_path('/includes/admin/blocks.php');
// APIコントローラー
include_once get_parent_theme_file_path('/includes/admin/class/api/NewApiController.php');
// Routeクラスを定義する
include_once get_parent_theme_file_path('/includes/admin/class/Route.php');
// APIルート
include_once get_parent_theme_file_path('/includes/admin/api_routes.php');
// 設定
include_once get_parent_theme_file_path('/includes/admin/editor_style_script.php');
// フォーム設定
include_once get_parent_theme_file_path('/includes/admin/form_settings.php');
// カスタムブロックをフロントで表示する前に
include_once get_parent_theme_file_path('/includes/front/parts/render_html.php');
