const express = require('express');
const path = require('path');
const app = express();

app.use("/assets", express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/asset', (req, res) => {
  res.send('/assets/tower.mp4');
});
 
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
