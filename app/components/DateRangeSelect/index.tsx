import React from 'react';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import moment, { Moment } from 'moment'

type PropsType = {}

const defaultState = {
  startDate: moment().subtract(21, "days"),
  endDate: moment(),
  focusedInput: null as any
}

type StateType = typeof defaultState;

class DateRangeSelect extends React.PureComponent<PropsType, {}, StateType> {

  state = defaultState;

  constructor(props: PropsType) {
    super(props)

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onDatesChange(arg: { startDate: Moment|null, endDate: Moment|null}) {
    this.setState(arg);
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput: focusedInput })
  }

  render() {
    return (
      <React.Fragment>
        <DateRangePicker
          startDate={this.state.startDate} // momentPropTypes.momentObj or null,
          startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
          endDate={this.state.endDate} // momentPropTypes.momentObj or null,
          endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
          onDatesChange={this.onDatesChange} // PropTypes.func.isRequired,
          focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
          onFocusChange={this.onFocusChange} // PropTypes.func.isRequired,
      />
    </React.Fragment>
    )
  }
};

export { DateRangeSelect };
