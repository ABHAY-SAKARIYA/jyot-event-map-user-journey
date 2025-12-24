export default function MapBackground() {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none bg-[#e8eae6]">
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full"
            >
                <defs>
                    <pattern id="grass-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 2 5 Q 3 2 4 5 M 7 8 Q 8 5 9 8" fill="none" stroke="#d0d7cd" strokeWidth="0.2" />
                    </pattern>
                    {/* Soft Grain or Noise could go here */}
                </defs>

                {/* Background Texture */}
                <rect width="100" height="100" fill="url(#grass-pattern)" opacity="0.5" />

                {/* Organic Zoning / Ground - Soft Pastel Purple/Blue areas */}
                <path
                    d="M 10 40 Q 30 10 50 25 T 90 40 Q 95 65 75 80 T 35 90 Q 5 80 10 40 Z"
                    fill="#dce4f2" /* Soft blue-ish lavendar */
                    stroke="none"
                    className="drop-shadow-sm"
                />

                {/* River / Water Flow - Soft Blue */}
                <path
                    d="M 80 0 Q 70 20 85 40 T 80 100"
                    fill="none"
                    stroke="#c3dbf7"
                    strokeWidth="8"
                    strokeLinecap="round"
                />
                <path
                    d="M 80 0 Q 70 20 85 40 T 80 100"
                    fill="none"
                    stroke="#eef6ff"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    opacity="0.6"
                />

                {/* Roads - White, organic, prominent */}
                <g stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                    <path d="M 50 25 Q 60 30 75 40" />
                    <path d="M 50 25 Q 40 40 20 60" />
                    <path d="M 20 60 Q 30 70 35 80" />
                    <path d="M 75 40 Q 60 60 35 80" />
                    {/* Extra loops for visual density */}
                    <path d="M 20 60 Q 10 50 5 30" />
                    <path d="M 75 40 Q 90 30 100 25" />
                </g>

                {/* "Illustrated" Placeholders - Trees/Groves */}
                {/* We use emojis or simple shapes. Let's try groupings of circles for trees */}
                <g fill="#aeb9a9">
                    <circle cx="15" cy="20" r="3" />
                    <circle cx="12" cy="23" r="2.5" />
                    <circle cx="18" cy="22" r="2" />
                </g>
                <g fill="#aeb9a9">
                    <circle cx="85" cy="70" r="4" />
                    <circle cx="82" cy="74" r="3" />
                    <circle cx="89" cy="73" r="3" />
                </g>

                {/* Building Hints (Rects) */}
                <rect x="45" y="18" width="10" height="6" rx="1" fill="#e2d8ce" />
                <path d="M 44 18 L 50 14 L 56 18 Z" fill="#cfbba8" />

            </svg>
        </div>
    );
}
