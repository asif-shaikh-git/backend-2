import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const suggestionSchema = new Schema({
  option: {
    type: String,
    enum: ["ENQUIRY", "SUGGESTION", "CHAT", "COMPLAINT"],
    required: true,
  },
  comment: {
    type: String,
    trim: true,
  },
  media: {
    type: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["IMAGE", "VIDEO"],
        },
      },
    ],
    default: [],
  },
}, { timestamps: true });

suggestionSchema.index({ media: 1}, {  unique: false});

suggestionSchema.plugin(mongooseAggregatePaginate);

export const Suggestion = mongoose.model("Suggestion", suggestionSchema);