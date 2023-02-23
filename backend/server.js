import express from 'express';
import cors from 'cors';
import { execSync } from 'child_process';

const PORT = 3001;

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/scan', async (req, res) => {
  const scanType = req.body.scanType;
  const url = req.body.url;

  try {
    const stdout = execSync(`node cli -c ${scanType} -u ${url} -p 1 --resultspath`).toString();
    const resultsPath = stdout.split('Results directory is at ')[1].split(' ')[0];
    res.status(200).sendFile(`${resultsPath}/reports/report.html`, { root: './' });
  } catch (error) {
    res.status(400).json({ error: error.stdout.toString().trim() });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
