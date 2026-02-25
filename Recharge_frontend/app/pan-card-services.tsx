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

export default function PANCardServicesScreen() {
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

    // Handle New PAN
    const handleNewPAN = () => {
        router.push('/new-pan');
    };

    // Handle PAN Correction
    const handlePANCorrection = () => {
        router.push('/update-pan');
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
                        <Text style={styles.headerTitle}>PAN Card Services</Text>
                        <Text style={styles.headerSubtitle}>Apply for new PAN or update details</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* PAN Services Info Card */}
                    <View style={styles.panInfoCard}>
                        <View style={styles.blueLeftBorder} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconCircle}>
                                    <MaterialCommunityIcons
                                        name="card-account-details"
                                        size={28}
                                        color="#0A4DA3"
                                    />
                                </View>
                                <View style={styles.titleSection}>
                                    <Text style={styles.cardTitle}>Income Tax Department</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Authorized PAN Service Provider
                                    </Text>
                                </View>
                            </View>

                            {/* Trust Badges */}
                            <View style={styles.badgesRow}>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>NSDL/UTI Registered</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Secure Process</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* New PAN Card Card */}
                    <View style={styles.serviceCard}>
                        <View style={styles.greenGradient}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={styles.serviceIcon}>
                                    <MaterialCommunityIcons
                                        name="card-plus"
                                        size={28}
                                        color="#2E7D32"
                                    />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>New PAN Card</Text>
                                    <Text style={styles.serviceHindi}>नवीन पॅन कार्ड</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>Application for fresh PAN allotment</Text>
                                <TouchableOpacity
                                    style={styles.greenButton}
                                    onPress={handleNewPAN}
                                >
                                    <Text style={styles.buttonTextGreen}>Apply Now</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#2E7D32" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* PAN Correction Card */}
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
                                    <Text style={styles.serviceTitle}>PAN Correction</Text>
                                    <Text style={styles.serviceHindi}>पॅन दुरुस्ती</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>Update details on existing PAN</Text>
                                <TouchableOpacity
                                    style={styles.orangeButton}
                                    onPress={handlePANCorrection}
                                >
                                    <Text style={styles.buttonTextOrange}>Update PAN</Text>
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
                                    <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                    <Text style={styles.featureText}>Secure Handling</Text>
                                </View>
                                <View style={styles.feature}>
                                    <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                    <Text style={styles.featureText}>Verified Process</Text>
                                </View>
                            </View>
                            <View style={styles.featureRow}>
                                <View style={styles.feature}>
                                    <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                    <Text style={styles.featureText}>Pan India Support</Text>
                                </View>
                                <View style={styles.feature}>
                                    <MaterialCommunityIcons name="check-circle" size={20} color="#F57C00" />
                                    <Text style={styles.featureText}>Fast Processing</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Disclaimer Note */}
                    <View style={styles.noteCard}>
                        <View style={styles.noteHeader}>
                            <Ionicons name="alert-circle" size={20} color="#F57C00" />
                            <Text style={styles.noteTitle}>Note:</Text>
                        </View>
                        <Text style={styles.noteText}>
                            PAN allotment usually takes 15-20 working days. Aadhaar linking is mandatory.
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

    // Info Card
    panInfoCard: {
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
        gap: 8,
    },
    featureRow: {
        flexDirection: 'row',
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
        gap: 6,
        marginBottom: 4,
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
