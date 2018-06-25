import $ from "./libs/jquery";

const baseAPIUrl = 'http://localhost:8000/api';

export default async function manageOrder() {
  if (!$('#orders').length) {
    return;
  }

  await loadCart();

  const submitOrderBtn = $('#submit-order');
  submitOrderBtn.on('click', submitOrderHandler);
}

function onChangeCountHandler(eventTarget, id) {
  const target = $(eventTarget);
  const product = target.closest('.order');

  let count = target.val();
  if (count < 1) {
    count = 1;
    target.val(count);
  }

  const roundedCount = Math.floor(count);
  if (roundedCount !== count) {
    count = roundedCount;
    target.val(count);
  }

  const productPrice = product.find('.price').html();
  const productPriceTotal = product.find('.total-price');

  productPriceTotal.html(productPrice * count);
  updateLocalStorageItem(id, count);
  updateSummary();
}

function updateSummary() {
  const totalPrices = $('.total-price');
  let sum = 0;
  totalPrices.each((index, el) => {
    sum += +$(el).html();
  });

  $('.summary-price').html(sum);
}

function onDeleteProductHandler(eventTarget, id) {
  const target = $(eventTarget);
  const product = target.closest('.order');
  const confirmResult = confirm('Вы действительно хотите удалить товар из списка?');

  if (confirmResult) {
    product.remove();
    removeLocalStorageItem(id);
    updateSummary();
  }
}

async function submitOrderHandler() {
  const order = getOrder();

  if (!order.products.length) {
    alert("Пожалуйста выберите хотя бы один продукт!");
    return;
  }

  const form = $('#order-form');

  const inputName = form.find('[name="name"]').val();
  const inputPhone = form.find('[name="phone"]').val();
  const inputEmail = form.find('[name="email"]').val();
  const inputAddress = form.find('[name="address"]').val();

  if (!isNameValid(inputName)
    || !isPhoneValid(inputPhone)
    || !isEmailValid(inputEmail)
    || !isAddressValid(inputAddress)
  ) {
    alert("Пожалуйста проверьте правильность введенных данных. ");
    return;
  }

  //  TODO: validation + check if empty form

  const customer = {
    name: inputName,
    phone: inputPhone,
    email: inputEmail,
    address: inputAddress,
  };

  const orderData = {
    customer: customer,
    order: order
  };

  console.log('order', orderData);
  const response = await sendOrder(orderData);

  if (!response || response.error) {
    console.error('ERROR!');
  }
  else {
    clearCart();
    alert(response.message);
  }
}

function isNameValid(name) {
  return (name && name.length < 100);
}
function isPhoneValid (phone) {
  const validatePhoneRegExp = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
  return validatePhoneRegExp.test(phone);
}

function isEmailValid (email) {
  const validateEmailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return validateEmailRegExp.test(email.toLowerCase());
}

function isAddressValid(address) {
  return (address && address.length < 250);
}

function getOrder() {
  const totalPrice = $('.summary-price').html();
  const orders = $('#orders').find('.order');
  const products = [];

  orders.each((index, element) => {
    const target = $(element);
    const product = {
      name: target.find('.name').html(),
      price: target.find('.price').html(),
      count: target.find('.count-input').val(),
      totalPrice: target.find('.total-price').html()
    };

    products.push(product);
  });

  return {
    totalPrice: totalPrice,
    products: products
  };
}

function sendOrder(data) {
  const url = baseAPIUrl + '/order';
  return $.post(url, data);
}

function clearCart() {
  const orders = $('#orders');
  orders.find('.order').remove();

  clearLocalStorage();
  updateSummary();

  const orderForm = $('#order-form');
  orderForm.find('input').val('');
}

async function loadCart() {
  let cartProducts = localStorage.getItem('cartProducts');
  const tbody = $('#orders').find('tbody');

  if (cartProducts) {
    cartProducts = JSON.parse(cartProducts);
    const productIds = Object.keys(cartProducts).join(',');
    const url = `${baseAPIUrl}/products?ids=${productIds}`;
    const cartProductInfoList = await $.get(url);


    cartProductInfoList.forEach((el) => {
      el.count = cartProducts[el.id];
      tbody.append(createCartItem(el));
    });
  }

  const summaryPriceRow = createSummaryPriceRow();
  tbody.append(summaryPriceRow);

  updateSummary();
}

function createCartItem(item) {
  const cartTemplate = `
    <tr class="order">
      <td class="name">${item.name}</td>
      <td class="price">${item.price}</td>
      <td class="count">
        <input class="count-input" type="number" value="${item.count}">
      </td>
      <td class="total-price">0</td>
      <td class="delete">
        <button class="delete-btn">&#128465</button>
      </td>
    </tr>
  `;

  const cartItem = $(cartTemplate);
  const countInput = cartItem.find('.count-input');
  countInput.on('change', (e) => onChangeCountHandler(e.target, item.id));
  onChangeCountHandler(countInput, item.id);

  const deleteProductButton = cartItem.find('.delete-btn');
  deleteProductButton.on('click', (e) => onDeleteProductHandler(e.target, item.id));

  return cartItem;
}

function createSummaryPriceRow() {
  const summaryPriceTemplate = `
    <tr class="summary">
      <td class="name" colspan="3">Всего</td>
      <td class="summary-price" colspan="2">0</td>
    </tr>
  `;

  return $(summaryPriceTemplate);
}

function updateLocalStorageItem(id, value) {
  const cartProducts = JSON.parse(localStorage.getItem('cartProducts') || {});
  cartProducts[id] = value;
  localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
}

function removeLocalStorageItem(id) {
  const cartProducts = JSON.parse(localStorage.getItem('cartProducts') || {});
  delete cartProducts[id];
  localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
}

function clearLocalStorage() {
  localStorage.clear();
}