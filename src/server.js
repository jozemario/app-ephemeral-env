const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Database connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  maxUses: 7500, // Close a connection after it has been used this many times
});

// Handle pool errors
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Health check endpoint with database connectivity check
app.get("/health", async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: err.message,
    });
  }
});

// API endpoints with improved error handling
app.get("/api/tasks", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  } finally {
    client.release();
  }
});

app.post("/api/tasks", async (req, res) => {
  const { title, description } = req.body;
  const client = await pool.connect();
  try {
    const result = await client.query(
      "INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *",
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  } finally {
    client.release();
  }
});

// Serve the frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
