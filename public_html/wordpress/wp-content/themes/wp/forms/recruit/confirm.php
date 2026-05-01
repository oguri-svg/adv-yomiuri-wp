<?php get_header(null, ['__css__' => [get_template_part('includes/front/recaptcha_setting')]]); ?>

<?php
$slug = $_SESSION['slug'];
$data = $_SESSION[$slug . '_data'];
?>


<div class="container p-4">

    <h2>確認情報</h2>
    <table class="table table-striped table-hover">
        <tbody>
            <tr>
                <th scope="row">名前</th>
                <td><?= esc_html($data['name'] ?? '') ?></td>
            </tr>
            <tr>
                <th scope="row">メールアドレス</th>
                <td><?= esc_html($data['email'] ?? '') ?></td>
            </tr>
            <tr>
                <th scope="row">ファイル添付</th>
                <td><?= esc_html($data['fileAttach']['name'] ?? '') ?></td>
            </tr>
            <tr>
                <th scope="row">ファイル添付2</th>
                <td><?= esc_html($data['fileAttach2']['name'] ?? '') ?></td>
            </tr>
            <tr>
                <th scope="row">お問い合せ内容</th>
                <td><?= nl2br(esc_html($data['message'] ?? '')) ?></td>
            </tr>
        </tbody>
    </table>
    <form method="POST">
        <input type="hidden" name="<?= esc_attr($slug) ?>_confirm_submit" value="1">
        <a href="/<?= esc_attr($slug) ?>/" class="btn">← 前ページへ</a>
        <span class="confirm_submit btn btn-primary">送信</span>
    </form>
</div>

<?php get_footer(null, [
    '__script__' => [
        '<script src="/cms_assets/js/jquery-3.7.1.min.js"></script>',
        ('<script>
            $(function() {
                var isSubmit = false;
                $(".confirm_submit").on("click", function(e) {
                    e.preventDefault();
                    if (!isSubmit) {
                        isSubmit = true;
                        $("form").submit();
                    }
                });
            });
        </script>'),
    ]
]); ?>