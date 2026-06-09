export function leagueName(courtName: string) {
    return `${courtName} League`;
}

export function leagueShortName(courtName: string) {
    return courtName;
}

export function leagueInviteMessage(courtName: string, rank: number | null) {
    const name = leagueName(courtName);
    if (rank != null) {
        return `Join me in the ${name} — I'm #${rank}!`;
    }
    return `Join the ${name} on WePickle!`;
}
