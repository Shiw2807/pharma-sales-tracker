# Pharmaceutical Sales Tracking System

Please use the feature branch only. A comprehensive web application for tracking pharmaceutical sales data with user management, built using the MERN stack (MongoDB, Express, React, Node.js).

## Features

### User Management
- **Registration & Authentication**: Secure user registration and login system
- **Role-based Access Control**: Two user roles - Sales Representatives and Managers
- **JWT Authentication**: Secure token-based authentication using Passport.js

### Sales Tracking
- **CRUD Operations**: Create, Read, Update, and Delete sales transactions
- **Role-based Permissions**: 
  - Sales Representatives can manage their own sales
  - Managers can view and manage all sales
  - **NEW**: Managers can create sales and assign them to any sales representative
- **Detailed Sales Information**: Track product name, quantity, price, customer details, and sale status
- **Real-time Filtering**: Filter sales by product, date range, and status
- **Sales Assignment**: Managers can select which sales representative a sale belongs to when creating new sales

### Reporting & Analytics (Managers Only)
- **Comprehensive Dashboard**: Visual representation of sales metrics
- **Multiple Report Types**:
  - Sales summary with trends
  - Top products by revenue
  - Sales performance by representative
  - Top customers analysis
  - Performance comparison over time
- **Data Export**: Export sales data as CSV files
- **Interactive Charts**: Built with Recharts for data visualization

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Passport.js**: Authentication middleware
- **JWT**: JSON Web Tokens for secure authentication
- **bcryptjs**: Password hashing
- **Express Validator**: Input validation

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Recharts**: Charting library
- **React Toastify**: Notification system
- **date-fns**: Date formatting utilities

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd pharma-sales-tracker/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - The `.env` file is already created with default values
   - Update `MONGODB_URI` if using a different MongoDB instance
   - Change `JWT_SECRET` for production use

4. Start MongoDB:
```bash
# If MongoDB is installed locally
mongod

# Or use MongoDB Atlas cloud service
```

5. Start the backend server:
```bash
npm start
# Or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd pharma-sales-tracker/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

### Getting Started

1. **Register a new account**:
   - Navigate to the registration page
   - Choose your role (Sales Representative or Manager)
   - Fill in your details and submit

2. **Login**:
   - Use your email and password to login
   - Demo credentials are provided on the login page

3. **Dashboard**:
   - View sales statistics and trends
   - See recent sales transactions
   - Monitor performance metrics

4. **Sales Management**:
   - Add new sales transactions
   - Edit or delete your sales (Sales Representatives)
   - View all sales (Managers)
   - Filter sales by various criteria

5. **Reports** (Managers only):
   - Access comprehensive sales analytics
   - View charts and graphs
   - Export data as CSV
   - Analyze performance trends

### Demo Accounts

For testing purposes, you can create accounts with these roles:
- **Manager Account**: Full access to all features including reports
- **Sales Representative Account**: Access to sales management for own transactions

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
- Body: `{ name, email, password, role }`
- Returns: JWT token and user data

#### POST `/api/auth/login`
Login user
- Body: `{ email, password }`
- Returns: JWT token and user data

#### GET `/api/auth/me`
Get current user information
- Headers: `Authorization: Bearer <token>`
- Returns: User data

### Sales Endpoints

#### GET `/api/sales`
Get sales (filtered by user role)
- Headers: `Authorization: Bearer <token>`
- Query params: `startDate`, `endDate`, `productName`, `status`
- Returns: Array of sales

#### POST `/api/sales`
Create new sale
- Headers: `Authorization: Bearer <token>`
- Body: Sale data
- Returns: Created sale

#### PUT `/api/sales/:id`
Update sale
- Headers: `Authorization: Bearer <token>`
- Body: Updated sale data
- Returns: Updated sale

#### DELETE `/api/sales/:id`
Delete sale
- Headers: `Authorization: Bearer <token>`
- Returns: Success message

### Reports Endpoints (Managers Only)

#### GET `/api/reports/summary`
Get sales summary report
- Headers: `Authorization: Bearer <token>`
- Query params: `startDate`, `endDate`, `groupBy`
- Returns: Comprehensive sales report

#### GET `/api/reports/top-customers`
Get top customers
- Headers: `Authorization: Bearer <token>`
- Query params: `startDate`, `endDate`, `limit`
- Returns: Top customers by revenue

#### GET `/api/reports/performance`
Get performance metrics
- Headers: `Authorization: Bearer <token>`
- Query params: `period`
- Returns: Performance comparison data

#### GET `/api/reports/export`
Export sales data as CSV
- Headers: `Authorization: Bearer <token>`
- Query params: `startDate`, `endDate`
- Returns: CSV file

## Project Structure

```
pharma-sales-tracker/
├── backend/
│   ├── config/
│   │   └── passport.js       # Passport JWT strategy configuration
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── models/
│   │   ├── User.js          # User model schema
│   │   └── Sale.js          # Sale model schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── sales.js         # Sales CRUD routes
│   │   └── reports.js       # Reporting routes
│   ���── .env                 # Environment variables
│   ├── package.json         # Backend dependencies
│   └── server.js            # Express server setup
│
└── frontend/
    ├── public/
    │   └── index.html       # HTML template
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js    # Navigation component
    │   │   ├── PrivateRoute.js  # Protected route wrapper
    │   │   └── SaleForm.js  # Sale form modal
    │   ├── context/
    │   │   └── AuthContext.js   # Authentication context
    │   ├── pages/
    │   │   ├── Login.js     # Login page
    │   │   ├── Register.js  # Registration page
    │   │   ├── Dashboard.js # Dashboard page
    │   │   ├── Sales.js     # Sales management page
    │   │   └── Reports.js   # Reports page
    │   ├── App.js           # Main app component
    │   ├── App.css          # Global styles
    │   └── index.js         # React entry point
    └── package.json         # Frontend dependencies
