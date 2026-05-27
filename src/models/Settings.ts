import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISettings extends Document {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  };
  payment: {
    notchpayApiKey: string;
    notchpaySecret: string;
    paymentAmount: number;
    currency: string;
    sandboxMode: boolean;
  };
  security: {
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  notifications: {
    adminEmail: string;
    notifyOnNewUser: boolean;
    notifyOnNewPayment: boolean;
    notifyOnNewCV: boolean;
  };
  appearance: {
    primaryColor: string;
    logoUrl: string;
    faviconUrl: string;
  };
  limits: {
    maxCVPerUser: number;
    maxFileSize: number;
    cvRetentionDays: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    general: {
      siteName: { type: String, default: "CV Facile" },
      siteDescription: { type: String, default: "Plateforme de création de CV professionnels" },
      contactEmail: { type: String, default: "contact@cvfacile.com" },
      contactPhone: { type: String, default: "+237 6XX XXX XXX" },
      address: { type: String, default: "Douala, Cameroun" },
    },
    payment: {
      notchpayApiKey: { type: String, default: "" },
      notchpaySecret: { type: String, default: "" },
      paymentAmount: { type: Number, default: 500 },
      currency: { type: String, default: "XAF" },
      sandboxMode: { type: Boolean, default: true },
    },
    security: {
      allowRegistration: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 60 },
      maxLoginAttempts: { type: Number, default: 5 },
    },
    notifications: {
      adminEmail: { type: String, default: "admin@cvfacile.com" },
      notifyOnNewUser: { type: Boolean, default: true },
      notifyOnNewPayment: { type: Boolean, default: true },
      notifyOnNewCV: { type: Boolean, default: true },
    },
    appearance: {
      primaryColor: { type: String, default: "#4F46E5" },
      logoUrl: { type: String, default: "" },
      faviconUrl: { type: String, default: "" },
    },
    limits: {
      maxCVPerUser: { type: Number, default: 10 },
      maxFileSize: { type: Number, default: 5 },
      cvRetentionDays: { type: Number, default: 30 },
    },
  },
  { timestamps: true }
);

export const SettingsModel =
  (mongoose.models.Settings as Model<ISettings>) ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
