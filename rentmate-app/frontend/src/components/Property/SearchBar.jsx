// Autocomplete Search Bar Component
// Purpose: Autocomplete input panel query router.
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPropertySuggestions } from '../../features/properties/services/propertyApi.js';

export default function SearchBar({ className = '' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // States
  const [city, setCity] = useState(searchParams.get('city') || 'Bangalore');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('searchQuery') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [recentSearches, setRecentSearches] = useState([]);

  // Auto-sync search inputs with URL updates
  useEffect(() => {
    setCity(searchParams.get('city') || 'Bangalore');
    setSearchQuery(searchParams.get('searchQuery') || '');
  }, [searchParams]);

  // Click outside to dismiss suggestions dropdown overlay
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load recent searches from localStorage
  useEffect(() => {
    setRecentSearches(JSON.parse(localStorage.getItem('recent_searches') || '[]'));
  }, [showSuggestions]);

  // Fetch suggestions using React Query with Axios abort signal support
  const { data: suggestionsResponse, isLoading } = useQuery({
    queryKey: ['suggestions', debouncedSearchQuery, city],
    queryFn: ({ signal }) => getPropertySuggestions({ searchQuery: debouncedSearchQuery, city }, { signal }).then((res) => res.data?.data || []),
    enabled: debouncedSearchQuery.trim().length >= 2,
    staleTime: 30000,
  });

  const suggestions = suggestionsResponse || [];

  const saveRecentSearch = (query) => {
    if (!query || !query.trim()) return;
    const trimmed = query.trim();
    let recents = JSON.parse(localStorage.getItem('recent_searches') || '[]');
    recents = recents.filter((item) => item !== trimmed);
    recents.unshift(trimmed);
    recents = recents.slice(0, 5);
    localStorage.setItem('recent_searches', JSON.stringify(recents));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    saveRecentSearch(searchQuery);
    
    const params = new URLSearchParams(searchParams);
    if (city) params.set('city', city);
    if (searchQuery) {
      params.set('searchQuery', searchQuery.trim());
    } else {
      params.delete('searchQuery');
    }
    
    navigate(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    const selectedText = suggestion.address?.locality || suggestion.title;
    setSearchQuery(selectedText);
    saveRecentSearch(selectedText);
    
    const params = new URLSearchParams(searchParams);
    if (city) params.set('city', city);
    params.set('searchQuery', selectedText);
    
    navigate(`/search?${params.toString()}`);
  };

  const handleRecentClick = (term) => {
    setShowSuggestions(false);
    setSearchQuery(term);
    saveRecentSearch(term);
    
    const params = new URLSearchParams(searchParams);
    if (city) params.set('city', city);
    params.set('searchQuery', term);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div ref={containerRef} className={`relative max-w-3xl w-full z-30 ${className}`}>
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col md:flex-row gap-2 md:gap-0 bg-white p-2 rounded-2xl md:rounded-full shadow-lg border border-slate-200/50"
      >
        {/* City Selector */}
        <div className="flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Pune">Pune</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Gorakhpur">Gorakhpur</option>
            <option value="Lucknow">Lucknow</option>
          </select>
        </div>

        {/* Input Text query */}
        <div className="flex-1 flex items-center px-4 py-2 relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.608 10.608Z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search by locality, area, or listing name..."
            className="w-full bg-transparent text-sm text-slate-700 focus:outline-hidden font-medium placeholder-slate-400"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="brand-gradient hover:opacity-95 text-white font-bold text-sm px-8 py-3 rounded-xl md:rounded-full flex items-center justify-center gap-1 shadow-md transition-all duration-200 cursor-pointer"
        >
          <span>Search</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </form>

      {/* Suggestions Dropdown panel */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-72 overflow-y-auto z-50">
          {searchQuery.trim().length < 2 && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2.5 text-[10px] font-extrabold text-slate-400 border-b border-slate-50 bg-slate-50/55 tracking-wider uppercase">
                Recent Searches
              </div>
              <ul className="divide-y divide-slate-50">
                {recentSearches.map((term, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleRecentClick(term)}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50/50 flex items-center gap-3 text-xs font-semibold text-slate-600 transition-colors duration-150 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {searchQuery.trim().length >= 2 && isLoading && (
            <div className="p-4 text-xs text-slate-400 flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-500 border-t-transparent" />
              Loading suggestions...
            </div>
          )}
          
          {searchQuery.trim().length >= 2 && !isLoading && suggestions.length === 0 && (
            <div className="p-4 text-xs text-slate-400">
              No matching areas or listings found for &quot;{searchQuery}&quot; in {city}.
            </div>
          )}

          {searchQuery.trim().length >= 2 && !isLoading && suggestions.length > 0 && (
            <ul className="divide-y divide-slate-50">
              {suggestions.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50/50 flex items-start gap-3 transition-colors duration-150 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Locality: {item.address?.locality || 'Unknown'}, {item.address?.city}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
