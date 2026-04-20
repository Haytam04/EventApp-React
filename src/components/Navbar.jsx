import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { Menu, X, LogOut, User as UserIcon, PlusCircle, LayoutGrid, Calendar } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    setIsOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  // Helper component for links to handle closing menu on click
  const NavLink = ({ to, children, className = "" }) => (
    <Link 
      to={to} 
      onClick={() => setIsOpen(false)}
      className={`text-gray-700 hover:text-blue-600 font-medium transition ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          EventHub
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/">Events</NavLink>
          
          {user ? (
            <>
              <NavLink to="/categories">Category</NavLink>
              <NavLink to="/my-events">My Events</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <Link to="/create-event" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                + Create Event
              </Link>
              
              <div className="flex items-center space-x-4 border-l pl-6 ml-2">
                <span className="text-sm font-semibold text-gray-600">
                  {user.displayName || "User"}
                </span>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="space-x-4">
              <NavLink to="/login" className="text-blue-600 font-bold">Login</NavLink>
              <NavLink to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">Register</NavLink>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 animate-in slide-in-from-top duration-200">
          <div className="px-6 py-6 flex flex-col space-y-4">
            <NavLink to="/" className="flex items-center gap-2 text-lg">
              <Calendar size={20} /> Events
            </NavLink>

            {user ? (
              <>
                <NavLink to="/categories" className="flex items-center gap-2 text-lg">
                  <LayoutGrid size={20} /> Categories
                </NavLink>
                <NavLink to="/my-events" className="flex items-center gap-2 text-lg">
                  <PlusCircle size={20} /> My Events
                </NavLink>
                <NavLink to="/profile" className="flex items-center gap-2 text-lg">
                  <UserIcon size={20} /> Profile
                </NavLink>
                <hr className="border-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">{user.displayName || "User"}</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 font-bold"
                  >
                    Logout <LogOut size={18} />
                  </button>
                </div>
                <Link 
                  to="/create-event" 
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 text-white text-center py-3 rounded-lg font-bold shadow-md active:scale-95 transition"
                >
                  + Create Event
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 text-blue-600 font-bold border border-blue-600 rounded-lg"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2 bg-blue-600 text-white font-bold rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;