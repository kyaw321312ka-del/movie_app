const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="w-full max-w-xl px-4">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>

        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full text-lg
                 bg-amber-900/40 backdrop-blur-sm
                 text-white placeholder:text-amber-300/70
                 border border-amber-500/50
                 shadow-lg shadow-black/20
                 transition-all duration-200
                 focus:outline-none focus:border-blue-400
                 focus:ring-2 focus:ring-blue-500/50
                 hover:border-amber-400"
        />
      </div>
    </div>
  );
};

export default Search;
