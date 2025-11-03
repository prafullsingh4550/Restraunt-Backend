import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import MenuItem from "../models/MenuItem.js";
import { connectDB } from "../db.js";

dotenv.config();

const seed = async () => {
  await connectDB();
  await Category.deleteMany();
  await MenuItem.deleteMany();

  const cat1 = await Category.create({ name: "Starters", slug: "starters" });
  const cat2 = await Category.create({ name: "Main Course", slug: "main-course" });

  await MenuItem.insertMany([
    { name: "Paneer Tikka", price: 220, categoryId: cat1._id, isChefsSpecial: true },
    { name: "Veg Biryani", price: 180, categoryId: cat2._id, isAllTimeFavorite: true },
  ]);

  console.log("✅ Seed data added");
  process.exit();
};

seed();
