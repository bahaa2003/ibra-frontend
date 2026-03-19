import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from './Button';
import { Search } from 'lucide-react';
import { searchInputClassName } from './Input';

<<<<<<< HEAD
const SearchBar = ({ value, onChange, placeholder, className, inputClassName, ...props }) => {
=======
const SearchBar = ({ value, onChange, placeholder, className, ...props }) => {
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const handleChange = (e) => {
    if (typeof onChange !== 'function') return;
    onChange(e.target.value);
  };
  
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <Search
          className={cn(
            'pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-muted)]',
            isRTL ? 'right-4' : 'left-4'
          )}
        />
        <input
          type="search"
          className={cn(
            searchInputClassName,
<<<<<<< HEAD
            inputClassName,
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            isRTL ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'
          )}
          placeholder={placeholder || ''}
          value={value}
          onChange={handleChange}
          id="search-input"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          {...props}
        />
      </div>
    </div>
  );
};

export default SearchBar;
