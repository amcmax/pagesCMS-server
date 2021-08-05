const { gql, makeExecutableSchema } = require('apollo-server-express')

const typeDefs = gql`

    enum TextProperty {
    SINGLELINE
    MULTILINE 
    }

    type Page {
        _id: ID!,
        name: String,
        url: String,
        description: String,
        screenImage: String,
        textResources: [TextResource]
    }

    type MetaData {
        _id: String,
        type: String,
        maxLength: Int,
        textProperty: TextProperty,
        textResourceId: String
    }

    type TextResource {
        _id: ID!,
        value: String,
        pageId: String,
        metadata: [MetaData]
    }

    type Query {
        pages: [Page],
        page (id: String): Page,
        textResources: [TextResource],
        textResource (id: String): TextResource,
        metaData (id: String): MetaData,
        pageResources(pageId: String!): [TextResource]
    }

    type Mutation {
        addPage (name: String, url: String): Page,
        addTextResource (value: String, pageId: String): TextResource
        addMetaData (type: String, maxLength: Int, textProperty: TextProperty, textResourceId: String): MetaData
    }

    type Subscription {
        getPages: Page
        newTextResource (pageId: String): TextResource,
        newPage (pageId: String): Page,
    }
`

module.exports = typeDefs