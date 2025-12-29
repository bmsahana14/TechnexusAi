"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import { Layout, LogOut, ChevronLeft, Plus, Users, Zap, Trash2, Download, Play } from "lucide-react";

export default function AdminDashboard() {
    const [quizTitle, setQuizTitle] = useState("");
    const [view, setView] = useState<'CREATE'>('CREATE');
    const [questions, setQuestions] = useState<any[]>([
        {
            q: "",
            options: ["", "", "", ""],
            correct: 0
        }
    ]);
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
    const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [questionTimer, setQuestionTimer] = useState<number>(30); // Timer in seconds
    const router = useRouter();

    const fetchQuizzes = async (userId: string) => {
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('creator_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setRecentQuizzes(data);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            console.log("Checking Supabase connection...");
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) {
                    console.error("Supabase Auth Error:", error);
                    // If there's an error, don't hang, just show the page or redirect
                    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("your-project")) {
                        console.warn("Using placeholder Supabase URL. Page may not load correctly.");
                    }
                }

                if (!user) {
                    console.log("No user found, but staying on page for testing...");
                    // router.push("/login"); // BYPASSED FOR TESTING
                    setUser({ email: 'test-admin@technexus.io', id: 'test-id' }); // Dummy user
                } else {

                    console.log("Authenticated as:", user.email);
                    setUser(user);
                    fetchQuizzes(user.id);
                }
            } catch (err) {
                console.error("Failed to fetch auth user:", err);
            }
        };
        checkAuth();


        if (!socket.connected) socket.connect();

        const onRoomCreated = (data: any) => {
            console.log("Room created:", data);
            setActiveQuizId(data.quizId);
        };

        socket.on('room-created', onRoomCreated);

        return () => {
            socket.off('room-created', onRoomCreated);
        };
    }, []);



    const handleHostRoom = async () => {
        if (questions.length === 0) return;

        const newQuizId = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Save to Supabase for persistence
        if (user) {
            const { error } = await supabase.from('quizzes').insert({
                title: quizTitle || "Untitled Quiz",
                questions: questions,
                creator_id: user.id,
                room_id: newQuizId,
                timer: questionTimer
            });

            if (error) {
                console.error("Error saving quiz to DB:", error);
                // Continue anyway to host the room? Or stop? 
                // Let's at least try to host even if DB fails.
            } else {
                fetchQuizzes(user.id); // Refresh the list
            }
        }

        // 2. Emit to Realtime
        const quizPayload = {
            quizId: newQuizId,
            questions: questions,
            title: quizTitle || "Untitled Quiz",
            timePerQuestion: questionTimer
        };


        socket.emit('create-room', quizPayload);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleUpdateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        if (field === 'options') {
            const { optIdx, text } = value;
            updated[index].options[optIdx] = text;
        } else {
            updated[index][field] = value;
        }
        setQuestions(updated);
    };

    const handleDeleteQuestion = (index: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
            const updated = questions.filter((_, i) => i !== index);
            setQuestions(updated);
        }
    };

    const handleAddNewQuestion = () => {
        const newQuestion = {
            q: "",
            options: ["", "", "", ""],
            correct: 0
        };
        setQuestions([...questions, newQuestion]);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-[#0f172a] text-slate-100">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 max-w-6xl mx-auto gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                    <Link href="/" className="group p-2 md:p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all border border-slate-700/50 hover:border-indigo-500/50">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-indigo-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-gradient">
                            Admin Dashboard
                        </h1>
                        <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Quiz Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm flex-1 md:flex-initial">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs md:text-sm font-bold shadow-lg shadow-indigo-500/20">
                            {user?.email?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <span className="text-xs md:text-sm font-medium text-slate-300 truncate max-w-[120px] md:max-w-none">{user?.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group p-2 md:p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all active:scale-95"
                        title="Logout"
                    >
                        <LogOut size={18} className="md:size-5 group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                {/* Left Col: Generator */}
                <section className="lg:col-span-2 space-y-8">
                    <div className="glass-card">
                        <header className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold font-heading flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <Plus size={20} fill="currentColor" />
                                </div>
                                Create New Quiz
                            </h2>
                        </header>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quiz Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter quiz title (e.g., General Knowledge)"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-4 text-white text-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="flex justify-between items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-bold text-slate-300">Question Timer:</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="5"
                                            max="300"
                                            value={questionTimer}
                                            onChange={(e) => setQuestionTimer(parseInt(e.target.value) || 30)}
                                            className="w-20 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-center focus:ring-1 focus:ring-indigo-500 outline-none"
                                        />
                                        <span className="text-sm text-slate-400">seconds</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddNewQuestion}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg border border-indigo-500/30 hover:border-indigo-500/50 transition-all font-medium"
                                >
                                    <Plus size={18} />
                                    Add Question
                                </button>
                            </div>

                            <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                {questions.map((q, idx) => (
                                    <div key={idx} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Question {idx + 1}</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your question here..."
                                                    value={q.q}
                                                    onChange={(e) => handleUpdateQuestion(idx, 'q', e.target.value)}
                                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleDeleteQuestion(idx)}
                                                className="ml-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                title="Delete Question"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt: string, i: number) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-center px-1">
                                                        <label className="text-[10px] font-bold text-slate-600 uppercase">Option {i + 1}</label>
                                                        <button
                                                            onClick={() => handleUpdateQuestion(idx, 'correct', i)}
                                                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded transition-all ${i === q.correct ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-indigo-400'}`}
                                                        >
                                                            {i === q.correct ? 'Correct Answer' : 'Mark Correct'}
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder={`Option ${i + 1}`}
                                                        value={opt}
                                                        onChange={(e) => handleUpdateQuestion(idx, 'options', { optIdx: i, text: e.target.value })}
                                                        className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2 text-sm outline-none transition-all ${i === q.correct ? 'border-indigo-500/50 text-indigo-100 placeholder:text-indigo-400/50' : 'border-slate-700 text-slate-300 focus:border-slate-500'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end items-center pt-6 border-t border-slate-700/50 gap-4">
                                <button
                                    onClick={() => {
                                        const csv = [
                                            ["Question", "Option 1", "Option 2", "Option 3", "Option 4", "Correct Index"],
                                            ...questions.map(q => [q.q, ...q.options, q.correct])
                                        ].map(e => e.join(",")).join("\n");
                                        const blob = new Blob([csv], { type: 'text/csv' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.setAttribute('hidden', '');
                                        a.setAttribute('href', url);
                                        a.setAttribute('download', 'quiz_questions.csv');
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }}
                                    className="px-6 py-3 border border-slate-700 rounded-lg font-bold text-slate-300 hover:bg-white/5 transition-all"
                                >
                                    Export CSV
                                </button>
                                <button
                                    onClick={handleHostRoom}
                                    disabled={!quizTitle || questions.some(q => !q.q)}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z" /></svg>
                                    Launch Live Quiz
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <header className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold font-heading">Recent Quizzes</h2>
                            {recentQuizzes.length > 0 && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{recentQuizzes.length} Sessions</span>}
                        </header>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {activeQuizId && (
                                <div className="p-4 bg-indigo-600/20 border border-indigo-500/50 rounded-xl flex justify-between items-center group animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="h-2 w-2 bg-green-500 rounded-full animate-ping" />
                                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Active Session</p>
                                        </div>
                                        <p className="text-2xl font-black font-mono text-white tracking-widest">{activeQuizId}</p>
                                    </div>
                                    <Link href={`/game/${activeQuizId}/host`} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                                        <Layout size={20} />
                                    </Link>
                                </div>
                            )}

                            {recentQuizzes.filter(q => q.room_id !== activeQuizId).map((q, i) => (
                                <div key={q.id} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-slate-500/50 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-200 line-clamp-1">{q.title}</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">
                                                {new Date(q.created_at).toLocaleDateString()} • {q.questions.length} Questions
                                            </p>
                                        </div>
                                        <div className="text-xs font-mono font-bold text-slate-400 bg-slate-900/50 px-2 py-1 rounded">
                                            #{q.room_id}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Re-host logic - include stored timer
                                            socket.emit('create-room', {
                                                quizId: q.room_id,
                                                questions: q.questions,
                                                title: q.title,
                                                timePerQuestion: q.timer || 30
                                            });
                                            setQuestionTimer(q.timer || 30);
                                            setActiveQuizId(q.room_id);
                                        }}
                                        className="w-full py-2 bg-slate-700/50 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 text-xs font-bold rounded-lg border border-slate-600/30 hover:border-indigo-500/30 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <Play size={14} fill="currentColor" />
                                        Re-host Session
                                    </button>
                                </div>
                            ))}

                            {recentQuizzes.length === 0 && !activeQuizId && (
                                <div className="text-center py-12 px-6 bg-slate-800/20 border border-dashed border-slate-700 rounded-xl">
                                    <div className="h-12 w-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                                        <Plus size={20} />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">No recent quizzes found. Start by creating one!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Right Col: Stats/Quick Actions */}
                <aside className="space-y-6">
                    <div className="glass-card bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/20 group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Active Quizzes</h3>
                            <Zap size={16} className="text-indigo-500 animate-pulse" />
                        </div>
                        <p className="text-4xl font-black text-white group-hover:scale-110 transition-transform origin-left">0</p>
                        <p className="text-xs text-slate-500 mt-2">Currently running sessions</p>
                    </div>

                    <div className="glass-card bg-pink-500/5 hover:bg-pink-500/10 border-pink-500/20 group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest">Participants</h3>
                            <Users size={16} className="text-pink-500" />
                        </div>
                        <p className="text-4xl font-black text-white group-hover:scale-110 transition-transform origin-left">0</p>
                        <p className="text-xs text-slate-500 mt-2">Engaged in real-time</p>
                    </div>

                    <div className="p-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/5">
                        <div className="p-6 text-center">
                            <Zap size={24} className="mx-auto text-yellow-400 mb-2" fill="currentColor" />
                            <h4 className="font-bold text-white mb-1">Go Pro</h4>
                            <p className="text-xs text-slate-400">Unlock advanced AI features and unlimited participants.</p>
                        </div>
                    </div>
                </aside>

            </main>
        </div>
    );
}

