import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    tableNumber: Number,
    customerName: String,
    customerPhone: String,
    items: [
      {
        menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
        qty: Number,
        price: Number,
        notes: String,
      },
    ],
    subtotal: Number,
    tax: Number,
    total: Number,
    paymentStatus: { type: String, default: "pending" },
    orderStatus: { type: String, default: "received" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
