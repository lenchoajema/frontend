import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setShow(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    setShow(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 p-3 bg-white shadow-lg"
      style={{ zIndex: 9999, borderTop: '3px solid #0d6efd' }}
    >
      <div className="container">
        {!showSettings ? (
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h5 className="mb-2">
                <i className="bi bi-cookie me-2"></i>
                We Value Your Privacy
              </h5>
              <p className="mb-3 small">
                We use cookies to enhance your browsing experience, serve personalized content,
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                {' '}
                <a href="/privacy" target="_blank" className="text-decoration-none">
                  Learn more
                </a>
              </p>
            </div>
            <div className="col-lg-4">
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleRejectAll}
                >
                  Reject All
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowSettings(true)}
                >
                  Settings
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Cookie Preferences</h5>
              <button
                className="btn-close"
                onClick={() => setShowSettings(false)}
                aria-label="Close"
              ></button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6>
                        <i className="bi bi-shield-check text-success me-2"></i>
                        Necessary Cookies
                      </h6>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={true}
                          disabled
                        />
                      </div>
                    </div>
                    <p className="small text-muted mb-0">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6>
                        <i className="bi bi-sliders text-primary me-2"></i>
                        Functional Cookies
                      </h6>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={preferences.functional}
                          onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                        />
                      </div>
                    </div>
                    <p className="small text-muted mb-0">
                      Enable enhanced functionality and personalization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6>
                        <i className="bi bi-graph-up text-info me-2"></i>
                        Analytics Cookies
                      </h6>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                        />
                      </div>
                    </div>
                    <p className="small text-muted mb-0">
                      Help us understand how you use our website to improve your experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6>
                        <i className="bi bi-megaphone text-warning me-2"></i>
                        Marketing Cookies
                      </h6>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                        />
                      </div>
                    </div>
                    <p className="small text-muted mb-0">
                      Used to deliver personalized ads and track campaign performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3 justify-content-end">
              <button
                className="btn btn-secondary"
                onClick={() => setShowSettings(false)}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
