import { useEffect, useState, useRef } from "react"
import { getProfile, changePassword } from "../services/auth"
import { useNavigate } from "react-router-dom"
import { Lock, User, Mail, Calendar, LogOut, Search, CheckCircle, AlertTriangle } from "lucide-react"
export function Profile() {
  const [user, setUser] = useState(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem("token")
  const passwordRef = useRef(null)

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('userSettings')
    return saved ? JSON.parse(saved) : {
      notifications: true,
      appearance: 'Ultra Dark',
      defaultMode: 'Metro First',
      dataPrivacy: false
    }
  })

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
  }, [settings])

  const toggleNotifications = () => setSettings(s => ({ ...s, notifications: !s.notifications }))

  const cycleAppearance = () => {
    const modes = ['Ultra Dark', 'Classic Dark', 'Glass']
    const nextIdx = (modes.indexOf(settings.appearance) + 1) % modes.length
    setSettings(s => ({ ...s, appearance: modes[nextIdx] }))
  }

  const cycleMode = () => {
    const modes = ['Metro First', 'Fastest Only', 'Budget Priority']
    const nextIdx = (modes.indexOf(settings.defaultMode) + 1) % modes.length
    setSettings(s => ({ ...s, defaultMode: modes[nextIdx] }))
  }
  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(data)
        }
      })
      .catch((err) => {
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
    } catch (err) {
      setMessage({ type: 'error', text: "Something went wrong" })
    }
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
    <div style={{ fontFamily: "Space Grotesk" }} className="w-screen min-h-screen flex flex-col items-center py-12 px-6 bg-[#0a0a0a] relative overflow-y-auto">
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

                  <div onClick={toggleNotifications} className="flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#FFCB74]/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFCB74]"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Notifications</div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{settings.notifications ? 'Smart Alerts Enabled' : 'Alerts Paused'}</div>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${settings.notifications ? 'bg-[#FFCB74]' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-black rounded-full transition-all duration-300 ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>

                  <div onClick={cycleAppearance} className="flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#FFCB74]/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFCB74]"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Appearance</div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Global Theme</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#FFCB74] tracking-[0.2em] px-3 py-1 bg-[#FFCB74]/10 rounded-lg">{settings.appearance}</span>
                  </div>

                  <div onClick={cycleMode} className="flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#FFCB74]/10 transition-colors">
                        <Search size={18} className="text-[#FFCB74]" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Default Mode</div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">Priority Selection</div>
                      </div>
                    </div>
                    <div className="p-1 px-3 bg-white/5 rounded-lg border border-white/10 text-[10px] text-white/80 font-bold uppercase tracking-widest group-hover:border-[#FFCB74]/30 transition-all">{settings.defaultMode}</div>
                  </div>

                  <div onClick={() => setSettings(s => ({ ...s, dataPrivacy: !s.dataPrivacy }))} className="flex items-center justify-between group cursor-pointer transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#FFCB74]/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FFCB74]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Data Privacy</div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{settings.dataPrivacy ? 'Encryption Active' : 'Encryption Off'}</div>
                      </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${settings.dataPrivacy ? 'bg-[#FFCB74]' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-black rounded-full transition-all duration-300 ${settings.dataPrivacy ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5">
                  <button className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                    Clear Search History
                  </button>
                </div>
              </div>

              {!showPasswordChange ? (
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setShowPasswordChange(true); setTimeout(() => passwordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }} className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-[#e0e0e0] py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 border border-white/5 shadow-xl hover:border-white/10"><Lock size={14} className="text-[#FFCB74]" />Security & Auth</button>
                  <div className="flex gap-4">
                    <button onClick={() => navigate("/search")} className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-[#e0e0e0] py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 border border-white/5 shadow-xl">Explore</button>
                    <button onClick={handleLogout} className="flex-1 bg-red-500/5 hover:bg-red-500/10 text-red-400 py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 border border-red-500/10 shadow-xl">Log Out</button>
                  </div>
                </div>
              ) : (
                <form ref={passwordRef} onSubmit={handleChangePassword} className="bg-gradient-to-br from-[#1c1c1c] to-[#111111] p-8 rounded-[2rem] border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden">
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
                      <label className="block text-[10px] text-white/30 mb-2 uppercase font-black tracking-[0.2em]">Current Credential</label>
                      <input type="password" value={passwords.old} onChange={e => setPasswords({ ...passwords, old: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#FFCB74] transition-all duration-500 font-medium placeholder-white/10" placeholder="••••••••" required />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/30 mb-2 uppercase font-black tracking-[0.2em]">New Secret</label>
                      <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#FFCB74] transition-all duration-500 font-medium placeholder-white/10" placeholder="••••••••" required />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/30 mb-2 uppercase font-black tracking-[0.2em]">Verify Secret</label>
                      <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#FFCB74] transition-all duration-500 font-medium placeholder-white/10" placeholder="••••••••" required />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setShowPasswordChange(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 border border-white/5 active:scale-95 shadow-lg">Back</button>
                    <button type="submit" className="flex-1 bg-[#FFCB74] hover:bg-[#eebb55] text-[#111111] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 shadow-2xl shadow-[#FFCB74]/20 active:scale-95">Verify & Update</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
