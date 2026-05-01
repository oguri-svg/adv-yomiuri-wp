<?php get_header(null, ['__css__' => [get_template_part('includes/front/recaptcha_setting')]]); ?>

<?php
$post = get_post();
$slug = $post->post_name;
// 固定
$errors     = $_SESSION[$slug . '_errors'] ?? [];
$data       = $_SESSION[$slug . '_data'] ?? [];
unset($_SESSION[$slug . '_errors']);
unset($_SESSION[$slug . '_data']);
// End：固定

?>
<div class="container p-4">
    <h2><?= esc_html($post->post_title) ?></h2>

    <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="<?= esc_attr($slug) ?>_submit" value="1">
        <div class="mb-3">
            <label for="exampleName" class="form-label">名前</label>
            <input type="text" name="name" class="form-control" id="exampleName" placeholder="名前" value="<?= esc_attr($data['name'] ?? '') ?>">
            <span class="error" style="color:red"><?= $errors['name'] ?? '' ?></span>
        </div>
        <div class="mb-3">
            <label for="exampleEmail" class="form-label">メールアドレス</label>
            <input type="text" name="email" class="form-control" id="exampleEmail" placeholder="メールアドレス" value="<?= esc_attr($data['email'] ?? '') ?>">
            <span class="error" style="color:red"><?= $errors['email'] ?? '' ?></span>
        </div>
        <div class="mb-3">
            <label for="exampleFile" class="form-label">ファイル添付:</label>
            <input type="file" class="form-control" id="exampleFile" name="fileAttach">
            <span class="error" style="color:red"><?= $errors['fileAttach'] ?? '' ?></span>
        </div>
        <div class="mb-3">
            <label for="exampleContent" class="form-label">お問い合せ内容:</label>
            <textarea name="message" id="exampleContent" class="form-control"><?= esc_textarea($data['message'] ?? '') ?></textarea>
            <span class="error" style="color:red"><?= $errors['message'] ?? '' ?></span>
        </div>
        <span class="form_submit btn btn-primary" data-post-type="<?= esc_attr($slug) ?>">確認画面へ</span>
    </form>
</div>

<?php get_footer(null, [
    '__script__' => [
        str_format(
            '<script src="{0}"></script>',
            get_stylesheet_directory_uri() . '/includes/front/assets/js/jquery-3.7.1.min.js'
        ),
        str_format(
            '<script src="{0}"></script>',
            get_stylesheet_directory_uri() . '/includes/front/assets/js/form.js'
        )
    ]
]); ?>