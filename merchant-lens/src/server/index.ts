import express from 'express';
import cors from "cors";
import handleMetricsOverview from './routes/metrics/overview';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.get("/api/metrics", handleMetricsOverview);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
