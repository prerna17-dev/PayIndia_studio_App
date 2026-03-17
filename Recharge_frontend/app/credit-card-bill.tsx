import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    BackHandler,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Dimensions,
    Modal,
} from "react-native";

const { width } = Dimensions.get('window');

interface CardDetails {
    holderName: string;
    cardType: string;
    cardEnding: string;
    totalDue: number;
    minimumDue: number;
    dueDate: string;
    availableLimit?: number;
    bankName: string;
}

const popularBanks = [
    { id: 'hdfc', name: "HDFC Bank", icon: "bank" },
    { id: 'icici', name: "ICICI Bank", icon: "bank-outline" },
    { id: 'sbi', name: "SBI Card", icon: "credit-card-outline" },
    { id: 'axis', name: "Axis Bank", icon: "bank-transfer" },
    { id: 'kotak', name: "Kotak Bank", icon: "shield-check-outline" },
    { id: 'amex', name: "Amex", icon: "card-account-details-outline" },
];

const allBanks = [
    "HDFC Bank", "ICICI Bank", "SBI Card", "Axis Bank", "Kotak Mahindra Bank",
    "American Express", "RBL Bank", "IDFC FIRST Bank", "IndusInd Bank",
    "Yes Bank", "Citibank", "Standard Chartered", "HSBC Bank", "Bank of Baroda",
    "Punjab National Bank", "Canara Bank", "Union Bank of India", "DBS Bank",
    "Federal Bank", "South Indian Bank", "Karnataka Bank", "Karur Vysya Bank"
];

