<?php
// フォーム実装
include_once get_parent_theme_file_path('/includes/admin/class/FormClass.php');

// フォームページの取得
$pages = getListAll('page', -1, ['meta_query' => [
    [
        'key'       => 'form-page',
        'value'     => 1,
    ]
]], true);

foreach ($pages as $page) {
    [$_slug, $label]    = [$page->post_name, $page->post_title];

    $settings = get_field('settings', $page->ID);

    $is_save_data = $settings['is_save_data'] ?? false;

    $__configs__ = [
        $_slug => [
            'label'             => $label,
            'public'            => false,
            'hierarchical'      => false,
            'has_archive'       => false,
            'show_in_rest'      => false,
            'show_ui'           => true,
            'show_in_menu'      => true,
            'show_in_nav_menus' => false,
            'show_in_admin_bar' => false,
            'supports'          => ['title'],
            'menu_icon'         => 'dashicons-buddicons-pm',
        ]
    ];

    if ($is_save_data) register_mpost_type($__configs__);

    $clsname = preg_split('/[^a-zA-Z0-9]+/', $_slug);
    $clsname = array_map('ucfirst', $clsname);
    $clsname            = implode('', $clsname) . 'Class';

    $path               = locate_template('includes/admin/class/' . str_format('{0}.php', $clsname));

    if (!is_file($path)) throw new Exception('クラスファイルが見つかりません: ' . $path);

    require_once $path;
    // クラス
    $cls = new $clsname();

    // メール設定
    $to             = $settings['form-settings']['admin-settings']['from-email'] ?: '';
    if (!empty($to)) {
        $to = explode(',', $to);
        $to = array_map('trim', $to);
    }
    $from           = $cls->set_mail_from($settings['form-settings']['from-email'] ?: null);

    $subject_admin  = $settings['form-settings']['admin-settings']['from-title'] ?: str_format('【{0}】がありました', $label);
    $subject        = $settings['form-settings']['user-settings']['to-title'] ?: str_format('【{0}】ありがとうございます', $label);
    $replyTo        = $settings['form-settings']['other-settings']['reply-to'] ?: $from;
    $emailFieldName = $settings['form-settings']['user-settings']['to-email-field'] ?: 'email';

    $cls->slug              = $_slug;
    $cls->fieldEmailName    = $emailFieldName;
    $cls->page_title        = str_format('{0} {1}', $label, date('Y年m月d日 H時i分'));
    $cls->options           = [
        'from'          => $from,
        'to'            => $cls->set_mail_to($to),
        'replyTo'       => $replyTo,
        'subject_admin' => $subject_admin,
        'subject'       => $subject
    ];
    // End：メール設定

    // URL設定
    $cls->confirm       = $settings['url_settings']['confirm_url'] ?: 'confirm';
    $cls->complete      = $settings['url_settings']['complete_url'] ?: 'complete';
    // End：URL設定

    // reCAPTCHAの設定
    $cls->key          = $settings['recaptcha_settings']['recaptcha_key'] ?: '';
    $cls->secret       = $settings['recaptcha_settings']['recaptcha_secret_key'] ?: '';
    // End：reCAPTCHAの設定

    // ファイル添付の設定
    $fileAttach     = $settings['form-settings']['other-settings']['file-attaches'] ?: '';
    if (!empty($fileAttach)) {
        $fileAttach = explode(',', $fileAttach);
        $fileAttach = array_map('trim', $fileAttach);
        if (!empty($fileAttach)) $cls->filenames = $fileAttach;
    }
    // End：ファイル添付の設定

    // 実装
    $cls->init();
}
