# AI Budget Tracker

A comprehensive budget tracking application with user authentication, profile management, and expense/income tracking features.

## Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure user registration and login system
- **Role-based Access Control**: User and Admin roles
- **Protected Routes**: Secure access to sensitive pages

### Profile Management
- User profile with financial goals:
  - Monthly Income
  - Savings Goal
  - Target Expenses
- Editable profile information

### Transaction Management
- **Add Transactions**: Log daily income and expenses
- **Categorization**: 
  - Expense categories: Rent, Food, Travel, Entertainment, Shopping, Healthcare, Utilities, Other
  - Income categories: Salary, Freelance, Investment, Business, Gift, Other
- **Edit/Delete Options**: Full CRUD operations on transactions
- **Transaction History**: View all transactions with filtering options

### Dashboard
- Financial overview with statistics
- Total Income, Total Expenses, Current Balance, Savings
- Recent transactions display
- Financial goals tracking

## Tech Stack

### Backend
- **Java 21**
- **Spring Boot 3.5.6**
- **Spring Security** with JWT
- **Spring Data JPA**
- **MySQL Database**
- **Lombok** for boilerplate reduction

### Frontend
- **React 19** with TypeScript
- **Vite** as build tool
- **TailwindCSS** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **React Router** for navigation

## Prerequisites

- Java 21 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE user_auth_db;
```

2. Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/user_auth_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

## Backend Setup

1. Navigate to the project root directory:
```bash
cd "d:\Infosys Internship\aibudgettracker"
```

2. Build the project:
```bash
mvnw clean install
```

3. Run the Spring Boot application:
```bash
mvnw spring-boot:run
```

The backend will start on `http://localhost:8083`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd AIBudgetTrackerFrontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Profile
- `GET /api/profile` - Get user profile (Protected)
- `PUT /api/profile` - Update user profile (Protected)

### Transactions
- `GET /api/transactions` - Get all user transactions (Protected)
- `POST /api/transactions` - Create a new transaction (Protected)
- `PUT /api/transactions/{id}` - Update a transaction (Protected)
- `DELETE /api/transactions/{id}` - Delete a transaction (Protected)

## Project Structure

```
aibudgettracker/
├── src/main/java/com/infosys/aibudgettracker/
│   ├── authservice/
│   │   ├── config/          # Security configuration
│   │   ├── controller/      # Auth and Profile controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── filter/          # JWT filter
│   │   ├── model/           # User entity
│   │   ├── repository/      # User repository
│   │   ├── service/         # Auth service
│   │   └── util/            # JWT utility
│   └── transaction/
│       ├── controller/      # Transaction controller
│       ├── dto/             # Transaction DTOs
│       ├── model/           # Transaction entity
│       ├── repository/      # Transaction repository
│       └── service/         # Transaction service
└── AIBudgetTrackerFrontend/
    └── src/
        ├── components/      # Reusable components
        ├── hooks/           # Custom React hooks
        ├── pages/           # Page components
        ├── services/        # API service
        └── types/           # TypeScript types
```

## Usage

1. **Sign Up**: Create a new account with username, email, and password
2. **Login**: Use your credentials to login
3. **Set Profile**: Update your monthly income, savings goal, and target expenses
4. **Add Transactions**: Start tracking your income and expenses
5. **View Dashboard**: Monitor your financial overview
6. **Manage Transactions**: Edit or delete transactions as needed

## Security Features

- Password encryption using BCrypt
- JWT tokens for stateless authentication
- Protected API endpoints
- CORS configuration for frontend-backend communication
- Role-based access control

## UI Features

- Modern, responsive design
- Gradient color schemes
- Interactive cards and buttons
- Loading states
- Error handling
- Form validation
- Beautiful transaction history

## Development Notes

- The backend runs on port 8083
- The frontend runs on port 5173
- JWT tokens are stored in localStorage
- All monetary values use Indian Rupee (₹) currency
- Transactions support datetime for precise tracking

## Troubleshooting

### Backend Issues
- Ensure MySQL is running and the database exists
- Check database credentials in application.properties
- Verify Java 21 is installed: `java -version`

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`
- Check if backend is running on port 8083
- Verify React and TypeScript versions

### CORS Issues
- Backend is configured to accept requests from `http://localhost:5173`
- Update CORS origins in controllers if using different ports

## Future Enhancements

- Data visualization with charts
- Budget planning features
- Expense analytics
- Export transactions to CSV/PDF
- Email notifications
- Multi-currency support
- Recurring transactions
- Category customization

## License
MIT License

Copyright (c) 2025 Saurabh Ramchandra Dudhe 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Authors

Developed as part of the Infosys Internship program.
