# ENLANCE Backend API

**Real Time Mobile Repair Tracker - Production-Ready Backend System**

A complete Node.js/Express backend API for connecting users with verified mobile repair shops. Features include real-time quotations, chat messaging, image uploads, JWT authentication, and role-based access control.

---

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Logging**: Morgan
- **Rate Limiting**: express-rate-limit

---

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** package manager

---

## 🛠️ Installation

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/enlance
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
MAX_FILE_SIZE=5242880
```

**Important**: Change `JWT_SECRET` to a strong random string in production!

### 4. Start MongoDB

**Local Installation:**
```bash
mongod
```

**Or use MongoDB Atlas** (cloud database) - Update `MONGODB_URI` with your connection string.

### 5. Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will start on `http://localhost:5000`

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User operations
│   ├── shopController.js    # Shopkeeper operations
│   ├── chatController.js    # Chat messaging
│   └── adminController.js   # Admin operations
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── roleAuth.js         # Role-based access control
│   ├── errorHandler.js     # Global error handling
│   └── validation.js       # Request validation
├── models/
│   ├── User.js             # User/Shopkeeper/Admin model
│   ├── RepairRequest.js    # Repair request model
│   ├── Quotation.js        # Quotation model
│   └── Chat.js             # Chat message model
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── userRoutes.js       # User endpoints
│   ├── shopRoutes.js       # Shopkeeper endpoints
│   ├── chatRoutes.js       # Chat endpoints
│   └── adminRoutes.js      # Admin endpoints
├── utils/
│   ├── asyncHandler.js     # Async error wrapper
│   └── generateToken.js    # JWT token generator
├── uploads/                # Uploaded images directory
├── .env.example            # Environment template
├── .gitignore
├── app.js                  # Express app config
├── server.js               # Server entry point
├── package.json
└── README.md
```

---

## 🔐 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user/shopkeeper/admin |
| POST | `/auth/login` | Login and get JWT token |

### User Endpoints (Protected)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/request` | Create repair request with image | User |
| GET | `/request/user/:id` | Get user's repair requests | Any |
| PUT | `/request/accept/:id` | Accept quotation | User |
| PUT | `/request/reject/:id` | Reject quotation | User |
| PUT | `/request/complete/:id` | Mark repair completed | User |
| POST | `/request/rate/:id` | Rate shopkeeper (1-5) | User |

### Shopkeeper Endpoints (Protected)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/request/city/:city` | Get requests by city | Verified Shopkeeper |
| POST | `/quotation` | Send quotation | Verified Shopkeeper |
| PUT | `/request/shop-complete/:id` | Mark repair completed | Shopkeeper |
| GET | `/quotation/request/:requestId` | Get quotations for request | Any |

### Chat Endpoints (Protected)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/chat/:requestId` | Get chat messages | Any |
| POST | `/chat` | Send chat message | Any |

### Admin Endpoints (Protected)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/shopkeepers` | Get all shopkeepers | Admin |
| PUT | `/admin/verify/:id` | Verify shopkeeper | Admin |
| DELETE | `/admin/delete-user/:id` | Delete user | Admin |
| GET | `/admin/stats` | Get platform statistics | Admin |

---

## 📝 API Usage Examples

### 1. Register User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "verified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Register Shopkeeper

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Mobile Fix Shop",
  "email": "shop@example.com",
  "password": "password123",
  "role": "shopkeeper",
  "city": "Coimbatore",
  "locationLink": "https://maps.google.com/?q=Coimbatore"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "456def",
    "name": "Mobile Fix Shop",
    "email": "shop@example.com",
    "role": "shopkeeper",
    "city": "Coimbatore",
    "verified": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Create Repair Request (with Image Upload)

**Request:**
```http
POST /api/request
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

image: [file]
description: Screen cracked, not responding
brand: Samsung
model: Galaxy S21
city: Coimbatore
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "789ghi",
    "userId": "123abc",
    "imagePath": "uploads/repair-1234567890-987654321.jpg",
    "description": "Screen cracked, not responding",
    "brand": "Samsung",
    "model": "Galaxy S21",
    "city": "Coimbatore",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Send Quotation (Verified Shopkeeper)

**Request:**
```http
POST /api/quotation
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "requestId": "789ghi",
  "price": 2500,
  "message": "We can fix your screen in 2 hours. Original parts used."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "quote123",
    "requestId": "789ghi",
    "shopId": {
      "_id": "456def",
      "name": "Mobile Fix Shop",
      "rating": 4.8,
      "locationLink": "https://maps.google.com/?q=Coimbatore"
    },
    "price": 2500,
    "message": "We can fix your screen in 2 hours. Original parts used.",
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

### 6. Accept Quotation

**Request:**
```http
PUT /api/request/accept/789ghi
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "shopId": "456def"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "789ghi",
    "status": "accepted",
    "selectedShop": "456def"
  }
}
```

### 7. Send Chat Message

**Request:**
```http
POST /api/chat
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "requestId": "789ghi",
  "receiverId": "456def",
  "message": "What time can I bring my phone?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "chat123",
    "requestId": "789ghi",
    "senderId": {
      "name": "John Doe",
      "role": "user"
    },
    "receiverId": {
      "name": "Mobile Fix Shop",
      "role": "shopkeeper"
    },
    "message": "What time can I bring my phone?",
    "createdAt": "2024-01-15T11:30:00Z"
  }
}
```

### 8. Rate Shopkeeper

**Request:**
```http
POST /api/request/rate/789ghi
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "data": {
    "shopkeeper": {
      "name": "Mobile Fix Shop",
      "rating": 4.85,
      "ratingCount": 42
    }
  }
}
```

