import { useEffect, useState } from "react"
import { getProfile } from "../services/protectedAuth"
import { useNavigate } from "react-router-dom"

export function Profile() {
  const [user, setUser] = useState(null)
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

  if (!user) {
    return (
      <div className="w-screen h-screen flex justify-center items-center text-[#e0e0e0] font-[Space Grotesk]">
        Loading...
      </div>
    )
  }
  const initials = user.name ? user.name.split(' ').map((n) => n[0]).join("").toUpperCase().slice(0, 2): "??"
  const name = user.name ? user.name : "Guest"
  const email = user.email ? user.email : "Not signed in"

  return (
    <div style={{ fontFamily: "Space Grotesk" }} className="w-screen h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <h1 className="font-[Kiona-Regular] text-[4rem] text-[#e0e0e0] text-center mb-8 tracking-wider">
          Profile
        </h1>
        <div className="bg-[#1c1c1c]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FFCB74] to-[#b7e28b] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <span className="text-[#111111] text-3xl font-bold font-[Kiona-Regular] tracking-widest">
              {initials}
            </span>
          </div>
          <h2 className="text-2xl text-[#e0e0e0] font-bold mb-1 capitalize">
            {name}
          </h2>
          <p className="text-[#888] text-sm mb-8">{email}</p>
          <div className="w-full flex flex-col gap-3">
            {isLoggedIn ? (
              <>
              <button onClick={() => navigate("/search")} className="w-full bg-[#2f2f2f] hover:bg-[#3f3f3f] text-[#e0e0e0] py-3 rounded-xl transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14"/></svg>
              Search Routes
            </button>
              <button onClick={handleLogout} className="w-full bg-[#FFCB74] hover:bg-[#eebb55] text-[#111111] py-3 rounded-xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 mt-2">
                Sign Out
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M9 20.975q-.425 0-.712-.288T8 20v-2h2v2h9V4h-9v2H8V4q0-.425.288-.712T9 3h9q.425 0 .713.288T19 4v16q0 .425-.288.713T18 21zm-4-6v-1.9H1v-2h4V9.125l3.95 3.95l-3.95 3.9"/></svg>
              </button>
            </>) : 
            <button onClick={()=> navigate('/login')} className="w-full bg-[#FFCB74] hover:bg-[#eebb55] text-[#111111] py-3 rounded-xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 mt-2">
                Go to Login
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M9 20.975q-.425 0-.712-.288T8 20v-2h2v2h9V4h-9v2H8V4q0-.425.288-.712T9 3h9q.425 0 .713.288T19 4v16q0 .425-.288.713T18 21zm-4-6v-1.9H1v-2h4V9.125l3.95 3.95l-3.95 3.9"/></svg>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
