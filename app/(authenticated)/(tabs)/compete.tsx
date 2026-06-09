import { ChallengeSheet } from "@/components/compete/ChallengeSheet";
import { NewTeamSheet } from "@/components/compete/NewTeamSheet";
import { ReportScoreSheet } from "@/components/compete/ReportScoreSheet";
import { Background } from "@/components/ui/Background";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { Header } from "@/components/ui/header";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useHeaderHeight } from "@/lib/header-layout";
import { leagueName } from "@/lib/league";
import { useTabBarHeight } from "@/lib/tab-bar-layout";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";

import { useRouter } from "expo-router";
import { useState, type ComponentProps } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    type ViewStyle,
} from "react-native";

type TopTab = "ladder" | "teams";
type LadderFormat = "doubles" | "singles";
type TeamSection = "mine" | "browse";
type IoniconName = ComponentProps<typeof Ionicons>["name"];

const BRAND_GREEN = "#3F7D20";
const BRAND_GREEN_DARK = "#244B16";
const INK = "#12170F";
const MUTED_INK = "#5c6454";

type ChallengeTarget = {
    opponentId: Id<"users">;
    opponentTeamId?: Id<"teams">;
};

type ReportTarget = {
    matchId?: Id<"matches">;
    challengeId?: Id<"challenges">;
    courtId: Id<"courts">;
    format: "doubles" | "singles";
    p1Id: Id<"users">;
    p2Id?: Id<"users">;
    p3Id: Id<"users">;
    p4Id?: Id<"users">;
    team1Id?: Id<"teams">;
    team2Id?: Id<"teams">;
    team1Name: string;
    team2Name: string;
    isConfirming?: boolean;
};

