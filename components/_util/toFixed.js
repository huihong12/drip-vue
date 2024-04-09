import Decimal from 'decimal.js';

Number.prototype.toFixed = function(num) {
  const x = new Decimal(this)
  return x.toFixed(num)
}