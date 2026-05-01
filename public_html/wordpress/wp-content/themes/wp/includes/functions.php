<?php

//以下に子テーマ用の関数を書く
function ddd(...$vars)
{

    $output = '';
    foreach ($vars as $var) {
        $output .= print_r($var, true) . "\n\n";
    }

    $theme_dir = get_stylesheet_directory();
    $file = $theme_dir . '/dd.txt';

    file_put_contents($file, "=== " . date('Y-m-d H:i:s') . " ===\n" . $output . "\n", FILE_APPEND);
}


if (!function_exists('dd')) {
    function dd($data)
    {
        wp_die('<pre>' . print_r($data, true) . '</pre>');
    }
}


function custom_theme_error_logger($errno, $errstr, $errfile, $errline)
{
    $types = [
        E_ERROR             => 'ERROR',
        E_WARNING           => 'WARNING',
        E_PARSE             => 'PARSE',
        E_NOTICE            => 'NOTICE',
        E_CORE_ERROR        => 'CORE_ERROR',
        E_CORE_WARNING      => 'CORE_WARNING',
        E_COMPILE_ERROR     => 'COMPILE_ERROR',
        E_COMPILE_WARNING   => 'COMPILE_WARNING',
        E_USER_ERROR        => 'USER_ERROR',
        E_USER_WARNING      => 'USER_WARNING',
        E_USER_NOTICE       => 'USER_NOTICE',
        E_RECOVERABLE_ERROR => 'RECOVERABLE_ERROR',
        E_DEPRECATED        => 'DEPRECATED',
        E_USER_DEPRECATED   => 'USER_DEPRECATED',
    ];

    $type = $types[$errno] ?? 'UNKNOWN';

    $message = "[$type] $errstr in $errfile on line $errline";
    write_custom_log($message);

    return false; // falseを返すことで、デフォルトのエラーハンドリングを続行します。
}


function custom_theme_fatal_logger()
{
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $message = "[FATAL] {$error['message']} in {$error['file']} on line {$error['line']}";
        write_custom_log($message);
    }
}


function write_custom_log($message)
{
    $theme_dir = get_stylesheet_directory();
    $file = $theme_dir . '/logs.txt';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($file, "[$timestamp] $message\n", FILE_APPEND);
}


function setHeadTitle($title = null, $isFull = false)
{
    $_title = SITE_TITLE;
    if ($title) {
        $title = is_array($title) ? implode(' | ', $title) : $title;
        $_title = $isFull ? $title : ($title . ' | ' . $_title);
    }
    return $_title;
}


function human_filesize($bytes, $decimals = 2)
{
    $sz = 'BKMGTP';
    $factor = floor((strlen($bytes) - 1) / 3);
    $s = @$sz[$factor];
    return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . ($s != 'B' ? $s . 'B' : $s);
}


function register_mpost_type($configs)
{
    foreach ($configs as $post_type => $config) {

        $arg = [
            'public'        => true,
            'hierarchical'  => true,
            'has_archive'   => true,
            'show_in_rest'  => true,
            'show_ui'       => true,
            'supports'      => ['title', 'editor', 'thumbnail'],
            'menu_icon'     => 'dashicons-media-text',
            'label'         => '',
            'labels'        => []
        ];

        $args = array_merge($arg, $config);

        $labels = [
            'name'                  => __($args['label']),
            'singular_name'         => __($args['label']),
            'view_items'            => __($args['label']),
            'view_item'             => __('表示'),
            'add_new'               => __('新規追加'),
            'add_new_item'          => __('新規追加｜' . $args['label']),
            'featured_image'        => __('画像（jpeg , jpg , gif , png ファイルのみ）（推奨サイズ：800px ✖︎ 560px）'),
            'all_items'             => __('一覧'),
            'edit_item'             => __('編集'),
            'not_found'             => __('データがありません'),
            'not_found_in_trash'    => __('データがありません'),
            'search_items'          => __('記事を検索'),
            'set_featured_image'    => __('アップロード'),
            'remove_featured_image' => __('画像を削除'),
        ];

        $args['labels'] = array_merge($labels, $args['labels']);
        register_post_type($post_type, $args);
    }
}


