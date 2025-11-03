// import mongoose from "mongoose";

// const menuItemSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   price: { type: Number, required: true },
//   categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
//   imageUrl: String,
//   isChefsSpecial: { type: Boolean, default: false },
//   isAllTimeFavorite: { type: Boolean, default: false },
//   available: { type: Boolean, default: true },
// });

// export default mongoose.model("MenuItem", menuItemSchema);

import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // ✅ prevents duplicate names
      trim: true,
      lowercase: true, // ✅ case-insensitive uniqueness ("Pizza" === "pizza")
    },
    description: String,
    price: { type: Number, required: true },
    veg: {
      type: Boolean,
      required: true
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    imageUrl: String,
    isChefsSpecial: { type: Boolean, default: false },
    isAllTimeFavorite: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Create index to enforce uniqueness at DB level
menuItemSchema.index({ name: 1 }, { unique: true });

// ✅ Helper to safely create or skip duplicates (for seeding via API)
menuItemSchema.statics.safeCreate = async function (item) {
  try {
    const existing = await this.findOne({ name: item.name.toLowerCase().trim() });
    if (existing) {
      console.log(`⚠️ Skipping duplicate menu item: ${item.name}`);
      return existing;
    }
    const newItem = await this.create(item);
    console.log(`✅ Created menu item: ${newItem.name}`);
    return newItem;
  } catch (err) {
    console.error(`❌ Error creating ${item.name}:`, err.message);
    throw err;
  }
};

export default mongoose.model("MenuItem", menuItemSchema);
