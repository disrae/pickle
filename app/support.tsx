import { StyledButton } from '@/components/ui/StyledButton';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';

export default function Support() {
    const router = useRouter();

    const sendSupportEmail = () => {
        Linking.openURL('mailto:support@wepickle.win?subject=WePickle Support Request');
    };

    return (
        <ScrollView className="flex-1 bg-slate-50">
            <View className="flex-1 px-6 py-6">
                <View className="max-w-md mx-auto">
                    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                        <Text className="text-2xl font-bold text-slate-800 mb-2">Support & Help</Text>
                        <Text className="text-slate-600 mb-6">
                            Need help with WePickle? We&apos;re here to assist you.
                        </Text>

                        <View className="space-y-4">
                            <StyledButton
                                title="📧 Contact Support"
                                onPress={sendSupportEmail}
                                variant="primary"
                            />

                            <StyledButton
                                title="⬅️ Back to App"
                                onPress={() => router.back()}
                                variant="secondary"
                            />
                        </View>
                    </View>

                    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                        <Text className="text-lg font-semibold text-slate-800 mb-4">Quick Help</Text>

                        <View className="space-y-4">
                            <View className="border-l-4 border-lime-500 pl-4">
                                <Text className="font-medium text-slate-800">Having trouble signing in?</Text>
                                <Text className="text-slate-600 text-sm mt-1">
                                    Check your email for the login link, including spam/junk folders.
                                </Text>
                            </View>

                            <View className="border-l-4 border-blue-500 pl-4">
                                <Text className="font-medium text-slate-800">App not working properly?</Text>
                                <Text className="text-slate-600 text-sm mt-1">
                                    Try force quitting the app, restarting your device, or updating to the latest version.
                                </Text>
                            </View>

                            <View className="border-l-4 border-purple-500 pl-4">
                                <Text className="font-medium text-slate-800">Need feature help?</Text>
                                <Text className="text-slate-600 text-sm mt-1">
                                    Consider using the dedicated chat screens associated with each tab or contact support at support@wepickle.win.
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="bg-slate-500 rounded-2xl p-6 shadow-sm">
                        <Text className="text-white text-lg font-semibold mb-2">🧈 Happy Pickling!</Text>
                        <Text className="text-white/90">
                            WePickle is made by pickleball enthusiasts, for pickleball enthusiasts.
                            Your feedback helps us make the app better for everyone.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}