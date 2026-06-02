import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { LayoutAnimation, Platform, Text, TouchableOpacity, UIManager, View } from "react-native";
import { GlassContainer } from "./GlassContainer";
import { RadarChart } from "./RadarChart";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Skill categories with educational content
export const SKILL_CATEGORIES = [
    {
        name: "Serving",
        description: "The serve initiates every point and sets the tone for your offensive strategy. A strong serve can put opponents on the defensive immediately.",
        whenToUse: "Use deep serves to push opponents back, or spin serves to create awkward returns. Mix up placement to keep opponents guessing.",
        duprGuidance: "2.0-2.5: Basic serves with consistency\n3.0-3.5: Placement and depth control\n4.0+: Spin variations and strategic placement",
    },
    {
        name: "Dinking",
        description: "Soft shots hit from the non-volley zone that arc just over the net. Dinking is the foundation of advanced pickleball strategy and kitchen play.",
        whenToUse: "Use dinks to neutralize aggressive opponents, create opportunities for attack, and control the pace of the point. Essential in doubles play.",
        duprGuidance: "2.0-3.0: Consistent soft shots\n3.5-4.0: Cross-court control and angles\n4.5+: Pace variation and deception",
    },
    {
        name: "Drop Shot",
        description: "A soft shot from the baseline that lands in the kitchen, allowing you to move forward to the net. The transition shot of choice.",
        whenToUse: "Use after the return of serve or when you're at the baseline and want to move up. Essential for transitioning from defensive to offensive positioning.",
        duprGuidance: "3.0-3.5: Basic drop shot fundamentals\n4.0-4.5: Soft touch and consistency\n5.0+: Precision placement under pressure",
    },
    {
        name: "Reset",
        description: "A defensive shot that neutralizes your opponent's attack by dropping the ball softly into the kitchen, resetting the point to neutral.",
        whenToUse: "Use when receiving a hard drive or attack shot. Absorb the pace and drop it into the kitchen to regain control of the point.",
        duprGuidance: "3.5-4.0: Basic reset technique\n4.5+: Consistent resets under pressure\n5.0+: Counter-punching resets",
    },
    {
        name: "Volley",
        description: "Hitting the ball before it bounces, typically at the net. Volleys are crucial for finishing points and maintaining offensive pressure.",
        whenToUse: "Use volleys when at the kitchen line to put away high balls, block drives, or create sharp angles. Key for aggressive play.",
        duprGuidance: "2.5-3.5: Basic punch volleys\n4.0+: Hands battles and quick exchanges\n4.5+: Roll volleys and drop volleys",
    },
    {
        name: "Footwork",
        description: "Efficient movement and positioning on the court. Good footwork is the foundation that makes all other skills possible.",
        whenToUse: "Always. Proper footwork allows you to get in position, maintain balance, and execute shots effectively. Essential for court coverage.",
        duprGuidance: "All levels: Foundational skill\n3.0+: Split-step timing\n4.0+: Transition footwork and court positioning",
    },
];

const STRATEGY_CONTENT = {
    title: "Pickleball Strategy & Game Theory",
    sections: [
        {
            title: "Court Positioning",
            content: "The kitchen line is the most important position in pickleball. Work to get there quickly and maintain control. In doubles, move as a unit and cover your partner.",
        },
        {
            title: "Shot Selection",
            content: "High balls = attack opportunities. Low balls = reset or dink. Middle balls require reading your opponent's position. When in doubt, dink to their feet.",
        },
        {
            title: "The Transition Game",
            content: "The most vulnerable time is moving from baseline to kitchen line. Use drop shots to slow the pace, giving you time to move forward safely.",
        },
        {
            title: "Mental Game",
            content: "Stay patient. Many points are won by forcing errors rather than hitting winners. Consistency beats power at most levels. Play the percentages.",
        },
    ],
};

const DUPR_CONTENT = {
    title: "Understanding DUPR Ratings",
    sections: [
        {
            title: "What is DUPR?",
            content: "DUPR (Dynamic Universal Pickleball Rating) is the most accurate global rating system for pickleball. It ranges from 2.0 (beginner) to 8.0+ (professional), with most recreational players between 2.5-5.0.",
        },
        {
            title: "How Ratings Are Calculated",
            content: "DUPR uses a sophisticated algorithm based on match results against other rated players. It considers the rating difference, game score, and recency of matches. Every game counts, whether recreational or tournament play.",
        },
        {
            title: "Rating Ranges",
            content: "2.0-2.5: New to pickleball, learning basics\n3.0-3.5: Developing consistency and court awareness\n4.0-4.5: Strong fundamentals, strategic play\n5.0-5.5: Advanced skills, competitive player\n6.0+: Elite level, tournament competitor",
        },
        {
            title: "Improving Your DUPR",
            content: "Focus on consistency over power. Work on your weakest shots. Play against better players when possible. The drills in this app are organized to help you develop skills needed for each rating level.",
        },
    ],
};

