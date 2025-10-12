import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, productsRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/products'),
        api.get('/admin/orders'),
      ]);

      setStats(statsRes.data || stats);
      setUsers(usersRes.data || []);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-3">Admin Dashboard</h2>

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
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people me-2"></i>
                Users
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
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="bi bi-gear me-2"></i>
                Settings
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
              <div className="card border-start border-primary border-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">Total Users</h6>
                      <h3 className="mb-0">{stats.totalUsers}</h3>
                    </div>
                    <i className="bi bi-people text-primary" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card border-start border-success border-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">Total Sellers</h6>
                      <h3 className="mb-0">{stats.totalSellers}</h3>
                    </div>
                    <i className="bi bi-shop text-success" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card border-start border-info border-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">Total Products</h6>
                      <h3 className="mb-0">{stats.totalProducts}</h3>
                    </div>
                    <i className="bi bi-box text-info" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-md-6">
              <div className="card border-start border-warning border-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">Total Revenue</h6>
                      <h3 className="mb-0">${stats.totalRevenue.toFixed(2)}</h3>
                    </div>
                    <i className="bi bi-currency-dollar text-warning" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row g-3">
            <div className="col-lg-8">
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
                          <tr key={order._id}>
                            <td>#{order._id?.slice(-6)}</td>
                            <td>{order.user?.name || 'N/A'}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>${order.totalPrice?.toFixed(2)}</td>
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
                              <button className="btn btn-sm btn-outline-primary">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card mb-3">
                <div className="card-header">
                  <h5 className="mb-0">Pending Approvals</h5>
                </div>
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between">
                      <span>New Sellers</span>
                      <span className="badge bg-warning">3</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between">
                      <span>Product Reviews</span>
                      <span className="badge bg-info">12</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between">
                      <span>Reported Items</span>
                      <span className="badge bg-danger">5</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">System Health</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Server Status</small>
                      <small className="text-success">Online</small>
                    </div>
                    <div className="progress">
                      <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Database</small>
                      <small className="text-success">Healthy</small>
                    </div>
                    <div className="progress">
                      <div className="progress-bar bg-success" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="d-flex justify-content-between mb-1">
                      <small>Payment Gateway</small>
                      <small className="text-success">Active</small>
                    </div>
                    <div className="progress">
                      <div className="progress-bar bg-success" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <AdminUsersTab users={users} onRefresh={loadAdminData} />
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <AdminProductsTab products={products} onRefresh={loadAdminData} />
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <AdminOrdersTab orders={orders} onRefresh={loadAdminData} />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <AdminSettingsTab />
      )}
    </div>
  );
}

// Admin Users Tab Component
function AdminUsersTab({ users, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleUserAction = async (userId, action) => {
    try {
      await api.patch(`/admin/users/${userId}`, { action });
      alert(`User ${action} successfully`);
      onRefresh();
    } catch (err) {
      alert(`Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <h5 className="mb-0">User Management</h5>
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge bg-${
                      user.role === 'admin' ? 'danger' :
                      user.role === 'seller' ? 'primary' : 'secondary'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" onClick={() => alert('View user details')}>
                        View
                      </button>
                      <button
                        className={`btn btn-outline-${user.isActive ? 'danger' : 'success'}`}
                        onClick={() => handleUserAction(user._id, user.isActive ? 'suspend' : 'activate')}
                      >
                        {user.isActive ? 'Suspend' : 'Activate'}
                      </button>
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

// Admin Products Tab Component
function AdminProductsTab({ products, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const handleProductAction = async (productId, action) => {
    try {
      await api.patch(`/admin/products/${productId}`, { action });
      alert(`Product ${action} successfully`);
      onRefresh();
    } catch (err) {
      alert(`Failed to ${action} product`);
    }
  };

  const filteredProducts = statusFilter === 'all'
    ? products
    : products.filter(p => p.status === statusFilter);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Product Management</h5>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Products</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={product.pictures?.[0] || '/placeholder.png'}
                      alt={product.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.seller?.name || 'N/A'}</td>
                  <td>${product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`badge bg-${
                      product.status === 'approved' ? 'success' :
                      product.status === 'rejected' ? 'danger' : 'warning'
                    }`}>
                      {product.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-success" onClick={() => handleProductAction(product._id, 'approve')}>
                        Approve
                      </button>
                      <button className="btn btn-outline-danger" onClick={() => handleProductAction(product._id, 'reject')}>
                        Reject
                      </button>
                      <button className="btn btn-outline-warning" onClick={() => handleProductAction(product._id, 'delete')}>
                        Delete
                      </button>
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

// Admin Orders Tab Component
function AdminOrdersTab({ orders, onRefresh }) {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Order Management</h5>
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
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id?.slice(-6)}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>${order.totalPrice?.toFixed(2)}</td>
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
                      <button className="btn btn-outline-warning">Refund</button>
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

// Admin Settings Tab Component
function AdminSettingsTab() {
  return (
    <div className="row g-3">
      <div className="col-lg-6">
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">Platform Settings</h5>
          </div>
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label className="form-label">Site Name</label>
                <input type="text" className="form-control" defaultValue="E-Commerce Platform" />
              </div>
              <div className="mb-3">
                <label className="form-label">Commission Rate (%)</label>
                <input type="number" className="form-control" defaultValue="10" />
              </div>
              <div className="mb-3">
                <label className="form-label">Minimum Payout Amount</label>
                <input type="number" className="form-control" defaultValue="50" />
              </div>
              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="autoApprove" />
                <label className="form-check-label" htmlFor="autoApprove">
                  Auto-approve new sellers
                </label>
              </div>
              <button type="submit" className="btn btn-primary">Save Settings</button>
            </form>
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="card mb-3">
          <div className="card-header">
            <h5 className="mb-0">Email Notifications</h5>
          </div>
          <div className="card-body">
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="orderNotif" defaultChecked />
              <label className="form-check-label" htmlFor="orderNotif">
                New order notifications
              </label>
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="sellerNotif" defaultChecked />
              <label className="form-check-label" htmlFor="sellerNotif">
                New seller registrations
              </label>
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="productNotif" />
              <label className="form-check-label" htmlFor="productNotif">
                Product approval requests
              </label>
            </div>
            <button className="btn btn-primary">Update Preferences</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">System Actions</h5>
          </div>
          <div className="card-body">
            <div className="d-grid gap-2">
              <button className="btn btn-info">Clear Cache</button>
              <button className="btn btn-warning">Export Data</button>
              <button className="btn btn-danger">System Maintenance Mode</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
