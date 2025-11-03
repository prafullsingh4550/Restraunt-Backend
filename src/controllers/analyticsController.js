import Order from "../models/Order.js";

/**
 * 1️⃣ Summary Stats – total orders, revenue, items, AOV
 */
export const getSummaryStats = async (req, res) => {
  try {
    const { start, end } = req.query;
    const filter = {};

    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }

    const [stats] = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          totalItemsSold: { $sum: { $sum: "$items.qty" } },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]);

    res.json(
      stats || {
        totalOrders: 0,
        totalRevenue: 0,
        totalItemsSold: 0,
        avgOrderValue: 0,
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2️⃣ Daily trend – last X days
 */
export const getOrdersDaily = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3️⃣ Hourly trend – for today or given date
 */
export const getOrdersHourly = async (req, res) => {
  try {
    const date = req.query.date
      ? new Date(req.query.date)
      : new Date(); // default today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 4️⃣ Top Selling Items
 */
export const getTopSellingItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5️⃣ Veg vs Non-Veg Stats
 */
export const getVegVsNonVegStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "menuitems",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $group: {
          _id: "$menuItem.veg",
          totalSold: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
    ]);

    const vegData = result.find((r) => r._id === true) || { totalSold: 0, totalRevenue: 0 };
    const nonVegData = result.find((r) => r._id === false) || { totalSold: 0, totalRevenue: 0 };

    res.json({ veg: vegData, nonVeg: nonVegData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 6️⃣ Category-wise Sales
 */
export const getCategorySales = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "menuitems",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "menuItem",
        },
      },
      { $unwind: "$menuItem" },
      {
        $lookup: {
          from: "categories",
          localField: "menuItem.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          totalSold: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 7️⃣ Most Profitable Item (highest revenue)
 */
export const getMostProfitableItem = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [item] = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 1 },
    ]);

    res.json(item || { _id: null, revenue: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * 8️⃣ Repeat Customers (top by order count)
 */
export const getRepeatCustomers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await Order.aggregate([
      {
        $group: {
          _id: "$customerPhone",
          name: { $first: "$customerName" },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { totalOrders: -1 } },
      { $limit: limit },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
