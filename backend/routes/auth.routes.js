import express from "express";
import { 
  register, 
  login, 
  verify2FA, 
  resend2FAOtp, 
  logout, 
  forgotPassword, 
  resetPassword, 
  getSession, 
  updateProfile, 
  verifyEmail, 
  resendVerificationEmail, 
  pollVerificationStatus 
} from '../controllers/auth.controllers.js';
import jwt from "jsonwebtoken";
import { requireAuth, verifyAuthToken } from "../middlewares/auth.middleware.js";
import User from "../models/userAuth.models.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const protectView = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.redirect("/login.html");
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing. Refusing to serve a protected view.");
    return res.status(500).send("Server authentication is not configured.");
  }

  try {
    const decoded = verifyAuthToken(token);
    const user = await User.findById(decoded.id).select("role").lean();
    if (!user || user.role !== decoded.role) {
      res.clearCookie("token");
      return res.redirect("/login.html");
    }
    req.user = { ...decoded, role: user.role };
    next();
  } catch (error) {
    res.clearCookie("token");
    return res.redirect("/login.html");
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.redirect("/index.html"); 
    }
    next();
  };
};

router.post('/api/auth/register', register);
router.post('/api/auth/login', login);
router.post('/api/auth/verify-2fa', verify2FA);
router.post('/api/auth/resend-2fa', resend2FAOtp);
router.all('/api/auth/logout', logout);
router.get('/api/auth/session', requireAuth, getSession);
router.put('/api/auth/profile', requireAuth, updateProfile);

router.get('/api/auth/verify-email', verifyEmail);
router.post('/api/auth/verify-email', verifyEmail);
router.post('/api/auth/poll-verification', pollVerificationStatus);
router.post('/api/auth/resend-verification', (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    return requireAuth(req, res, () => resendVerificationEmail(req, res));
  }
  return resendVerificationEmail(req, res);
});

router.post('/api/auth/forgot-password', forgotPassword);
router.post('/api/auth/reset-password', resetPassword);

router.get(['/verify-email', '/verify-email.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/verify-email.html'));
});

router.get('/reset-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/reset-password.html'));
});

const adminPages = [
  'admin.html',
  'addnewproduct.html',
  'adminleadshow.html',
  'adminproduct.html',
  'adminupdateproduct.html',
  'adminUserquery.html'
];

const registerProtectedViews = (pages, roles) => {
  pages.forEach((page) => {
    const cleanPageName = page.replace(/\.html$/, '');
    const sendProtectedPage = (req, res) => {
      res.sendFile(path.join(__dirname, `../../frontend/${page}`)); 
    };

    router.get(`/${page}`, protectView, authorizeRoles(...roles), sendProtectedPage);
    router.get(`/${cleanPageName}`, protectView, authorizeRoles(...roles), sendProtectedPage);
  });
};

registerProtectedViews(adminPages, ['admin']);

const seoPages = [
  'seoadmin.html',
  'seoadminupdate.html',
  'seoallpost.html',
  'seoproduct.html',
  'seoproductupdate.html'
];

registerProtectedViews(seoPages, ['seoadmin', 'admin']);
registerProtectedViews(['affiliate.html'], ['affiliate']);

export default router;
