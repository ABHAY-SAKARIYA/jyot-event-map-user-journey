"use client";

import { useMemo } from "react";

/**
 * Parses SVG path data and extracts bounding box coordinates
 * This is a simplified parser that handles M, L, C, Q, A commands
 */
function parseSvgPathBounds(pathData) {
    if (!pathData) return null;

    const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi);
    if (!commands) return null;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let currentX = 0, currentY = 0;

    commands.forEach(cmd => {
        const type = cmd[0].toUpperCase();
        const args = cmd.slice(1).trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));

        const updateBounds = (x, y) => {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        };

        switch (type) {
            case 'M': // Move to
            case 'L': // Line to
                for (let i = 0; i < args.length; i += 2) {
                    currentX = args[i];
                    currentY = args[i + 1];
                    updateBounds(currentX, currentY);
                }
                break;
            case 'H': // Horizontal line
                currentX = args[0];
                updateBounds(currentX, currentY);
                break;
            case 'V': // Vertical line
                currentY = args[0];
                updateBounds(currentX, currentY);
                break;
            case 'C': // Cubic bezier
                for (let i = 0; i < args.length; i += 6) {
                    updateBounds(args[i], args[i + 1]);
                    updateBounds(args[i + 2], args[i + 3]);
                    currentX = args[i + 4];
                    currentY = args[i + 5];
                    updateBounds(currentX, currentY);
                }
                break;
            case 'Q': // Quadratic bezier
                for (let i = 0; i < args.length; i += 4) {
                    updateBounds(args[i], args[i + 1]);
                    currentX = args[i + 2];
                    currentY = args[i + 3];
                    updateBounds(currentX, currentY);
                }
                break;
            case 'A': // Arc
                for (let i = 0; i < args.length; i += 7) {
                    currentX = args[i + 5];
                    currentY = args[i + 6];
                    updateBounds(currentX, currentY);
                }
                break;
        }
    });

    if (minX === Infinity) return null;

    return { minX, minY, maxX, maxY };
}

/**
 * Calculates viewBox from multiple SVG elements
 */
export function calculateViewBoxFromChildren(children, padding = 0) {
    let globalMinX = Infinity, globalMinY = Infinity;
    let globalMaxX = -Infinity, globalMaxY = -Infinity;

    const processElement = (element) => {
        if (!element) return;

        // Handle arrays of elements
        if (Array.isArray(element)) {
            element.forEach(processElement);
            return;
        }

        // Handle React fragments
        if (element.type === Symbol.for('react.fragment')) {
            processElement(element.props.children);
            return;
        }

        const props = element.props || {};

        // Extract path data
        if (props.d) {
            const bounds = parseSvgPathBounds(props.d);
            if (bounds) {
                globalMinX = Math.min(globalMinX, bounds.minX);
                globalMinY = Math.min(globalMinY, bounds.minY);
                globalMaxX = Math.max(globalMaxX, bounds.maxX);
                globalMaxY = Math.max(globalMaxY, bounds.maxY);
            }
        }

        // Extract basic shapes (rect, circle, ellipse, line, polyline, polygon)
        if (element.type === 'rect') {
            const x = parseFloat(props.x || 0);
            const y = parseFloat(props.y || 0);
            const width = parseFloat(props.width || 0);
            const height = parseFloat(props.height || 0);
            globalMinX = Math.min(globalMinX, x);
            globalMinY = Math.min(globalMinY, y);
            globalMaxX = Math.max(globalMaxX, x + width);
            globalMaxY = Math.max(globalMaxY, y + height);
        }

        if (element.type === 'circle') {
            const cx = parseFloat(props.cx || 0);
            const cy = parseFloat(props.cy || 0);
            const r = parseFloat(props.r || 0);
            globalMinX = Math.min(globalMinX, cx - r);
            globalMinY = Math.min(globalMinY, cy - r);
            globalMaxX = Math.max(globalMaxX, cx + r);
            globalMaxY = Math.max(globalMaxY, cy + r);
        }

        if (element.type === 'ellipse') {
            const cx = parseFloat(props.cx || 0);
            const cy = parseFloat(props.cy || 0);
            const rx = parseFloat(props.rx || 0);
            const ry = parseFloat(props.ry || 0);
            globalMinX = Math.min(globalMinX, cx - rx);
            globalMinY = Math.min(globalMinY, cy - ry);
            globalMaxX = Math.max(globalMaxX, cx + rx);
            globalMaxY = Math.max(globalMaxY, cy + ry);
        }

        if (element.type === 'line') {
            const x1 = parseFloat(props.x1 || 0);
            const y1 = parseFloat(props.y1 || 0);
            const x2 = parseFloat(props.x2 || 0);
            const y2 = parseFloat(props.y2 || 0);
            globalMinX = Math.min(globalMinX, x1, x2);
            globalMinY = Math.min(globalMinY, y1, y2);
            globalMaxX = Math.max(globalMaxX, x1, x2);
            globalMaxY = Math.max(globalMaxY, y1, y2);
        }

        // Recursively process children
        if (props.children) {
            processElement(props.children);
        }
    };

    processElement(children);

    if (globalMinX === Infinity) {
        return "0 0 100 100"; // Default fallback
    }

    const width = globalMaxX - globalMinX;
    const height = globalMaxY - globalMinY;

    return `${globalMinX - padding} ${globalMinY - padding} ${width + padding * 2} ${height + padding * 2}`;
}

/**
 * SvgContainer component with automatic viewBox calculation
 */
export default function SvgContainer({
    children,
    viewBox,
    padding = 10,
    className = "",
    preserveAspectRatio = "",
    ...props
}) {
    const calculatedViewBox = useMemo(() => {
        if (viewBox) return viewBox; // Manual override
        return calculateViewBoxFromChildren(children, padding);
    }, [children, viewBox, padding]);

    return (
        <svg
            viewBox={calculatedViewBox}
            preserveAspectRatio={preserveAspectRatio}
            className={`w-full h-full ${className}`}
            {...props}
        >
            {children}
        </svg>
    );
}