export default function CompeteScreen() {
    const tabBarHeight = useTabBarHeight();
    const headerHeight = useHeaderHeight();
    const router = useRouter();

    const [topTab, setTopTab] = useState<TopTab>("ladder");
    const [ladderFormat, setLadderFormat] = useState<LadderFormat>("doubles");
    const [teamSection, setTeamSection] = useState<TeamSection>("mine");
    const [challengeTarget, setChallengeTarget] = useState<ChallengeTarget | null>(null);
    const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
    const [showNewTeam, setShowNewTeam] = useState(false);

    const court = useQuery(api.courts.getDefault);
    const leagueSummary = useQuery(
        api.league.leagueSummary,
        court ? { courtId: court._id } : "skip"
    );
    const currentUser = useQuery(api.users.currentUser);
    const pendingConfirm = useQuery(api.challenges.pendingConfirmation);
    const headerTitle = court ? leagueName(court.name) : "Standings";

    const openChallenge = (target: ChallengeTarget) => setChallengeTarget(target);
    const openReport = (target: ReportTarget) => setReportTarget(target);

    return (
        <Background>
            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{
                    paddingTop: headerHeight + 8,
                    paddingBottom: tabBarHeight + 16,
                }}
            >
                {/* Pending confirmation banner */}
                {pendingConfirm && pendingConfirm.length > 0 && court && currentUser && (
                    <View style={{ marginBottom: 12 }}>
                        {pendingConfirm.map((match) => (
                            <TouchableOpacity
                                key={match._id}
                                activeOpacity={0.8}
                                onPress={() =>
                                    openReport({
                                        matchId: match._id,
                                        courtId: match.courtId,
                                        format: match.format,
                                        p1Id: match.p1Id,
                                        p2Id: match.p2Id,
                                        p3Id: match.p3Id,
                                        p4Id: match.p4Id,
                                        team1Id: match.team1Id,
                                        team2Id: match.team2Id,
                                        team1Name: "Your side",
                                        team2Name: "Opponent",
                                        isConfirming: true,
                                    })
                                }
                            >
                                <GlassContainer
                                    style={{
                                        borderRadius: 16,
                                        padding: 14,
                                        marginBottom: 8,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        borderWidth: 1,
                                        borderColor: "rgba(245,158,11,0.4)",
                                    }}
                                >
                                    <Ionicons name="alert-circle" size={20} color="#B45309" />
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 13 }}>
                                            Confirm match result
                                        </Text>
                                        <Text style={{ color: "#5c6454", fontSize: 12 }}>
                                            Your opponent reported the score — tap to confirm
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="#B45309" />
                                </GlassContainer>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {leagueSummary && (
                    <LeagueContextStrip
                        memberCount={leagueSummary.memberCount}
                        myRank={leagueSummary.myRank}
                        myRating={leagueSummary.myRating}
                    />
                )}

                {/* Top control: Ladder | Teams */}
                <TopControl value={topTab} onChange={setTopTab} />

                {topTab === "ladder" ? (
                    <LadderSection
                        format={ladderFormat}
                        onFormatChange={setLadderFormat}
                        courtId={court?._id}
                        courtName={court?.name}
                        router={router}
                        onChallenge={openChallenge}
                    />
                ) : (
                    <TeamsSection
                        section={teamSection}
                        onSectionChange={setTeamSection}
                        courtId={court?._id}
                        courtName={court?.name}
                        router={router}
                        onChallenge={openChallenge}
                        onNewTeam={() => setShowNewTeam(true)}
                    />
                )}
            </ScrollView>

            <Header title={headerTitle} titleSize="text-2xl" />

            {/* Challenge sheet */}
            {court && (
                <ChallengeSheet
                    isVisible={!!challengeTarget}
                    onClose={() => setChallengeTarget(null)}
                    preselectedOpponentId={challengeTarget?.opponentId}
                    preselectedOpponentTeamId={challengeTarget?.opponentTeamId}
                    courtId={court._id}
                />
            )}

            {/* New team sheet */}
            <NewTeamSheet
                isVisible={showNewTeam}
                onClose={() => setShowNewTeam(false)}
                courtId={court?._id}
            />

            {/* Report / confirm score sheet */}
            <ReportScoreSheet
                isVisible={!!reportTarget}
                onClose={() => setReportTarget(null)}
                match={reportTarget}
                isConfirming={reportTarget?.isConfirming}
                onConfirmed={() => setReportTarget(null)}
            />
        </Background>
    );
}

// ---------------------------------------------------------------------------
// Top control
// ---------------------------------------------------------------------------

function TopControl({
    value,
    onChange,
}: {
    value: TopTab;
    onChange: (v: TopTab) => void;
}) {
    return (
        <PillSwitch
            value={value}
            onChange={onChange}
            variant="primary"
            options={[
                {
                    value: "ladder",
                    label: "Ladder",
                    helper: "Rankings",
                    icon: "podium-outline",
                },
                {
                    value: "teams",
                    label: "Teams",
                    helper: "Partners",
                    icon: "people-outline",
                },
            ]}
            style={{ marginBottom: 16 }}
        />
    );
}

function PillSwitch<T extends string>({
    value,
    onChange,
    options,
    variant = "compact",
    style,
}: {
    value: T;
    onChange: (value: T) => void;
    options: {
        value: T;
        label: string;
        icon: IoniconName;
        helper?: string;
    }[];
    variant?: "primary" | "compact";
    style?: ViewStyle;
}) {
    const isPrimary = variant === "primary";

    return (
        <GlassContainer
            style={[
                {
                    padding: isPrimary ? 6 : 4,
                    flexDirection: "row",
                    borderRadius: isPrimary ? 24 : 999,
                    borderColor: "rgba(18,23,15,0.10)",
                    backgroundColor: "rgba(255,255,255,0.92)",
                },
                style,
            ]}
        >
            {options.map((option) => {
                const active = value === option.value;

                return (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        activeOpacity={0.78}
                        style={isPrimary ? { flex: 1 } : undefined}
                    >
                        <View
                            style={{
                                minHeight: isPrimary ? 58 : 38,
                                paddingHorizontal: isPrimary ? 12 : 14,
                                paddingVertical: isPrimary ? 10 : 8,
                                borderRadius: 999,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: isPrimary ? 9 : 6,
                                backgroundColor: active
                                    ? isPrimary
                                        ? BRAND_GREEN_DARK
                                        : "rgba(63,125,32,0.12)"
                                    : "transparent",
                                borderWidth: 1,
                                borderColor: active
                                    ? isPrimary
                                        ? "rgba(63,125,32,0.95)"
                                        : "rgba(63,125,32,0.28)"
                                    : "transparent",
                            }}
                        >
                            <View
                                style={{
                                    width: isPrimary ? 30 : 20,
                                    height: isPrimary ? 30 : 20,
                                    borderRadius: 999,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: active
                                        ? isPrimary
                                            ? "rgba(255,255,255,0.16)"
                                            : "rgba(63,125,32,0.14)"
                                        : "rgba(18,23,15,0.06)",
                                }}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={isPrimary ? 17 : 13}
                                    color={active ? (isPrimary ? "#FFFFFF" : BRAND_GREEN) : MUTED_INK}
                                />
                            </View>
                            <View style={{ alignItems: isPrimary ? "flex-start" : "center" }}>
                                <Text
                                    style={{
                                        color: active ? (isPrimary ? "#FFFFFF" : BRAND_GREEN_DARK) : INK,
                                        fontWeight: active ? "800" : "700",
                                        fontSize: isPrimary ? 15 : 13,
                                        letterSpacing: isPrimary ? 0.1 : 0.15,
                                    }}
                                >
                                    {option.label}
                                </Text>
                                {isPrimary && option.helper && (
                                    <Text
                                        style={{
                                            marginTop: 1,
                                            color: active ? "rgba(255,255,255,0.72)" : MUTED_INK,
                                            fontWeight: "600",
                                            fontSize: 11,
                                        }}
                                    >
                                        {option.helper}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </GlassContainer>
    );
}

// ---------------------------------------------------------------------------
// Ladder section
// ---------------------------------------------------------------------------

function LeagueContextStrip({
    memberCount,
    myRank,
    myRating,
}: {
    memberCount: number;
    myRank: number | null;
    myRating: number | null;
}) {
    const rankLabel =
        myRank != null && myRating != null
            ? `You're #${myRank} · ${myRating} rating`
            : "Play a match to get ranked";

    return (
        <GlassContainer
            style={{
                borderRadius: 16,
                padding: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "rgba(245,158,11,0.22)",
            }}
        >
            <Text style={{ color: "#B45309", fontWeight: "800", fontSize: 14 }}>{rankLabel}</Text>
            <Text style={{ color: "#5c6454", fontSize: 13, marginTop: 4 }}>
                {memberCount} {memberCount === 1 ? "member" : "members"} in this league
            </Text>
        </GlassContainer>
    );
}

function LadderSection({
    format,
    onFormatChange,
    courtId,
    courtName,
    router,
    onChallenge,
}: {
    format: LadderFormat;
    onFormatChange: (f: LadderFormat) => void;
    courtId: any;
    courtName?: string;
    router: any;
    onChallenge: (t: ChallengeTarget) => void;
}) {
    const scheduled = useQuery(api.challenges.myScheduledMatches);
    const pendingDebrief = useQuery(api.challenges.pendingDebrief);
    const activeChallenges = useQuery(api.challenges.myChallenges);
    const doublesLadder = useQuery(api.teams.teamsByRating, { courtId });
    const singlesLadder = useQuery(api.challenges.singlesLadder, { courtId });
    const receivedPending = Array.from(
        new Map(
            (activeChallenges ?? [])
                .filter((c) => c.status === "pending")
                .map((c) => [c._id, c])
        ).values()
    );

    return (
        <View>
            {/* Pending challenge scheduling */}
            {receivedPending.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                    {receivedPending.map((challenge) => (
                        <PendingChallengeCard key={challenge._id} challenge={challenge} />
                    ))}
                </View>
            )}

            {/* Debrief banner */}
            {pendingDebrief && pendingDebrief.length > 0 && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                        router.push({
                            pathname: "/(authenticated)/(tabs)/coach/chat",
                            params: { debriefMatchId: pendingDebrief[0]._id },
                        })
                    }
                >
                    <GlassContainer
                        style={{
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "rgba(245, 158, 11, 0.5)",
                        }}
                    >
                        <Ionicons name="chatbubble-ellipses" size={22} color="#B45309" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text
                                style={{
                                    color: "#B45309",
                                    fontWeight: "700",
                                    fontSize: 14,
                                }}
                            >
                                Post-match debrief ready
                            </Text>
                            <Text style={{ color: "#5c6454", fontSize: 12, marginTop: 2 }}>
                                Your coach wants to hear about the game
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#B45309" />
                    </GlassContainer>
                </TouchableOpacity>
            )}

            {/* Upcoming matches strip */}
            {scheduled && scheduled.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                    <SectionHeader label="Upcoming matches" />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {scheduled.slice(0, 3).map((sm) => (
                            <UpcomingMatchCard key={sm._id} match={sm} />
                        ))}
                    </ScrollView>
                </View>
            )}

            <PillSwitch
                value={format}
                onChange={onFormatChange}
                options={[
                    { value: "doubles", label: "Doubles", icon: "people-outline" },
                    { value: "singles", label: "Singles", icon: "person-outline" },
                ]}
                style={{ marginBottom: 12, alignSelf: "flex-start" }}
            />

            {/* Ladder rows */}
            {format === "doubles" ? (
                doublesLadder === undefined ? (
                    <ActivityIndicator color="#B45309" style={{ marginTop: 40 }} />
                ) : doublesLadder.length === 0 ? (
                    <DoublesEmptyState courtName={courtName} />
                ) : (
                    <GlassContainer style={{ overflow: "hidden" }}>
                        {doublesLadder.map((team, i) => (
                            <TeamRow
                                key={team._id}
                                team={team}
                                isLast={i === doublesLadder.length - 1}
                                router={router}
                                onChallenge={() =>
                                    onChallenge({ opponentId: team.player1Id, opponentTeamId: team._id })
                                }
                            />
                        ))}
                    </GlassContainer>
                )
            ) : singlesLadder === undefined ? (
                <ActivityIndicator color="#B45309" style={{ marginTop: 40 }} />
            ) : singlesLadder.length === 0 ? (
                <SinglesEmptyState courtName={courtName} />
            ) : (
                <GlassContainer style={{ overflow: "hidden" }}>
                    {singlesLadder.map((entry, i) => (
                        <PlayerRow
                            key={entry._id}
                            entry={entry}
                            isLast={i === singlesLadder.length - 1}
                            router={router}
                            onChallenge={() => onChallenge({ opponentId: entry.userId })}
                        />
                    ))}
                </GlassContainer>
            )}
        </View>
    );
}

// ---------------------------------------------------------------------------
// Teams section
// ---------------------------------------------------------------------------

function TeamsSection({
    section,
    onSectionChange,
    courtId,
    courtName,
    router,
    onChallenge,
    onNewTeam,
}: {
    section: TeamSection;
    onSectionChange: (s: TeamSection) => void;
    courtId: any;
    courtName?: string;
    router: any;
    onChallenge: (t: ChallengeTarget) => void;
    onNewTeam: () => void;
}) {
    const myTeams = useQuery(api.teams.myTeams);
    const browseTeams = useQuery(api.teams.teamsByRating, { courtId });
    const pendingInvites = useQuery(api.teams.pendingInvites);

    return (
        <View>
            {/* Pending invites */}
            {pendingInvites && pendingInvites.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                    {pendingInvites.map((invite) => (
                        <InviteCard key={invite._id} invite={invite} />
                    ))}
                </View>
            )}

            <PillSwitch
                value={section}
                onChange={onSectionChange}
                options={[
                    { value: "mine", label: "My Teams", icon: "people-circle-outline" },
                    { value: "browse", label: "Browse", icon: "search-outline" },
                ]}
                style={{ marginBottom: 12, alignSelf: "flex-start" }}
            />

            {section === "mine" ? (
                myTeams === undefined ? (
                    <ActivityIndicator color="#B45309" style={{ marginTop: 40 }} />
                ) : myTeams.length === 0 ? (
                    <MyTeamsEmptyState onNewTeam={onNewTeam} />
                ) : (
                    <View style={{ gap: 10 }}>
                        {myTeams.map((team) => (
                            <MyTeamCard key={team._id} team={team} router={router} />
                        ))}
                        <NewTeamButton onPress={onNewTeam} />
                    </View>
                )
            ) : browseTeams === undefined ? (
                <ActivityIndicator color="#B45309" style={{ marginTop: 40 }} />
            ) : browseTeams.length === 0 ? (
                <BrowseEmptyState courtName={courtName} />
            ) : (
                <GlassContainer style={{ overflow: "hidden" }}>
                    {browseTeams.map((team, i) => (
                        <TeamRow
                            key={team._id}
                            team={team}
                            isLast={i === browseTeams.length - 1}
                            router={router}
                            onChallenge={() =>
                                onChallenge({ opponentId: team.player1Id, opponentTeamId: team._id })
                            }
                        />
                    ))}
                </GlassContainer>
            )}
        </View>
    );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UpcomingMatchCard({ match }: { match: any }) {
    const date = new Date(match.scheduledTime);
    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

    return (
        <GlassContainer
            style={{
                borderRadius: 16,
                padding: 14,
                marginRight: 10,
                width: 200,
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.2)",
            }}
        >
            <Text style={{ color: "#B45309", fontSize: 11, fontWeight: "600", marginBottom: 6 }}>
                {dateStr} · {timeStr}
            </Text>
            <Text style={{ color: "#12170f", fontWeight: "700", fontSize: 13 }} numberOfLines={1}>
                {match.team1?.name ?? match.player1?.name ?? "You"}
            </Text>
            <Text style={{ color: "#5c6454", fontSize: 11, marginVertical: 2 }}>vs</Text>
            <Text style={{ color: "#12170f", fontWeight: "700", fontSize: 13 }} numberOfLines={1}>
                {match.team2?.name ?? match.player3?.name ?? "Opponent"}
            </Text>
            <View
                style={{
                    marginTop: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    backgroundColor: "rgba(245,158,11,0.1)",
                    alignSelf: "flex-start",
                }}
            >
                <Text style={{ color: "#B45309", fontSize: 11, fontWeight: "600" }}>
                    {match.format === "doubles" ? "Doubles" : "Singles"}
                </Text>
            </View>
        </GlassContainer>
    );
}

function TeamRow({
    team,
    isLast,
    router,
    onChallenge,
}: {
    team: any;
    isLast: boolean;
    router: any;
    onChallenge: () => void;
}) {
    const isProvisional = team.matchesPlayed < 3;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {}}
            style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: "rgba(18,23,15,0.08)",
            }}
        >
            {/* Rank */}
            <Text
                style={{
                    color: "#B45309",
                    fontWeight: "800",
                    fontSize: 16,
                    width: 32,
                }}
            >
                #{team.rank}
            </Text>

            {/* Team info */}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: "#12170f", fontWeight: "700", fontSize: 15 }}>
                        {team.name}
                    </Text>
                    {isProvisional && (
                        <View
                            style={{
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 6,
                                backgroundColor: "rgba(92,100,84,0.15)",
                            }}
                        >
                            <Text style={{ color: "#5c6454", fontSize: 10, fontWeight: "600" }}>
                                PROVISIONAL
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={{ color: "#5c6454", fontSize: 12, marginTop: 2 }}>
                    {team.player1?.name ?? "?"} · {team.player2?.name ?? "?"}
                </Text>
            </View>

            {/* Rating + W/L */}
            <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 16 }}>
                    {team.rating}
                </Text>
                <Text style={{ color: "#5c6454", fontSize: 11 }}>
                    {team.wins}W {team.losses}L
                </Text>
            </View>

            {/* Challenge button */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onChallenge}
                style={{
                    marginLeft: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    borderWidth: 1,
                    borderColor: "rgba(245, 158, 11, 0.3)",
                }}
            >
                <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 12 }}>
                    Challenge
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

