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

3. Add `'@todaydesign/nuxt-craftcms'` to `build.transpile` inside `nuxt.config.ts`.  

```typescript
  build: {
      transpile: [
         'vee-validate/dist/rules',
         '@todaydesign/nuxt-craftcms'
      ]
    ...
   }
```

4. Add the Craft CMS options to your `nuxt.config.ts`, take a special note of the plugins:

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

5. Copy a `frontend/nuxt-craftcms` folder from another projects like [Code Club Australia](https://github.com/TodayDesign/codeclubau-org/tree/develop/frontend/nuxt-craftcms) and add it to your project.

6. Make sure your new `frontend/nuxt-craftcms` folder contains an `index.ts` file with the following contents inside:

```typescript
import entryTypes from '~/nuxt-craftcms/load-queries'

export default function (ctx: any) {
   // Load the entry types
   ctx.$craftcms.entryTypes = entryTypes
}
```

This allows us to load the GraphQL queries from inside the module.

6. Run `npm run dev` to make sure it has all loaded properly.


## Development workflow

To make changes to the module you can use this workflow

```bash
# Clone the repo
git clone git@github.com:TodayDesign/today-design-packages.git

# Go into the nuxt-craftcms directory
cd today-design-packages/packages/nuxt-craftcms   

# Install dependencies
npm i

# Create a NPM syslink
npm link

# Watch the file changes
npm run dev
```
⚠️ If you're trying to edit `.vue` files, edit them directly in the dist folder. Then when you're finished, copy the modified files to the lib folder. 

Now you can go into the project where you will test the package

```bash 
# Go to your project's frontend folder
cd youproject/frontend

# Link the project with the NPM syslink
npm link @todaydesign/nuxt-craftcms
```

To watch for file changes in the package, add this line in the `nuxt.config.ts`:
```bash
  watch: ['~/node_modules/@todaydesign/nuxt-craftcms/dist/*'],
```

Run the dev environment
```bash
npm run dev
```

Now when ever you make changes to the package, typescript will reload the dist folder and your nuxt project will reload with the updated package.

## Publishing to NPM
```bash
# Login to NPM, you can find the details in Team Password
npm login

# Go to the root of today-design-packages
cd today-design-packages

# Publish with Lerna
npm run publish

```
The package will now be available as `@today-design/nuxt-craftcms`



