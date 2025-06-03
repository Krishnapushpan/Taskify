// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema(
//   {
//     orderId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     currency: {
//       type: String,
//       required: true,
//       default: "INR",
//     },
//     paymentId: {
//       type: String,
//        required: true,
//       unique: true,
//     },
//     signature: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "completed", "failed"],
//       default: "pending",
//     },
//     paymentMethod: {
//       type: String,
//       enum: ["razorpay", "other"],
//       default: "razorpay",
//     },
//     paymentDetails: {
//       type: Object,
//       default: {},
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Payment = mongoose.model("Payment", paymentSchema);

// export default Payment; 