function PlayerRow({
    entry,
    isLast,
    router,
    onChallenge,
}: {
    entry: any;
    isLast: boolean;
    router: any;
    onChallenge: () => void;
}) {
    const isProvisional = entry.matchesPlayed < 3;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
                router.push(`/(authenticated)/profile/${entry.userId}`)
            }
            style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: "rgba(18,23,15,0.08)",
            }}
        >
            {/* Rank */}
            <Text
                style={{
                    color: entry.isMe ? "#3F7D20" : "#B45309",
                    fontWeight: "800",
                    fontSize: 16,
                    width: 32,
                }}
            >
                #{entry.rank}
            </Text>

            {/* Player */}
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text
                        style={{
                            color: entry.isMe ? "#3F7D20" : "#12170f",
                            fontWeight: "700",
                            fontSize: 15,
                        }}
                    >
                        {entry.user?.name ?? "Unknown"}
                        {entry.isMe ? " (you)" : ""}
                    </Text>
                    {isProvisional && (
                        <View
                            style={{
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 6,
                                backgroundColor: "rgba(92,100,84,0.15)",
                            }}
                        >
                            <Text style={{ color: "#5c6454", fontSize: 10, fontWeight: "600" }}>
                                PROVISIONAL
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Rating + W/L */}
            <View style={{ alignItems: "flex-end" }}>
                <Text
                    style={{
                        color: entry.isMe ? "#3F7D20" : "#B45309",
                        fontWeight: "700",
                        fontSize: 16,
                    }}
                >
                    {entry.rating}
                </Text>
                <Text style={{ color: "#5c6454", fontSize: 11 }}>
                    {entry.wins}W {entry.losses}L
                </Text>
            </View>

            {/* Challenge */}
            {!entry.isMe && (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onChallenge}
                    style={{
                        marginLeft: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                        backgroundColor: "rgba(245, 158, 11, 0.15)",
                        borderWidth: 1,
                        borderColor: "rgba(245, 158, 11, 0.3)",
                    }}
                >
                    <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 12 }}>
                        Challenge
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

