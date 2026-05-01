import slugify from 'slugify';
import classnames from 'classnames/dedupe';

import { useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import {
	TextControl,
	RadioControl,
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { addAction } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';

let { collections: registeredCollections } =
	window.LZBProBlocksCustomSlugNamespace;
let collectionsChanged = false;

function slugifyNamespace(namespace) {
	return slugify(namespace, {
		replacement: '-',
		lower: true,
		remove: /[^\w\s$0-9-*+~.$(_)#&|'"!:;@/\\]/g,
	});
}

function CollectionItem({
	collection,
	isSelected,
	onSelect,
	onEdit,
	onDelete,
	isCustom = false,
	isEditable = false,
	isDefaultEditing = false,
	namespace,
	onNamespaceChange,
	onCreateCollection,
	collections,
}) {
	const [isEditing, setIsEditing] = useState(isDefaultEditing);
	const [editedLabel, setEditedLabel] = useState(collection?.label || '');
	const [editedNamespace, setEditedNamespace] = useState(
		collection?.namespace || ''
	);
	const [editedRegister, setEditedRegister] = useState(
		collection?.register || false
	);

	const displayName = isCustom
		? __('Custom', 'lazy-blocks')
		: collection?.label || collection?.namespace;

	// Handle namespace change with validation
	const handleNamespaceChange = (value) => {
		onNamespaceChange(value);
	};

	let selectedValue = '';
	if (isSelected) {
		selectedValue = isCustom ? namespace : collection?.namespace;
	}

	return (
		<div
			className={classnames(
				'lzb-block-builder-namespace-collection-item',
				isSelected &&
					'lzb-block-builder-namespace-collection-item-selected',
				isEditing &&
					!isCustom &&
					'lzb-block-builder-namespace-collection-item-editing'
			)}
		>
			<div className="lzb-block-builder-namespace-item-radio-wrapper">
				<RadioControl
					selected={selectedValue}
					onChange={() => {
						onSelect(isCustom ? { namespace } : collection);

						if (isCustom) {
							setIsEditing(true);
						}
					}}
					options={[
						{
							label: (
								<>
									{displayName}
									{collection?.register && (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											width="14"
											height="14"
											aria-hidden="true"
											focusable="false"
											style={{ marginLeft: '2px' }}
										>
											<path d="m21.5 9.1-6.6-6.6-4.2 5.6c-1.2-.1-2.4.1-3.6.7-.1 0-.1.1-.2.1-.5.3-.9.6-1.2.9l3.7 3.7-5.7 5.7v1.1h1.1l5.7-5.7 3.7 3.7c.4-.4.7-.8.9-1.2.1-.1.1-.2.2-.3.6-1.1.8-2.4.6-3.6l5.6-4.1zm-7.3 3.5.1.9c.1.9 0 1.8-.4 2.6l-6-6c.8-.4 1.7-.5 2.6-.4l.9.1L15 4.9 19.1 9l-4.9 3.6z"></path>
										</svg>
									)}
								</>
							),
							description: collection?.namespace,
							value: isCustom ? namespace : collection?.namespace,
						},
					]}
				/>
				{isEditable && !isEditing && !isCustom && (
					<div className="lzb-block-builder-namespace-item-actions">
						<Button
							onClick={() => setIsEditing(true)}
							label={__('Edit', 'lazy-blocks')}
							icon={
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="24"
									height="24"
									aria-hidden="true"
									focusable="false"
								>
									<path d="m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z"></path>
								</svg>
							}
						/>
					</div>
				)}
			</div>

			{((isEditable && isCustom && isSelected) ||
				(isEditable && !isCustom && isEditing)) && (
				<div className="lzb-block-builder-namespace-item-controls">
					{isCustom ? (
						<>
							<div className="lzb-block-builder-namespace-input">
								<TextControl
									value={namespace}
									onChange={handleNamespaceChange}
									onBlur={() => {
										const slugifiedNamespace =
											slugifyNamespace(namespace);

										if (namespace !== slugifiedNamespace) {
											handleNamespaceChange(
												slugifiedNamespace
											);
										}
									}}
									placeholder={__(
										'Enter namespace',
										'lazy-blocks'
									)}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								{namespace && (
									<Button
										variant="link"
										size="compact"
										onClick={() =>
											onCreateCollection(namespace)
										}
										disabled={
											!namespace ||
											collections.some(
												(c) => c.namespace === namespace
											)
										}
									>
										{__('Save for reuse', 'lazy-blocks')}
									</Button>
								)}
							</div>
						</>
					) : (
						<div className="lzb-block-builder-namespace-item-form">
							<TextControl
								label={__('Label', 'lazy-blocks')}
								value={editedLabel}
								onChange={setEditedLabel}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={__('Namespace', 'lazy-blocks')}
								value={editedNamespace}
								onChange={setEditedNamespace}
								onBlur={() => {
									const slugifiedNamespace =
										slugifyNamespace(editedNamespace);

									if (
										editedNamespace !== slugifiedNamespace
									) {
										setEditedNamespace(slugifiedNamespace);
									}
								}}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<CheckboxControl
								label={__('Register collection', 'lazy-blocks')}
								checked={editedRegister}
								onChange={setEditedRegister}
								__nextHasNoMarginBottom
							/>
							<div className="lzb-block-builder-namespace-item-form-actions">
								<Button
									className="lzb-block-builder-namespace-item-form-action-save"
									variant="link"
									size="compact"
									onClick={() => {
										onEdit({
											...collection,
											label: editedLabel,
											namespace: editedNamespace,
											register: editedRegister,
										});
										setIsEditing(false);
									}}
									disabled={
										!editedNamespace ||
										collections
											.filter(
												(c) =>
													c.namespace !==
													collection.namespace
											)
											.some(
												(c) =>
													c.namespace ===
													editedNamespace
											)
									}
								>
									{__('Save', 'lazy-blocks')}
								</Button>
								<span>|</span>
								<Button
									className="lzb-block-builder-namespace-item-form-action-cancel"
									variant="link"
									size="compact"
									onClick={() => setIsEditing(false)}
								>
									{__('Cancel', 'lazy-blocks')}
								</Button>
								<span>|</span>
								<Button
									className="lzb-block-builder-namespace-item-form-action-delete"
									variant="link"
									size="compact"
									isDestructive
									onClick={() => onDelete(collection)}
								>
									{__('Delete', 'lazy-blocks')}
								</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export function NamespaceSelector({ namespace, onChange }) {
	// Initialize state with default collection always present
	const [collections, setCollections] = useState([
		...(registeredCollections || []),
	]);

	// Enable editing state for newly created collection
	const [isDefaultEditing, setIsDefaultEditing] = useState(false);

	// Track if custom input is selected
	const [isCustomSelected, setIsCustomSelected] = useState(false);
	// Store custom namespace value
	const [customNamespace, setCustomNamespace] = useState('');

	const { editPost } = useDispatch('core/editor');

	// Check if namespace exists in collections
	const isCustomNamespace = !collections.some(
		(c) => c.namespace === namespace
	);

	// Handle collection selection
	const handleCollectionSelect = (collection) => {
		setIsCustomSelected(false);
		onChange(collection.namespace);
	};

	// Handle custom namespace selection
	const handleCustomSelect = () => {
		setIsCustomSelected(true);
		// Keep previous custom value if exists
		onChange(customNamespace || namespace);
	};

	// Handle custom namespace change
	const handleCustomNamespaceChange = (value) => {
		setCustomNamespace(value);
		onChange(value);
	};

	const updateCollections = (updatedCollections) => {
		setCollections(updatedCollections);

		registeredCollections = updatedCollections;
		window.LZBProBlocksCustomSlugNamespace.collections =
			registeredCollections;
		collectionsChanged = true;

		// Unlock post update button to trigger save action for collections AJAX update.
		editPost({ edited: new Date() });
	};

	const handleCreateCollection = (newNamespace) => {
		const newCollection = {
			namespace: newNamespace,
			label: '',
			isEditable: true,
		};

		updateCollections([...collections, newCollection]);

		setIsDefaultEditing(newNamespace);
		setTimeout(() => {
			setIsDefaultEditing(false);
		}, 200);
	};

	const handleEditCollection = (editedCollection, collection) => {
		// Prevent editing non-editable collection
		if (!editedCollection?.isEditable) {
			return;
		}

		updateCollections([
			...collections.map((c) =>
				c.namespace === collection.namespace ? editedCollection : c
			),
		]);

		onChange(editedCollection.namespace);
	};

	const handleDeleteCollection = (collectionToDelete) => {
		// Prevent deleting non-editable collection
		if (!collectionToDelete?.isEditable) {
			return;
		}

		if (
			// eslint-disable-next-line no-alert
			window.confirm(
				sprintf(
					// translators: %s: collection label or namespace
					__(
						'Are you sure you want to delete collection "%s"?',
						'lazy-blocks'
					),
					collectionToDelete.label || collectionToDelete.namespace
				)
			)
		) {
			updateCollections([
				...collections.filter(
					(c) => c.namespace !== collectionToDelete.namespace
				),
			]);
		}
	};

	return (
		<div className="lzb-block-builder-namespace-selector">
			<div className="lzb-block-builder-namespace-collections">
				{collections.map((collection) => (
					<CollectionItem
						key={collection.namespace}
						collection={collection}
						isSelected={
							!isCustomSelected &&
							namespace === collection.namespace
						}
						isEditable={collection.isEditable}
						isDefaultEditing={
							isDefaultEditing === collection.namespace
						}
						onSelect={handleCollectionSelect}
						onEdit={(editedCollection) => {
							handleEditCollection(editedCollection, collection);
						}}
						onDelete={handleDeleteCollection}
						collections={collections}
					/>
				))}

				<CollectionItem
					isCustom
					isSelected={isCustomSelected || isCustomNamespace}
					isEditable={true}
					namespace={customNamespace || namespace}
					onNamespaceChange={handleCustomNamespaceChange}
					onSelect={handleCustomSelect}
					onCreateCollection={handleCreateCollection}
					collections={collections}
				/>
			</div>
		</div>
	);
}

/**
 * Update collections once post saved.
 */
addAction(
	'lzb.constructor.post-change',
	'lzb.constructor.update-collections',
	({ shouldUpdate }) => {
		if (shouldUpdate && collectionsChanged) {
			apiFetch({
				path: '/lazy-blocks-pro/v1/update-collections/',
				method: 'POST',
				data: {
					collections:
						window.LZBProBlocksCustomSlugNamespace.collections,
				},
			}).catch((response) => {
				// eslint-disable-next-line
				console.log(response);
			});

			collectionsChanged = false;
		}
	}
);
