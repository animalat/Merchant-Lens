import express from 'express';
import cors from "cors";
import handleMetricsOverview from './routes/metrics/overview';
import revenueOverTime from './routes/metrics/revenueOverTime';
import monthOverview from './routes/metrics/monthOverview';
import topProducts from './routes/metrics/topProducts';
import customerMetrics from './routes/metrics/customerMetrics';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.get("/api/metrics", handleMetricsOverview);
app.get("/api/metrics/revenue-over-time", revenueOverTime);
app.get("/api/metrics/month-overview", monthOverview);
app.get("/api/metrics/top-products", topProducts);
app.get("/api/metrics/customer-metrics", customerMetrics);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
