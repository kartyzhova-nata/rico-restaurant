const path = require('path');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const publicFolder = path.join(__dirname, `../${config.bundleDir}`);


const express = require('express');
const app = express();


/* Serve static files */
app.use(express.static(publicFolder));


/* Routing */
app.get('/:page', function (req, res) {
  res.sendFile(path.join(publicFolder, 'html', `${req.params.page}.html`));
});


/* Start listen server port */
const listener = app.listen(config.port, () => {
  console.log(`App listening on port ${listener.address().port}`);
});