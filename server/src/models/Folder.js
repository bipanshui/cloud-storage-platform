import mongoose from "mongoose";

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

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
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
    path: {
      type: String,
      default: "/",
    },
    depth: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: null,
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
      itemCount: {
        type: Number,
        default: 0,
      },
      totalSize: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
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

folderSchema.index({ userId: 1, parentFolderId: 1 });
folderSchema.index({ userId: 1, isDeleted: 1 });
folderSchema.index({ userId: 1, path: 1 });
folderSchema.index({ name: "text" });
folderSchema.index({ "shareLink.token": 1 }, { sparse: true });
folderSchema.index(
  { userId: 1, parentFolderId: 1, name: 1 },
  { unique: true }
);

folderSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

folderSchema.pre("save", function validateFolderName(next) {
  const invalidChars = /[\\/:*?"<>|]/;
  if (this.name && invalidChars.test(this.name)) {
    throw new Error(
      "Folder name cannot contain special characters: \\ / : * ? \" < > |"
    );
  }
  if (this.name && this.name.trim().length === 0) {
    throw new Error("Folder name cannot be empty");
  }
  next();
});

folderSchema.methods.getFullPath = async function () {
  if (this.parentFolderId === null) {
    return `/${this.name}`;
  }

  const parent = await mongoose.model("Folder").findById(this.parentFolderId);
  if (!parent) {
    return `/${this.name}`;
  }

  const parentPath = await parent.getFullPath();
  return `${parentPath}/${this.name}`;
};

folderSchema.methods.getAncestors = async function () {
  const ancestors = [];
  let current = this;

  while (current.parentFolderId) {
    const parent = await mongoose.model("Folder").findById(current.parentFolderId);
    if (!parent) break;
    ancestors.unshift({ _id: parent._id, name: parent.name, path: parent.path });
    current = parent;
  }

  return ancestors;
};

folderSchema.methods.getChildren = async function () {
  return mongoose.model("Folder").find({
    parentFolderId: this._id,
    isDeleted: false,
  });
};

export const Folder = mongoose.model("Folder", folderSchema);