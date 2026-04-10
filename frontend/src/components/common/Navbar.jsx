import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import notificationService from '../../services/notification.service';

const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getNotifications(false);
      setNotifications(data);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch(err) {}
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch(err) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (hasRole('ADMIN')) return '/admin';
    if (hasRole('HOSPITAL')) return '/hospital';
    if (hasRole('BLOODBANK')) return '/bloodbank';
    if (hasRole('DONOR')) return '/donor/dashboard';
    return '/';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blood rounded-lg blur-sm opacity-60 group-hover:opacity-80 transition"></div>
                <div className="relative bg-white rounded-lg px-3 py-1.5">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-blood bg-clip-text text-transparent">
                    BloodChain
                  </span>
                  <span className="ml-1 text-xs font-medium text-gray-400">AI</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            
            {!isAuthenticated && (
              <Link
                to="/donor/login"
                className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Donor Login
              </Link>
            )}

            {isAuthenticated && (
              <Link to={getDashboardLink()} className="nav-link">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {isAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100 transition relative"
                >
                  {notifications.length > 0 ? (
                    <>
                      <BellAlertIcon className="h-5 w-5 text-primary-600 animate-pulse" />
                      <span className="absolute top-1 right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                      </span>
                    </>
                  ) : (
                    <BellIcon className="h-5 w-5" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {notifications.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-800">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">No new notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            className={`px-4 py-3 border-b border-gray-50 flex flex-col cursor-pointer transition ${notif.notification_type === 'EMERGENCY' ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500' : 'hover:bg-gray-50'}`} 
                            onClick={() => markRead(notif.id)}
                          >
                            <div className="flex justify-between w-full items-center">
                              <span className={`text-xs font-bold flex items-center ${notif.notification_type === 'EMERGENCY' ? 'text-red-700' : 'text-blue-600'}`}>
                                {notif.notification_type === 'EMERGENCY' && <BellAlertIcon className="h-4 w-4 mr-1 inline animate-pulse" />}
                                {notif.notification_type}
                              </span>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">new</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 mt-2">{notif.title}</p>
                            <p className="text-xs text-gray-700 mt-1">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition group"
                >
                  <div className="relative">
                    <UserCircleIcon className="h-6 w-6 text-gray-600 group-hover:text-primary-600" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                    {user?.role?.toLowerCase()}
                  </span>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.role}</p>
                      <p className="text-xs text-gray-500 mt-1">Signed in</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                      Your Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-400" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-800 transition shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            {!isAuthenticated && (
              <Link 
                to="/donor/login" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Donor Login
              </Link>
            )}
            
            {isAuthenticated && (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="block px-3 py-2 text-primary-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;