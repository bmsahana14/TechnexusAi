"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import { Upload, FileText, CheckCircle2, Layout, LogOut, ChevronLeft, Plus, Users, Zap, Trash2, Download, Play } from "lucide-react";

export default function AdminDashboard() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [view, setView] = useState<'UPLOAD' | 'REVIEW'>('UPLOAD');
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
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


        const onRoomCreated = (data: any) => {
            console.log("Room created:", data);
            setActiveQuizId(data.quizId);
            // AUTO REDIRECT TO HOST VIEW
            router.push(`/game/${data.quizId}/host`);
        };

        socket.on('room-created', onRoomCreated);

        return () => {
            socket.off('room-created', onRoomCreated);
        };
    }, [router]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        if (!file) return;
        setProcessing(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('num_questions', '5');
            formData.append('difficulty', 'Medium');

            let aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
            if (aiServiceUrl && !aiServiceUrl.startsWith('http')) {
                aiServiceUrl = `https://${aiServiceUrl}`;
            }
            const res = await fetch(`${aiServiceUrl}/generate-quiz`, {
                method: 'POST',
                body: formData
            });


            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.detail || "AI Generation Failed");
            }

            const data = await res.json();
            console.log("AI Response:", data);

            if (data.quiz_data && data.quiz_data.length > 0) {
                setGeneratedQuestions(data.quiz_data);
                setView('REVIEW');
            } else {
                throw new Error("AI returned no questions. Please try another file.");
            }

        } catch (err: any) {
            console.error("Quiz Generation Error:", err);
            alert(`Oops! ${err.message || "Failed to generate quiz."}`);

            // FALLBACK: Allow manual entry if AI fails
            if (confirm("Would you like to create questions manually instead?")) {
                setGeneratedQuestions([{
                    q: "Click to edit this question",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    correct: 0
                }]);
                setView('REVIEW');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleHostRoom = async () => {
        if (generatedQuestions.length === 0) return;

        const newQuizId = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Save to Supabase for persistence
        if (user) {
            const { error } = await supabase.from('quizzes').insert({
                title: file ? file.name : "Generated Quiz",
                questions: generatedQuestions,
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
            questions: generatedQuestions,
            title: file ? file.name : "Manual Quiz",
            timePerQuestion: questionTimer
        };


        socket.emit('create-room', quizPayload);

        // Safety redirect if socket listener fails
        setTimeout(() => {
            router.push(`/game/${newQuizId}/host`);
        }, 1000);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleUpdateQuestion = (index: number, field: string, value: any) => {
        const updated = [...generatedQuestions];
        if (field === 'options') {
            const { optIdx, text } = value;
            updated[index].options[optIdx] = text;
        } else {
            updated[index][field] = value;
        }
        setGeneratedQuestions(updated);
    };

    const handleDeleteQuestion = (index: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
            const updated = generatedQuestions.filter((_, i) => i !== index);
            setGeneratedQuestions(updated);
        }
    };

    const handleAddNewQuestion = () => {
        const newQuestion = {
            q: "New question - click to edit",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correct: 0
        };
        setGeneratedQuestions([...generatedQuestions, newQuestion]);
    };

    return (
        <div className="min-h-screen p-8 bg-[#0f172a] text-slate-100">

            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-center mb-10 max-w-6xl mx-auto gap-6 sm:gap-0">
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                    <Link href="/" className="group p-2.5 sm:p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-all border border-slate-700/50 hover:border-indigo-500/50 shrink-0">
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-indigo-400" />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-4xl font-black font-heading text-gradient truncate">
                            Dashboard
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 truncate">AI Quiz Management</p>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm flex-1 sm:flex-none justify-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 shrink-0">
                            {user?.email?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-300 truncate max-w-[150px] sm:max-w-none">{user?.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group p-2.5 sm:p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all active:scale-95 shrink-0"
                        title="Logout"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Generator */}
                <section className="lg:col-span-2 space-y-8">
                    <div className="glass-card">
                        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <h2 className="text-lg sm:text-xl font-bold font-heading flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 invisible sm:visible absolute sm:static">
                                    <Zap size={20} fill="currentColor" />
                                </div>
                                AI Quiz Generator
                            </h2>
                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] sm:text-[10px] font-bold text-green-400 uppercase tracking-widest">Active</span>
                                </div>
                                {file && view === 'UPLOAD' && (
                                    <button onClick={() => setFile(null)} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider">
                                        Clear File
                                    </button>
                                )}
                            </div>
                        </header>


                        <div
                            className={`border-2 border-dashed rounded-xl p-6 sm:p-12 text-center transition-all ${dragActive
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-slate-700 hover:border-slate-500 hover:bg-white/5"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleChange}
                                accept=".pptx,.pdf"
                            />

                            {!file ? (
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4 sm:gap-6 group">
                                    <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all duration-500 border border-slate-700/50 group-hover:border-indigo-500/50 group-hover:scale-110">
                                        <Upload size={24} className="sm:size-[32px]" />
                                    </div>
                                    <div className="px-4">
                                        <p className="text-lg sm:text-xl font-bold text-slate-200">Upload Presentation</p>
                                        <p className="text-[10px] sm:text-sm text-slate-500 mt-1 sm:mt-2 max-w-xs mx-auto">Supported formats: <span className="text-slate-300 font-mono">.PDF</span>, <span className="text-slate-300 font-mono">.PPTX</span></p>
                                    </div>
                                </label>
                            ) : (
                                <div className="flex flex-col items-center gap-4 sm:gap-6 py-2 sm:py-4">
                                    <div className="h-20 w-20 sm:h-24 sm:w-24 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30 relative">
                                        <FileText size={32} className="sm:size-[40px]" />
                                        <div className="absolute -top-1.5 -right-1.5 bg-green-500 p-1 rounded-full text-white shadow-lg border-2 border-[#0f172a]">
                                            <CheckCircle2 size={12} className="sm:size-[16px]" />
                                        </div>
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-lg sm:text-xl font-bold text-white mb-1 truncate max-w-xs">{file.name}</p>
                                        <p className="text-xs sm:text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {view === 'UPLOAD' && file && (
                            <div className="mt-6 flex justify-center sm:justify-end">
                                <button
                                    onClick={handleGenerate}
                                    disabled={processing}
                                    className={`w-full sm:w-auto px-6 py-4 sm:py-3 rounded-xl sm:rounded-lg font-semibold flex items-center justify-center gap-2 ${processing
                                        ? "bg-slate-700 text-slate-400"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                        }`}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" /><path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" /></svg>
                                            Generate Quiz
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {view === 'REVIEW' && (
                            <div className="mt-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-indigo-300">Review & Edit Questions</h3>
                                    <span className="text-sm text-slate-500">{generatedQuestions.length} Questions Generated</span>
                                </div>

                                {/* Timer Settings and Add Question */}
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

                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                    {generatedQuestions.map((q, idx) => (
                                        <div key={idx} className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Question {idx + 1}</label>
                                                    <input
                                                        type="text"
                                                        value={q.q}
                                                        onChange={(e) => handleUpdateQuestion(idx, 'q', e.target.value)}
                                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none min-w-[300px] md:min-w-[500px]"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteQuestion(idx)}
                                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
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
                                                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${i === q.correct ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-indigo-400'}`}
                                                            >
                                                                {i === q.correct ? 'Correct Answer' : 'Mark Correct'}
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => handleUpdateQuestion(idx, 'options', { optIdx: i, text: e.target.value })}
                                                            className={`w-full bg-slate-900/50 border rounded-lg px-4 py-2 text-sm outline-none transition-all ${i === q.correct ? 'border-indigo-500/50 text-indigo-100' : 'border-slate-700 text-slate-300 focus:border-slate-500'}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-700/50 gap-6">
                                    <button
                                        onClick={() => setView('UPLOAD')}
                                        className="text-slate-400 hover:text-white flex items-center gap-2 font-medium transition-colors w-full sm:w-auto justify-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                        Back to Upload
                                    </button>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                                        <button
                                            onClick={() => {
                                                const csv = [
                                                    ["Question", "Option 1", "Option 2", "Option 3", "Option 4", "Correct Index"],
                                                    ...generatedQuestions.map(q => [q.q, ...q.options, q.correct])
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
                                            className="px-6 py-3 border border-slate-700 rounded-xl sm:rounded-lg font-bold text-slate-300 hover:bg-white/5 transition-all text-sm sm:text-base order-2 sm:order-1"
                                        >
                                            Export CSV
                                        </button>
                                        <button
                                            onClick={handleHostRoom}
                                            className="px-8 py-4 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 sm:gap-2 order-1 sm:order-2"
                                        >
                                            <Play size={18} fill="currentColor" />
                                            Launch Live Quiz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    <p className="text-slate-500 text-sm font-medium">No recent quizzes found. Start by generating one!</p>
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

