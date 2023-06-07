const path = require('path');
const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static('public'));

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const results = [];
  
    if (file) {
      const tempPath = req.file.path;
      const targetPath = path.join('uploads', 'data.csv');
  
      fs.rename(tempPath, targetPath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error processing file');
        } else {
          res.status(200).send('File uploaded and processed');
        }
      });
    } else {
      res.status(400).send('No file uploaded');
    }
  });
    
app.get('/data', (req, res) => {
    const csvFilePath = path.join('uploads', 'data.csv');
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