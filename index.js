require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(require("cors")());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// TMDB API Endpoint
app.get("/trending", async (req, res) => {
  try {
    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.TMDB_API_KEY}`
    );
    const data = await tmdbResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching trending movies" });
  }
});

// Watchlist API (Store in Database)
app.post("/watchlist", async (req, res) => {
  const { movie_id, title, poster_path } = req.body;
  try {
    await pool.query("INSERT INTO watchlist (movie_id, title, poster_path) VALUES ($1, $2, $3)", [
      movie_id,
      title,
      poster_path,
    ]);
    res.json({ message: "Movie added to watchlist" });
  } catch (error) {
    res.status(500).json({ error: "Error adding to watchlist" });
  }
});

// Get Watchlist from Database
app.get("/watchlist", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM watchlist");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error fetching watchlist" });
  }
});
console.log("Starting server...");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
