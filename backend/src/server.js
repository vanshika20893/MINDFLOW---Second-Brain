require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🧠 Brain Dump Backend Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
