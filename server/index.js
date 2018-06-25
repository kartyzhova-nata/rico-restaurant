const path = require('path'); // нодовский пакет для работы с путями
const fs = require('fs'); // нодовский пакет для работы с файловой системой
const url = require('url'); // нодовский пакет для работы с url запроса

const bodyParser = require('body-parser'); // доставили в package.json для работы с телом POST запросов

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const publicFolder = path.join(__dirname, `../${config.bundleDir}`);


const express = require('express'); // фреймворк для node.js
const app = express(); // создаем сервер


/* Middleware(s) */
app.use(express.static(publicFolder)); // указываем, где искать статические файлы
app.use(bodyParser.json()); // парсит тело POST запроса (у GET нет тела =))

/* Routing */
app.get('/:page', function (req, res) {
  const file = path.join(publicFolder, 'html', `${req.params.page}.html`);
  if (!fs.existsSync(file)) {
    res.sendFile(path.join(publicFolder, 'html/404.html'))
    return;
  }
  res.sendFile(file);
});


/* API */
app.get('/api/products', function (req, res) {
  const queryParams = url.parse(req.url, true).query;
  const pathToProducts = path.join(__dirname, 'data/products.json');
  let productsList = JSON.parse(fs.readFileSync(pathToProducts, {encoding: 'utf-8'}));

  if (('ids' in queryParams) && queryParams.ids !== '') {
    let productIDs = queryParams.ids.split(',');

    productsList = productsList.filter((el) => {
      for (const item of productIDs) {
        if (+item === el.id) {
          return true;
        }
      }
      return false;
    })
  }

  res.send(productsList);
});

app.post('/api/order', function (req, res) {
  res.send({error: false, message: 'Ваш заказ оформлен!'});
});


/* Start listen server port */
const listener = app.listen(config.port, () => {
  console.log(`App listening on port ${listener.address().port}`);
});