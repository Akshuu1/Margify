export function Signup (){
    return (
    <div style={{fontFamily:'Space Grotesk'}} className="flex justify-center items-center text-center px-4 absolute w-screen h-screen">
        <div className="text-[#E0E0E0]">
            <h1 className="text-[7rem] font-[Kiona-Regular]">Margify</h1>
            <h2 className="text-[1rem] mb-[1rem] mt-[-1rem]">Find Your Best Path </h2>
            <div className="bg-[#111111]/70 p-[2vw] leading-10 rounded-3xl w-[35rem] ">
                <form>
                    <div className="flex flex-col items-start">
                    <label className="text-[.8rem] ml-[8px]">Name</label>
                    <input type='text' name="Email" placeholder="Enter your name" required className="w-full bg-[#2F2F2F] rounded-xl p-[5px]"/>
                    </div>
                    <div className="flex flex-col items-start">
                    <label className="text-[.8rem] ml-[8px]">Email</label>
                    <input type='email' name="Email" placeholder="Enter your email" required className="w-full bg-[#2F2F2F] rounded-xl p-[5px]"/>
                    </div>
                    <div className="flex flex-col items-start">
                    <label className="text-[.8rem] ml-[8px]">Password</label>
                    <input type='password' name="Email" placeholder="Enter your password" className="w-full bg-[#2F2F2F] rounded-xl p-[5px]" required/>
                    </div>
                    <button type='submit' className="bg-[#FFCB74] mt-[1rem] w-full text-[#111111] rounded-xl p-[.3rem] ">Create your account</button>
                </form>
            <div className="flex justify-center items-center ">
            <div className="w-1/2 h-[.1rem] bg-white mr-[1rem]"></div>
            <div className="text-[.7rem]">OR</div>
            <div className="w-1/2 h-[.1rem] bg-white ml-[1rem]"></div>
            </div>
            <div className="flex justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><g fill="none" fill-rule="evenodd" clip-rule="evenodd"><path fill="#f44336" d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86" opacity="0.987"/><path fill="#ffc107" d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92" opacity="0.997"/><path fill="#448aff" d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49" opacity="0.999"/><path fill="#43a047" d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z" opacity="0.993"/></g></svg></div>
            </div>
        </div>
    </div>
    )
}