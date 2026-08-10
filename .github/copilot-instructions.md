<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Klova Clothing Store - Copilot Instructions

## Project Overview
This is a full-stack e-commerce web application for a clothing business with Vue.js frontend and Node.js backend using MySQL database.

## Color Palette
Always use these colors in the UI:
- Primary: #0D2B1D (Dark Green)
- Secondary: #345635 (Forest Green) 
- Accent: #6B8F71 (Sage Green)
- Light: #AEC3B0 (Light Sage)
- Background: #E3EFD3 (Mint Cream)

## Code Style Guidelines

### Frontend (Vue.js)
- Use Vue 3 Composition API with `<script setup>` syntax
- Use TypeScript for better type safety when possible
- Follow Vue.js style guide conventions
- Use Tailwind CSS for styling with the defined color palette
- Components should be in PascalCase
- Use reactive refs and computed properties appropriately

### Backend (Node.js)
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks
- Use middleware for authentication and validation
- Follow RESTful API conventions
- Implement proper input validation using Joi
- Use environment variables for configuration

### Database (MySQL)
- Use prepared statements to prevent SQL injection
- Follow proper naming conventions (snake_case for table/column names)
- Implement proper foreign key relationships
- Use indexes for frequently queried columns

## Key Features to Implement
1. Product catalog with categories (Men's, Women's, Kids)
2. Product variants (sizes, colors)
3. Shopping cart functionality
4. User authentication (customers and admin)
5. Order management with WhatsApp integration
6. Admin panel for product/inventory management
7. Image upload and management

## Security Considerations
- Always validate and sanitize user inputs
- Use JWT for authentication
- Implement rate limiting
- Use HTTPS in production
- Hash passwords using bcrypt
- Implement proper CORS configuration

## File Upload Guidelines
- Store product images in organized folders
- Implement proper file type validation
- Resize images for optimal performance
- Use unique filenames to prevent conflicts

## API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "error": null
}
```

## Error Handling
- Always return consistent error responses
- Log errors for debugging
- Don't expose sensitive information in error messages
- Use appropriate HTTP status codes
