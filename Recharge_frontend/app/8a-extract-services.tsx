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

export default function EightAExtractServicesScreen() {
    const router = useRouter();
    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            router.back();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [router]);

    const handleApplyNow = () => {
        router.push("/new-8a-extract");
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>8A Extract (Khata Utara)</Text>
                        <Text style={styles.headerSubtitle}>Land Holding & Ownership Records</Text>
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
                                        Register of Land Holdings (Village Form VIII-A)
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.badgesRow}>
                                <Badge text="Khata Number Based" />
                                <Badge text="Certified Copy Available" />
                                <Badge text="e-KYC Integration" />
                                <Badge text="Direct Portal Access" />
                            </View>
                        </View>
                    </View>

                    {/* Service Options */}
                    <View style={styles.serviceRow}>
                        {/* New 8A Extract */}
                        <View style={styles.serviceCard}>
                            <View style={styles.blueGradient}>
                                <View style={styles.serviceHeaderRow}>
                                    <View style={styles.serviceIcon}>
                                        <MaterialCommunityIcons
                                            name="card-text-outline"
                                            size={28}
                                            color="#0D47A1"
                                        />
                                    </View>
                                    <View style={styles.serviceContent}>
                                        <Text style={styles.serviceTitle}>New 8A Extract</Text>
                                        <Text style={styles.serviceHindi}>८-अ उतारा (नवीन)</Text>
                                    </View>
                                </View>

                                <View style={styles.serviceBottomRow}>
                                    <Text style={styles.serviceDesc}>Apply for certified land holding details (Khata)</Text>
                                    <TouchableOpacity
                                        style={styles.blueButton}
                                        onPress={handleApplyNow}
                                    >
                                        <Text style={styles.buttonTextBlue}>Apply Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#0D47A1" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
 
                    {/* Mutation / Update 8A */}
                    <View style={styles.serviceRow}>
                        <View style={styles.serviceCard}>
                            <View style={styles.blueGradient}>
                                <View style={styles.serviceHeaderRow}>
                                    <View style={styles.serviceIcon}>
                                        <MaterialCommunityIcons
                                            name="file-edit-outline"
                                            size={28}
                                            color="#0D47A1"
                                        />
                                    </View>
                                    <View style={styles.serviceContent}>
                                        <Text style={styles.serviceTitle}>Mutation / Update 8A</Text>
                                        <Text style={styles.serviceHindi}>८-अ उतारा फेरफार / सुधारणा</Text>
                                    </View>
                                </View>

                                <View style={styles.serviceBottomRow}>
                                    <Text style={styles.serviceDesc}>Correction in Name, Area or Occupant details</Text>
                                    <TouchableOpacity
                                        style={styles.blueButton}
                                        onPress={() => router.push("/update-8a-extract")}
                                    >
                                        <Text style={styles.buttonTextBlue}>Apply Now</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#0D47A1" />
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
                                <Text style={styles.bulletText}>Select District, Taluka and Village</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Enter Khata Number / Account Number</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Upload Identity and Ownership Proof</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Verify via Aadhaar OTP and Submit</Text>
                            </View>
                        </View>

                        <View style={[styles.processType, { borderTopWidth: 1, borderTopColor: '#F1F5F9', marginTop: 15, paddingTop: 15 }]}>
                            <Text style={styles.processTypeTitle}>🏢 Offline Process</Text>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Application submission at Setu / Maha e-Seva Kendra</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Manual verification by local Revenue Officer</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Collection of signed & stamped physical copy</Text>
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
        color: '#0D47A1',
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
