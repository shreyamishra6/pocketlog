"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Zap, Plus, Trash2, Edit3, LogOut, AlertTriangle, TrendingDown, Clock, Tag } from "lucide-react";
import { gsap } from "gsap";

interface Log {
    _id: string;
    amount: number;
    category: string;
    note?: string;
    createdAt: string;
}

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<Log[]>([]);
    const [spendLimit, setSpendLimit] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [newLog, setNewLog] = useState({ amount: "", category: "", note: "" });
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        } else if (user) {
            fetchLogs();
        }
    }, [user, loading, router]);

    const fetchLogs = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/user/logs?uid=${user.uid}`);
            const data = await res.json();
            if (data.logs) {
                setLogs(data.logs.sort((a: Log, b: Log) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                setSpendLimit(data.spendLimit);
            }
        } catch (err) {
            console.error("Failed to fetch logs", err);
        }
    };

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newLog.amount || !newLog.category) return;

        try {
            const res = await fetch("/api/user/logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    amount: Number(newLog.amount),
                    category: newLog.category,
                    note: newLog.note
                })
            });

            if (res.ok) {
                setNewLog({ amount: "", category: "", note: "" });
                setIsAdding(false);
                fetchLogs();
            }
        } catch (err) {
            setError("Failed to add record. System error.");
        }
    };

    const handleDeleteLog = async (id: string) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/user/logs/${id}?uid=${user.uid}`, { method: "DELETE" });
            if (res.ok) fetchLogs();
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleUpdateLog = async (id: string) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/user/logs/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    amount: Number(newLog.amount),
                    category: newLog.category,
                    note: newLog.note
                })
            });

            if (res.ok) {
                setIsEditing(null);
                setNewLog({ amount: "", category: "", note: "" });
                fetchLogs();
            }
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const todaysLogs = logs.filter(log => {
        const d = new Date(log.createdAt);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    });

    const todaysTotal = todaysLogs.reduce((acc, curr) => acc + curr.amount, 0);
    const isOverLimit = todaysTotal > spendLimit && spendLimit > 0;

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Zap className="w-12 h-12 text-accent animate-pulse" fill="currentColor" />
            </div>
        );
    }

    return (
        <div ref={dashboardRef} className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
            {/* Header */}
            <header className="border-b border-white/5 px-8 py-6 flex justify-between items-center bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" fill="currentColor" />
                    <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase">PocketLog_OS</span>
                </div>
                <div className="flex items-center gap-8">
                    <span className="font-mono text-[10px] opacity-40 uppercase hidden md:block">Session: Active_2026</span>
                    <button onClick={handleLogout} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest hover:text-accent transition-colors">
                        Sign_Out <LogOut className="w-3 h-3" />
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 py-16 lg:grid lg:grid-cols-12 gap-16">
                {/* Left Column: Stats & Add */}
                <div className="lg:col-span-4 space-y-12">
                    <section>
                        <span className="font-mono text-[10px] text-accent font-bold block mb-4 uppercase tracking-[0.4em]">01 / DAILY_METRICS</span>
                        <h1 className="text-7xl font-bebas leading-none mb-8">Pulse Check.</h1>

                        <div className="bg-white/5 border border-white/10 p-8 space-y-6 relative overflow-hidden">
                            {isOverLimit && (
                                <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 font-mono text-[10px] uppercase flex items-center gap-2 animate-bounce">
                                    <AlertTriangle className="w-3 h-3" /> Limit_Breach
                                </div>
                            )}
                            <div>
                                <span className="font-mono text-[10px] opacity-40 block mb-2 uppercase tracking-widest">Spent_Today</span>
                                <div className={`text-6xl font-bebas ${isOverLimit ? 'text-accent' : ''}`}>
                                    ₹{todaysTotal.toLocaleString()}
                                </div>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${isOverLimit ? 'bg-accent' : 'bg-white/40'}`}
                                    style={{ width: `${Math.min((todaysTotal / spendLimit) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between font-mono text-[10px] opacity-40 uppercase">
                                <span>Limit: ₹{spendLimit.toLocaleString()}</span>
                                <span>{((todaysTotal / spendLimit) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-4xl font-bebas leading-none">Record Action.</h2>
                            <button
                                onClick={() => { setIsAdding(true); setIsEditing(null); setNewLog({ amount: "", category: "", note: "" }); }}
                                className="bg-accent text-white p-2 hover:scale-110 transition-transform"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>

                        {(isAdding || isEditing) && (
                            <form onSubmit={isEditing ? (e) => { e.preventDefault(); handleUpdateLog(isEditing); } : handleAddLog} className="bg-white/5 border border-accent/20 p-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase opacity-40">Amount_INR</label>
                                        <input
                                            type="number"
                                            value={newLog.amount}
                                            onChange={(e) => setNewLog({ ...newLog, amount: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 py-2 text-2xl font-bebas focus:border-accent outline-none transition-colors"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase opacity-40">Category_ID</label>
                                        <input
                                            type="text"
                                            value={newLog.category}
                                            onChange={(e) => setNewLog({ ...newLog, category: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 py-2 font-sans focus:border-accent outline-none transition-colors"
                                            placeholder="e.g. Food, Transport"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-mono text-[10px] uppercase opacity-40">Optional_Note</label>
                                        <input
                                            type="text"
                                            value={newLog.note}
                                            onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                                            className="w-full bg-transparent border-b border-white/10 py-2 font-sans focus:border-accent outline-none transition-colors italic"
                                            placeholder="Memory trigger..."
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" className="flex-1 bg-accent text-white rounded-none font-bebas text-xl h-12">
                                        {isEditing ? 'COMMIT_LOG' : 'LOG_ENTRY'}
                                    </Button>
                                    <Button onClick={() => { setIsAdding(false); setIsEditing(null); }} type="button" className="bg-white/10 text-white rounded-none font-bebas text-xl h-12">
                                        CANCEL
                                    </Button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-8 space-y-12 mt-16 lg:mt-0">
                    <section>
                        <span className="font-mono text-[10px] text-accent font-bold block mb-4 uppercase tracking-[0.4em]">02 / CHRONICLE_HISTORY</span>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-6xl font-bebas leading-none">Journal.</h2>
                            <div className="flex items-center gap-4 font-mono text-[10px] opacity-40 uppercase">
                                <TrendingDown className="w-3 h-3" /> Tracking_{logs.length}_Items
                            </div>
                        </div>

                        <div className="space-y-px bg-white/5 border border-white/10">
                            {logs.length === 0 ? (
                                <div className="p-16 text-center text-foreground/20 font-mono text-[10px] uppercase tracking-widest">
                                    Zero_Logs_Detected
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log._id} className="bg-background p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors overflow-hidden relative border-b border-white/5">
                                        <div className="flex items-center gap-8">
                                            <div className="text-accent font-bebas text-3xl tabular-nums w-24">
                                                ₹{log.amount}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-4 mb-1">
                                                    <span className="text-sm font-bold uppercase tracking-widest">{log.category}</span>
                                                    <span className="font-mono text-[9px] opacity-30 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {new Date(log.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {log.note && <p className="text-[10px] text-foreground/40 italic font-medium">{log.note}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(log._id);
                                                    setIsAdding(false);
                                                    setNewLog({ amount: log.amount.toString(), category: log.category, note: log.note || "" });
                                                }}
                                                className="p-2 hover:text-accent transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLog(log._id)}
                                                className="p-2 hover:text-accent transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

