import { useState, useEffect, useRef } from 'react';
import MobileDrawer from './MobileDrawer';

export default function MobileSearch({ 
  placeholder = "Rechercher...", 
  onSearch, 
  filters = [], 
  suggestions = [],
  showFilters = false,
  onFilterChange 
}) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const inputRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 0) {
        onSearch?.(query, activeFilters);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeFilters, onSearch]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
    onSearch?.(suggestion, activeFilters);
  };

  const handleFilterChange = (filterId, value) => {
    const newFilters = { ...activeFilters, [filterId]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange?.({});
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mobile-input pl-10 pr-20"
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
        />

        {/* Actions */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {/* Clear button */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Filter button */}
          {showFilters && (
            <button
              onClick={() => setShowFilterDrawer(true)}
              className={`
                p-2 rounded-lg transition-colors relative
                ${activeFilterCount > 0 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              
              {/* Filter count badge */}
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 mobile-touch-target"
            >
              <div className="flex items-center">
                <svg className="h-4 w-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm text-gray-900">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            if (!value) return null;
            const filter = filters.find(f => f.id === filterId);
            if (!filter) return null;

            return (
              <div
                key={filterId}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
              >
                <span>{filter.label}: {value}</span>
                <button
                  onClick={() => handleFilterChange(filterId, '')}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
          
          {activeFilterCount > 1 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Tout effacer
            </button>
          )}
        </div>
      )}

      {/* Filter Drawer */}
      <MobileDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        title="Filtres de recherche"
        position="bottom"
      >
        <div className="space-y-6">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {filter.label}
              </label>
              
              {filter.type === 'select' && (
                <select
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="mobile-input"
                >
                  <option value="">Tous</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {filter.type === 'range' && (
                <div className="space-y-2">
                  <input
                    type="range"
                    min={filter.min || 0}
                    max={filter.max || 100}
                    value={activeFilters[filter.id] || filter.min || 0}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{filter.min || 0}</span>
                    <span className="font-medium text-gray-900">
                      {activeFilters[filter.id] || filter.min || 0} {filter.unit || ''}
                    </span>
                    <span>{filter.max || 100}</span>
                  </div>
                </div>
              )}
              
              {filter.type === 'checkbox' && (
                <div className="space-y-2">
                  {filter.options?.map((option) => (
                    <label key={option.value} className="flex items-center mobile-touch-target">
                      <input
                        type="checkbox"
                        checked={activeFilters[filter.id]?.includes(option.value) || false}
                        onChange={(e) => {
                          const current = activeFilters[filter.id] || [];
                          const newValue = e.target.checked
                            ? [...current, option.value]
                            : current.filter(v => v !== option.value);
                          handleFilterChange(filter.id, newValue);
                        }}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="flex-1 mobile-button mobile-button-secondary"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="flex-1 mobile-button mobile-button-primary"
            >
              Appliquer
            </button>
          </div>
        </div>
      </MobileDrawer>
    </div>
  );
}
