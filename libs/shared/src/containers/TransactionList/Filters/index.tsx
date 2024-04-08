import { DateRangeSelect } from '../../../components/DateRangeSelect';
import React, { useState } from 'react';
import styles from './styles.module.less';
import { defineMessages, FormattedMessage } from 'react-intl';

type VisualProps={
    onDateRangeChange: (from: Date, until: Date) => void,
};

const translate = defineMessages({
    hide : {
      defaultMessage:"Hide filters",
      description:"shared.transactionList.filters.hide: Label for the filter show / hide system"},
    show : {
      defaultMessage:"Show filters",
      description:"shared.transactionList.filters.show: Label for the filter show / hide system"}});

export const Filters = (props:VisualProps) => {

    const [filtersVisibility, setFiltersVisibility] = useState(true);
    const classForFilters = filtersVisibility ? styles.noDisplay : "";
    const labelForFilters = filtersVisibility ? translate.show : translate.hide;
    return (
      <>
        <a id={styles.filterButton} onClick={()=>setFiltersVisibility(!filtersVisibility)}><FormattedMessage {...labelForFilters} /></a>
        <div className={`${classForFilters} ${styles.filtersContent}`}>
            <DateRangeSelect onDateRangeChange={props.onDateRangeChange} />
        </div>
      </>
    );
}
