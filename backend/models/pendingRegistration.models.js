import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const pendingRegistrationSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: "" },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: true, unique: true, trim: true },
  address: { type: String, trim: true, default: "" },
  dob: { type: String, trim: true, default: "" },
  gender: { type: String, trim: true, default: "" },
  emailVerificationToken: { type: String, required: true },
  emailVerificationExpires: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

pendingRegistrationSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

const PendingRegistration = mongoose.models.PendingRegistration
  || mongoose.model("PendingRegistration", pendingRegistrationSchema);

export default PendingRegistration;
