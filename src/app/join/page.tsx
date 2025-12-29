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
            setLoading(false);
        }

        function onError(err: any) {
            console.error("Socket error:", err);
            setLoading(false);
        }

        socket.on("connect", onConnect);
        socket.on("connect_error", onError);

        // Proactively connect to wake up Render server
        if (!socket.connected) {
            socket.connect();
        }

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
        const cleanPin = pin.trim().replace(/\s+/g, "");
        const cleanName = name.trim();

        if (!cleanPin || !cleanName) {
            alert("Please enter both a PIN and your alias.");
            return;
        }

        setLoading(true);

        // Define handlers first so we can use them in listeners
        const handleJoined = (data: any) => {
            console.log("Player joined event received:", data);
            // On mobile, socket.id might be tricky, so we check if the ID matches 
            // OR if the name matches and we are the one who just joined (loading state)
            if (data.id === socket.id || (data.name === cleanName && loading)) {
                console.log("Successfully joined!");
                localStorage.setItem(`quiz_name_${cleanPin}`, cleanName);
                localStorage.setItem(`quiz_avatar_${cleanPin}`, avatarUrl);
                cleanup();
                setLoading(false);
                router.push(`/game/${cleanPin}`);
            }
        };

        const handleRoomState = (data: any) => {
            console.log("Room state received, assuming join successful:", data);
            localStorage.setItem(`quiz_name_${cleanPin}`, cleanName);
            localStorage.setItem(`quiz_avatar_${cleanPin}`, avatarUrl);
            cleanup();
            setLoading(false);
            router.push(`/game/${cleanPin}`);
        };

        const handleError = (data: any) => {
            alert(data.message);
            setLoading(false);
            cleanup();
        };

        const cleanup = () => {
            socket.off('player-joined', handleJoined);
            socket.off('room-state', handleRoomState);
            socket.off('error', handleError);
            if (joinTimeout) clearTimeout(joinTimeout);
        };

        // High timeout for mobile & Render Free Tier cold starts
        const joinTimeout = setTimeout(() => {
            setLoading(false);
            cleanup();
            alert("The Arena is waking up! This usually takes 45-60 seconds on the first try. Please wait 10 seconds and tap 'Enter Game' again. Once the light turns green, it will be fast!");
        }, 60000);

        // Set up listeners BEFORE emitting
        socket.on('player-joined', handleJoined);
        socket.on('room-state', handleRoomState);
        socket.on('error', handleError);

        if (!socket.connected) {
            socket.connect();
        }

        // Emit join event with avatar
        socket.emit('join-quiz', {
            quizId: cleanPin,
            playerName: cleanName,
            avatar: avatarUrl
        });
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
        <div className="min-h-screen flex flex-col justify-start sm:justify-center items-center p-4 relative overflow-y-auto bg-[#0f172a]">
            {/* Background Effects */}
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-600/10 rounded-full blur-[80px] sm:blur-[120px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-md py-4 sm:absolute sm:top-8 sm:left-8 z-20"
            >
                <Link href="/" className="group inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-indigo-400/50 rounded-xl transition-all text-slate-400 hover:text-white">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Home</span>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10 mb-8 sm:mb-0"
            >
                <div className="glass-card p-6 sm:p-10 md:p-12 border-indigo-500/10 shadow-2xl shadow-indigo-500/10">
                    <div className="text-center mb-6 sm:mb-8">
                        {/* Avatar Selector */}
                        <div className="relative inline-block mb-4 sm:mb-6 group">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                            <div className="relative h-20 w-20 sm:h-28 sm:w-28 bg-slate-800 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
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
                                    className="absolute bottom-1 right-1 h-7 w-7 sm:h-8 sm:w-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 active:rotate-180"
                                    title="Change Profile Picture"
                                >
                                    <RefreshCw size={12} />
                                </button>
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-gradient font-heading tracking-tight mb-1">Join Arena</h1>
                        <p className="text-slate-500 text-[10px] sm:text-sm">Enter your details to enter the field.</p>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-4 sm:space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Game PIN</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        placeholder="000000"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-base sm:text-xl tracking-[0.4em] sm:tracking-[0.3em]"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="group px-4 sm:px-5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition-all flex items-center justify-center"
                                    title="Scan QR Code"
                                >
                                    <Camera size={20} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Your Alias</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Player One"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-base sm:text-lg font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn-primary py-4 sm:py-5 mt-2 text-base sm:text-lg group ${loading ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Entering Arena...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span>Enter Game</span>
                                    <Play size={18} className="group-hover:translate-x-1 transition-transform" />
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
