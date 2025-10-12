import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import App from './App';
import store from './redux/store';
import 'bootstrap/dist/css/bootstrap.min.css';

const container = document.getElementById('root');
const root = createRoot(container);

const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID || process.env.REACT_APP_PAYPAL_SANDBOX_ID || 'test';

root.render(
	<PayPalScriptProvider
		options={{
			'client-id': paypalClientId,
			currency: 'USD',
			intent: 'capture',
			components: 'buttons',
		}}
	>
		<Provider store={store}>
			<App />
		</Provider>
	</PayPalScriptProvider>
);
