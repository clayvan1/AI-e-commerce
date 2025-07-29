import React from 'react';
import { useNavigate } from 'react-router-dom';

import BarChartBox from '../../components/Dashboard/Charts/Bargraph';
import DonutChart from '../../components/Dashboard/Charts/Pie';
import CustomLineChart from '../../components/Dashboard/Charts/LineChart';

import './ShopkeeperDashboard.css';

const ShopkeeperDashboard = () => {
  const navigate = useNavigate();

  const donutData = [
    { x: 'Pending Orders', y: 12 },
    { x: 'Fulfilled Orders', y: 26 },
  ];

  const stockData = [
    { label: 'Shoes', value: 24 },
    { label: 'Hats', value: 12 },
    { label: 'Jackets', value: 30 },
  ];

  const latestOrders = [
    { id: '#ORD001', product: 'Samsung A15', customer: 'Jane Doe', status: 'Pending' },
    { id: '#ORD002', product: 'Laptop HP', customer: 'John Smith', status: 'Delivered' },
    { id: '#ORD003', product: 'Electric Kettle', customer: 'Mary Njeri', status: 'Pending' },
    { id: '#ORD004', product: 'Electric Kettle', customer: 'Mary Njeri', status: 'Pending' },
    { id: '#ORD005', product: 'Electric Kettle', customer: 'Mary Njeri', status: 'Pending' },
    { id: '#ORD006', product: 'Electric Kettle', customer: 'Mary Njeri', status: 'Pending' },
  ];

  return (
    <div className="shopkeeper-dashboard">
  

      {/* Top Row */}
      <div className="dashboard-top-row">
        <div className="summary-section">
          <div className="summary-card">
            <h3>Sales Today</h3>
            <p>KES 18,500</p>
          </div>
          <div className="summary-card">
            <h3>Orders Today</h3>
            <p>7</p>
          </div>
        </div>

        <div className="donut-chart-box">
          <h3>Order Status</h3>
          <DonutChart id="order-donut" data={donutData} height="260px" />
        </div>

        <div className="latest-orders-box">
          <div className="latest-orders-header">
            <h3>Latest Orders</h3>
            <button onClick={() => navigate('/shopkeeper/orders')}>
              View More
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.product}</td>
                    <td>{order.customer}</td>
                    <td className={order.status === 'Pending' ? 'text-yellow' : 'text-green'}>
                      {order.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-graph-row">
        <div className="chart-box">
          <h3>Available Stock</h3>
          <BarChartBox id="stock-bar" data={stockData} xKey="label" yKey="value" color="#10b981" />
        </div>
        <div className="chart-box">
          <h3>Order Trends</h3>
          <CustomLineChart />
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperDashboard;