function register_mtaxonomy($configs)
{
    foreach ($configs as $post_type => $config) {

        foreach ($config as $conf) {
            $arg = [
                'update_count_callback' => '_update_post_term_count',
                'label'                 => $conf['config']['label'],
                'singular_label'        => $conf['config']['label'],
                'hierarchical'          => true, // (true: checkbox/radio ・ false: input)
                'public'                => false, // (true: 一覧画面の記事に「表示btn」が表示される ・ false: 一覧画面の記事に「表示btn」が非表示になる)
                'show_ui'               => true,
                'show_in_rest'          => true,
                'labels'                => []
            ];

            $args = array_merge($arg, $conf['config']);

            $labels = [
                'edit_item'             => __($args['label'] . 'を編集する'),
                'add_new_item'          => __($args['label'] . 'を追加する'),
                'new_item_name'         => __($args['label'] . '名'),
                'parent_item'           => __('親' . $args['label']),
                'update_item'           => __('更新する'),
                'back_to_items'         => __('← 前の画面に戻る'),
                'search_items'          => __('検索'),
                'not_found'             => __('データがありません'),
                'not_found_in_trash'    => __('データがありません'),
                'most_used'             => __('よく使う')
            ];

            $args['labels'] = array_merge($labels, $args['labels']);

            register_taxonomy($post_type . '-' . $conf['taxonomy'], $post_type, $args);
        }
    }
}


// カテゴリーかタグをリストに追加
function addTaxonomyInList($post_type, $taxonomy)
{
    $names = ['category' => 'カテゴリー', 'tag' => 'タグ'];

    add_filter('manage_' . $post_type . '_posts_columns', function ($columns) use ($names, $taxonomy) {
        $new_columns = [];
        foreach ($columns as $key => $value) {
            $new_columns[$key] = $value;
            if ($key === 'title') $new_columns[$taxonomy] = $names[$taxonomy];
        }
        return $new_columns;
    });

    add_action('manage_' . $post_type . '_posts_custom_column', function ($column, $post_id) use ($post_type, $taxonomy) {
        if ($column === $taxonomy) {
            $terms = get_the_terms($post_id, $post_type . '-' . $taxonomy);
            if (empty($terms)) echo '—';
            else foreach ($terms as $term) echo $term->name . '<br>';
        }
    }, 10, 2);
}


function convert_ruby(string $text)
{
    $regex = '/{{(.+?):(.+?)}}/';
    $replacement = '<ruby>$1<rt>$2</rt></ruby>';
    return preg_replace($regex, $replacement, $text);
}


function get_only_text_in_ruby(string $text)
{
    $regex = '/{{(.+?):(.+?)}}/';
    $replacement = '$1';
    return preg_replace($regex, $replacement, $text);
}


