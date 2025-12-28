import { gsap } from "gsap"
import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const word = "MARGIFY"
  const navigate = useNavigate()
  const lettersRef = useRef([])
  const containerRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      navigate("/login")
      return
    }

    const tl = gsap.timeline({
      onComplete: () => navigate("/login"),
    })

    tl.fromTo(
  lettersRef.current,
  {
    y: -500,
    opacity: 0,
  },
  {
    y: 0,
    opacity: 1,
    duration: 2,
    delay:0.5,
    stagger: 0.15,
    ease: "power1.out",
  }
)

    tl.to(containerRef.current, {
      scale: 1.5,
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
    })
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center text-center min-h-screen w-screen "
    >
      <h1
        style={{ fontFamily: "Kiona-Regular" }}
        className="
          text-[#E0E0E0]
          text-[4rem]
          sm:text-[6rem]
          md:text-[9rem]
          lg:text-[12rem]
          leading-none
        "
      >
        {word.split("").map((letter, i) => (
          <span
            key={i}
            ref={(el) => (lettersRef.current[i] = el)}
            className="inline-block">
            {letter}
          </span>
        ))}
      </h1>
    </div>
  )
}
