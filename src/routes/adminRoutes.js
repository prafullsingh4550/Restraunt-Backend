import express from "express";
import { createAdmin, loginAdmin } from "../controllers/adminController.js";
import { updateOrderStatus } from "../controllers/orderController.js";
import { verifyAdmin } from "../middleware/auth.js";
import { getMenu } from "../controllers/menuController.js";
import { seedMenuItems ,updateMenuItem, deleteMenuItem} from "../controllers/menuController.js";

const router = express.Router();


router.get("/menu", getMenu);
router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});


// Admin-only: update order status
router.patch("/orders/:orderId/status", verifyAdmin, updateOrderStatus);
router.post("/menu/seed", verifyAdmin, seedMenuItems);
router.patch("/menu/update/:id", verifyAdmin, updateMenuItem);
router.delete("/menu/:id", verifyAdmin, deleteMenuItem);

export default router;
