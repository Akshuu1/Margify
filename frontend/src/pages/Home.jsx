import {gsap} from 'gsap';
import { useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Home() {
    
    const  word = "MARGIFY"
    const navigate = useNavigate()
    const lettersRef = useRef([])
    const containerRef = useRef(null)

    useEffect(() =>{
    const t1 = gsap.timeline({
        onComplete:() =>{
            navigate('/login')
        }
    })

    t1.from(lettersRef.current, {
    y: 80,
    opacity:0,
    duration: 0.5,
    stagger: 0.25,
    ease: "power3.out",
    })
    t1.to(
    lettersRef.current,
    {
        y:100,
        opacity: 1,
        duration: 1,       
        stagger: 0.25,
        ease: "power1.out",  
    },
    )
    t1.to(
    containerRef.current,
    {
        scale: 1.5,
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
    }
    )
},[])

    return (
        <div ref={containerRef} className="flex justify-center items-center text-center h-screen w-screen">
            <h1 style = {{fontFamily: 'Kiona-Regular'}} className="text-[#E0E0E0] text-[12rem]" >
                {word.split('').map((letter,i) =>(
                    <span key={i} ref ={(l) => (lettersRef.current[i] = l)} >{letter}</span>
                ))}
            </h1>
        </div>
    )
}