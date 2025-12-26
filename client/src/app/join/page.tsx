"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Hash, Loader2, Play, RefreshCw, Camera, X } from "lucide-react";
import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("@/components/QRScanner"), { ssr: false });

export default function JoinQuiz() {
    const [pin, setPin] = useState("");
    const [name, setName] = useState("");
    const [avatarSeed, setAvatarSeed] = useState("");
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check for PIN in URL parameters
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const pinFromUrl = urlParams.get('pin');
            if (pinFromUrl) {
                setPin(pinFromUrl);
            }
        }

        // Generate a random seed on mount
        setAvatarSeed(Math.random().toString(36).substring(7));

        function onConnect() {
            console.log("Connected to socket server");
        }

        function onError(err: any) {
            console.error("Socket error:", err);
            setLoading(false);
        }

        socket.on("connect", onConnect);
        socket.on("connect_error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("connect_error", onError);
        };
    }, []);

    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

    const handleShuffleAvatar = () => {
        setAvatarSeed(Math.random().toString(36).substring(7));
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!socket.connected) {
            socket.connect();
        }

        // Emit join event with avatar
        socket.emit('join-quiz', {
            quizId: pin,
            playerName: name,
            avatar: avatarUrl
        });

        const handleJoined = (data: any) => {
            if (data.id === socket.id) {
                console.log("Successfully joined!");
                localStorage.setItem(`quiz_name_${pin}`, name);
                localStorage.setItem(`quiz_avatar_${pin}`, avatarUrl);
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

        setTimeout(() => {
            if (loading) {
                setLoading(false);
                socket.off('player-joined', handleJoined);
                socket.off('error', handleError);
            }
        }, 5000);
    };

    const handleScan = (decodedText: string) => {
        try {
            // Extract PIN from URL
            const url = new URL(decodedText);
            const pinFromQR = url.searchParams.get('pin');
            if (pinFromQR) {
                setPin(pinFromQR);
                setShowScanner(false);
            }
        } catch (err) {
            console.error("Invalid QR code:", err);
            alert("Invalid QR code. Please try again or enter the code manually.");
            setShowScanner(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden bg-[#0f172a]">
            {/* Background Effects */}
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]"
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.12, 0.1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
                    <div className="text-center mb-10">
                        {/* Avatar Selector */}
                        <div className="relative inline-block mb-6 group">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                            <div className="relative h-28 w-28 bg-slate-800 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={avatarSeed}
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                        initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        exit={{ scale: 1.5, opacity: 0, rotate: 20 }}
                                        transition={{ type: "spring", damping: 12 }}
                                    />
                                </AnimatePresence>
                                <button
                                    onClick={handleShuffleAvatar}
                                    type="button"
                                    className="absolute bottom-1 right-1 h-8 w-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 active:rotate-180"
                                    title="Change Profile Picture"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                            <div className="mt-3">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Pick your character</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-gradient font-heading tracking-tight mb-2">Join Arena</h1>
                        <p className="text-slate-500 text-sm">Every player needs a unique look.</p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Game PIN</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
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
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="group px-5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition-all flex items-center justify-center"
                                    title="Scan QR Code"
                                >
                                    <Camera size={24} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                </button>
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
                                <div className="flex items-center gap-3">
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Entering Arena...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span>Enter Game</span>
                                    <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>

            {/* QR Scanner Modal */}
            {showScanner && (
                <QRScanner
                    onScan={handleScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
