<?php
extract($args);
$showitems = ($range * 2) + 1;
$query = $_GET ?? [];
?>

<ul class="paging">
    <?php $query['page_number'] = $current - 1; ?>
    <?php if ($current > 1): ?>
        <li class="prev"><a class="glyphs-arrow-btn" href="/<?= $slug ?>/?<?= http_build_query($query) ?>">&nbsp;</a></li>
    <?php endif ?>

    <?php
    $prev_range = $current >= ($total - $range) ? $total - ($range * 2) : $current - $range;
    $prev_range = $prev_range < 1 ? 1 : $prev_range;

    $next_range = $current <= $range + 1 ? $showitems : $current + $range;
    $next_range = $next_range > $total ? $total : $next_range;
    ?>

    <?php if ($start && $prev_range > 1) : ?>
        <?php $query['page_number'] = 1; ?>
        <li><a href="/<?= $slug ?>/?<?= http_build_query($query) ?>">1</a></li>
    <?php endif ?>

    <?php if ($eslip && $prev_range > 2) : ?>
        <li>...</li>
    <?php endif ?>

    <?php for ($i = $prev_range; $i <= $next_range; $i++) : ?>
        <?php $query['page_number'] = $i; ?>
        <li class="<?= $current == $i ? 'active' : '' ?>"><a href="/<?= $slug ?>/?<?= http_build_query($query) ?>"><?= $i ?></a></li>
    <?php endfor ?>

    <?php if ($eslip && ($next_range < $total - 1)) : ?>
        <li>...</li>
    <?php endif ?>

    <?php if ($end && $total > $showitems && ($current < $total - $range)) : ?>
        <?php $query['page_number'] = $total; ?>
        <li><a href="/<?= $slug ?>/?<?= http_build_query($query) ?>"><?= $total ?></a></li>
    <?php endif ?>

    <?php $query['page_number'] = $current + 1; ?>

    <?php if ($current < $total): ?>
        <li class="next"><a class="glyphs-arrow-btn" href="/<?= $slug ?>/?<?= http_build_query($query) ?>">&nbsp;</a></li>
    <?php endif ?>

</ul>