// 投稿一覧取得
function getListAll($post_type = null, $limit = 10, $query = [], $get_posts = false, $status = 'publish', $orderby = 'post_date', $sort = 'DESC')
{
    $query              = array_merge($_GET, $query);
    $post_type          = $post_type ?? get_post_type();
    $is_use_get_method  = $query['is_use_get_method'] ?? true;
    $paged              = !$is_use_get_method ? 1 : ($limit == -1 ? 1 : intval($query['page_number'] ?? 1));

    $args = [
        'post_type'         => $post_type,
        'paged'             => $paged,
        'posts_per_page'    => $limit,
        'post_status'       => $status,
        'orderby'           => ['menu_order' => 'ASC', $orderby => $sort, 'ID' => 'ASC']
    ];

    if (is_array($args['orderby'])) unset($args['order']);

    $tax_query = [];

    foreach ($query as $k => $v) {
        if (!in_array($k, ['category', 'keyword', 'industry', 'genre']) || $v == '') continue;

        $taxonomy = $post_type . '-' . $k;
        $taxonomy = $k == 'keyword' ? ($post_type . '-tag') : $taxonomy;
        $taxonomy = $k == 'genre' ? ($post_type . '-industry') : $taxonomy;

        $v = (array) $v;

        $tax_query[] = [
            'taxonomy' => $taxonomy,
            'field' => 'term_id',
            'terms' => [$v[0]],
            'operator' => 'IN',
            'include_children' => isset($v['include_children']) ? $v['include_children'] : false
        ];
    }

    if ($tax_query) {
        if (count($tax_query) > 1) $tax_query['relation'] = 'AND';
        $args['tax_query'] = $tax_query;
    }

    //テキスト検索
    if ($is_use_get_method && isset($_GET['keyword']) && $_GET['keyword'] != '')
        $args['s'] = $_GET['keyword'];

    // meta query
    if (isset($query['meta_query']) && !empty($query['meta_query']))
        $args['meta_query'] = $query['meta_query'];

    // more
    if (isset($query['more']) && !empty($query['more']))
        $args = array_merge($args, $query['more']);

    // preview
    if ($is_use_get_method && isset($_GET['post___id']) && isset($_GET['post___type']) && ($_GET['post___type'] == $args['post_type']) && isset($_GET['preview']) && $_GET['preview'] == 'true') {
        $args['post_status']    = 'any';
        $args['post__in']       = (array) $_GET['post___id'];
    }

    return $get_posts ? get_posts($args) : new WP_Query($args);
}


//SNSシェアリンク
function create_social_share_links()
{
    $shareText = 'シェアします'; //シェアしたい内容
    $shareUrl = get_permalink(); //シェアしたいURL

    // Twitter
    $aryTwitter = [];
    $aryTwitter['text'] = $shareText;
    $aryTwitter['url'] = $shareUrl;
    $aryTwitter['hashtags'] = "";
    $twitter_url = 'https://twitter.com/share?' . http_build_query($aryTwitter);

    // Facebook
    $aryFacebook = [];
    $aryFacebook['u'] = $shareUrl;
    $Facebook_url = 'http://www.facebook.com/share.php?' . http_build_query($aryFacebook);

    // LINE
    $aryLine = [];
    $aryLine['url'] = $shareUrl;
    $aryLine['text'] = $shareText;
    $LineLink = '//social-plugins.line.me/lineit/share?' . http_build_query($aryLine);

    echo '<div class="soci">
     <p class="soci-text">この記事をSNSでシェアする</p>
     <ul class="soci-list">
         <li><a class="fa fa-twiter" href="' . $twitter_url . '" target="_blank">Twiter</a></li>
         <li><a class="fa fa-facebook" href="' . $Facebook_url . '" target="_blank">Facebook</a></li>
         <li><a class="fa fa-line" href="' . $LineLink . '" target="_blank">Line</a></li>
     </ul>
    </div>';
}


//pagination
function custom_pagination($data, $slug, $range = 2)
{
    $current_page = max(1, @$_GET['page_number']);
    $total_pages = $data->max_num_pages;

    if ($total_pages == '' || $total_pages == 0) {
        global $wp_query;
        $total_pages = $wp_query->max_num_pages;
        if (!$total_pages) $total_pages = 1;
    }
    if ($total_pages == 1) return;
    $path = 'includes/front/parts/pagination';

    get_template_part($path, null, ['total' => $total_pages, 'current' => $current_page, 'range' => $range, 'slug' => $slug, 'eslip' => false, 'start' => false, 'end' => false]);
}


// get parent taxonomy
function get_temp_parent_1st($id, $taxonomy)
{
    $terms = get_term($id, $taxonomy);
    if (empty($terms)) return [];

    if ($terms->parent != 0)
        $terms = get_temp_parent_1st($terms->parent, $taxonomy);

    return $terms;
}


function get_list_taxomomy($taxonomy, $parent = 0, $orderby = 'term_id', $sort = 'ASC', $options = [])
{
    return get_terms(array_merge([
        'taxonomy'      => $taxonomy,
        'parent'        => $parent,
        'hide_empty'    => false,
        'orderby'       => $orderby,
        'order'         => $sort,
    ], $options));
}


