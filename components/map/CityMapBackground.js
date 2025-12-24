
export default function CityMapBackground() {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none bg-[#f4f7f6]">
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full"
            >
                <defs>
                    {/* Continuous City Grid Pattern */}
                    <pattern id="street-grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        {/* Main Block */}
                        <rect width="10" height="10" fill="none" />
                        {/* Streets */}
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e6ed" strokeWidth="0.5" />
                    </pattern>
                </defs>

                {/* 1. Base Layer: The Entire World is a City Grid */}
                <rect x="0" y="0" width="100" height="100" fill="url(#street-grid)" />

                {/* 2. Major Roads (Thicker Lines across the whole map) */}
                {/* Vertical Avenues */}
                <line x1="20" y1="0" x2="20" y2="100" stroke="white" strokeWidth="1.5" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="1.5" />
                <line x1="80" y1="0" x2="80" y2="100" stroke="white" strokeWidth="1.5" />
                {/* Horizontal Streets */}
                <line x1="0" y1="30" x2="100" y2="30" stroke="white" strokeWidth="1.5" />
                <line x1="0" y1="70" x2="100" y2="70" stroke="white" strokeWidth="1.5" />


                {/* 3. The "Ground" / Park Feature - Embedded IN the city */}
                {/* A large rounded rect area in the center-ish, sitting on top of the grid but below markers */}
                <g filter="url(#shadow)">
                    <path
                        d="M 25 25 H 75 Q 85 25 85 35 V 75 Q 85 85 75 85 H 25 Q 15 85 15 75 V 35 Q 15 25 25 25 Z"
                        fill="#eef5f2"  /* Very subtle green-ish off-white for park/ground feel */
                        stroke="#dcece5"
                        strokeWidth="1"
                    />
                </g>

                {/* 4. Details within the Ground to show it's a specific zone */}
                <circle cx="50" cy="55" r="12" fill="#dcece5" opacity="0.4" /> {/* Central Plaza area */}

                {/* 5. A river or water feature running THROUGH the city (optional, nice touch) */}
                <path
                    d="M 85 0 Q 80 20 90 40 T 85 100"
                    fill="none"
                    stroke="#dbeef9"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.6"
                />

            </svg>
        </div>
    );
}
