import axios from "axios";
import Movie from "./../models/Movie.js";
import Show from "./../models/Show.js";
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      " https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );

    const movies = data.results;

    return res.json({ success: true, movies: movies });
  } catch (e) {
    console.log("error:", e);
    return res.json({ success: false, movies: e.message });
  }
};

export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;
    let movie = await Movie.findById(movieId);

    if (!movie) {
      //Fetch Movie
      const [movieDetailResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),

        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);
      const movieApiData = movieDetailResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.casts,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      //
      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
        const showDate = show.date;
        show.time.forEach((time) =>
        {
            console.log(time)
            const dateTimeString = `${showDate}T${time}`;
            showsToCreate.push({
                movie:movieId,
                showDateTime: new Date(dateTimeString),
                showPrice,
                occupiedSeats: {}
            })
        })
      
    });
       if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }
        return res.json({ success: true, message: "Show Added Successfully" });
      
      
  } catch (e) {
    console.error(e);
    res.json({ success: false, message: e.message });
  }
};
