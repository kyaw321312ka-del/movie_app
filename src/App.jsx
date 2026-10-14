import Search from "./components/Search";
import Spinner from "./components/spinner";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [state, setState] = useState({
    status: API_KEY ? "idle" : "error",
    data: [],
    error: API_KEY
      ? null
      : "TMDB API token is not configured. Set VITE_TMDB_API_KEY in .env.",
  });

  // Debounce search term
  useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Fetch movies when debounced term changes
  useEffect(() => {
    if (!API_KEY) return;
    const controller = new AbortController();

    const fetchMovies = async (query) => {
      const isSearching = query.trim().length > 0;
      const endpoint = isSearching ? "search/movie" : "discover/movie";
      const params = new URLSearchParams({ language: "en-US", page: "1" });

      if (isSearching) {
        params.set("query", query.trim());
      } else {
        params.set("include_adult", "false");
        params.set("include_video", "false");
        params.set("sort_by", "popularity.desc");
      }

      const response = await fetch(`${API_BASE_URL}/${endpoint}?${params}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        signal: controller.signal,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.status_message || `TMDB request failed (${response.status}).`
        );
      }
      return data.results ?? [];
    };

    const run = async () => {
      // ✅ setState inside async function — no synchronous setState in effect body
      setState((prev) => ({ ...prev, status: "loading" }));

      try {
        const results = await fetchMovies(debouncedTerm);
        setState({ status: "success", data: results, error: null });
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error fetching movies:", error);
        setState({
          status: "error",
          data: [],
          error: error.message || "Failed to fetch movies.",
        });
      }
    };

    run();

    return () => controller.abort();
  }, [debouncedTerm]);

  // Derived during render — no extra state, no cascading render
  const isLoading = state.status === "loading" || state.status === "idle";
  const movieList = state.data;
  const errorMessage = state.error;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient gradient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-8 py-12">
        {/* Header */}
        <header className="flex flex-col items-center gap-6 mb-12 max-w-3xl w-full">
          

          <h1 className="text-4xl md:text-6xl font-bold text-center tracking-tight leading-tight">
            Find{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              Movies
            </span>{" "}
            You'll Enjoy
            <span className="block text-slate-400 text-2xl md:text-3xl font-normal mt-3">
              without the hassle
            </span>
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Results */}
        <section className="w-full max-w-7xl">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-white">
              {debouncedTerm ? (
                <>
                  Results for{" "}
                  <span className="text-blue-400">"{debouncedTerm}"</span>
                </>
              ) : (
                "Trending Now"
              )}
            </h2>
            {!isLoading && movieList.length > 0 && (
              <span className="text-sm text-slate-400">
                {movieList.length} results
              </span>
            )}
          </div>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {errorMessage}
            </div>
          ) : movieList.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg">No movies found</p>
              <p className="text-sm mt-1">Try a different search term.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {movieList.map((movie) => (
                <li
                  key={movie.id}
                  className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-slate-800">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
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
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                      <span>{movie.release_date?.slice(0, 4) || "—"}</span>
                      <span className="text-amber-400">
                        ★ {movie.vote_average?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;