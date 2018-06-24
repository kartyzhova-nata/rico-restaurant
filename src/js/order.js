import $ from "./libs/jquery";

const baseUrl = 'http://localhost:8000';

export default function manageOrder() {
  if (!$('#orders')) {
    return;
  }

  const countInputs = $('.count-input');
  countInputs.on('change', (e) => onChangeCountHandler(e.target));
  countInputs.each((index, target) => {
    onChangeCountHandler(target);
  });

  const deleteProductButtons = $('.delete-btn');
  deleteProductButtons.on('click', (e) => onDeleteProductHandler(e.target));

  const submitOrderBtn = $('#submit-order');
  submitOrderBtn.on('click', submitOrderHandler);
}

function onChangeCountHandler(eventTarget) {
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

function onDeleteProductHandler(eventTarget) {
  const target = $(eventTarget);
  const product = target.closest('.order');
  const confirmResult = confirm('Вы действительно хотите удалить товар из списка?');

  if (confirmResult) {
    product.remove();
    updateSummary();
  }
}

async function submitOrderHandler() {
  const form = $('#order-form');

  const inputName = form.find('[name="name"]');
  const inputPhone = form.find('[name="phone"]');
  const inputChange = form.find('[name="change"]');
  const inputAddress = form.find('[name="address"]');

  const order = getOrder();

  //  TODO: validation + check if empty form

  const customer = {
    name: inputName.val(),
    phone: inputPhone.val(),
    change: inputChange.val(),
    address: inputAddress.val(),
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
    clearForm();
    alert(response.message);
  }
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
  const headers = new Headers({
    "Content-Type": "application/json"
  });

  const url = baseUrl + '/order';
  const params = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  };
  return fetch(url, params).then(r => r.json());
}

function clearForm() {
  const orders = $('#orders');
  orders.find('.order').remove();
  updateSummary();

  const orderForm = $('#order-form');
  orderForm.find('input').val('');

}