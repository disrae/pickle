import {
    Button,
    Container,
    Head,
    Heading,
    Html,
    Section,
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
                <Container className="">
                    <Heading className="text-lg font-bold mb-4 text-center">
                        Sign in to Jericho Pickle
                    </Heading>
                    {/* <Text className="text-sm">
                        Please enter the following code on the sign in page.
                    </Text> */}
                    <Section className="text-center">
                        {/* <Text className="font-semibold">Verification code</Text>
                        <Text className="font-bold text-4xl">{code}</Text> */}
                        {/* <Text>
                            (This code expires in {" "}
                            {Math.floor((+expires - Date.now()) / (60 * 1000))} minutes)
                        </Text> */}
                        <Button
                            className="bg-lime-600 rounded-lg px-8"
                            href={`https://wepickle.win/auth/verify?token=${code}&email=${email}`}>
                            <Text className="text-white font-bold text-xl text-center">Sign in</Text>
                        </Button>
                    </Section>
                </Container>
            </Tailwind>
        </Html>
    );
}