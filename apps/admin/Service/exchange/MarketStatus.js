const request = require('request');

const ENDPOINT = 'https://sandbox.tradier.com/v1/markets/calendar';
const AccessToken = 'iIAGXtPBcpae7eBS4wXgP8RRUlGT';

// Cache accesses to reduce hits on the API
let CalendarCache = {};

async function GetCalendar(date) {
  const uriArgs = `month=${date.getMonth() + 1}&year=${date.getFullYear()}`;
  const exists = CalendarCache[uriArgs];
  if (exists)
    return exists;

  options = {
    headers: {
      Authorization: AccessToken,
      Accept: 'application/json'
    },
    uri: `${ENDPOINT}?${uriArgs}`,
    method: 'GET'
  };
  return new Promise(function(resolve, reject) {
    request.get(options, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        console.log("Loaded Calendar for: %i-%i, (%i cached)", date.getMonth()+1, date.getFullYear(), Object.keys(CalendarCache).length)
        const {calendar }= JSON.parse(body);
        CalendarCache[uriArgs] = calendar;
        resolve(calendar);
      }
    })
  });
}

//////////////////////////////////////////////////////////////////////////
//  Returns timestamp of next time market will be open

const getAsTS = (data, startEnd) => new Date(`${data.date} ${data.open[startEnd]}`).getTime();
  
function addDay(date) {
  var nd = new Date(date.valueOf());
  nd.setDate(date.getDate() + 1);
  return nd;
}

// Returns either 0 for currently open, or timestamp of when it will be open
// TODO: Support timezones
async function NextOpenTimestamp(date) {

  // Only search 100 days.  If the market hasn't opened in
  // 100 days, then it's most likely due to the zombie apocalypse
  // and we are going to need to adjust our sales pitch to the
  // new market...
  const ts = date.getTime();
  for (let dt = date, i = 0; i < 100; dt = addDay(dt), i++) {
    const calendar = await GetCalendar(dt);
    const { day } = calendar.days;
    let data = day[dt.getDate() - 1];
    if (data.open)
    {
      const ots = getAsTS(data, 'start')
      if (ots > ts)
        return ots;
      else {
        // This condition should only be true
        // on the first iteration, when start is
        // earlier than TS
        const cts = getAsTS(data, 'end')
        // We are before close
        if (ts < cts)
          return ts;  
      }
    }
  }
}

exports.GetCalendar = GetCalendar;
exports.NextOpenTimestamp = NextOpenTimestamp;