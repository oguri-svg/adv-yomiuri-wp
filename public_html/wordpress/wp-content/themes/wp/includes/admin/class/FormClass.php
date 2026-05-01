<?php

include_once 'ValidateForm.php';


class FormClass
{

    /**
     * フォームのバリデーションのルール設定
     */
    use ValidateForm;


    private $api_key;
    public $key;
    public $secret;

    public $slug;
    public $page_title;

    public $confirm             = 'confirm';
    public $complete            = 'complete';

    public $dataForm            = [];
    public $dataFormValidate    = [];
    public $filenames           = [];
    public $options             = [];

    public $fieldEmailName = 'email';

    /**
     * コンストラクタ
     */

    public function __construct()
    {
        // 本サーバーの場合、コメントアウトをする
        if (is_local())
            // DOCKER利用の設定
            add_action('phpmailer_init', [$this, 'phpmailer_init']);
    }


    /**
     * メールテンプレートの読み込み
     * @param string $filename
     * @param array $data
     * @return string
     */

    private function load_email_template($filename, $data = [])
    {
        foreach ($this->filenames as $inputFileName) {
            if (isset($data[$inputFileName]['name']))
                $data[$inputFileName] = $data[$inputFileName]['name'];
        }

        $path = locate_template('forms/' . $this->slug . '/email/' . $filename . '.txt');
        if (!is_file($path)) throw new Exception(str_format('メールテンプレートが見つかりません: {0}', $path));
        return str_format_assoc(file_get_contents($path), $data);
    }


    /**
     * メール送信
     * @param array $data
     * @return void
     */

    public function sendmail($data, $options = [])
    {
        $options = $options ?: $this->options;
        if (empty($options)) return;

        $headers        = [
            'Content-Type: text/plain; charset=UTF-8',
            'From: ' . $options['from'],
            'Reply-To: ' . ($options['replyTo'] ?? $options['from'])
        ];

        $attachments    = [];
        foreach ($this->filenames as $inputFileName) {
            if (!isset($data[$inputFileName]['name']) || !isset($data[$inputFileName]['path'])) continue;
            $attachments[$data[$inputFileName]['name']] = $data[$inputFileName]['path'];
        }

        // 管理者へ
        wp_mail(
            $options['to'],
            $options['subject_admin'],
            $this->load_email_template('admin', $data),
            $headers,
            $attachments,
            "-f{$options['from']}"
        );

        // ユーザーへ
        wp_mail(
            $data[$this->fieldEmailName],
            $options['subject'],
            $this->load_email_template('user', $data),
            $headers,
            $attachments,
            "-f{$options['from']}"
        );
    }


    /**
     * 送信元のメールアドレスを設定
     * @return string
     */

    public function set_mail_from($from = null)
    {
        // テスト環境の場合は開発者にメールを送信 
        return empty($from) ? 'CATERS <develop@caters.co.jp>' : $from;
    }


    /**
     * 送信先のメールアドレスを設定
     * @return string
     */

    public function set_mail_to($to = null)
    {
        // テスト環境の場合は開発者にメールを送信 
        return empty($to) ? 'develop@caters.co.jp' : $to;
    }


    /**
     * データベースに保存
     * @param array $data
     * @return void
     */

    public function save_form_data($data)
    {
        foreach ($data as $k => $v) {
            if (is_string($v)) {
                $v = wp_unslash($v);
                $v = str_replace(["\r\n", "\r"], "\n", $v);
                $data[$k] = $v;
            }
        }

        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        $json = str_replace('\\n', '\\\\n', $json);

        wp_insert_post([
            'post_title'    => $this->page_title,
            'post_content'  => $json,
            'post_type'     => $this->slug,
            'post_status'   => 'publish',
        ]);
    }


    /**
     * 管理画面のお問い合わせ編集画面にメタボックスの内容を表示
     * 
     * @param WP_Post $post
     * @return void
     */

    public function show_metabox($post)
    {
        $content    = get_post_field('post_content', $post);
        $data       = json_decode($content, true);

        $html = '<table class="form-table"><tbody>';
        foreach ($this->dataForm as $key => $name) {
            $a = '';
            if (in_array($key, $this->filenames)) {
                $a = str_format(
                    '<a href="{0}" target="_blank"><span class="dashicons dashicons-external"></span></a>',
                    esc_url($data[$key]['url'] ?? '#')
                );
                $data[$key] = $data[$key]['name'] ?? '';
            }

            $html .= str_format_assoc(
                '<tr style="border-bottom: 1px solid #ddd;">
                <th style="width: 150px; text-align: left;">{name}</th>
                <td><div style="border-left: 1px solid #ddd; padding-left: 10px;">{value} {a}</div></td>
                </tr>',
                [
                    'name'  => esc_html($name),
                    'value' => nl2br(esc_html($data[$key] ?? '')),
                    'a'     => $a,
                ]
            );
        }
        $html .= '</tbody></table>';

        echo $html;
    }


    /**
     * フォームのバリデーション
     * @return array
     */

    public function validateForm()
    {
        $errors = [];
        foreach ($this->dataFormValidate as $field => $rules) {
            if (!isset($_POST[$field]) && !isset($_FILES[$field])) continue;

            foreach ($rules as $rule) {
                if ($this->{$rule['rule']}($_POST[$field] ?? $_FILES[$field], $rule['value'] ?? null)) continue;
                if (!isset($errors[$field])) $errors[$field] = $rule['message'];
            }
        }

        // reCAPTCHA v3
        if ($this->key && $this->secret) {
            if (!isset($_POST['recaptcha-v3']) || $_POST['recaptcha-v3'] === '') {
                $errors['recaptcha-v3'] = 'reCAPTCHAのアクセスに失敗しました。';
                return $errors;
            }

            $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
                'body' => [
                    'secret'    => $this->secret,
                    'response'  => $_POST['recaptcha-v3'],
                ],
            ]);

