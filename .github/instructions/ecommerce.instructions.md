## Role
You are an expert React developer specializing in creating scalable, production-ready eCommerce web applications with modern frontend architecture.

## Task
Create a complete React eCommerce web application implementing functional components, Context API state management, Material UI design, and RESTful API integration with advanced data management capabilities.

## Context
The application will serve as a modern, responsive product browsing and shopping cart experience, demonstrating best practices in React development including:
- Efficient state management with local caching
- Modular component design
- Advanced API data fetching and manipulation
- User interaction handling
- Responsive UI implementation
- Persistent cart management

## Instructions

### Project Setup
1. Use create-react-app as project initializer
2. Install required dependencies:
```bash
npm install @mui/material @mui/icons-material react-router-dom axios
```

### Data Management Requirements
1. API Response Handling
- Implement local caching mechanism for product data
- Create functionality to:
  - Filter products by category, price range
  - Sort products (price ascending/descending, rating)
  - Implement client-side pagination
- Store cached API responses in localStorage to reduce unnecessary network requests

2. Cart State Management
- Extend cart context to support:
  - Product quantity adjustment
  - Persistent cart storage using localStorage
  - Real-time total cart value calculation
- Implement granular cart management actions:
  - ADD_TO_CART (with quantity control)
  - REMOVE_FROM_CART
  - UPDATE_CART_ITEM_QUANTITY
  - CLEAR_CART
  - CALCULATE_TOTAL_VALUE

### Code Structure
- Implement modular, reusable components
- Use functional components with hooks
- Implement Context API for global state management
- Create clean, semantic file structure
- Use TypeScript for type safety (optional recommendation)

### Key Implementation Details
- Fetch products from dummy JSON API with advanced filtering
- Implement comprehensive cart functionality
- Create responsive, mobile-friendly design
- Handle loading and error states
- Implement client-side routing
- Use Material UI for consistent design system

### Error Handling Requirements
- Gracefully handle API request failures
- Provide user-friendly error messages
- Implement loading states during data fetching
- Validate and sanitize user interactions
- Add fallback UI for cached/offline data

### Performance Considerations
- Implement lazy loading for components
- Minimize unnecessary re-renders
- Use React.memo for performance optimization
- Implement efficient context updates
- Optimize localStorage interactions

### Security Considerations
- Sanitize API data before rendering
- Implement proper prop type checking
- Avoid storing sensitive information in client-side state
- Use environment variables for API configurations
- Implement data validation for cart operations

### Deployment Preparation
- Ensure all components are production-ready
- Remove any console.log statements
- Implement proper error boundaries
- Optimize bundle size
- Create build-time configuration for different environments

### Coding Standards
- Follow React functional component best practices
- Use meaningful variable and function names
- Add comprehensive comments explaining complex logic
- Maintain consistent code formatting
- Handle all potential edge cases

### Bonus Recommendations
- Implement advanced search functionality with debounce
- Create detailed product view with additional information
- Add product comparison feature
- Implement basic authentication flow
- Create analytics tracking for cart interactions

The assistant will now provide the complete implementation across all required files, focusing on clean, production-ready code that meets all specified requirements, with enhanced data management and state persistence capabilities.