const mongoose = require("mongoose");
const { Schema } = mongoose;

const MetadataSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  maxLength: {
    type: Number,
    required: false,
  },
  textProperty: {
    type: String,
    enum: ["SINGLELINE", "MULTILINE"],
    required: false,
  },
  textResourceId: {
    type: Schema.Types.ObjectId,
    ref: "TextResource",
    required: false,
  },
});

const TextResourceSchema = new Schema({
  value: {
    type: String,
    required: true,
  },
  pageId: {
    type: Schema.Types.ObjectId,
    ref: "Page",
    required: true,
  },
  metadata: [MetadataSchema],
});

TextResourceSchema.index({ pageId: 1 });

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
const TextResource = mongoose.model("TextResource", TextResourceSchema);
const Metadata = mongoose.model("Metadata", MetadataSchema);

module.exports = {
  Page,
  TextResource,
  Metadata,
};
