import React, { useState } from 'react';
import { Zap, Wallet, BarChart3, ChevronDown, Info, Sparkles } from 'lucide-react';
import { formatDuration, formatCurrency } from '../utils/format';

const SavingsDashboard = ({ routes }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSmartChoiceInfo, setShowSmartChoiceInfo] = useState(false);

    if (!routes || routes.length < 2) return null;

    const fastest = [...routes].sort((a, b) => a.totalTime - b.totalTime)[0];
    const cheapest = [...routes].sort((a, b) => a.priceRange.min - b.priceRange.min)[0];
    const smartChoice = [...routes].find(r => r.tag === "Smart Choice");

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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

                        {smartChoice && (
                            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 p-4 rounded-xl sm:col-span-2 relative overflow-hidden group cursor-pointer hover:border-cyan-400/40 transition-all" onClick={() => setShowSmartChoiceInfo(true)}>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-1.5 bg-cyan-500/30 rounded-lg">
                                                <Sparkles className="text-cyan-400" size={16} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400/80">Smart Choice</span>
                                        </div>
                                        <p className="text-sm text-[#eee] leading-relaxed">
                                            Best balance of <span className="text-cyan-300 font-bold">cost, time & comfort</span>. Recommended for most journeys.
                                        </p>
                                    </div>
                                    <button className="ml-4 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 text-xs font-bold rounded-lg transition-all whitespace-nowrap">
                                        Learn More →
                                    </button>
                                </div>
                            </div>
                        )}
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
                            {smartChoice && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-cyan-400">Smart Choice</span>
                                        <span className="text-white">{formatDuration(smartChoice.totalTime)}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[70%] rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showSmartChoiceInfo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] flex items-center justify-center p-4" onClick={() => setShowSmartChoiceInfo(false)}>
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f1419] rounded-3xl p-8 max-w-md w-full border border-cyan-400/20 shadow-2xl shadow-cyan-500/20" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Sparkles className="text-cyan-400" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Smart Choice Route</h3>
                        </div>
                        
                        <p className="text-[#ccc] text-sm mb-6 leading-relaxed">
                            Our Smart Choice recommendations give you the best overall value by balancing three factors:
                        </p>

                        <div className="space-y-3 mb-6">
                            <div className="bg-white/5 border border-cyan-400/20 p-3 rounded-lg">
                                <div className="text-cyan-300 font-bold text-sm mb-1">⏱️ Reasonable Time</div>
                                <p className="text-[#999] text-xs">Not the slowest, but not the fastest—ensuring efficient travel.</p>
                            </div>
                            <div className="bg-white/5 border border-cyan-400/20 p-3 rounded-lg">
                                <div className="text-cyan-300 font-bold text-sm mb-1">💰 Good Cost</div>
                                <p className="text-[#999] text-xs">Saves money compared to premium options while offering value.</p>
                            </div>
                            <div className="bg-white/5 border border-cyan-400/20 p-3 rounded-lg">
                                <div className="text-cyan-300 font-bold text-sm mb-1">🚇 Comfort & Reliability</div>
                                <p className="text-[#999] text-xs">Metro-based routes provide consistent schedules and comfort.</p>
                            </div>
                        </div>

                        <div className="text-[#888] text-xs text-center mb-6 border-t border-white/10 pt-4">
                            <p>Recommended for most daily commutes and regular journeys</p>
                        </div>

                        <button
                            onClick={() => setShowSmartChoiceInfo(false)}
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavingsDashboard;
