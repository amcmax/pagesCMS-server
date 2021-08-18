const mongoose = require("mongoose");
const { Schema } = mongoose;

const PageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    screenImage: {
      type: String,
      required: false,
    },
    updatedAt: {
      type: String,
      required: false,
    },
    textResources: [{ type: Schema.Types.ObjectId, ref: "TextResource" }],
  },
  {
    toJSON: { virtuals: true },
  }
);

PageSchema.virtual("elementsCount", {
  ref: "TextResource",
  localField: "_id",
  foreignField: "pageId",
  count: true,
});

const Page = mongoose.model("Page", PageSchema);
module.exports = {
  Page,
};
