import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiShield,
  FiSearch,
  FiMessageSquare,
  FiTrendingUp,
  FiLock,
  FiCheckSquare,
  FiSliders,
  FiHeart,
  FiBell,
  FiSmartphone
} from 'react-icons/fi';

// Feature Cards configuration
const features = [
  {
    title: 'Verified Properties',
    description: 'Every listing undergoes verification to ensure quality, trust, and transparency.',
    icon: <FiShield className="w-6 h-6" />,
  },
  {
    title: 'Smart Search',
    description: 'Advanced filters, location-based search, amenities, and price range selection help users find the right property quickly.',
    icon: <FiSearch className="w-6 h-6" />,
  },
  {
    title: 'Real-Time Communication',
    description: 'Connect directly with property owners through inquiries, notifications, and chat functionality.',
    icon: <FiMessageSquare className="w-6 h-6" />,
  },
  {
    title: 'Analytics & Management',
    description: 'Property owners gain insights through dashboards, analytics, and inquiry tracking.',
    icon: <FiTrendingUp className="w-6 h-6" />,
  },
];

// Stats Configuration
const stats = [
  { value: '1000+', label: 'Properties Listed' },
  { value: '500+', label: 'Active Owners' },
  { value: '5000+', label: 'Happy Tenants' },
  { value: '99%', label: 'Satisfaction Rate' },
];

// Why Choose Configuration
const whyChoose = [
  {
    title: 'Secure Authentication',
    description: 'Robust authentication mechanisms with JWT and OAuth verification keep your data secure.',
    icon: <FiLock className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: 'Verified Listings',
    description: 'We manually check property details and owner identities to prevent listing fraud.',
    icon: <FiCheckSquare className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: 'Easy Property Management',
    description: 'Owners can easily add, edit, and manage their listings and review insights in one place.',
    icon: <FiSliders className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: 'Wishlist Support',
    description: 'Save your favorite listings and compare them later when finding the perfect place.',
    icon: <FiHeart className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: 'Real-Time Notifications',
    description: 'Get notified instantly when owners respond to inquiries or send chat messages.',
    icon: <FiBell className="w-5 h-5 text-indigo-600" />,
  },
  {
    title: 'Mobile Friendly Experience',
    description: 'Fully responsive UI makes searching and managing properties easy on any device.',
    icon: <FiSmartphone className="w-5 h-5 text-indigo-600" />,
  },
];

// Main About Component
export default function AboutRentMate() {
  return (
    <section className="space-y-16 max-w-7xl mx-auto py-8">
      {/* Hero & Description */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          About RentMate Platform
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Find Your Perfect Stay with RentMate
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          RentMate simplifies accommodation discovery by connecting tenants with verified property owners.
          Users can search, compare, wishlist, inquire, chat, and manage rental properties through one modern platform.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 text-indigo-600 flex items-center justify-center mb-4 shadow-2xs">
              {feature.icon}
            </div>
            <h3 className="font-extrabold text-slate-800 text-base mb-2">
              {feature.title}
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Statistics banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-semibold tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose RentMate Grid */}
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Why Choose RentMate?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            We build experiences that make finding and listing accommodation hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChoose.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-xs transition-all duration-200"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mt-0.5">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">
                  {item.title}
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Named export for Footer CTA component (Requirement 6)
export function FooterCTA() {
  const { token, user } = useSelector((state) => state.auth);

  return (
    <section className="relative rounded-3xl overflow-hidden brand-gradient text-white py-12 px-6 sm:px-12 text-center shadow-xl max-w-7xl mx-auto my-8">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
          Ready to Find Your Next Home?
        </h2>
        <p className="text-sm sm:text-base text-slate-100 max-w-lg mx-auto font-medium">
          Browse verified listings or list your property today.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/search"
            className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-md hover:bg-slate-50 transition-all duration-200 text-sm text-center cursor-pointer"
          >
            Explore Properties
          </Link>
          <Link
            to={token && user ? '/owner/properties/add' : '/login'}
            className="w-full sm:w-auto px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all duration-200 text-sm text-center cursor-pointer"
          >
            List Your Property
          </Link>
        </div>
      </div>
    </section>
  );
}