function MyTeamCard({ team, router }: { team: any; router: any }) {
    return (
        <GlassContainer
            style={{
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.15)",
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: "#12170f", fontWeight: "700", fontSize: 16 }}>
                        {team.name}
                    </Text>
                    <Text style={{ color: "#5c6454", fontSize: 13, marginTop: 2 }}>
                        with {team.partner?.name ?? "Unknown"}
                    </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 18 }}>
                        {team.rating}
                    </Text>
                    <Text style={{ color: "#5c6454", fontSize: 12 }}>
                        {team.wins}W {team.losses}L
                    </Text>
                </View>
            </View>
            {team.matchesPlayed < 3 && (
                <View
                    style={{
                        marginTop: 10,
                        padding: 8,
                        borderRadius: 10,
                        backgroundColor: "rgba(92,100,84,0.1)",
                    }}
                >
                    <Text style={{ color: "#5c6454", fontSize: 12, textAlign: "center" }}>
                        Provisional — play {3 - team.matchesPlayed} more match
                        {3 - team.matchesPlayed !== 1 ? "es" : ""} to get ranked
                    </Text>
                </View>
            )}
        </GlassContainer>
    );
}

function InviteCard({ invite }: { invite: any }) {
    const [accepting, setAccepting] = useState(false);
    const [declining, setDeclining] = useState(false);
    const acceptInvite = useMutation(api.teams.acceptInvite);
    const declineInvite = useMutation(api.teams.declineInvite);

    return (
        <GlassContainer
            style={{
                borderRadius: 16,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.3)",
            }}
        >
            <Text style={{ color: "#12170f", fontWeight: "700", fontSize: 14 }}>
                Team invite: {invite.teamName}
            </Text>
            <Text style={{ color: "#5c6454", fontSize: 13, marginTop: 2 }}>
                from {invite.inviter?.name ?? "Someone"}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={accepting || declining}
                    onPress={async () => {
                        setAccepting(true);
                        try { await acceptInvite({ inviteId: invite._id }); }
                        catch (e) { console.error(e); }
                        finally { setAccepting(false); }
                    }}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: "rgba(245,158,11,0.2)",
                        borderWidth: 1,
                        borderColor: "rgba(245,158,11,0.4)",
                        alignItems: "center",
                    }}
                >
                    {accepting ? (
                        <ActivityIndicator size="small" color="#B45309" />
                    ) : (
                        <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 13 }}>
                            Accept
                        </Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={accepting || declining}
                    onPress={async () => {
                        setDeclining(true);
                        try { await declineInvite({ inviteId: invite._id }); }
                        catch (e) { console.error(e); }
                        finally { setDeclining(false); }
                    }}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: "rgba(18,23,15,0.04)",
                        borderWidth: 1,
                        borderColor: "rgba(18,23,15,0.12)",
                        alignItems: "center",
                    }}
                >
                    {declining ? (
                        <ActivityIndicator size="small" color="#5c6454" />
                    ) : (
                        <Text style={{ color: "#5c6454", fontWeight: "700", fontSize: 13 }}>
                            Decline
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </GlassContainer>
    );
}

