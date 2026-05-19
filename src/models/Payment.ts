import { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cvId: { type: Schema.Types.ObjectId, ref: "CV", required: true, index: true },
    amount: { type: Number, default: 500 },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "expired"],
      default: "pending",
      index: true,
    },
    paymentMethod: { type: String, enum: ["mtn", "orange"], default: null },
    paymentPhone: { type: String, default: "", trim: true },
    reference: { type: String, required: true, unique: true, index: true },
    transactionId: { type: String, default: "", index: true },
    completedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null, index: true },
    metadata: {
      attempts: { type: Number, default: 0 },
      lastErrorMessage: { type: String, default: "" },
      lastAttemptAt: { type: Date, default: null },
    },
    deletedAt: { type: Date, default: null, index: true },
    createdAt: { type: Date, default: () => new Date(), index: true },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

// Update updatedAt before saving
PaymentSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export const PaymentModel = models.Payment || model("Payment", PaymentSchema);
