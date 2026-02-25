import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function VoterIDServicesScreen() {
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

    // Handle New Voter ID
    const handleNewVoterID = () => {
        router.push('/new-voter-id');
    };

    // Handle Voter ID Correction
    const handleVoterIDCorrection = () => {
        router.push('/update-voter-id');
    };

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
                        <Text style={styles.headerTitle}>Voter ID Services</Text>
                        <Text style={styles.headerSubtitle}>Apply for new Voter ID or request correction</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Authority Info Card */}
                    <View style={styles.authorityCard}>
                        <View style={styles.cardIndicator} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconCircle}>
                                    <MaterialCommunityIcons
                                        name="account-check"
                                        size={28}
                                        color="#0A4DA3"
                                    />
                                </View>
                                <View style={styles.titleSection}>
                                    <Text style={styles.cardTitle}>Election Services</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Authorized Voter Registration Support Center
                                    </Text>
                                </View>
                            </View>

                            {/* Trust Badges */}
                            <View style={styles.badgesRow}>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Secure</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>OTP Verified</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Document Assisted</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* New Voter ID Card */}
                    <View style={styles.serviceCard}>
                        <View style={styles.greenGradient}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={styles.serviceIcon}>
                                    <MaterialCommunityIcons
                                        name="card-account-details-outline"
                                        size={28}
                                        color="#2E7D32"
                                    />
                                    <View style={styles.plusOverlay}>
                                        <Ionicons name="add" size={12} color="#2E7D32" />
                                    </View>
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>New Voter ID</Text>
                                    <Text style={styles.serviceHindi}>नवीन मतदार कार्ड</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>Apply for new voter registration</Text>
                                <TouchableOpacity
                                    style={styles.greenButton}
                                    onPress={handleNewVoterID}
                                >
                                    <Text style={styles.buttonTextGreen}>Start Registration</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#2E7D32" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Voter ID Correction Card */}
                    <View style={styles.serviceCard}>
                        <View style={styles.orangeGradient}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={styles.serviceIcon}>
                                    <MaterialCommunityIcons
                                        name="pencil"
                                        size={28}
                                        color="#F57C00"
                                    />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>Voter ID Correction</Text>
                                    <Text style={styles.serviceHindi}>मतदार कार्ड दुरुस्ती</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>Update or correct your voter ID details</Text>
                                <TouchableOpacity
                                    style={styles.orangeButton}
                                    onPress={handleVoterIDCorrection}
                                >
                                    <Text style={styles.buttonTextOrange}>Update Details</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#F57C00" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Why Choose Us Section */}
                    <View style={styles.whyChooseCard}>
                        <View style={styles.whyChooseHeader}>
                            <Ionicons name="information-circle" size={24} color="#0A4DA3" />
                            <Text style={styles.whyChooseTitle}>Why Choose Us?</Text>
                        </View>

                        <View style={styles.featuresGrid}>
                            <View style={styles.featureRow}>
                                <View style={styles.feature}>
                                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                    <Text style={styles.featureText}>Secure Data Handling</Text>
                                </View>
                                <View style={styles.feature}>
                                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                    <Text style={styles.featureText}>OTP Based Verification</Text>
                                </View>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={styles.feature}>
                                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                    <Text style={styles.featureText}>Document Encryption</Text>
                                </View>
                                <View style={styles.feature}>
                                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                    <Text style={styles.featureText}>Pan India Support</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Important Note Section */}
                    <View style={styles.noteCard}>
                        <View style={styles.noteHeader}>
                            <Ionicons name="alert-circle" size={22} color="#F57C00" />
                            <Text style={styles.noteTitle}>Note:</Text>
                        </View>
                        <Text style={styles.noteText}>
                            Final approval of Voter ID application depends on Election Commission verification. Field verification may be required.
                        </Text>
                    </View>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

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

    // Authority Card
    authorityCard: {
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
    cardIndicator: {
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

    // Service Cards
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
        position: 'relative'
    },
    plusOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: '#E8F5E9',
        borderRadius: 8,
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#C8E6C9'
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

    // Why Choose Us
    whyChooseCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    whyChooseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    whyChooseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    featuresGrid: {
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    feature: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        flex: 1,
    },

    // Note Card
    noteCard: {
        backgroundColor: '#FFF9E6',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    noteText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
});
