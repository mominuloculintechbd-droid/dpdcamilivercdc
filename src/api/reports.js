const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/db');

const router = express.Router();

const reportsDir = path.join(__dirname, '../../reports');

router.get('/:reportName', async (req, res) => {
  const { reportName } = req.params;
  const reportPath = path.join(reportsDir, `${reportName}.sql`);

  try {
    const sql = await fs.readFile(reportPath, 'utf8');
    const data = await db.execute(sql);
    res.json(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).send('Report not found');
    } else {
      console.error(error);
      res.status(500).send('Error executing report');
    }
  }
});

module.exports = router;