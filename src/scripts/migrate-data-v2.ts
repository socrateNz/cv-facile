import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";

/**
 * Migration script to upgrade data models to v2
 * - User: remove emailOrPhone field
 * - CV: replace isPublished with status, add phone field
 * - Payment: expand metadata, add paymentMethod, paymentPhone
 */

async function migrateUsers() {
  console.log("🔄 Migrating Users...");
  try {
    const users = await UserModel.find({}).lean();
    
    for (const user of users) {
      const updates: any = {};
      
      // Ensure preferences exist
      if (!user.preferences) {
        updates.preferences = { language: "fr", theme: "light" };
      }
      
      // Ensure createdAt/updatedAt exist
      if (!user.createdAt) {
        updates.createdAt = new Date();
      }
      if (!user.updatedAt) {
        updates.updatedAt = new Date();
      }
      
      if (Object.keys(updates).length > 0) {
        await UserModel.findByIdAndUpdate(user._id, { $set: updates });
      }
    }
    
    console.log(`✅ Migrated ${users.length} users`);
  } catch (error) {
    console.error("❌ User migration failed:", error);
    throw error;
  }
}

async function migrateCVs() {
  console.log("🔄 Migrating CVs...");
  try {
    const cvs = await CVModel.find({}).lean();
    
    for (const cv of cvs) {
      const updates: any = {};
      
      // Migrate isPublished to status
      if (cv.isPublished !== undefined) {
        updates.status = cv.isPublished ? "published" : "draft";
      } else if (!cv.status) {
        updates.status = "draft";
      }
      
      // Ensure email is lowercase
      if (cv.email && cv.email !== cv.email.toLowerCase()) {
        updates.email = cv.email.toLowerCase().trim();
      }
      
      // Ensure timestamps
      if (!cv.createdAt) {
        updates.createdAt = new Date();
      }
      if (!cv.updatedAt) {
        updates.updatedAt = new Date();
      }
      
      // Clean up template enum
      if (cv.template && !["modern", "classic", "premium"].includes(cv.template)) {
        updates.template = "modern";
      }
      
      if (Object.keys(updates).length > 0) {
        await CVModel.findByIdAndUpdate(cv._id, { $set: updates });
      }
    }
    
    console.log(`✅ Migrated ${cvs.length} CVs`);
  } catch (error) {
    console.error("❌ CV migration failed:", error);
    throw error;
  }
}

async function migratePayments() {
  console.log("🔄 Migrating Payments...");
  try {
    const payments = await PaymentModel.find({}).lean();
    
    for (const payment of payments) {
      const updates: any = {};
      
      // Initialize metadata if not exists
      if (!payment.metadata) {
        updates.metadata = {
          attempts: 0,
          lastErrorMessage: "",
          lastAttemptAt: null,
        };
      }
      
      // Update status enum
      if (payment.status === "canceled") {
        updates.status = "failed";
      }
      
      // Set completedAt if completed
      if (payment.status === "completed" && !payment.completedAt) {
        updates.completedAt = payment.createdAt;
      }
      
      // Ensure expiresAt is 30 days from completion
      if (payment.status === "completed" && payment.completedAt) {
        const expiresAt = new Date(payment.completedAt);
        expiresAt.setDate(expiresAt.getDate() + 30);
        updates.expiresAt = expiresAt;
      }
      
      // Ensure timestamps
      if (!payment.createdAt) {
        updates.createdAt = new Date();
      }
      if (!payment.updatedAt) {
        updates.updatedAt = new Date();
      }
      
      if (Object.keys(updates).length > 0) {
        await PaymentModel.findByIdAndUpdate(payment._id, { $set: updates });
      }
    }
    
    console.log(`✅ Migrated ${payments.length} payments`);
  } catch (error) {
    console.error("❌ Payment migration failed:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectToDatabase();
    console.log("✅ Connected to MongoDB\n");
    
    await migrateUsers();
    await migrateCVs();
    await migratePayments();
    
    console.log("\n✅ All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
