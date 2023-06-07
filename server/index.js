const path = require('path');
const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
    
app.get('/api/data', (req, res) => {
    const csvFilePath = path.join(__dirname, 'data.csv');
    const results = [];

    if (fs.existsSync(csvFilePath)) {
    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
        res.status(200).json(results);
        });
    } else {
    res.status(404).send('No CSV file found');
    }
});
    
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});