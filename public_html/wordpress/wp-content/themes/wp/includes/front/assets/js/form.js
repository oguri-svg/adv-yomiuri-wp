function renderRecaptcha(key, formSubmit) {
    if (typeof grecaptcha === "undefined") {
        return;
    }

    formSubmit = formSubmit || false;

    grecaptcha.ready(() => {
        grecaptcha.execute(key, { action: "submit" }).then(function (token) {
            // check if input recaptcha-v3 exists
            var existingRecaptcha = document.querySelector(
                'input[name="recaptcha-v3"]'
            );
            if (existingRecaptcha) {
                // If it exists, update its value
                existingRecaptcha.value = token;

                if (formSubmit) {
                    const form = existingRecaptcha.closest("form");
                    if (form) $(form)[0].submit();
                }
                return;
            }
            var divRecaptchaResponse = document.createElement("div");
            var recaptchaResponse = document.createElement("input");
            var spanError = document.createElement("span");

            recaptchaResponse.type = "hidden";
            recaptchaResponse.name = "recaptcha-v3";
            recaptchaResponse.value = token;

            spanError.className = "error c-error__txt";
            spanError.style.color = "red";
            spanError.textContent = "";

            divRecaptchaResponse.className = "row-form__wrap";
            divRecaptchaResponse.appendChild(recaptchaResponse);
            divRecaptchaResponse.appendChild(spanError);

            document.forms[0].appendChild(divRecaptchaResponse);
        });
    });
}

$(document).ready(function () {
    if (typeof __Key__ !== "undefined" && __Key__) {
        renderRecaptcha(__Key__);
    }
    var is_submitted = false;

    $(".form_submit").on("click", function (e) {
        if (is_submitted) {
            return;
        }

        var post_type = $(this).data("post-type") || "contact";

        is_submitted = true;
        var $form = $(this).closest("form");
        $form.find(".error").text("");

        var formData = new FormData($form[0]);

        $.ajax({
            url: `/${post_type}`,
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (resp) {
                resp = JSON.parse(resp);

                if (Object.keys(resp).length === 0) {
                    if (typeof __Key__ !== "undefined" && __Key__) {
                        renderRecaptcha(__Key__, true);
                    } else {
                        $form[0].submit();
                    }
                } else {
                    if (typeof __Key__ !== "undefined" && __Key__) {
                        renderRecaptcha(__Key__);
                    }
                    var checkScroll = false;
                    for (var key in resp) {
                        if ($(`*[name="${key}"]`).length === 0) continue;

                        var form__wrap = $(`*[name="${key}"]`).parent("div");

                        form__wrap?.find(".error").text(resp[key]);

                        if (!checkScroll) {
                            form__wrap[0].scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                            checkScroll = true;
                        }
                    }
                    is_submitted = false;
                }
            },
        });
    });
});
