import { Schema, model, models } from "mongoose";

export type UserRole = "user" | "admin";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true },
    fullName: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    preferences: {
      language: { type: String, default: "fr" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
    deletedAt: { type: Date, default: null, index: true },
    createdAt: { type: Date, default: () => new Date(), index: true },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

// Update updatedAt before saving
UserSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export const UserModel = models.User || model("User", UserSchema);
