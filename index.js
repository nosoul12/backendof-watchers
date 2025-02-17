const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const movieRoutes = require("./routes/movieRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const prisma = require("./prismaClient");

dotenv.config();

const app = express();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Middleware to parse JSON requests
app.use(express.json());

// TMDb Routes
app.get("/tmdb/trending", async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error("TMDb API Error:", error.response?.status, error.response?.data);
    res.status(500).json({ error: "Failed to fetch trending movies" });
  }
});

// Search Movies Route
app.get("/tmdb/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query },
    });
    res.json(response.data.results);
  } catch (error) {
    console.error("TMDb Search Error:", error.response?.status, error.response?.data);
    res.status(500).json({ error: "Failed to search movies" });
  }
});

// Movie Details Route
app.get("/tmdb/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error("TMDb Movie Details Error:", error.response?.status, error.response?.data);
    res.status(500).json({ error: "Failed to fetch movie details" });
  }
});

// Use movie routes
app.use("/movies", movieRoutes);

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
