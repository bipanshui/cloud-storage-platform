import mongoose from "mongoose";
import { formatBytes, getFileCategoryFromMime } from "../utils/helpers.js";

const sharedWithSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permission: {
      type: String,
      enum: ["view", "edit"],
      default: "view",
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const shareLinkSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      default: null,
    },
    permission: {
      type: String,
      enum: ["view", "edit"],
      default: "view",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    extension: {
      type: String,
      default: null,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentFolderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    s3Key: {
      type: String,
      required: true,
    },
    s3Url: {
      type: String,
      required: true,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    sharedWith: {
      type: [sharedWithSchema],
      default: [],
    },
    shareLink: {
      type: shareLinkSchema,
      default: () => ({}),
    },
    metadata: {
      width: Number,
      height: Number,
      duration: Number,
      pages: Number,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.s3Key;
        delete ret.s3Url;
        if (ret.shareLink) {
          delete ret.shareLink.token;
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

fileSchema.index({ userId: 1, parentFolderId: 1 });
fileSchema.index({ userId: 1, isDeleted: 1 });
fileSchema.index({ userId: 1, isStarred: 1 });
fileSchema.index({ name: "text" });
fileSchema.index({ "shareLink.token": 1 }, { sparse: true });

fileSchema.pre("save", function updateTimestamp() {
  this.updatedAt = new Date();
});

fileSchema.virtual("formattedSize").get(function formattedSize() {
  return formatBytes(this.size);
});

fileSchema.virtual("fileCategory").get(function fileCategory() {
  return getFileCategoryFromMime(this.type);
});

export const File = mongoose.model("File", fileSchema);
