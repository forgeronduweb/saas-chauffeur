import { useState } from 'react';

// Version simplifiée pour tester
export default function SimpleSearchTest() {
  const [query, setQuery] = useState('');

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          console.log('Typing:', e.target.value);
          setQuery(e.target.value);
        }}
        placeholder="Test search..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <p className="mt-2">Query: {query}</p>
    </div>
  );
}
