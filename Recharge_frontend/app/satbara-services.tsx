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

export default function SatbaraServicesScreen() {
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
                        <Text style={styles.headerTitle}>7/12 Extract (Satbara Utara)</Text>
                        <Text style={styles.headerSubtitle}>Land Record Extract & Mutation Services</Text>
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
                                    <Text style={styles.cardTitle}>Maharashtra Land Records Department</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Talathi / Tehsildar Office
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.badgesRow}>
                                <Badge text="Land Ownership Record" />
                                <Badge text="Mutation Entry Support" />
                                <Badge text="Online e-KYC Available" />
                                <Badge text="Government Verified" />
                            </View>
                        </View>
                    </View>

                    {/* Service Options */}
                    <View style={styles.serviceRow}>
                        {/* New 7/12 Extract */}
                        <View style={styles.serviceCard}>
                            <View style={styles.blueGradient}>
                                <View style={styles.serviceHeaderRow}>
                                    <View style={styles.serviceIcon}>
                                        <MaterialCommunityIcons
                                            name="file-document-outline"
                                            size={28}
                                            color="#0D47A1"
                                        />
                                    </View>
                                    <View style={styles.serviceContent}>
                                        <Text style={styles.serviceTitle}>New 7/12 Extract</Text>
                                        <Text style={styles.serviceHindi}>७/१२ उतारा (नवीन)</Text>
                                    </View>
                                </View>

                                <View style={styles.serviceBottomRow}>
                                    <Text style={styles.serviceDesc}>View / Download land ownership details</Text>
                                    <TouchableOpacity
                                        style={styles.blueButton}
                                        onPress={() => router.push("/new-712-extract")}
                                    >
                                        <Text style={styles.buttonTextBlue}>Apply Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#0D47A1" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Mutation / Update (Ferfar) */}
                        <View style={styles.serviceCard}>
                            <View style={styles.greenGradient}>
                                <View style={styles.serviceHeaderRow}>
                                    <View style={styles.serviceIcon}>
                                        <MaterialCommunityIcons
                                            name="file-edit-outline"
                                            size={28}
                                            color="#2E7D32"
                                        />
                                    </View>
                                    <View style={styles.serviceContent}>
                                        <Text style={styles.serviceTitle}>Mutation / Update</Text>
                                        <Text style={styles.serviceHindi}>फेरफार नोंदणी</Text>
                                    </View>
                                </View>

                                <View style={styles.serviceBottomRow}>
                                    <Text style={styles.serviceDesc}>Apply for ownership update (Ferfar)</Text>
                                    <TouchableOpacity
                                        style={styles.greenButton}
                                        onPress={() => router.push("/mutation-712-update")}
                                    >
                                        <Text style={styles.buttonTextGreen}>Apply Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#2E7D32" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                    </View>

                    {/* Application Process Information Section */}
                    <View style={styles.processCard}>
                        <View style={styles.processHeader}>
                            <MaterialCommunityIcons name="information-variant" size={24} color="#0A4DA3" />
                            <Text style={styles.processTitle}>Application Process</Text>
                        </View>

                        <View style={styles.processType}>
                            <Text style={styles.processTypeTitle}>🖥 Online Process</Text>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Visit Mahabhulekh Portal via this app</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Complete e-KYC using Aadhaar</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Verify via OTP and Download copy</Text>
                            </View>
                        </View>

                        <View style={[styles.processType, { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 15, paddingTop: 15 }]}>
                            <Text style={styles.processTypeTitle}>🏢 Offline Process</Text>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Submit documents to Talathi / Tehsildar Office</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Manual verification by local authorities</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Collect certified physical copy</Text>
                            </View>
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
        fontSize: 16,
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
        marginBottom: 12,
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

    // Service Cards (Redesigned matching Aadhaar services style)
    serviceRow: {
        marginBottom: 12,
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
    greenGradient: {
        backgroundColor: '#F1FBF4',
        padding: 16,
    },
    orangeGradient: {
        backgroundColor: '#FFF9F2',
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
    greenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E8F5E9',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    orangeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF3E0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    buttonTextBlue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0D47A1',
    },
    buttonTextGreen: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    buttonTextOrange: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F57C00',
    },

    processCard: {
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
    processHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 12,
    },
    processTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0A4DA3',
    },
    processType: {
        marginBottom: 10,
    },
    processTypeTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 10,
    },
    bulletRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 6,
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
