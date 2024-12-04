import { Router } from 'express';
import UserController from '../controllers/users';

const userRoutes = Router();

userRoutes.post('/create', UserController.create);
userRoutes.post('/login', UserController.login);

export default userRoutes;