export default function CreditCardBillScreen() {
    const router = useRouter();

    // Form states
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [mobileNumber, setMobileNumber] = useState("");
    const [cardHolderName, setCardHolderName] = useState("");
    const [lastFourDigits, setLastFourDigits] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [billDetails, setBillDetails] = useState<CardDetails | null>(null);

    // Modal states
    const [showBankModal, setShowBankModal] = useState(false);
    const [bankSearchQuery, setBankSearchQuery] = useState("");

    // Payment states
    const [selectedAmountType, setSelectedAmountType] = useState<"total" | "minimum" | "custom">("total");
    const [customAmount, setCustomAmount] = useState("");
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("Wallet");
    const [isConfirmed, setIsConfirmed] = useState(false);

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

    const validateInitialForm = () => {
        return selectedBank && mobileNumber.length === 10 && lastFourDigits.length === 4 && cardHolderName.trim().length > 2;
    };

    const handleFetchBill = () => {
        if (!validateInitialForm()) return;

        setIsFetching(true);
        setTimeout(() => {
            const mockData: CardDetails = {
                holderName: cardHolderName.toUpperCase(),
                cardType: "Corporate Card",
                cardEnding: lastFourDigits,
                totalDue: 0.00,
                minimumDue: 0.00,
                dueDate: "N/A",
                availableLimit: 0.00,
                bankName: selectedBank.name,
            };
            setBillDetails(mockData);
            setIsFetching(false);
            
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]).start();
        }, 1500);
    };

    const getDisplayAmount = () => {
        if (!billDetails) return "0";
        if (selectedAmountType === "total") return billDetails.totalDue.toString();
        if (selectedAmountType === "minimum") return billDetails.minimumDue.toString();
        return customAmount || "0";
    };

    const handleProceedToPay = () => {
        const amount = getDisplayAmount();
        if (!isConfirmed || parseFloat(amount) <= 0) return;

        if (selectedPaymentMode === "Wallet") {
            router.push({
                pathname: "/wallet" as any,
                params: {
                    amount: amount,
                    billType: "Credit Card Bill",
                    lenderName: billDetails?.bankName,
                    loanAccountNumber: `XXXX XXXX XXXX ${billDetails?.cardEnding}`,
                    borrowerName: billDetails?.holderName,
                }
            });
        } else {
            // Placeholder for other payment methods (matching existing success logic)
            alert("Redirecting to " + selectedPaymentMode + " Gateway...");
        }
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
                        <Text style={styles.headerTitle}>Credit Card Bill</Text>
                        <Text style={styles.headerSubtitle}>Pay securely with instant settlement</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        
                        {!billDetails ? (
                            <>
                                {/* Bank Selection */}
                                <Text style={styles.sectionTitle}>Select Your Bank</Text>
                                <View style={styles.grid}>
                                    {popularBanks.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.gridItem, selectedBank?.id === item.id && styles.selectedGridItem]}
                                            onPress={() => setSelectedBank(item)}
                                        >
                                            <View style={[styles.iconCircle, selectedBank?.id === item.id && styles.selectedIconCircle]}>
                                                <MaterialCommunityIcons
                                                    name={item.icon as any}
                                                    size={24}
                                                    color={selectedBank?.id === item.id ? "#FFFFFF" : "#0D47A1"}
                                                />
                                            </View>
                                            <Text style={styles.gridLabel}>{item.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* View All Banks Section (Water Bill Style) */}
                                <View style={styles.browseContainer}>
                                    <TouchableOpacity style={styles.browseButton} onPress={() => setShowBankModal(true)}>
                                        <Text style={styles.browseText}>View All Banks</Text>
                                        <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                                    </TouchableOpacity>
                                </View>

                                {/* Form Container */}
                                <View style={styles.formCard}>
                                    {selectedBank && (
                                        <View style={[styles.fieldGroup, { marginBottom: 15 }]}>
                                            <Text style={styles.fieldLabel}>Selected Credit Card Issuer</Text>
                                            <View style={[styles.inputContainer, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                                                <MaterialCommunityIcons 
                                                    name={(selectedBank.icon as any) || "bank"} 
                                                    size={18} 
                                                    color="#0D47A1" 
                                                />
                                                <TextInput
                                                    style={[styles.input, { color: '#475569' }]}
                                                    value={selectedBank.name}
                                                    editable={false}
                                                />
                                                <TouchableOpacity onPress={() => setSelectedBank(null)}>
                                                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Card Holder Name</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Name as on card"
                                                autoCapitalize="characters"
                                                value={cardHolderName}
                                                onChangeText={setCardHolderName}
                                            />
                                        </View>
                                    </View>

                                    <View style={[styles.fieldGroup, { marginTop: 15 }]}>
                                        <Text style={styles.fieldLabel}>Registered Mobile Number</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="phone-portrait-outline" size={16} color="#94A3B8" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter 10 digit number"
                                                keyboardType="phone-pad"
                                                maxLength={10}
                                                value={mobileNumber}
                                                onChangeText={setMobileNumber}
                                            />
                                        </View>
                                    </View>

                                    <View style={[styles.fieldGroup, { marginTop: 15 }]}>
                                        <Text style={styles.fieldLabel}>Last 4 Digits of Card</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g. 1234"
                                                keyboardType="number-pad"
                                                maxLength={4}
                                                value={lastFourDigits}
                                                onChangeText={setLastFourDigits}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={handleFetchBill} disabled={!validateInitialForm() || isFetching} style={{ marginBottom: 30 }}>
                                    <LinearGradient
                                        colors={!validateInitialForm() || isFetching ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        {isFetching ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Fetch Bill Details</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                {/* Virtual Card Visualization */}
                                <LinearGradient colors={['#1A237E', '#0D47A1']} style={styles.virtualCard}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardBankName}>{billDetails.bankName}</Text>
                                        <MaterialCommunityIcons name="chip" size={32} color="#FFD700" />
                                    </View>
                                    <View style={styles.cardNumberContainer}>
                                        <Text style={styles.cardDigits}>XXXX XXXX XXXX</Text>
                                        <Text style={styles.cardDigitsHighlight}>{billDetails.cardEnding}</Text>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View>
                                            <Text style={styles.cardLabel}>CARD HOLDER</Text>
                                            <Text style={styles.cardValue}>{billDetails.holderName}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.cardLabel}>EXPIRES</Text>
                                            <Text style={styles.cardValue}>**/**</Text>
                                        </View>
                                    </View>
                                </LinearGradient>

                                {/* Bill Summary Details */}
                                <View style={styles.summaryCard}>
                                    <Text style={styles.sectionTitleSmall}>Payment Summary</Text>
                                    <View style={styles.summaryDivider} />
                                    
                                    <TouchableOpacity 
                                        style={[styles.amountOption, selectedAmountType === 'total' && styles.selectedAmountOption]}
                                        onPress={() => setSelectedAmountType('total')}
                                    >
                                        <View style={styles.amountLeft}>
                                            <Ionicons name={selectedAmountType === 'total' ? "radio-button-on" : "radio-button-off"} size={20} color="#0D47A1" />
                                            <Text style={styles.amountLabel}>Total Oustanding</Text>
                                        </View>
                                        <Text style={styles.amountValue}>₹{billDetails.totalDue.toLocaleString()}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.amountOption, selectedAmountType === 'minimum' && styles.selectedAmountOption]}
                                        onPress={() => setSelectedAmountType('minimum')}
                                    >
                                        <View style={styles.amountLeft}>
                                            <Ionicons name={selectedAmountType === 'minimum' ? "radio-button-on" : "radio-button-off"} size={20} color="#0D47A1" />
                                            <Text style={styles.amountLabel}>Minimum Due</Text>
                                        </View>
                                        <Text style={styles.amountValue}>₹{billDetails.minimumDue.toLocaleString()}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.amountOption, selectedAmountType === 'custom' && styles.selectedAmountOption]}
                                        onPress={() => setSelectedAmountType('custom')}
                                    >
                                        <View style={styles.amountLeft}>
                                            <Ionicons name={selectedAmountType === 'custom' ? "radio-button-on" : "radio-button-off"} size={20} color="#0D47A1" />
                                            <Text style={styles.amountLabel}>Custom Amount</Text>
                                        </View>
                                        {selectedAmountType === 'custom' ? (
                                            <TextInput
                                                style={styles.amountInput}
                                                placeholder="₹0.00"
                                                keyboardType="numeric"
                                                value={customAmount}
                                                onChangeText={setCustomAmount}
                                                autoFocus
                                            />
                                        ) : null}
                                    </TouchableOpacity>

                                    <View style={styles.dueDateBadge}>
                                        <Ionicons name="time-outline" size={14} color="#D32F2F" />
                                        <Text style={styles.dueDateText}>Due Date: {billDetails.dueDate}</Text>
                                    </View>
                                </View>

                                {/* Payment Mode */}
                                <View style={styles.formCard}>
                                    <Text style={styles.sectionTitleSmall}>Select Payment Mode</Text>
                                    <View style={styles.paymentModes}>
                                        {['Wallet', 'UPI', 'Net Banking'].map((mode) => (
                                            <TouchableOpacity
                                                key={mode}
                                                style={[styles.paymentModeCard, selectedPaymentMode === mode && styles.selectedPaymentModeCard]}
                                                onPress={() => setSelectedPaymentMode(mode)}
                                            >
                                                <Ionicons name={mode === 'Wallet' ? 'wallet' : 'cash-outline'} size={18} color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'} />
                                                <Text style={[styles.paymentModeText, selectedPaymentMode === mode && styles.selectedPaymentModeText]}>{mode}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.confirmRow} onPress={() => setIsConfirmed(!isConfirmed)}>
                                    <Ionicons name={isConfirmed ? "checkbox" : "square-outline"} size={20} color="#0D47A1" />
                                    <Text style={styles.confirmText}>I certify that the card details provided are correct.</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleProceedToPay} disabled={!isConfirmed || parseFloat(getDisplayAmount()) <= 0}>
                                    <LinearGradient
                                        colors={!isConfirmed || parseFloat(getDisplayAmount()) <= 0 ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.actionButtonText}>Pay ₹{parseFloat(getDisplayAmount()).toLocaleString()}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                            </Animated.View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bank Selection Modal */}
                <Modal visible={showBankModal} transparent animationType="slide" onRequestClose={() => setShowBankModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Credit Card Issuer</Text>
                                <TouchableOpacity onPress={() => setShowBankModal(false)}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput 
                                    style={styles.modalSearchInput} 
                                    placeholder="Search Bank..." 
                                    value={bankSearchQuery} 
                                    onChangeText={setBankSearchQuery} 
                                />
                            </View>
                            <ScrollView style={styles.optionsList}>
                                {allBanks.filter(b => b.toLowerCase().includes(bankSearchQuery.toLowerCase())).map((name, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.optionItem} 
                                        onPress={() => {
                                            const bankItem = popularBanks.find(p => p.name === name) || { id: name.toLowerCase(), name, icon: 'bank' };
                                            setSelectedBank(bankItem);
                                            setShowBankModal(false);
                                        }}
                                    >
                                        <Text style={styles.optionText}>{name}</Text>
                                        {selectedBank?.name === name && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
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
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 20, 
        paddingTop: 50, 
        paddingBottom: 20, 
        backgroundColor: '#FFFFFF', 
        borderBottomWidth: 1, 
        borderBottomColor: '#F0F0F0' 
    },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
    headerSubtitle: { fontSize: 11, color: "#666", marginTop: 2 },
    placeholder: { width: 34 },
    scrollContent: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
    sectionTitleSmall: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 12 },
    
    // Grid Styles
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    gridItem: { 
        width: '31%', 
        alignItems: 'center', 
        marginBottom: 15, 
        paddingVertical: 12, 
        backgroundColor: '#FFFFFF', 
        borderRadius: 16, 
        elevation: 1,
        borderWidth: 1,
        borderColor: 'transparent'
    },
    selectedGridItem: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    iconCircle: { 
        width: 48, 
        height: 48, 
        borderRadius: 24, 
        backgroundColor: '#F1F8FE', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 8 
    },
    selectedIconCircle: { backgroundColor: '#0D47A1' },
    gridLabel: { fontSize: 10, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },

    // Browse Styles (Water Bill style)
    browseContainer: { alignItems: 'center', marginBottom: 20 },
    browseButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#E3F2FD', 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: '#BBDEFB', 
        gap: 6 
    },
    browseText: { fontSize: 13, fontWeight: '700', color: '#0D47A1' },

    // Form Styles
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 1 },
    fieldGroup: { width: '100%' },
    fieldLabel: { fontSize: 12, fontWeight: "700", color: "#64748B", marginBottom: 8 },
    inputContainer: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#F8FAFC", 
        borderRadius: 12, 
        paddingHorizontal: 15, 
        height: 52, 
        borderWidth: 1, 
        borderColor: "#E2E8F0" 
    },
    input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '500' },
    actionButton: { height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },

    // Virtual Card Styles
    virtualCard: { 
        width: '100%', 
        height: 200, 
        borderRadius: 20, 
        padding: 25, 
        marginBottom: 25, 
        elevation: 5,
        justifyContent: 'space-between'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardBankName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    cardNumberContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    cardDigits: { color: '#FFFFFF', fontSize: 20, fontWeight: '500', letterSpacing: 4, opacity: 0.8 },
    cardDigitsHighlight: { color: '#FFFFFF', fontSize: 22, fontWeight: '600', letterSpacing: 2 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardLabel: { color: '#BBDEFB', fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
    cardValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },

    // Summary Styles
    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 1 },
    summaryDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
    amountOption: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 12,
        marginBottom: 8
    },
    selectedAmountOption: { backgroundColor: '#F0F7FF', borderWidth: 1, borderColor: '#0D47A1' },
    amountLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    amountLabel: { fontSize: 14, color: '#334155', fontWeight: '500' },
    amountValue: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
    amountInput: { 
        width: 100, 
        textAlign: 'right', 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#0D47A1',
        borderBottomWidth: 1,
        borderBottomColor: '#0D47A1'
    },
    dueDateBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#FEF2F2', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 6,
        marginTop: 10,
        alignSelf: 'flex-start'
    },
    dueDateText: { fontSize: 11, color: '#D32F2F', fontWeight: '600', marginLeft: 4 },

    // Payment Mode List
    paymentModes: { flexDirection: 'row', gap: 10 },
    paymentModeCard: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingVertical: 10, 
        borderRadius: 10, 
        backgroundColor: '#F8FAFC', 
        borderWidth: 1, 
        borderColor: '#E2E8F0', 
        gap: 6 
    },
    selectedPaymentModeCard: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    paymentModeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    selectedPaymentModeText: { color: '#0D47A1' },

    confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
    confirmText: { fontSize: 11, color: '#64748B', flex: 1 },

    // Modal Styles
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