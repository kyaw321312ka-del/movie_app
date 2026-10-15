import { Client, Databases, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

// Lazily create the client only if config is present
const client = new Client();
if (ENDPOINT && PROJECT_ID) {
  client.setEndpoint(ENDPOINT).setProject(PROJECT_ID);
}
const databases = new Databases(client);

/**
 * Increment the search count for a movie, or create the record if it doesn't exist.
 * @param {string} searchTerm - the current search query
 * @param {object} movie - the movie object from TMDB (needs id, title, poster_path)
 */
export const updateSearchCount = async (searchTerm, movie) => {
  // Guard: skip if Appwrite isn't configured
  if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !COLLECTION_ID) {
    console.warn("Appwrite config missing — skipping updateSearchCount.");
    return;
  }

  const movieId = String(movie.id);

  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("movie_id", movieId), Query.limit(1)]
    );

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await databases.incrementDocumentAttribute(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        "count",
        1
      );
    } else {
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          movieId,
          {
            searchTerm,
            movie_id: movieId,
            poster_url: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "",
            count: 1,
          }
        );
      } catch (error) {
        if (error.code !== 409) throw error;

        const existing = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal("movie_id", movieId), Query.limit(1)]
        );
        if (existing.documents.length === 0) throw error;

        await databases.incrementDocumentAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          existing.documents[0].$id,
          "count",
          1
        );
      }
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};

export const getTrendingMovies = async () => {
  if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !COLLECTION_ID) {
    console.warn("Appwrite config missing — skipping getTrendingMovies.");
    return [];
  }
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.greaterThanEqual("count", 1),  // optional: require at least 1
        Query.orderDesc("count"),
        Query.limit(10),                      // top 5 is plenty for a row10
      ]
    );
    return result.documents;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};