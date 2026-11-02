---
'astro': minor
---

Adds an experimental `astro:collections:resolved` integration hook, which receives the metadata of the build-time content collections of the project

With the `experimental.collectionMetadata` flag enabled, integrations can learn about the collections of a project before any loader runs, for example to configure Markdown plugins for the collections they recognize. The hook is called again in development when the content config changes:

```js
export default function myIntegration() {
  return {
    name: 'my-integration',
    hooks: {
      'astro:collections:resolved': ({ collections }) => {
        const docs = collections.filter((collection) => collection.descriptors.myDocs === 'docs');
      },
    },
  };
}
```
