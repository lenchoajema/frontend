import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState('account');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, addressesRes, paymentsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/addresses'),
        api.get('/users/payment-methods'),
      ]);

      setProfileData(profileRes.data || { name: user?.name, email: user?.email, phone: '' });
      setAddresses(addressesRes.data || []);
      setPaymentMethods(paymentsRes.data || []);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', profileData);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.put('/users/change-password', {
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
      });
      alert('Password changed successfully!');
      e.target.reset();
    } catch (err) {
      alert('Failed to change password');
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-3">
          {/* Sidebar */}
          <div className="card">
            <div className="card-body text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                     style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h5 className="mb-1">{user?.name}</h5>
              <p className="text-muted small">{user?.email}</p>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <i className="bi bi-person me-2"></i>
                Account Settings
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <i className="bi bi-geo-alt me-2"></i>
                Addresses
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                <i className="bi bi-credit-card me-2"></i>
                Payment Methods
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="bi bi-shield-lock me-2"></i>
                Security
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <i className="bi bi-eye me-2"></i>
                Privacy
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          {/* Account Settings Tab */}
          {activeTab === 'account' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Account Settings</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Saved Addresses</h5>
                <button className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-circle me-1"></i>
                  Add New Address
                </button>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {addresses.length === 0 ? (
                    <div className="col-12 text-center py-5">
                      <i className="bi bi-geo-alt text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No saved addresses yet</p>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div key={address._id} className="col-md-6">
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0">
                                {address.label}
                                {address.isDefault && (
                                  <span className="badge bg-success ms-2">Default</span>
                                )}
                              </h6>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary">Edit</button>
                                <button className="btn btn-outline-danger">Delete</button>
                              </div>
                            </div>
                            <p className="mb-1">{address.street}</p>
                            <p className="mb-1">{address.city}, {address.state} {address.zipCode}</p>
                            <p className="mb-0 text-muted">{address.country}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payments' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Payment Methods</h5>
                <button className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-circle me-1"></i>
                  Add New Card
                </button>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {paymentMethods.length === 0 ? (
                    <div className="col-12 text-center py-5">
                      <i className="bi bi-credit-card text-muted" style={{ fontSize: '3rem' }}></i>
                      <p className="text-muted mt-3">No saved payment methods yet</p>
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <div key={method._id} className="col-md-6">
                        <div className="card">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <i className={`bi bi-${method.type === 'visa' ? 'credit-card' : 'credit-card-2-front'} me-2`}></i>
                                <strong>**** {method.last4}</strong>
                                {method.isDefault && (
                                  <span className="badge bg-success ms-2">Default</span>
                                )}
                              </div>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-danger">Remove</button>
                              </div>
                            </div>
                            <p className="mb-0 text-muted">Expires {method.expiryMonth}/{method.expiryYear}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Security Settings</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleChangePassword} className="mb-4">
                  <h6 className="mb-3">Change Password</h6>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="currentPassword"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="newPassword"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">Update Password</button>
                    </div>
                  </div>
                </form>

                <hr />

                <div className="mt-4">
                  <h6 className="mb-3">Two-Factor Authentication</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1">Secure your account with 2FA</p>
                      <p className="text-muted small mb-0">Add an extra layer of security to your account</p>
                    </div>
                    <button className="btn btn-outline-primary">Enable 2FA</button>
                  </div>
                </div>

                <hr />

                <div className="mt-4">
                  <h6 className="mb-3">Active Sessions</h6>
                  <div className="list-group">
                    <div className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">Current Session</h6>
                          <p className="mb-1 text-muted small">Chrome on Windows • 192.168.1.1</p>
                          <p className="mb-0 text-muted small">Last active: Just now</p>
                        </div>
                        <span className="badge bg-success">Active</span>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-outline-danger mt-3">Sign Out All Devices</button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Privacy Settings</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h6 className="mb-3">Data & Privacy</h6>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="marketing" />
                    <label className="form-check-label" htmlFor="marketing">
                      Receive marketing emails and promotions
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="analytics" defaultChecked />
                    <label className="form-check-label" htmlFor="analytics">
                      Allow analytics and performance cookies
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="personalized" defaultChecked />
                    <label className="form-check-label" htmlFor="personalized">
                      Show personalized recommendations
                    </label>
                  </div>
                </div>

                <hr />

                <div className="mt-4">
                  <h6 className="mb-3">Account Actions</h6>
                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-info">
                      <i className="bi bi-download me-2"></i>
                      Download My Data (GDPR)
                    </button>
                    <button className="btn btn-outline-warning">
                      <i className="bi bi-trash me-2"></i>
                      Delete My Account
                    </button>
                  </div>
                  <p className="text-muted small mt-2">
                    These actions are permanent and cannot be undone. Please review our privacy policy before proceeding.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
