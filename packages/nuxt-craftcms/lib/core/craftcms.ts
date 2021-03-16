import algoliasearch from 'algoliasearch'
import {ApolloClient} from "apollo-boost";

export const craftcms = (apolloClient: ApolloClient<any>, options: any = {}): any => ({

  apolloClient,

  searchClient:
    options.search &&
    options.search.appId &&
    options.search.apiKey
      ? algoliasearch(options.search.appId, options.search.apiKey)
      : null

  searchIndeces: {},

  createSearchIndeces () {
    if (!this.searchClient) {
      return
    }

    const indeces = options.search.indeces

    // Setup Indeces
    if (Object.keys(indeces).length > 0) {
      for (const index in indeces) {
        const indexSettings = indeces[index]
        if (typeof indexSettings === 'string') {
          this.searchIndeces[index] = this.searchClient.initIndex(indexSettings)
        } else {
          this.searchIndeces[index] = this.searchClient.initIndex(indexSettings.name)

          // Add attributes to filter by - ensure the `editSettings` permissions is allowed on API key
          if (indexSettings.filters) {
            const filters = indexSettings.filters
            this.searchIndeces[index].setSettings({
              attributesForFaceting: filters,
              ranking: indexSettings.ranking ? indexSettings.ranking : []
            })
          }

          if (indexSettings.replicas) {
            indexSettings.replicas.forEach((replica: any) => {
              this.searchClient.copyIndex(indexSettings.name, `${indexSettings.name}_${replica.name}`).then(() => {
                const indexName = replica.name
                this.searchIndeces[indexName] = this.searchClient.initIndex(`${indexSettings.name}_${replica.name}`)

                this.searchIndeces[indexName].setSettings({
                  attributesForFaceting: replica.filters || [],
                  ranking: replica.ranking || []
                })
              })
            })
          }
        }
      }
    }
  },

  // Store options
  get options () {
    return options
  },

  async search (indexName: string, params: any) {
    if (!this.searchClient) {
      return
    }

    const index = this.searchIndeces[indexName]

    if (!index) {
      console.warn(`Can't find index ${indexName}`) // eslint-disable-line no-console
      return
    }

    try {
      const results = await index.search(params)

      // Log out results for easier dev
      if (process.client && process.env.NODE_ENV === 'development') {
        console.log('Algolia results:', results) // eslint-disable-line no-console
      }

      return results
    } catch (err) {
      console.warn(err) // eslint-disable-line no-console
    }
  }
})
