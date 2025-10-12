import React, { useState } from 'react';
import api from '../../services/api';
import { storeAuth } from '../../utils/auth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      if (data.accessToken) {
        storeAuth({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        window.location.href = '/';
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 480 }}>
      <h1 className="h4 mb-3">Create account</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input className="form-control" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button className="btn btn-primary" type="submit">Sign up</button>
      </form>
    </div>
  );
}
