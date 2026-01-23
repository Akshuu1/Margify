import { useEffect, useState } from "react"
import { getProfile, changePassword } from "../services/protectedAuth"
import { useNavigate } from "react-router-dom"
import { Lock, User, Mail, Calendar, LogOut, Search, CheckCircle, AlertTriangle } from "lucide-react"

export function Profile() {
  const [user, setUser] = useState(null)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem("token")

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
        setUser(null)
        console.error("Failed to load profile", err)
        navigate("/login")
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
      if (res.message) { // Assuming success returns message, check your API
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
    <div style={{ fontFamily: "Space Grotesk" }} className="w-screen min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#FFCB74]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#1c1c1c] rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col gap-6">
        <h1 className="font-[Kiona-Regular] text-[3rem] md:text-[4rem] text-[#e0e0e0] text-center tracking-wider drop-shadow-lg">
          My Profile
        </h1>

        <div className="bg-[#1c1c1c]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-[#FFCB74] to-[#ffaa40] rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-[#2f2f2f]">
                <span className="text-[#111111] text-4xl font-bold font-[Kiona-Regular] tracking-widest">
                  {initials}
                </span>
              </div>
              <div className="px-4 py-1.5 bg-[#2f2f2f] rounded-full text-xs text-[#888] font-medium border border-white/5">
                Member since {joinDate}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-2">
                <User size={20} className="text-[#FFCB74]" />
                <h2 className="text-3xl text-[#e0e0e0] font-bold capitalize">{name}</h2>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <Mail size={16} className="text-[#666]" />
                <p className="text-[#888] text-base">{email}</p>
              </div>

              <div className="bg-[#2a2a2a]/50 p-4 rounded-2xl border border-white/5 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#aaa] text-sm">Account Status</span>
                  <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle size={12} /> Active</span>
                </div>
              </div>

              {!showPasswordChange ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="w-full bg-[#2f2f2f] hover:bg-[#3f3f3f] text-[#e0e0e0] py-3.5 rounded-xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 border border-white/5"
                  >
                    <Lock size={16} />
                    Change Password
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => navigate("/search")} className="flex-1 bg-white/5 hover:bg-white/10 text-[#e0e0e0] py-3.5 rounded-xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2">
                      <Search size={16} />
                      Find Routes
                    </button>
                    <button onClick={handleLogout} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 border border-red-500/10">
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="bg-[#2a2a2a] p-6 rounded-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Lock size={18} className="text-[#FFCB74]" />
                    Change Password
                  </h3>

                  {message.text && (
                    <div className={`p-3 rounded-xl text-sm mb-4 flex items-center gap-2 ${message.type === 'error' ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'}`}>
                      {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                      {message.text}
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5 uppercase font-bold tracking-wider">Current Password</label>
                      <input
                        type="password"
                        value={passwords.old}
                        onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFCB74] transition-colors"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5 uppercase font-bold tracking-wider">New Password</label>
                      <input
                        type="password"
                        value={passwords.new}
                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFCB74] transition-colors"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#888] mb-1.5 uppercase font-bold tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFCB74] transition-colors"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(false)}
                      className="flex-1 bg-[#3f3f3f] hover:bg-[#4f4f4f] text-white py-3 rounded-xl font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#FFCB74] hover:bg-[#eebb55] text-[#111111] py-3 rounded-xl font-bold transition-colors shadow-lg shadow-[#FFCB74]/20"
                    >
                      Update Password
                    </button>
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
