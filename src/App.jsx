import Search from "./components/search";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errormessage, setErrorMessage] = useState(
    API_KEY ? null : "TMDB API token is not configured. Set VITE_TMDB_API_KEY in .env."
  );

  const fetchMovies = async (query) => {
    if (!API_KEY) {
      throw new Error("TMDB API token is not configured. Set VITE_TMDB_API_KEY in .env.");
    }

    const isSearching = query.trim().length > 0;
    const endpoint = isSearching ? "search/movie" : "discover/movie";
    const params = new URLSearchParams({
      language: "en-US",
      page: "1",
    });

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
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.status_message || `TMDB request failed (${response.status}).`);
    }

    console.log("Fetched movies:", data.results);
  };

  useEffect(() => {
    let cancelled = false;

    fetchMovies(searchTerm)
      .then(() => {
        if (!cancelled) {
          setErrorMessage(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error fetching movies:", error);
          setErrorMessage(error.message || "Failed to fetch movies.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [searchTerm]);

  return (
    <main>
      <div className="pattern" />
      <div className="content flex flex-col items-center justify-center min-h-screen text-center bg-amber-950">
        <header className="flex flex-col items-center justify-center gap-4">
          <img src="./hero.jpg" alt="" />
          <h1 className="text-3xl md:text-3xl font-bold text-white">
            Find <span className="text-blue-500">Movies</span> You Enjoy without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        <section>
          <h2 className="text-2xl font-bold text-white">All Movies</h2>
          {errormessage && <p className="text-red-500">{errormessage}</p>}
        </section>
      </div>
    </main>
  );
};

export default App;
