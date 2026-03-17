import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    BackHandler,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
} from 'react-native';

interface Provider {
    id: string;
    name: string;
    icon: string;
}

interface BillDetails {
    customerName: string;
    planName: string;
    billingPeriod: string;
    billAmount: number;
    dueDate: string;
    accountId: string;
    providerName: string;
}

const popularProviders: Provider[] = [
    { id: 'airtel', name: 'Airtel Xstream', icon: 'wifi' },
    { id: 'jio', name: 'JioFiber', icon: 'access-point' },
    { id: 'bsnl', name: 'BSNL', icon: 'broadcast' },
    { id: 'act', name: 'ACT Fibernet', icon: 'flash-outline' },
    { id: 'tata', name: 'Tata Play', icon: 'satellite-variant' },
    { id: 'hathway', name: 'Hathway', icon: 'router-wireless' },
];

const allProviders = [
    "Airtel Xstream Fiber", "JioFiber", "BSNL Broadband", "ACT Fibernet",
    "Tata Play Fiber", "Hathway", "Tikona", "YOU Broadband",
    "Excitel", "Spectra", "MTNL", "RailTel",
    "Alliance Broadband", "Netplus", "D-VoiS", "Local ISP / Others",
];

export default function BroadbandBillScreen() {
    const router = useRouter();

    // Form states
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('Wallet');
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Card detail states
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    // Modal states
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [providerSearchQuery, setProviderSearchQuery] = useState('');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const handleBack = useCallback(() => {
        if (billDetails) {
            setBillDetails(null);
            setIsConfirmed(false);
            return true;
        }
        router.back();
        return true;
    }, [router, billDetails]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

    const validateForm = () => {
        return selectedProvider && accountNumber.length >= 6;
    };

    // Fetch Bill
    const handleFetchBill = () => {
        if (!validateForm()) return;
        setIsFetching(true);
        setTimeout(() => {
            setBillDetails({
                customerName: 'N/A',
                planName: 'N/A',
                billingPeriod: 'N/A',
                billAmount: 0,
                dueDate: 'N/A',
                accountId: accountNumber,
                providerName: selectedProvider!.name,
            });
            setIsFetching(false);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        }, 1500);
    };

    // Card number formatter
    const handleCardNumberChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = '';
        for (let i = 0; i < cleaned.length && i < 16; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += cleaned[i];
        }
        setCardNumber(formatted);
    };

    const handleExpiryChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        setExpiryDate(formatted);
    };

    const isCardMode = selectedPaymentMode === 'Debit Card' || selectedPaymentMode === 'Credit Card';
    const isCardPaymentReady = () => {
        if (!isCardMode) return true;
        return cardNumber.replace(/\s/g, '').length === 16 && expiryDate.length === 5 && cvv.length === 3 && cardHolder.trim().length > 2;
    };

    // Payment
    const handlePayment = () => {
        if (!isConfirmed || !isCardPaymentReady()) return;
        if (selectedPaymentMode === 'Wallet') {
            router.push({
                pathname: "/wallet" as any,
                params: {
                    amount: String(billDetails?.billAmount || 0),
                    billType: "Broadband Bill",
                    lenderName: billDetails?.providerName,
                    loanAccountNumber: billDetails?.accountId,
                    borrowerName: billDetails?.customerName,
                },
            });
        } else {
            Alert.alert("Redirecting", `Redirecting to ${selectedPaymentMode} Gateway...`);
        }
    };

    const handleProviderModalSelect = (name: string) => {
        const found = popularProviders.find(p => p.name === name);
        const item = found || { id: name.toLowerCase().replace(/\s/g, ''), name, icon: 'wifi' };
        setSelectedProvider(item);
        setShowProviderModal(false);
        setBillDetails(null);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Broadband Bill</Text>
                        <Text style={styles.headerSubtitle}>Pay your internet bill instantly</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>

                        {!billDetails ? (
                            <>
                                {/* Popular Providers Grid */}
                                <Text style={styles.sectionTitle}>Select Broadband Provider</Text>
                                <View style={styles.grid}>
                                    {popularProviders.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.gridItem, selectedProvider?.id === item.id && styles.selectedGridItem]}
                                            onPress={() => { setSelectedProvider(item); setBillDetails(null); }}
                                        >
                                            <View style={[styles.iconCircle, selectedProvider?.id === item.id && styles.selectedIconCircle]}>
                                                <MaterialCommunityIcons
                                                    name={item.icon as any}
                                                    size={24}
                                                    color={selectedProvider?.id === item.id ? "#FFFFFF" : "#0D47A1"}
                                                />
                                            </View>
                                            <Text style={styles.gridLabel}>{item.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* View All Providers */}
                                <View style={styles.browseContainer}>
                                    <TouchableOpacity style={styles.browseButton} onPress={() => setShowProviderModal(true)}>
                                        <Text style={styles.browseText}>View All Providers</Text>
                                        <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                                    </TouchableOpacity>
                                </View>

                                {/* Form Card */}
                                <View style={styles.formCard}>
                                    {selectedProvider && (
                                        <View style={[styles.fieldGroup, { marginBottom: 15 }]}>
                                            <Text style={styles.fieldLabel}>Selected Provider</Text>
                                            <View style={[styles.inputContainer, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                                                <MaterialCommunityIcons name={(selectedProvider.icon as any) || "wifi"} size={18} color="#0D47A1" />
                                                <TextInput style={[styles.input, { color: '#475569' }]} value={selectedProvider.name} editable={false} />
                                                <TouchableOpacity onPress={() => setSelectedProvider(null)}>
                                                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Account No. / Customer ID *</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialCommunityIcons name="identifier" size={16} color="#94A3B8" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter account / customer ID"
                                                placeholderTextColor="#94A3B8"
                                                autoCapitalize="characters"
                                                value={accountNumber}
                                                onChangeText={setAccountNumber}
                                                maxLength={20}
                                            />
                                        </View>
                                        <Text style={styles.helperText}>Min 6 characters (varies by provider)</Text>
                                    </View>

                                    <View style={[styles.fieldGroup, { marginTop: 15 }]}>
                                        <Text style={styles.fieldLabel}>Registered Mobile (Optional)</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="phone-portrait-outline" size={16} color="#94A3B8" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter 10 digit number"
                                                placeholderTextColor="#94A3B8"
                                                keyboardType="phone-pad"
                                                maxLength={10}
                                                value={mobileNumber}
                                                onChangeText={setMobileNumber}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={handleFetchBill} disabled={!validateForm() || isFetching} style={{ marginBottom: 30 }}>
                                    <LinearGradient
                                        colors={!validateForm() || isFetching ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        {isFetching ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Fetch Bill Details</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                                {/* User Entered Details */}
                                <View style={styles.formCard}>
                                    <Text style={styles.sectionTitleSmall}>Connection Details</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Provider</Text>
                                        <Text style={styles.detailValue}>{billDetails.providerName}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Account / Customer ID</Text>
                                        <Text style={styles.detailValue}>{billDetails.accountId}</Text>
                                    </View>
                                    {mobileNumber ? (
                                        <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                                            <Text style={styles.detailLabel}>Mobile Number</Text>
                                            <Text style={styles.detailValue}>{mobileNumber}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Bill Info Banner */}
                                <View style={styles.balanceBanner}>
                                    <View style={styles.balanceItem}>
                                        <Text style={styles.balanceLabel}>Bill Amount</Text>
                                        <Text style={styles.balanceValue}>₹{billDetails.billAmount}</Text>
                                    </View>
                                    <View style={styles.balanceDivider} />
                                    <View style={styles.balanceItem}>
                                        <Text style={styles.balanceLabel}>Due Date</Text>
                                        <Text style={[styles.balanceValue, { color: '#D32F2F', fontSize: 14 }]}>{billDetails.dueDate}</Text>
                                    </View>
                                </View>

                                {/* Payment Mode */}
                                <View style={styles.formCard}>
                                    <Text style={styles.sectionTitleSmall}>Select Payment Mode</Text>
                                    <View style={styles.paymentModes}>
                                        {['Wallet', 'Debit Card', 'Credit Card', 'Net Banking'].map((mode) => (
                                            <TouchableOpacity
                                                key={mode}
                                                style={[styles.paymentModeCard, selectedPaymentMode === mode && styles.selectedPaymentModeCard]}
                                                onPress={() => setSelectedPaymentMode(mode)}
                                            >
                                                <Ionicons
                                                    name={mode === 'Wallet' ? 'wallet' : mode.includes('Card') ? 'card-outline' : 'business-outline'}
                                                    size={18}
                                                    color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'}
                                                />
                                                <Text style={[styles.paymentModeText, selectedPaymentMode === mode && styles.selectedPaymentModeText]}>{mode}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Card Details Form */}
                                    {isCardMode && (
                                        <View style={styles.cardFormContainer}>
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Name on Card</Text>
                                                <View style={styles.inputContainer}>
                                                    <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                    <TextInput style={styles.input} placeholder="Card Holder Name" placeholderTextColor="#94A3B8" value={cardHolder} onChangeText={setCardHolder} autoCapitalize="characters" />
                                                </View>
                                            </View>
                                            <View style={[styles.fieldGroup, { marginTop: 12 }]}>
                                                <Text style={styles.fieldLabel}>Card Number</Text>
                                                <View style={styles.inputContainer}>
                                                    <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                                    <TextInput style={styles.input} placeholder="0000 0000 0000 0000" placeholderTextColor="#94A3B8" keyboardType="numeric" value={cardNumber} onChangeText={handleCardNumberChange} maxLength={19} />
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                                <View style={[styles.fieldGroup, { flex: 1 }]}>
                                                    <Text style={styles.fieldLabel}>Expiry</Text>
                                                    <View style={styles.inputContainer}>
                                                        <TextInput style={[styles.input, { marginLeft: 0 }]} placeholder="MM/YY" placeholderTextColor="#94A3B8" keyboardType="numeric" value={expiryDate} onChangeText={handleExpiryChange} maxLength={5} />
                                                    </View>
                                                </View>
                                                <View style={[styles.fieldGroup, { flex: 1 }]}>
                                                    <Text style={styles.fieldLabel}>CVV</Text>
                                                    <View style={styles.inputContainer}>
                                                        <TextInput style={[styles.input, { marginLeft: 0 }]} placeholder="123" placeholderTextColor="#94A3B8" keyboardType="numeric" secureTextEntry value={cvv} onChangeText={setCvv} maxLength={3} />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity style={styles.confirmRow} onPress={() => setIsConfirmed(!isConfirmed)}>
                                    <Ionicons name={isConfirmed ? "checkbox" : "square-outline"} size={20} color="#0D47A1" />
                                    <Text style={styles.confirmText}>I confirm that the account and billing details are correct and authorize this payment.</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handlePayment} disabled={!isConfirmed || !isCardPaymentReady()} style={{ marginBottom: 40 }}>
                                    <LinearGradient
                                        colors={!isConfirmed || !isCardPaymentReady() ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            Pay ₹{billDetails.billAmount}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Provider Selection Modal */}
                <Modal visible={showProviderModal} transparent animationType="slide" onRequestClose={() => setShowProviderModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Broadband Provider</Text>
                                <TouchableOpacity onPress={() => setShowProviderModal(false)}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput
                                    style={styles.modalSearchInput}
                                    placeholder="Search Provider..."
                                    value={providerSearchQuery}
                                    onChangeText={setProviderSearchQuery}
                                />
                            </View>
                            <ScrollView style={styles.optionsList}>
                                {allProviders.filter(b => b.toLowerCase().includes(providerSearchQuery.toLowerCase())).map((name, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.optionItem}
                                        onPress={() => handleProviderModalSelect(name)}
                                    >
                                        <Text style={styles.optionText}>{name}</Text>
                                        {selectedProvider?.name === name && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FA" },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20,
        backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0'
    },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
    headerSubtitle: { fontSize: 11, color: "#666", marginTop: 2 },
    placeholder: { width: 34 },
    scrollContent: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
    sectionTitleSmall: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },

    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    gridItem: {
        width: '31%', alignItems: 'center', marginBottom: 15, paddingVertical: 12,
        backgroundColor: '#FFFFFF', borderRadius: 16, elevation: 1,
        borderWidth: 1, borderColor: 'transparent'
    },
    selectedGridItem: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    iconCircle: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: '#F1F8FE', justifyContent: 'center', alignItems: 'center', marginBottom: 8
    },
    selectedIconCircle: { backgroundColor: '#0D47A1' },
    gridLabel: { fontSize: 10, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },

    // Browse
    browseContainer: { alignItems: 'center', marginBottom: 20 },
    browseButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD',
        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#BBDEFB', gap: 6
    },
    browseText: { fontSize: 13, fontWeight: '700', color: '#0D47A1' },

    // Form
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 1 },
    fieldGroup: { width: '100%' },
    fieldLabel: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 8 },
    inputContainer: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC",
        borderRadius: 12, paddingHorizontal: 15, height: 52,
        borderWidth: 1, borderColor: "#E2E8F0"
    },
    input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },
    helperText: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
    actionButton: { height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },

    // Detail Summary
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    detailLabel: { fontSize: 13, color: '#64748B' },
    detailValue: { fontSize: 13, fontWeight: '600', color: '#1E293B' },

    // Broadband Card
    broadbandCard: {
        width: '100%', height: 200, borderRadius: 20, padding: 25,
        marginBottom: 20, elevation: 5, justifyContent: 'space-between'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardProviderName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    cardAccountContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardCustomerName: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', letterSpacing: 1 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardLabel: { color: '#BBDEFB', fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
    cardValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

    // Balance Banner
    balanceBanner: {
        flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16,
        padding: 16, marginBottom: 20, elevation: 1, alignItems: 'center'
    },
    balanceItem: { flex: 1, alignItems: 'center' },
    balanceDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },
    balanceLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
    balanceValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },

    // Payment Modes
    paymentModes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    paymentModeCard: {
        flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 10, backgroundColor: '#F8FAFC',
        borderWidth: 1, borderColor: '#E2E8F0', gap: 6
    },
    selectedPaymentModeCard: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    paymentModeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    selectedPaymentModeText: { color: '#0D47A1' },

    // Card Form
    cardFormContainer: { marginTop: 15, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },

    // Confirm
    confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
    confirmText: { fontSize: 11, color: '#64748B', flex: 1 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', paddingTop: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, margin: 20, paddingHorizontal: 15, paddingVertical: 10 },
    modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1A1A1A' },
    optionsList: { paddingHorizontal: 20 },
    optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    optionText: { fontSize: 15, color: '#1A1A1A' },
});