function NewTeamButton({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <GlassContainer
                style={{
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "rgba(245, 158, 11, 0.2)",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                }}
            >
                <Ionicons name="add-circle-outline" size={20} color="#B45309" />
                <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 14 }}>
                    New Team
                </Text>
            </GlassContainer>
        </TouchableOpacity>
    );
}

function DoublesEmptyState({ courtName }: { courtName?: string }) {
    const label = courtName ? leagueName(courtName) : "your league";
    return (
        <GlassContainer
            style={{
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.15)",
            }}
        >
            <Ionicons name="trophy-outline" size={44} color="#B45309" />
            <Text
                style={{
                    color: "#12170f",
                    fontWeight: "700",
                    fontSize: 17,
                    marginTop: 12,
                    textAlign: "center",
                }}
            >
                No teams ranked in the {label} yet
            </Text>
            <Text
                style={{
                    color: "#5c6454",
                    fontSize: 13,
                    marginTop: 6,
                    textAlign: "center",
                    lineHeight: 20,
                }}
            >
                Form a team and challenge another pair to get on the board
            </Text>
        </GlassContainer>
    );
}

function SinglesEmptyState({ courtName }: { courtName?: string }) {
    const label = courtName ? leagueName(courtName) : "your league";
    return (
        <GlassContainer
            style={{
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.15)",
            }}
        >
            <Ionicons name="person-outline" size={44} color="#B45309" />
            <Text
                style={{
                    color: "#12170f",
                    fontWeight: "700",
                    fontSize: 17,
                    marginTop: 12,
                    textAlign: "center",
                }}
            >
                Play a match to get ranked
            </Text>
            <Text
                style={{
                    color: "#5c6454",
                    fontSize: 13,
                    marginTop: 6,
                    textAlign: "center",
                    lineHeight: 20,
                }}
            >
                Challenge someone in the {label} to start climbing
            </Text>
        </GlassContainer>
    );
}

