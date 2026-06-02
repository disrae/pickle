import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";

const SKILL_CATEGORIES = [
    { name: "Serving" },
    { name: "Dinking" },
    { name: "Drop Shot" },
    { name: "Reset" },
    { name: "Volley" },
    { name: "Footwork" },
];

/** High-contrast chart tokens for outdoor / older-eye readability on light cards */
const INK = "#12170f";
const GRID = "rgba(18, 23, 15, 0.20)";
const AXIS = "rgba(18, 23, 15, 0.28)";
const POLYGON_FILL = "rgba(63, 125, 32, 0.45)";
const POLYGON_STROKE = "#2E5C16";
const VERTEX_FILL = "#3F7D20";

interface RadarChartProps {
    skillProgress: Record<string, number>;
    size?: number;
}

export function RadarChart({ skillProgress, size = 320 }: RadarChartProps) {
    const center = size / 2;
    const maxRadius = size / 2 - 56;
    const numSkills = SKILL_CATEGORIES.length;

    const skillPoints = useMemo(() => {
        return SKILL_CATEGORIES.map((skill, index) => {
            const angle = (Math.PI * 2 * index) / numSkills - Math.PI / 2;
            const progress = skillProgress[skill.name] || 0;
            const radius = (progress / 100) * maxRadius;
            return {
                x: center + radius * Math.cos(angle),
                y: center + radius * Math.sin(angle),
                labelX: center + (maxRadius + 18) * Math.cos(angle),
                labelY: center + (maxRadius + 32) * Math.sin(angle),
                skill: skill.name,
            };
        });
    }, [skillProgress, numSkills, maxRadius, center]);

    const polygonPoints = skillPoints.map((p) => `${p.x},${p.y}`).join(" ");

    return (
        <View className="items-center justify-center">
            <Svg width={size} height={size}>
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <Circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={maxRadius * scale}
                        fill="none"
                        stroke={GRID}
                        strokeWidth={scale === 1 ? 1.5 : 1}
                    />
                ))}

                {skillPoints.map((_, index) => (
                    <Line
                        key={`axis-${index}`}
                        x1={center}
                        y1={center}
                        x2={center + maxRadius * Math.cos((Math.PI * 2 * index) / numSkills - Math.PI / 2)}
                        y2={center + maxRadius * Math.sin((Math.PI * 2 * index) / numSkills - Math.PI / 2)}
                        stroke={AXIS}
                        strokeWidth={1.25}
                    />
                ))}

                <Polygon
                    points={polygonPoints}
                    fill={POLYGON_FILL}
                    stroke={POLYGON_STROKE}
                    strokeWidth={2.5}
                />

                {skillPoints.map((point, index) => (
                    <Circle
                        key={`vertex-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={4}
                        fill={VERTEX_FILL}
                        stroke={INK}
                        strokeWidth={1}
                    />
                ))}

                {skillPoints.map((point, index) => {
                    let textAnchor: "start" | "middle" | "end" = "middle";
                    if (point.labelX < center - 10) textAnchor = "end";
                    else if (point.labelX > center + 10) textAnchor = "start";

                    return (
                        <SvgText
                            key={`label-${index}`}
                            x={point.labelX}
                            y={point.labelY}
                            fontSize="13"
                            fontWeight="700"
                            fill={INK}
                            textAnchor={textAnchor}
                            alignmentBaseline="middle"
                        >
                            {point.skill}
                        </SvgText>
                    );
                })}
            </Svg>
        </View>
    );
}
