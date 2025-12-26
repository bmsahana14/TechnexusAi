"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Zap, Trophy, ArrowRight, Shield } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="h-16 w-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 sm:p-20 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.15),transparent_50%)] pointer-events-none" />

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Admin Login Link */}
      <motion.div
        className="absolute top-6 right-6 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link
          href="/login"
          className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-indigo-400/50 rounded-xl transition-all text-sm font-medium text-slate-400 hover:text-white"
        >
          <Shield size={16} className="group-hover:text-indigo-400 transition-colors" />
          Admin Portal
          <ArrowRight size={14} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
        </Link>
      </motion.div>

      <main className="z-10 max-w-5xl w-full text-center space-y-16">
        {/* Hero Section with Enhanced Animations */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 backdrop-blur-sm border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-bold uppercase tracking-widest mb-4"
          >
            <Sparkles size={16} className="animate-pulse" />
            AI-Powered Quiz Platform
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter font-heading text-gradient leading-[1.1] md:leading-none">
            TechNexus AI
          </h1>

          <motion.p
            className="text-lg sm:text-2xl md:text-3xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Transform presentations into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-bold">interactive quizzes</span> instantly.
            <br />
            <span className="text-sm sm:text-lg text-slate-400 mt-4 block max-w-2xl mx-auto">Where AI meets real-time engagement. Compete, learn, and dominate the leaderboard.</span>
          </motion.p>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/join"
            className="w-full sm:w-auto group relative px-8 sm:px-12 py-5 sm:py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg sm:text-xl transition-all shadow-[0_0_40px_rgba(99,102,241,0.3)] hover:shadow-[0_0_60px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative flex items-center justify-center gap-3">
              <Zap size={20} className="sm:size-6" fill="currentColor" />
              Join a Quiz
              <ArrowRight size={20} className="sm:size-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto group px-8 sm:px-12 py-5 sm:py-6 glass text-white rounded-2xl font-bold text-lg sm:text-xl hover:bg-white/10 transition-all border border-white/10 hover:border-indigo-400/50 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Sparkles size={20} className="sm:size-6 group-hover:rotate-12 transition-transform" />
            Create with AI
          </Link>
        </motion.div>

        {/* Enhanced Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {[
            {
              icon: <Sparkles size={28} />,
              color: "indigo",
              styles: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
              title: "Instant Generation",
              description: "Upload PPT or PDF files and watch AI generate high-quality questions in under 30 seconds.",
              gradient: "from-indigo-500/20 to-indigo-500/5"
            },
            {
              icon: <Zap size={28} />,
              color: "pink",
              styles: "bg-pink-500/20 text-pink-400 border-pink-500/20",
              title: "Real-Time Action",
              description: "Experience lag-free live quizzes with WebSocket technology supporting 1000+ concurrent players.",
              gradient: "from-pink-500/20 to-pink-500/5"
            },
            {
              icon: <Trophy size={28} />,
              color: "purple",
              styles: "bg-purple-500/20 text-purple-400 border-purple-500/20",
              title: "Live Leaderboards",
              description: "Dynamic scoring with time bonuses and instant rank updates keep the competitive spirit alive.",
              gradient: "from-purple-500/20 to-purple-500/5"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="group glass-card text-left relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${feature.styles}`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-3 font-heading group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {[
            { value: "<30s", label: "Quiz Generation" },
            { value: "1000+", label: "Concurrent Users" },
            { value: "99.9%", label: "Uptime" }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gradient mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-sm text-slate-500 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </main>

      <motion.footer
        className="absolute bottom-6 text-slate-500 text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        © 2025 TechNexus AI Arena • Built with Next.js, FastAPI & Socket.IO
      </motion.footer>
    </div>
  );
}
