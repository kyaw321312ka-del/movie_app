import Search from "./components/Search";
import Spinner from "./components/spinner";
import MovieCard from "./components/MovieCard";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { updateSearchCount } from "./appwrite.js";

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

  // Debounce via react-use
  useDebounce(() => setDebouncedTerm(searchTerm), 300, [searchTerm]);

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
      setState((prev) => ({ ...prev, status: "loading" }));
      try {
        const results = await fetchMovies(debouncedTerm);
        setState({ status: "success", data: results, error: null });

        // ✅ Record the search hit in Appwrite (only when actually searching)
        if (debouncedTerm.trim() && results.length > 0) {
          await updateSearchCount(debouncedTerm, results[0]);
        }
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

  const isLoading = state.status === "loading" || state.status === "idle";
  const movieList = state.data;
  const errorMessage = state.error;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* ===== HERO with background image ===== */}
      <section className="relative w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/70 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

        <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-8 pt-20 pb-28 text-center">
          <h1 className="max-w-4xl text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Find{" "}
            <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
              Movies
            </span>{" "}
            You'll Enjoy
            <span className="block text-slate-300 text-xl md:text-2xl lg:text-3xl font-normal mt-4">
              without the hassle
            </span>
          </h1>

          <div className="mt-10 w-full flex justify-center">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </section>

      {/* ===== Ambient gradient glows behind the results ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[120px]" />
      </div>

      {/* ===== Results ===== */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-20">
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
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default App;