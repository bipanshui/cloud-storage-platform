import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { DEFAULT_STORAGE_LIMIT_BYTES } from "../utils/constants.js";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    avatar: {
      type: String,
      default: null,
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
    storageLimit: {
      type: Number,
      default: DEFAULT_STORAGE_LIMIT_BYTES,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.virtual("storageUsedPercentage").get(function storageUsedPercentage() {
  if (!this.storageLimit) {
    return 0;
  }

  return Math.min(100, Math.round((this.storageUsed / this.storageLimit) * 100));
});

userSchema.pre("save", async function hashPassword(next) {
  try {
    if (!this.isModified("password")) {
      next();
      return;
    }

    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compares a plain-text password against the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Returns a sanitized JSON representation of the user.
 * @returns {Record<string, unknown>}
 */
userSchema.methods.toJSON = function toJSON() {
  const object = this.toObject({ virtuals: true });
  delete object.password;
  delete object.refreshTokens;
  delete object.__v;
  return object;
};

export const User = mongoose.model("User", userSchema);

