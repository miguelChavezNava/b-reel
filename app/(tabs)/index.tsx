import { Image } from "expo-image";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { getMovie } from "@/scripts/database";
import { MOVIES } from "@/scripts/movieList";
import { useState } from "react";

export default function HomeScreen() {
  const [title, setTitle] = useState("");
  const [movie_list, setMovieList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!title || movie_list.length >= 10) return;
    try {
      const result = await getMovie(title);
      setMovieList((prev) => [...prev, result]);
    } catch (e: any) {
      setError("Movie not found! Try again!");
    }
    setTitle("");
  }

  async function randomize() {
    setLoading(true);
    setError(null);
    try {
      const shuffled = [...MOVIES].sort(() => Math.random() - 0.5);
      const picks = shuffled.slice(0, 10);
      const results = await Promise.all(
        picks.map((title) => getMovie(title).catch(() => null)),
      );
      setMovieList(results.filter(Boolean));
    } catch (e: any) {
      setError("Something went wrong. Try again!");
    }
    setLoading(false);
  }

  function removeMovie(index: number) {
    setMovieList((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={(title) => {
            setTitle(title);
            setError(null);
          }}
          onSubmitEditing={search}
          returnKeyType="search"
          autoFocus
        />
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={search}>
          <ThemedText>Search &nbsp;&nbsp;&nbsp; 🔍</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={randomize}
          disabled={loading}
        >
          <ThemedText>{loading ? "Loading..." : "Random 🎲"}</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {error && (
        <ThemedText
          type="subtitle"
          style={{ textAlign: "center", color: "#ba0000" }}
        >
          {error}
        </ThemedText>
      )}

      {movie_list.map((movie, index) => (
        <ThemedView key={index} style={styles.movieRow}>
          <ThemedText type="subtitle" style={styles.movieText}>
            {movie.Title} by {movie.Director}, {movie.imdbRating}
          </ThemedText>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeMovie(index)}
          >
            <ThemedText style={styles.removeButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  searchContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 120,
    borderColor: "white",
    backgroundColor: "#1D3D47",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  movieRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  movieText: {
    flex: 1,
    textAlign: "center",
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ba0000",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 14,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
