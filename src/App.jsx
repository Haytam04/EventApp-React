import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryManager from './components/CategoryManager';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import CreateEvent from './components/CreateEvent';
import MyEvents from './components/MyEvents';
import Profile from './components/Profile';

// We will create these components in the next step - KHAOULA - WIAM



function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Navbar stays at the top of every page */}
        <Navbar />

        <div className="min-h-screen bg-gray-50">
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes (User must be logged in) */}
            <Route
              path="/create-event"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-events"
              element={
                <ProtectedRoute>
                  <MyEvents />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoryManager />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;