/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';

const { lzbProBlocksPreloaded } = window;

addFilter(
	'lzb.components.PreviewServerCallback.allowFetch',
	'lzb-pro-blocks-preload',
	(allow, { props, prevProps, setResponse }) => {
		// Only on first render
		if (prevProps !== undefined) {
			return allow;
		}

		const blockId = props?.attributes?.blockId;
		if (!blockId || !lzbProBlocksPreloaded) {
			return allow;
		}

		// If there is a preloaded data, prevent the fetching.
		const editorHtml = lzbProBlocksPreloaded[blockId];
		if (typeof editorHtml === 'string' && editorHtml.length) {
			setResponse(editorHtml); // hydrate preview without fetching
			return false; // prevent initial fetch
		}

		return allow;
	}
);
