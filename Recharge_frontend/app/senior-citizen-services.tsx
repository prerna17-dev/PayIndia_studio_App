import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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

export default function SeniorCitizenServicesScreen() {
    const router = useRouter();

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
                        <Text style={styles.headerTitle}>Senior Citizen Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for Official Senior Citizen Certificate</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Information Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.blueLeftBorder} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconCircle}>
                                    <MaterialCommunityIcons name="office-building" size={28} color="#0A4DA3" />
                                </View>
                                <View style={styles.titleSection}>
                                    <Text style={styles.cardTitle}>Revenue Department</Text>
                                    <Text style={styles.cardSubtitle}>Tehsildar / Competent Authority Office</Text>
                                </View>
                            </View>

                            <View style={styles.badgesRow}>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Scheme Benefits</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Travel Concession</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Medical Benefits</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                    <Text style={styles.badgeText}>Identity Proof</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Service Card - New Application */}
                    <View style={styles.serviceCard}>
                        <View style={styles.blueGradient}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={styles.serviceIcon}>
                                    <MaterialCommunityIcons name="account-details-outline" size={28} color="#0A4DA3" />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>New Application</Text>
                                    <Text style={styles.serviceHindi}>नवीन ज्येष्ठ नागरिक अर्ज</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>Apply for fresh senior citizen identity certificate</Text>
                                <TouchableOpacity style={styles.blueButton} onPress={() => router.push('/new-senior-citizen-application')}>
                                    <Text style={styles.buttonTextBlue}>Start Application</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#0A4DA3" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Service Card - Update Application */}
                    <View style={styles.serviceCard}>
                        <View style={styles.blueGradient}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={styles.serviceIcon}>
                                    <MaterialCommunityIcons name="account-edit-outline" size={28} color="#0A4DA3" />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>Update Details</Text>
                                    <Text style={styles.serviceHindi}>ज्येष्ठ नागरिक तपशील अद्यतन</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>Correct name, DOB or address in your certificate</Text>
                                <TouchableOpacity style={styles.blueButton} onPress={() => router.push('/update-senior-citizen')}>
                                    <Text style={styles.buttonTextBlue}>Update Now</Text>
                                    <Ionicons name="build-outline" size={16} color="#0A4DA3" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Important Note */}
                    <View style={styles.noteCard}>
                        <View style={styles.noteHeader}>
                            <Ionicons name="information-circle" size={20} color="#EF6C00" />
                            <Text style={styles.noteTitle}>Important Note:</Text>
                        </View>
                        <Text style={styles.noteText}>
                            Applicant must be 60 years or above to apply for this certificate. Age proof documents are mandatory for verification.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
    placeholder: { width: 34 },
    scrollContent: { paddingTop: 12, paddingBottom: 20, paddingHorizontal: 20 },
    infoCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12, elevation: 3, overflow: 'hidden' },
    blueLeftBorder: { width: 4, backgroundColor: '#0A4DA3' },
    cardContent: { flex: 1, padding: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    titleSection: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
    cardSubtitle: { fontSize: 11, color: '#666' },
    badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    badgeText: { fontSize: 12, color: '#666', fontWeight: '500' },
    serviceCard: { borderRadius: 16, marginBottom: 12, elevation: 2, overflow: 'hidden' },
    blueGradient: { backgroundColor: '#F1F8FE', padding: 16 },
    serviceHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
    serviceBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    serviceIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 3 },
    serviceContent: { flex: 1 },
    serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
    serviceHindi: { fontSize: 12, color: '#666' },
    serviceDesc: { flex: 1, fontSize: 12, color: '#777' },
    blueButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E3F2FD', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#BBDEFB' },
    buttonTextBlue: { fontSize: 14, fontWeight: 'bold', color: '#0A4DA3' },
    orangeGradient: { backgroundColor: '#FFF3E0', padding: 16 },
    orangeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF3E0', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#FFE0B2' },
    buttonTextOrange: { fontSize: 14, fontWeight: 'bold', color: '#E65100' },
    noteCard: { backgroundColor: '#FFF8E1', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FFECB3' },
    noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    noteTitle: { fontSize: 14, fontWeight: 'bold', color: '#EF6C00' },
    noteText: { fontSize: 12, color: '#666', lineHeight: 18 },
});
