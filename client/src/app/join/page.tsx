"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { motion } from "framer-motion";
import { ArrowLeft, User, Hash, Loader2, Play } from "lucide-react";

export default function JoinQuiz() {
    const [pin, setPin] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Listen for connection events if needed
        function onConnect() {
            console.log("Connected to socket server");
        }

        function onError(err: any) {
            console.error("Socket error:", err);
            setLoading(false);
            // alert("Failed to connect to server");
        }

        socket.on("connect", onConnect);
        socket.on("connect_error", onError);

        // Cleanup
        return () => {
            socket.off("connect", onConnect);
            socket.off("connect_error", onError);
        };
    }, []);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!socket.connected) {
            socket.connect();
        }

        // Emit join event
        // The server expects 'join-quiz' with { quizId, playerName }
        socket.emit('join-quiz', { quizId: pin, playerName: name });

        // Listening for immediate feedback
        const handleJoined = (data: any) => {
            // We check if the joined player is us based on name? 
            // Ideally server sends a specific response to the socket, 
            // but for now relying on the broadcast 'player-joined' event works if names are unique-ish
            // Better: check if data.id === socket.id
            if (data.id === socket.id) {
                console.log("Successfully joined!");
                localStorage.setItem(`quiz_name_${pin}`, name); // Persist name
                socket.off('player-joined', handleJoined);
                socket.off('error', handleError);
                setLoading(false);
                router.push(`/game/${pin}`);
            }
        };

        const handleError = (data: any) => {
            alert(data.message);
            setLoading(false);
            socket.off('player-joined', handleJoined);
            socket.off('error', handleError);
        };

        socket.on('player-joined', handleJoined);
        socket.on('error', handleError);

        // Timeout fallback
        setTimeout(() => {
            if (loading) {
                setLoading(false);
                socket.off('player-joined', handleJoined);
                socket.off('error', handleError);
                // Don't alert here if it just worked very fast, but if state is still loading...
                // alert("Request timed out or no response.");
            }
        }, 5000);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-[#0f172a]">
            {/* Enhanced Background Effects */}
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.15, 0.1]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]"
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.1, 0.12, 0.1]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-8 left-8 z-20"
            >
                <Link href="/" className="group inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-indigo-400/50 rounded-xl transition-all text-slate-400 hover:text-white">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card p-10 md:p-12 border-indigo-500/10">
                    <motion.div
                        className="text-center mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                            <div className="relative h-20 w-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                                <Play fill="currentColor" size={32} className="translate-x-0.5" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-black text-gradient mb-3 font-heading tracking-tight">Join Arena</h1>
                        <p className="text-slate-400 text-lg">Enter the battle PIN to start competing.</p>
                    </motion.div>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Game PIN</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="000 000"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xl tracking-[0.3em]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Your Alias</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Player One"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-lg font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary py-5 mt-4 text-lg group ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    Enter Game
                                    <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
                        <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                            Live Competition • Powered by TechNexus AI
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
