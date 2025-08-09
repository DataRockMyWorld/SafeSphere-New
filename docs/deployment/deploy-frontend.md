# Frontend Deployment Guide

## 🔧 **Issue Found and Fixed**

I found a **typo** in your domain name:
- **Before**: `https://safesphers.info/api/v1` ❌
- **After**: `https://safespheres.info/api/v1` ✅

The domain was missing an 'e' in "safespheres".

## 🚀 **Steps to Deploy to Vercel**

### **Step 1: Commit Your Changes**
```bash
cd frontend
git add .
git commit -m "Fix API URL typo: safesphers.info -> safespheres.info"
git push origin main
```

### **Step 2: Verify Vercel Deployment**
1. Go to your Vercel dashboard
2. Check if the deployment is running
3. Wait for it to complete

### **Step 3: Test the Connection**
After deployment, test by:
1. Opening your Vercel app
2. Opening browser console
3. Trying to login
4. Check for CORS errors

## 🔍 **Expected Results**

After the deployment, you should see:
- ✅ **No more CORS errors**
- ✅ **API calls to `https://safespheres.info/api/v1/`**
- ✅ **Successful login**

## 📋 **If It Still Doesn't Work**

### **Check 1: Verify Deployment**
Make sure your changes are actually deployed to Vercel:
1. Check Vercel dashboard for latest deployment
2. Verify the deployment completed successfully

### **Check 2: Clear Browser Cache**
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Check 3: Check Network Tab**
1. Open browser DevTools
2. Go to Network tab
3. Try to login
4. Check what URL is being called

## 🎯 **Quick Test**

After deployment, test this in your browser console:
```javascript
fetch('https://safespheres.info/api/v1/auth/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@safespheres.info',
    password: 'admin123'
  })
}).then(r => r.json()).then(console.log)
```

This should return a proper response instead of a CORS error.

## 📞 **If Still Having Issues**

1. **Check Vercel logs** for any build errors
2. **Verify the domain** is correct in all files
3. **Test the backend** directly: `curl https://safespheres.info/api/v1/auth/login/`

The main issue was the typo in the domain name. Once you deploy this fix to Vercel, it should work!
