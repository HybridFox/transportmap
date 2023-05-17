import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { ThemeProvider } from 'styled-components';

import { i18n } from './services/i18n.service';
import App from './App';

import './assets/scss/index.scss';
import 'ol/ol.css';

window.global = {} as any;

Sentry.init({
	dsn: 'https://6044c441b3114b28baf632380418c3d2@o4505149251059712.ingest.sentry.io/4505149955964928',
	integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
	// Performance Monitoring
	tracesSampleRate: 1.0,
	// Session Replay
	replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const ROUTE = "/:locale"
const router = createBrowserRouter([
	{
		path: '/',
		element: <Navigate replace to={i18n.languages[0]}/>
	},
	{
		path: `${ROUTE}/`,
		element: <App />,
	},
	{
		path: `${ROUTE}/trips/:tripId`,
		element: <App />,
	},
]);

const theme = {
	main: {
		primary: '#ffa515',
		secondary: '#ff874b',
		success: '#63CC2E',
		info: '#2D92FF',
		warning: '#FFAA2B',
		danger: '#FF608B'
	}
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	// <React.StrictMode>
	<ThemeProvider theme={theme}>
		<RouterProvider router={router} />
	</ThemeProvider>,
	// </React.StrictMode>,
);
