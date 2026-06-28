// Platform Home Page Route
// Purpose: Renders search fields, locality cards, and promotional property listings.
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/Property/SearchBar.jsx';
import PropertyCard from '../components/Property/PropertyCard.jsx';
import { getFeaturedProperties, getTrendingLocalities } from '../features/properties/services/propertyApi.js';
import AboutRentMate, { FooterCTA } from '../components/home/AboutRentMate.jsx';

export default function Home() {
  const navigate = useNavigate();

  // Query featured properties
  const { data: featuredProperties, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featuredPropertiesHome'],
    queryFn: () => getFeaturedProperties({ limit: 3 }).then((res) => res.data?.data || []),
  });

  // Query trending localities in Bangalore (default city)
  const { data: trendingLocalities, isLoading: isLocalitiesLoading } = useQuery({
    queryKey: ['trendingLocalitiesHome'],
    queryFn: () => getTrendingLocalities('Bangalore').then((res) => res.data?.data || []),
  });

  const handleCategoryClick = (type) => {
    navigate(`/search?city=Bangalore&propertyType=${type}`);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden brand-gradient text-white py-20 px-6 sm:px-12 text-center shadow-xl">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="bg-white/10 text-white border border-white/20 text-xs uppercase font-extrabold px-3 py-1 rounded-full tracking-wider">
            DIRECT OWNER LISTINGS &bull; ZERO BROKERAGE
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-display">
            Find Your Perfect Room, PG, or Hostel
          </h1>
          <p className="text-base sm:text-lg text-slate-100 max-w-xl mx-auto font-medium">
            Explore verified accommodations with dynamic maps, direct booking, and peer reviews.
          </p>

          <div className="pt-4 flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="space-y-6 max-w-7xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800">Browse by Stay Category</h2>
          <p className="text-xs text-slate-400">Choose the accommodation type that best fits your lifestyle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              type: 'PG',
              title: 'Co-Living / PG',
              desc: 'Fully managed shared accommodation with food, laundry, and WiFi.',
              bg: 'from-blue-500/10 to-indigo-500/10 text-indigo-600',
              icon: 'M18 18.72a.75.75 0 0 0 0-1.5H6a.75.75 0 0 0 0 1.5h12Z',
            },
            {
              type: 'Hostel',
              title: 'Student Hostels',
              desc: 'Affordable community living rooms near prime universities.',
              bg: 'from-cyan-500/10 to-teal-500/10 text-teal-600',
              icon: 'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21',
            },
            {
              type: 'Flat',
              title: 'Shared & Private Flats',
              desc: 'Independent apartments or sublets for professionals and couples.',
              bg: 'from-purple-500/10 to-pink-500/10 text-pink-600',
              icon: 'M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545',
            },
          ].map((cat) => (
            <button
              key={cat.type}
              onClick={() => handleCategoryClick(cat.type)}
              className="p-6 bg-white border border-slate-100 rounded-2xl text-left hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 group"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.bg} w-fit`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-extrabold text-slate-800">Featured Properties</h2>
            <p className="text-xs text-slate-400">Handpicked premium listings verified by RentMate</p>
          </div>
          <Link
            to="/search"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 hover:underline"
          >
            Explore All
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {isFeaturedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties?.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* About RentMate Platform */}
      <AboutRentMate />

      {/* Trending Localities */}
      <section className="space-y-6 max-w-7xl mx-auto">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-800">Popular Localities in Bangalore</h2>
          <p className="text-xs text-slate-400">Discover rental hubs with density statistics</p>
        </div>

        {isLocalitiesLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {trendingLocalities?.map((item) => (
              <Link
                key={item.locality}
                to={`/search?city=Bangalore&searchQuery=${item.locality}`}
                className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 hover:shadow-xs transition-all duration-150 flex flex-col justify-between hover:-translate-y-0.5"
              >
                <h4 className="font-bold text-slate-800 text-sm truncate">{item.locality}</h4>
                <div className="mt-3 flex items-center justify-between text-[10px] font-semibold">
                  <span className="text-slate-400">{item.propertiesCount} Stays</span>
                  <span className="text-indigo-600">Avg ₹{item.averagePrice.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <FooterCTA />
    </div>
  );
}

