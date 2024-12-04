import fs from "fs";
import mongoose from "mongoose";
import { Request, Response } from "express";
import File from "../../models/file";
import generateSharedLink from "../../utils/link-generator";

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    // Access the files uploaded by multer
    const files = req.files as Express.Multer.File[]; // Cast to an array of files

    // Extract tags from the request body (parse if it's a string)
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

    if (!files || files.length === 0) {
      res.status(400).json({ message: "No files uploaded." });
      return;
    }

    // Retrieve userId from req.user
    const userId = req.user.userId;

    // Use the `db` instance from mongoose
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection is not established.");
    }

    // Use the GridFSBucket from mongoose's internal mongodb
    const { GridFSBucket } = mongoose.mongo;
    const bucket = new GridFSBucket(db);

    // Process each file
    const uploadResults: { name: string; url: string; sharedLink: string | null; tags: string[] }[] = [];
    for (const file of files) {
      const uploadStream = bucket.openUploadStream(file.originalname);
      const fileStream = fs.createReadStream(file.path);

      // Handle stream events in a promise to await each file upload
      await new Promise<void>((resolve, reject) => {
        fileStream
          .pipe(uploadStream)
          .on("finish", async () => {
            try {
              const baseUrl = process.env.BASE_URL;

              const parsedUserId = new mongoose.Types.ObjectId(`${userId}`);

              // Generate a shared link for the file
              const sharedLink = generateSharedLink();

              // Save the file metadata in the database including tags
              const fileMetadata = new File({
                name: file.originalname,
                path: file.path,
                url: `${baseUrl}/files/${userId}/${file.originalname}`,
                type: file.mimetype,
                size: file.size,
                uploadedBy: parsedUserId,
                isShared: true,
                views: 0,
                sharedLink,
                tags: tags, // Save the tags
              });

              await fileMetadata.save();

              // Clean up: delete the temporary file
              await fs.promises.unlink(file.path);

              uploadResults.push({
                name: file.originalname,
                url: fileMetadata.url,
                sharedLink: fileMetadata.sharedLink,
                tags: fileMetadata.tags, // Include the tags in the response
              });

              resolve();
            } catch (err) {
              reject(err);
            }
          })
          .on("error", async (error) => {
            await fs.promises.unlink(file.path);
            reject(error);
          });
      });
    }

    // Respond with success and metadata for all uploaded files, including tags
    res.status(200).json({
      files: uploadResults
    });
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error });
  }
};