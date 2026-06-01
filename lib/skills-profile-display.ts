export const MAX_SKILL_LEVEL = 5.5;

export type SkillProfileNumbers = {
    overallLevel?: number;
    serving?: number;
    dinking?: number;
    dropShot?: number;
    reset?: number;
    volley?: number;
    footwork?: number;
};

export type SkillRow = {
    label: string;
    category: string;
    value: number;
};

const SKILL_DEFS = [
    { label: "Serving", category: "Serving", key: "serving" as const },
    { label: "Dinking", category: "Dinking", key: "dinking" as const },
    { label: "Drop Shot", category: "Drop Shot", key: "dropShot" as const },
    { label: "Reset", category: "Reset", key: "reset" as const },
    { label: "Volley", category: "Volley", key: "volley" as const },
    { label: "Footwork", category: "Footwork", key: "footwork" as const },
];

export function buildSkillRows(profile: SkillProfileNumbers): SkillRow[] {
    return SKILL_DEFS.filter((d) => typeof profile[d.key] === "number").map((d) => ({
        label: d.label,
        category: d.category,
        value: profile[d.key] as number,
    }));
}

export function buildRadarProgress(skillRows: SkillRow[]): Record<string, number> {
    const radar: Record<string, number> = {};
    skillRows.forEach((r) => {
        radar[r.category] = Math.min(100, (r.value / MAX_SKILL_LEVEL) * 100);
    });
    return radar;
}

export function lowestSkillRow(skillRows: SkillRow[]): SkillRow | null {
    if (skillRows.length === 0) return null;
    return skillRows.reduce((min, r) => (r.value < min.value ? r : min));
}
