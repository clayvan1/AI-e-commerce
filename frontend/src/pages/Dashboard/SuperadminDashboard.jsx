import React from 'react';

// Charts and components
import ChartsHeader from '../../components/Dashboard/ChartsHeader';
import AnimatedList from '../../components/Dashboard/Animatedlist';
import LineChart from '../../components/Dashboard/Charts/LineChart';
import Doughnut from '../../components/Dashboard/Charts/Pie';
import SparkLine from '../../components/Dashboard/Charts/SparkLine';
import Stacked from '../../components/Dashboard/Charts/Stacked';

import { useStateContext } from '../../contexts/ContextProvider';
import {
  earningData,
  SparklineAreaData,
  ecomPieChartData,
} from '../../data/dummy';

import './SuperadminDashboard.css';

const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'];

function SuperadminDashboard() {
  const { currentColor } = useStateContext();

  return (
    <div className="px-6">
      <div className="dashboard-grid-container">
        {/* Left Column */}
        <div className="left-col">
          {/* Trending Products */}
          <div className="dashboard-card">
            <h2>Trending Products</h2>
            <AnimatedList
              items={items}
              onItemSelect={(item, index) => console.log(item, index)}
              showGradients
              enableArrowNavigation
              displayScrollbar
            />
          </div>

          {/* Revenue Graph */}
          <div className="dashboard-card">
            <p className="card-title-lg">Revenue Updates</p>
            <div className="card-body">
              <div className="card-finance">
            
                
                
              
                <div className="chart-spark">
                  <SparkLine
                    currentColor={currentColor}
                    id="sparkline"
                    type="Line"
                    height="70%"
                    width="70%"
                    data={SparklineAreaData}
                    color={currentColor}
                  />
                </div>
                <button
                  type="button"
                  style={{ backgroundColor: currentColor }}
                  className="download-btn"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="center-col">
          {/* Summary Cards 2x2 */}
          <div className="summary-cards-grid">
            {earningData.map((item, index) => (
              <div key={index} className="dashboard-card summary-card">
                <button
                  type="button"
                  style={{
                    color: item.iconColor,
                    backgroundColor: item.iconBg,
                  }}
                  className="card-icon"
                >
                  {item.icon}
                </button>
                <div>
                  <p className="card-amount">{item.amount}</p>
                  <p className={`card-percentage ${item.pcColor}`}>
                    {item.percentage}
                  </p>
                  <p className="card-title">{item.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Line Chart */}
          <div className="dashboard-card line-chart-card graph-card">
            
            <LineChart 
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="right-col">
          {/* Donut Chart */}
          <div className="dashboard-card">
            <Doughnut
              id="doughnut-chart"
              data={ecomPieChartData}
              legendVisiblity
              height="300px"
            />
          </div>

          {/* Stacked Chart */}
          <div className="dashboard-card stacked-chart-card graph-card">
            
            <Stacked width="100%" height="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperadminDashboard;
