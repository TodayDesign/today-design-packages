import {Options} from "../module";

const axios = require('axios')

export default async function (options: Options) {
  const headers = options.apiToken ? {
    authorization: options.apiToken ? `Bearer ${options.apiToken}` : ''
  } : {}

  // Fetch GraohQL schema
  const { data } = await axios({
    method: 'POST',
    url: options.baseUrl + options.graphqlEndpoint,
    headers,
    data: {
      query: `
        {
          __schema {
            types {
              kind
              name
              possibleTypes {
                name
              }
            }
          }
        }
      `
    }
  })

  // here we're filtering out any type information unrelated to unions or interfaces
  const filteredData = data.data.__schema.types.filter((type: any) => type.possibleTypes !== null)

  data.data.__schema.types = filteredData

  return data.data
}
