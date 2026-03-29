import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    responses: {
      type: [
        {
         option: {
           type: String,
           enum: ["ENQUIRY", "SUGGESTION", "CHAT", "COMPLAINT"],
           required: true
          },
         comment: {
           type: String,
           trim: true,
          },
         media: [
           {
             url: {
               type: String,
               required: true
              },
             type: {
               type: String,
               enum: ["IMAGE", "VIDEO"],
              },
            },
          ],
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ customer: 1, product: 1 }, { unique: true });


export const Feedback = mongoose.model("Feedback", feedbackSchema);
