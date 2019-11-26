import csv
from sortedcontainers import SortedDict

def gain(start, end):
    return (end - start) / start

def as_per(v):
    return int(v * 1000) / 10

def get_range(data, start, end):
    return (max(start, 0), min(end, len(data)))

def get_min(data, start, end):
    lstart, lend = get_range(data, start, end)
    val, idx = min((val, idx) for (idx, val) in enumerate(data[lstart:lend]))
    return (val, idx + lstart)

def get_max(data, start, end):
    lstart, lend = get_range(data, start, end)
    if lstart == lend:
        return (data[start], start)
    val, idx = max((val, idx) for (idx, val) in enumerate(data[lstart:lend]))
    return (val, idx + lstart)

def range_contains(range, start, end):
    return start <= range.stop and end >= range.start

with open ("SPX.csv", "r") as csvfile:
    reader = csv.DictReader(csvfile)
    high = []
    low = []
    date= []
    #Date,Open,High,Low,Close,Adj Close,Volume
    for row in reader:
        #key = row.pop('Date')
        #result.append(row)
        date.append(row['Date'])
        high.append(float(row['High']))
        low.append(float(row['Low']))


    # Offset is the number of days to run over
    max_gains = SortedDict()
    result_count = 10

    ath = []
    # Period 41 = 26 Dec -> 22 Feb
    period = 41
    for i in range(len(date) - period):
        if (i % 500 == 0): 
            print("Processing: " + date[i])

        # maximum gain in this period
        period_start = i
        period_end = i + period

        init_val = low[i]
        prev_high = get_max(high, i - 450, i)[0]
        drop = gain(prev_high, init_val)

        period_high, offset = get_max(high, i, i + period)
        period_gain = gain(init_val, period_high)

        one_week_low = get_min(low, period_end, period_end + 5)[0]
        one_week_high = get_max(high, period_end, period_end + 5)[0]

        one_month_low = get_min(low, period_end, period_end + 25)[0]
        one_month_high = get_max(high, period_end, period_end + 25)[0]

        max_gains[period_gain] = (i, offset, drop, one_week_low, one_week_high, one_month_low, one_month_high)


    already_printed = []
    for key in reversed(max_gains):
        idx, offset, drop, one_week_low, one_week_high, one_month_low, one_month_high = max_gains[key]
        if any(range_contains(prev_range, idx, offset) for prev_range in already_printed):
            continue

        already_printed.append(range(idx, offset))
        
        period_date = date[idx]
        year = '-'.join(period_date.split('-')[0])
        
        change = as_per(key)
        from_high = as_per(drop)
        retracement = as_per(change / -from_high)

        if retracement < 50 or retracement > 100:
            continue

        if offset - idx < 7:
            continue

        week_drop = as_per(gain(high[offset], one_week_low))
        week_gain = as_per(gain(high[offset], one_week_high))
        month_drop = as_per(gain(high[offset], one_month_low))
        month_gain = as_per(gain(high[offset], one_month_high))

        print("%s %s%% from %d%% down (%s%% retracement) : (%s days) -> %s 5Up, %s 5Down : %s 25Up, %s 25Down" % (period_date, change, from_high, retracement, (offset-idx), week_gain, week_drop, month_gain, month_drop))

        if len(already_printed) > 50:
            break