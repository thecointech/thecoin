import snp from './m_snp.json'
import cpi from './m_cpi.json'

const [startYear, startMonth] = snp.start.split("-").map(Number);

const baseDates = snp.values.map((_, i) => {
  const year = startYear + Math.floor((startMonth - 1 + i) / 12);
  const month = ((startMonth - 1 + i) % 12) + 1;
  return `${year}-${month.toString().padStart(2, "0")}-01`;
});

export function getData(start: Date) {
  const startString = start.toISOString().split("T")[0];
  const startIndex = baseDates.findIndex((date) => date >= startString);
  if (startIndex < 0) {
    throw new Error(`Start date ${startString} not found in data`);
  }
  const dates = baseDates.slice(startIndex);
  const snpValues = snp.values.slice(startIndex);
  const cpiValues = cpi.values.slice(startIndex);

  const data = [
    {
      id: "Asset Value",
      data: snpValues.map((value, i) => ({
        x: dates[i],
        y: (value / snpValues[0]) * 100,
      })),
    },
    {
      id: "Money Value",
      data: cpiValues.map((value, i) => ({
        x: dates[i],
        y: (value / cpiValues[0]) * 100,
      })),
    },
  ];

  return data;
}
