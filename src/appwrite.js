import { Client, Databases, ID, Query } from "appwrite";

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

  try {
    // 1. Check if a document for this movie already exists
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("movie_id", String(movie.id))]
    );

    // 2. If it exists, increment the count
    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { count: doc.count + 1 }
      );
    } else {
      // 3. Otherwise create a new document
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          searchTerm,
          movie_id: String(movie.id),
          poster_url: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "",
          count: 1,
        }
      );
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
        Query.limit(5),                      // top 5 is plenty for a row
      ]
    );
    return result.documents;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};