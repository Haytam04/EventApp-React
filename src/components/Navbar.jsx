import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600 bold">Eventing App</Link>

      <div className="space-x-6 flex items-center">
        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Events</Link>

        {user ? (
          <>
            <Link to="/categories" className="text-gray-700 hover:text-blue-600 font-medium">
              Category
            </Link>

            <Link to="/my-events" className="text-gray-700 hover:text-blue-600 font-medium">
              My Events
            </Link>

            <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium">
              Profile
            </Link>

            <Link to="/create-event" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              + Create Event
            </Link>

            <div className="flex items-center space-x-3 border-l pl-6">
              <span className="text-sm font-semibold text-gray-600 hidden md:block">
                Hello, {user.displayName || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 text-sm font-bold"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="text-blue-600 font-bold">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;