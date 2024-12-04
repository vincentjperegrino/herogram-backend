import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './database/mongoose';
import userRoutes from './routes/user';
import fileRoutes from './routes/file';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
});