/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * WordPress dependencies.
 */
import $ from 'jquery';
import { isEqual, debounce } from 'lodash';
import { addFilter, addAction } from '@wordpress/hooks';
import { select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

/**
 * Cache of frontend HTML by blockId.
 * @type {Record<string, string>}
 */
const CACHE = {};

const { lzbProBlocksPreloaded } = window;

if (lzbProBlocksPreloaded && typeof lzbProBlocksPreloaded === 'object') {
	Object.keys(lzbProBlocksPreloaded).forEach((key) => {
		if (
			key.endsWith('-frontend') &&
			typeof lzbProBlocksPreloaded[key] === 'string'
		) {
			const id = key.replace('-frontend', '');
			CACHE[id] = lzbProBlocksPreloaded[key];
		}
	});
}

/**
 * Per-block state container (keyed by blockId).
 * @typedef {Object} BlockState
 * @property {boolean}            initialized - Whether this block state has been initialized
 * @property {any}                prevAttrs   - Previous block attributes for change detection
 * @property {Promise<void>|null} inflight    - Current in-flight API request promise, if any
 */

const blockState = new Map();

/**
 * Get or create state for a block key.
 * @param {string} blockId - The block's ID used as a key
 * @return {BlockState} The block state object
 */
function getState(blockId) {
	if (!blockState.has(blockId)) {
		blockState.set(blockId, {
			initialized: false,
			prevAttrs: undefined,
			inflight: null,
		});
	}
	return blockState.get(blockId);
}

/**
 * Inject cached dynamic HTML into content for SEO analyzers.
 * @param {string} content - The original content to enhance
 * @return {string} Content with dynamic HTML appended
 */
function replaceContent(content) {
	// Check if cached block exists and add content from it.
	Object.keys(CACHE).forEach((blockId) => {
		if (CACHE[blockId] && content.includes(`"blockId":"${blockId}"`)) {
			content += `\n\n<!-- LAZY BLOCKS DYNAMIC CONTENT FROM THE BLOCK "${blockId}" -->\n${CACHE[blockId]}`;
		}
	});

	return content;
}

/**
 * Debounced SEO refresh to avoid too many content analyses.
 */
const triggerSEORefresh = debounce(() => {
	if (typeof window.rankMathEditor !== 'undefined') {
		window.rankMathEditor.refresh('content');
	}
	// Yoast re-runs our modification automatically.
}, 500);

/**
 * Fetch frontend HTML for specific block (immediate).
 *
 * @param {Object} props - Block properties containing block type and attributes
 */
async function fetchFrontendHTML(props) {
	const blockId = props?.attributes?.blockId;
	if (!blockId) {
		return;
	}

	const blockStateData = getState(blockId);

	// Avoid duplicate in-flight requests.
	if (blockStateData.inflight) {
		return blockStateData.inflight;
	}

	const editor = select('core/editor') || {};
	const { getCurrentPostId } = editor;
	const postId = getCurrentPostId ? getCurrentPostId() : 0;

	const requestPromise = apiFetch({
		path: 'lazy-blocks/v1/block-render',
		method: 'POST',
		data: {
			render_location: 'frontend',
			context: props.context,
			name: props.block,
			post_id: postId || 0,
			...(props.attributes ? { attributes: props.attributes } : {}),
		},
	})
		.then((response) => {
			if (response && response.success) {
				CACHE[blockId] = response.response || '';
			}
		})
		.finally(() => {
			blockStateData.inflight = null;
			triggerSEORefresh();
		});

	blockStateData.inflight = requestPromise;
	return requestPromise;
}

/**
 * On preview change:
 * - first time: use server-preloaded frontend HTML if available (no fetch);
 *               otherwise snapshot attributes and DO NOT fetch
 * - next times: only if attributes changed vs snapshot, fetch (immediate) + fetch child blocks
 */
addAction(
	'lzb.components.PreviewServerCallback.onChange',
	'lazy-blocks-cache-content-for-seo-plugins',
	/**
	 * @param {Object} props - Block properties from the preview callback
	 */
	(props) => {
		const blockId = props?.attributes?.blockId;
		const attributes = props?.attributes;

		if (!blockId || !attributes) {
			return;
		}

		const blockStateData = getState(blockId);

		if (!blockStateData.initialized) {
			blockStateData.initialized = true;

			// Use server preloaded frontend HTML if present (no fetch).
			if (typeof CACHE[blockId] !== 'undefined') {
				blockStateData.prevAttrs = attributes;

				triggerSEORefresh();

				return;
			}
		}

		// Check if any attributes changed
		const attributesChanged = !isEqual(
			blockStateData.prevAttrs,
			attributes
		);

		if (attributesChanged) {
			blockStateData.prevAttrs = attributes;

			// Always fetch the main block when any attributes change
			fetchFrontendHTML(props);
		}
	}
);

/**
 * Rank Math: inject dynamic content into content analysis.
 *
 * @see https://rankmath.com/kb/content-analysis-api/
 */
addFilter(
	'rank_math_content',
	'lazy-blocks-dynamic-blocks',
	/**
	 * @param {string} content - Original content for analysis
	 * @return {string} Enhanced content with dynamic blocks
	 */
	function (content) {
		return replaceContent(content);
	},
	11
);

/**
 * Yoast SEO: inject dynamic content into content analysis.
 *
 * @see https://developer.yoast.com/customization/yoast-seo/adding-custom-data-analysis/
 */
function initYoastCompatCode() {
	window.YoastSEO.app.registerPlugin('lazy-blocks-dynamic-blocks', {
		status: 'ready',
	});
	window.YoastSEO.app.registerModification(
		'content',
		/**
		 * @param {string} content - Original content for analysis
		 * @return {string} Enhanced content with dynamic blocks
		 */
		(content) => replaceContent(content),
		'lazy-blocks-dynamic-blocks',
		10
	);
}

// Initialize Yoast hook when ready.
if (
	typeof window.YoastSEO !== 'undefined' &&
	typeof window.YoastSEO.app !== 'undefined'
) {
	initYoastCompatCode();
} else {
	$(window).on('YoastSEO:ready', function () {
		initYoastCompatCode();
	});
}
