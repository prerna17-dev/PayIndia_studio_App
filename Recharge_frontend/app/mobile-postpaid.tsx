import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    BackHandler,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

// ── OPERATOR DATA ──────────────────────────────────────────────
const popularOperators = [
    { id: 'jio', name: 'Jio', icon: 'signal-cellular-3' },
    { id: 'airtel', name: 'Airtel', icon: 'signal-cellular-outline' },
    { id: 'vi', name: 'Vi', icon: 'cellphone-wireless' },
    { id: 'bsnl', name: 'BSNL', icon: 'radio-tower' },
    { id: 'mtnl-mumbai', name: 'MTNL Mumbai', icon: 'deskphone' },
    { id: 'mtnl-delhi', name: 'MTNL Delhi', icon: 'deskphone' },
];

const allOperators = [
    { id: 'jio', name: "Jio" },
    { id: 'airtel', name: "Airtel" },
    { id: 'vi', name: "Vi" },
    { id: 'bsnl', name: "BSNL" },
    { id: 'mtnl-mumbai', name: "MTNL Mumbai" },
    { id: 'mtnl-delhi', name: "MTNL Delhi" }
];

const CIRCLES = [
    'Andhra Pradesh', 'Assam', 'Bihar & Jharkhand', 'Chennai',
    'Delhi & NCR', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jammu & Kashmir', 'Karnataka', 'Kerala', 'Kolkata',
    'Madhya Pradesh', 'Maharashtra', 'Mumbai', 'North East',
    'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
    'UP East', 'UP West', 'West Bengal',
];

interface BillData {
    customerName: string;
    billingPeriod: string;
    totalAmount: number;
    dueDate: string;
    mobileNumber: string;
    operatorName: string;
    circle: string;
}

const MOCK_BILL = {
    customerName: 'Rahul Kumar',
    billingPeriod: '01 Jan – 31 Jan 2026',
    totalAmount: 499,
    dueDate: '15 Feb 2026',
};

