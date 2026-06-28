import React, { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Simulating user authentication state for the MVP
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [userRole, setUserRole] = useState('tenant'); // Options: 'tenant' or 'owner'

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-2xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
              <span className="text-3xl">🏠</span> RentMate
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/explore" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Find PGs
            </a>
            
            {isLoggedIn && userRole === 'tenant' && (
              <a href="/wishlist" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                Wishlist ❤️
              </a>
            )}

            {isLoggedIn && userRole === 'owner' && (
              <a href="/dashboard" className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md font-medium hover:bg-indigo-100 transition-colors">
                Owner Dashboard
              </a>
            )}
          </div>

          {/* User Profile / Auth Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* Role Switcher Demo */}
                <button 
                  onClick={() => setUserRole(userRole === 'tenant' ? 'owner' : 'tenant')}
                  className="text-xs text-gray-500 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
                >
                  Switch to {userRole === 'tenant' ? 'Owner' : 'Tenant'}
                </button>
                
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  {userRole === 'owner' ? 'O' : 'T'}
                </div>
                
                <button 
                  onClick={() => setIsLoggedIn(false)}
                  className="text-gray-600 hover:text-red-600 font-medium text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <a href="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  Login
                </a>
                <a href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm">
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-fadeIn" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
              Find PGs
            </a>
            
            {isLoggedIn && userRole === 'tenant' && (
              <a href="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
                Wishlist
              </a>
            )}

            {isLoggedIn && userRole === 'owner' && (
              <a href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 bg-indigo-50">
                Owner Dashboard
              </a>
            )}

            <div className="border-t border-gray-200 my-2 pt-2">
              {isLoggedIn ? (
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              ) : (
                <>
                  <a href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                    Login
                  </a>
                  <a href="/register" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 text-center shadow-sm">
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;