const RULES_CONTENT = {
    title: "Official Pickleball Rules",
    sections: [
        {
            title: "The Serve",
            content: "Serve must be underhand with contact below the waist. Serve diagonally cross-court, clearing the kitchen. Only one serve attempt (no second serve). The serving team calls the score before serving.",
        },
        {
            title: "The Two-Bounce Rule",
            content: "Each side must let the ball bounce once before volleying. This means the serve must bounce, and the return of serve must bounce. After these two bounces, players can volley or play off the bounce.",
        },
        {
            title: "The Kitchen (Non-Volley Zone)",
            content: "You cannot volley while standing in the 7-foot kitchen zone. You can enter the kitchen to play a ball that has bounced. After volleying, your momentum cannot carry you into the kitchen.",
        },
        {
            title: "Scoring",
            content: "Games are typically played to 11, win by 2. Only the serving team can score points. In doubles, both players serve (except on the first service of the game) before side out.",
        },
        {
            title: "Faults",
            content: "Common faults include: hitting the ball out of bounds, failing to clear the net, volleying from the kitchen, violating the two-bounce rule, or being hit by the ball.",
        },
        {
            title: "Line Calls & Etiquette",
            content: "If the ball touches any part of a line, it's IN. EXCEPTION: On the serve, the kitchen line is SHORT (ball on the line = fault). Each team makes line calls on their side of the net. The receiving team calls the serve in or out. If you can't clearly see the ball out, call it IN. Only the player who can see the line should make the call. Speak up clearly: 'Out!' immediately, or say nothing (silence = in).",
        },
    ],
};

interface SkillRoadmapCardProps {
    /** Drill library completion % per category (0–100) */
    skillProgress: Record<string, number>;
    /** When true, radar is hidden (coach profile card shown above with rated levels) */
    hideRadar?: boolean;
    title?: string;
}

