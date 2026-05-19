import { Schema, model, models } from "mongoose";

const ExperienceSchema = new Schema(
  {
    company: String,
    role: String,
    startDate: String,
    endDate: String,
    summary: String,
  },
  { _id: false },
);

const EducationSchema = new Schema(
  {
    school: String,
    degree: String,
    startDate: String,
    endDate: String,
  },
  { _id: false },
);

const CVSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fullName: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    title: { type: String, default: "", trim: true },
    summary: { type: String, default: "" },
    experiences: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    skills: { type: [String], default: [] },
    photoUrl: { type: String, default: "" },
    template: {
      type: String,
      enum: [
        "modern",
        "classic",
        "premium",
        "minimal",
        "modern-timeline",
        "classic-columns",
      ],
      default: "modern",
    },
    status: { type: String, enum: ["draft", "ready", "published"], default: "draft" },
    deletedAt: { type: Date, default: null, index: true },
    createdAt: { type: Date, default: () => new Date(), index: true },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false },
);

// Update updatedAt before saving
CVSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export const CVModel = models.CV || model("CV", CVSchema);