function MyTeamsEmptyState({ onNewTeam }: { onNewTeam: () => void }) {
    return (
        <GlassContainer
            style={{
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.15)",
            }}
        >
            <Ionicons name="people-outline" size={44} color="#B45309" />
            <Text
                style={{
                    color: "#12170f",
                    fontWeight: "700",
                    fontSize: 17,
                    marginTop: 12,
                    textAlign: "center",
                }}
            >
                No teams yet
            </Text>
            <Text
                style={{
                    color: "#5c6454",
                    fontSize: 13,
                    marginTop: 6,
                    textAlign: "center",
                    lineHeight: 20,
                }}
            >
                Invite a regular partner to form a named team and track your wins together
            </Text>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onNewTeam}
                style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: "rgba(245,158,11,0.15)",
                    borderWidth: 1,
                    borderColor: "rgba(245,158,11,0.3)",
                }}
            >
                <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 14 }}>
                    Invite a Partner
                </Text>
            </TouchableOpacity>
        </GlassContainer>
    );
}

function BrowseEmptyState({ courtName }: { courtName?: string }) {
    const label = courtName ? leagueName(courtName) : "your league";
    return (
        <GlassContainer
            style={{
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.15)",
            }}
        >
            <Ionicons name="search-outline" size={44} color="#B45309" />
            <Text
                style={{
                    color: "#12170f",
                    fontWeight: "700",
                    fontSize: 17,
                    marginTop: 12,
                    textAlign: "center",
                }}
            >
                No other teams in the {label} yet
            </Text>
            <Text
                style={{
                    color: "#5c6454",
                    fontSize: 13,
                    marginTop: 6,
                    textAlign: "center",
                    lineHeight: 20,
                }}
            >
                Teams from players in your league will appear here
            </Text>
        </GlassContainer>
    );
}

