const { ApolloServer } = require('apollo-server')
const { readFileSync } = require('fs')
const resolvers = require('./resolvers')
const typeDefs = readFileSync('./lib/types.graphql', 'UTF8')

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => {
  console.log(`🚀 ☄️ Server ready at ${url}`)
});