// ページ内の「内容」からテキスト抜き出し　100字程度
function get_char_by_number($text, $max = 100, $cut = false)
{
    preg_match_all('/<p(.*?)>(.*?)<\/p>/', $text, $matches);
    $plaintext = '';

    if (isset($matches[2]) && !empty($matches[2])) {
        foreach ($matches[2] as $pText) {
            if ($pText && $pText != '') {
                $plaintext = $pText;
                break;
            }
        }
    }
    $plaintext = wp_strip_all_tags($plaintext);
    return $cut ? wp_trim_words($plaintext, $max, '') : $plaintext;
}


// get description
function get_description_of_post($post_id, $default = null)
{
    $_description_ = get_post_meta($post_id, 'the_page_meta_description', true);
    if (!$_description_) {
        if ($default) $_description_ = $default;
        else {
            $text = get_post_field('post_content', $post_id);
            $_description_ = get_char_by_number($text);
        }
    }
    return $_description_;
}


// get description
function get_title_of_post($post_id)
{
    $_title_ = get_post_meta($post_id, 'the_page_seo_title', true);
    if (!$_title_) $_title_ = get_post_field('post_title', $post_id);
    return $_title_;
}


function getYoutubeId($url)
{
    $parts = parse_url($url);
    if (isset($parts['host'])) {
        $host = $parts['host'];
        if (
            false === strpos($host, 'youtube') &&
            false === strpos($host, 'youtu.be')
        ) {
            return false;
        }
    }
    if (isset($parts['query'])) {
        parse_str($parts['query'], $qs);
        if (isset($qs['v'])) {
            return $qs['v'];
        } else if (isset($qs['vi'])) {
            return $qs['vi'];
        }
    }
    if (isset($parts['path'])) {
        $path = explode('/', trim($parts['path'], '/'));
        return $path[count($path) - 1];
    }
    return false;
}


// イベント情報開催期間条件
function get_event_date_conditions($y, $m, $conditions_steps = 1)
{
    $strtotime  = strtotime($y . '-' . $m . '-1');
    $start      = date('Y-m-01', $strtotime);
    $end        = date('Y-m-t', $strtotime);

    $result = [
        [
            'key'       => 'publish_date',
            'value'     => [$start, $end],
            'compare'   => 'BETWEEN',
            'type'      => 'DATE'
        ]
    ];
    $result = $conditions_steps == 2 ? [
        [
            'key'       => 'expire_date',
            'value'     => $start,
            'compare'   => '>=',
            'type'      => 'DATE'
        ],
        [
            'key'       => 'publish_date',
            'value'     => '',
            'compare'   => '=',
        ]
    ] : $result;

    $result = $conditions_steps == 3 ? [
        'relation'      => 'AND',
        [
            'key'       => 'publish_date',
            'value'     => $start,
            'compare'   => '<',
            'type'      => 'DATE'
        ],
        [
            'relation'      => 'OR',
            [
                'key'       => 'expire_date',
                'value'     => '',
                'compare'   => '=',
            ],
            [
                'key'       => 'expire_date',
                'value'     => $start,
                'compare'   => '>=',
                'type'      => 'DATE'
            ]
        ]
    ] : $result;
    return $result;
}


function format_datetime_by_string($string_datetime = 'now', $format = 'Y/m/d H:i:s')
{
    $obj_datetime = new DateTime($string_datetime);
    if (@$obj_datetime) return $obj_datetime->format($format);
    return $string_datetime;
}


function is_dev()
{
    return (strpos($_SERVER['HTTP_HOST'], 'test') !== false ||
        strpos($_SERVER['HTTP_HOST'], 'caters') !== false ||
        strpos($_SERVER['HTTP_HOST'], 'local') !== false ||
        strpos($_SERVER['HTTP_HOST'], 'localhost') !== false ||
        WP_DEBUG);
}


