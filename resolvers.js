const { withFilter } = require("apollo-server-express");
const { Page } = require("./models/Page");
const { TextResource } = require("./models/TextResource");

const textResources = async (pageId) => {
  try {
    const texts = await TextResource.find({ pageId: pageId })
      .sort({ _id: -1 })
      .limit(100);
    return texts.map((text) => {
      return { ...text._doc };
    });
  } catch (error) {
    console.log(error);
  }
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
    pages: async () => {
      const pages = await Page.find()
        .populate("elementsCount")
        .sort({ _id: -1 })
        .limit(100);
      return pages.map((page) => ({
        ...page._doc,
        elementsCount: page.elementsCount,
        textResources: textResources.bind(this, page._doc._id),
      }));
    },

    pageByUrl: async (parent, args, context, info) => {
      const page = await Page.findOne({ url: args.url }).populate(
        "elementsCount"
      );
      return {
        ...page._doc,
        elementsCount: page.elementsCount,
        textResources: textResources.bind(this, page._doc._id),
      };
    },

    pageById: async (parent, args, context, info) => {
      const page = await Page.findOne({ _id: args.pageId }).populate(
        "elementsCount"
      );
      return {
        ...page._doc,
        elementsCount: page.elementsCount,
        textResources: textResources.bind(this, page._doc._id),
      };
    },

    textResources: async () => {
      const textResources = await TextResource.find()
        .sort({ _id: -1 })
        .limit(10);
      return textResources.map((textResource) => ({
        ...textResource._doc,
      }));
    },

    textResource: async (parent, args, context, info) => {
      const textResource = await TextResource.findOne({ _id: args.id });
      return {
        ...textResource._doc,
      };
    },

    pageResources: async (parent, args, context, info) => {
      const pageResources = await textResources(args.pageId);
      return pageResources;
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

    updatePage: async (parent, args, context) => {
      await Page.updateOne(
        { _id: args.pageId },
        {
          $set: {
            ...args.page,
            updatedAt: new Date().toISOString(),
          },
        }
      );

      return {
        _id: args.pageId,
      };
    },

    deletePage: async (parent, args, context) => {
      await Page.deleteOne({ _id: args.pageId });
    },

    updateTextResource: async (parent, args, context) => {
      await TextResource.updateOne(
        { _id: args.textResourceId },
        {
          $set: {
            ...args.textResource,
            updatedAt: new Date().toISOString(),
          },
        }
      );

      return {
        _id: args.textResourceId,
      };
    },

    deleteTextResource: async (parent, args, context) => {
      await TextResource.deleteOne({ _id: args.textResourceId });
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
