import React from 'react';

const passthrough = ({ children, ...props }) => React.createElement('div', props, children);

export const ResponsiveContainer = passthrough;
export const BarChart = passthrough;
export const AreaChart = passthrough;
export const PieChart = passthrough;
export const CartesianGrid = () => null;
export const Tooltip = () => null;
export const Legend = () => null;
export const XAxis = () => null;
export const YAxis = () => null;
export const Bar = () => null;
export const Area = () => null;
export const Pie = () => null;
export const Cell = () => null;
