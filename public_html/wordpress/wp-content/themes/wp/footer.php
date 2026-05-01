<?php extract($args); ?>

<?php get_template_part('includes/front/footer'); ?>

<?php foreach ((array)($__script__ ?? []) as $script) echo $script; ?>
</body>

</html>