export function SkillRoadmapCard({
    skillProgress,
    hideRadar = false,
    title = "Your skill profile",
}: SkillRoadmapCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
    const [showStrategy, setShowStrategy] = useState(false);
    const [showDupr, setShowDupr] = useState(false);
    const [showRules, setShowRules] = useState(false);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            // Reset accordion states when collapsing
            setExpandedSkills(new Set());
            setShowStrategy(false);
            setShowDupr(false);
            setShowRules(false);
        }
    };

    const toggleSkill = (skillName: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newExpanded = new Set(expandedSkills);
        if (newExpanded.has(skillName)) {
            newExpanded.delete(skillName);
        } else {
            newExpanded.add(skillName);
        }
        setExpandedSkills(newExpanded);
    };

    const toggleStrategy = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowStrategy(!showStrategy);
    };

    const toggleDupr = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowDupr(!showDupr);
    };

    const toggleRules = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowRules(!showRules);
    };

    // Calculate overall progress
    const overallProgress = useMemo(() => {
        const values = Object.values(skillProgress);
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }, [skillProgress]);

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleExpanded}
            className="mb-4"
        >
            <GlassContainer
                glassEffectStyle="clear"
                style={{
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "rgba(18,23,15,0.08)",
                    backgroundColor: "#FFFFFF",
                }}
            >
                {/* Collapsed State */}
                {!isExpanded ? (
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="stats-chart" size={20} color="#3F7D20" />
                                <Text className="text-lg font-bold text-foreground ml-2">
                                    {title}
                                </Text>
                            </View>
                            <Text className="text-muted-foreground text-base">
                                {hideRadar
                                    ? `${overallProgress.toFixed(0)}% drills completed · Tap for guides`
                                    : `${overallProgress.toFixed(0)}% drill progress · Tap to explore`}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={24} color="#5c6454" />
                    </View>
                ) : (
                    // Expanded State
                    <View>
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Ionicons name="stats-chart" size={20} color="#3F7D20" />
                                <Text className="text-lg font-bold text-foreground ml-2">
                                    {title}
                                </Text>
                            </View>
                            <Ionicons name="chevron-up" size={24} color="#5c6454" />
                        </View>

                        {!hideRadar && <RadarChart skillProgress={skillProgress} />}

                        {/* Skill Sections */}
                        <View className="mt-6">
                            {SKILL_CATEGORIES.map((skill, index) => (
                                <View key={skill.name}>
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            toggleSkill(skill.name);
                                        }}
                                        activeOpacity={0.7}
                                        className="flex-row items-center justify-between py-3 border-t border-border"
                                    >
                                        <View className="flex-1 flex-row items-center">
                                            <Text className="text-foreground font-semibold text-base">
                                                {skill.name}
                                            </Text>
                                            <View className="ml-3 flex-1">
                                                {hideRadar && (
                                                    <Text className="text-muted-foreground text-xs mb-1">
                                                        Drills completed
                                                    </Text>
                                                )}
                                                <View
                                                    className="h-3 rounded-full overflow-hidden"
                                                    style={{ backgroundColor: "rgba(18,23,15,0.12)" }}
                                                >
                                                    <View
                                                        className="h-full bg-brand-strong rounded-full"
                                                        style={{
                                                            width: `${skillProgress[skill.name] || 0}%`,
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                            <Text className="ml-2 text-foreground text-base font-semibold w-10 text-right">
                                                {(skillProgress[skill.name] || 0).toFixed(0)}%
                                            </Text>
                                        </View>
                                        <Ionicons
                                            name={expandedSkills.has(skill.name) ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color="#5c6454"
                                        />
                                    </TouchableOpacity>

                                    {expandedSkills.has(skill.name) && (
                                        <View className="pb-3 pl-2">
                                            <Text className="text-foreground text-sm tracking-wide mb-2">
                                                {skill.description}
                                            </Text>
                                            <View className="bg-surface-2 rounded-lg p-3 mb-2">
                                            <Text className="text-brand-strong text-xs font-semibold mb-1">
                                                WHEN TO USE
                                                </Text>
                                                <Text className="text-foreground text-sm tracking-wide">
                                                    {skill.whenToUse}
                                                </Text>
                                            </View>
                                            <View className="bg-surface-2 rounded-lg p-3">
                                                <Text className="text-brand-strong text-xs font-semibold mb-1">
                                                    DUPR PROGRESSION
                                                </Text>
                                                <Text className="text-foreground text-sm tracking-wide">
                                                    {skill.duprGuidance}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Strategy Section */}
                        <View className="mt-2">
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleStrategy();
                                }}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-between py-3 border-t border-border"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="book" size={18} color="#3F7D20" />
                                    <Text className="text-foreground font-semibold text-base ml-2">
                                        {STRATEGY_CONTENT.title}
                                    </Text>
                                </View>
                                <Ionicons
                                    name={showStrategy ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#5c6454"
                                />
                            </TouchableOpacity>

                            {showStrategy && (
                                <View className="pb-3 pl-2">
                                    {STRATEGY_CONTENT.sections.map((section, idx) => (
                                        <View key={idx} className="mb-3">
                                            <Text className="text-brand-strong text-sm font-semibold mb-1">
                                                {section.title}
                                            </Text>
                                            <Text className="text-foreground text-sm tracking-wide">
                                                {section.content}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* DUPR Section */}
                        <View>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleDupr();
                                }}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-between py-3 border-t border-border"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="analytics" size={18} color="#3F7D20" />
                                    <Text className="text-foreground font-semibold text-base ml-2">
                                        {DUPR_CONTENT.title}
                                    </Text>
                                </View>
                                <Ionicons
                                    name={showDupr ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#5c6454"
                                />
                            </TouchableOpacity>

                            {showDupr && (
                                <View className="pb-3 pl-2">
                                    {DUPR_CONTENT.sections.map((section, idx) => (
                                        <View key={idx} className="mb-3">
                                            <Text className="text-brand-strong text-sm font-semibold mb-1">
                                                {section.title}
                                            </Text>
                                            <Text className="text-foreground text-sm tracking-wide">
                                                {section.content}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Rules Section */}
                        <View>
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleRules();
                                }}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-between py-3 border-t border-border"
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="clipboard" size={18} color="#3F7D20" />
                                    <Text className="text-foreground font-semibold text-base ml-2">
                                        {RULES_CONTENT.title}
                                    </Text>
                                </View>
                                <Ionicons
                                    name={showRules ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#5c6454"
                                />
                            </TouchableOpacity>

                            {showRules && (
                                <View className="pb-3 pl-2">
                                    {RULES_CONTENT.sections.map((section, idx) => (
                                        <View key={idx} className="mb-3">
                                            <Text className="text-brand-strong text-sm font-semibold mb-1">
                                                {section.title}
                                            </Text>
                                            <Text className="text-foreground text-sm tracking-wide">
                                                {section.content}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </GlassContainer>
        </TouchableOpacity>
    );
}