export default function MobilePostpaidScreen() {
    const router = useRouter();

    // ── STATE ──────────────────────────────────────────────────
    const [selectedOperator, setSelectedOperator] = useState<any>(null);
    const [mobileNumber, setMobileNumber] = useState('');
    const [selectedCircle, setSelectedCircle] = useState('Maharashtra');
    const [isFetching, setIsFetching] = useState(false);
    const [isFetchingOperator, setIsFetchingOperator] = useState(false);
    const [billData, setBillData] = useState<BillData | null>(null);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('Wallet');
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Card details states
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    // Modal states
    const [showOperatorModal, setShowOperatorModal] = useState(false);
    const [showCircleModal, setShowCircleModal] = useState(false);
    const [operatorSearchQuery, setOperatorSearchQuery] = useState('');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const handleBack = useCallback(() => {
        if (billData) {
            setBillData(null);
            setIsConfirmed(false);
            return true;
        }
        router.back();
        return true;
    }, [router, billData]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

    // Auto-detect operator logic
    React.useEffect(() => {
        if (mobileNumber.length === 10 && !selectedOperator) {
            autoDetectOperator(mobileNumber);
        }
    }, [mobileNumber]);

    const autoDetectOperator = (number: string) => {
        setIsFetchingOperator(true);
        setTimeout(() => {
            let detected = null;
            const prefix = number.substring(0, 2);
            if (['98', '99'].includes(prefix)) detected = allOperators.find(op => op.id === 'airtel');
            else if (['88', '89'].includes(prefix)) detected = allOperators.find(op => op.id === 'vi');
            else if (['77', '94'].includes(prefix)) detected = allOperators.find(op => op.id === 'bsnl');
            else detected = allOperators.find(op => op.id === 'jio');

            if (detected) setSelectedOperator(detected);
            setIsFetchingOperator(false);
        }, 800);
    };

    const validateForm = () => {
        return selectedOperator && mobileNumber.length === 10;
    };

    const handleFetchBill = () => {
        if (!validateForm()) return;
        setIsFetching(true);
        
        // Mock API call
        setTimeout(() => {
            setBillData({
                ...MOCK_BILL,
                mobileNumber: mobileNumber,
                operatorName: selectedOperator.name,
                circle: selectedCircle,
            });
            setIsFetching(false);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        }, 1500);
    };

    const handleContactPicker = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const contact = await Contacts.presentContactPickerAsync();
                if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                    const phoneNumber = contact.phoneNumbers[0].number;
                    if (phoneNumber) {
                        const phone = phoneNumber.replace(/\D/g, '').slice(-10);
                        setMobileNumber(phone);
                    }
                }
            } else {
                Alert.alert("Permission Denied", "We need contacts permission to pick a number.");
            }
        } catch (err) {
            console.log("Contact pick error", err);
        }
    };

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

    const handlePayment = () => {
        if (!isConfirmed || !isCardPaymentReady()) return;
        if (selectedPaymentMode === 'Wallet') {
            router.push({
                pathname: "/wallet" as any,
                params: {
                    amount: String(billData?.totalAmount || 0),
                    billType: "Mobile Postpaid",
                    lenderName: billData?.operatorName,
                    loanAccountNumber: billData?.mobileNumber,
                    borrowerName: billData?.customerName,
                },
            });
        } else {
            Alert.alert("Redirecting", `Redirecting to ${selectedPaymentMode} Gateway...`);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Mobile Postpaid</Text>
                        <Text style={styles.headerSubtitle}>Pay your monthly mobile bill</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>

                        {!billData ? (
                            <>
                                <View style={styles.formCard}>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Mobile Number *</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialCommunityIcons name="cellphone" size={18} color="#94A3B8" />
                                            <Text style={styles.countryCode}>+91</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter 10 digit number"
                                                placeholderTextColor="#94A3B8"
                                                keyboardType="numeric"
                                                value={mobileNumber}
                                                onChangeText={setMobileNumber}
                                                maxLength={10}
                                            />
                                            <TouchableOpacity onPress={handleContactPicker} style={styles.contactIcon}>
                                                <Ionicons name="person-circle" size={24} color="#0D47A1" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={[styles.fieldGroup, { marginTop: 15 }]}>
                                        <Text style={styles.fieldLabel}>Circle / State</Text>
                                        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowCircleModal(true)}>
                                            <Ionicons name="location-outline" size={18} color="#94A3B8" />
                                            <Text style={styles.input}>{selectedCircle}</Text>
                                            <Ionicons name="chevron-down" size={20} color="#94A3B8" />
                                        </TouchableOpacity>
                                    </View>

                                    {isFetchingOperator ? (
                                        <View style={styles.fetchingOpContainer}>
                                            <ActivityIndicator size="small" color="#0D47A1" />
                                            <Text style={styles.fetchingOpText}>Detecting operator...</Text>
                                        </View>
                                    ) : selectedOperator ? (
                                        <View style={[styles.fieldGroup, { marginTop: 15 }]}>
                                            <Text style={styles.fieldLabel}>Detected Operator</Text>
                                            <View style={[styles.inputContainer, { backgroundColor: '#F1F5F9' }]}>
                                                <MaterialCommunityIcons name="signal-variant" size={18} color="#0D47A1" />
                                                <TextInput style={[styles.input, { color: '#0D47A1', fontWeight: 'bold' }]} value={selectedOperator.name} editable={false} />
                                                <TouchableOpacity onPress={() => setSelectedOperator(null)}>
                                                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : null}
                                </View>

                                <Text style={styles.sectionTitle}>Select Operator Manually</Text>
                                <View style={styles.grid}>
                                    {popularOperators.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.gridItem, selectedOperator?.id === item.id && styles.selectedGridItem]}
                                            onPress={() => { setSelectedOperator(item); setBillData(null); }}
                                        >
                                            <View style={[styles.iconCircle, selectedOperator?.id === item.id && styles.selectedIconCircle]}>
                                                <MaterialCommunityIcons
                                                    name={item.icon as any}
                                                    size={24}
                                                    color={selectedOperator?.id === item.id ? "#FFFFFF" : "#0D47A1"}
                                                />
                                            </View>
                                            <Text style={styles.gridLabel}>{item.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.browseContainer}>
                                    <TouchableOpacity style={styles.browseButton} onPress={() => setShowOperatorModal(true)}>
                                        <Text style={styles.browseText}>View All Operators</Text>
                                        <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                                    </TouchableOpacity>
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
                                <View style={styles.formCard}>
                                    <View style={styles.detailsHeader}>
                                        <Text style={styles.sectionTitleSmall}>Consumer Details</Text>
                                        <TouchableOpacity onPress={() => setBillData(null)}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Operator</Text>
                                        <Text style={styles.detailValue}>{billData.operatorName}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Mobile Number</Text>
                                        <Text style={styles.detailValue}>+91 {billData.mobileNumber}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Customer Name</Text>
                                        <Text style={styles.detailValue}>{billData.customerName}</Text>
                                    </View>
                                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                                        <Text style={styles.detailLabel}>Billing Period</Text>
                                        <Text style={styles.detailValue}>{billData.billingPeriod}</Text>
                                    </View>
                                </View>

                                <View style={styles.balanceBanner}>
                                    <View style={styles.balanceItem}>
                                        <Text style={styles.balanceLabel}>Bill Amount</Text>
                                        <Text style={styles.balanceValue}>₹{billData.totalAmount}</Text>
                                    </View>
                                    <View style={styles.balanceDivider} />
                                    <View style={styles.balanceItem}>
                                        <Text style={styles.balanceLabel}>Due Date</Text>
                                        <Text style={[styles.balanceValue, { color: '#D32F2F', fontSize: 14 }]}>{billData.dueDate}</Text>
                                    </View>
                                </View>

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
                                    <Text style={styles.confirmText}>I confirm the details & want to proceed with payment.</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handlePayment} disabled={!isConfirmed || !isCardPaymentReady()} style={{ marginBottom: 40 }}>
                                    <LinearGradient
                                        colors={!isConfirmed || !isCardPaymentReady() ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.actionButtonText}>Pay ₹{billData.totalAmount}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Operator Selection Modal */}
                <Modal visible={showOperatorModal} transparent animationType="slide" onRequestClose={() => setShowOperatorModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Postpaid Operator</Text>
                                <TouchableOpacity onPress={() => setShowOperatorModal(false)}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput style={styles.modalSearchInput} placeholder="Search Operator..." value={operatorSearchQuery} onChangeText={setOperatorSearchQuery} />
                            </View>
                            <ScrollView style={styles.optionsList}>
                                {allOperators.filter(o => o.name.toLowerCase().includes(operatorSearchQuery.toLowerCase())).map((op, index) => (
                                    <TouchableOpacity key={index} style={styles.optionItem} onPress={() => { setSelectedOperator(op); setShowOperatorModal(false); }}>
                                        <Text style={styles.optionText}>{op.name}</Text>
                                        {selectedOperator?.id === op.id && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Circle Selection Modal */}
                <Modal visible={showCircleModal} transparent animationType="slide" onRequestClose={() => setShowCircleModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Circle</Text>
                                <TouchableOpacity onPress={() => setShowCircleModal(false)}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
                            </View>
                            <ScrollView style={styles.optionsList}>
                                {CIRCLES.map((circle, index) => (
                                    <TouchableOpacity key={index} style={styles.optionItem} onPress={() => { setSelectedCircle(circle); setShowCircleModal(false); }}>
                                        <Text style={styles.optionText}>{circle}</Text>
                                        {selectedCircle === circle && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
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
    countryCode: { marginLeft: 8, fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
    contactIcon: { padding: 5 },
    fetchingOpContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
    fetchingOpText: { fontSize: 12, color: '#64748B', fontWeight: '500' },

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

    // Details summary
    detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    editBtn: { fontSize: 13, fontWeight: '700', color: '#0D47A1' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    detailLabel: { fontSize: 13, color: '#64748B' },
    detailValue: { fontSize: 13, fontWeight: '600', color: '#1E293B' },

    actionButton: { height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },

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