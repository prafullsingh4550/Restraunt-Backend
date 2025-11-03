// controllers/orderController.js
import Order from "../models/Order.js";

/**
 * Place a new order
 */
export const placeOrder = async (req, res) => {
  try {
    const { tableNumber, customerName, customerPhone, items } = req.body;

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = +(subtotal * 0.1).toFixed(2);
    const total = subtotal + tax;
    const orderId = "ORD" + Date.now();

    const order = await Order.create({
      orderId,
      tableNumber,
      customerName,
      customerPhone,
      items,
      subtotal,
      tax,
      total,
    });

    const io = req.app.get("io");
    if (io) io.to(`table-${tableNumber}`).emit("order_created", order);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get single order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecentOrdersByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    // ✅ Calculate timestamp for 6 hours ago
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

    // ✅ Find all orders placed by this phone number in last 6 hours
    const orders = await Order.find({
      customerPhone: phone,
      createdAt: { $gte: sixHoursAgo },
    }).sort({ createdAt: -1 }); // latest first

    if (!orders.length) {
      return res.status(404).json({
        message: `No orders found for ${phone} in the last 6 hours.`,
      });
    }

    res.json({
      phone,
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * Get all orders (admin filter)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { orderStatus, tableNumber, startDate, endDate, paymentStatus } = req.query;
    const filter = {};

    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (tableNumber) filter.tableNumber = Number(tableNumber);
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update order status (admin)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, estimatedReadyAt } = req.body;

    const order = await Order.findOneAndUpdate(
      { orderId },
      { orderStatus: status, estimatedReadyAt },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    const io = req.app.get("io");
    if (io) {
      const payload = {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        estimatedReadyAt: order.estimatedReadyAt,
        updatedAt: order.updatedAt,
      };
      io.to(`table-${order.tableNumber}`).emit("order_updated", payload);
      io.emit("admin_order_updated", payload);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete order (admin)
 */
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    await Order.deleteOne({ orderId });

    res.json({ message: `✅ Order ${orderId} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};







// import Order from "../models/Order.js";

// /**
//  * Place order (unchanged)
//  */
// export const placeOrder = async (req, res) => {
//   try {
//     const { tableNumber, customerName, customerPhone, items } = req.body;

//     const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
//     const tax = +(subtotal * 0.1).toFixed(2);
//     const total = subtotal + tax;
//     const orderId = "ORD" + Date.now();

//     const order = await Order.create({
//       orderId,
//       tableNumber,
//       customerName,
//       customerPhone,
//       items,
//       subtotal,
//       tax,
//       total,
//     });

//     // emit initial order event to the table room (if clients are connected)
//     const io = req.app.get("io");
//     if (io) {
//       io.to(`table-${tableNumber}`).emit("order_created", order);
//     }

//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findOne({ orderId: req.params.orderId });
//     if (!order) return res.status(404).json({ error: "Order not found" });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// /**
//  * Admin-only: update order status and emit socket update.
//  * Uses req.app.get('io') to get the server io instance.
//  */
// // controllers/orderController.js


// export const deleteOrder = async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     const order = await Order.findOne({ orderId });
//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }

//     await Order.deleteOne({ orderId });

//     res.json({ message: `Order ${orderId} deleted successfully.` });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // controllers/orderController.js

// export const getAllOrders = async (req, res) => {
//   try {
//     const { orderStatus, tableNumber, startDate, endDate, paymentStatus } = req.query;

//     const filter = {};

//     // ✅ Filter by order status (received, preparing, served, completed)
//     if (orderStatus) filter.orderStatus = orderStatus;

//     // ✅ Optionally filter by payment status (pending, paid, etc.)
//     if (paymentStatus) filter.paymentStatus = paymentStatus;

//     // ✅ Filter by table number
//     if (tableNumber) filter.tableNumber = Number(tableNumber);

//     // ✅ Filter by date range (ISO format)
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) filter.createdAt.$gte = new Date(startDate);
//       if (endDate) filter.createdAt.$lte = new Date(endDate);
//     }

//     // ✅ Query with filters and sort by most recent
//     const orders = await Order.find(filter).sort({ createdAt: -1 });

//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status, estimatedReadyAt } = req.body;

//     const order = await Order.findOneAndUpdate(
//       { orderId },
//       { orderStatus: status, estimatedReadyAt },
//       { new: true }
//     );

//     if (!order) return res.status(404).json({ error: "Order not found" });

//     const io = req.app.get("io");
//     if (io) {
//       // payload: minimal fields for client UI
//       const payload = {
//         orderId: order.orderId,
//         orderStatus: order.orderStatus,
//         estimatedReadyAt: order.estimatedReadyAt,
//         updatedAt: order.updatedAt,
//       };
//       io.to(`table-${order.tableNumber}`).emit("order_updated", payload);
//       // also emit to an admin broadcast channel if you want:
//       io.emit("admin_order_updated", payload);
//     }

//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
