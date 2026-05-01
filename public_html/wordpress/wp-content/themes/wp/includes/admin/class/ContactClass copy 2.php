<?php
require_once 'ValidateForm.php';

class ContactsClass
{

    /**
     * お問い合わせ
     * フォームのバリデーションのルール設定
     */
    use ValidateForm;


    private $key;
    private $api_key;
    private $secret;

    public $confirm = 'confirm';
    public $complete = 'complete';

    public $dataForm = [
        'name' => [
            ['rule' => 'notEmpty', 'message' => '必須項目'],
            ['rule' => 'minLength', 'message' => '2文字以上からご入力してください', 'value' => 2],
            ['rule' => 'maxLength', 'message' => '100文字以内でご入力してください', 'value' => 100],
        ],
        'katakana' => [
            ['rule' => 'notEmpty', 'message' => '必須項目'],
            ['rule' => 'minLength', 'message' => '2文字以上からご入力してください', 'value' => 2],
            ['rule' => 'maxLength', 'message' => '100文字以内でご入力してください', 'value' => 100],
            ['rule' => 'katakana', 'message' => 'カタカナでご入力してください'],
        ],
        'hiragana' => [
            ['rule' => 'notEmpty', 'message' => '必須項目'],
            ['rule' => 'minLength', 'message' => '2文字以上からご入力してください', 'value' => 2],
            ['rule' => 'maxLength', 'message' => '100文字以内でご入力してください', 'value' => 100],
            ['rule' => 'hiragana', 'message' => 'ひらがなでご入力してください'],
        ],
        'email' => [
            ['rule' => 'notEmpty', 'message' => '必須項目'],
            ['rule' => 'minLength', 'message' => '5文字以上からご入力してください', 'value' => 5],
            ['rule' => 'maxLength', 'message' => '100文字以内でご入力してください', 'value' => 100],
            ['rule' => 'email', 'message' => 'メールアドレスが正しくありません。'],
        ],
        'postcode' => [
            ['rule' => 'notEmpty', 'message' => '必須項目'],
            ['rule' => 'postcode', 'message' => '郵便番号が正しくありません。'],
        ],
        'fileAttach' => [
            ['rule' => 'notEmptyFile', 'message' => '必須項目'],
            ['rule' => 'fileSize', 'message' => 'ファイルサイズが大きすぎます。', 'value' => 2 * 1024 * 1024], // 5MB
            ['rule' => 'fileType', 'message' => 'ファイル形式が正しくありません。', 'value' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx']],
        ],
        'agree' => [
            ['rule' => 'notEmpty', 'message' => '同意してください'],
            ['rule' => 'agree', 'message' => '同意してください'],
        ],
    ];


    /**
     * お問い合わせ
     * コンストラクタ
     */

    public function __construct()
    {
        $this->key      = get_option(CONTACT_SETTING . 'recaptcha_key', '');
        $this->secret   = get_option(CONTACT_SETTING . 'recaptcha_secret', '');

        // 本サーバーの場合、コメントアウトをする
        if (is_local())
            // DOCKER利用の設定
            add_action('phpmailer_init', [$this, 'phpmailer_init']);
    }

    /**
     * お問い合わせ
     * メール送信
     * @param array $data
     * @return void
     */

    public function send_mail($data)
    {
        $subject_admin  = 'お問い合わせがありました。';
        $subject        = $data['name'] . '様、お問い合わせありがとうございます。';

        $message    = sprintf(__("以下の内容でお問い合わせを受け付けました。\n\n"))
            . sprintf(__("お名前: %s\n"), $data['name'] ?? '')
            . sprintf(__("メール: %s\n"), $data['email'] ?? '')
            . sprintf(__("郵便番号: %s\n"), $data['postcode'] ?? '')
            . sprintf(__("カタカナ: %s\n"), $data['katakana'] ?? '')
            . sprintf(__("ひらがな: %s\n"), $data['hiragana'] ?? '')
            . sprintf(__("ファイル添付: %s\n"), $data['fileAttach']['name'] ?? '')
            . sprintf(__("お問い合せ内容:\n"))
            . sprintf("%s", $data['message'] ?? '') . "\n";

        $to             = $data['email'];
        $headers        = [
            'Content-Type: text/plain; charset=UTF-8',
            'From: CATERS <' . $this->set_mail_from() . '>',
            'Reply-To: CATERS <' . $this->set_mail_from() . '>',
            'Message-ID: <' . uniqid() . '@caters.co.jp>',
            'Return-Path: ' . $this->set_mail_to(),
            'X-Mailer: PHP/' . phpversion(),
        ];

        $attachments    = [$data['fileAttach']['name'] => $data['fileAttach']['path']];
        // 管理者へ
        wp_mail($this->set_mail_to(), $subject_admin, $message, $headers, $attachments);
        // ユーザーへ
        wp_mail($to, $subject, $message, $headers, $attachments);
    }

    /**
     * お問い合わせ
     * 送信元のメールアドレスを設定
     * @return string
     */

    public function set_mail_from()
    {
        // テスト環境の場合は開発者にメールを送信 
        return is_dev() ? 'develop@caters.co.jp' : 'recipient@example.com';
    }

    /**
     * お問い合わせ
     * 送信先のメールアドレスを設定
     * @return string
     */

    public function set_mail_to()
    {
        // テスト環境の場合は開発者にメールを送信 
        return is_dev() ? 'develop@caters.co.jp' : 'recipient@example.com';
    }

    /**
     * お問い合わせ
     * データベースに保存
     * @param array $data
     * @return void
     */

    public function save_contact_form_data($data)
    {
        $post_id = wp_insert_post([
            'post_title'    => $data['name'],
            'post_content'  => $data['message'],
            'post_type'     => CONTACT,
            'post_status'   => 'publish',
        ]);

        if ($post_id) {
            update_post_meta($post_id, CONTACT . '_email', $data['email']);
            update_post_meta($post_id, CONTACT . '_postcode', $data['postcode']);
            update_post_meta($post_id, CONTACT . '_katakana', $data['katakana']);
            update_post_meta($post_id, CONTACT . '_hiragana', $data['hiragana']);
            update_post_meta($post_id, CONTACT . '_fileAttach', $data['fileAttach']);
        }
    }

    /**
     * お問い合わせ
     * 管理画面のお問い合わせ編集画面にメタボックスの内容を表示
     * 
     * @param WP_Post $post
     * @return void
     */

    public function show_contact_metabox($post)
    {
        $email      = esc_html(get_post_meta($post->ID, CONTACT . '_email', true));
        $katakana   = esc_html(get_post_meta($post->ID, CONTACT . '_katakana', true));
        $hiragana   = esc_html(get_post_meta($post->ID, CONTACT . '_hiragana', true));
        $postcode   = esc_html(get_post_meta($post->ID, CONTACT . '_postcode', true));

        echo '<label>カタカナ:</label> <input name="' . CONTACT . '_katakana" type="text" value="' . $katakana . '" />';
        echo '<label>ひらがな:</label> <input name="' . CONTACT . '_hiragana" type="text" value="' . $hiragana . '" />';
        echo '<label>郵便番号:</label> <input name="' . CONTACT . '_postcode" type="text" value="' . $postcode . '" />';
        echo '<label>メールアドレス:</label> <input name="' . CONTACT . '_email" type="text" value="' . $email . '" />';
    }


    /**
     * お問い合わせ
     * 管理画面のお問い合わせ編集画面にメタボックスの内容を保存
     * 
     * @param int $post_id
     * @return void
     */

    public function save_contact_metabox($post_id)
    {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (isset($_POST[CONTACT . '_email'])) {
            update_post_meta($post_id, CONTACT . '_email', sanitize_text_field($_POST[CONTACT . '_email']));
        }

        if (isset($_POST[CONTACT . '_katakana'])) {
            update_post_meta($post_id, CONTACT . '_katakana', sanitize_text_field($_POST[CONTACT . '_katakana']));
        }

        if (isset($_POST[CONTACT . '_hiragana'])) {
            update_post_meta($post_id, CONTACT . '_hiragana', sanitize_text_field($_POST[CONTACT . '_hiragana']));
        }

        if (isset($_POST[CONTACT . '_postcode'])) {
            update_post_meta($post_id, CONTACT . '_postcode', sanitize_text_field($_POST[CONTACT . '_postcode']));
        }
    }


    /** -----------------------------------------------------------------------------------------------------以下の設定を触らないでください------------------------------------------------------------------------------------------------------- */


    /**
     * お問い合わせ
     * フォームのバリデーション
     * @return array
     */

    public function validateForm()
    {
        $errors = [];
        foreach ($this->dataForm as $field => $rules) {
            if (!isset($_POST[$field]) && !isset($_FILES[$field])) continue;

            foreach ($rules as $rule) {
                if ($this->{$rule['rule']}($_POST[$field] ?? $_FILES[$field], $rule['value'] ?? null)) continue;
                if (!isset($errors[$field])) $errors[$field] = $rule['message'];
            }
        }

        // reCAPTCHA v3
        if (get_option(CONTACT_SETTING . 'enable_recaptcha', 0) == 1) {
            if (!isset($_POST['recaptcha-v3']) || $_POST['recaptcha-v3'] === '') {
                $errors['recaptcha-v3'] = 'reCAPTCHAのアクセスに失敗しました。';
                return $errors;
            }

            $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
                'body' => [
                    'secret' => $this->secret,
                    'response' => $_POST['recaptcha-v3'],
                ],
            ]);

            $responseBody = json_decode(wp_remote_retrieve_body($response), true);


            if (empty($responseBody['success']))
                $errors['recaptcha-v3'] = '無効なreCAPTCHAシークレットキー。';
        }

