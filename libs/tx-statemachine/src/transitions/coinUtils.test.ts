import { convertBN } from './coinUtils';

it ('can convert BigInt', () => {
  const val = {
    type: "BigInt",
    hex: "0x1",
  }
  const converted = JSON.stringify({
    wasBI: 137n
  }, convertBN)
  const back = JSON.parse(converted)

  expect(back.wasBI).toBe(137)
})
