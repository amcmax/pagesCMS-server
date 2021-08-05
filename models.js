const mongoose = require('mongoose')
const { Schema } = mongoose

const MetadataSchema = new Schema({
  type: {
      type: String,
      required: true
  },
  maxLength: {
      type: Number,
      required: false
  },
  textProperty: {
    type: String,
    enum: ['SINGLELINE', 'MULTILINE'],
    required: false
  },
  textResourceId: {
    type: Schema.Types.ObjectId,
    ref: 'TextResource',
    required: true
  }
})

const TextResourceSchema = new Schema({
  value: {
      type: String,
      required: true
  },
  pageId: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    required: true
  },
  metadata: [
    { 
      type: Schema.Types.ObjectId, 
      ref: 'Metadata' }
  ]
  })

const PageSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    screenImage: {
      type: String,
      required: false
    },
    textResources: [
      { 
        type: Schema.Types.ObjectId, 
        ref: 'TextResource' }
    ]
})

const Page = mongoose.model('Page', PageSchema) 
const TextResource = mongoose.model('TextResource', TextResourceSchema)
const Metadata = mongoose.model('Metadata', MetadataSchema)

module.exports = {
    Page, 
    TextResource,
    Metadata
}