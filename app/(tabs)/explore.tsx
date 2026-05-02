import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import { POSTERS } from "@/scripts/posterList";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type Movie = {
  Title: string;
  Director: string;
  imdbRating: string;
};

function getPosterKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

type MergeState = {
  left: Movie[];
  right: Movie[];
  merged: Movie[];
  done: Movie[][];
};

function initialMergeState(movies: Movie[]): MergeState {
  return {
    left: [],
    right: [],
    merged: [],
    done: movies.map((m) => [m]),
  };
}

function advance(state: MergeState, winner: Movie): MergeState {
  let { left, right, merged, done } = state;
  merged = [...merged, winner];
  left = left[0]?.Title === winner.Title ? left.slice(1) : left;
  right = right[0]?.Title === winner.Title ? right.slice(1) : right;
  if (left.length === 0 || right.length === 0) {
    merged = [...merged, ...left, ...right];
    left = [];
    right = [];
    done = [...done, merged];
    merged = [];

    while (done.length >= 2) {
      const newLeft = done[0];
      const newRight = done[1];
      done = done.slice(2);
      if (newLeft.length === 0) {
        done = [...done, newRight];
      } else if (newRight.length === 0) {
        done = [...done, newLeft];
      } else {
        left = newLeft;
        right = newRight;
        break;
      }
    }
  }
  return { left, right, merged, done };
}

function isSortingDone(state: MergeState): boolean {
  return (
    state.left.length === 0 &&
    state.right.length === 0 &&
    state.done.length === 1
  );
}

function getFinalList(state: MergeState): Movie[] {
  return state.done[0] ?? [];
}

function getCurrentPair(state: MergeState): [Movie, Movie] {
  return [state.left[0], state.right[0]];
}

function startMerge(state: MergeState): MergeState {
  let { done } = state;
  let left: Movie[] = [];
  let right: Movie[] = [];

  while (done.length >= 2) {
    left = done[0];
    right = done[1];
    done = done.slice(2);
    if (left.length > 0 && right.length > 0) {
      break;
    }
    if (left.length === 0) {
      done = [...done, right];
    } else {
      done = [...done, left];
    }
    left = [];
    right = [];
  }
  return { ...state, left, right, done };
}

export default function TabTwoScreen() {
  const { movies } = useLocalSearchParams();
  const router = useRouter();

  let movie_list: Movie[] = [];
  try {
    movie_list = movies ? JSON.parse(movies as string) : [];
  } catch (e) {
    console.error("Failed to parse movies param:", e);
  }
  const [mergeState, setMergeState] = useState<MergeState>(() => {
    if (movie_list.length === 0) return initialMergeState([]);
    if (movie_list.length === 1) {
      return {
        left: [],
        right: [],
        merged: [],
        done: [movie_list],
      };
    }
    const initial = initialMergeState(movie_list);
    return startMerge(initial);
  });
  const [totalComparisons, setTotalComparisons] = useState<number>(0);
  const isDone = isSortingDone(mergeState);

  function pick(winner: Movie): void {
    const next = advance(mergeState, winner);
    setMergeState(next);
    setTotalComparisons((n) => n + 1);
  }

  if (movie_list.length === 0) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="trophy.fill"
            style={styles.headerImage}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
            Rank
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={styles.emptyText}>
            No list submitted yet.
          </ThemedText>
          <ThemedText style={styles.emptySubText}>
            Head back to the List tab, fill up your 10 movies, and hit Rank
            List.
          </ThemedText>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => router.push("/")}
          >
            <ThemedText>Go to List 🎬</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>
    );
  }
  if (isDone) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="trophy.fill"
            style={styles.headerImage}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
            Results
          </ThemedText>
        </ThemedView>
        <ThemedText type="subtitle" style={styles.doneText}>
          Ranking Complete in {totalComparisons} comparisons!
        </ThemedText>
      </ParallaxScrollView>
    );
  }

  const [movieA, movieB] = getCurrentPair(mergeState);
  if (!movieA || !movieB)
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="trophy.fill"
            style={styles.headerImage}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
            Rank
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.progress}>Loading...</ThemedText>
      </ParallaxScrollView>
    );

  const posterA = POSTERS[getPosterKey(movieA.Title)];
  const posterB = POSTERS[getPosterKey(movieB.Title)];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="trophy.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Rank
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.progress}>
        Comparison {totalComparisons + 1}
      </ThemedText>
      <ThemedView style={styles.matchupContainer}>
        <TouchableOpacity style={styles.movieCard} onPress={() => pick(movieA)}>
          {posterA ? (
            <Image
              source={posterA}
              style={styles.cardPoster}
              contentFit="cover"
            />
          ) : (
            <ThemedView style={styles.placeholderPoster}>
              <ThemedText style={styles.placeholderText}>
                {movieA.Title}
              </ThemedText>
            </ThemedView>
          )}
          <ThemedText style={styles.cardTitle}>{movieA.Title}</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.vs}>VS</ThemedText>

        <TouchableOpacity style={styles.movieCard} onPress={() => pick(movieB)}>
          {posterB ? (
            <Image
              source={posterB}
              style={styles.cardPoster}
              contentFit="cover"
            />
          ) : (
            <ThemedView style={styles.placeholderPoster}>
              <ThemedText style={styles.placeholderText}>
                {movieB.Title}
              </ThemedText>
            </ThemedView>
          )}
          <ThemedText style={styles.cardTitle}>{movieB.Title}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 16,
    marginTop: 32,
  },
  emptyText: {
    textAlign: "center",
  },
  emptySubText: {
    textAlign: "center",
    opacity: 0.7,
  },
  goBackButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 140,
    backgroundColor: "#1D3D47",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  progress: {
    textAlign: "center",
    opacity: 0.6,
    marginBottom: 4,
  },
  prompt: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 16,
  },
  matchupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  movieCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1D3D47",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  cardPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  cardTitle: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
  vs: {
    fontSize: 20,
    fontWeight: "bold",
    opacity: 0.6,
  },
  doneText: {
    textAlign: "center",
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    width: 36,
  },
  poster: {
    width: 40,
    height: 60,
    borderRadius: 4,
  },
  resultText: {
    flex: 1,
    fontSize: 15,
  },
  placeholderPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#2a5263",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.8,
  },
});
