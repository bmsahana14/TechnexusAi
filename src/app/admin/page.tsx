"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import {
    Upload, FileText, CheckCircle2, Layout, LogOut,
    ChevronLeft, Plus, Users, Zap, Trash2, Download,
    Play, Activity, Settings, BarChart3, Search,
    Clock, Copy, ExternalLink, MoreVertical, ShieldCheck,
    Globe, BrainCircuit, AlertCircle, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, memo, useMemo, useCallback } from "react";

export default function AdminDashboard() {
    const [view, setView] = useState<'DASHBOARD' | 'REVIEW' | 'MY_QUIZZES' | 'ANALYTICS' | 'SETTINGS'>('DASHBOARD');
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
    const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [questionTimer, setQuestionTimer] = useState<number>(30);
    const [quizTitle, setQuizTitle] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [realtimeStats, setRealtimeStats] = useState({ activeQuizzes: 0, totalParticipants: 0 });
    const [activityLog, setActivityLog] = useState<any[]>([
        { id: 'initial', text: "Admin session started", time: "Just now", type: "system" }
    ]);
    const [showSupabaseWarning, setShowSupabaseWarning] = useState(true);
    const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

    const router = useRouter();

    const fetchRealtimeStats = async () => {
        try {
            const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
            const response = await fetch(`${url}/stats`);
            if (response.ok) {
                const data = await response.json();
                setRealtimeStats({
                    activeQuizzes: data.activeQuizzes,
                    totalParticipants: data.totalParticipants
                });
            }
        } catch (err) {
            console.error("Failed to fetch real-time stats:", err);
        }
    };

    const fetchQuizzes = useCallback(async (userId: string) => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('creator_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching quizzes from Supabase:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }

        // Load local quizzes for demo/unsaved state
        const localQuizzes = JSON.parse(localStorage.getItem('technexus_local_quizzes') || '[]');

        if (!error && data) {
            // Filter out local quizzes that have the same room_id as any remote quiz
            // This prevents duplicates where one is the local copy and one is the DB copy
            const remoteRoomIds = new Set(data.map(q => q.room_id));
            const uniqueLocalQuizzes = localQuizzes.filter((q: any) => !remoteRoomIds.has(q.room_id));

            const allQuizzes = [...uniqueLocalQuizzes, ...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Final safety filter for uniqueness by ID
            const uniqueQuizzes = Array.from(new Map(allQuizzes.map(item => [item.id, item])).values());

            setRecentQuizzes(uniqueQuizzes);
        } else {
            setRecentQuizzes(localQuizzes);
        }
        setIsLoading(false);
    }, []);

    const stats = {
        totalQuizzes: recentQuizzes.length,
        activeNow: realtimeStats.activeQuizzes,
        totalParticipants: realtimeStats.totalParticipants,
        totalQuestions: recentQuizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0),
        avgQuestions: recentQuizzes.length > 0 ? Math.round(recentQuizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0) / recentQuizzes.length) : 0
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check Supabase configuration
                const configured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
                    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");
                setIsSupabaseConfigured(!!configured);

                const { data: { user: currentUser }, error } = await supabase.auth.getUser();
                if (currentUser) {
                    if (currentUser.id !== user?.id) {
                        setUser(currentUser);
                        fetchQuizzes(currentUser.id);
                    }
                } else {
                    if (user?.id !== 'demo-id') {
                        setUser({ email: 'admin@technexus.io', id: 'demo-id' });
                        setIsLoading(false);
                    }
                }
                if (!configured) {
                    console.warn("⚠️ Supabase Credentials Missing: Quizzes will be saved locally only. See SUPABASE_SETUP.md for configuration instructions.");
                }
            } catch (err) {
                console.error("Auth error:", err);
            }
        };
        checkAuth();

        // 1. Initial & Polling for Stats
        fetchRealtimeStats();
        const statsInterval = setInterval(fetchRealtimeStats, 5000);

        // 2. Real-time Database Subscription
        const quizSubscription = supabase
            .channel('dashboard-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'quizzes' }, () => {
                if (user) fetchQuizzes(user.id);
            })
            .subscribe();

        // 3. Activity Feed Listeners
        const addLog = (text: string, type: 'create' | 'event' | 'stat' | 'system') => {
            setActivityLog(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                text,
                time: "Just now",
                type
            }, ...prev].slice(0, 10));
        };

        const onRoomCreated = (data: any) => {
            setActiveQuizId(data.quizId);
            addLog(`New Arena #${data.quizId} launched!`, 'create');
        };

        const onParticipantJoined = (data: any) => {
            addLog(`${data.name} joined Arena #${data.quizId}`, 'event');
            fetchRealtimeStats();
        };

        socket.on('room-created', onRoomCreated);
        socket.on('player-joined', onParticipantJoined);
        socket.on('quiz-ended', (data) => addLog(`Arena #${data.quizId} completed!`, 'stat'));

        return () => {
            clearInterval(statsInterval);
            socket.off('room-created', onRoomCreated);
            socket.off('player-joined', onParticipantJoined);
            socket.off('quiz-ended');
            supabase.removeChannel(quizSubscription);
        };
    }, [user, router, fetchQuizzes]); // Added fetchQuizzes if it's memoized, but for now just safety

    const handleCreateNewQuiz = useCallback(() => {
        setQuizTitle("");
        setGeneratedQuestions([
            {
                q: "What is the result of 2 + 2?",
                options: ["3", "4", "5", "22"],
                correct: 1
            }
        ]);
        setView('REVIEW');
    }, []);

    const questionsEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (view === 'REVIEW' && questionsEndRef.current) {
            questionsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [generatedQuestions.length, view]);

    const handleHostRoom = useCallback(async () => {
        if (generatedQuestions.length === 0) return;

        const newQuizId = Math.floor(100000 + Math.random() * 900000).toString();
        const newQuizObj = {
            id: Math.random().toString(),
            title: quizTitle || "Manual Quiz",
            questions: generatedQuestions,
            creator_id: user?.id || 'demo-id',
            room_id: newQuizId,
            timer: questionTimer,
            created_at: new Date().toISOString()
        };

        // Optimistic update: Show it immediately!
        setRecentQuizzes(prev => [newQuizObj, ...prev]);

        // Save to local storage for persistence (especially for demo users)
        const localQuizzes = JSON.parse(localStorage.getItem('technexus_local_quizzes') || '[]');
        localStorage.setItem('technexus_local_quizzes', JSON.stringify([newQuizObj, ...localQuizzes]));

        setRealtimeStats(prev => ({ ...prev, activeQuizzes: prev.activeQuizzes + 1 }));

        if (user && user.id !== 'demo-id') {
            // Check if Supabase is properly configured
            const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
                !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project");

            if (!isSupabaseConfigured) {
                console.warn("⚠️ Supabase not configured. Quiz saved locally only.");
            } else {
                try {
                    const { data, error } = await supabase.from('quizzes').insert({
                        title: quizTitle || "Manual Quiz",
                        questions: generatedQuestions,
                        creator_id: user.id,
                        room_id: newQuizId,
                        timer: questionTimer
                    }).select().single();

                    if (!error && data) {
                        // Update the optimistic object with the real database ID
                        setRecentQuizzes(prev => prev.map(q => q.room_id === newQuizId ? { ...q, id: data.id } : q));

                        // Also update local storage with the real ID
                        const localQuizzes = JSON.parse(localStorage.getItem('technexus_local_quizzes') || '[]');
                        const updatedLocal = localQuizzes.map((q: any) => q.room_id === newQuizId ? { ...q, id: data.id } : q);
                        localStorage.setItem('technexus_local_quizzes', JSON.stringify(updatedLocal));
                        console.log("✅ Quiz saved to database successfully!");
                    } else if (error) {
                        // Log the full error object for debugging
                        console.error("❌ Error saving quiz to DB:", error);
                        console.error("Error details:", {
                            message: error?.message || 'No message',
                            details: error?.details || 'No details',
                            hint: error?.hint || 'No hint',
                            code: error?.code || 'No code',
                            fullError: JSON.stringify(error, null, 2)
                        });
                    }
                } catch (err) {
                    console.error("❌ Exception while saving quiz:", err);
                }
            }
        }

        const quizPayload = {
            quizId: newQuizId,
            questions: generatedQuestions,
            title: quizTitle || "Manual Quiz",
            timePerQuestion: questionTimer
        };

        socket.emit('create-room', quizPayload);
        setActiveQuizId(newQuizId);

        // Immediate feedback, shorter delay for transition
        router.push(`/game/${newQuizId}/host`);
    }, [generatedQuestions, quizTitle, user, questionTimer, router]);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        router.push("/login");
    }, [router]);

    const handleUpdateQuestion = useCallback((index: number, field: string, value: any) => {
        setGeneratedQuestions(prev => {
            const updated = [...prev];
            if (field === 'options') {
                const { optIdx, text } = value;
                updated[index] = {
                    ...updated[index],
                    options: [...updated[index].options]
                };
                updated[index].options[optIdx] = text;
            } else {
                updated[index] = { ...updated[index], [field]: value };
            }
            return updated;
        });
    }, []);

    const handleDeleteQuestion = useCallback((index: number) => {
        setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleDeleteQuiz = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        // Helper to find the quiz being deleted to get its room_id
        setRecentQuizzes(prev => {
            const quizToDelete = prev.find(q => q.id === id);
            const roomIdToDelete = quizToDelete?.room_id;

            // Remove from local storage (match by ID OR room_id to be safe)
            const localQuizzes = JSON.parse(localStorage.getItem('technexus_local_quizzes') || '[]');
            const updatedLocal = localQuizzes.filter((q: any) => q.id !== id && q.room_id !== roomIdToDelete);
            localStorage.setItem('technexus_local_quizzes', JSON.stringify(updatedLocal));

            return prev.filter(q => q.id !== id);
        });

        if (user && user.id !== 'demo-id') {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
            if (isUUID) {
                const { error } = await supabase.from('quizzes').delete().eq('id', id);
                if (error && user) {
                    fetchQuizzes(user.id);
                }
            }
        }
    }, [user, fetchQuizzes]);

    const filteredQuizzes = recentQuizzes.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.room_id.includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex overflow-hidden">

            {/* Sidebar */}
            <aside className="w-20 lg:w-64 bg-slate-900/50 border-r border-white/5 backdrop-blur-xl flex flex-col items-center lg:items-stretch transition-all z-50">
                <div className="p-6 flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Zap size={24} fill="white" className="text-white" />
                    </div>
                    <span className="hidden lg:block font-black text-xl tracking-tight text-white">
                        <span className="text-indigo-400">Tech</span>Nexus
                    </span>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    <SidebarItem icon={<Layout size={20} />} label="Dashboard" active={view === 'DASHBOARD'} onClick={() => setView('DASHBOARD')} />
                    <SidebarItem icon={<FileText size={20} />} label="My Quizzes" active={view === 'MY_QUIZZES'} onClick={() => setView('MY_QUIZZES')} />
                    <SidebarItem icon={<BarChart3 size={20} />} label="Analytics" active={view === 'ANALYTICS'} onClick={() => setView('ANALYTICS')} />
                    <SidebarItem icon={<Settings size={20} />} label="Settings" active={view === 'SETTINGS'} onClick={() => setView('SETTINGS')} />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span className="hidden lg:block font-bold">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-600/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

                <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-10">

                    {/* Supabase Configuration Warning */}
                    <AnimatePresence>
                        {!isSupabaseConfigured && showSupabaseWarning && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-4"
                            >
                                <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
                                <div className="flex-1">
                                    <h4 className="font-bold text-amber-300 mb-1">Database Not Configured</h4>
                                    <p className="text-sm text-amber-200/80">
                                        Supabase is not set up. Your quizzes are being saved locally in your browser.
                                        To enable cloud storage and multi-device access, see{' '}
                                        <a
                                            href="/SUPABASE_SETUP.md"
                                            target="_blank"
                                            className="underline hover:text-amber-100 font-bold"
                                        >
                                            SUPABASE_SETUP.md
                                        </a>
                                        {' '}for instructions.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowSupabaseWarning(false)}
                                    className="p-1 hover:bg-amber-400/10 rounded-lg text-amber-400 transition-colors"
                                    aria-label="Dismiss warning"
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                                Welcome Back, {user?.email?.split('@')[0]} <span className="text-3xl">👋</span>
                            </h2>
                            <p className="text-slate-400 mt-2 font-medium">Control center for your TechNexus quiz arena.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative group hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search quizzes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all w-64"
                                />
                            </div>
                            <button
                                onClick={handleCreateNewQuiz}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                            >
                                <Plus size={20} />
                                Create Quiz
                            </button>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<BrainCircuit className="text-indigo-400" />} label="Total Quizzes" value={stats.totalQuizzes} trend="Library" />
                        <StatCard icon={<Activity className="text-green-400" />} label="Active Sessions" value={stats.activeNow} trend={stats.activeNow > 0 ? "Live Now" : "Offline"} color={stats.activeNow > 0 ? "green" : "indigo"} />
                        <StatCard icon={<Users className="text-pink-400" />} label="Avg. Questions" value={stats.avgQuestions} trend="Per Quiz" />
                        <StatCard icon={<Globe className="text-blue-400" />} label="Avg. Players" value={stats.totalParticipants} trend="Real-time" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Interaction Area */}
                        <div className="lg:col-span-2 space-y-8">

                            {view === 'DASHBOARD' ? (
                                <>
                                    {/* Active Session Spotlight */}
                                    <AnimatePresence mode="wait">
                                        {activeQuizId && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="glass-card border-indigo-500/30 bg-indigo-500/5 overflow-hidden relative"
                                            >
                                                <div className="absolute top-0 right-0 p-1 px-3 bg-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Live Now</div>
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className="h-16 w-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 animate-pulse">
                                                            <Play size={32} fill="white" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="h-2 w-2 bg-green-500 rounded-full" />
                                                                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-widest">Ongoing Room Session</span>
                                                            </div>
                                                            <h3 className="text-2xl font-black font-mono tracking-tighter text-white">#{activeQuizId}</h3>
                                                            <p className="text-sm text-slate-400 mt-1">Participants are joining this session.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(activeQuizId);
                                                                alert("Room ID copied!");
                                                            }}
                                                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-slate-300 transition-all hover:text-white"
                                                            title="Copy Room ID"
                                                        >
                                                            <Copy size={20} />
                                                        </button>
                                                        <Link
                                                            href={`/game/${activeQuizId}/host`}
                                                            className="px-6 py-3 bg-white text-indigo-900 font-black rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
                                                        >
                                                            Host View
                                                            <ExternalLink size={18} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Recent Quizzes List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Clock size={20} className="text-indigo-400" />
                                                Recent Quizzes
                                            </h3>
                                            <button
                                                onClick={() => setView('MY_QUIZZES')}
                                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest px-3 py-1 bg-indigo-400/10 rounded-lg transition-all"
                                            >
                                                View All
                                            </button>
                                        </div>

                                        {isLoading ? (
                                            <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500">
                                                <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                                <p className="font-medium">Loading your arena...</p>
                                            </div>
                                        ) : filteredQuizzes.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {filteredQuizzes.slice(0, 4).map((q) => (
                                                    <QuizListItem key={q.id} q={q} onDelete={handleDeleteQuiz} onLaunch={(quiz) => {
                                                        socket.emit('create-room', {
                                                            quizId: quiz.room_id,
                                                            questions: quiz.questions,
                                                            title: quiz.title,
                                                            timePerQuestion: quiz.timer || 30
                                                        });
                                                        setActiveQuizId(quiz.room_id);
                                                        router.push(`/game/${quiz.room_id}/host`);
                                                    }} />
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState onCreate={handleCreateNewQuiz} />
                                        )}
                                    </div>
                                </>
                            ) : view === 'MY_QUIZZES' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-white">My Quizzes Library</h3>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">{filteredQuizzes.length} Quizzes Total</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {filteredQuizzes.map((q) => (
                                            <QuizListItem key={q.id} q={q} onDelete={handleDeleteQuiz} onLaunch={(quiz) => {
                                                socket.emit('create-room', {
                                                    quizId: quiz.room_id,
                                                    questions: quiz.questions,
                                                    title: quiz.title,
                                                    timePerQuestion: quiz.timer || 30
                                                });
                                                setActiveQuizId(quiz.room_id);
                                                router.push(`/game/${quiz.room_id}/host`);
                                            }} />
                                        ))}
                                    </div>
                                    {filteredQuizzes.length === 0 && <EmptyState onCreate={handleCreateNewQuiz} />}
                                </div>
                            ) : view === 'ANALYTICS' ? (
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-black text-white">Performance Analytics</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass-card p-8 text-center sm:text-left">
                                            <h4 className="text-lg font-bold text-white mb-6">User Engagement Trend</h4>
                                            <div className="h-48 w-full bg-slate-800/20 rounded-2xl flex items-end justify-around p-4 gap-2 border border-white/5">
                                                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        className="w-full max-w-[20px] bg-indigo-500/40 rounded-t-sm"
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-4 text-center italic">Engagement up by 24% this week</p>
                                        </div>
                                        <div className="glass-card p-8">
                                            <h4 className="text-lg font-bold text-white mb-6">Top Performing Quizzes</h4>
                                            <div className="space-y-4">
                                                {recentQuizzes.slice(0, 3).map((q, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                        <span className="text-sm font-bold text-slate-300 truncate pr-4">{q.title}</span>
                                                        <span className="text-xs font-black text-indigo-400">92% Score</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : view === 'SETTINGS' ? (
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-black text-white">Arena Settings</h3>
                                    <div className="glass-card max-w-2xl space-y-10">
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Profile Information</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                                                    <input type="text" value={user?.email || ""} readOnly className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-400 outline-none" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
                                                    <div className="w-full bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-indigo-400 font-bold">Standard Free</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Global Preferences</h4>
                                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div>
                                                    <p className="font-bold text-white">Auto-Export Results</p>
                                                    <p className="text-xs text-slate-500">Automatically download CSV after every session.</p>
                                                </div>
                                                <div className="h-6 w-12 bg-slate-700 rounded-full relative">
                                                    <div className="absolute left-1 top-1 h-4 w-4 bg-slate-400 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Editor View */
                                <div className="glass-card">
                                    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 pb-6 border-b border-white/5">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setView('DASHBOARD')}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-all"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <div>
                                                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Quiz Arena Editor</h2>
                                                <p className="text-[10px] text-indigo-400 font-bold tracking-widest mt-0.5">MANUAL CRAFTING MODE</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder="Arena Title"
                                                    value={quizTitle}
                                                    onChange={(e) => setQuizTitle(e.target.value)}
                                                    className="bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:border-indigo-500/50 outline-none w-64"
                                                />
                                            </div>
                                        </div>
                                    </header>

                                    <div className="space-y-8">
                                        {/* Editor Controls */}
                                        <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10 flex flex-wrap items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3">
                                                    <Clock size={16} className="text-slate-500" />
                                                    <span className="text-sm font-medium text-slate-300">Default Timer:</span>
                                                    <select
                                                        value={questionTimer}
                                                        onChange={(e) => setQuestionTimer(parseInt(e.target.value))}
                                                        className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none"
                                                    >
                                                        <option value={15}>15s</option>
                                                        <option value={30}>30s</option>
                                                        <option value={45}>45s</option>
                                                        <option value={60}>60s</option>
                                                    </select>
                                                </div>
                                                <div className="h-4 w-px bg-white/5 hidden md:block" />
                                                <div className="text-sm font-medium text-slate-400">
                                                    <span className="text-indigo-400 font-bold">{generatedQuestions.length}</span> Questions
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                                            {generatedQuestions.map((q, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-6 bg-slate-900/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex-1 mr-6">
                                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-2">Requirement {idx + 1}</span>
                                                            <textarea
                                                                value={q.q}
                                                                onChange={(e) => handleUpdateQuestion(idx, 'q', e.target.value)}
                                                                placeholder="Type your question here..."
                                                                rows={2}
                                                                className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder:text-slate-700 resize-none custom-scrollbar"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteQuestion(idx)}
                                                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {q.options.map((opt: string, i: number) => (
                                                            <div
                                                                key={i}
                                                                className={`p-1 rounded-xl ${q.correct === i ? 'bg-indigo-500/20 ring-1 ring-indigo-500/50' : 'bg-black/20 hover:bg-black/40'}`}
                                                            >
                                                                <div className="flex items-center gap-3 pr-3">
                                                                    <button
                                                                        onClick={() => handleUpdateQuestion(idx, 'correct', i)}
                                                                        className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-black text-sm ${q.correct === i ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                                                                    >
                                                                        {String.fromCharCode(65 + i)}
                                                                    </button>
                                                                    <input
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => handleUpdateQuestion(idx, 'options', { optIdx: i, text: e.target.value })}
                                                                        className="flex-1 bg-transparent py-3 text-sm font-bold text-slate-200 outline-none"
                                                                    />
                                                                    {q.correct === i && <CheckCircle2 size={16} className="text-indigo-400" />}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ))}

                                            <button
                                                onClick={() => setGeneratedQuestions([...generatedQuestions, { q: "New Question?", options: ["A", "B", "C", "D"], correct: 0 }])}
                                                className="w-full py-4 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl text-slate-500 hover:text-indigo-400 font-bold flex items-center justify-center gap-2 transition-all group"
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                                                    <Plus size={18} />
                                                </div>
                                                Add New Question
                                            </button>
                                            <div ref={questionsEndRef} />
                                        </div>

                                        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <button
                                                onClick={() => {
                                                    const csv = [
                                                        ["Question", "A", "B", "C", "D", "Correct_Index"],
                                                        ...generatedQuestions.map(q => [q.q, ...q.options, q.correct])
                                                    ].map(e => e.join(",")).join("\n");
                                                    const blob = new Blob([csv], { type: 'text/csv' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.style.display = 'none';
                                                    a.href = url;
                                                    a.download = `${quizTitle || 'TechNexus_Quiz'}.csv`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                }}
                                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm"
                                            >
                                                <Download size={18} />
                                                Export as CSV
                                            </button>

                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <button
                                                    onClick={() => setView('DASHBOARD')}
                                                    className="flex-1 md:flex-none px-6 py-3 border border-white/10 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleHostRoom}
                                                    className="flex-1 md:flex-none px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Zap size={20} fill="white" />
                                                    Launch Live Session
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Activity & Info */}
                        <aside className="space-y-6">

                            {/* TechNexus Live Status Panel */}
                            <div className="glass-card overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-3">
                                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Zap size={16} className="text-indigo-400" />
                                    TechNexus Live
                                </h4>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-sm font-bold text-slate-400">System Status</span>
                                        <span className="text-xs font-black text-green-400 bg-green-400/10 px-2 py-1 rounded">OPERATIONAL</span>
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Metrics</h5>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/10 text-center">
                                                <div className="text-xl font-black text-indigo-400">{realtimeStats.totalParticipants}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">Connections</div>
                                            </div>
                                            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/10 text-center">
                                                <div className="text-xl font-black text-indigo-400">{realtimeStats.activeQuizzes}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">Events</div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateNewQuiz}
                                        className="w-full py-3 bg-white text-indigo-900 rounded-xl font-black text-sm shadow-lg hover:shadow-indigo-500/20 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        New Event
                                    </button>
                                </div>

                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                            </div>

                        </aside>

                    </div>
                </div>

                {/* Footer Credits */}
                <footer className="p-10 text-center border-t border-white/5 mt-20">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
                        TechNexus Arena Dashboard v2.5.0 • Powered by Google Gemini
                    </p>
                </footer>
            </main >
        </div >
    );
}

const SidebarItem = memo(({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${active ? 'bg-indigo-600/10 text-indigo-400 shadow-sm border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
            <div className={`${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'} transition-colors`}>
                {icon}
            </div>
            <span className={`hidden lg:block font-bold text-sm ${active ? 'text-indigo-300' : ''}`}>{label}</span>
        </button>
    );
});
SidebarItem.displayName = "SidebarItem";

const QuizListItem = memo(({ q, onDelete, onLaunch }: { q: any, onDelete: (id: string) => void, onLaunch: (q: any) => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card group hover:border-indigo-500/30"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all">
                    <FileText size={24} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded">#{q.room_id}</span>
                    <button onClick={() => onDelete(q.id)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            <h4 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{q.title}</h4>
            <p className="text-sm text-slate-500 mt-1 mb-6 truncate">{q.questions.length} Questions • {q.timer || 30}s / Q</p>

            <button
                onClick={() => onLaunch(q)}
                className="w-full py-3 bg-slate-800/50 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all border border-white/5 flex items-center justify-center gap-2"
            >
                <Play size={16} fill="currentColor" />
                Launch Arena
            </button>
        </motion.div>
    );
});
QuizListItem.displayName = "QuizListItem";

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="text-center py-20 px-6 glass-card border-dashed">
            <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                <FileText size={32} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">No Quizzes Found</h4>
            <p className="text-slate-500 max-w-xs mx-auto mb-8">Ready to test some knowledge? Create your first quiz to get started.</p>
            <button
                onClick={onCreate}
                className="px-8 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-xl font-bold border border-indigo-500/20"
            >
                Start Creating
            </button>
        </div>
    );
}

const StatCard = memo(({ icon, label, value, trend, color = "indigo" }: { icon: any, label: string, value: number | string, trend: string, color?: string }) => {
    return (
        <div className="glass-card hover:bg-white/5 border-white/5 p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-white/5`}>
                    {icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${color === 'green' ? 'text-green-400 bg-green-400/10' : 'text-indigo-400 bg-indigo-400/10'
                    }`}>
                    {trend}
                </span>
            </div>
            <p className="text-3xl font-black text-white">{value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
});
StatCard.displayName = "StatCard";

