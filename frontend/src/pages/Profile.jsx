import { useEffect, useState, useRef, useCallback } from "react"
import { getProfile, changePassword } from "../services/auth"
import { useNavigate } from "react-router-dom"
import { Lock, User, Mail, LogOut, Search, CheckCircle, AlertTriangle, Shield, Eye, Fingerprint, Calendar } from "lucide-react"
import CalendarSync from "../components/CalendarSync"

export function Profile() {
  const [user, setUser] = useState(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showSecurityMenu, setShowSecurityMenu] = useState(false)
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()
  const passwordRef = useRef(null)
  const containerRef = useRef(null)

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('userSettings')
      return saved ? JSON.parse(saved) : {
        notifications: true,
        appearance: 'Ultra Dark',
        defaultMode: 'Metro First',
        dataPrivacy: false
      }
    } catch {
      return { notifications: true, appearance: 'Ultra Dark', defaultMode: 'Metro First', dataPrivacy: false }
    }
  })

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    // Apply theme changes to document
    const root = document.documentElement
    if (settings.appearance === 'Ultra Dark') {
      root.style.setProperty('--bg-primary', '#0a0a0a')
      root.style.setProperty('--bg-secondary', '#111111')
      root.style.setProperty('--bg-card', '#161616')
      document.body.style.backgroundColor = '#0a0a0a'
    } else if (settings.appearance === 'Classic Dark') {
      root.style.setProperty('--bg-primary', '#1a1a2e')
      root.style.setProperty('--bg-secondary', '#16213e')
      root.style.setProperty('--bg-card', '#1a1a2e')
      document.body.style.backgroundColor = '#1a1a2e'
    } else if (settings.appearance === 'Glass') {
      root.style.setProperty('--bg-primary', '#0d1117')
      root.style.setProperty('--bg-secondary', '#161b22')
      root.style.setProperty('--bg-card', '#21262d')
      document.body.style.backgroundColor = '#0d1117'
    }
  }, [settings])

  const toggleSetting = useCallback((key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const cycleSetting = useCallback((key, options) => {
    setSettings(prev => {
      const idx = options.indexOf(prev[key])
      const next = options[(idx + 1) % options.length]
      return { ...prev, [key]: next }
    })
  }, [])

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(data)
        }
      })
      .catch(() => {
        setUser(null);
        navigate("/login");
      })
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: "New passwords do not match" })
      return
    }
    try {
      const res = await changePassword(passwords.old, passwords.new)
      if (res.message) {
        setMessage({ type: 'success', text: "Password changed successfully!" })
        setPasswords({ old: '', new: '', confirm: '' })
        setShowPasswordChange(false)
      } else {
        setMessage({ type: 'error', text: res.error || "Failed to change password" })
      }
    } catch {
      setMessage({ type: 'error', text: "Something went wrong" })
    }
  }

  const handleSecurityClick = () => {
    setShowSecurityMenu(!showSecurityMenu)
  }

  const handleChangePasswordClick = () => {
    setShowSecurityMenu(false)
    setShowPasswordChange(true)
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (passwordRef.current) {
          passwordRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        } else if (containerRef.current) {
          containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
        }
      }, 300)
    })
  }

  if (!user) {
    return (
      <div className="w-screen h-screen flex justify-center items-center text-[#e0e0e0] font-[Space Grotesk] bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFCB74]"></div>
      </div>
    )
  }

  const initials = user.name ? user.name.split(' ').map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??"
  const name = user.name || "Guest"
  const email = user.email || "Not signed in"
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'

  return (
    <div ref={containerRef} style={{ fontFamily: "Space Grotesk" }} className="w-screen h-screen overflow-y-auto bg-[#0a0a0a]">
      <div className="min-h-full flex flex-col items-center py-12 px-6 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#FFCB74]/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#1c1c1c] rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-2xl relative z-10 flex flex-col gap-6">
          <h1 className="font-[Kiona-Regular] text-[3rem] md:text-[4rem] text-[#e0e0e0] text-center tracking-wider drop-shadow-lg">My Profile</h1>
          <div className="bg-[#1c1c1c]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#FFCB74] to-[#ffaa40] rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-[#2f2f2f]">
                  <span className="text-[#111111] text-4xl font-bold font-[Kiona-Regular] tracking-widest">{initials}</span>
                </div>
                <div className="px-4 py-1.5 bg-[#2f2f2f] rounded-full text-xs text-[#888] font-medium border border-white/5">Member since {joinDate}</div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <User size={20} className="text-[#FFCB74]" />
                  <h2 className="text-3xl text-[#e0e0e0] font-bold capitalize">{name}</h2>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <Mail size={16} className="text-[#666]" />
                  <p className="text-[#888] text-base">{email}</p>
                </div>

                {/* Settings Section */}
                <div className="bg-[#2a2a2a]/50 p-6 rounded-2xl border border-white/5 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[#aaa] text-sm">Account Status</span>
                    <span className="text-green-400 text-sm flex items-center gap-1 font-bold"><CheckCircle size={14} /> Verified Member</span>
                  </div>

                  <div className="border-t border-white/5 pt-6 space-y-5">
                    <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-[#FFCB74] rounded-full"></div>
                      Preferences
                    </h3>

                    {/* Notifications Toggle */}
                    <div onClick={() => toggleSetting('notifications')} className="flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98] select-none">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#FFCB74]/10 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFCB74]"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">Notifications</div>
                          <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{settings.notifications ? 'Smart Alerts On' : 'Alerts Off'}</div>
                        </div>
                      </div>
                      <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.notifications ? 'bg-[#FFCB74]' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all duration-300 ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>

                    {/* Appearance Cycle */}
                    <div onClick={() => cycleSetting('appearance', ['Ultra Dark', 'Classic Dark', 'Glass'])} className="flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98] select-none">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#FFCB74]/10 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFCB74]"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">Appearance</div>
                          <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Theme</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-[#FFCB74] tracking-[0.15em] px-3 py-1.5 bg-[#FFCB74]/10 rounded-lg border border-[#FFCB74]/20">{settings.appearance}</span>
                    </div>

                    {/* Default Mode Cycle */}
                    <div onClick={() => cycleSetting('defaultMode', ['Metro First', 'Fastest Only', 'Budget Priority'])} className="flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98] select-none">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#FFCB74]/10 transition-colors">
                          <Search size={18} className="text-[#FFCB74]" />
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">Default Mode</div>
                          <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Route Sorting</div>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-[10px] text-white/80 font-bold uppercase tracking-widest group-hover:border-[#FFCB74]/30 transition-all">{settings.defaultMode}</div>
                    </div>

                    {/* Data Privacy Toggle */}
                    <div onClick={() => toggleSetting('dataPrivacy')} className="flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98] select-none">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#FFCB74]/10 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFCB74]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <div>
                          <div className="text-white font-bold text-sm">Data Privacy</div>
                          <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{settings.dataPrivacy ? 'Encryption Active' : 'Encryption Off'}</div>
                        </div>
                      </div>
                      <div className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${settings.dataPrivacy ? 'bg-[#FFCB74]' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all duration-300 ${settings.dataPrivacy ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar / Schedule Section */}
                <div className="mb-6">
                  <CalendarSync />
                </div>

                {/* Security & Auth Section */}
                {!showPasswordChange ? (
                  <div className="flex flex-col gap-3">
                    <button onClick={handleSecurityClick} className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-[#e0e0e0] py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 border border-white/5 shadow-xl hover:border-white/10"><Lock size={14} className="text-[#FFCB74]" />Security & Auth</button>

                    {showSecurityMenu && (
                      <div className="bg-[#2a2a2a]/50 rounded-2xl border border-white/5 overflow-hidden animate-in fade-in duration-200">
                        <button onClick={handleChangePasswordClick} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5">
                          <div className="p-2 bg-[#FFCB74]/10 rounded-lg"><Lock size={16} className="text-[#FFCB74]" /></div>
                          <div className="text-left"><div className="text-sm font-bold text-white">Change Password</div><div className="text-[10px] text-white/30 mt-0.5">Update your account password</div></div>
                        </button>
                        <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5">
                          <div className="p-2 bg-emerald-500/10 rounded-lg"><Eye size={16} className="text-emerald-400" /></div>
                          <div className="text-left"><div className="text-sm font-bold text-white">Active Sessions</div><div className="text-[10px] text-white/30 mt-0.5">1 active session • This device</div></div>
                        </button>
                        <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5">
                          <div className="p-2 bg-blue-500/10 rounded-lg"><Fingerprint size={16} className="text-blue-400" /></div>
                          <div className="text-left"><div className="text-sm font-bold text-white">Two-Factor Auth</div><div className="text-[10px] text-white/30 mt-0.5">Not enabled • Recommended</div></div>
                        </button>
                        <button className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                          <div className="p-2 bg-purple-500/10 rounded-lg"><Shield size={16} className="text-purple-400" /></div>
                          <div className="text-left"><div className="text-sm font-bold text-white">Login History</div><div className="text-[10px] text-white/30 mt-0.5">View recent login activity</div></div>
                        </button>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button onClick={() => navigate("/search")} className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-[#e0e0e0] py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 border border-white/5 shadow-xl">Explore</button>
                      <button onClick={handleLogout} className="flex-1 bg-red-500/5 hover:bg-red-500/10 text-red-400 py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 border border-red-500/10 shadow-xl">Log Out</button>
                    </div>
                  </div>
                ) : (
                  <form ref={passwordRef} onSubmit={handleChangePassword} className="bg-gradient-to-br from-[#1c1c1c] to-[#111111] p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFCB74]/5 rounded-full blur-[60px] pointer-events-none"></div>

                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                      <div className="p-2 bg-[#FFCB74]/20 rounded-lg">
                        <Lock size={18} className="text-[#FFCB74]" />
                      </div>
                      Secure Update
                    </h3>

                    {message.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-3 border ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                        {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        {message.text}
                      </div>
                    )}
                    <div className="space-y-5 mb-8">
                      <div>
                        <label className="block text-[10px] text-white/30 mb-2 uppercase font-black tracking-[0.2em]">Current Password</label>
                        <input type="password" value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#FFCB74] transition-all duration-500 font-medium placeholder-white/10" placeholder="••••••••" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/30 mb-2 uppercase font-black tracking-[0.2em]">New Password</label>
                        <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#FFCB74] transition-all duration-500 font-medium placeholder-white/10" placeholder="••••••••" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/30 mb-2 uppercase font-black tracking-[0.2em]">Confirm Password</label>
                        <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#FFCB74] transition-all duration-500 font-medium placeholder-white/10" placeholder="••••••••" required />
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setShowPasswordChange(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 border border-white/5 active:scale-95 shadow-lg">Back</button>
                      <button type="submit" className="flex-1 bg-[#FFCB74] hover:bg-[#eebb55] text-[#111111] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 shadow-2xl shadow-[#FFCB74]/20 active:scale-95">Update</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacer for scrolling */}
        <div className="h-24 shrink-0"></div>
      </div>
    </div>
  )
}
