import { CoachChatView } from "@/components/coach/CoachChatView";
import { Background } from "@/components/ui/Background";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { exitCoachChatToCourt } from "@/lib/exit-to-court";
import { useAction, useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { useHeaderHeight } from "@/lib/header-layout";

export default function CoachChatScreen() {
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const navigation = useNavigation();
    const profile = useQuery(api.skillsProfiles.getForCurrentUser);
    const { debriefMatchId } = useLocalSearchParams<{ debriefMatchId?: string }>();

    const injectDebrief = useMutation(api.coach.injectDebriefContext);
    const sendMessage = useAction(api.coachActions.sendMessage);
    const didInject = useRef(false);

    useEffect(() => {
        if (!debriefMatchId || didInject.current) return;
        didInject.current = true;
        (async () => {
            try {
                const contextMsg = await injectDebrief({
                    matchId: debriefMatchId as Id<"matches">,
                });
                // Trigger coach response to the injected context
                await sendMessage({ message: contextMsg });
            } catch (e) {
                console.error("Debrief inject failed", e);
            }
        })();
    }, [debriefMatchId, injectDebrief, sendMessage]);

    const handleBack = useCallback(() => {
        if (profile?.confirmedAt && router.canGoBack()) {
            router.back();
            return;
        }
        exitCoachChatToCourt(router, navigation);
    }, [profile?.confirmedAt, router, navigation]);

    return (
        <Background>
            <CoachChatView headerHeight={headerHeight} />
            <Header title="Coach" leftButton="back" onLeftPress={handleBack} />
        </Background>
    );
}
