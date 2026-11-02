---
'astro': minor
---

Adds experimental `getCollectionsMetadata()`, which lists the content collections of your project without loading their entries

With the new `experimental.collectionMetadata` flag, `getCollectionsMetadata()` from `astro:content` returns every build-time and live collection, with its name, its type, the name of its loader, and its descriptors:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  experimental: {
    collectionMetadata: true,
  },
});
```

Descriptors are serializable values that let code recognize a collection without knowing its name. Loaders declare them with a `descriptors` property, and you can add or override them with the `descriptors` option of `defineCollection()` and `defineLiveCollection()`:

```ts
// a library's loader
export function docsLoader(): Loader {
  return {
    name: 'my-docs-loader',
    descriptors: { myDocs: 'docs' },
    load: async (context) => {
      // ...
    },
  };
}
```

```ts
// a page injected by the same library
import { getCollection, getCollectionsMetadata } from 'astro:content';

const docs = (await getCollectionsMetadata())
  .filter((collection) => collection.type === 'build-time')
  .filter((collection) => collection.descriptors.myDocs === 'docs');

for (const { name } of docs) {
  const entries = await getCollection(name);
}
```
