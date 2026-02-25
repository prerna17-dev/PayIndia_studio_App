import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EWSCertificateServicesScreen() {
    const router = useRouter();
    const { from } = useLocalSearchParams();
    const backPath = from === 'more-seva' ? '/more-seva' : '/(tabs)/explore';

    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            router.replace(backPath as any);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [backPath]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.replace(backPath as any)}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>EWS Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for Economically Weaker Section Certificate</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Authority Information Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.blueLeftBorder} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconCircle}>
                                    <MaterialCommunityIcons
                                        name="office-building"
                                        size={28}
                                        color="#0A4DA3"
                                    />
                                </View>
                                <View style={styles.titleSection}>
                                    <Text style={styles.cardTitle}>Revenue Department</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Certificate issued by Tehsildar / Sub-Divisional Officer
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.badgesRow}>
                                <Badge text="Income Verification" />
                                <Badge text="Asset Verification" />
                                <Badge text="Annual Validity" />
                                <Badge text="Government Approved" />
                            </View>
                        </View>
                    </View>

                    {/* Service Card - New Application */}
                    <View style={styles.serviceCard}>
                        <View style={styles.blueGradient}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={styles.serviceIcon}>
                                    <MaterialCommunityIcons
                                        name="file-account"
                                        size={28}
                                        color="#0A4DA3"
                                    />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>New EWS Certificate</Text>
                                    <Text style={styles.serviceHindi}>नवीन EWS प्रमाणपत्र</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>Apply if your family income is below ₹8 Lakhs per annum</Text>
                                <TouchableOpacity
                                    style={styles.blueButton}
                                    onPress={() => router.push("/new-ews-certificate")}
                                >
                                    <Text style={styles.buttonTextBlue}>Start Application</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#0A4DA3" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Eligibility Panel */}
                    <View style={styles.eligibilityCard}>
                        <View style={styles.eligibilityHeader}>
                            <MaterialCommunityIcons name="information" size={24} color="#0A4DA3" />
                            <Text style={styles.eligibilityTitle}>Key Eligibility Information</Text>
                        </View>

                        <View style={styles.eligibilitySection}>
                            <Text style={styles.eligibilityLabel}>📌 Income Limit</Text>
                            <Text style={styles.eligibilityText}>Family income must be below <Text style={{ fontWeight: 'bold' }}>₹8,00,000</Text> per annum (Including salary, agriculture, business, etc.)</Text>
                        </View>

                        <View style={styles.eligibilitySection}>
                            <Text style={styles.eligibilityLabel}>📌 Asset Limits</Text>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Residential flat must be below 1000 sq. ft.</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Residential plot must be below 100 sq. yards (notified municipality)</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Residential plot must be below 200 sq. yards (other areas)</Text>
                            </View>
                        </View>

                        <View style={styles.eligibilitySection}>
                            <Text style={styles.eligibilityLabel}>📌 Validity</Text>
                            <Text style={styles.eligibilityText}>Certificate valid for one financial year.</Text>
                        </View>
                    </View>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const Badge = ({ text }: { text: string }) => (
    <View style={styles.badge}>
        <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
        <Text style={styles.badgeText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 5,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerSubtitle: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    placeholder: {
        width: 34,
    },
    scrollContent: {
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    blueLeftBorder: {
        width: 4,
        backgroundColor: '#0A4DA3',
    },
    cardContent: {
        flex: 1,
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    titleSection: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 1,
    },
    cardSubtitle: {
        fontSize: 11,
        color: '#666',
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badgeText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    serviceCard: {
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        overflow: 'hidden',
    },
    blueGradient: {
        backgroundColor: '#F1F8FE',
        padding: 16,
    },
    serviceHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    serviceBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    serviceIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    serviceContent: {
        flex: 1,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    serviceHindi: {
        fontSize: 12,
        color: '#666',
    },
    serviceDesc: {
        flex: 1,
        fontSize: 12,
        color: '#777',
    },
    blueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E3F2FD',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    buttonTextBlue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0A4DA3',
    },
    eligibilityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    eligibilityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 12,
    },
    eligibilityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0A4DA3',
    },
    eligibilitySection: {
        marginBottom: 16,
    },
    eligibilityLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 8,
    },
    eligibilityText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
    },
    bulletRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
        paddingLeft: 5,
    },
    bullet: {
        fontSize: 13,
        color: '#0A4DA3',
    },
    bulletText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
        flex: 1,
    },
});
