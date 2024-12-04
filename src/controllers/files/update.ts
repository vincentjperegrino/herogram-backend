import mongoose from "mongoose";
import { Request, Response } from "express";
import File from "../../models/file";
import generateSharedLink from "../../utils/link-generator";

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params; // Get fileId from the route parameter
    const { tags, views, isShared, order } = req.body; // Get updated fields from the request body

    // Convert fileId to ObjectId
    const objectId = new mongoose.Types.ObjectId(fileId);

    // Find the file by its ID
    const file = await File.findById(objectId);
    if (!file) {
      res.status(404).json({ message: "File not found." });
      return;
    }

    // Update file metadata
    if (Array.isArray(tags)) {
      file.tags = tags; // Directly assign the array of strings
    }

    if (views !== undefined) {
      file.views = views; // Update views count
    }

    if (isShared !== undefined) {
      file.isShared = isShared;
      if (file.isShared) {
        file.sharedLink = generateSharedLink(); // Generate a new shared link if shared
      } else {
        file.sharedLink = null; // Clear the shared link if not shared
      }
    }

    if (order !== undefined) {
      // Update order if it's provided in the request
      file.order = order;
    }

    // Save the updated file
    await file.save();

    // Respond with the updated file metadata
    res.status(200).json({ file });
  } catch (error) {
    res.status(500).json({ message: "Failed to update file", error });
  }
};