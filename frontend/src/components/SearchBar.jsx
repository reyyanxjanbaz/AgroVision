import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const SearchBar = () => {
  const { t } = useSettings();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full group">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted group-hover:text-primary transition-colors" size={16} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-text-primary dark:text-text-primary placeholder-text-muted dark:placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
      />
    </form>
  );
};

export default SearchBar;
