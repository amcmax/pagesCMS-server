const { gql, makeExecutableSchema } = require("apollo-server-express");

const typeDefs = gql`
  enum TextProperty {
    SINGLELINE
    MULTILINE
  }

  type Page {
    _id: String
    name: String
    url: String
    description: String
    updatedAt: String
    screenImage: String
    elementsCount: Int
    textResources: [TextResource]
  }

  type Metadata {
    _id: String
    type: String
    maxLength: Int
    textProperty: TextProperty
    textResourceId: String
  }

  input MetadataInput {
    type: String
    maxLength: Int
    textProperty: TextProperty
  }

  input PageInput {
    name: String
    url: String
    description: String
    screenImage: String
  }

  type TextResource {
    _id: String
    value: String
    pageId: String
    metadata: [Metadata]
  }

  type ImageResource {
    _id: String
    url: String
    pageId: String
    metadata: [Metadata]
  }

  union Resource = TextResource | ImageResource

  type Query {
    pages: [Page]
    pageByUrl(url: String): Page
    pageById(pageId: String): Page
    textResources: [TextResource]
    textResource(id: String): TextResource
    pageResources(pageId: String!): [Resource]
  }

  type Mutation {
    addPage(name: String, url: String, description: String): Page
    updatePage(pageId: String!, page: PageInput!): Page
    deletePage(pageId: String): Page
    addTextResource(
      value: String
      pageId: String
      metadata: MetadataInput
    ): TextResource
  }

  type Subscription {
    getPages: Page
    newTextResource(pageId: String): TextResource
    newPage(pageId: String): Page
  }
`;

module.exports = typeDefs;
