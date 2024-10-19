export type DayData = {
  open: {
    start: string,
    end: string,
  }
  date: string
}
export type Calendar = {
  days: {
    day: DayData[];
  },
  month: number,
  year: number,
}
export type TradierResponse = {
  calendar: Calendar
}
