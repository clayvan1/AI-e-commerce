import { MdSettings, MdOutlineMessage, MdHelpOutline } from 'react-icons/md';
import {
  FiShoppingCart,
  FiPieChart,
  FiBarChart2,
  FiActivity,
} from 'react-icons/fi';

export const earningData = [
  {
    icon: <FiShoppingCart />,
    amount: '$45,000',
    percentage: '+12%',
    title: 'Total Orders',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
    pcColor: 'green-500',
  },
  {
    icon: <FiPieChart />,
    amount: '$98,000',
    percentage: '+20%',
    title: 'Revenue',
    iconColor: '#7352FF',
    iconBg: '#EAE8FD',
    pcColor: 'green-500',
  },
  {
    icon: <FiBarChart2 />,
    amount: '$38,400',
    percentage: '-8%',
    title: 'Expenses',
    iconColor: '#FF5C8E',
    iconBg: '#FDE8EF',
    pcColor: 'red-500',
  },
  {
    icon: <FiActivity />,
    amount: '$12,200',
    percentage: '+5%',
    title: 'Net Profit',
    iconColor: '#1E4DB7',
    iconBg: '#E5ECF9',
    pcColor: 'green-500',
  },
];

export const SparklineAreaData = [
  { x: 1, yval: 5 },
  { x: 2, yval: 6 },
  { x: 3, yval: 5.5 },
  { x: 4, yval: 8 },
  { x: 5, yval: 7 },
  { x: 6, yval: 10 },
  { x: 7, yval: 11 },
];

export const ecomPieChartData = [
  { x: 'Electronics', y: 40, text: '40%' },
  { x: 'Clothing', y: 25, text: '25%' },
  { x: 'Home Goods', y: 20, text: '20%' },
  { x: 'Other', y: 15, text: '15%' },
];

export const lineCustomSeries = [
  {
    dataSource: [
      { x: new Date(2023, 0, 1), y: 35 },
      { x: new Date(2023, 1, 1), y: 28 },
      { x: new Date(2023, 2, 1), y: 34 },
      { x: new Date(2023, 3, 1), y: 32 },
      { x: new Date(2023, 4, 1), y: 40 },
      { x: new Date(2023, 5, 1), y: 45 },
    ],
    xName: 'x',
    yName: 'y',
    name: 'Orders',
    width: '2',
    marker: { visible: true, width: 10, height: 10 },
    type: 'Line',
  },
];

export const LinePrimaryXAxis = {
  valueType: 'DateTime',
  labelFormat: 'MMM',
  intervalType: 'Months',
  majorGridLines: { width: 0 },
  edgeLabelPlacement: 'Shift',
};

export const LinePrimaryYAxis = {
  labelFormat: '{value}',
  lineStyle: { width: 0 },
  maximum: 60,
  interval: 10,
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
};

export const stackedCustomSeries = [
  { x: 'Q1', Products: 111, Sales: 85 },
  { x: 'Q2', Products: 130, Sales: 100 },
  { x: 'Q3', Products: 101, Sales: 90 },
  { x: 'Q4', Products: 150, Sales: 120 },
];

export const stackedPrimaryXAxis = {
  majorGridLines: { width: 0 },
  minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
  interval: 1,
  labelIntersectAction: 'Rotate45',
  valueType: 'Category',
};

export const stackedPrimaryYAxis = {
  lineStyle: { width: 0 },
  maximum: 250,
  interval: 50,
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
};

export const cartData = [
  {
    image: 'https://via.placeholder.com/40',
    name: 'Product 1',
    category: 'Category A',
    price: '$30',
  },
  {
    image: 'https://via.placeholder.com/40',
    name: 'Product 2',
    category: 'Category B',
    price: '$45',
  },
  {
    image: 'https://via.placeholder.com/40',
    name: 'Product 3',
    category: 'Category C',
    price: '$25',
  },
];

export const chatData = [
  {
    image: 'https://via.placeholder.com/40',
    message: 'New order received',
    desc: 'Order #1234 has been placed',
  },
  {
    image: 'https://via.placeholder.com/40',
    message: 'Low stock alert',
    desc: 'Only 5 units left in inventory',
  },
  {
    image: 'https://via.placeholder.com/40',
    message: 'Payment received',
    desc: '$250.00 from John Doe',
  },
];

export const userProfileData = [
  {
    icon: <MdSettings />,
    title: 'My Account',
    desc: 'Account Settings',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
  },
  {
    icon: <MdOutlineMessage />,
    title: 'Messages',
    desc: 'Check your messages',
    iconColor: '#7352FF',
    iconBg: '#EAE8FD',
  },
  {
    icon: <MdHelpOutline />,
    title: 'Support',
    desc: 'Get help & support',
    iconColor: '#FF5C8E',
    iconBg: '#FDE8EF',
  },
];
