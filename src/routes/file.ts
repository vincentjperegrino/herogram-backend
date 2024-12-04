import { Router } from 'express';
import multer from 'multer';
import FileController from '../controllers/files';
import { authenticate } from '../middlewares/authenticate';

const fileRoutes = Router();

// Configure multer for temporary file storage
const multerUpload = multer({ dest: 'uploads/' }); // Temporary directory for uploaded files

// POST route for file upload
fileRoutes.post('/upload', authenticate, multerUpload.array('files'), FileController.upload);
fileRoutes.put("/update/:fileId", authenticate, multerUpload.single("file"), FileController.update);
fileRoutes.get('/view/:fileId', FileController.view);
fileRoutes.get('/:userId/:fileName', FileController.stream);
fileRoutes.get('/', authenticate, FileController.get);

export default fileRoutes;