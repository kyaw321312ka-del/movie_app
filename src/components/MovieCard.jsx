const MovieCard = ({ movie }) => {
  const { title, poster_path, release_date, vote_average } = movie;

  return (
    <li className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer">
      <div className="aspect-[2/3] overflow-hidden bg-slate-800">
        {poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${poster_path}`}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
            No poster
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-semibold text-sm text-white line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
          <span>{release_date?.slice(0, 4) || "—"}</span>
          <span className="text-amber-400">
            ★ {vote_average?.toFixed(1) || "N/A"}
          </span>
        </div>
      </div>
    </li>
  );
};

export default MovieCard;