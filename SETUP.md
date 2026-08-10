# Klova Clothing Store - Setup Guide

## Prerequisites

Before running the application, make sure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
3. **Git** (optional, for version control)

## Database Setup

### 1. Install and Start MySQL

1. Install MySQL Server on your system
2. Start MySQL service
3. Create a new database user or use root

### 2. Create Database

```sql
-- Connect to MySQL as root or admin user
mysql -u root -p

-- Create the database
CREATE DATABASE klova_store;

-- Create a user (optional, you can use root)
CREATE USER 'klova_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON klova_store.* TO 'klova_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3. Import Database Schema

```bash
# Navigate to the database folder
cd C:\Mithuranga\klova\database

# Import the schema
mysql -u root -p klova_store < schema.sql
```

## Environment Configuration

### 1. Backend Environment Setup

1. Navigate to backend directory: `cd C:\Mithuranga\klova\backend`
2. Copy the environment file: `copy .env.example .env`
3. Edit `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=klova_store

# JWT Secret (change this to a secure random string)
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here

# WhatsApp Number (update with your business WhatsApp number)
WHATSAPP_NUMBER=+94123456789
```

## Running the Application

### Method 1: Using VS Code Tasks (Recommended)

1. Open the project in VS Code
2. Press `Ctrl+Shift+P` and run "Tasks: Run Task"
3. Select "Start Development Servers"

### Method 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd C:\Mithuranga\klova\backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd C:\Mithuranga\klova\frontend
npm run dev
```

## Default Access

Once both servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Admin Login**: 
  - Email: admin@klova.com
  - Password: admin123

## Project Structure

```
klova/
├── frontend/              # Vue.js frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── views/         # Page components
│   │   ├── stores/        # Pinia state management
│   │   └── utils/         # Utility functions
├── backend/               # Node.js backend
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   └── uploads/           # File uploads directory
├── database/              # MySQL schema and scripts
└── README.md
```

## Features Implemented

### Customer Features
- [x] Product browsing with categories
- [x] Product search and filtering
- [x] Shopping cart functionality
- [x] User registration and authentication
- [x] Order placement with WhatsApp integration
- [x] Responsive design with Tailwind CSS

### Admin Features
- [x] Admin dashboard with statistics
- [x] Product management (CRUD operations)
- [x] Image upload for products
- [x] Order management
- [x] Inventory tracking
- [x] User management

### Technical Features
- [x] RESTful API with Express.js
- [x] JWT authentication
- [x] MySQL database with proper relationships
- [x] File upload handling
- [x] Input validation and sanitization
- [x] Error handling middleware
- [x] CORS configuration
- [x] Rate limiting

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database exists and schema is imported

### Frontend Build Issues
- Delete `node_modules` and run `npm install`
- Clear npm cache: `npm cache clean --force`

### Port Already in Use
- Backend (3000): Change PORT in `.env`
- Frontend (5173): Vite will automatically use next available port

## Next Steps

1. **Database Setup**: Configure MySQL and import the schema
2. **Environment Configuration**: Update `.env` with your settings
3. **WhatsApp Integration**: Add your business WhatsApp number
4. **Styling**: Customize colors and branding
5. **Content**: Add real product images and descriptions
6. **Deployment**: Set up hosting on Hostinger or similar

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure database is properly configured
4. Check that both servers are running on correct ports
