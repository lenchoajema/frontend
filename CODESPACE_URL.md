# 🌐 CODESPACE ACCESS GUIDE - E-Commerce Platform

## 🎯 YOUR DIRECT ACCESS URLS

### ✅ All Services Are Running!

Your Codespace: **potential-guide-wv5pxxvwg45cgr75**

#### Frontend (React Application)
```
https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev
```
**👆 CLICK THIS LINK TO OPEN YOUR FRONTEND APP**

#### Backend API
```
https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev
```

#### Backend Health Check
```
https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/health
```

#### Products API
```
https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/api/products
```

---

## 🚨 IMPORTANT: Port Not Showing in PORTS Tab?

### Method 1: Manually Add Port (Recommended)

1. **Open Command Palette**: 
   - Windows/Linux: `Ctrl + Shift + P`
   - Mac: `Cmd + Shift + P`

2. **Type**: `Forward a Port`

3. **Enter Port Number**: `3000` (then press Enter)

4. **Repeat for Backend**: `5000`

5. **Set Visibility to Public**:
   - Right-click on port 3000 → **Port Visibility** → **Public**
   - Right-click on port 5000 → **Port Visibility** → **Public**

### Method 2: Via PORTS Tab

1. Look at **BOTTOM PANEL** of VS Code
2. Click **PORTS** tab
3. Click **+** button (Add Port)
4. Enter: `3000`
5. Click **+** again and enter: `5000`
6. Right-click each port → **Port Visibility** → **Public**

### Method 3: Use Direct URLs

Just paste these URLs in your browser:

**Frontend:**
```
https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev
```

**Backend:**
```
https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/health
```

---

## ✅ Current Service Status

| Service | Status | Port | URL |
|---------|--------|------|-----|
| **Frontend** | ✅ Running | 3000 | https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev |
| **Backend** | ✅ Running | 5000 | https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev |
| **MongoDB** | ✅ Running | 27017 | Internal only |
| **Redis** | ✅ Running | 6379 | Internal only |

---

## 🎨 Frontend Routes Available

Once you open the frontend URL, you can navigate to:

### Public Routes
- `/` - Home page with products
- `/product/:id` - Product details
- `/login` - User login
- `/register` - User registration

### Protected Routes (Require Login)
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/profile` - User profile
- `/wishlist` - Wishlist ❤️
- `/2fa-setup` - Two-factor authentication
- `/forgot-password` - Password recovery

### Admin/Seller Routes
- `/admin` - Admin dashboard
- `/seller` - Seller dashboard

---

## 🧪 Test Your APIs

### Using Browser
Simply paste these URLs in your browser:

1. **Health Check**:
   ```
   https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/health
   ```

2. **Get All Products**:
   ```
   https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/api/products
   ```

3. **Shipping Carriers**:
   ```
   https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/api/shipping/carriers
   ```

### Using Terminal (Inside Codespace)
```bash
# Test backend
curl http://localhost:5000/health

# Get products
curl http://localhost:5000/api/products | jq '.total'

# Get shipping carriers
curl http://localhost:5000/api/shipping/carriers | jq '.carriers'
```

---

## 🆕 New Features Ready to Test

All these features are fully implemented:

1. ⭐ **Product Reviews & Ratings**
   - POST `/api/reviews/:id/reviews` - Add review
   - GET `/api/reviews/:id/reviews` - Get reviews

2. ❤️ **Wishlist Management**
   - GET `/api/wishlist` - Get wishlist
   - POST `/api/wishlist/:productId` - Add to wishlist
   - DELETE `/api/wishlist/:productId` - Remove from wishlist

3. 🔒 **GDPR Compliance**
   - POST `/api/gdpr/export-data` - Export user data
   - POST `/api/gdpr/delete-account` - Delete account
   - PUT `/api/gdpr/consent` - Update consents

4. 📦 **Shipping Integration**
   - POST `/api/shipping/rates` - Get shipping rates
   - GET `/api/shipping/track/:number` - Track shipment
   - GET `/api/shipping/carriers` - List carriers

5-10. **Dashboard & Profile Pages** (UI Ready)
   - Admin Dashboard, Seller Dashboard, Order History, Profile, 2FA, Forgot Password

---

## 🐛 Troubleshooting

### Port 3000 Not Showing?

**Option A: Manual Forward**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P`)
2. Type: `Forward a Port`
3. Enter: `3000`
4. Press Enter

**Option B: Use Direct URL**
Just open this in your browser:
```
https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev
```

### Getting 502 Bad Gateway?

Wait 10-30 seconds for the service to fully start, then refresh.

### Port Shows as "Private"?

1. Right-click on the port in PORTS tab
2. Select **Port Visibility**
3. Choose **Public**

---

## 📝 Quick Commands

```bash
# Show this guide
./show-ports.sh

# Check services status
docker-compose ps

# Restart frontend
docker-compose restart frontend

# Restart backend
pkill -f "node server.js"
cd /workspaces/frontend && MONGO_URI='mongodb://admin:changeme@localhost:27017/ecommerce?authSource=admin' PORT=5000 node server.js > /tmp/backend.log 2>&1 &

# View backend logs
tail -50 /tmp/backend.log

# View frontend logs
docker logs ecommerce_frontend --tail 50
```

---

## 🎉 You're All Set!

### Quick Start:
1. **Copy this URL**: `https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev`
2. **Paste in browser**
3. **Start shopping!** 🛍️

---

## 📚 Documentation Files

- **CODESPACE_ACCESS.md** (this file) - Codespace access guide
- **NEW_FEATURES_SUMMARY.md** - Complete feature documentation  
- **SERVICES_STATUS.md** - Service configuration and status
- **README.md** - Project overview

---

**Last Updated**: October 12, 2025  
**All Services**: ✅ Running and Ready!
