<?php get_header(); ?>

<h2>PAGE</h2>
<?php $posts = getListAll('news', -1, [], true); ?>

<?php get_footer(); ?>