            $responseBody = json_decode(wp_remote_retrieve_body($response), true);

            if (empty($responseBody['success']))
                $errors['recaptcha-v3'] = 'タイムアウトエラーの為、恐れ入りますが、もう一度ボタンをクリックしていただくか、ページの再読み込みをお願いします。';
        }

        return $errors;
    }


    /**
     * フォームの送信処理
     * validationエラーがある場合はエラーをセットしてリダイレクト
     * @return void
     */

    public function handle_form_submission()
    {

        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST[$this->slug . '_submit'])) {

            $redirect   = '/' . $this->slug . '/' . $this->confirm . '/';
            $errors     = $this->validateForm();


            if (isAjaxRequest()) {
                echo json_encode($errors);
                exit;
            }

            $data = $_POST;
            // attachments
            $data = $this->upload_file($data);

            $_SESSION[$this->slug . '_data'] = $data;

            if (!empty($errors)) {
                $_SESSION[$this->slug . '_errors'] = $errors;
                $redirect = '/' . $this->slug . '/';
            }
            wp_redirect($redirect);
            exit;
        }
    }


    /**
     * 確認画面の送信処理
     * @return void
     */

    public function handle_form_confirm()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST[$this->slug . '_confirm_submit'])) {

            $data = $_SESSION[$this->slug . '_data'] ?? [];
            if (!$data) wp_redirect('/' . $this->slug . '/');

            // データベースに保存
            $this->save_form_data($data);

            // メール送信
            $this->sendmail($data);
            wp_redirect('/' . $this->slug . '/' . $this->complete . '/');
            exit;
        }
    }


    /**
     * ファイルのアップロード処理
     * @return void
     */

    public function upload_file($data)
    {
        // 添付ファイルの処理
        foreach ($this->filenames as $filename) {
            if (empty($_FILES[$filename])) continue;
            if (isset($_FILES[$filename]) && $_FILES[$filename]['error'] === UPLOAD_ERR_OK) {
                $upload_dir = wp_upload_dir();

                $new_name   = uniqid() . '_' . basename($_FILES[$filename]['name']);
                $file_path  = $upload_dir['path'] . '/' . $new_name;

                if (move_uploaded_file($_FILES[$filename]['tmp_name'], $file_path)) {

                    $data[$filename] = [
                        'path'      => $file_path,
                        'url'       => $upload_dir['url'] . '/' . $new_name,
                        'name'      => basename($_FILES[$filename]['name']),
                        'new_name'  => $new_name,
                    ];
                }
            }
        }

        return $data;
    }


    /**
     * 確認画面・完了画面のテンプレートを設定
     * 
     * @param string $template
     * @return string
     */

    public function set_template_include($template = null)
    {
        $path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
        $uri  = explode('/', $path);

        if (
            isset($uri[0]) &&
            isset($uri[1]) &&
            $uri[0] == $this->slug &&
            in_array($uri[1], [$this->confirm, $this->complete])
        ) {

            // フォームのデータがない場合はリダイレクト
            if (!isset($_SESSION[$uri[0] . '_data'])) {
                wp_redirect('/' . $uri[0] . '/');
                exit;
            }

            //
            $_SESSION['slug'] = $this->slug;

            if ($uri[1] == $this->complete) {
                unset($_SESSION[$uri[0] . '_data']);
                unset($_SESSION[$uri[0] . '_errors']);
                unset($_SESSION['slug']);
            }

            $new_template = locate_template(('forms/' . $uri[0] . '/' .  $uri[1] . '.php'));
            if ($new_template) return $new_template;
        }

        return $template;
    }


    /**
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
     * 管理画面のカラムを追加
     * 
     * @param array $columns
     * @return array
     */


    public function add_email_columns($columns)
    {
        $columns[$this->slug . '_email'] = 'メールアドレス';
        return $columns;
    }


    /**
     * 管理画面のカラムにデータを表示
     * 
     * @param string $column
     * @param int $post_id
     * @return void
     */

    public function show_email_columns($column, $post_id)
    {
        if ($column == $this->slug . '_email') {
            $content = get_post_field('post_content', $post_id);
            $data = json_decode($content, true);
            echo esc_html($data[$this->fieldEmailName] ?? '');
        }
    }


    /**
     * 管理画面のお問い合わせ編集画面にメタボックスを追加
     * 
     * @return void
     */

    public function add_metabox()
    {
        add_meta_box(
            $this->slug . '_metabox',
            'フォーム情報',
            [$this, 'show_metabox'],
            $this->slug,
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
     * クラスの初期化
     */

    public function init()
    {
        // テンプレートの設定
        if ($temp = $this->set_template_include()) {
            add_filter('template_include', fn($_) => $temp);
        }

        add_action('init', [$this, 'handle_form_submission']);
        add_action('init', [$this, 'handle_form_confirm']);

        // 管理画面のフォーム一覧にメールアドレスを表示
        add_filter('manage_edit-' . $this->slug . '_columns', [$this, 'add_email_columns']);
        add_filter('manage_' . $this->slug . '_posts_custom_column', [$this, 'show_email_columns'], 10, 2);

        // 管理画面のフォーム編集画面に追加
        add_action('add_meta_boxes', [$this, 'add_metabox']);

        // Log
        add_action('wp_mail_failed', [$this, 'log_mailer_errors'], 10, 1);
    }
}
