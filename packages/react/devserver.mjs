import express from 'express';
import cors from 'cors'
import { join } from 'path';

const app = express();
const port = 3003;
app.use(cors());

app.use(express.static(join(process.cwd(), 'widgets')));

app.use((_, res) => {
  res.status(404).send('404: Page not found');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
