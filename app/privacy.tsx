import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrivacyPolicy() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.lastUpdated}>Last updated: November 1, 2025</Text>

                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.paragraph}>
                    Welcome to WePickle (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application (the &ldquo;App&rdquo;).
                </Text>

                <Text style={styles.sectionTitle}>2. Information We Collect</Text>

                <Text style={styles.subsectionTitle}>2.1 Personal Information</Text>
                <Text style={styles.paragraph}>
                    We may collect the following personal information:
                    {'\n'}• Email address (for authentication)
                    {'\n'}• Name (optional, for display purposes)
                    {'\n'}• Profile image (optional, uploaded by you)
                </Text>

                <Text style={styles.subsectionTitle}>2.2 Usage Data</Text>
                <Text style={styles.paragraph}>
                    We collect information about how you use the App, including:
                    {'\n'}• Court check-ins and planned visits
                    {'\n'}• Chat messages and participation
                    {'\n'}• Drill progress and training activities
                    {'\n'}• Feature requests and votes
                    {'\n'}• App usage patterns and preferences
                </Text>

                <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
                <Text style={styles.paragraph}>
                    We use the collected information for the following purposes:
                    {'\n'}• To provide and maintain the App&apos;s core functionality
                    {'\n'}• To authenticate your account and ensure security
                    {'\n'}• To facilitate court check-ins and community features
                    {'\n'}• To enable chat and messaging features
                    {'\n'}• To track drill progress and provide training features
                    {'\n'}• To improve the App and develop new features
                    {'\n'}• To respond to your inquiries and provide customer support
                    {'\n'}• To send you important updates about the App (if applicable)
                </Text>

                <Text style={styles.sectionTitle}>4. Information Sharing and Disclosure</Text>
                <Text style={styles.paragraph}>
                    We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following limited circumstances:
                    {'\n'}• With your explicit consent
                    {'\n'}• To comply with legal obligations or court orders
                    {'\n'}• To protect our rights, property, or safety, or that of our users
                    {'\n'}• In connection with a merger, acquisition, or sale of assets
                </Text>

                <Text style={styles.paragraph}>
                    Please note that chat messages and other community content you post may be visible to other users of the App.
                </Text>

                <Text style={styles.sectionTitle}>5. Data Security</Text>
                <Text style={styles.paragraph}>
                    We implement reasonable security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, please be aware that:
                    {'\n'}• Chat messages are stored in plain text and are not encrypted in transit or at rest
                    {'\n'}• No method of transmission over the internet or electronic storage is 100% secure
                    {'\n'}• We cannot guarantee absolute security of your data
                </Text>

                <Text style={styles.sectionTitle}>6. Data Retention</Text>
                <Text style={styles.paragraph}>
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. Specifically:
                    {'\n'}• Account data is retained while your account is active
                    {'\n'}• Chat messages and usage data may be retained indefinitely unless you delete your account
                    {'\n'}• We may retain certain information for legal compliance or legitimate business purposes
                </Text>

                <Text style={styles.sectionTitle}>7. Your Rights and Choices</Text>
                <Text style={styles.paragraph}>
                    You have the following rights regarding your personal information:
                    {'\n'}• <Text style={styles.bold}>Access:</Text> You can view your personal information in your profile
                    {'\n'}• <Text style={styles.bold}>Correction:</Text> You can update your information in the App settings
                    {'\n'}• <Text style={styles.bold}>Deletion:</Text> You can delete your account and all associated data through the profile page
                    {'\n'}• <Text style={styles.bold}>Portability:</Text> You can request a copy of your data by contacting us
                </Text>

                <Text style={styles.sectionTitle}>8. Children&apos;s Privacy (COPPA Compliance)</Text>
                <Text style={styles.paragraph}>
                    COPPA (Children&apos;s Online Privacy Protection Act) is a U.S. law that protects children under 13 years old. Our App is not specifically designed for children under 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
                </Text>
                <Text style={styles.paragraph}>
                    If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at support@wepickle.win.
                </Text>

                <Text style={styles.sectionTitle}>9. International Users</Text>
                <Text style={styles.paragraph}>
                    Our App is available to users worldwide. By using our App, you understand that your information may be transferred to and processed in countries other than your own. We will take appropriate measures to protect your personal information in accordance with this Privacy Policy.
                </Text>
                <Text style={styles.paragraph}>
                    If you are located in the European Economic Area (EEA) or other regions with data protection laws, you may have additional rights under applicable laws such as GDPR. Please contact us if you have questions about your rights in your specific jurisdiction.
                </Text>

                <Text style={styles.sectionTitle}>10. Cookies and Local Storage</Text>
                <Text style={styles.paragraph}>
                    We use local storage on your device to store authentication tokens (JWT) to keep you logged in. We do not use cookies or other web tracking technologies. Your browser&apos;s local storage is used solely for maintaining your login session.
                </Text>

                <Text style={styles.sectionTitle}>11. Analytics and Future Changes</Text>
                <Text style={styles.paragraph}>
                    We currently do not use analytics services. However, we may introduce analytics in the future to better understand how users interact with the App and improve our services. If we add analytics, we will update this Privacy Policy and provide you with notice and choices regarding such data collection.
                </Text>

                <Text style={styles.sectionTitle}>12. Third-Party Services</Text>
                <Text style={styles.paragraph}>
                    Our App may contain links to third-party websites or services that are not owned or controlled by us. This Privacy Policy does not apply to these third-party services. We strongly advise you to read the privacy policies of any third-party services you use.
                </Text>

                <Text style={styles.sectionTitle}>13. Changes to This Privacy Policy</Text>
                <Text style={styles.paragraph}>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the App and updating the &ldquo;Last updated&rdquo; date. Your continued use of the App after such changes constitutes your acceptance of the updated Privacy Policy.
                </Text>

                <Text style={styles.sectionTitle}>14. Contact Us</Text>
                <Text style={styles.paragraph}>
                    If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                    {'\n'}
                    {'\n'}Email: support@wepickle.win
                    {'\n'}
                    {'\n'}We will respond to your inquiries as soon as possible.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    lastUpdated: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#000',
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 8,
        color: '#333',
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginBottom: 12,
    },
    bold: {
        fontWeight: 'bold',
    },
});