function is_local()
{
    return (strpos($_SERVER['HTTP_HOST'], 'local') !== false ||
        strpos($_SERVER['HTTP_HOST'], 'localhost') !== false);
}


function isAjaxRequest()
{
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
        strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}


function get_next_back($post)
{
    $allPosts = getListAll(get_post_type($post), -1, [], true);
    [$prev, $next] = [null, null];
    foreach ($allPosts as $i => $p) {
        if ($p->ID == $post->ID) {
            if (isset($allPosts[$i + 1])) $next = $allPosts[$i + 1];
            if (isset($allPosts[$i - 1])) $prev = $allPosts[$i - 1];
        }
    }
    return [$prev, $next];
}


function preventGarbledCharacters($bigText, $width = 249)
{
    $pattern = "/(.{1,{$width}})(?:\\s|$)|(.{{$width}})/uS";
    $replace = '$1$2' . "\n";
    $wrappedText = preg_replace($pattern, $replace, $bigText);
    return $wrappedText;
}


function renderUrlLang()
{
    if (is_admin()) return;
    $request_uri = trim($_SERVER['REQUEST_URI'], '/');
    $parts = explode('/', $request_uri);

    if (isset($parts[0]) && $parts[0] == 'en') {
        unset($parts[0]);
        return '/' . implode('/', $parts);
    } else {
        return '/en/' . implode('/', $parts);
    }
}


/**
 * 文字列のフォーマット（可変引数版）
 * 例: $url = '/news/update/{0}/{1}';
 * echo str_format($url, 123, 'test');
 * 出力: /news/update/123/test
 */
function str_format($string, ...$args)
{
    $formatted = $string;
    foreach ($args as $i => $value) {
        $formatted = preg_replace('/\{' . $i . '\}/i', $value, $formatted);
    }
    return $formatted;
}


/**
 * 文字列のフォーマット（連想配列版）
 * 例: $url = '/news/update/{category_slug}/{id}';
 * echo str_format_assoc($url, ['category_slug' => 'event', 'id' => 456]);
 * 出力: /news/update/event/456
 */
function str_format_assoc($string, $args = [])
{
    $formatted = $string;
    foreach ($args as $key => $value) {
        $formatted = str_replace('{' . $key . '}', $value, $formatted);
    }
    return $formatted;
}


add_filter('template_include', function ($template) {
    if (is_admin()) return $template;
    global $wp_query;

    // ページ用
    if (is_page()) {
        $slug   = get_post_field('post_name', get_post());
        $custom = locate_template("pages/{$slug}.php");
        if ($custom)
            return $custom;

        $page = locate_template("pages/page.php");
        if ($page)
            return $page;
    }

    // 投稿タイプ単体用
    if (is_single()) {
        $post_type = get_post_type() ?: $wp_query->query_vars['post_type'];
        $custom    = locate_template("singles/{$post_type}.php");
        if ($custom)
            return $custom;

        $single = locate_template("singles/single.php");
        if ($single)
            return $single;
    }

    // アーカイブ用
    if (is_archive()) {
        $post_type = get_post_type() ?: $wp_query->query_vars['post_type'];
        $custom    = locate_template("archives/{$post_type}.php");
        if ($custom)
            return $custom;

        $archive = locate_template("archives/archive.php");
        if ($archive)
            return $archive;
    }

    // タクソノミー用
    if (is_tax()) {
        $taxonomy = get_queried_object()->taxonomy ?? null;
        if ($taxonomy) {
            $custom = locate_template("taxonomies/{$taxonomy}.php");
            if ($custom)
                return $custom;
        }

        $taxonomy_tpl = locate_template("taxonomies/taxonomy.php");
        if ($taxonomy_tpl)
            return $taxonomy_tpl;
    }


    return $template;
    // $request_uri = trim($_SERVER['REQUEST_URI'], '/');
    // $parts = explode('/', $request_uri);

    // $post = get_post();
    // if ($post && $post->post_status !== 'publish' && (!isset($_GET['preview']) || $_GET['preview'] != 'true')) return get_404_template();

    // if (count($parts) < 3 || $parts[0] !== 'en' || !in_array($parts[1], [NEWS])) return $template;

    // $lang       = $parts[0];
    // $post_type  = $parts[1];
    // $slug       = $parts[2];

    // $post = get_page_by_path($slug, OBJECT, $post_type);

    // if ($post && $post->post_status !== 'publish' && (!isset($_GET['preview']) || $_GET['preview'] != 'true')) return get_404_template();

    // if ($post) {

    //     global $wp_query;
    //     $wp_query->queried_object    = $post;
    //     $wp_query->queried_object_id = $post->ID;
    //     $wp_query->is_single         = true;
    //     $wp_query->is_singular       = true;
    //     $wp_query->is_home           = false;
    //     $wp_query->is_404            = false;

    //     $new_template = locate_template("single-{$lang}-{$post_type}.php");
    //     if ($new_template) return $new_template;
    // } else {
    //     // return get_404_template();
    //     return $template;
    // }
});


