/*import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

*/

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Import Redux Provider
import store from "./redux/store.js"; // Import your Redux store
//import "./index.css";
import App from "./App.js";
import AuthProvider from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}> {/* Wrap your app with Provider */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);

