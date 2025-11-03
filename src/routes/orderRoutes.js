import express from "express";
import { placeOrder, getOrderById ,getAllOrders ,deleteOrder,getRecentOrdersByPhone} from "../controllers/orderController.js";
import { verifyAdmin } from "../middleware/auth.js";
const router = express.Router();


router.post("/", placeOrder);
router.get("/", verifyAdmin, getAllOrders);
router.get("/:orderId", getOrderById);
router.get("/recent/:phone", getRecentOrdersByPhone);
router.delete("/:orderId", verifyAdmin, deleteOrder);

export default router;
