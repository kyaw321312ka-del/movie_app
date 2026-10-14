const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="w-full max-w-xl">
      <div className="relative group">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors"
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
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-base
                     bg-white/5 backdrop-blur-xl
                     text-white placeholder:text-slate-500
                     border border-white/10
                     shadow-lg shadow-black/20
                     transition-all duration-200
                     focus:outline-none focus:bg-white/10
                     focus:border-blue-500/50
                     focus:ring-4 focus:ring-blue-500/20
                     hover:bg-white/[0.07] hover:border-white/20"
        />
      </div>
    </div>
  );
};

export default Search;