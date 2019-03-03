import React from 'react';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import moment, { Moment } from 'moment'

type OnChangeCallback = (startTime: Date, endTime: Date) => void;

type PropsType = {
  onDateRangeChange: OnChangeCallback
}

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
    this.isInvalidDate = this.isInvalidDate.bind(this);
  }

  componentDidMount()
  {
    //  Trigger update on mount
    this.onDatesChange(this.state);
  }

  onDatesChange(arg: { startDate: Moment | null, endDate: Moment | null }) {
    // Update local state.
    this.setState(arg);
    // Clean up and trigger CB
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    const { startDate, endDate } = arg;
    const end = (endDate == null || endDate.toDate() == todaysDate) ?
      new Date() :
      endDate.toDate();
    const start = (startDate != null) ?
      startDate.toDate() :
      moment(end).subtract(21, "days").toDate()

    this.props.onDateRangeChange(start, end);
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput: focusedInput })
  }

  isInvalidDate(date: Moment): boolean {
    const now = moment();
    return date.isAfter(now);
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
          isOutsideRange={this.isInvalidDate}
          //keepOpenOnDateSelect={true}
          appendToBody={true}

        />
      </React.Fragment>
    )
  }
};

export { DateRangeSelect, OnChangeCallback };
