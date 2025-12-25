
import mapConfig from "@/data/mapConfig.json";

export default function CityMapBackground({ config }) {
    const { city, ground } = config || mapConfig;

    // Calculate Ground centering
    const x = (100 - ground.width) / 2;
    const y = (100 - ground.height) / 2;

    // Helper to parse radius: number or string "tl tr br bl"
    const getRadii = (r) => {
        if (typeof r === 'number') return [r, r, r, r];
        if (typeof r === 'string') {
            const parts = r.split(' ').map(s => parseFloat(s));
            if (parts.length === 1 && !isNaN(parts[0])) return [parts[0], parts[0], parts[0], parts[0]];
            // Support 4 values: TL TR BR BL
            if (parts.length === 4 && !parts.some(isNaN)) return parts;
        }
        return [0, 0, 0, 0];
    };

    const [tl, tr, br, bl] = getRadii(ground.cornerRadius);

    // Generate Path Data for Rounded Rect with individual corners
    const w = ground.width;
    const h = ground.height;

    // Path drawing logic (clockwise from top-left)
    const d = [
        `M ${x + tl} ${y}`,
        `L ${x + w - tr} ${y}`,
        `Q ${x + w} ${y} ${x + w} ${y + tr}`,
        `L ${x + w} ${y + h - br}`,
        `Q ${x + w} ${y + h} ${x + w - br} ${y + h}`,
        `L ${x + bl} ${y + h}`,
        `Q ${x} ${y + h} ${x} ${y + h - bl}`,
        `L ${x} ${y + tl}`,
        `Q ${x} ${y} ${x + tl} ${y}`,
        `Z`
    ].join(" ");

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none bg-[#f4f7f6]">
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="w-full h-full"
            >
                <defs>
                    {/* Shadow Filter REMOVED for mobile performance */}
                    {/* Replaced with simple fake shadow shape below */}

                    {/* Continuous City Grid Pattern (Configurable) */}
                    <pattern
                        id="street-grid"
                        x="0"
                        y="0"
                        width={city.gridSize}
                        height={city.gridSize}
                        patternUnits="userSpaceOnUse"
                    >
                        {/* Main Block */}
                        <rect width={city.gridSize} height={city.gridSize} fill="none" />
                        {/* Streets */}
                        <path
                            d={`M ${city.gridSize} 0 L 0 0 0 ${city.gridSize}`}
                            fill="none"
                            stroke={city.streetColor}
                            strokeWidth={city.strokeWidth}
                        />
                    </pattern>
                </defs>

                {/* 1. Base Layer: The Entire World is a City Grid */}
                <rect x="0" y="0" width="100" height="100" fill="url(#street-grid)" />

                {/* 2. Major Roads (Thicker Lines across the whole map) */}
                {/* We draw these at fixed 1/3 and 2/3 positions or customizable? Keeping fixed for now as "Main Artery" */}
                {/* Note: Can be optimized to simple paths if needed, but lines are cheap */}
                <line x1="33" y1="0" x2="33" y2="100" stroke="white" strokeWidth="1.5" />
                <line x1="66" y1="0" x2="66" y2="100" stroke="white" strokeWidth="1.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="1.5" />


                {/* 3. The "Ground" / Park Feature */}
                {/* Fake Shadow using a duplicated path underneath - Cheap Performance */}
                <path
                    d={d}
                    transform="translate(0, 1)" // Simple offset
                    fill="#000000"
                    opacity="0.05"
                    stroke="none"
                />

                {/* The Main Ground Shape */}
                <path
                    d={d}
                    fill={ground.color}
                    stroke={ground.borderColor}
                    strokeWidth={ground.borderWidth}
                />

                {/* 4. Details within the Ground */}
                <circle cx="50" cy="50" r="2" fill={ground.borderColor} opacity="0.3" />

                {/* 5. Water feature */}
                <path
                    d="M 90 0 Q 85 20 95 40 T 90 100"
                    fill="none"
                    stroke="#dbeef9"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.5"
                />

            </svg>
        </div>
    );
}