        return $errors;
    }


    /**
     * お問い合わせ
     * フォームの送信処理
     * validationエラーがある場合はエラーをセットしてリダイレクト
     * @return void
     */

    public function handle_contact_form_submission()
    {

        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['contact_submit'])) {

            $redirect = '/' . CONTACT . '/' . $this->confirm . '/';
            $errors = $this->validateForm();


            if (isAjaxRequest()) {
                echo json_encode($errors);
                exit;
            }

            $data = $_POST;
            // attachments
            $data = $this->upload_file($data);

            $_SESSION[CONTACT . '_data'] = $data;

            if (!empty($errors)) {
                $_SESSION[CONTACT . '_errors'] = $errors;
                $redirect = '/' . CONTACT . '/';
            }
            wp_redirect($redirect);
            exit;
        }
    }


    /**
     * お問い合わせ
     * 確認画面の送信処理
     * @return void
     */

    public function handle_contact_form_confirm()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['confirm_submit'])) {

            $data = $_SESSION[CONTACT . '_data'] ?? [];
            if (!$data) wp_redirect('/' . CONTACT . '/');

            // データベースに保存
            $this->save_contact_form_data($data);

            // メール送信
            $this->send_mail($data);
            wp_redirect('/' . CONTACT . '/' . $this->complete . '/');
            exit;
        }
    }


    /**
     * お問い合わせ
     * ファイルのアップロード処理
     * @return void
     */

    public function upload_file($data)
    {
        // 添付ファイルの処理
        if (empty($_FILES['fileAttach'])) return;
        if (isset($_FILES['fileAttach']) && $_FILES['fileAttach']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = wp_upload_dir();

            $new_name   = uniqid() . '_' . basename($_FILES['fileAttach']['name']);
            $file_path  = $upload_dir['path'] . '/' . $new_name;

            if (move_uploaded_file($_FILES['fileAttach']['tmp_name'], $file_path)) {

                $data['fileAttach'] = [
                    'path'      => $file_path,
                    'url'       => $upload_dir['url'] . '/' . $new_name,
                    'name'      => basename($_FILES['fileAttach']['name']),
                    'new_name'  => $new_name,
                ];
            }
        }
        return $data;
    }

    /**
     * お問い合わせ
     * 確認画面・完了画面のテンプレートを設定
     * 
     * @param string $template
     * @return string
     */

    public function set_template_include($template)
    {
        $path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
        $uri  = explode('/', $path);

        if (
            isset($uri[0]) &&
            isset($uri[1]) &&
            $uri[0] == CONTACT &&
            in_array($uri[1], [$this->confirm, $this->complete])
        ) {

            // お問い合わせフォームのデータがない場合はリダイレクト
            if (!isset($_SESSION[CONTACT . '_data'])) {
                wp_redirect('/' . CONTACT . '/');
                exit;
            }

            //
            if ($uri[1] == $this->complete) {
                unset($_SESSION[CONTACT . '_data']);
                unset($_SESSION[CONTACT . '_errors']);
            }

            $new_template = get_template_directory() . '/archive-contact-' .  $uri[1] . '.php';
            if (file_exists($new_template)) return $new_template;
        }
        return $template;
    }


    /**
     * お問い合わせ
     * メール送信設定
     * 
     * @param PHPMailer $phpmailer
     * @return void
     */

    public function phpmailer_init($phpmailer)
    {
        $phpmailer->isSMTP();
        $phpmailer->Host = 'email';
        $phpmailer->Port = 1025;
    }

    /**
     * お問い合わせ
     * 管理画面のカラムを追加
     * 
     * @param array $columns
     * @return array
     */


    public function add_contact_columns($columns)
    {
        $columns[CONTACT . '_email'] = 'メールアドレス';
        return $columns;
    }

    /**
     * お問い合わせ
     * 管理画面のカラムにデータを表示
     * 
     * @param string $column
     * @param int $post_id
     * @return void
     */

    public function show_contact_columns($column, $post_id)
    {
        if ($column == CONTACT . '_email') {
            echo esc_html(get_post_meta($post_id,  CONTACT . '_email', true));
        }
    }

    /**
     * お問い合わせ
     * 管理画面のお問い合わせ編集画面にメタボックスを追加
     * 
     * @return void
     */

    public function add_contact_metabox()
    {
        add_meta_box(
            CONTACT . '_metabox',
            'お問い合わせ情報',
            [$this, 'show_contact_metabox'],
            CONTACT,
            'normal',
            'high'
        );
    }


    public function log_mailer_errors($wp_error)
    {
        $fn = ABSPATH . '/mail.log';
        $fp = fopen($fn, 'a');
        fputs($fp, "Mailer Error: " . $wp_error->get_error_message() . "\n");
        fclose($fp);
    }


    /**
     * お問い合わせ
     * クラスの初期化
     */

    public static function init()
    {
        $instance = new self();

        // テンプレートの設定
        if ($temp = $instance->set_template_include(null)) {
            add_filter('template_include', fn($_) => $temp);
        }

        add_action('init', [$instance, 'handle_contact_form_submission']);
        add_action('init', [$instance, 'handle_contact_form_confirm']);

        // 管理画面のお問い合わせ一覧にメールアドレスを表示
        add_filter('manage_edit-contact_columns', [$instance, 'add_contact_columns']);
        add_filter('manage_contact_posts_custom_column', [$instance, 'show_contact_columns'], 10, 2);

        // 管理画面のお問い合わせ編集画面にメタボックスを追加
        add_action('add_meta_boxes', [$instance, 'add_contact_metabox']);
        add_action('save_post', [$instance, 'save_contact_metabox']);

        // Log
        add_action('wp_mail_failed', [$instance, 'log_mailer_errors'], 10, 1);
    }
}

new ContactClass();
ContactClass::init();
