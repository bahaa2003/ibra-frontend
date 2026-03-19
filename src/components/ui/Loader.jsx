import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center p-8 w-full h-full min-h-[200px]">
      <div className="flex flex-row gap-2">
        <div className="h-3.5 w-3.5 rounded-full bg-[var(--color-primary)] animate-bounce"></div>
        <div className="h-3.5 w-3.5 rounded-full bg-[var(--color-primary-soft)] animate-bounce [animation-delay:-.3s]"></div>
        <div className="h-3.5 w-3.5 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>
  );
};

export default Loader;
