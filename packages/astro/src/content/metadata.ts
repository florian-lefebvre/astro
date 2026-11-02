import { AstroError, AstroErrorData } from '../core/errors/index.js';

export type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONValue[]
	| { [key: string]: JSONValue };

/**
 * Serializable values attached to a collection by its loader or by `defineCollection()`, so
 * other code can recognize the collection without knowing its name.
 */
export type CollectionDescriptors = Record<string, JSONValue>;

/** Facts about a collection, never its entries. */
export interface CollectionMetadata {
	name: string;
	type: 'build-time' | 'live';
	loader: { name: string };
	/** Descriptors from the loader and from the collection config, the latter taking precedence. */
	descriptors: CollectionDescriptors;
}

interface CollectionWithDescriptors {
	type?: string;
	descriptors?: Record<string, unknown>;
	loader?: unknown;
}

/** Name of the loader of collections defined with a function instead of a loader object. */
const INLINE_LOADER_NAME = 'inline';

/**
 * Returns the metadata of collections, in the order they are defined.
 *
 * @throws {AstroError} `InvalidCollectionDescriptors` when the descriptors of a collection
 * aren't JSON-serializable.
 */
export function getCollectionsMetadata(
	collections: Record<string, CollectionWithDescriptors>,
	type: CollectionMetadata['type'],
): CollectionMetadata[] {
	return Object.entries(collections).map(([name, collection]) => {
		const loader = collection.loader as
			| { name?: unknown; descriptors?: Record<string, unknown> }
			| undefined;
		const loaderName =
			typeof loader === 'object' && typeof loader?.name === 'string'
				? loader.name
				: INLINE_LOADER_NAME;
		const descriptors = {
			...(typeof loader === 'object' ? loader?.descriptors : undefined),
			...collection.descriptors,
		};
		const invalidPath = findNonJsonValue(descriptors, 'descriptors');
		if (invalidPath) {
			throw new AstroError({
				...AstroErrorData.InvalidCollectionDescriptors,
				message: AstroErrorData.InvalidCollectionDescriptors.message(name, invalidPath),
			});
		}
		return {
			name,
			type,
			loader: { name: loaderName },
			descriptors: descriptors as CollectionDescriptors,
		};
	});
}

/**
 * Returns the path of the first value that doesn't survive a JSON round trip unchanged,
 * or `undefined` when there is none. Object properties set to `undefined` are allowed,
 * because they are omitted the same way an unset property is.
 */
function findNonJsonValue(value: unknown, path: string): string | undefined {
	if (value === undefined || value === null) return undefined;
	switch (typeof value) {
		case 'string':
		case 'boolean':
			return undefined;
		case 'number':
			return Number.isFinite(value) ? undefined : path;
		case 'object': {
			if (Array.isArray(value)) {
				for (let i = 0; i < value.length; i++) {
					// `undefined` array items become `null`, so they don't round trip
					if (value[i] === undefined) return `${path}[${i}]`;
					const invalid = findNonJsonValue(value[i], `${path}[${i}]`);
					if (invalid) return invalid;
				}
				return undefined;
			}
			const prototype = Object.getPrototypeOf(value);
			if (prototype !== Object.prototype && prototype !== null) return path;
			for (const [key, item] of Object.entries(value)) {
				const invalid = findNonJsonValue(item, `${path}.${key}`);
				if (invalid) return invalid;
			}
			return undefined;
		}
		case 'bigint':
		case 'function':
		case 'symbol':
		case 'undefined':
			return path;
	}
}
