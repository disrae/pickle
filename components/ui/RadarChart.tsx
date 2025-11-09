import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";

// Skill categories - must match the ones from drills.tsx
const SKILL_CATEGORIES = [
    { name: "Serving" },
    { name: "Dinking" },
    { name: "Drop Shot" },
    { name: "Reset" },
    { name: "Volley" },
    { name: "Footwork" },
];

interface RadarChartProps {
    skillProgress: Record<string, number>; // category name -> progress 0-100
    size?: number;
}

export function RadarChart({ skillProgress, size = 320 }: RadarChartProps) {
    const center = size / 2;
    const maxRadius = size / 2 - 60; // Leave room for labels
    const numSkills = SKILL_CATEGORIES.length;

    // Calculate points for the skill polygon
    const skillPoints = useMemo(() => {
        return SKILL_CATEGORIES.map((skill, index) => {
            const angle = (Math.PI * 2 * index) / numSkills - Math.PI / 2; // Start from top
            const progress = skillProgress[skill.name] || 0;
            const radius = (progress / 100) * maxRadius;
            return {
                x: center + radius * Math.cos(angle),
                y: center + radius * Math.sin(angle),
                labelX: center + (maxRadius + 15) * Math.cos(angle),
                labelY: center + (maxRadius + 35) * Math.sin(angle),
                skill: skill.name,
            };
        });
    }, [skillProgress, numSkills, maxRadius, center]);

    // Create polygon points string
    const polygonPoints = skillPoints.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <View className="items-center justify-center">
            <Svg width={size} height={size}>
                {/* Background circles (grid) */}
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <Circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={maxRadius * scale}
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.2)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes lines */}
                {skillPoints.map((point, index) => (
                    <Line
                        key={`axis-${index}`}
                        x1={center}
                        y1={center}
                        x2={center + maxRadius * Math.cos((Math.PI * 2 * index) / numSkills - Math.PI / 2)}
                        y2={center + maxRadius * Math.sin((Math.PI * 2 * index) / numSkills - Math.PI / 2)}
                        stroke="rgba(148, 163, 184, 0.3)"
                        strokeWidth="1"
                    />
                ))}

                {/* Skill progress polygon */}
                <Polygon
                    points={polygonPoints}
                    fill="rgba(163, 230, 53, 0.3)"
                    stroke="rgba(163, 230, 53, 0.8)"
                    strokeWidth="2"
                />

                {/* Skill labels */}
                {skillPoints.map((point, index) => {
                    // Adjust text anchor based on position
                    let textAnchor: "start" | "middle" | "end" = "middle";
                    if (point.labelX < center - 10) textAnchor = "end";
                    else if (point.labelX > center + 10) textAnchor = "start";

                    return (
                        <SvgText
                            key={`label-${index}`}
                            x={point.labelX}
                            y={point.labelY}
                            fontSize="12"
                            fontWeight="600"
                            fill="#cbd5e1"
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

