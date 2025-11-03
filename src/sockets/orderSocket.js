export const registerOrderSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("join_table", ({ tableNumber }) => {
      socket.join(`table-${tableNumber}`);
      console.log(`Socket ${socket.id} joined table-${tableNumber}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};

export const emitOrderUpdate = (io, tableNumber, order) => {
  io.to(`table-${tableNumber}`).emit("order_updated", order);
};
