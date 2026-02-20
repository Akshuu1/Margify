import { useState } from "react"
import { searchPlaces } from "../services/api"
import { useNavigate } from "react-router-dom"

export function SearchLocation() {
  const [sourceQuery, setSourceQuery] = useState("")
  const [destinationQuery, setDestinationQuery] = useState("")

  const [sourceResults, setSourceResults] = useState([])
  const [destinationResults, setDestinationResults] = useState([])

  const [sourceLocation, setSourceLocation] = useState(null)
  const [destinationLocation, setDestinationLocation] = useState(null)

  const navigate = useNavigate();

  const handleSourceChange = async (e) => {
    const val = e.target.value
    setSourceQuery(val)
    setSourceLocation(null)

    if (val.length < 3) {
      setSourceResults([])
      return
    }

    const places = await searchPlaces(val)
    setSourceResults(places)
  }

  const handleDestinationChange = async (e) => {
    const val = e.target.value
    setDestinationQuery(val)
    setDestinationLocation(null)

    if (val.length < 3) {
      setDestinationResults([])
      return
    }

    const places = await searchPlaces(val)
    setDestinationResults(places)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!sourceLocation || !destinationLocation) {
      alert("Please select both locations from suggestions")
      return
    }

    navigate('/routes', {
      state: {
        source: sourceLocation,
        destination: destinationLocation
      }
    })

  }

  return (
    <div style={{ fontFamily: "Space Grotesk" }} className="text-[#E0E0E0] flex flex-col justify-center items-center w-full min-h-screen px-4 py-10">
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] font-[Kiona-Regular] text-center">Margify</h1>
      <p className="text-sm md:text-base lg:text-[1rem] mb-8 mt-[-.5rem] text-center opacity-80 max-w-md">
        Intelligent multimodal route planning across India
      </p>

      <div className="bg-[#111111]/70 p-6 md:p-8 lg:p-[2rem] rounded-3xl w-full max-w-4xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0">
            <div className="flex flex-col items-start w-full lg:w-[45%] relative">
              <label className="text-[.8rem] ml-[8px] mb-1 font-bold tracking-widest uppercase opacity-60">Source</label>
              <input
                value={sourceQuery}
                onChange={handleSourceChange}
                placeholder="eg. Rishihood University"
                className="w-full bg-[#2F2F2F] border border-white/5 focus:border-[#FFCB74]/50 focus:outline-none transition-colors rounded-xl p-[.8rem] text-sm md:text-base"
              />
              {sourceResults.length > 0 && (
                <ul className="absolute top-[85px] w-full bg-[#1c1c1c] border border-white/10 rounded-xl max-h-60 overflow-y-auto z-20 shadow-2xl backdrop-blur-xl">
                  {sourceResults.map((place) => (
                    <li key={place.id} className="p-3 cursor-pointer hover:bg-[#2f2f2f] transition-colors border-b border-white/5 last:border-0"
                      onClick={() => {
                        setSourceQuery(place.name)
                        setSourceLocation(place)
                        setSourceResults([])
                      }}>
                      <div className="font-medium">{place.name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-center p-2 lg:mt-6">
              <svg
                className="rotate-90 lg:rotate-0 text-[#FFCB74] opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 5 7 7-7 7" /><path d="M19 12H5" />
              </svg>
            </div>

            <div className="flex flex-col items-start w-full lg:w-[45%] relative">
              <label className="text-[.8rem] ml-[8px] mb-1 font-bold tracking-widest uppercase opacity-60">Destination</label>
              <input
                value={destinationQuery}
                onChange={handleDestinationChange}
                placeholder="eg. Kashmere Gate ISBT"
                className="w-full bg-[#2F2F2F] border border-white/5 focus:border-[#FFCB74]/50 focus:outline-none transition-colors rounded-xl p-[.8rem] text-sm md:text-base"
              />
              {destinationResults.length > 0 && (
                <ul className="absolute top-[85px] w-full bg-[#1c1c1c] border border-white/10 rounded-xl max-h-60 overflow-y-auto z-20 shadow-2xl backdrop-blur-xl">
                  {destinationResults.map((place) => (
                    <li key={place.id} className="p-3 cursor-pointer hover:bg-[#2f2f2f] transition-colors border-b border-white/5 last:border-0" onClick={() => {
                      setDestinationQuery(place.name)
                      setDestinationLocation(place)
                      setDestinationResults([])
                    }}>
                      <div className="font-medium">{place.name}</div>
                    </li>
                  ))}
                </ul>)}
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#FFCB74] hover:bg-[#ffdfa0] transition-all transform active:scale-[0.98] mt-8 w-full text-[#111111] font-bold rounded-xl p-[1rem] shadow-lg shadow-[#FFCB74]/20"
          >
            Find your route
          </button>
        </form>
      </div>
    </div>
  )
}