/**
 * ランダムな文字列を生成する
 *  
 */
function random_string($length = 10)
{
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';

    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[random_int(0, $charactersLength - 1)];
    }

    return $randomString;
}


// ACF　custom field
add_filter('acf/fields/wysiwyg/toolbars', 'my_toolbars');
function my_toolbars($toolbars)
{
    // https://www.advancedcustomfields.com/resources/customize-the-wysiwyg-toolbars/
    $toolbars['Basic']      = [];
    $toolbars['Basic'][1]   = ['fontsizeselect', 'bold', 'italic', 'underline', 'forecolor', 'link'];
    return $toolbars;
}


function custom_tiny_mce_settings($initArray)
{
    $sizes = range(8, 50);
    $initArray['fontsize_formats'] = implode(' ', array_map(fn($size) => "{$size}pt", $sizes));
    return $initArray;
}
add_filter('tiny_mce_before_init', 'custom_tiny_mce_settings');
// ACF　custom field


function getListIDCopy($post_type)
{
    // Copyされた記事
    $options = [
        'meta_query'     => [
            [
                'key'     => '_dp_original',
                'compare' => 'EXISTS',
            ]
        ],
        'is_use_get_method' => false
    ];
    $allCopyDatas           = getListAll($post_type, -1, $options, true);

    return array_map(function ($data) {
        return get_post_meta($data->ID, '_dp_original', true);
    }, $allCopyDatas);
}


// ファイル自動生成を停止する設定
add_filter('big_image_size_threshold', '__return_false');

add_action('init', function () {
    // logs
    set_error_handler('custom_theme_error_logger');
    register_shutdown_function('custom_theme_fatal_logger');

    // image size
    remove_image_size('thumbnail');
    remove_image_size('medium');
    remove_image_size('medium_large');
    remove_image_size('large');
    remove_image_size('1536x1536');
    remove_image_size('2048x2048');

    // 公開日時を過ぎた投稿を公開状態に変更
    pubMissedPosts();
});


add_action('after_setup_theme', function () {
    add_image_size('thumbnail', 150, 150, true);
});


add_filter('intermediate_image_sizes_advanced', function ($sizes) {
    return ['thumbnail' => $sizes['thumbnail']];
}, 999);
//


function replace_bullet($text)
{
    $text = str_replace("\r\n", "\n", $text);
    $pattern = '/(^|\n)・/u';
    $replacement = '$1<span>・</span>';

    return preg_replace($pattern, $replacement, $text);
}


// 投稿予約
function pubMissedPosts()
{
    $now = new DateTime('now');
    $posts = getListAll([NEWS], -1, ['is_use_get_method' => false], true, 'future');
    if (empty($posts)) return;

    foreach ($posts as $post) {
        $post_date = new DateTime($post->post_date_gmt);
        if ($post_date <= $now) {
            // 投稿を公開状態に変更
            wp_publish_post($post->ID);
        }
    }
}
