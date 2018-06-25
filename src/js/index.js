import '../css/index.scss';
import $ from "./libs/jquery";
import manageOrder from './order';

const baseAPIUrl = 'http://localhost:8000/api';

$(document).ready(() => {

  /* Cart */
  manageOrder();
  loadProducts();

});

async function loadProducts() {
  if (!$("#products").length) {
    return;
  }

  const url = baseAPIUrl + '/products';
  const data = await $.get(url);

  data.forEach(addProduct);
}

function addProduct(el) {
  const productTemplate = `
    <div class="product">
      <span class="product-name">
        ${el.name}
      </span>
      <img src="${el.image}" alt="pizza">
      <span class="price">${el.price} грн</span>
      <button class="buy">Купить</button>
    </div>
  `;
  const product = $(productTemplate);
  product.find(".buy").on("click", () => buyProduct(el.id));
  $('#products').append(product);
}

function buyProduct(id) {
  let cartProducts = localStorage.getItem('cartProducts');
  cartProducts = (cartProducts) ? JSON.parse(cartProducts) : {};

  cartProducts[id] = cartProducts[id] ? cartProducts[id] + 1 : 1;
  localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
}

