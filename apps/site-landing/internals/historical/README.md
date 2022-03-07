# Data Sources

This folder holds the primary data fetch for TheCoins returns calculator.

The inspiration for this calculator comes from DQYDJ: https://dqydj.com/sp-500-return-calculator/

Similar to this calculator, our historical data for the S&P uses Robert Shillers published averages.  The same caveats that apply to this calculator also apply to ours.

For CAD/USD exchanges, we mash-up data from 3 sources.

Prior to 1950, we use a fixed exchange of 1.10 CAD/USD: sourced from here https://en.wikipedia.org/wiki/History_of_the_Canadian_dollar#Fixed_and_floating_exchange_rates

For 1950 -> 2017, we use the archived content from BoC, found https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1010000901.  This data is committed to the repo as a static resource in this folder: ./CADUSD_historical.csv

NOTE: At 2017, something (we don't know what) caused BoC to change the way it provides exchange rates.  No attempt has been made to reconcile the differences.

From 2017 onwards, we directly pull data from https://www.bankofcanada.ca/valet/observations/group/FX_RATES_MONTHLY/csv?start_date=2017-01-01

These 3 data sources are merged into one FX file that is committed and published to our calculators data folder.
