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

  const navigate = useNavigate()

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

    navigate('/routes',{
        state :{
            source: sourceLocation,
            destination :destinationLocation
        }
    })

    const payload = {
      from: {
        lat: sourceLocation.lat,
        lng: sourceLocation.lng,
      },
      to: {
        lat: destinationLocation.lat,
        lng: destinationLocation.lng,
      },
    }
  }

  return (
    <div style={{ fontFamily: "Space Grotesk" }} className="text-[#E0E0E0] flex flex-col justify-center items-center w-screen h-screen">
      <h1 className="text-[7rem] font-[Kiona-Regular]">Margify</h1>
      <p className="text-[1rem] mb-[1rem] mt-[-1rem]">
        Intelligent multimodal route planning across India
      </p>
      <div className="bg-[#111111]/70 p-[2rem] rounded-3xl w-[70%]">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-around items-start">
            <div className="flex flex-col items-start w-[28rem] p-[1rem] relative">
              <label className="text-[.8rem] ml-[8px]">Source</label>
              <input value={sourceQuery} onChange={handleSourceChange} placeholder="eg. Rishihood University" className="w-full bg-[#2F2F2F] rounded-xl p-[.6rem]"/>
              {sourceResults.length > 0 && (
                <ul className="absolute top-[80px] w-full bg-[#1c1c1c] rounded-xl max-h-40 overflow-y-auto z-10">
                  {sourceResults.map((place) => (
                    <li key={place.id} className="p-2 cursor-pointer hover:bg-[#2f2f2f]"
                      onClick={() => {
                        setSourceQuery(place.name)
                        setSourceLocation(place)
                        setSourceResults([])
                      }}>
                      {place.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <svg className="rotate-90 mt-[3rem]" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><path fill="currentColor" d="M25 42c-9.4 0-17-7.6-17-17S15.6 8 25 8s17 7.6 17 17s-7.6 17-17 17m0-32c-8.3 0-15 6.7-15 15s6.7 15 15 15s15-6.7 15-15s-6.7-15-15-15"/><path fill="currentColor" d="M33.3 26.7L25 18.4l-8.3 8.3l-1.4-1.4l9.7-9.7l9.7 9.7z"/><path fill="currentColor" d="M24 17h2v17h-2z" /></svg>
            <div className="flex flex-col items-start w-[28rem] p-[1rem] relative">
              <label className="text-[.8rem] ml-[8px]">Destination</label>
              <input value={destinationQuery} onChange={handleDestinationChange} placeholder="eg. Kashmere Gate ISBT" className="w-full bg-[#2F2F2F] rounded-xl p-[.6rem]"/>
              {destinationResults.length > 0 && (
                <ul className="absolute top-[80px] w-full bg-[#1c1c1c] rounded-xl max-h-40 overflow-y-auto z-10">
                  {destinationResults.map((place) => (
                    <li key={place.id} className="p-2 cursor-pointer hover:bg-[#2f2f2f]" onClick={() => {
                        setDestinationQuery(place.name)
                        setDestinationLocation(place)
                        setDestinationResults([]) }}>
                      {place.name}
                    </li>
                  ))}
                </ul>)}
            </div>
          </div>
          <button type="submit" className="bg-[#FFCB74] mt-[1rem] w-full text-[#111111] rounded-xl p-[.6rem]">
            Find your route
          </button>
        </form>
      </div>
    </div>
  )
}
