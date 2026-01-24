import React, { useState } from 'react';
import { Zap, Wallet, BarChart3, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { formatDuration, formatCurrency } from '../utils/format';

const SavingsDashboard = ({ routes }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!routes || routes.length < 2) return null;

    const fastest = [...routes].sort((a, b) => a.totalTime - b.totalTime)[0];
    const cheapest = [...routes].sort((a, b) => a.priceRange.min - b.priceRange.min)[0];

    // Avoid showing insight if fastest and cheapest are the same
    if (fastest.id === cheapest.id) return null;

    const timeSaved = cheapest.totalTime - fastest.totalTime;
    const moneySaved = fastest.priceRange.min - cheapest.priceRange.min;

    return (
        <div className="w-full mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#FFCB74]/5 hover:bg-[#FFCB74]/10 border border-[#FFCB74]/20 rounded-2xl transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#FFCB74] rounded-full shadow-[0_0_15px_rgba(255,203,116,0.3)] group-hover:scale-110 transition-transform">
                        <BarChart3 className="text-[#111111]" size={14} />
                    </div>
                    <div className="text-left">
                        <span className="text-xs font-black uppercase tracking-wider text-[#FFCB74]">Margify Analysis</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">Save {formatCurrency(moneySaved)}</span>
                            <span className="text-[10px] text-[#666] font-bold">•</span>
                            <span className="text-[11px] text-[#aaa]">or save {formatDuration(timeSaved)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:block text-[10px] font-bold text-[#FFCB74]/60 uppercase tracking-widest">Toggle Details</span>
                    <div className={`p-1 rounded-full bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={16} className="text-[#FFCB74]" />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="mt-2 p-6 bg-[#1a1a1a] border border-white/5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Time Card */}
                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                    <Zap className="text-blue-400" size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/80">Time Priority</span>
                            </div>
                            <p className="text-sm text-[#eee] leading-relaxed">
                                Pick <span className="text-white font-bold">{fastest.tag}</span> to arrive <span className="text-[#FFCB74] font-bold">{formatDuration(timeSaved)}</span> earlier.
                            </p>
                        </div>

                        {/* Cost Card */}
                        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-1.5 bg-green-500/20 rounded-lg">
                                    <Wallet className="text-green-400" size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-400/80">Budget Priority</span>
                            </div>
                            <p className="text-sm text-[#eee] leading-relaxed">
                                Pick the <span className="text-white font-bold">Cheapest Option</span> to save <span className="text-green-400 font-bold">{formatCurrency(moneySaved)}</span> on your trip.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <Info size={12} className="text-[#666]" />
                            <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest">Efficiency Benchmark</span>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-[#aaa]">{fastest.tag} (Fastest)</span>
                                    <span className="text-white">{formatDuration(fastest.totalTime)}</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#FFCB74] w-[60%] rounded-full shadow-[0_0_10px_rgba(255,203,116,0.2)]" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-[#aaa]">Cheapest Option</span>
                                    <span className="text-white">{formatDuration(cheapest.totalTime)}</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#666] w-full rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsDashboard;
