# E-commerce Project Backend

## Overview

This is the backend service for the E-commerce project. It provides APIs for user authentication, product management, order processing, and more.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Multer for file uploads
- bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB installed and running

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/lenchoajema/ecommerce-project.git
   ```
2. Navigate to the backend directory:
   ```sh
   cd ecommerce-project/backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

### Configuration

1. Create a `.env` file in the root of the backend directory and add the following environment variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

1. Start the development server:
   ```sh
   npm run dev
   ```
2. The server will be running on `http://localhost:5000`.

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/products` - Get all products
- `POST /api/orders` - Create a new order

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

## Features

- User authentication and authorization
- Product management (CRUD operations)
- Order processing and management
- File uploads for product images
- Secure password hashing
- JWT-based authentication
- API documentation with Swagger
- Error handling and validation
- Pagination for product listings
- Search functionality for products
- User profile management
- Role-based access control
- Email notifications for order status updates
- Integration with payment gateways
- Logging and monitoring
