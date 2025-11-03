import express from "express";
import {
  getSummaryStats,
  getOrdersDaily,
  getOrdersHourly,
  getTopSellingItems,
  getVegVsNonVegStats,
  getCategorySales,
  getMostProfitableItem,
  getRepeatCustomers,
} from "../controllers/analyticsController.js";
import { verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Protect all analytics routes — only admin can access
router.use(verifyAdmin);

// 📊 1. Summary stats
router.get("/summary", getSummaryStats);

// 📅 2. Daily orders and revenue trend
router.get("/orders/daily", getOrdersDaily);

// ⏰ 3. Hourly trend for given date (or today)
router.get("/orders/hourly", getOrdersHourly);

// 🏆 4. Top selling items
router.get("/items/top", getTopSellingItems);

// 🥗 5. Veg vs Non-veg stats
router.get("/veg-vs-nonveg", getVegVsNonVegStats);

// 🍱 6. Category-wise sales
router.get("/sales/category", getCategorySales);

// 💰 7. Most profitable item
router.get("/items/profitable", getMostProfitableItem);

// 🔁 8. Repeat customers
router.get("/customers/repeat", getRepeatCustomers);

export default router;
