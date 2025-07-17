import ReconnectingWebSocket from "reconnecting-websocket";

export function createSocket(): ReconnectingWebSocket {
	const socket = new ReconnectingWebSocket(
		`ws://${window.location.hostname}:8001`
	);

	return socket;
}
