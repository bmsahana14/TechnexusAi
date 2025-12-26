import { io } from "socket.io-client";

// effectively a singleton for the socket connection
// In development, Next.js can hot reload and cause multiple connections
// We want to avoid that if possible, but for a global object usually this works.

let URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// Ensure URL has a protocol (Render internal host might just be the service name)
if (URL && !URL.startsWith('http')) {
    URL = `https://${URL}`;
}

console.log("Connecting to Socket Arena at:", URL);

export const socket = io(URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
});
