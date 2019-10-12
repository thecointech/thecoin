import { calcProfit } from "./profit";


test('We can calculate a profit correctly', () => {

  const buyPrice = 100;
  const quantity = 100;
  const sellPrice = 150;

  const profit = calcProfit(quantity, buyPrice, sellPrice);
  expect(profit).toBe(5000);

});