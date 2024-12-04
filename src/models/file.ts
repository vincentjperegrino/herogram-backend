import mongoose, { Document, Schema } from "mongoose";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image/png", "image/jpeg", "video/mp4", "video/avi"],
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    isShared: {
      type: Boolean,
      default: true,
    },
    sharedLink: {
      type: String,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model<File>("File", fileSchema);

// TypeScript interface for the File document
interface File extends Document {
  name: string;
  path: string;
  url: string;
  type: "image" | "video";
  size: number;
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
  isShared: boolean;
  sharedLink: string | null;
  views: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export default File;
