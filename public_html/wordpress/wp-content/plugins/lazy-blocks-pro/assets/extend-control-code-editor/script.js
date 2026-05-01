/**
 * Styles
 */
import './styles.scss';

/**
 * External dependencies
 */
import CodeEditor from '@uiw/react-textarea-code-editor/cjs';
import '@uiw/react-textarea-code-editor/dist.css';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { BaseControl, PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// List of supported syntaxes https://github.com/wooorm/refractor#syntaxes
const LANGS = [
	{ label: 'Arduino', value: 'arduino' },
	{ label: 'Bash', value: 'bash' },
	{ label: 'Basic', value: 'basic' },
	{ label: 'C', value: 'c' },
	{ label: 'C-like', value: 'clike' },
	{ label: 'CPP', value: 'cpp' },
	{ label: 'C Sharp', value: 'csharp' },
	{ label: 'CSS', value: 'css' },
	{ label: 'Diff', value: 'diff' },
	{ label: 'Go', value: 'go' },
	{ label: 'HTML', value: 'html' },
	{ label: 'ini', value: 'ini' },
	{ label: 'Java', value: 'java' },
	{ label: 'JavaScript', value: 'javascript' },
	{ label: 'JSON', value: 'json' },
	{ label: 'Kotlin', value: 'kotlin' },
	{ label: 'less', value: 'less' },
	{ label: 'Lua', value: 'lua' },
	{ label: 'Makefile', value: 'makefile' },
	{ label: 'Markdown', value: 'markdown' },
	{ label: 'Markup Templating', value: 'markup-templating' },
	{ label: 'Objective-C', value: 'objectivec' },
	{ label: 'Perl', value: 'perl' },
	{ label: 'PHP', value: 'php' },
	{ label: 'Python', value: 'python' },
	{ label: 'R', value: 'r' },
	{ label: 'Regex', value: 'regex' },
	{ label: 'Ruby', value: 'ruby' },
	{ label: 'Rust', value: 'rust' },
	{ label: 'SASS', value: 'sass' },
	{ label: 'SCSS', value: 'scss' },
	{ label: 'SQL', value: 'sql' },
	{ label: 'Swift', value: 'swift' },
	{ label: 'TypeScript', value: 'typescript' },
	{ label: 'VB.Net', value: 'vbnet' },
	{ label: 'YAML', value: 'yaml' },
];

/**
 * Control render in editor.
 *
 * @param {Object} props
 */
function ControlEditor(props) {
	const { onChange, getValue, data } = props;

	const { useBlockControlProps } = useSelect((select) => {
		const hooks = select('lazy-blocks/hooks').get();

		return {
			useBlockControlProps: hooks.useBlockControlProps,
		};
	});

	return (
		<BaseControl
			{...useBlockControlProps(props, {
				className: 'lzb-pro-control_code_editor',
			})}
			__nextHasNoMarginBottom
		>
			<CodeEditor
				id="lazyblock-pro-control-code-editor-component"
				value={getValue()}
				language={data.language || ''}
				onChange={(evn) => onChange(evn.target.value)}
				padding={15}
			/>
		</BaseControl>
	);
}

addFilter(
	'lzb.editor.control.code_editor.render',
	'lzb.editor',
	(render, props) => {
		return <ControlEditor {...props} />;
	}
);

/**
 * Control settings render in block builder.
 *
 * @param {Object} props
 */
function BlockBuilderControlSettings(props) {
	const { updateData, data } = props;
	const { language = '' } = data;

	const { SelectControl } = useSelect((select) => {
		const { Select } = select('lazy-blocks/components').get();

		return {
			SelectControl: Select,
		};
	});

	return (
		<PanelBody>
			<BaseControl
				id="lazyblock-pro-control-code-editor-language"
				label={__('Language', 'lazy-blocks')}
				help={__(
					'Select the language for syntax highlighting.',
					'lazy-blocks'
				)}
				__nextHasNoMarginBottom
			>
				<SelectControl
					id="lazyblock-pro-control-code-editor-language"
					options={LANGS}
					value={LANGS.filter((option) => option.value === language)}
					onChange={({ value }) => {
						updateData({ language: value });
					}}
				/>
			</BaseControl>
		</PanelBody>
	);
}

addFilter(
	'lzb.constructor.control.code_editor.settings',
	'lzb.constructor',
	(render, props) => {
		return <BlockBuilderControlSettings {...props} />;
	}
);
