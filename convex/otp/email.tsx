import {
    Button,
    Container,
    Head,
    Html,
    Tailwind,
    Text
} from "@react-email/components";

export function VerificationCodeEmail({
    code,
    expires,
    email,
}: {
    code: string;
    expires: Date;
    email: string;
}) {
    return (
        <Html>
            <Tailwind>
                <Head />
                <Container className="text-center">
                    {/* <Heading className="text-lg font-bold mb-4 text-center">
                        Sign in to Jericho Pickle
                    </Heading> */}
                    {/* <Text className="text-sm">
                        Please enter the following code on the sign in page.
                    </Text> */}
                    {/* <Text className="font-semibold">Use the button below to sign in</Text> */}
                    <Button
                        className="bg-lime-600 rounded-lg px-8 -py-2 mb-6"
                        href={`https://wepickle.win/auth/verify?token=${code}&email=${email}`}>
                        <Text className="text-white font-bold text-xl text-center">Sign in</Text>
                    </Button>
                    {/* <Text className="mb-8 border">
                        Expires in {" "}
                        {Math.floor((+expires - Date.now()) / (60 * 1000))} minutes
                    </Text> */}
                </Container>
            </Tailwind>
        </Html>
    );
}