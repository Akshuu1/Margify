import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, ShieldCheck, Loader2, KeyRound } from "lucide-react";

// Standardize BACKEND_URL logic
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const devOtp = location.state?.otp || "";

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setMessage({ type: "error", text: "Passwords do not match" });
        }
        if (otp.length !== 6) {
            return setMessage({ type: "error", text: "Enter 6-digit code" });
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            // Check if response is JSON
            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Non-JSON response:", text);
                throw new Error(res.status === 404 ? "Endpoint not found (404). Please restart backend." : `Server error: ${res.status}`);
            }

            if (res.ok) {
                setMessage({ type: "success", text: "Password reset successful! Redirecting..." });
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setMessage({ type: "error", text: data.message || "Failed to reset password" });
            }
        } catch (err) {
            console.error("Reset Password Error:", err);
            setMessage({ type: "error", text: "Network error: Is backend running on port 3000?" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden" style={{ fontFamily: "Space Grotesk" }}>

            {/* Theme Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#FFCB74]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-[#1c1c1c] rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                <div className="text-center mb-10">
                    <h1 className="font-[Kiona-Regular] text-[4rem] md:text-[5.5rem] text-[#e0e0e0] leading-none tracking-tight mb-2">
                        Auth
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-[#FFCB74] font-medium tracking-[0.2em] text-xs uppercase opacity-80">
                        <KeyRound size={14} />
                        <span>New Credentials</span>
                    </div>
                </div>

                <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {devOtp && (
                        <div className="mb-6 p-4 bg-[#FFCB74]/10 border border-[#FFCB74]/20 rounded-2xl text-center">
                            <span className="text-[#FFCB74] text-xs font-bold uppercase tracking-widest block mb-1">Debug Reset Code</span>
                            <span className="text-[#FFCB74] text-2xl font-bold tracking-[0.3em]">{devOtp}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[0.75rem] ml-2 text-[#888] font-bold uppercase tracking-widest">Verify Code</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    placeholder="000 000"
                                    className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl px-14 py-5 text-white text-center text-3xl tracking-[0.4em] font-bold placeholder:text-[#333] focus:outline-none focus:border-[#FFCB74]/50 transition-all shadow-inner"
                                />
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-[#555]" size={22} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label className="text-[0.75rem] ml-2 text-[#888] font-bold uppercase tracking-widest">New Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#1c1c1c] border border-white/5 rounded-xl px-14 py-4 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FFCB74]/50 transition-all shadow-inner"
                                    />
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[0.75rem] ml-2 text-[#888] font-bold uppercase tracking-widest">Confirm Pass</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#1c1c1c] border border-white/5 rounded-xl px-14 py-4 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FFCB74]/50 transition-all shadow-inner"
                                    />
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
                                </div>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'error'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                                : 'bg-green-500/10 text-green-400 border border-green-500/10'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FFCB74] hover:bg-[#ffdfa0] disabled:opacity-50 disabled:cursor-not-allowed text-[#111111] py-4.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-2xl shadow-[#FFCB74]/20 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={22} /> : "Update Credentials"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
