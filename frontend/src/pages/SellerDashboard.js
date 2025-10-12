import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        api.get('/seller/stats'),
        api.get('/seller/products'),
        api.get('/seller/orders'),
      ]);

      setStats(statsRes.data || stats);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [1200, 1900, 1500, 2100, 2400, 2800],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const ordersData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
    datasets: [
      {
        data: [12, 19, 45, 67],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
      },
    ],
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-3">Seller Dashboard</h2>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <i className="bi bi-box-seam me-2"></i>
                Products
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <i className="bi bi-bag me-2"></i>
                Orders
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <i className="bi bi-graph-up me-2"></i>
                Analytics
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'earnings' ? 'active' : ''}`}
                onClick={() => setActiveTab('earnings')}
              >
                <i className="bi bi-wallet2 me-2"></i>
                Earnings
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="row g-3 mb-4">
            <div className="col-xl-3 col-md-6">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-white-50 mb-2">Total Revenue</h6>
                      <h3 className="mb-0">${stats.totalRevenue.toFixed(2)}</h3>
                    </div>
                    <i className="bi bi-currency-dollar" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-white-50 mb-2">Total Orders</h6>
                      <h3 className="mb-0">{stats.totalOrders}</h3>
                    </div>
                    <i className="bi bi-cart-check" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-white-50 mb-2">Total Products</h6>
                      <h3 className="mb-0">{stats.totalProducts}</h3>
                    </div>
                    <i className="bi bi-box" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-white-50 mb-2">Pending Orders</h6>
                      <h3 className="mb-0">{stats.pendingOrders}</h3>
                    </div>
                    <i className="bi bi-clock-history" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="row g-3">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Sales Overview</h5>
                  <Line data={salesData} options={{ responsive: true }} />
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Order Status</h5>
                  <Doughnut data={ordersData} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Recent Orders</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.customerName}</td>
                            <td>{new Date(order.date).toLocaleDateString()}</td>
                            <td>${order.total.toFixed(2)}</td>
                            <td>
                              <span className={`badge bg-${
                                order.status === 'delivered' ? 'success' :
                                order.status === 'shipped' ? 'info' :
                                order.status === 'processing' ? 'warning' : 'secondary'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <Link to={`/seller/orders/${order.id}`} className="btn btn-sm btn-outline-primary">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <SellerProductsTab products={products} onRefresh={loadDashboardData} />
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <SellerOrdersTab orders={orders} onRefresh={loadDashboardData} />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <SellerAnalyticsTab />
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <SellerEarningsTab />
      )}
    </div>
  );
}

// Seller Products Tab Component
function SellerProductsTab({ products, onRefresh }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">My Products</h5>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Add Product
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Sales</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img src={product.pictures?.[0]} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                  </td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>
                    <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${product.active ? 'bg-success' : 'bg-secondary'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{product.totalSales || 0}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary">Edit</button>
                      <button className="btn btn-outline-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Seller Orders Tab Component
function SellerOrdersTab({ orders, onRefresh }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Orders</h5>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customerName}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <span className={`badge bg-${
                      order.status === 'delivered' ? 'success' :
                      order.status === 'shipped' ? 'info' :
                      order.status === 'processing' ? 'warning' :
                      order.status === 'cancelled' ? 'danger' : 'secondary'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary">View</button>
                      <button className="btn btn-outline-success">Update</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Seller Analytics Tab Component
function SellerAnalyticsTab() {
  const productPerformance = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Product Performance</h5>
            <Bar data={productPerformance} />
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title">Top Selling Products</h6>
            <div className="list-group list-group-flush">
              {['Product A', 'Product B', 'Product C'].map((p, i) => (
                <div key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  {p}
                  <span className="badge bg-primary rounded-pill">{100 - i * 20}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Customer Insights</h6>
            <div className="mb-3">
              <small className="text-muted">Average Order Value</small>
              <h4>$127.50</h4>
            </div>
            <div>
              <small className="text-muted">Repeat Customer Rate</small>
              <h4>32%</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Seller Earnings Tab Component
function SellerEarningsTab() {
  const [payoutMethod, setPayoutMethod] = useState('bank');

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title mb-4">Earnings Summary</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted">Available Balance</small>
                  <h3 className="mb-0">$2,458.00</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted">Pending</small>
                  <h3 className="mb-0">$523.00</h3>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted">Lifetime Earnings</small>
                  <h3 className="mb-0">$15,478.00</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Transaction History</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2025-10-10</td>
                    <td>Order #12345</td>
                    <td className="text-success">+$125.00</td>
                    <td><span className="badge bg-success">Completed</span></td>
                  </tr>
                  <tr>
                    <td>2025-10-08</td>
                    <td>Withdrawal</td>
                    <td className="text-danger">-$500.00</td>
                    <td><span className="badge bg-info">Processing</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">Request Payout</h5>
            <form>
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input type="number" className="form-control" placeholder="Enter amount" />
              </div>
              <div className="mb-3">
                <label className="form-label">Payout Method</label>
                <select
                  className="form-select"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Request Payout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
