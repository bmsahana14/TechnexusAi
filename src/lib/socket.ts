import { io } from "socket.io-client";

// effectively a singleton for the socket connection
// In development, Next.js can hot reload and cause multiple connections
// We want to avoid that if possible, but for a global object usually this works.

let URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

// Ensure URL has a protocol and uses HTTPS on production/secure origins
if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:' && URL.startsWith('http:')) {
        URL = URL.replace('http:', 'https:');
    }
}

if (URL && !URL.startsWith('http')) {
    URL = `https://${URL}`;
}

console.log("Connecting to Socket Arena at:", URL, "(Waking up... this might take a moment due to Render Free Tier cold start)");

export const socket = io(URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 60, // Increased from 20. Try for ~2 minutes (60 * 2s)
    reconnectionDelay: 2000,
    transports: ['websocket', 'polling'],
    timeout: 120000 // Increased from 60 seconds. 2 minutes for Render spin-up
});
