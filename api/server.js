// Load environment variables from .env file

require("dotenv").config();
const morgan = require("morgan");

const app = require("./api/index");
app.use(morgan("dev"));

const PORT = process.env.PORT || 4567;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Set timeout to 10 minutes (600,000 ms) for large file processing
server.timeout = 600000;
