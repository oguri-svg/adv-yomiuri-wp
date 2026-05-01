/**
 * WordPress dependencies
 */
// eslint-disable-next-line import/no-unresolved
import $ from 'jquery';

const { ajaxurl, VPUpdaterVariables } = window;

const $body = $('body');
const $licenseInput = $('input[name="lzb_pro_updates[license_key]"]');
const isLicenseActive = $licenseInput.val();
let process = '';

if (isLicenseActive) {
	$licenseInput.attr('readonly', 'readonly');
}

/**
 * Add loading state to settings form.
 *
 * @param {boolean} loading
 */
function toggleLoadingState(loading = true) {
	const $form = $('#lzb_pro_updates');
	const $inputs = $form.find('input[type="text"], button');

	if (loading) {
		$inputs.attr('disabled', 'disabled');
	} else {
		$inputs.removeAttr('disabled');
	}
}

/**
 * Request AJAX for activation/deactivation.
 */
function requestActivationAjax() {
	if (process) {
		return;
	}

	toggleLoadingState();

	const type = isLicenseActive ? 'deactivate' : 'activate';
	process = 'loading';

	$.post(
		ajaxurl,
		{
			action: 'lzb_pro_activation_action',
			ajax_nonce: VPUpdaterVariables.nonce,
			type,
			license_key: $licenseInput.val(),
		},
		(response) => {
			// Success.
			if (!response) {
				window.location.reload();
				return;
			}

			// Error.
			$licenseInput.next('.notice').remove();
			$licenseInput.after(
				`<div class="notice notice-warning">${response}</div>`
			);
			toggleLoadingState(false);

			process = '';
		}
	);
}

// Request AJAX with license activation/deactivation action.
$body.on('submit', '#lzb_pro_updates form', (e) => {
	e.preventDefault();

	if (process) {
		return;
	}

	requestActivationAjax();
});
