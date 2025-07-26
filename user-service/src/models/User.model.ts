import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface to define the properties of a User document
export interface IUser extends Document {
  _id: Types.ObjectId; 
  
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordMatch(password: string): Promise<boolean>;
}


const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, trim: true },
}, { timestamps: true });

// Pre-save hook to hash the password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Method to compare candidate password with the stored hash
UserSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash);
};

export const User = model<IUser>('User', UserSchema);