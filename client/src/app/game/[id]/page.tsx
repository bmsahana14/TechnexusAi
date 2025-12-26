"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Trophy, Star, ArrowRight, Loader2, CheckCircle2, Layout, Award } from "lucide-react";

export default function PlayerGameView() {
    const params = useParams();
    const quizId = params.id as string;
    const [status, setStatus] = useState<'WAITING' | 'ACTIVE' | 'ENDED'>('WAITING');
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [duration, setDuration] = useState(30);
    const [resultData, setResultData] = useState<any>(null); // To store answer reveal data

    useEffect(() => {
        if (status === 'ACTIVE' && !hasAnswered && timeLeft > 0 && !resultData) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !hasAnswered && !resultData) {
            handleAnswer(-1);
        }
    }, [timeLeft, status, hasAnswered, resultData]);

    useEffect(() => {
        if (!socket.connected) socket.connect();

        // Auto-rejoin if we have a name stored (handles refreshes)
        const savedName = localStorage.getItem(`quiz_name_${quizId}`);
        const savedAvatar = localStorage.getItem(`quiz_avatar_${quizId}`);
        if (savedName) {
            socket.emit('join-quiz', {
                quizId,
                playerName: savedName,
                avatar: savedAvatar || ""
            });
        }

        // Request state on mount/refresh
        socket.emit('get-room-state', { quizId });

        const onRoomState = (data: any) => {
            if (data.state === 'ACTIVE') setStatus('ACTIVE');
            if (data.state === 'ENDED') setStatus('ENDED');
        };

        const onQuizStarted = (data: any) => {
            setStatus('ACTIVE');
            setTimeLeft(30);
        };

        const onNewQuestion = (data: any) => {
            setCurrentQuestion({
                q: data.question,
                options: data.options,
                index: data.index
            });
            setHasAnswered(false);
            setSelectedIdx(null);
            setResultData(null);
            const limit = data.timeLimit || 30;
            setTimeLeft(limit);
            setDuration(limit);
        };

        const onResults = (data: any) => {
            setResultData(data);
        };

        const onQuizEnded = (data: { leaderboard: any[] }) => {
            setStatus('ENDED');
            setLeaderboard(data.leaderboard);
            const myData = data.leaderboard.find((p: any) => p.id === socket.id);
            if (myData) setScore(myData.score);
        };

        socket.on('room-state', onRoomState);
        socket.on('quiz-started', onQuizStarted);
        socket.on('new-question', onNewQuestion);
        socket.on('question-results', onResults);
        socket.on('quiz-ended', onQuizEnded);

        return () => {
            socket.off('room-state', onRoomState);
            socket.off('quiz-started', onQuizStarted);
            socket.off('new-question', onNewQuestion);
            socket.off('question-results', onResults);
            socket.off('quiz-ended', onQuizEnded);
        };
    }, []);

    const handleAnswer = (index: number) => {
        if (hasAnswered) return;
        setHasAnswered(true);
        setSelectedIdx(index);
        socket.emit('submit-answer', {
            quizId,
            questionIndex: currentQuestion.index,
            answerIndex: index,
            timeRemaining: timeLeft
        });
    };

    if (status === 'WAITING') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow font-heading" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-12 text-center max-w-md w-full border-indigo-500/10"
                >
                    <div className="h-24 w-24 bg-slate-800 rounded-3xl flex items-center justify-center overflow-hidden mx-auto mb-8 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
                        {typeof window !== 'undefined' && localStorage.getItem(`quiz_avatar_${quizId}`) ? (
                            <img
                                src={localStorage.getItem(`quiz_avatar_${quizId}`) || ""}
                                alt="Your Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Loader2 size={40} className="animate-spin text-indigo-400" />
                        )}
                    </div>

                    <h1 className="text-4xl font-black mb-3 font-heading tracking-tight">You're In!</h1>
                    <p className="text-slate-400 mb-10 leading-relaxed font-medium">Sit tight, the battle for the top spot is about to begin.</p>

                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 mb-8 inline-block px-8">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-2 leading-none">Registered Room</p>
                        <p className="text-3xl font-black font-mono text-indigo-400 tracking-widest">{quizId}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-slate-500 animate-pulse">
                        <Award size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Waiting for Host</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (status === 'ACTIVE' && currentQuestion) {
        if (resultData) {
            const isCorrect = selectedIdx === resultData.correctAnswer;
            const correctText = currentQuestion.options[resultData.correctAnswer];

            return (
                <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-1000 ${isCorrect ? 'bg-emerald-950' : 'bg-slate-900'}`}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center max-w-2xl w-full"
                    >
                        <div className="mb-8 relative">
                            <div className={`text-9xl mb-4 animate-bounce`}>
                                {isCorrect ? '🔥' : '🙊'}
                            </div>
                            <h2 className={`text-6xl font-black font-heading uppercase tracking-tighter ${isCorrect ? 'text-emerald-400' : 'text-amber-500'}`}>
                                {isCorrect ? 'ELITE!' : 'ALMOST!'}
                            </h2>
                            <p className="text-white/60 font-bold uppercase tracking-widest mt-2">
                                {isCorrect ? 'You nailed it!' : 'Try to focus on the next one!'}
                            </p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-8 shadow-xl">
                            <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-4">Correct Answer Was</p>
                            <p className={`text-3xl font-black ${isCorrect ? 'text-emerald-400' : 'text-white'}`}>{correctText}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 w-full opacity-60 mb-8">
                            {resultData.stats.map((s: any, i: number) => (
                                <div key={i} className="relative h-12 bg-white/5 rounded-xl border border-white/5 overflow-hidden flex items-center px-4">
                                    <div
                                        className={`absolute left-0 top-0 h-full ${i === resultData.correctAnswer ? 'bg-emerald-500/20' : 'bg-white/5'}`}
                                        style={{ width: `${s.percent}%` }}
                                    />
                                    <div className="relative z-10 flex justify-between w-full items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="truncate pr-4">{currentQuestion.options[i]}</span>
                                        <span>{s.percent}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Leaderboard Section */}
                        {resultData.leaderboard && resultData.leaderboard.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8 shadow-xl"
                            >
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Trophy size={18} className="text-yellow-400" />
                                    <p className="text-xs font-black text-white/60 uppercase tracking-[0.3em]">Live Leaderboard</p>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                    {resultData.leaderboard.map((player: any, idx: number) => {
                                        const isMe = player.id === socket.id;
                                        return (
                                            <div
                                                key={player.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isMe ? 'bg-indigo-500/20 border border-indigo-500/40' : 'bg-white/5'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-500 text-yellow-950' :
                                                        idx === 1 ? 'bg-slate-300 text-slate-900' :
                                                            idx === 2 ? 'bg-orange-600 text-orange-950' :
                                                                'bg-slate-700 text-slate-300'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                                                    {player.avatar ? (
                                                        <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-sm text-white">
                                                            {player.name ? player.name[0].toUpperCase() : '?'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-bold text-sm truncate ${isMe ? 'text-indigo-300' : 'text-white'}`}>
                                                        {player.name} {isMe && '(You)'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-lg text-indigo-400">{player.score}</p>
                                                    <p className="text-[8px] text-slate-500 uppercase tracking-wider">pts</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        <div className="mt-8 flex flex-col items-center gap-2">
                            <div className="h-1.5 w-12 bg-white/20 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-white" animate={{ x: [-48, 48] }} transition={{ repeat: Infinity, duration: 1.5 }} />
                            </div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Syncing with Arena Host</p>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex flex-col p-6 bg-[#0f172a] text-white overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full"
                    >
                        <div className="glass-card mb-10 p-10 text-center relative overflow-hidden border-white/5">
                            {/* Liquid Progress Bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
                                <motion.div
                                    className={`h-full ${timeLeft <= 5 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`}
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(timeLeft / duration) * 100}%` }}
                                    transition={{ duration: 1, ease: "linear" }}
                                />
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 text-white">
                                    <span className="text-[10px] font-black font-mono text-slate-500 uppercase">Step</span>
                                    <span className="text-xs font-black font-mono text-indigo-400">{currentQuestion.index + 1}</span>
                                </div>

                                <div className={`flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border ${timeLeft <= 5 ? 'border-red-500/30 text-red-400' : 'border-indigo-500/30 text-indigo-400'} transition-colors`}>
                                    <Timer size={14} className={timeLeft <= 5 ? 'animate-pulse' : ''} />
                                    <span className="text-sm font-black font-mono tracking-wider">{timeLeft}s</span>
                                </div>
                            </div>

                            <h2 className="text-3xl font-black font-heading leading-tight">{currentQuestion.q}</h2>
                        </div>

                        <div className={`grid grid-cols-1 gap-4 transition-all duration-500 ${hasAnswered ? 'opacity-40 grayscale-[0.3]' : ''}`}>
                            {currentQuestion.options.map((opt: string, i: number) => {
                                const colors = [
                                    'from-blue-600/20 to-blue-500/10 border-blue-500/30 hover:border-blue-400',
                                    'from-purple-600/20 to-purple-500/10 border-purple-500/30 hover:border-purple-400',
                                    'from-amber-600/20 to-amber-500/10 border-amber-500/30 hover:border-amber-400',
                                    'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 hover:border-emerald-400'
                                ];
                                const isSelected = selectedIdx === i;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        disabled={hasAnswered}
                                        className={`group relative p-6 bg-gradient-to-br ${colors[i % 4]} rounded-2xl border transition-all text-left active:scale-95 overflow-hidden ${isSelected ? 'ring-2 ring-white scale-[1.02]' : ''}`}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="h-8 w-8 rounded-lg bg-black/20 flex items-center justify-center font-black text-sm group-hover:bg-white/10 transition-colors text-white">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">{opt}</span>
                                        </div>
                                        <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 group-hover:opacity-10 transition-opacity">
                                            <Star size={40} fill="currentColor" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {hasAnswered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-12 text-center"
                            >
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-ping" />
                                    <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em]">Answer Locked • Waiting for Reveal</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    if (status === 'ENDED') {
        const myRank = leaderboard.findIndex(p => p.id === socket.id) + 1;

        return (
            <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px] animate-pulse-slow" />

                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="glass-card p-12 text-center max-w-md w-full relative z-10 border-white/5"
                >
                    <div className="mb-10 text-center relative">
                        {myRank === 1 ? (
                            <div className="relative inline-block">
                                <Trophy size={80} className="text-yellow-400 mb-6 mx-auto drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" fill="currentColor" />
                                <motion.div
                                    className="absolute -top-2 -right-2 text-3xl"
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    ✨
                                </motion.div>
                            </div>
                        ) : (
                            <Award size={80} className="text-indigo-400 mb-6 mx-auto drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" fill="currentColor" />
                        )}
                        <h1 className="text-5xl font-black font-heading tracking-tighter text-gradient leading-tight">
                            {myRank === 1 ? "ELITE" : "FINISHED"}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mt-2">Arena Session Complete</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Rank</p>
                            <p className="text-4xl font-black text-white">#{myRank}</p>
                        </div>

                        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Score</p>
                            <p className="text-4xl font-black text-indigo-400">{score.toLocaleString()}</p>
                        </div>
                    </div>

                    <Link href="/" className="btn-primary w-full py-5 text-xl group">
                        Back to Hub
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return null;
}