### 9. Verify Shopkeeper (Admin)

**Request:**
```http
PUT /api/admin/verify/456def
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Shopkeeper verified successfully",
  "data": {
    "_id": "456def",
    "name": "Mobile Fix Shop",
    "verified": true
  }
}
```

---

## 🧪 Testing with Postman

### Setting Up Postman

1. **Import Collection**: Create a new Postman collection called "ENLANCE API"
2. **Set Base URL**: Create an environment variable `baseUrl` = `http://localhost:5000/api`
3. **Save Token**: After login, save the token in an environment variable `authToken`

### Test Sequence

**Step 1: Register Admin**
```
POST {{baseUrl}}/auth/register
Body: { "name": "Admin", "email": "admin@enlance.com", "password": "admin123", "role": "admin" }
Save: token to authToken
```

**Step 2: Register Shopkeeper**
```
POST {{baseUrl}}/auth/register
Body: { "name": "Test Shop", "email": "shop@test.com", "password": "shop123", "role": "shopkeeper", "city": "Coimbatore", "locationLink": "https://maps.google.com" }
Save: shopkeeper ID
```

**Step 3: Verify Shopkeeper (as Admin)**
```
PUT {{baseUrl}}/admin/verify/:shopkeeperId
Headers: Authorization: Bearer {{authToken}}
```

**Step 4: Register User**
```
POST {{baseUrl}}/auth/register
Body: { "name": "Test User", "email": "user@test.com", "password": "user123", "role": "user" }
```

**Step 5: Login as User**
```
POST {{baseUrl}}/auth/login
Body: { "email": "user@test.com", "password": "user123" }
Save: token to authToken
```

**Step 6: Create Repair Request (with image)**
```
POST {{baseUrl}}/request
Headers: Authorization: Bearer {{authToken}}
Body (form-data):
  - image: [select file]
  - description: "Screen broken"
  - brand: "Samsung"
  - model: "Galaxy S21"
  - city: "Coimbatore"
Save: request ID
```

**Step 7: Login as Shopkeeper**
```
POST {{baseUrl}}/auth/login
Body: { "email": "shop@test.com", "password": "shop123" }
Save: token to authToken
```

**Step 8: View Requests in City**
```
GET {{baseUrl}}/request/city/Coimbatore
Headers: Authorization: Bearer {{authToken}}
```

**Step 9: Send Quotation**
```
POST {{baseUrl}}/quotation
Headers: Authorization: Bearer {{authToken}}
Body: { "requestId": ":requestId", "price": 1500, "message": "Can fix in 2 hours" }
```

**Step 10: Login as User Again**
```
POST {{baseUrl}}/auth/login
Body: { "email": "user@test.com", "password": "user123" }
```

**Step 11: Accept Quotation**
```
PUT {{baseUrl}}/request/accept/:requestId
Headers: Authorization: Bearer {{authToken}}
Body: { "shopId": ":shopkeeperId" }
```

**Step 12: Send Chat Message**
```
POST {{baseUrl}}/chat
Headers: Authorization: Bearer {{authToken}}
Body: { "requestId": ":requestId", "receiverId": ":shopkeeperId", "message": "When can I come?" }
```

**Step 13: Mark as Completed**
```
PUT {{baseUrl}}/request/complete/:requestId
Headers: Authorization: Bearer {{authToken}}
```

**Step 14: Rate Shopkeeper**
```
POST {{baseUrl}}/request/rate/:requestId
Headers: Authorization: Bearer {{authToken}}
Body: { "rating": 5 }
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Helmet Security Headers** - XSS, clickjacking protection
- ✅ **CORS Configuration** - Cross-origin request control
- ✅ **Rate Limiting** - Prevent API abuse (100 req/15min)
- ✅ **Input Validation** - express-validator on all endpoints
- ✅ **Role-Based Access Control** - User/Shopkeeper/Admin roles
- ✅ **File Upload Validation** - Type and size restrictions
- ✅ **Error Sanitization** - No stack traces in production

---

## 🎯 Key Features

### For Users
- Create repair requests with image upload
- Receive quotations from multiple shops (sorted by rating)
- Accept/reject quotations
- Real-time chat with shopkeepers
- Rate shopkeepers after completion

### For Shopkeepers
- View repair requests in their city
- Send quotations with pricing
- Chat with users
- Must be verified by admin before sending quotations
- Build reputation through ratings

### For Admins
- Verify shopkeeper accounts
- Manage users
- View platform statistics
- Delete accounts

---

## 🐛 Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "Stack trace (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📊 Database Indexes

Optimized queries with indexes on:
- User email (unique)
- RepairRequest: city + status, userId + createdAt
- Quotation: requestId + shopId (unique compound)
- Chat: requestId + createdAt

---

## 🚧 Production Deployment Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or production MongoDB
- [ ] Set specific CORS origin (not `*`)
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up proper logging (Winston, Sentry)
- [ ] Configure environment variables on server
- [ ] Set up process manager (PM2)
- [ ] Enable database backups
- [ ] Set up monitoring (CPU, memory, errors)

---

## 📞 Support

For issues or questions:
- Check the API documentation above
- Review error messages in server logs
- Verify MongoDB connection
- Check JWT token validity
- Ensure proper role-based access

---

## 📄 License

ISC

---

## 🎉 Ready to Use!

Your ENLANCE backend is now fully set up and production-ready! Start the server and begin testing the API endpoints.

**Happy Coding! 🚀**
