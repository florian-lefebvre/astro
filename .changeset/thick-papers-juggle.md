---
'astro': minor
'@astrojs/markdown-remark': minor
'@astrojs/markdown-satteri': minor
'@astrojs/internal-helpers': minor
---

Adds the metadata of the content collection being rendered to the data of Markdown plugins

With the experimental `collectionMetadata` flag enabled, remark, rehype and Sätteri plugins can read the collection of the entry they render from `file.data.astro.collection` (`ctx.data.astro.collection` in Sätteri), for example to change how they render the collections a library recognizes by their descriptors:

```js
export function remarkDocs() {
  return (tree, file) => {
    if (file.data.astro.collection?.descriptors.myDocs !== 'docs') return;
    // ...
  };
}
```

It is set for Markdown rendered by the `glob()` loader and by `renderMarkdown()` in custom loaders. It is `undefined` for Markdown outside collections.