```

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt before storage
2. **JWT Authentication**: Secure token-based authentication
3. **Role-based Access**: Proper authorization checks for different user roles
4. **Input Validation**: Server-side validation for all inputs
5. **CORS Configuration**: Configured for development, update for production
6. **Environment Variables**: Sensitive data stored in .env file

## Development Tips

1. **MongoDB Connection**: Ensure MongoDB is running before starting the backend
2. **Port Configuration**: Backend runs on port 5000, frontend on port 3000
3. **Proxy Configuration**: Frontend is configured to proxy API calls to backend
4. **Hot Reload**: Both frontend and backend support hot reload in development
5. **Error Handling**: Check browser console and terminal for error messages

## Testing

### Manual Testing Checklist

1. **Authentication**:
   - [ ] User registration with validation
   - [ ] User login with correct/incorrect credentials
   - [ ] Token persistence and logout

2. **Sales Management**:
   - [ ] Create new sale
   - [ ] Edit existing sale
   - [ ] Delete sale
   - [ ] Filter sales by criteria

3. **Reports** (Manager role):
   - [ ] View summary statistics
   - [ ] Check chart rendering
   - [ ] Export CSV functionality
   - [ ] Date range filtering

4. **Authorization**:
   - [ ] Sales rep can only edit/delete own sales
   - [ ] Manager can access reports
   - [ ] Proper role-based UI rendering

## Deployment Considerations

1. **Environment Variables**: Update production environment variables
2. **MongoDB**: Use MongoDB Atlas for cloud deployment
3. **Build Process**: Run `npm run build` in frontend for production build
4. **Security**: Implement HTTPS, update CORS settings
5. **Performance**: Consider implementing caching and pagination for large datasets

## Future Enhancements

- Email notifications for sales milestones
- Advanced analytics with predictive insights
- Mobile responsive improvements
- Bulk import/export functionality
- Integration with external CRM systems
- Real-time updates using WebSockets
- Advanced user management features
- Audit logs for compliance

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in .env file

2. **Port Already in Use**:
   - Change port in .env or package.json
   - Kill existing processes on the port

3. **CORS Issues**:
   - Check proxy configuration in frontend package.json
   - Verify CORS settings in backend

4. **Authentication Errors**:
   - Clear localStorage and cookies
   - Check JWT token expiration

## License

This project is created for educational purposes as part of a technical assessment.

## Author

Developed as a comprehensive solution for pharmaceutical sales tracking with modern web technologies.
