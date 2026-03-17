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

interface Operator {
    id: string;
    name: string;
    icon: string;
}

interface BillData {
    customerName: string;
    totalAmount: number;
    dueDate: string;
    landlineNumber: string;
    operatorName: string;
}

const popularOperators: Operator[] = [
    { id: 'bsnl', name: 'BSNL', icon: 'phone-classic' },
    { id: 'mtnl', name: 'MTNL', icon: 'phone-in-talk-outline' },
    { id: 'airtel', name: 'Airtel', icon: 'phone-classic' },
    { id: 'tata', name: 'Tata Tele', icon: 'phone-classic' },
    { id: 'reliance', name: 'Reliance', icon: 'phone-classic' },
    { id: 'others', name: 'Others', icon: 'cog-outline' },
];

const allOperators = [
    "BSNL Landline", "MTNL", "Airtel Landline", "Tata Tele Services",
    "Reliance Communications", "BBNL", "ACT Fibernet", "Spectra",
    "Tikona Landline", "MTNL Delhi", "MTNL Mumbai", "Hathway",
];

export default function LandlineBillScreen() {
    const router = useRouter();

    // Form states
    const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
    const [stdCode, setStdCode] = useState('');
    const [landlineNumber, setLandlineNumber] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [billData, setBillData] = useState<BillData | null>(null);
    const [isEditableAmount, setIsEditableAmount] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('Wallet');
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Card details states
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    // Modal states
    const [showOperatorModal, setShowOperatorModal] = useState(false);
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

    const validateForm = () => {
        return selectedOperator && stdCode.length >= 2 && landlineNumber.length >= 6;
    };

    const handleFetchBill = () => {
        if (!validateForm()) return;
        setIsFetching(true);
        
        // ==========================================================
        // API INTEGRATION PLACEHOLDER
        // Replace this setTimeout with your real API call:
        // const response = await fetch('YOUR_API_ENDPOINT');
        // const data = await response.json();
        // ==========================================================
        
        setTimeout(() => {
            const fetchedAmount = 0; // Simulated response amount
            setBillData({
                customerName: 'N/A', // Update with data.customerName from API
                totalAmount: fetchedAmount, // Update with data.amount from API
                dueDate: 'N/A',      // Update with data.dueDate from API
                landlineNumber: `${stdCode}-${landlineNumber}`,
                operatorName: selectedOperator!.name,
            });
            setIsEditableAmount(fetchedAmount === 0);
            setIsFetching(false);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        }, 1500);
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
                    billType: "Landline Bill",
                    lenderName: billData?.operatorName,
                    loanAccountNumber: billData?.landlineNumber,
                    borrowerName: billData?.customerName,
                },
            });
        } else {
            Alert.alert("Redirecting", `Redirecting to ${selectedPaymentMode} Gateway...`);
        }
    };

    const handleOperatorModalSelect = (name: string) => {
        const found = popularOperators.find(o => o.name === name);
        const item = found || { id: name.toLowerCase().replace(/\s/g, ''), name, icon: 'phone-classic' };
        setSelectedOperator(item);
        setShowOperatorModal(false);
        setBillData(null);
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
                        <Text style={styles.headerTitle}>Landline Bill</Text>
                        <Text style={styles.headerSubtitle}>Pay BSNL, MTNL, Airtel & more</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>

                        {!billData ? (
                            <>
                                <Text style={styles.sectionTitle}>Select Operator</Text>
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

                                <View style={styles.formCard}>
                                    {selectedOperator && (
                                        <View style={[styles.fieldGroup, { marginBottom: 15 }]}>
                                            <Text style={styles.fieldLabel}>Selected Operator</Text>
                                            <View style={[styles.inputContainer, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                                                <MaterialCommunityIcons name={(selectedOperator.icon as any) || "phone-classic"} size={18} color="#0D47A1" />
                                                <TextInput style={[styles.input, { color: '#475569' }]} value={selectedOperator.name} editable={false} />
                                                <TouchableOpacity onPress={() => setSelectedOperator(null)}>
                                                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <View style={[styles.fieldGroup, { flex: 0.4 }]}>
                                            <Text style={styles.fieldLabel}>STD Code *</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput
                                                    style={[styles.input, { marginLeft: 0 }]}
                                                    placeholder="020"
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="numeric"
                                                    value={stdCode}
                                                    onChangeText={setStdCode}
                                                    maxLength={5}
                                                />
                                            </View>
                                            <Text style={styles.helperText}>Include 0 (e.g. 022)</Text>
                                        </View>
                                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                                            <Text style={styles.fieldLabel}>Landline Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="call-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="24567890"
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="numeric"
                                                    value={landlineNumber}
                                                    onChangeText={setLandlineNumber}
                                                    maxLength={8}
                                                />
                                            </View>
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
                                <View style={styles.formCard}>
                                    <Text style={styles.sectionTitleSmall}>Connection Details</Text>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Operator</Text>
                                        <Text style={styles.detailValue}>{billData.operatorName}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Phone Number</Text>
                                        <Text style={styles.detailValue}>{billData.landlineNumber}</Text>
                                    </View>
                                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                                        <Text style={styles.detailLabel}>Customer Name</Text>
                                        <Text style={styles.detailValue}>{billData.customerName}</Text>
                                    </View>
                                </View>

                                <View style={styles.balanceBanner}>
                                    <View style={styles.balanceItem}>
                                        <Text style={styles.balanceLabel}>Bill Amount</Text>
                                        {isEditableAmount ? (
                                            <View style={styles.amountInputContainer}>
                                                <Text style={styles.currencyPrefix}>₹</Text>
                                                <TextInput
                                                    style={styles.amountInput}
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    value={billData.totalAmount > 0 ? String(billData.totalAmount) : ""}
                                                    onChangeText={(val) => setBillData({...billData, totalAmount: val ? Number(val) : 0})}
                                                />
                                            </View>
                                        ) : (
                                            <Text style={styles.balanceValue}>₹{billData.totalAmount}</Text>
                                        )}
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
                                    <Text style={styles.confirmText}>I confirm that the connection and billing details are correct.</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handlePayment} disabled={!isConfirmed || !isCardPaymentReady()} style={{ marginBottom: 40 }}>
                                    <LinearGradient
                                        colors={!isConfirmed || !isCardPaymentReady() ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            Pay ₹{billData.totalAmount}
                                        </Text>
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
                                <Text style={styles.modalTitle}>Select Landline Operator</Text>
                                <TouchableOpacity onPress={() => setShowOperatorModal(false)}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput
                                    style={styles.modalSearchInput}
                                    placeholder="Search Operator..."
                                    value={operatorSearchQuery}
                                    onChangeText={setOperatorSearchQuery}
                                />
                            </View>
                            <ScrollView style={styles.optionsList}>
                                {allOperators.filter(o => o.toLowerCase().includes(operatorSearchQuery.toLowerCase())).map((name, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.optionItem}
                                        onPress={() => handleOperatorModalSelect(name)}
                                    >
                                        <Text style={styles.optionText}>{name}</Text>
                                        {selectedOperator?.name === name && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
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
    helperText: { fontSize: 11, color: '#94A3B8', marginTop: 4, marginLeft: 2 },

    // Details summary
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

    // Amount Input (Special for Mock testing)
    amountInputContainer: { flexDirection: 'row', alignItems: 'center' },
    currencyPrefix: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginRight: 2 },
    amountInput: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', minWidth: 40, borderBottomWidth: 1, borderBottomColor: '#4CAF50', padding: 0 },

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