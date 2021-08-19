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
  updatedAt: {
    type: String,
    required: false,
  },
  metadata: [MetadataSchema],
});

TextResourceSchema.index({ pageId: 1 });

const TextResource = mongoose.model("TextResource", TextResourceSchema);

module.exports = {
  TextResource,
};
