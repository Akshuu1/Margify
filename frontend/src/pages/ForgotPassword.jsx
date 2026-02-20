import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
              data = await res.json();
            } else {
              const text = await res.text();
              throw new Error(res.status === 404 ? "Endpoint not found (404). Please restart backend." : `Server error: ${res.status}`);
            }

            if (res.ok) {
                const successMsg = data.otp ? `Reset code sent! DEBUG: ${data.otp}` : "Reset code sent! Check your email.";
                setMessage({ type: "success", text: successMsg });
                setTimeout(() => navigate("/reset-password", { state: { email, otp: data.otp } }), 3000);
            } else {
                setMessage({ type: "error", text: data.message || "User not found" });
            }
        } catch (err) {
          setMessage({ type: "error", text: "Network error: Is backend running on port 3000?" });
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="w-screen h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden" style={{ fontFamily: "Space Grotesk" }}>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-[#FFCB74]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#1c1c1c] rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                <Link to="/login" className="flex items-center gap-2 text-[#888] hover:text-[#FFCB74] transition-colors mb-12 group w-fit">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                <div className="text-center mb-10">
                    <h1 className="font-[Kiona-Regular] text-[4rem] md:text-[5.5rem] text-[#e0e0e0] leading-none tracking-tight mb-2">
                        Reset
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-[#FFCB74] font-medium tracking-[0.2em] text-xs uppercase opacity-80">
                        <Sparkles size={14} />
                        <span>Recover Access</span>
                    </div>
                </div>

                <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
                    <p className="text-[#888] text-center mb-8 text-sm sm:text-base leading-relaxed">
                        Enter your registered email address.<br />We'll generate a 6-digit code for you.
                    </p>

                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        <div className="space-y-2">
                            <label className="text-[0.75rem] ml-2 text-[#888] font-bold uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl px-14 py-4.5 text-white placeholder:text-[#444] focus:outline-none focus:border-[#FFCB74]/50 focus:ring-1 focus:ring-[#FFCB74]/30 transition-all text-base shadow-inner"
                                />
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'error'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/10'
                                : 'bg-green-500/10 text-green-400 border border-green-500/10'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FFCB74] hover:bg-[#ffdfa0] disabled:opacity-50 disabled:cursor-not-allowed text-[#111111] py-4.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-2xl shadow-[#FFCB74]/20 hover:shadow-[#FFCB74]/40"
                        >
                            {loading ? <Loader2 className="animate-spin" size={22} /> : "Get Reset Code"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
