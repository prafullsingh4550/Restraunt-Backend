import Review from "../models/Review.js";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";

export const addReview = async (req, res) => {
  try {
    const { orderId, itemReviews, staffRating, ambienceRating, overallRating, experience, suggestions } = req.body;

    // find the order to get customer details
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // create review
    const review = await Review.create({
      orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      itemReviews,
      staffRating,
      ambienceRating,
      overallRating,
      experience,
      suggestions,
    });

    res.status(201).json({
      message: "✅ Review submitted successfully",
      review,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/**
 * 📋 Get all reviews (Admin only)
 * Includes: customer info, ordered items, rating, and review text
 */

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.json(
      reviews.map((r) => ({
        orderId: r.orderId,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        itemReviews: r.itemReviews,
        staffRating: r.staffRating,
        ambienceRating: r.ambienceRating,
        overallRating: r.overallRating,
        experience: r.experience,
        suggestions: r.suggestions,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/reviewController.js
/**
 * GET /api/reviews/filter
 * Query params:
 *  - ratingType: staffRating | ambienceRating | overallRating
 *  - ratingValue: 1..5
 *  - day: YYYY-MM-DD
 *  - month: YYYY-MM
 *  - startDate & endDate: ISO dates or YYYY-MM-DD
 *  - page, limit: pagination
 */

// GET /api/reviews/filter?ratingType=staffRating&rating=5
// or ?ratingType=ambienceRating&rating=4
// or ?ratingType=overallRating&rating=3
// and optionally ?day=2025-11-02 or ?month=2025-11
export const filterReviews = async (req, res) => {
  try {
    const { ratingType, rating, day, month } = req.query;

    // Validate ratingType
    if (!["staffRating", "ambienceRating", "overallRating"].includes(ratingType)) {
      return res.status(400).json({
        error: "Invalid ratingType. Use staffRating, ambienceRating, or overallRating.",
      });
    }

    const query = {};

    // Filter by rating value
    if (rating) {
      query[ratingType] = Number(rating);
    }

    // Filter by day
    if (day) {
      const startOfDay = new Date(day);
      const endOfDay = new Date(day);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.createdAt = { $gte: startOfDay, $lt: endOfDay };
    }

    // Filter by month (e.g., 2025-11)
    if (month) {
      const [year, monthPart] = month.split("-").map(Number);
      if (!year || !monthPart || monthPart < 1 || monthPart > 12) {
        return res.status(400).json({ error: "Invalid month format. Use YYYY-MM." });
      }
      const startOfMonth = new Date(year, monthPart - 1, 1);
      const endOfMonth = new Date(year, monthPart, 1);
      query.createdAt = { $gte: startOfMonth, $lt: endOfMonth };
    }

    // Fetch matching reviews
    const reviews = await Review.find(query).sort({ createdAt: -1 });

    res.json({
      count: reviews.length,
      filtersApplied: { ratingType, rating, day, month },
      reviews,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
