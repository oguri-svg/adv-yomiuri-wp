<?php

class TestClass extends FormClass
{
    public $dataForm = [
        'name'          => '氏名',
        'email'         => 'メールアドレス',
        'fileAttach'    => 'ファイル添付',
        'message'       => 'メッセージ'
    ];


    public $dataFormValidate = [
        'name' => [
            ['rule' => 'notEmpty', 'message' => '必須項目'],
            ['rule' => 'minLength', 'message' => '2文字以上からご入力してください', 'value' => 2],
            ['rule' => 'maxLength', 'message' => '100文字以内でご入力してください', 'value' => 100],
        ],
        'email' => [
            ['rule' => 'notEmpty', 'message' => '必須項目'],
            ['rule' => 'maxLength', 'message' => '100文字以内でご入力してください', 'value' => 100],
            ['rule' => 'email', 'message' => '正しいメールアドレスを入力してください'],
        ],
        'fileAttach' => [
            ['rule' => 'notEmptyFile', 'message' => '必須項目'],
            ['rule' => 'fileSize', 'message' => 'ファイルサイズが大きすぎます。', 'value' => 5 * 1024 * 1024], // 5MB
            ['rule' => 'fileType', 'message' => 'ファイル形式が正しくありません。', 'value' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx']],
        ],
        'message' => [
            ['rule' => 'maxLength', 'message' => '1000文字以内でご入力してください', 'value' => 1000],
        ]
    ];


    public function __construct()
    {
        parent::__construct();
    }


    /**
     * クラスの初期化
     */

    public function init()
    {
        parent::init();
    }
}
