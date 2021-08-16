const { Page, Metadata, TextResource } = require("./models");
const pubsub = require("./pubsub");
const { withFilter } = require("apollo-server-express");

const textResources = (pageId) => {
  return TextResource.find({ pageId: pageId })
    .sort({ _id: -1 })
    .limit(100)
    .then((textResource) => {
      return textResource.map((text) => ({ ...text._doc }));
    })
    .catch((err) => {
      console.error(err);
    });
};

const resolvers = {
  Resource: {
    __resolveType(obj) {
      if (obj.value) {
        return "TextResource";
      }
      if (obj.url) {
        return "ImageResource";
      }
      return null;
    },
  },
  Query: {
    pages(parent, args, context, info) {
      return Page.find()
        .populate("elementsCount")
        .sort({ _id: -1 })
        .limit(100)
        .then((page) => {
          return page.map((page) => ({
            ...page._doc,
            elementsCount: page.elementsCount,
            textResources: textResources.bind(this, page._doc._id),
          }));
        })
        .catch((err) => {
          console.error(err);
        });
    },

    page(parent, args, context, info) {
      return Page.findOne({ url: args.url })
        .populate("elementsCount")
        .then((page) => {
          return {
            ...page._doc,
            elementsCount: page.elementsCount,
            textResources: textResources.bind(this, page._doc._id),
          };
        });
    },

    textResources(parent, args, context, info) {
      return TextResource.find()
        .sort({ _id: -1 })
        .limit(10)
        .then((textResource) => {
          return textResource.map((text) => ({ ...text._doc }));
        })
        .catch((err) => {
          console.error(err);
        });
    },

    textResource(parent, args, context, info) {
      return TextResource.findOne({ _id: args.id })
        .then((textResource) => {
          return { ...textResource._doc };
        })
        .catch((err) => {
          console.error(err);
        });
    },

    pageResources(parent, args, context, info) {
      return textResources(args.pageId);
    },
  },

  Mutation: {
    addPage(parent, args, context, info) {
      const { name, url, description, screenImage } = args;
      const pageObj = new Page({
        name,
        url,
        description,
        screenImage,
      });
      return pageObj
        .save()
        .then((result) => {
          const page = { ...result._doc };
          return page;
        })
        .catch((err) => {
          console.error(err);
        });
    },

    addTextResource(parent, args, context, info) {
      const { value, pageId, metadata } = args;
      const textResourceObj = new TextResource({
        value,
        pageId,
        metadata,
      });
      return textResourceObj
        .save()
        .then((result) => {
          const textResource = { ...result._doc };
          return textResource;
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },

  Subscription: {
    newTextResource: {
      resolve: (payload) => {
        return payload.newTextResource;
      },
      subscribe: withFilter(
        () => pubsub.asyncIterator("NEW_TEXT_RESOURCE"),
        (payload, variables) => {
          return payload.newTextResource.pageId == variables.pageId;
        }
      ),
    },
    newPage: {
      resolve: (payload) => {
        return payload.newPage;
      },
      subscribe: () => {
        return pubsub.asyncIterator("NEW_PAGE");
      },
    },
  },
};
module.exports = resolvers;
