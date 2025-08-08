# Frontend Configuration Update Guide

## 🔧 Issue Summary

Your frontend is trying to connect to `https://64.226.70.172/api/v1/auth/login/` but it should be connecting to `https://safespheres.info/api/v1/auth/login/`.

## 🚀 Steps to Fix

### 1. **Update Frontend API Base URL**

In your Vercel frontend, update the API base URL from:
```
https://64.226.70.172/api/v1/
```

To:
```
https://safespheres.info/api/v1/
```

### 2. **Locations to Update**

Look for these files in your frontend project:

#### **Environment Variables** (`.env` or `.env.production`)
```bash
# Change from:
VITE_API_BASE_URL=https://64.226.70.172/api/v1/

# To:
VITE_API_BASE_URL=https://safespheres.info/api/v1/
```

#### **Axios Configuration** (`src/utils/axiosInstance.ts`)
```typescript
// Change from:
const API_BASE_URL = 'https://64.226.70.172/api/v1/';

// To:
const API_BASE_URL = 'https://safespheres.info/api/v1/';
```

#### **Any hardcoded API URLs**
Search your codebase for `64.226.70.172` and replace with `safespheres.info`

### 3. **Redeploy to Vercel**

After making these changes:
1. Commit and push your changes
2. Vercel will automatically redeploy
3. Test the connection

## 🔍 Test the Connection

After updating, test by:

1. **Open browser console** on your Vercel app
2. **Try to login** with your admin credentials:
   - Email: `admin@safespheres.info`
   - Password: `admin123`
3. **Check for CORS errors** - they should be gone

## 📋 Expected Results

After fixing both backend CORS and frontend API URL:

✅ **No more CORS errors**
✅ **Successful API connections**
✅ **Login works properly**
✅ **All API endpoints accessible**

## 🛠️ Backend CORS Fix

Run this on your server to fix CORS:
```bash
sudo ./fix-cors.sh fix
```

This will:
- Update CORS settings to allow Vercel frontend
- Restart backend services
- Test the configuration

## 🎯 Complete Solution

1. **Fix backend CORS**: `sudo ./fix-cors.sh fix`
2. **Update frontend API URL**: Change from IP to domain
3. **Redeploy frontend**: Push changes to Vercel
4. **Test connection**: Try logging in

Your frontend should now be able to connect to your backend successfully!
