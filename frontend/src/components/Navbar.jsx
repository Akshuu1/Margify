import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bookmark, Leaf } from 'lucide-react';

export const Navbar = () => {
    const data = localStorage.getItem('user')
    const user = data ? JSON.parse(data) : null
    const name = user ? user.name : null
    const navigate = useNavigate()
    const location = useLocation()
    if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
        return null;
    }
    return (
        <nav className="fixed top-6 right-6 z-[100] flex items-center gap-4">
            {user ? (
                <>
                    <button onClick={() => navigate('/saved-routes')} className="group relative flex items-center justify-center w-12 h-12 bg-[#1c1c1c]/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:border-purple-500/50 hover:bg-[#2f2f2f]" title="Saved Routes">
                        <Bookmark size={20} className='text-white group-hover:text-purple-400 transition-colors' />
                    </button>
                    <button onClick={() => navigate('/profile')} className="group relative flex items-center justify-center w-12 h-12 bg-[#1c1c1c]/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:border-[#FFCB74]/50 hover:bg-[#2f2f2f]" title="Profile">
                        <span className='text-white text-sm hover:text-[#FFCB74]'>{name && name.charAt(0)}</span>
                        <div className="absolute inset-0 rounded-full bg-[#FFCB74]/0 group-hover:bg-[#FFCB74]/5 blur-md transition-all duration-300"></div>
                    </button>
                </>
            ) : (
                <button onClick={() => navigate('/login')} className="px-6 py-2 bg-[#FFCB74] text-[#111111] rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                    Login
                </button>
            )}
        </nav>
    );
};
