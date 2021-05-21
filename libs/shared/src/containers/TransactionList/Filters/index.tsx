import { DateRangeSelect } from '../../../components/DateRangeSelect';
import React, { useState } from 'react';
import styles from './styles.module.less';
import { FormattedMessage } from 'react-intl';

type VisualProps={
    onDateRangeChange: (from: Date, until: Date) => void,
};

const hide = { id:"shared.transactionList.filters.hide",
                defaultMessage:"Hide filters",
                description:"Label for the filter show / hide system"};
const show = { id:"app.transactionList.filters.show",
                defaultMessage:"Show filters",
                description:"Label for the filter show / hide system"};
                
export const Filters = (props:VisualProps) => {

    const [filtersVisibility, setFiltersVisibility] = useState(true);
    const classForFilters = filtersVisibility ? styles.noDisplay : "";
    const labelForFilters = filtersVisibility ? show : hide;
    return (
      <>
        <a id={styles.filterButton} onClick={()=>setFiltersVisibility(!filtersVisibility)}><FormattedMessage {...labelForFilters} /></a>
        <div className={`${classForFilters} styles.filtersContent`}>
            <DateRangeSelect onDateRangeChange={props.onDateRangeChange} />
        </div>
      </>
    );
}
