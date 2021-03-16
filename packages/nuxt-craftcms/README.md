# nuxt-craftcms
A Nuxt.js module for CraftCMS via the CraftQL plugin


### Setting up a project

1. Install the package
```
npm i @todaydesign/nuxt-craftcms
```

2. Add `@todaydesign/nuxt-craftcms` to the `modules` section inside `nuxt.config.ts`.
   For example:
   ```
    /*
    ** Nuxt.js modules
    */
    modules: [
        '@nuxtjs/pwa',
        '@todaydesign/nuxt-craftcms',
        '@todaydesign/nuxt-icons',
        'nuxt-polyfill'
    ],
    ```

3. Add the Craft CMS options to your `nuxt.config.ts`:

```
   ...
  craftcms: {
    baseUrl: process.env.CONTENT_API_HOST || 'http://localhost',
    productionUrl: 'PRODUCTION URL',
    graphqlEndpoint: '/api',
    appBaseUrl: process.env.APP_HOST || 'http://localhost:3000',
    modules: craftcmsModules,
    siteHandle: 'default',
    siteName: 'YOURSITENAME',
    paginatedRoutes: [],
    disallowIndexing: process.env.CRAFT_ENVIRONMENT !== 'production' || process.env.PREVIEW_MODE === '1',
    showEditBtn: process.env.PREVIEW_MODE === '1',
    plugins: ['~/nuxt-craftcms']
  },
  ...
```

4. Copy a `frontend/nuxt-craftcms` folder from another projects like [Code Club Australia](https://github.com/TodayDesign/codeclubau-org/tree/develop/frontend/nuxt-craftcms) and add it to your project.

5. Make sure your new `frontend/nuxt-craftcms` folder contains an `index.ts` file with the following contents inside:

```typescript
import entryTypes from '~/nuxt-craftcms/load-queries'

export default function (ctx: any) {
   // Load the entry types
   ctx.$craftcms.entryTypes = entryTypes
}
```

This allows us to load the GraphQL queries from inside the module.

6. Run `npm run dev` to make sure it has all loaded properly.
