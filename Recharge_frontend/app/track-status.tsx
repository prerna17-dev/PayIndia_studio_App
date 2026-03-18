import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type StatusState = 'pending' | 'processing' | 'approved' | 'rejected' | null;

interface TrackingResult {
    applicationId: string;
    serviceName: string;
    applicantName: string;
    dateApplied: string;
    currentStatus: StatusState;
    estimatedCompletion: string;
}

export default function TrackStatusScreen() {
    const router = useRouter();
    const [applicationId, setApplicationId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [error, setError] = useState(false);

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    const handleTrack = () => {
        if (applicationId.trim().length < 6) return;

        setIsLoading(true);
        setError(false);
        setResult(null);

        // Simulate API call and fetch from storage
        setTimeout(async () => {
            setIsLoading(false);

            try {
                const existingStr = await AsyncStorage.getItem('userApplications');
                const existingApps = existingStr ? JSON.parse(existingStr) : [];

                const foundApp = existingApps.find((app: TrackingResult) => app.applicationId === applicationId.toUpperCase());

                if (foundApp) {
                    setResult(foundApp);
                    Animated.parallel([
                        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                    ]).start();
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error("Failed to read tracking storage", e);
                setError(true);
            }
        }, 1500);
    };


    const getStatusColor = (status: StatusState) => {
        switch (status) {
            case 'approved': return '#4CAF50';
            case 'processing': return '#FF9800';
            case 'rejected': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const StatusTimeline = ({ currentStatus, dateApplied, estimatedCompletion }: { currentStatus: StatusState, dateApplied: string, estimatedCompletion: string }) => {
        const steps = [
            { id: 'submitted', label: 'Application Submitted', desc: `${dateApplied}, 10:30 AM`, active: true, completed: true },
            { id: 'review', label: 'Under Review', desc: 'Document verification in progress', active: currentStatus === 'processing' || currentStatus === 'approved', completed: currentStatus === 'approved' },
            { id: 'final', label: currentStatus === 'rejected' ? 'Application Rejected' : 'Approved & Dispatched', desc: currentStatus === 'rejected' ? 'Missing documents' : `Expected by ${estimatedCompletion}`, active: currentStatus === 'approved' || currentStatus === 'rejected', completed: currentStatus === 'approved', isError: currentStatus === 'rejected' },
        ];

        return (
            <View style={styles.timelineContainer}>
                {steps.map((step, index) => (
                    <View key={step.id} style={styles.timelineStep}>
                        {/* Connection Line */}
                        {index < steps.length - 1 && (
                            <View style={[styles.timelineLine, step.completed && styles.timelineLineActive]} />
                        )}

                        {/* Step Icon Node */}
                        <View style={[
                            styles.timelineNode,
                            step.active && styles.timelineNodeActive,
                            step.completed && styles.timelineNodeCompleted,
                            step.isError && styles.timelineNodeError
                        ]}>
                            {step.completed ? (
                                <Ionicons name="checkmark" size={12} color="#FFF" />
                            ) : step.isError ? (
                                <Ionicons name="close" size={12} color="#FFF" />
                            ) : step.active ? (
                                <View style={styles.timelineDot} />
                            ) : null}
                        </View>

                        {/* Step Content */}
                        <View style={styles.timelineContent}>
                            <Text style={[styles.timelineLabel, step.active && styles.timelineLabelActive, step.isError && styles.timelineLabelError]}>
                                {step.label}
                            </Text>
                            <Text style={styles.timelineDesc}>{step.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
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
                        <Text style={styles.headerTitle}>Track Status</Text>
                        <Text style={styles.headerSubtitle}>Check your application progress</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                        {/* Search Section */}
                        <View style={styles.searchCard}>
                            <View style={styles.iconCircleHeader}>
                                <Ionicons name="search-outline" size={28} color="#0D47A1" />
                            </View>
                            <Text style={styles.searchTitle}>Enter Application ID</Text>
                            <Text style={styles.searchSubtitle}>You can find this on your acknowledgment receipt or SMS</Text>

                            <View style={styles.inputContainer}>
                                <MaterialCommunityIcons name="text-box-search-outline" size={20} color="#64748B" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. MH-2025-893X"
                                    placeholderTextColor="#94A3B8"
                                    value={applicationId}
                                    onChangeText={setApplicationId}
                                    autoCapitalize="characters"
                                />
                                {applicationId.length > 0 && (
                                    <TouchableOpacity onPress={() => setApplicationId('')}>
                                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={handleTrack}
                                disabled={applicationId.trim().length < 6 || isLoading}
                                style={{ marginTop: 24, alignSelf: 'center' }}
                            >
                                <LinearGradient
                                    colors={applicationId.trim().length < 6 || isLoading ? ['#CBD5E1', '#94A3B8'] : ['#0D47A1', '#1565C0']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={[styles.trackButton, (applicationId.trim().length < 6 || isLoading) && styles.trackButtonDisabled]}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={[styles.trackButtonText, (applicationId.trim().length < 6 || isLoading) && { color: '#F1F5F9' }]}>
                                            Track Now
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Error State */}
                        {error && !isLoading && (
                            <View style={styles.errorCard}>
                                <Ionicons name="alert-circle" size={40} color="#E53935" />
                                <Text style={styles.errorTitle}>Application Not Found</Text>
                                <Text style={styles.errorText}>Please check the application ID and try again, or contact support if the issue persists.</Text>
                            </View>
                        )}

                        {/* Results Section */}
                        {result && !isLoading && !error && (
                            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                <View style={styles.resultCard}>

                                    {/* Result Header */}
                                    <View style={styles.resultHeader}>
                                        <View>
                                            <Text style={styles.resultLabel}>Application ID</Text>
                                            <Text style={styles.resultValue}>{result.applicationId}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.currentStatus) + '15' }]}>
                                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(result.currentStatus) }]} />
                                            <Text style={[styles.statusText, { color: getStatusColor(result.currentStatus) }]}>
                                                {result.currentStatus?.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    {/* Applicant Details */}
                                    <View style={styles.detailsGrid}>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Service Name</Text>
                                            <Text style={styles.detailValue}>{result.serviceName}</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Applicant Name</Text>
                                            <Text style={styles.detailValue}>{result.applicantName}</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Date Applied</Text>
                                            <Text style={styles.detailValue}>{result.dateApplied}</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Expected By</Text>
                                            <Text style={styles.detailValue}>{result.estimatedCompletion}</Text>
                                        </View>
                                    </View>

                                    {/* Timeline Tracker */}
                                    <View style={styles.timelineSection}>
                                        <Text style={styles.timelineTitle}>Tracking Journey</Text>
                                        <StatusTimeline currentStatus={result.currentStatus} dateApplied={result.dateApplied} estimatedCompletion={result.estimatedCompletion} />
                                    </View>

                                </View>

                                {/* Need Help CTA */}
                                <TouchableOpacity style={styles.helpCard}>
                                    <Ionicons name="help-buoy-outline" size={24} color="#0D47A1" />
                                    <View style={styles.helpTextContainer}>
                                        <Text style={styles.helpTitle}>Need help with this application?</Text>
                                        <Text style={styles.helpSubtitle}>Contact our support team</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                                </TouchableOpacity>

                            </Animated.View>
                        )}

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
    placeholder: { width: 34 },

    scrollContent: { padding: 20, paddingBottom: 40 },

    // Search Card
    searchCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 20 },
    iconCircleHeader: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    searchTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    searchSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 56, width: '100%' },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1E293B', fontWeight: '600' },
    trackButton: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#0D47A1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    trackButtonDisabled: { shadowOpacity: 0, elevation: 0 },
    trackButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

    // Error Card
    errorCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
    errorTitle: { fontSize: 16, fontWeight: 'bold', color: '#B91C1C', marginTop: 12, marginBottom: 8 },
    errorText: { fontSize: 13, color: '#EF4444', textAlign: 'center', lineHeight: 20 },

    // Result Card
    resultCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 16 },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    resultLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
    resultValue: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },

    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -10, marginBottom: 24 },
    detailItem: { width: '50%', paddingHorizontal: 10, marginBottom: 16 },
    detailLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
    detailValue: { fontSize: 14, fontWeight: '600', color: '#1E293B' },

    // Timeline
    timelineSection: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20 },
    timelineTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
    timelineContainer: { paddingLeft: 10 },
    timelineStep: { flexDirection: 'row', marginBottom: 24, position: 'relative' },
    timelineLine: { position: 'absolute', left: 11, top: 24, bottom: -24, width: 2, backgroundColor: '#E2E8F0', zIndex: 1 },
    timelineLineActive: { backgroundColor: '#0D47A1' },
    timelineNode: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', zIndex: 2, marginTop: 2 },
    timelineNodeActive: { borderColor: '#0D47A1', backgroundColor: '#EFF6FF' },
    timelineNodeCompleted: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    timelineNodeError: { backgroundColor: '#F44336', borderColor: '#F44336' },
    timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0D47A1' },
    timelineContent: { flex: 1, marginLeft: 16 },
    timelineLabel: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 4 },
    timelineLabelActive: { color: '#1E293B' },
    timelineLabelError: { color: '#B91C1C' },
    timelineDesc: { fontSize: 12, color: '#94A3B8', lineHeight: 18 },

    // Help CTA
    helpCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    helpTextContainer: { flex: 1, marginLeft: 12 },
    helpTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
    helpSubtitle: { fontSize: 12, color: '#64748B' },
}); 
