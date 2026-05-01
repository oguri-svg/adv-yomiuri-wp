<?php get_header(); ?>
<?php $posts = getListAll('downloads', -1, ['more' => ['post_parent' => 0]], true); ?>
<?php foreach ($posts as $post): ?>
    <a href="<?= get_permalink($post->ID); ?>"><?= $post->post_title; ?></a><br>
<?php endforeach; ?>
<?php get_footer(); ?>