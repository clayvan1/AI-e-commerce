import React, { useState, useMemo } from 'react';
import { useOrders } from '../../contexts/OrdersContext';
import './orders.css';

const getStatusColor = (status = '') => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'status-yellow';
    case 'shipped':
      return 'status-blue';
    case 'delivered':
      return 'status-green';
    default:
      return '';
  }
};

const ShopkeeperOrders = () => {
  const { orders = [], loading, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
    } catch {
      alert('Failed to update order status.');
    }
  };

  const totalAmount = (items = []) =>
    items.reduce(
      (sum, item) =>
        sum + (item.quantity || 0) * (item.product?.price || 0),
      0
    );

  const sortedOrders = useMemo(() => {
    const statusPriority = { pending: 0, shipped: 1, delivered: 2 };
    return [...orders].sort((a, b) => {
      const aStatus = a.status?.toLowerCase() || '';
      const bStatus = b.status?.toLowerCase() || '';
      const aDate = new Date(a.created_at);
      const bDate = new Date(b.created_at);
      if (aStatus === bStatus) return bDate - aDate;
      return statusPriority[aStatus] - statusPriority[bStatus];
    });
  }, [orders]);

  const filteredOrders = sortedOrders.filter((order) => {
    const status = order?.status || '';
    const name = order?.full_name || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus =
      filterStatus === 'all' || status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const changePage = (page) => {
    const tbody = document.querySelector('.orders-body');
    if (tbody) {
      tbody.classList.add('fade-out');
      setTimeout(() => {
        setCurrentPage(page);
        tbody.classList.remove('fade-out');
      }, 200);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="shopkeeper-orders">
      {/* Filter Bar */}
      <div className="filter-bar">
        {['all', 'pending', 'shipped', 'delivered'].map((status) => (
          <button
            key={status}
            className={filterStatus === status ? 'active' : ''}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search orders..."
        className="search-box"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody className="orders-body fade-transition" key={currentPage}>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="6">
                    <div className="skeleton-row" />
                  </td>
                </tr>
              ))
            ) : paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="order-row"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td>{order.id}</td>
                  <td>{order.full_name}</td>
                  <td>
                    {totalAmount(order.items).toLocaleString('en-KE', {
                      style: 'currency',
                      currency: 'KES',
                    })}
                  </td>
                  <td className={getStatusColor(order.status)}>
                    {order.status}
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleString('en-KE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      className="status-dropdown"
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">pending</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && (
          <div className="pagination-bar">
            <button
              className="page-btn"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo; Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={
                  i + 1 === currentPage ? 'page-btn active' : 'page-btn'
                }
                onClick={() => changePage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next &raquo;
            </button>
          </div>
        )}
      </div>

      {/* Popout Detail */}
      {selectedOrder && (
        <div className="order-overlay">
          <div className="order-detail-card">
            <button
              className="close-btn"
              onClick={() => setSelectedOrder(null)}
            >
              &times;
            </button>
            <h2>Order #{selectedOrder.id}</h2>
            <p>
              <strong>Customer:</strong> {selectedOrder.full_name}
            </p>
            <p>
              <strong>Address:</strong>{' '}
              {`${selectedOrder.address_line}, ${selectedOrder.city}, ${selectedOrder.country}`}
            </p>
            <p>
              <strong>Status:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(selectedOrder.created_at).toLocaleString('en-KE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            <h3>Items:</h3>
            <ul>
              {selectedOrder.items.map((item, index) => (
                <li key={index}>
                  {item.product.name} x {item.quantity} = KES{' '}
                  {(item.quantity * item.product.price).toFixed(2)}
                </li>
              ))}
            </ul>
            <h3>
              Total: KES {totalAmount(selectedOrder.items).toFixed(2)}
            </h3>
            <button className="print-button">Print Invoice</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopkeeperOrders;
