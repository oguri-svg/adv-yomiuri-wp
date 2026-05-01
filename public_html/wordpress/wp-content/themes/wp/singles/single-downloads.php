<?php get_header(); ?>
<h1><?= esc_html(the_title()) ?></h1>
<?php $post = get_post(); ?>

<?php $terms = wp_get_post_terms($post->ID, 'downloads-password'); ?>
<?php $passwords = array_map(function ($term) {
    return $term->name ?? '';
}, $terms); ?>

<?php if (empty($_POST['download_password']) || !in_array($_POST['download_password'], $passwords, true)): ?>
    <form method="post" action="<?= esc_url(get_permalink()); ?>">
        <input type="password" name="download_password" value="" placeholder="Password">
        <button type="submit">Download</button>
    </form>

    <?php $posts = getListAll('downloads', -1, ['more' => ['post_parent' => $post->ID]], true); ?>
    <?php foreach ($posts as $p): ?>
        <a href="<?= get_permalink($p->ID); ?>"><?= $p->post_title; ?></a><br>
    <?php endforeach; ?>

<?php else: ?>
    <?php the_content(); ?>
<?php endif; ?>
<?php get_footer(); ?>