function PendingChallengeCard({ challenge }: { challenge: any }) {
    const me = useQuery(api.users.currentUser);
    const challenger = useQuery(api.users.getUserById, { userId: challenge.challengerId });
    const respond = useMutation(api.challenges.respondToChallenge);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const proposedTimes = (challenge.proposedTimes ?? []) as number[];
    const isRecipient =
        me?._id === challenge.challengedId || me?._id === challenge.challengedPartnerId;

    if (!isRecipient) return null;

    return (
        <GlassContainer
            style={{
                borderRadius: 16,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.3)",
            }}
        >
            <Text style={{ color: "#12170f", fontWeight: "700", fontSize: 14 }}>
                Challenge from {challenger?.name ?? "Opponent"}
            </Text>
            <Text style={{ color: "#5c6454", fontSize: 12, marginTop: 2, marginBottom: 8 }}>
                Pick a time that works for your side
            </Text>

            {proposedTimes.length > 0 ? (
                <View style={{ gap: 6 }}>
                    {proposedTimes.map((ts) => (
                        <TouchableOpacity
                            key={ts}
                            activeOpacity={0.8}
                            onPress={() => setSelectedTime(ts)}
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor:
                                    selectedTime === ts
                                        ? "rgba(245,158,11,0.5)"
                                        : "rgba(18,23,15,0.12)",
                                backgroundColor:
                                    selectedTime === ts
                                        ? "rgba(245,158,11,0.15)"
                                        : "rgba(18,23,15,0.03)",
                            }}
                        >
                            <Text
                                style={{
                                    color: selectedTime === ts ? "#B45309" : "#5c6454",
                                    fontWeight: "600",
                                    fontSize: 12,
                                }}
                            >
                                {new Date(ts).toLocaleString([], {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <Text style={{ color: "#5c6454", fontSize: 12, marginBottom: 8 }}>
                    No slots proposed (legacy challenge).
                </Text>
            )}

            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={loading || (proposedTimes.length > 0 && !selectedTime)}
                    onPress={async () => {
                        setLoading(true);
                        try {
                            await respond({
                                challengeId: challenge._id,
                                accept: true,
                                selectedTime: selectedTime ?? undefined,
                            });
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: "rgba(245,158,11,0.2)",
                        borderWidth: 1,
                        borderColor: "rgba(245,158,11,0.4)",
                        alignItems: "center",
                    }}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#B45309" />
                    ) : (
                        <Text style={{ color: "#B45309", fontWeight: "700", fontSize: 13 }}>
                            Accept
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={loading}
                    onPress={async () => {
                        setLoading(true);
                        try {
                            await respond({
                                challengeId: challenge._id,
                                accept: false,
                            });
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: "rgba(18,23,15,0.04)",
                        borderWidth: 1,
                        borderColor: "rgba(18,23,15,0.12)",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "#5c6454", fontWeight: "700", fontSize: 13 }}>
                        Decline
                    </Text>
                </TouchableOpacity>
            </View>
        </GlassContainer>
    );
}
