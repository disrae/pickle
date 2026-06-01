const PROFILE_JSON_RE = /PROFILE:\s*\{[\s\S]*?\}/g;

/** Remove machine-readable PROFILE line; keep the coach's human reply. */
export function stripProfileFromCoachMessage(content: string): string {
    return content.replace(PROFILE_JSON_RE, "").trim();
}
