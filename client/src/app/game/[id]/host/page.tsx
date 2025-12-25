"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Users, Trophy, Play, ChevronRight, Crown, Star, ArrowLeft, Download, Layout } from "lucide-react";

export default function HostGameView() {
    const params = useParams();
    const quizId = params.id as string;
    const [players, setPlayers] = useState<any[]>([]);
    const [status, setStatus] = useState<'LOBBY' | 'ACTIVE' | 'ENDED'>('LOBBY');
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [stats, setStats] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        if (!socket.connected) socket.connect();

        // Request initial state in case of refresh
        socket.emit('get-room-state', { quizId });

        const onRoomState = (data: any) => {
            if (data.participants) setPlayers(data.participants);
            if (data.state === 'ACTIVE') setStatus('ACTIVE');
            if (data.state === 'ENDED') setStatus('ENDED');
        };

        const onPlayerJoined = (data: any) => {
            if (data.players) {
                setPlayers(data.players);
            } else {
                setPlayers(prev => [...prev.filter(p => p.id !== data.id), { id: data.id, name: data.name }]);
            }
        };

        const onPlayerLeft = (data: any) => {
            if (data.players) {
                setPlayers(data.players);
            } else {
                setPlayers(prev => prev.filter(p => p.id !== data.id));
            }
        };

        const onNewQuestion = (data: any) => {
            setCurrentQuestion(data);
            setCurrentQIndex(data.index);
            setAnsweredCount(0);
            setIsRevealed(false);
            setStats([]);
        };

        const onAnswered = (data: { count: number, total: number }) => {
            setAnsweredCount(data.count);
        };

        const onResults = (data: any) => {
            setIsRevealed(true);
            setStats(data.stats);
        };

        const onQuizEnded = (data: { leaderboard: any[] }) => {
            setStatus('ENDED');
            setLeaderboard(data.leaderboard);
        };

        socket.on('room-state', onRoomState);
        socket.on('player-joined', onPlayerJoined);
        socket.on('player-left', onPlayerLeft);
        socket.on('new-question', onNewQuestion);
        socket.on('participant-answered', onAnswered);
        socket.on('question-results', onResults);
        socket.on('quiz-ended', onQuizEnded);

        return () => {
            socket.off('room-state', onRoomState);
            socket.off('player-joined', onPlayerJoined);
            socket.off('player-left', onPlayerLeft);
            socket.off('new-question', onNewQuestion);
            socket.off('participant-answered', onAnswered);
            socket.off('question-results', onResults);
            socket.off('quiz-ended', onQuizEnded);
        };
    }, []);

    const startQuiz = () => {
        socket.emit('start-quiz', { quizId });
        setStatus('ACTIVE');
    };

    const revealResults = () => {
        socket.emit('reveal-results', { quizId, questionIndex: currentQIndex });
    };

    const nextQuestion = () => {
        const nextIdx = currentQIndex + 1;
        socket.emit('next-question', { quizId, questionIndex: nextIdx });
    };

    if (status === 'LOBBY') {
        return (
            <div className="min-h-screen flex flex-col p-12 bg-[#0f172a] text-white relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />

                <header className="flex justify-between items-start mb-20 relative z-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 font-bold text-sm uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Live Arena Open
                        </div>
                        <h2 className="text-2xl text-slate-400 font-medium">Participants join with code:</h2>
                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-9xl font-black tracking-tighter text-indigo-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                        >
                            {quizId}
                        </motion.h1>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startQuiz}
                        disabled={players.length === 0}
                        className={`group flex flex-col items-center gap-4 ${players.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                        <div className="w-32 h-32 bg-white text-indigo-900 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_70px_rgba(255,255,255,0.5)] transition-all">
                            <Play size={48} fill="currentColor" className="translate-x-1" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-widest text-white">{players.length} Players Ready</span>
                    </motion.button>
                </header>

                <main className="flex-1 relative z-10">
                    <AnimatePresence>
                        <motion.div
                            layout
                            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
                        >
                            {players.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass-card p-6 text-center border-indigo-500/10 group hover:border-indigo-500/40"
                                >
                                    <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mb-4 flex items-center justify-center font-black text-2xl shadow-lg group-hover:rotate-12 transition-transform text-white">
                                        {p.name ? p.name[0].toUpperCase() : '?'}
                                    </div>
                                    <p className="font-bold text-lg truncate group-hover:text-indigo-300 transition-colors text-white">{p.name || 'Anonymous'}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {players.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                            <Users size={80} className="mb-6" />
                            <p className="text-3xl font-medium tracking-tight">Awaiting combatants to join the field...</p>
                        </div>
                    )}
                </main>

                <footer className="mt-12 pt-8 border-t border-white/5 text-slate-500 text-sm font-medium flex justify-between items-center relative z-10">
                    <p>© 2025 TechNexus AI Arena • Real-time Interactive System</p>
                    <div className="flex gap-6">
                        <span>Low Latency Mode</span>
                        <span className="text-indigo-400 font-bold">Stable Connection</span>
                    </div>
                </footer>
            </div>
        );
    }

    if (status === 'ENDED') {
        return (
            <div className="min-h-screen flex flex-col p-12 bg-[#0f172a] text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

                <header className="text-center mb-16 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-400 font-black text-sm uppercase tracking-[0.3em] mb-6"
                    >
                        <Trophy size={18} fill="currentColor" />
                        Arena Results
                    </motion.div>
                    <h1 className="text-7xl font-black font-heading text-gradient tracking-tighter">
                        Final Standings
                    </h1>
                </header>

                <main className="max-w-4xl mx-auto w-full space-y-4 relative z-10">
                    <AnimatePresence>
                        {leaderboard.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-card flex items-center justify-between p-8 ${i === 0 ? 'bg-yellow-500/10 border-yellow-500/30 scale-105 z-20' :
                                    i === 1 ? 'bg-slate-300/10 border-slate-300/30' :
                                        i === 2 ? 'bg-orange-600/10 border-orange-600/30' : 'bg-white/5 border-white/5 opacity-80'
                                    }`}
                            >
                                <div className="flex items-center gap-8">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl transition-transform hover:rotate-6 ${i === 0 ? 'bg-yellow-500 text-yellow-950 ring-4 ring-yellow-500/20' :
                                        i === 1 ? 'bg-slate-300 text-slate-900' :
                                            i === 2 ? 'bg-orange-600 text-orange-950' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {i === 0 ? <Crown fill="currentColor" size={32} /> : i + 1}
                                    </div>
                                    <div>
                                        <span className={`text-4xl font-black font-heading tracking-tight ${i === 0 ? 'text-yellow-400' : 'text-white'}`}>{p.name}</span>
                                        {i === 0 && <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mt-1">Universal Champion</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-black font-mono text-indigo-400 leading-none">
                                        {p.score.toLocaleString()}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 block">Accumulated Pts</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {leaderboard.length === 0 && (
                        <div className="text-center py-20 text-slate-600 font-medium italic text-2xl">
                            The arena was empty this session.
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="pt-20 text-center"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={() => {
                                    const csv = [
                                        ["Rank", "Name", "Score"],
                                        ...leaderboard.map(p => [p.rank, p.name, p.score])
                                    ].map(e => e.join(",")).join("\n");
                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.setAttribute('hidden', '');
                                    a.setAttribute('href', url);
                                    a.setAttribute('download', `quiz_results_${quizId}.csv`);
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                }}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                            >
                                <Download size={20} />
                                Export Results (CSV)
                            </button>
                            <Link href="/admin" className="btn-secondary inline-flex px-12 py-5 text-xl font-black uppercase tracking-widest group">
                                <ArrowLeft className="group-hover:-translate-x-2 transition-transform" />
                                Dismiss Arena
                            </Link>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col p-12 bg-[#0f172a] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

            <header className="flex justify-between items-center mb-12 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/30">
                        <Layout className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-heading tracking-tight italic uppercase">Question <span className="text-indigo-400">{currentQIndex + 1}</span></h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Live Arena Hub</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-4xl font-black text-indigo-400">{answeredCount}/{players.length}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Responses Received</span>
                    </div>
                    {!isRevealed ? (
                        <button
                            onClick={revealResults}
                            className="bg-purple-600 hover:bg-purple-500 px-8 py-4 text-lg font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center gap-2"
                        >
                            Reveal Results
                            <Star size={20} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            onClick={nextQuestion}
                            className="btn-primary px-8 py-4 text-lg font-black uppercase tracking-widest transition-all group flex items-center gap-2"
                        >
                            Next Question
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center relative z-10 max-w-5xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {!isRevealed ? (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full text-center space-y-12"
                        >
                            <h2 className="text-6xl font-black leading-tight font-heading">
                                {currentQuestion?.question || "Loading question..."}
                            </h2>

                            <div className="grid grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
                                {currentQuestion?.options.map((opt: string, i: number) => {
                                    const colors = ['border-blue-500/30 text-blue-400', 'border-purple-500/30 text-purple-400', 'border-amber-500/30 text-amber-400', 'border-emerald-500/30 text-emerald-400'];
                                    return (
                                        <div key={i} className={`p-6 bg-white/5 border rounded-2xl text-left text-xl font-bold flex items-center gap-4 ${colors[i % 4]}`}>
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-black">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            {opt}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-8">
                                <div className="h-2 bg-slate-800 w-64 rounded-full overflow-hidden mx-auto">
                                    <motion.div
                                        className="h-full bg-indigo-500"
                                        animate={{ width: [`${(answeredCount / (players.length || 1)) * 100}%`] }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-4 font-mono animate-pulse">Waiting for participants to lock in answers...</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full space-y-12"
                        >
                            <div className="text-center">
                                <h3 className="text-indigo-400 font-black uppercase tracking-[0.5em] text-sm mb-4">Round Results</h3>
                                <h2 className="text-5xl font-black font-heading leading-tight mb-12">{currentQuestion?.question}</h2>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="inline-block px-12 py-8 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.15)] mb-16"
                                >
                                    <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Correct Answer</p>
                                    <p className="text-5xl font-black text-white">{currentQuestion?.options[currentQuestion?.correctAnswer]}</p>
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto w-full pb-20">
                                {stats.map((s, i) => {
                                    const isCorrect = s.index === currentQuestion?.correctAnswer;
                                    return (
                                        <div key={i} className={`relative h-24 rounded-2xl border transition-all overflow-hidden flex items-center px-10 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10'}`}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${s.percent}%` }}
                                                className={`absolute left-0 top-0 h-full opacity-20 ${isCorrect ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            />
                                            <div className="relative z-10 flex justify-between w-full items-center">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${isCorrect ? 'bg-emerald-500 text-emerald-950' : 'bg-white/10 text-white'}`}>
                                                        {isCorrect ? <CheckCircle2 size={24} /> : String.fromCharCode(65 + i)}
                                                    </div>
                                                    <span className={`text-2xl font-bold ${isCorrect ? 'text-emerald-400' : 'text-white'}`}>{currentQuestion?.options[i]}</span>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className={`text-4xl font-black font-mono ${isCorrect ? 'text-emerald-400' : 'text-indigo-300'}`}>{s.percent}%</span>
                                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{s.count} pts</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
