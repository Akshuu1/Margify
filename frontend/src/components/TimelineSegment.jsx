import { formatDuration, formatCurrency } from "../utils/format";

export function TimelineSegment({ segment, isLast }) {
    const { mode, from, to, duration, cost } = segment;

    const getIcon = (mode) => {
        switch (mode) {
            case 'WALK': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><rect width="24" height="24" fill="none"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 4a1 1 0 1 0 2 0a1 1 0 1 0-2 0M7 21l3-4m6 4l-2-4l-3-3l1-6"/><path d="m6 12l2-3l4-1l3 3l3 1"/></g></svg>
            case 'BUS': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 20v2h2v-2h10v2h2v-2c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2V4c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2m2-16h10v3H7zm0 6h10v6H7zM7 4h10v3H7z" /></svg>;
            case 'AUTO': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36"><rect width="36" height="36" fill="none"/><path fill="currentColor" d="M19 9h2v11h-2z"/><path fill="currentColor" d="M10 9c-2 2-4 5-4 7c0 4 5 1 5 1V9z"/><circle cx="5" cy="32" r="4" fill="currentColor"/><circle cx="5" cy="32" r="2" fill="currentColor"/><path fill="currentColor" d="M29 23h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2m-10 0h-2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2"/><path fill="currentColor" d="M2 28.377c-1.387.225-2.581-1.152-1-2.435c2-1.623 7-2.435 9-1.623S12 33 11 33s-4-5.435-9-4.623"/><path fill="currentColor" d="M11 33h13c1 0 2 0 2-2c0-1 1-4 3-4s5 3 5 4s0 2 1 2s1-1 1-2V19h-8c0 3-1 8-1 8s-1-1-1 1c0 .606-1 2-2 2h-1c-1 0-2-.666-2-1.672V19c0-1-2-1-2 0v9.328C19 29.334 18.262 30 17.341 30h-3.33C13 30 12 29 12 28v-9H5c0 6 5 14 6 14"/><path fill="currentColor" d="M34 32c0 1 1 0 1-2c0-3-.833-5-5-5s-5 3-5 5c0 1 1 3 1 2s.667-2 4-2s4 1 4 2"/><path fill="currentColor" d="M12 19H5c0-1 1-3 1-3h4a1 1 0 0 0 1-1v-4s-2 0-2-2c0-.326.106-.652.25-.944C9.573 7.4 10.258 7 10.99 7H33c2 0 3 5 3 12h-8s0-8-3-8H12z"/><circle cx="30" cy="32" r="4" fill="currentColor"/><circle cx="30" cy="32" r="2" fill="currentColor"/><path fill="currentColor" d="M9 18.5v-1a.5.5 0 0 0-.5-.5H5.552C5.286 17.648 5 18.464 5 19h3.5a.5.5 0 0 0 .5-.5"/></svg>
            case 'METRO': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4 0-8 .5-8 4v9.5C4 17.4 5.6 19 7.5 19L6 20.5v.5h2.2l2-2h3.6l2 2H18v-.5L16.5 19c1.9 0 3.5-1.6 3.5-3.5V6c0-3.5-3.6-4-8-4m0 2c3.7 0 6 .6 6 2v3.5h-5.5V6H12v3.5H6.5V6c0-1.4 2.3-2 6-2m-3.5 9c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5s1.5.7 1.5 1.5s-.7 1.5-1.5 1.5m7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5s1.5.7 1.5 1.5s-.7 1.5-1.5 1.5" /></svg>;
            case 'TRAIN': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4 0-8 .5-8 4v9.5C4 17.4 5.6 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.9 0 3.5-1.6 3.5-3.5V6c0-3.5-3.6-4-8-4M7.5 17c-.8 0-1.5-.7-1.5-1.5S6.7 14 7.5 14s1.5.7 1.5 1.5S8.3 17 7.5 17m3.5-7H6V6h5v4m2 0V6h5v4h-5m3.5 7c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5s1.5.7 1.5 1.5s-.7 1.5-1.5 1.5" /></svg>;
            case 'CAB': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 640"><rect width="640" height="640" fill="none"/><path fill="currentColor" d="M256 64c-17.7 0-32 14.3-32 32v32h-8.9c-42 0-79.1 27.3-91.6 67.4l-23 73.5c-22 14.2-36.5 39-36.5 67.1v176c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32v-32h320v32c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V336c0-28.1-14.5-52.9-36.4-67.1l-23-73.5c-12.5-40.1-49.7-67.4-91.7-67.4H416V96c0-17.7-14.3-32-32-32zm-40.9 128H425c14 0 26.4 9.1 30.5 22.5l13 41.5H171.6l13-41.5c4.2-13.4 16.5-22.5 30.5-22.5M160 336c17.7 0 32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32m288 32c0-17.7 14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32"/></svg>
            case 'BIKE': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 6.937A7 7 0 0 1 19 13v8h-4.17a3.001 3.001 0 0 1-5.66 0H5v-8a7 7 0 0 1 3.5-6.063A4 4 0 0 1 8.125 6H5V4h3.126a4.002 4.002 0 0 1 7.748 0H19v2h-3.126q-.13.497-.373.937m-1.453 1.5c-.6.358-1.3.563-2.048.563a4 4 0 0 1-2.047-.563A5 5 0 0 0 7 13v6h2v-4a3 3 0 1 1 6 0v4h2v-6a5 5 0 0 0-2.953-4.563M12 14a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1m0-7a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/></svg>
            case 'PLANE': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1l3.5 1v-1.5L13 19v-5.5z" /></svg>;
            default: return null;
        }
    };

    return (
        <div className="flex gap-4 relative">
            <div className="flex flex-col items-center">
                <div className="text-2xl text-[#e0e0e0] z-10 bg-[#1c1c1c] rounded-full p-1">
                    {getIcon(mode)}
                </div>
                {!isLast && (
                    <div className="w-[2px] bg-[#4f4f4f] h-full absolute top-[30px] bottom-[-10px]"></div>
                )}
            </div>

            <div className="flex-1 pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-medium text-[#e0e0e0] capitalize">
                            {mode.toLowerCase()}
                        </h3>
                        <div className="text-xs text-[#888] mt-1 flex items-center gap-2">
                            <span>🕒 {formatDuration(duration)}</span>
                            <span>{formatCurrency(cost)} - {formatCurrency(Math.round(cost * 1.2))}</span>
                        </div>

                        <div className="mt-2 text-sm text-[#bbb]">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#888]"></div>
                                {from}
                            </div>
                            <div className="ml-[2.5px] border-l border-dashed border-[#555] h-3 my-1"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#888]"></div>
                                {to}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
