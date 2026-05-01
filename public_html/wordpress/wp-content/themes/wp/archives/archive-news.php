<?php get_header(); ?>

<h2>お知らせ</h2>
<?php $posts = getListAll('news', -1, [], true); ?>
<?php foreach ($posts as $post): ?>
    <a href="<?= get_permalink($post->ID); ?>"><?= $post->post_title; ?></a><br>
<?php endforeach; ?>
<?php get_footer(); ?>