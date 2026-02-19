import React from 'react';
import dayjs from 'dayjs';
import { DatePicker, Space } from 'antd';
const { RangePicker } = DatePicker;
const onChange = (date) => {
  if (date) {
    console.log('Date: ', date);
  } else {
    console.log('Clear');
  }
};
const onRangeChange = (dates, dateStrings) => {
  if (dates) {
    console.log('From: ', dates[0], ', to: ', dates[1]);
    console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
  } else {
    console.log('Clear');
  }
};
const rangePresets = [
  {
    label: 'Last 7 Days',
    value: [dayjs().add(-7, 'd'), dayjs()],
  },
  {
    label: 'Last 14 Days',
    value: [dayjs().add(-14, 'd'), dayjs()],
  },
  {
    label: 'Last 30 Days',
    value: [dayjs().add(-30, 'd'), dayjs()],
  },
  {
    label: 'Last 90 Days',
    value: [dayjs().add(-90, 'd'), dayjs()],
  },
];
const DatePicking = () => (
  <Space direction="vertical" size={12}>
    {/* <DatePicker
      presets={[
        {
          label: 'Yesterday',
          value: dayjs().add(-1, 'd'),
        },
        {
          label: 'Last Week',
          value: dayjs().add(-7, 'd'),
        },
        {
          label: 'Last Month',
          value: dayjs().add(-1, 'month'),
        },
      ]}
      onChange={onChange}
    /> */}
    {/* <RangePicker presets={rangePresets} onChange={onRangeChange} /> */}
    <RangePicker
      presets={[
        {
          // label: <span aria-label="Current Time to End of Day">Now ~ EOD</span>,
          // value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
          label: <span aria-label="Current Time to End of Day">Today</span>,
          value: () => [dayjs().startOf('day'), dayjs()],
        },
        ...rangePresets,
      ]}
      // showTime
      // format="YYYY/MM/DD HH:mm:ss"
      format="YYYY/MM/DD"
      onChange={onRangeChange}
    />
  </Space>
);
export default DatePicking;