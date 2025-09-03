# 🔐 Email Authentication Setup Guide

## 🚀 Quick Start

### 1. **Set up Environment Variables**
Run this command in the `server` directory to create your `.env` file:
```bash
cd server
node setup-env.js
```

**IMPORTANT**: After running the script, manually edit the `.env` file and change the `JWT_SECRET` to a secure random string. You can generate one at: https://generate-secret.vercel.app/32

### 2. **Install Dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. **Set up Database**
Make sure your PostgreSQL database is running and accessible with the credentials in your `.env` file.

### 4. **Run Database Migrations**
```bash
cd server
npx prisma migrate dev
```

### 5. **Start the Application**
```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

## 🔧 What's Been Implemented

### ✅ **Backend Authentication**
- Email-based login system
- JWT token generation and verification
- Password hashing with bcrypt
- Protected routes middleware
- User registration and login endpoints

### ✅ **Frontend Authentication**
- Authentication context for state management
- Protected route wrapper
- Navigation component with login/logout
- Automatic token handling
- Redirect after login

### ✅ **Security Features**
- JWT tokens with expiration
- Password hashing
- Protected API endpoints
- Automatic token validation

## 📱 How to Use

### **For New Users:**
1. Go to `/signup`
2. Create account with email, username, and password
3. You'll be redirected to login
4. Login with your email and password
5. Access protected pages (Dashboard, Profile)

### **For Existing Users:**
1. Go to `/login`
2. Enter email and password
3. Access protected pages automatically

## 🛡️ Protected Routes
- `/dashboard` - Requires authentication
- `/profile` - Requires authentication
- All API endpoints under `/api/projects` and `/api/tasks` require authentication

## 🔍 Testing Your Setup

### **Test Database Connection:**
Visit: `http://localhost:3001/api/test`

### **Test Authentication:**
1. Create a user at `/signup`
2. Login at `/login`
3. Try accessing `/dashboard` (should work)
4. Try accessing `/dashboard` without login (should redirect to login)

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Database connection failed"**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in `.env` file
   - Ensure database `tamid_db` exists

2. **"JWT_SECRET not defined"**
   - Make sure `.env` file exists in server directory
   - Check JWT_SECRET is set in `.env`

3. **"CORS error"**
   - Backend should be running on port 3001
   - Frontend should be running on port 5173 (Vite default)

4. **"User not found" during login**
   - Check if user was created successfully
   - Verify email spelling
   - Check database for user record

## 🔐 Security Notes

- **Change the default JWT_SECRET** in production
- **Use HTTPS** in production
- **Implement rate limiting** for login attempts
- **Add password complexity requirements** if needed
- **Consider adding 2FA** for additional security

## 📚 API Endpoints

### **Public Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/test` - Database connection test

### **Protected Endpoints:**
- `GET /api/auth/profile` - Get user profile
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create project
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task

All protected endpoints require the `Authorization: Bearer <token>` header.

## 🎯 Next Steps

After setting up authentication, you can:
1. **Customize user roles** (admin, user, etc.)
2. **Add password reset functionality**
3. **Implement email verification**
4. **Add social login** (Google, GitHub, etc.)
5. **Enhance security** with rate limiting and 2FA

---

**Need Help?** Check the console logs in both frontend and backend for detailed error messages.


