import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.Pusher = Pusher;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
window.axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
window.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

window.Echo = new Echo({
	broadcaster: 'reverb',
	key: import.meta.env.VITE_REVERB_APP_KEY,
	wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
	wsPort: import.meta.env.VITE_REVERB_PORT ?? 6001,
	wssPort: import.meta.env.VITE_REVERB_PORT ?? 6001,
	forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
	authEndpoint: '/broadcasting/auth',
	withCredentials: true,
	authorizer: (channel, options) => {
		return {
			authorize: (socketId, callback) => {
				window.axios
					.post(options.authEndpoint, {
						socket_id: socketId,
						channel_name: channel.name,
					})
					.then((response) => {
						callback(null, response.data);
					})
					.catch((error) => {
						callback(error);
					});
			},
		};
	},
	enabledTransports: ['ws', 'wss'],
});
