import { DateRangeSelect } from '../../../components/DateRangeSelect';
import React, { useState } from 'react';
import styles from './styles.module.less';
import { defineMessages, FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';

type DateTimeState = [DateTime, (v: DateTime) => void];

type VisualProps={
    fromDate: DateTimeState,
    toDate: DateTimeState,
  };

const translate = defineMessages({
    hide : {
      defaultMessage:"Hide filters",
      description:"shared.transactionList.filters.hide: Label for the filter show / hide system"},
    show : {
      defaultMessage:"Show filters",
      description:"shared.transactionList.filters.show: Label for the filter show / hide system"}});

export const Filters = ( {fromDate, toDate}: VisualProps) => {

  function onDateRangeChange(from: Date, until: Date) {
    // Show all txs for a given day
    const roundedFrom = DateTime.fromJSDate(from).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    const roundedTo = DateTime.fromJSDate(until).set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
    fromDate[1](roundedFrom);
    toDate[1](roundedTo);
  }


    const [filtersVisibility, setFiltersVisibility] = useState(true);
    const classForFilters = filtersVisibility ? styles.noDisplay : "";
    const labelForFilters = filtersVisibility ? translate.show : translate.hide;
    return (
      <>
        <a id={styles.filterButton} onClick={()=>setFiltersVisibility(!filtersVisibility)}><FormattedMessage {...labelForFilters} /></a>
        <div className={`${classForFilters} ${styles.filtersContent}`}>
            <DateRangeSelect

              onDateRangeChange={onDateRangeChange}
              fromDate={fromDate[0]}
              toDate={toDate[0]}
            />
        </div>
      </>
    );
}
