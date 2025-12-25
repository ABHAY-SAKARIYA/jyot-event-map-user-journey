"use client";

import SvgContainer from "./SvgContainer";

/**
 * CustomSvgBackground - Renders custom SVG paths with auto-sizing viewBox
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - SVG path elements and shapes
 * @param {string} [props.viewBox] - Manual viewBox override (e.g., "0 0 100 100")
 * @param {number} [props.padding=10] - Padding around the content for auto-calculated viewBox
 * @param {string} [props.backgroundColor="#e8eae6"] - Background color
 * @param {string} [props.className] - Additional CSS classes
 */
export default function CustomSvgBackground({
    children,
    viewBox,
    padding = 10,
    backgroundColor = "#e8eae6",
    className = "",
    ...props
}) {
    return (
        <div
            className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
            style={{ backgroundColor }}
        >
            <SvgContainer
                viewBox={viewBox}
                padding={padding}
                preserveAspectRatio="xMidYMid meet"
                {...props}
            >
                {children}
            </SvgContainer>
        </div>
    );
}
