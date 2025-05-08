# Bug Tracker Application

A full-stack web application for tracking and managing software bugs with Node.js, Express, MongoDB, and EJS.

## Features

- **User Authentication**: Register, login, and role-based permissions (admin/regular users)
- **Bug Reporting**: Submit bug reports with descriptions, page information, and screenshots
- **Bug Management**: View, filter, and search bugs
- **Status Control**: 
  - Admins can update bug status (Open, In Progress, Resolved)
  - Bug creators can cancel their reports
- **Admin Panel**: User management and comprehensive bug overview

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templates, Bootstrap 5
- **Authentication**: Passport.js with Local Strategy
- **File Upload**: Multer for image uploads

## Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bug-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create necessary directories:
   ```
   mkdir -p public/uploads
   ```

4. Make sure MongoDB is running on your system or setup MongoDB Atlas connection.

5. Update the MongoDB connection string in `app.js` if needed.

## Getting Started

1. Seed the database with initial data:
   ```
   npm run seed
   ```
   This will create an admin user, regular users, and sample bugs.

2. Start the application:
   ```
   npm start
   ```
   For development with automatic restarts:
   ```
   npm run dev
   ```

3. Open your browser and navigate to: `http://localhost:3000`

## Default Users

After running the seed script, you can log in with:

- **Admin User**:
  - Username: admin
  - Password: admin123

- **Regular User**:
  - Username: user1
  - Password: user123

## Project Structure

```
bug-tracker/
├── models/             # MongoDB models
│   ├── Bug.js
│   └── User.js
├── public/             # Static assets
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/        # Uploaded bug screenshots
├── views/              # EJS templates
│   ├── layouts/
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── new_bug.ejs
│   ├── bug_detail.ejs
│   └── admin_dashboard.ejs
├── app.js              # Main application file
├── seeds.js            # Database seeding script
└── package.json
```

## Key Features Explained

### Authentication System

The app uses Passport.js with a Local Strategy for authentication. Passwords are hashed using bcrypt for security.

### File Uploads

Bug reports can include screenshots, which are stored in the `public/uploads` directory using Multer.

### Access Control

- Only authenticated users can report bugs and view the dashboard
- Only admins can change bug statuses (except for cancellation)
- Bug creators can cancel their own reports
- Only admins can access the admin panel and manage users

## Production Deployment

For production deployment, you should:

1. Set up proper environment variables
2. Configure a production MongoDB database
3. Implement additional security measures
4. Consider using a process manager like PM2
5. Set up a reverse proxy with Nginx or similar

## License

[MIT License](LICENSE)