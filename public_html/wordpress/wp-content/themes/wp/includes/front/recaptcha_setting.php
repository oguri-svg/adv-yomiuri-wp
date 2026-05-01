<?php if (get_field('settings_recaptcha_settings_recaptcha_secret_key') && get_field('settings_recaptcha_settings_recaptcha_key')): ?>
    <script src="https://www.google.com/recaptcha/api.js?render=<?= get_field('recaptcha_key') ?> "></script>
    <script>
        var __Key__ = '<?= get_field('recaptcha_key') ?>';
    </script>
<?php endif ?>