"use client";

import CustomSvgBackground from "./CustomSvgBackground";


/**
 * Example custom SVG map component
 * Users can replace this with their own SVG paths
 */
export default function ExhibitionMap2() {
    return (
        <CustomSvgBackground
            padding={20}
            backgroundColor="#f0f4f8"
        >
            <image
                href="/image/exhibitionmapfinal2.jpg"
                x="0"
                y="0"
                width="1000"
                height="1000"
            />

        </CustomSvgBackground>
    );
}
