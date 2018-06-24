const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const publicFolder = path.join(__dirname, `../${config.bundleDir}`);


const express = require('express');
const app = express();


/* Middleware(s) */
app.use(express.static(publicFolder));
app.use(bodyParser.json());

/* Routing */
app.get('/:page', function (req, res) {
  res.sendFile(path.join(publicFolder, 'html', `${req.params.page}.html`));
});


/* API */
app.post('/order', function (req, res) {
  res.send({error: false, message: 'Ваш заказ оформлен!'});
});


/* Start listen server port */
const listener = app.listen(config.port, () => {
  console.log(`App listening on port ${listener.address().port}`);
});