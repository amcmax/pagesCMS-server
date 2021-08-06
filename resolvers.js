const { Page, Metadata, TextResource } = require('./models')
const pubsub = require('./pubsub')
const { withFilter } = require('apollo-server-express');

const resolvers = {
  Query: {
    pages (parent, args, context, info) {
      return Page.find().sort({_id:-1}).limit(10)
          .then (page => {
              return page.map (p => ({ ...p._doc }))
          })
          .catch (err => {
              console.error(err)
          })
    },
    page (parent, args, context, info) {
      return Page.findOne({ _id: args.id })
      .populate({ path: 'textResources', model: TextResource })
          .then (page => {
              return { ...page._doc }
          })
          .catch (err => {
              console.error(err)
          })
    },
    textResources (parent, args, context, info) {
      return TextResource.find().sort({_id:-1}).limit(10)
          .then (textResource => {
              return textResource.map (t => ({ ...t._doc }))
          })
          .catch (err => {
              console.error(err)
          })
    },
    textResource (parent, args, context, info) {
      return TextResource.findOne({ _id: args.id })
          .then (textResource => {
              return { ...textResource._doc }
          })
          .catch (err => {
              console.error(err)
          })
    },
    pageResources (parent, args, context, info) {
      return TextResource.find({ pageId: args.pageId })
          .then (textResource => {
              return textResource.map (t => ({ ...t._doc }))
          })
          .catch (err => {
              console.error(err)
          })
    },
    textMetadata (parent, args, context, info) {
        return MetaData.find({ textResourceId: args.textResourceId })
            .then (metadata => {
                return { ...metadata._doc }
            })
            .catch (err => {
                console.error(err)
            })
      },
  },
  Mutation: {
      addPage (parent, args, context, info) {
          const { name, url, description, screenImage } = args
          const pageObj = new Page({
              name,
              url,
              description,
              screenImage
          })
          return pageObj.save()
              .then (result => {
                  const page = { ...result._doc }
                  pubsub.publish('NEW_PAGE', { newPage: page })
                  return page
              })
              .catch (err => {
                  console.error(err)
              })
      },
      addTextResource (parent, args, context, info) {
        const { value, pageId } = args
        const textResourceObj = new TextResource({
            value,
            pageId
        })
        return textResourceObj.save()
            .then (result => {
                const textResource = { ...result._doc }
                pubsub.publish('NEW_TEXT_RESOURCE', { newTextResource: textResource });
                return textResource
            })
            .catch (err => {
                console.error(err)
            })
    },
    addMetadata (parent, args, context, info) {
      const { type, textResourceId, maxLength, textProperty } = args
      const metadataObj = new Metadata({
          type,
          textResourceId,
          maxLength,
          textProperty
      })
      return metadataObj.save()
          .then (result => {
              const metadata = { ...result._doc }
              pubsub.publish('NEW_METADATA', { newMetadata: metadata });
              return metadata
          })
          .catch (err => {
              console.error(err)
          })
  }
  },

  Subscription: {
    newTextResource: {
      resolve: (payload) => {
        return payload.newTextResource
    },
        subscribe: withFilter(
          () => pubsub.asyncIterator('NEW_TEXT_RESOURCE'),
          (payload, variables) => {
            return payload.newTextResource.pageId == variables.pageId;
          }
        ),
    },
    newPage: {
      resolve: (payload) => {
          return payload.newPage
      },
      subscribe: () => {
          return pubsub.asyncIterator('NEW_PAGE')
      }
    }
  }
}
module.exports = resolvers