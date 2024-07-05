import express from 'express'
import {initiatePasswordReset, resetPassword, userLogin,userRegister, verifyEmail} from '../Controllers/UserController.js'
import { VerifyAuthToken } from '../Middleware/authMiddleware.js'; 
 
const router = express.Router();

router.post('/register',userRegister)
router.get('/verify-email', verifyEmail);
router.post('/login',userLogin)

router.post('/initiate-password-reset', initiatePasswordReset);
router.post('/reset-password', resetPassword);

export default router;