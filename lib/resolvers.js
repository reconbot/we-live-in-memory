const { Graph } = require('nemesis-db')

const graph = new Graph('redis://localhost/2')

const SITE_NAME_TO_ID = {
  'BUSTLE': 1,
  'ROMPER': 2
}

module.exports = {
  Query: {
    site: (_, { name }) => graph.findNode(SITE_NAME_TO_ID[name])
  },
  Site: {
    post: async (site, { path }) => {
      const edge = await graph.findLabeledEdge({
        subject: site.id,
        predicate: 'path',
        label: path
      })
      if (!edge) { return null }
      const { object: postId } = edge
      return graph.findNode(postId)
    }
  },
  Post: {
    author: async ({ id }) => {
      const [{ object: userId }] = await graph.findEdges({
        subject: id,
        predicate: 'PostHasAuthor'
      })
      return graph.findNode(userId)
    },
    tags: async ({ id }) => {
      const edges = await graph.findEdges({
        subject: id,
        predicate: 'PostHasTags'
      })
      return Promise.all(edges.map(({ object }) => graph.findNode(object)))
    }
  },
  Mutation: {
    resetDevData: async () => {
      await graph.redis.flushdb()
      const site = await graph.createNode({ name: 'BUSTLE' })
      await graph.createNode({ name: 'ROMPER' })
      const path = '/p/i-wore-dad-shoes-for-a-week-they-were-so-much-cooler-3'
      const post = await graph.createNode({ path, title: 'dad shoes are great', body: 'a long post about dad shoes' })
      await graph.createLabeledEdge({ subject: site.id, predicate: 'path', object: post.id, label: path })
      const user = await graph.createNode({ type: 'user', name: 'Dale' })
      await graph.createEdge({ subject: post.id, predicate: 'PostHasAuthor', object: user.id })
      const tags = await Promise.all([
        graph.createNode({ type: 'tag', name: 'homepage' }),
        graph.createNode({ type: 'tag', name: 'fashion' }),
        graph.createNode({ type: 'tag', name: 'freelancer' })
      ])
      await Promise.all(tags.map(tag => graph.createEdge({
        object: tag.id,
        predicate: 'PostHasTags',
        subject: post.id
      })))
      return 'OK'
    }
  }
}
