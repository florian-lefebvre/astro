export type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONValue[]
	| { [key: string]: JSONValue };

/**
 * Serializable values attached to a content collection by its loader or by its config, so
 * other code can recognize the collection without knowing its name.
 */
export type CollectionDescriptors = Record<string, JSONValue>;

/** Facts about a content collection, never its entries. */
export interface CollectionMetadata {
	name: string;
	type: 'build-time' | 'live';
	loader: { name: string };
	/** Descriptors from the loader and from the collection config, the latter taking precedence. */
	descriptors: CollectionDescriptors;
}
