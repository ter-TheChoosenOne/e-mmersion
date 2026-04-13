# Work Immersion System Frontend

A comprehensive web application for managing work immersion programs, built with React and Vite. This frontend provides interfaces for students, teachers, and administrators to manage work immersion activities, attendance tracking, and system administration.

## 🚀 Features

### Student Features
- Dashboard with immersion program overview
- Attendance tracking and reporting
- Profile management
- Real-time notifications via Socket.io

### Teacher Features
- Student management and monitoring
- Attendance verification and reporting
- Program coordination tools
- Communication with students and administrators

### Administrator Features
- User management (students, teachers, admins)
- System configuration and settings
- Attendance reports and analytics
- Security settings and access logs
- Backup and restore functionality
- User statistics and insights

### General Features
- Secure authentication and authorization
- Responsive design for mobile and desktop
- Google Maps integration for location-based features
- Real-time communication
- Role-based access control

## 🛠 Tech Stack

- **Frontend Framework:** React 19.2.4
- **Build Tool:** Vite 8.0.1
- **Routing:** React Router DOM 7.14.0
- **HTTP Client:** Axios 1.15.0
- **Real-time Communication:** Socket.io Client 4.8.3
- **Maps Integration:** @react-google-maps/api 2.20.8
- **Icons:** React Icons 5.6.0
- **Styling:** Custom CSS with PostCSS
- **Linting:** ESLint 9.39.4
- **Type Checking:** TypeScript (via @types/react)

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── assets/images/     # Image files
│   ├── favicon.svg        # Favicon
│   └── icons.svg          # Icon sprites
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Shared components (Button, Input, Loader)
│   │   └── layout/        # Layout components (Navbar, ProtectedRoute)
│   ├── context/           # React contexts (AuthContext)
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin-specific pages
│   │   └── *.jsx          # Main pages (Login, Dashboard, etc.)
│   ├── routes/            # Routing configuration
│   ├── services/          # API services
│   ├── styles/            # CSS stylesheets
│   ├── App.jsx            # Main app component
│   └── main.jsx           # App entry point
├── dist/                  # Build output (generated)
├── node_modules/          # Dependencies
├── package.json           # Project dependencies and scripts
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── README.md              # This file
```

## 🏁 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd work-immersion-system/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory with the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_SOCKET_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## 🔧 Configuration

### Vite Configuration

The project uses Vite for fast development and optimized production builds. Key configurations include:
- React plugin for JSX support
- PostCSS for CSS processing
- Hot Module Replacement (HMR) for development

### ESLint Configuration

ESLint is configured with:
- React-specific rules
- React Hooks rules
- React Refresh plugin for HMR compatibility

## 🔐 Authentication & Authorization

The application implements role-based access control with three user types:
- **Students:** Access to personal dashboard and basic features
- **Teachers:** Student management and program coordination
- **Administrators:** Full system access and management

Authentication is handled through:
- JWT tokens stored in localStorage
- Protected routes using React Router
- Context-based authentication state management

## 🌐 API Integration

The frontend communicates with a backend API using Axios. Key features:
- Centralized API service in `src/services/api.js`
- Automatic token attachment for authenticated requests
- Error handling and response interceptors
- Real-time updates via Socket.io

## 🎨 Styling

The application uses custom CSS with:
- Global styles in `src/styles/global.css`
- Component-specific stylesheets
- PostCSS for processing
- Responsive design principles

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder**
   The build output in the `dist` directory can be deployed to any static hosting service.

## 🤝 Contributing

1. Follow the existing code style and structure
2. Run `npm run lint` before committing
3. Test your changes thoroughly
4. Create descriptive commit messages

## 📝 Notes

- This project uses React 19 with the new JSX transform
- The React Compiler is not enabled to maintain development performance
- TypeScript is available for type checking but not enforced
- The application is designed to work with a corresponding backend API

## 📄 License

This project is part of the Work Immersion System. Please refer to the main project license for usage terms.
