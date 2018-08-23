// See for more examples https://www.apollographql.com/docs/apollo-server/servers/lambda.html

const { ApolloServer } = require('apollo-server-lambda')
const { readFileSync } = require('fs')
const resolvers = require('./resolvers')
const typeDefs = readFileSync('./lib/types.graphql', 'UTF8')

const server = new ApolloServer({ typeDefs, resolvers })

exports.handler = server.createHandler()
