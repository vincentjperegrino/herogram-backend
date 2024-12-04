import { Request, Response } from 'express';
import bcrypt from 'bcrypt';  // Import bcrypt
import User from '../../models/user';  // Adjust the path if needed

export const create = async (req: Request, res: Response): Promise<void> => {
  const { email, password, firstName, lastName, role, profilePicture } = req.body;

  // Validate incoming data
  if (!email || !password || !firstName || !lastName) {
    res.status(400).json({ message: 'Email, password, first name, and last name are required.' });
    return;
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email is already in use.' });
      return;
    }

    // Hash the password using bcrypt (with a saltRounds of 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided data, and default values where necessary
    const newUser = new User({
      email,
      password: hashedPassword,  // Store the hashed password, not the plain-text password
      firstName,
      lastName,
      role: role || 'user',  // Default to 'user' if no role is provided
      profilePicture: profilePicture || null,  // Default to null if no profile picture is provided
    });

    // Save the user to the database
    await newUser.save();

    // Respond with the created user data (excluding password for security)
    res.status(201).json({
      user: {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        profilePicture: newUser.profilePicture,
        lastLogin: newUser.lastLogin,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    // Handle errors
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user.', error });
  }
};