const fs = require('fs')
const axios = require('axios')
require('dotenv').config({ path: '../../.env' })

const options = {
  baseUrl: process.env.CONTENT_API_HOST || 'http://localhost',
  graphqlEndpoint: '/api',
  apiToken: process.env.CONTENT_API_TOKEN
}

async function createSchema () {
  const headers = options.apiToken ? {
    authorization: options.apiToken ? `Bearer ${options.apiToken}` : ''
  } : {}

  try {
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

    if (data.errors) {
      throw new Error('Error')
    }

    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = data.data.__schema.types.filter(type => type.possibleTypes !== null)

    data.data.__schema.types = filteredData

    fs.writeFile('schema.json', JSON.stringify(data.data), 'utf-8', (err) => {
      if (err) { throw err }
      console.log('Your schema has been generated!')
    })
  } catch (err) {
    console.warn(err)
    fs.writeFile('schema.json', JSON.stringify({ __schema: { types: [] } }), 'utf-8', () => {
      console.log('Writing default schema')
    })
  }
}

createSchema()
