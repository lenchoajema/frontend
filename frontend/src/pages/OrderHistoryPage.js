import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return 'bi-check-circle';
      case 'shipped': return 'bi-truck';
      case 'processing': return 'bi-hourglass-split';
      case 'cancelled': return 'bi-x-circle';
      default: return 'bi-clock-history';
    }
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-3">Order History</h2>
          
          {/* Filter Buttons */}
          <div className="btn-group mb-3" role="group">
            <button
              className={`btn btn-outline-primary ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All Orders
            </button>
            <button
              className={`btn btn-outline-primary ${filterStatus === 'processing' ? 'active' : ''}`}
              onClick={() => setFilterStatus('processing')}
            >
              Processing
            </button>
            <button
              className={`btn btn-outline-primary ${filterStatus === 'shipped' ? 'active' : ''}`}
              onClick={() => setFilterStatus('shipped')}
            >
              Shipped
            </button>
            <button
              className={`btn btn-outline-primary ${filterStatus === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilterStatus('delivered')}
            >
              Delivered
            </button>
            <button
              className={`btn btn-outline-primary ${filterStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="bi bi-bag-x text-muted" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3">No orders found</h4>
            <p className="text-muted">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredOrders.map((order) => (
            <div key={order._id} className="col-12">
              <div className="card">
                <div className="card-header bg-light">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <small className="text-muted">Order ID</small>
                      <div className="fw-bold">#{order._id?.slice(-8)}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Date</small>
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Total</small>
                      <div className="fw-bold">${order.totalPrice?.toFixed(2)}</div>
                    </div>
                    <div className="col-md-3 text-md-end">
                      <span className={`badge bg-${getStatusColor(order.status)}`}>
                        <i className={`bi ${getStatusIcon(order.status)} me-1`}></i>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {/* Order Items */}
                  <div className="row g-3 mb-3">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="col-md-4">
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product?.pictures?.[0] || '/placeholder.png'}
                            alt={item.product?.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            className="rounded me-3"
                          />
                          <div>
                            <h6 className="mb-1">{item.product?.name}</h6>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="col-12">
                        <small className="text-muted">
                          +{order.items.length - 3} more items
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Order Progress Timeline */}
                  {order.status !== 'cancelled' && (
                    <div className="mb-3">
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar bg-${getStatusColor(order.status)}`}
                          style={{
                            width: order.status === 'pending' ? '25%' :
                                   order.status === 'processing' ? '50%' :
                                   order.status === 'shipped' ? '75%' :
                                   order.status === 'delivered' ? '100%' : '0%'
                          }}
                        ></div>
                      </div>
                      <div className="d-flex justify-content-between mt-2">
                        <small className={order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'text-success' : 'text-muted'}>
                          <i className="bi bi-check-circle-fill"></i> Order Placed
                        </small>
                        <small className={order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'text-success' : 'text-muted'}>
                          <i className={`bi ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> Processing
                        </small>
                        <small className={order.status === 'shipped' || order.status === 'delivered' ? 'text-success' : 'text-muted'}>
                          <i className={`bi ${order.status === 'shipped' || order.status === 'delivered' ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> Shipped
                        </small>
                        <small className={order.status === 'delivered' ? 'text-success' : 'text-muted'}>
                          <i className={`bi ${order.status === 'delivered' ? 'bi-check-circle-fill' : 'bi-circle'}`}></i> Delivered
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Tracking Information */}
                  {order.trackingNumber && (
                    <div className="alert alert-info d-flex align-items-center">
                      <i className="bi bi-truck me-3" style={{ fontSize: '1.5rem' }}></i>
                      <div>
                        <strong>Tracking Number:</strong> {order.trackingNumber}
                        <br />
                        <small>Estimated Delivery: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : 'TBD'}</small>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedOrder(order)}
                      data-bs-toggle="modal"
                      data-bs-target="#orderDetailsModal"
                    >
                      <i className="bi bi-eye me-1"></i>
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <>
                        <button className="btn btn-outline-primary btn-sm">
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          Return
                        </button>
                        <Link to={`/products/${order.items?.[0]?.product?._id}/review`} className="btn btn-outline-success btn-sm">
                          <i className="bi bi-star me-1"></i>
                          Write Review
                        </Link>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <button className="btn btn-outline-danger btn-sm">
                        <i className="bi bi-x-circle me-1"></i>
                        Cancel Order
                      </button>
                    )}
                    <button className="btn btn-outline-secondary btn-sm">
                      <i className="bi bi-download me-1"></i>
                      Invoice
                    </button>
                    <button className="btn btn-outline-info btn-sm">
                      <i className="bi bi-arrow-repeat me-1"></i>
                      Buy Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <div className="modal fade" id="orderDetailsModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedOrder && (
                <>
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6>Order Information</h6>
                      <p className="mb-1"><strong>Order ID:</strong> #{selectedOrder._id?.slice(-8)}</p>
                      <p className="mb-1"><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p className="mb-1">
                        <strong>Status:</strong>{' '}
                        <span className={`badge bg-${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6>Shipping Address</h6>
                      <p className="mb-1">{selectedOrder.shippingAddress?.street}</p>
                      <p className="mb-1">
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}
                      </p>
                      <p className="mb-0">{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </div>

                  <h6>Order Items</h6>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={item.product?.pictures?.[0] || '/placeholder.png'}
                                  alt={item.product?.name}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  className="rounded me-2"
                                />
                                {item.product?.name}
                              </div>
                            </td>
                            <td>{item.quantity}</td>
                            <td>${item.price?.toFixed(2)}</td>
                            <td>${(item.quantity * item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                          <td><strong>${selectedOrder.itemsPrice?.toFixed(2)}</strong></td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-end">Shipping:</td>
                          <td>${selectedOrder.shippingPrice?.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-end">Tax:</td>
                          <td>${selectedOrder.taxPrice?.toFixed(2)}</td>
                        </tr>
                        <tr className="table-primary">
                          <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                          <td><strong>${selectedOrder.totalPrice?.toFixed(2)}</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {selectedOrder.paymentInfo && (
                    <div className="mt-3">
                      <h6>Payment Information</h6>
                      <p className="mb-1">
                        <strong>Method:</strong> {selectedOrder.paymentInfo.method}
                      </p>
                      <p className="mb-0">
                        <strong>Status:</strong>{' '}
                        <span className={`badge bg-${selectedOrder.paymentInfo.status === 'paid' ? 'success' : 'warning'}`}>
                          {selectedOrder.paymentInfo.status}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
