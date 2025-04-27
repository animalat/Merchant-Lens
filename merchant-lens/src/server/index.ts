import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
