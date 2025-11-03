// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import morgan from "morgan";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { connectDB } from "./db.js";
// import { registerOrderSocket } from "./sockets/orderSocket.js";
// import cookieParser from "cookie-parser";

// import menuRoutes from "./routes/menuRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import reviewRoutes from "./routes/reviewRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";


// dotenv.config();
// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, { cors: { origin: "*" } });

// app.set("io", io); 

// app.use(cors());
// app.use(express.json());
// app.use(morgan("dev"));
// app.use(cookieParser());

// connectDB();

// app.use("/api/v1/menu", menuRoutes);
// app.use("/api/v1/orders", orderRoutes);
// app.use("/api/v1/reviews", reviewRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use(express.static("public"));


// registerOrderSocket(io);

// const PORT = process.env.PORT || 3000;
// httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./db.js";
import { registerOrderSocket } from "./sockets/orderSocket.js";
import cookieParser from "cookie-parser";

import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();
const app = express();

// ✅ 1. Define allowed frontend origins
const allowedOrigins = [
  "http://localhost:8080", // your Vite frontend
  "http://127.0.0.1:8080"
];

// ✅ 2. Express CORS setup (for REST API)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allows cookies / authorization headers
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ 3. Core middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// ✅ 4. DB connect
connectDB();

// ✅ 5. Create HTTP + Socket.io server
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Attach io to app for use inside controllers
app.set("io", io);

// ✅ 6. REST API routes
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin/analytics", analyticsRoutes);

// ✅ 7. Static files (for images or uploads)
app.use(express.static("public"));

// ✅ 8. Register socket.io events
registerOrderSocket(io);

// ✅ 9. Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
