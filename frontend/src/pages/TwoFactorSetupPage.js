import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import QRCode from 'qrcode.react';
import api from '../services/api';

export default function TwoFactorSetupPage() {
  const user = useSelector((state) => state.auth.user);
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.twoFactorEnabled) {
      setStep(4); // Already enabled
    } else {
      generateQRCode();
    }
  }, [user]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/generate');
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (err) {
      setError('Failed to generate 2FA QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/2fa/verify', {
        token: verificationCode,
        secret: secret,
      });
      setSuccess(true);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA?')) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/2fa/disable');
      alert('2FA disabled successfully');
      setStep(1);
      generateQRCode();
    } catch (err) {
      setError('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="fw-bold mt-3">Two-Factor Authentication</h2>
                <p className="text-muted">Add an extra layer of security to your account</p>
              </div>

              {/* Step 1: Introduction */}
              {step === 1 && (
                <div>
                  <h5 className="mb-3">Why Enable 2FA?</h5>
                  <ul className="list-unstyled mb-4">
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Protect your account from unauthorized access
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Secure your personal and financial information
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Meet industry security standards
                    </li>
                  </ul>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => setStep(2)}
                  >
                    Get Started
                  </button>
                </div>
              )}

              {/* Step 2: Scan QR Code */}
              {step === 2 && (
                <div>
                  <h5 className="mb-3">Setup Instructions</h5>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    You'll need an authenticator app like Google Authenticator or Authy
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="fw-bold">Step 1: Scan this QR code with your authenticator app</p>
                        <div className="text-center p-4 bg-light rounded">
                          {qrCode && <QRCode value={qrCode} size={200} />}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="fw-bold">Step 2: Or manually enter this secret key</p>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={secret}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => navigator.clipboard.writeText(secret)}
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleVerify}>
                        <div className="mb-4">
                          <p className="fw-bold">Step 3: Enter the 6-digit code from your app</p>
                          <input
                            type="text"
                            className="form-control form-control-lg text-center"
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            pattern="[0-9]{6}"
                            required
                          />
                        </div>

                        {error && (
                          <div className="alert alert-danger" role="alert">
                            {error}
                          </div>
                        )}

                        <div className="d-grid gap-2">
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || verificationCode.length !== 6}
                          >
                            {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setStep(1)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Success */}
              {step === 3 && success && (
                <div className="text-center">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  <h3 className="mt-3 mb-3">2FA Enabled Successfully!</h3>
                  <p className="text-muted mb-4">
                    Your account is now protected with two-factor authentication.
                    You'll need to enter a code from your authenticator app each time you log in.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/profile'}
                  >
                    Go to Profile
                  </button>
                </div>
              )}

              {/* Step 4: Already Enabled */}
              {step === 4 && (
                <div>
                  <div className="alert alert-success">
                    <i className="bi bi-shield-check me-2"></i>
                    Two-factor authentication is currently <strong>enabled</strong> on your account
                  </div>

                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <h6 className="mb-3">What happens if I disable 2FA?</h6>
                      <ul className="mb-0">
                        <li>Your account will be less secure</li>
                        <li>You'll only need your password to sign in</li>
                        <li>You can re-enable 2FA at any time</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={handleDisable}
                    disabled={loading}
                  >
                    {loading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
