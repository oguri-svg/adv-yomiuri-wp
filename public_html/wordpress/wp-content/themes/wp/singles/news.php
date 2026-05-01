<?php get_header(); ?>

<div class="container p-4">
    <h2><?= esc_html(the_title()) ?></h2>
    <div class="wijiwig">
        <?php the_content(); ?>
    </div>
</div>

<?php get_footer(); ?>