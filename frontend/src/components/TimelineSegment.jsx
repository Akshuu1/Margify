import { formatDuration, formatCurrency } from "../utils/format";

export function TimelineSegment({ segment, isLast }) {
    const { mode, from, to, duration, cost } = segment;

    const getIcon = (mode) => {
        switch (mode) {
            case 'WALK': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2M9.8 8.9L7 23h2.1l1.8-8l2.1 2v6h2v-7.5l-2.1-2l.6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1c-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" /></svg>;
            case 'BUS': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 20v2h2v-2h10v2h2v-2c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2V4c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2m2-16h10v3H7zm0 6h10v6H7zM7 4h10v3H7z" /></svg>;
            case 'AUTO': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M18.5 7h-2.1L15 4H9L7.6 7H5.5C4.7 7 4 7.7 4 8.5V11h16V8.5c0-.8-.7-1.5-1.5-1.5M7 15c0 1.1.9 2 2 2s2-.9 2-2s-.9-2-2-2s-2 .9-2 2m8 0c0 1.1.9 2 2 2s2-.9 2-2s-.9-2-2-2s-2 .9-2 2M5 12v3c0 .3.1.6.2.8c-.8.5-1.2 1.4-1.2 2.2c0 1.7 1.3 3 3 3c1.5 0 2.7-1 2.9-2.5h4.2c.2 1.5 1.4 2.5 2.9 2.5c1.7 0 3-1.3 3-3c0-.8-.4-1.7-1.2-2.2c.1-.2.2-.5.2-.8v-3z" /></svg>;
            case 'METRO': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4 0-8 .5-8 4v9.5C4 17.4 5.6 19 7.5 19L6 20.5v.5h2.2l2-2h3.6l2 2H18v-.5L16.5 19c1.9 0 3.5-1.6 3.5-3.5V6c0-3.5-3.6-4-8-4m0 2c3.7 0 6 .6 6 2v3.5h-5.5V6H12v3.5H6.5V6c0-1.4 2.3-2 6-2m-3.5 9c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5s1.5.7 1.5 1.5s-.7 1.5-1.5 1.5m7 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5s1.5.7 1.5 1.5s-.7 1.5-1.5 1.5" /></svg>;
            case 'TRAIN': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c-4 0-8 .5-8 4v9.5C4 17.4 5.6 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.9 0 3.5-1.6 3.5-3.5V6c0-3.5-3.6-4-8-4M7.5 17c-.8 0-1.5-.7-1.5-1.5S6.7 14 7.5 14s1.5.7 1.5 1.5S8.3 17 7.5 17m3.5-7H6V6h5v4m2 0V6h5v4h-5m3.5 7c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5s1.5.7 1.5 1.5s-.7 1.5-1.5 1.5" /></svg>;
            case 'CAB': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 11L6.5 6.5C6.9 5.3 8.3 4.4 9.6 4.4h4.8c1.3 0 2.7 .9 3.1 2.1L19 11v8c0 1.1-.9 2-2 2h-1c-1.1 0-2-.9-2-2v-1H10v1c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-8m2 4.5c.8 0 1.5-.7 1.5-1.5S7.8 12.5 7 12.5S5.5 13.2 5.5 14S6.2 15.5 7 15.5m10 0c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5s.7 1.5 1.5 1.5M7.5 10H17L16 6H8l-1 4Z" /></svg>;
            case 'BIKE': return <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2M5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5m0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5m5.8-9.5H19L14.2 16h-4.3c.4-.7.6-1.5.6-2.3c0-.9-.3-1.8-.9-2.5l1.6-2.4l.7 1.7h3.7v-1.5z" /></svg>;
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
