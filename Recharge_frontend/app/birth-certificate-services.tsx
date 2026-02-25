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

export default function BirthCertificateServicesScreen() {
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

    const handleStartApplication = () => {
        router.push('/new-birth-certificate');
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
                        <Text style={styles.headerTitle}>Birth Certificate Services</Text>
                        <Text style={styles.headerSubtitle}>Apply for official birth registration certificate</Text>
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
                                        color="#0D47A1"
                                    />
                                </View>
                                <View style={styles.titleSection}>
                                    <Text style={styles.cardTitle}>Civil Registration System</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Authorized Support for Birth Registration
                                    </Text>
                                </View>
                            </View>

                            {/* Trust Badges / Features */}
                            <View style={styles.badgesRow}>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Secure Application</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Document Assisted</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Municipal Authority Processing</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Official Record Registration</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Service Card - New Application */}
                    <View style={styles.serviceCard}>
                        <View style={styles.blueGradient}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={styles.serviceIcon}>
                                    <MaterialCommunityIcons
                                        name="file-certificate"
                                        size={28}
                                        color="#0D47A1"
                                    />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>New Birth Certificate</Text>
                                    <Text style={styles.serviceHindi}>नवीन जन्म प्रमाणपत्र</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>Register birth and apply for official certificate</Text>
                                <TouchableOpacity
                                    style={styles.blueButton}
                                    onPress={handleStartApplication}
                                >
                                    <Text style={styles.buttonTextBlue}>Start Application</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#0D47A1" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Important Note Section */}
                    <View style={styles.noteCard}>
                        <View style={styles.noteHeader}>
                            <Ionicons name="information-circle" size={20} color="#EF6C00" />
                            <Text style={styles.noteTitle}>Important Note:</Text>
                        </View>
                        <Text style={styles.noteText}>
                            Birth registration must comply with municipal authority guidelines. Late registration may require affidavit and additional verification.
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
        backgroundColor: '#0D47A1',
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

    // Note Card
    noteCard: {
        backgroundColor: '#FFF8E1',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFECB3',
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#EF6C00',
    },
    noteText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
});
