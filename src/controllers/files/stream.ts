import { Request, Response } from "express";
import mongoose from "mongoose";
import File from "../../models/file";

export const stream = async (req: Request, res: Response): Promise<void> => {
  const { userId, fileName } = req.params;

  try {
    // Convert userId to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Find the file by its uploadedBy (userId as ObjectId) and fileName
    const file = await File.findOne({ uploadedBy: objectId, name: fileName });

    if (!file || !file.isShared) {
      res.status(404).json({ message: "File not found or not shared" });
      return;
    }

    // Get the database and use GridFSBucket to fetch the file
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection is not established.");
    }

    const { GridFSBucket } = mongoose.mongo;
    const bucket = new GridFSBucket(db);

    // Open the download stream for the file using its path or name
    const downloadStream = bucket.openDownloadStreamByName(file.name);

    // Set headers for serving the file in the browser
    res.setHeader("Content-Type", file.type); // Use the file's MIME type
    res.setHeader("Content-Disposition", `inline; filename="${file.name}"`); // Inline display in the browser

    downloadStream.on("data", (chunk) => {
      res.write(chunk); // Write file data to the response stream
    });

    downloadStream.on("end", () => {
      res.end(); // End the response when the file is fully sent
    });

    downloadStream.on("error", (err) => {
      console.error("Error while viewing the file:", err);
      res.status(500).json({ message: "Error while viewing the file" });
    });
  } catch (error) {
    console.error("Error during file retrieval:", error);
    res.status(500).json({ message: "Error while retrieving the file" });
  }
};
