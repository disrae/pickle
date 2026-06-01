import { CoachChatView } from "@/components/coach/CoachChatView";
import { Background } from "@/components/ui/Background";
import { Header } from "@/components/ui/header";
import { api } from "@/convex/_generated/api";
import { exitCoachChatToCourt } from "@/lib/exit-to-court";
import { useQuery } from "convex/react";
import { useNavigation, useRouter } from "expo-router";
import { useCallback } from "react";
import { useHeaderHeight } from "@/lib/header-layout";

export default function CoachChatScreen() {
    const headerHeight = useHeaderHeight();
    const router = useRouter();
    const navigation = useNavigation();
    const profile = useQuery(api.skillsProfiles.getForCurrentUser);

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
