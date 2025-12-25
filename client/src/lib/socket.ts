import { io } from "socket.io-client";

// effectively a singleton for the socket connection
// In development, Next.js can hot reload and cause multiple connections
// We want to avoid that if possible, but for a global object usually this works.

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const socket = io(URL, {
    autoConnect: false, // We will connect explicitly when needed (or inside a Provider)
    reconnection: true,
});
