//useCallback returns same fn instance between renderings/memoization
import React, { useState, useEffect, useCallback } from "react";

import MoviesList from "./components/MoviesList";
import AddMovie from "./components/AddMovie";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  //useCallback is called everytime App rerenders
  //useCallback has [], hence useCallback returns the same fn object fetchMoviesHandler on each rerender
  //instead of normal react behaviour returns new fn instances on each render
  const fetchMoviesHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      //fetch does not throw error when thr is error status code (try catch will not work)
      //axios throws error that can be caught
      const response = await fetch(
        "https://udemy-react-http-12baf-default-rtdb.asia-southeast1.firebasedatabase.app/movies.json"
      );
      //console.log("response", response);  //-> can use response.ok or response.status

      if (!response.ok) {
        throw new Error("Something went wrong");
      }
 
      //.json() parses JSON resp to js object
      const data = await response.json();
      //console.log("Data", data)  --> data returns id(autogen in firebase) as key and movie info as values

      const transformedMovies = []

      for (const key in data){
        transformedMovies.push({
          id: key,
          title: data[key].title,
          releaseDate: data[key].releaseDate,
          openingText: data[key].openingText
        })
      }

      // const transformedMovies = data.results.map((movieData) => {
      //   return {
      //     id: movieData.episode_id,
      //     title: movieData.title,
      //     releaseDate: movieData.release_date,
      //     openingText: movieData.opening_crawl,
      //   };
      // });
      setMovies(transformedMovies);
    } catch (error) {
      setError(error.message);
    }

    setIsLoading(false);
  }, []);

  //since same fn obj fetchMoviesHandler is returned each time, useEffect will not create infinite loop
  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  async function addMovieHandler(movie) {
    setError(null);

    try {
      const response = await fetch(
        "https://udemy-react-http-12baf-default-rtdb.asia-southeast1.firebasedatabase.app/movies.json",
        {
          method: "POST",
          body: JSON.stringify(movie), //stringify converts js object/array into json string
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      setError(error.message);
    }
  }

  let content = <p>Found no movies.</p>;

  if (movies.length !== 0) {
    content = <MoviesList movies={movies} />;
  }

  if (error) {
    content = <p>{error}</p>;
  }

  if (isLoading) {
    content = <p>Loading...</p>;
  }

  return (
    <React.Fragment>
      <section>
        <AddMovie onAddMovie={addMovieHandler} />
      </section>
      <section>
        <button onClick={fetchMoviesHandler}>Fetch Movies</button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
