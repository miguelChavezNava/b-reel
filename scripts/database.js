export async function getMovie(title) {
  const key = process.env.EXPO_PUBLIC_API_KEY;
  const encoded_title = encodeURIComponent(title);
  const result = await fetch(
    `http://www.omdbapi.com/?t=${encoded_title}&apikey=${key}`,
  );
  const movie_data = await result.json();

  if (movie_data.Response === "False") {
    throw new Error(movie_data.Error);
  }

  return movie_data;
}
