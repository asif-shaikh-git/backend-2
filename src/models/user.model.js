import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { baseSchema } from "./baseSchema.model.js";

baseSchema.plugin(mongooseAggregatePaginate);

baseSchema.index({ email: 1 });
baseSchema.index({ mobileNumber: 1 });

export const User = mongoose.model("User", baseSchema);