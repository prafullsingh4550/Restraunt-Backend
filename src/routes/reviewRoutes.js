import express from "express";
import { addReview ,getAllReviews, filterReviews} from "../controllers/reviewController.js";
const router = express.Router();

import { verifyAdmin } from "../middleware/auth.js";


router.post("/", addReview);


// 🛡️ Admin-protected route
router.use(verifyAdmin);

// 📋 GET all reviews
router.get("/", getAllReviews);

router.get("/filter", filterReviews);

export default router;
