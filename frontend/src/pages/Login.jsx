import { useNavigate } from "react-router-dom"
import { loginUser } from "../services/auth"
import { useState } from "react"

export function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    const data = await loginUser({ email, password })
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      alert('Login Successful')
      navigate('/search')
    } else {
      alert(data.message)
    }
  }

  return (
    <div style={{ fontFamily: "Space Grotesk" }} className="flex justify-center items-center text-center px-4 min-h-screen w-screen">
      <div className="text-[#E0E0E0] w-full max-w-md sm:max-w-lg">
        <h1 className="font-[Kiona-Regular] text-[3.5rem] sm:text-[5rem] md:text-[7rem]">
          Margify
        </h1>
        <h2 className="text-[0.9rem] sm:text-[1rem] mb-4 -mt-2">
          Find Your Best Path
        </h2>
        <div className="bg-[#111111]/70 p-6 sm:p-8 rounded-3xl w-full">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col items-start w-full">
              <label className="text-[0.75rem] ml-2 mb-1">Email</label>
              <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Enter your Email" required className="w-full bg-[#2F2F2F] rounded-xl p-3 text-sm focus:outline-none" />
            </div>
            <div className="flex flex-col items-start w-full">
              <label className="text-[0.75rem] ml-2 mb-1">Password</label>
              <input minLength="6" onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Enter your Password" required className="w-full bg-[#2F2F2F] rounded-xl p-3 text-sm focus:outline-none" />
            </div>
            <a href="#" className="text-[0.7rem] ml-2 text-left block opacity-80 hover:opacity-100">
              Forgot your password?
            </a>
            <button type="submit" className="bg-[#FFCB74] w-full text-[#111111] rounded-xl py-2 text-sm font-medium hover:opacity-90 transition">
              Find your path
            </button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-1 h-[1px] bg-white/50"></div>
            <span className="mx-3 text-[0.7rem]">OR</span>
            <div className="flex-1 h-[1px] bg-white/50"></div>
          </div>
          <div className="flex justify-center mb-3">
            <svg width="30" height="30" viewBox="0 0 16 16"><path fill="#f44336" d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82l-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528L1.946 4.92q1.683-3.245 5.26-3.86" /><path fill="#ffc107" d="M2 11.116Q.527 8.038 1.946 4.92l2.148 1.658q-.343 1.356.16 2.744z" /><path fill="#448aff" d="M12.685 13.29l-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713l6.497.055q.616 3.345-1.423 6.032" /><path fill="#43a047" d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626l2.202 1.74a6.62 6.62 0 0 1-4.027 1.684Q3.82 14.524 2 11.116z" /></svg>
          </div>
          <button onClick={() => navigate("/signup")} className="text-[0.7rem] opacity-80 hover:opacity-100">
            Don’t have an account?
          </button>
        </div>
      </div>
    </div>
  )
}
