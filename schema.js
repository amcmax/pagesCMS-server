const { gql, makeExecutableSchema } = require('apollo-server-express')

const typeDefs = gql`

    enum TextProperty {
    SINGLELINE
    MULTILINE 
    }

    type Page {
        _id: String,
        name: String,
        url: String,
        description: String,
        screenImage: String,
        textResources: [TextResource]
    }

    type Metadata {
        _id: String,
        type: String,
        maxLength: Int,
        textProperty: TextProperty,
        textResourceId: String
    }

    type TextResource {
        _id: String,
        value: String,
        pageId: String,
        metadata: [Metadata]
    }

    type Query {
        pages: [Page],
        page (id: String): Page,
        textResources: [TextResource],
        textResource (id: String): TextResource,
        metadata (id: String): Metadata,
        pageResources(pageId: String!): [TextResource]
        textMetadata (textResourceId: String!): Metadata
    }

    type Mutation {
        addPage (name: String, url: String): Page,
        addTextResource (value: String, pageId: String): TextResource
        addMetadata (type: String, maxLength: Int, textProperty: TextProperty, textResourceId: String): Metadata
    }

    type Subscription {
        getPages: Page
        newTextResource (pageId: String): TextResource,
        newPage (pageId: String): Page,
    }
`

module.exports = typeDefs