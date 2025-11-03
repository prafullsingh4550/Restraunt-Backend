
import mongoose from "mongoose";

const itemReviewSchema = new mongoose.Schema({
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
  name: String, // redundant but helps in admin dashboard
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
});

const reviewSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, ref: "Order" }, // Note: orderId is String in Order model
    customerName: String, // stored from Order for easy access
    customerPhone: String,

    // array of individual item reviews
    itemReviews: [itemReviewSchema],

    // Experience reviews
    staffRating: { type: Number, min: 1, max: 5 },
    ambienceRating: { type: Number, min: 1, max: 5 },
    overallRating: { type: Number, min: 1, max: 5 },
    experience: String,
    suggestions: String,
  },
  { timestamps: true }
);


export default mongoose.model("Review", reviewSchema);
