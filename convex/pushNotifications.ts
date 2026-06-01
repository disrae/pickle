export async function sendExpoPush(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
) {
    try {
        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: token,
                sound: "default",
                title,
                body,
                data: data ?? {},
            }),
        });
    } catch (error) {
        console.error("Error sending push notification:", error);
    }
}
