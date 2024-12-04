import { Request, Response } from 'express';
import File from '../../models/file'; // Import the File model

export const get = async (req: Request, res: Response): Promise<void> => {
  try {
    // Query the files by userId using the File model
    const files = await File.find({ uploadedBy: req.user.userId });

    if (files.length === 0) {
      res.status(404).json({ message: 'No files found for this user' });
      return;
    }

    // Return the entire file objects
    res.status(200).json({ files });

  } catch (error) {
    console.error('Error while retrieving files:', error);
    res.status(500).json({ message: 'Error while retrieving files' });
  }
};