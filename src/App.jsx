import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// We will create these components in the next step - KHAOULA - WIAM
const Home = () => <div className="p-8 text-center text-2xl font-bold">Event List (Coming Soon)</div>;
const CreateEvent = () => <div className="p-8 text-center text-2xl font-bold">Create New Event Form (Coming Soon)</div>;

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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;