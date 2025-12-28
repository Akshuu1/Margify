import { useLocation } from "react-router-dom";

export function RoutesPage() {
  const location = useLocation();

  // yahin se data aa raha hai (SearchLocation se)
  const { source, destination } = location.state || {};

  // safety check (agar direct /routes open ho)
  if (!source || !destination) {
    return (
      <div className="w-screen h-screen flex justify-center items-center text-[#e0e0e0]">
        <p>No route data found. Please search again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen">
      <div
        className="text-[#e0e0e0] w-screen h-screen flex flex-col px-[3rem] items-center"
        style={{ fontFamily: "Space Grotesk" }}
      >
        <h1 className="text-[7rem] font-[Kiona-Regular]">Margify</h1>

        <div className="bg-[#111111]/90 w-full rounded-3xl p-[2rem]">
          <div className="bg-[#FFCB74] p-[2rem] mt-[1rem] w-full text-[#111111] rounded-xl flex justify-around items-center">
            
            {/* SOURCE */}
            <div className="bg-[#2f2f2f] text-[#e0e0e0] flex justify-center items-center p-[2rem] rounded-lg w-1/3 h-8">
              <h2>{source.name}</h2>
            </div>

            <div className="bg-[#2f2f2f] h-[3px] w-[10rem]"></div>

            <div className="font-semibold">Found 4 routes</div>

            <svg
              className="rotate-90 w-[5rem] h-[3rem]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 15 15"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="m7.5.793l4.354 4.353l-.707.708L8 2.707V14H7V2.707L3.854 5.854l-.708-.708z"
                clipRule="evenodd"
              />
            </svg>

            {/* DESTINATION */}
            <div className="bg-[#2f2f2f] text-[#e0e0e0] flex justify-center items-center p-[2rem] rounded-lg w-1/3 h-8">
              <h2>{destination.name}</h2>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
