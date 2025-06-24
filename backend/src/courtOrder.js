let order = '1,2,3,4,5,6';

export function getOrder() {
  return order;
}

export function setOrder(newOrder) {
  if (checkValidOrder(newOrder)) {
    order = newOrder;
  } else {
    throw new Error('Invalid order format. Expected format: "1,2,3,4,5,6"');
  }
}

function checkValidOrder(order) {
  return /^[1-6]{1}(,[1-6]){5}$/.test(order);
}
