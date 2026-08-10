# Klova Clothing Store

A modern full-stack e-commerce web application for clothing business with Vue.js frontend and Node.js backend.

## Features

### Customer Features
- Browse products by categories (Men's, Women's, Kids)
- View product details with images, sizes, colors
- Shopping cart functionality
- Customer registration and login
- Order placement with WhatsApp integration
- Size and color selection

### Admin Features
- Product management (Add/Edit/Delete)
- Image upload and management
- Inventory tracking
- Order management
- Order history and statistics
- Admin dashboard

## Tech Stack

- **Frontend**: Vue.js 3 with Composition API
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Authentication**: JWT
- **File Upload**: Multer
- **Payment**: WhatsApp integration (Bank Transfer/Cash on Delivery)

## Project Structure

```
klova/
├── frontend/          # Vue.js frontend application
├── backend/           # Node.js Express API
├── database/          # MySQL database scripts
└── uploads/          # Product images storage
```

## Color Palette

- Primary: #0D2B1D (Dark Green)
- Secondary: #345635 (Forest Green)
- Accent: #6B8F71 (Sage Green)
- Light: #AEC3B0 (Light Sage)
- Background: #E3EFD3 (Mint Cream)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Set up environment variables (see .env.example)
5. Set up MySQL database
6. Start the development servers

### Running the Application

**Frontend (Vue.js)**:
```bash
cd frontend
npm run dev
```

**Backend (Node.js)**:
```bash
cd backend
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory:

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=klova_store
JWT_SECRET=your_jwt_secret
WHATSAPP_NUMBER=your_whatsapp_number
```

## Database Schema

The application uses MySQL with the following main tables:
- users (customers and admin)
- categories
- products
- product_images
- product_variants (sizes/colors)
- orders
- order_items

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
