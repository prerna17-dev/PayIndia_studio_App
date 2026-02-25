import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const OPERATORS = [
    { id: 'jio', name: 'Jio', color: '#0057A0', initial: 'J' },
    { id: 'airtel', name: 'Airtel', color: '#E41E26', initial: 'A' },
    { id: 'vi', name: 'Vi', color: '#DA1F26', initial: 'V' },
    { id: 'bsnl', name: 'BSNL', color: '#0066B2', initial: 'B' },
    { id: 'mtnl-mumbai', name: 'MTNL Mumbai', color: '#FF6B35', initial: 'M' },
    { id: 'mtnl-delhi', name: 'MTNL Delhi', color: '#FF8C42', initial: 'M' },
];

export default function MobileRechargeScreen() {
    const router = useRouter();
    const [mobileNumber, setMobileNumber] = useState('');

    const handleContactPicker = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers],
            });

            if (data.length > 0) {
                const contact = data[0];
                if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                    const phone = contact.phoneNumbers[0].number.replace(/\D/g, '').slice(-10);
                    setMobileNumber(phone);
                }
            }
        }
    };

    const handleContinue = () => {
        if (mobileNumber.length !== 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
            return;
        }
        router.push({
            pathname: '/recharge-plans',
            params: { number: mobileNumber, operator: 'auto', circle: 'Maharashtra' }
        });
    };

    const handleOperatorSelect = (operator: any) => {
        router.push({
            pathname: '/operator-recharge',
            params: { operator: operator.id, operatorName: operator.name }
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mobile Recharge</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <LinearGradient
                        colors={['#D6EAF8', '#E8F4F8', '#D6EAF8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.topBanner}
                    >
                        <View style={styles.bannerIcon}>
                            <Ionicons name="flash" size={28} color="#1E88E5" />
                        </View>
                        <View style={styles.bannerText}>
                            <Text style={styles.bannerTitle}>⚡ Recharge in 10 Seconds</Text>
                            <Text style={styles.bannerSubtitle}>All operators • Instant confirmation</Text>
                        </View>
                    </LinearGradient>

                    <View style={styles.inputCard}>
                        <View style={styles.inputRow}>
                            <View style={styles.flagContainer}>
                                <Text style={styles.flag}>🇮🇳</Text>
                                <Text style={styles.dialCode}>+91</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter mobile number"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                            />
                            <TouchableOpacity
                                style={styles.contactBtn}
                                onPress={handleContactPicker}
                            >
                                <Ionicons name="people" size={24} color="#1E88E5" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.inputHint}>Enter 10-digit mobile number</Text>

                        {mobileNumber.length === 10 && (
                            <TouchableOpacity
                                style={styles.continueBtn}
                                onPress={handleContinue}
                            >
                                <Text style={styles.continueBtnText}>Continue</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.operatorsSection}>
                        <Text style={styles.sectionTitle}>Mobile Operators</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.operatorsScroll}
                        >
                            {OPERATORS.map((op) => (
                                <TouchableOpacity
                                    key={op.id}
                                    style={styles.operatorCard}
                                    onPress={() => handleOperatorSelect(op)}
                                >
                                    <View style={[styles.operatorCircle, { backgroundColor: op.color }]}>
                                        <Text style={styles.operatorInitial}>{op.initial}</Text>
                                    </View>
                                    <Text style={styles.operatorName}>{op.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.recentSection}>
                        <Text style={styles.sectionTitle}>Recent Recharges</Text>
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="time-outline" size={48} color="#1E88E5" />
                            </View>
                            <Text style={styles.emptyTitle}>No recent activity</Text>
                            <Text style={styles.emptySubtitle}>Your recent recharges will appear here</Text>
                        </View>
                    </View>
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
    safe: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },
    topBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    bannerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerText: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0D47A1',
    },
    bannerSubtitle: {
        fontSize: 12,
        color: '#1565C0',
        marginTop: 2,
    },
    inputCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 56,
        backgroundColor: '#F9FAFB',
    },
    flagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingRight: 12,
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    flag: {
        fontSize: 20,
    },
    dialCode: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111',
        paddingHorizontal: 12,
    },
    contactBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EBF5FB',
        borderRadius: 10,
    },
    inputHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    continueBtn: {
        marginTop: 16,
        backgroundColor: '#E5E7EB',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    operatorsSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    operatorsScroll: {
        paddingHorizontal: 16,
        gap: 16,
    },
    operatorCard: {
        alignItems: 'center',
        gap: 8,
    },
    operatorCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    operatorInitial: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
    },
    operatorName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    recentSection: {
        marginTop: 24,
        marginBottom: 20,
    },
    emptyState: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EBF5FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
    },
});