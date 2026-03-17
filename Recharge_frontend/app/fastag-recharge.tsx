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

interface Issuer {
    id: string;
    name: string;
    icon: string;
}

interface TagDetails {
    vehicleNumber: string;
    bankName: string;
    availableBalance: string;
    minimumBalance: string;
    tagId: string;
    vehicleClass: string;
    registeredMobile: string;
}

const popularIssuers: Issuer[] = [
    { id: 'sbi', name: 'SBI FASTag', icon: 'bank' },
    { id: 'hdfc', name: 'HDFC Bank', icon: 'bank-outline' },
    { id: 'icici', name: 'ICICI Bank', icon: 'bank-transfer' },
    { id: 'axis', name: 'Axis Bank', icon: 'shield-check-outline' },
    { id: 'paytm', name: 'Paytm FASTag', icon: 'credit-card-outline' },
    { id: 'kotak', name: 'Kotak Bank', icon: 'card-account-details-outline' },
];

const allIssuers = [
    // Public Sector
    "State Bank of India (SBI)", "Bank of Baroda", "Punjab National Bank", "Union Bank of India",
    "Canara Bank", "Indian Bank", "Central Bank of India", "Bank of Maharashtra",
    "UCO Bank", "Indian Overseas Bank", "Punjab & Sind Bank",
    // Private Sector
    "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "IDFC First Bank", "IndusInd Bank", "Yes Bank", "Federal Bank",
    "South Indian Bank", "Karur Vysya Bank", "City Union Bank",
    // Payment Banks
    "Paytm Payments Bank", "Airtel Payments Bank", "India Post Payments Bank (IPPB)",
    "Fino Payments Bank",
    // Other
    "Equitas Small Finance Bank", "AU Small Finance Bank", "IDBI Bank", "Saraswat Bank",
];

const quickAmounts = ['500', '1000', '1500', '2000'];

export default function FASTagScreen() {
    const router = useRouter();

    // Form states
    const [selectedIssuer, setSelectedIssuer] = useState<Issuer | null>(null);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [tagDetails, setTagDetails] = useState<TagDetails | null>(null);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('Wallet');
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Card Details states
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    // Modal states
    const [showIssuerModal, setShowIssuerModal] = useState(false);
    const [issuerSearchQuery, setIssuerSearchQuery] = useState('');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const handleBack = useCallback(() => {
        if (tagDetails) {
            setTagDetails(null);
            setIsConfirmed(false);
            setRechargeAmount('');
            return true;
        }
        router.back();
        return true;
    }, [router, tagDetails]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

    // Handle Vehicle Number Input (Auto uppercase)
    const handleVehicleNumberChange = (text: string) => {
        const formatted = text.replace(/\s/g, '').toUpperCase();
        setVehicleNumber(formatted);
    };

    // Validate Vehicle Number (Indian format: AA00AA0000)
    const validateVehicleNumber = (number: string) => {
        const regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
        return regex.test(number);
    };

    const validateForm = () => {
        return selectedIssuer && validateVehicleNumber(vehicleNumber);
    };

    // Fetch FASTag Details
    const handleFetchDetails = () => {
        if (!validateForm()) return;

        setIsFetching(true);
        setTimeout(() => {
            setTagDetails({
                vehicleNumber: vehicleNumber,
                bankName: selectedIssuer!.name,
                availableBalance: '₹0',
                minimumBalance: '₹100',
                tagId: 'FAST' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                vehicleClass: 'Car/Jeep/Van',
                registeredMobile: mobileNumber || 'N/A',
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

    // Expiry formatter
    const handleExpiryChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        setExpiryDate(formatted);
    };

    // Check if card payment is ready
    const isCardPaymentReady = () => {
        if (!selectedPaymentMode.includes('Card (Debit') && !selectedPaymentMode.includes('Card') && selectedPaymentMode !== 'Debit Card' && selectedPaymentMode !== 'Credit Card') return true;
        return cardNumber.replace(/\s/g, '').length === 16 && expiryDate.length === 5 && cvv.length === 3 && cardHolder.trim().length > 2;
    };

    // Handle Payment
    const handlePayment = () => {
        if (!rechargeAmount || parseInt(rechargeAmount) < 100 || !isConfirmed) return;
        if (!isCardPaymentReady()) return;

        if (selectedPaymentMode === 'Wallet') {
            router.push({
                pathname: "/wallet" as any,
                params: {
                    amount: rechargeAmount,
                    billType: "FASTag Recharge",
                    lenderName: tagDetails?.bankName,
                    loanAccountNumber: tagDetails?.vehicleNumber,
                    borrowerName: tagDetails?.vehicleNumber,
                },
            });
        } else {
            Alert.alert("Redirecting", `Redirecting to ${selectedPaymentMode} Gateway...`);
        }
    };

    const handleIssuerModalSelect = (name: string) => {
        const found = popularIssuers.find(p => p.name === name);
        const issuerItem = found || { id: name.toLowerCase().replace(/\s/g, ''), name, icon: 'bank' };
        setSelectedIssuer(issuerItem);
        setShowIssuerModal(false);
        setTagDetails(null);
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
                        <Text style={styles.headerTitle}>FASTag Recharge</Text>
                        <Text style={styles.headerSubtitle}>Instant toll recharge for all banks</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>

                        {!tagDetails ? (
                            <>
                                {/* Popular Issuers Grid */}
                                <Text style={styles.sectionTitle}>Select FASTag Issuer</Text>
                                <View style={styles.grid}>
                                    {popularIssuers.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.gridItem, selectedIssuer?.id === item.id && styles.selectedGridItem]}
                                            onPress={() => { setSelectedIssuer(item); setTagDetails(null); }}
                                        >
                                            <View style={[styles.iconCircle, selectedIssuer?.id === item.id && styles.selectedIconCircle]}>
                                                <MaterialCommunityIcons
                                                    name={item.icon as any}
                                                    size={24}
                                                    color={selectedIssuer?.id === item.id ? "#FFFFFF" : "#0D47A1"}
                                                />
                                            </View>
                                            <Text style={styles.gridLabel}>{item.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* View All Providers */}
                                <View style={styles.browseContainer}>
                                    <TouchableOpacity style={styles.browseButton} onPress={() => setShowIssuerModal(true)}>
                                        <Text style={styles.browseText}>View All Providers</Text>
                                        <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                                    </TouchableOpacity>
                                </View>

                                {/* Form Card */}
                                <View style={styles.formCard}>
                                    {selectedIssuer && (
                                        <View style={[styles.fieldGroup, { marginBottom: 15 }]}>
                                            <Text style={styles.fieldLabel}>Selected FASTag Issuer</Text>
                                            <View style={[styles.inputContainer, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }]}>
                                                <MaterialCommunityIcons
                                                    name={(selectedIssuer.icon as any) || "bank"}
                                                    size={18}
                                                    color="#0D47A1"
                                                />
                                                <TextInput
                                                    style={[styles.input, { color: '#475569' }]}
                                                    value={selectedIssuer.name}
                                                    editable={false}
                                                />
                                                <TouchableOpacity onPress={() => setSelectedIssuer(null)}>
                                                    <Ionicons name="close-circle" size={20} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Vehicle Number *</Text>
                                        <View style={styles.inputContainer}>
                                            <MaterialCommunityIcons name="car" size={16} color="#94A3B8" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g. MH12AB1234"
                                                placeholderTextColor="#94A3B8"
                                                autoCapitalize="characters"
                                                maxLength={13}
                                                value={vehicleNumber}
                                                onChangeText={handleVehicleNumberChange}
                                            />
                                        </View>
                                        {vehicleNumber.length > 0 && !validateVehicleNumber(vehicleNumber) && (
                                            <Text style={styles.errorText}>Invalid format (e.g. MH12AB1234)</Text>
                                        )}
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

                                <TouchableOpacity onPress={handleFetchDetails} disabled={!validateForm() || isFetching} style={{ marginBottom: 30 }}>
                                    <LinearGradient
                                        colors={!validateForm() || isFetching ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        {isFetching ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Fetch FASTag Details</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                {/* FASTag Card Visualization */}
                                <LinearGradient colors={['#0D47A1', '#1565C0', '#1976D2']} style={styles.fastagCard}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardBankName}>{tagDetails.bankName}</Text>
                                        <MaterialCommunityIcons name="highway" size={28} color="#FFD700" />
                                    </View>
                                    <View style={styles.cardVehicleContainer}>
                                        <MaterialCommunityIcons name="car" size={22} color="rgba(255,255,255,0.7)" />
                                        <Text style={styles.cardVehicleNumber}>{tagDetails.vehicleNumber}</Text>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View>
                                            <Text style={styles.cardLabel}>TAG ID</Text>
                                            <Text style={styles.cardValue}>{tagDetails.tagId}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={styles.cardLabel}>VEHICLE CLASS</Text>
                                            <Text style={styles.cardValue}>{tagDetails.vehicleClass}</Text>
                                        </View>
                                    </View>
                                </LinearGradient>

                                {/* Balance Info */}
                                <View style={styles.balanceBanner}>
                                    <View style={styles.balanceItem}>
                                        <Text style={styles.balanceLabel}>Available Balance</Text>
                                        <Text style={styles.balanceValue}>{tagDetails.availableBalance}</Text>
                                    </View>
                                    <View style={styles.balanceDivider} />
                                    <View style={styles.balanceItem}>
                                        <Text style={styles.balanceLabel}>Min Balance</Text>
                                        <Text style={[styles.balanceValue, { color: '#FF9800' }]}>{tagDetails.minimumBalance}</Text>
                                    </View>
                                </View>

                                {/* Recharge Amount */}
                                <View style={styles.summaryCard}>
                                    <Text style={styles.sectionTitleSmall}>Recharge Amount</Text>
                                    <View style={styles.summaryDivider} />

                                    <View style={styles.quickAmounts}>
                                        {quickAmounts.map((amt) => (
                                            <TouchableOpacity
                                                key={amt}
                                                style={[styles.quickAmountChip, rechargeAmount === amt && styles.selectedQuickAmount]}
                                                onPress={() => setRechargeAmount(amt)}
                                            >
                                                <Text style={[styles.quickAmountText, rechargeAmount === amt && styles.selectedQuickAmountText]}>₹{amt}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Or Enter Custom Amount</Text>
                                        <View style={styles.inputContainer}>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E293B' }}>₹</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Min ₹100"
                                                placeholderTextColor="#94A3B8"
                                                keyboardType="number-pad"
                                                value={rechargeAmount}
                                                onChangeText={setRechargeAmount}
                                            />
                                        </View>
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
                                                <Ionicons name={mode === 'Wallet' ? 'wallet' : 'cash-outline'} size={18} color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'} />
                                                <Text style={[styles.paymentModeText, selectedPaymentMode === mode && styles.selectedPaymentModeText]}>{mode}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Card Details Form */}
                                    {(selectedPaymentMode === 'Debit Card' || selectedPaymentMode === 'Credit Card') && (
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
                                    <Text style={styles.confirmText}>I confirm that the vehicle and FASTag details are correct and authorize this recharge.</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handlePayment} disabled={!isConfirmed || !rechargeAmount || parseInt(rechargeAmount) < 100 || !isCardPaymentReady()} style={{ marginBottom: 40 }}>
                                    <LinearGradient
                                        colors={!isConfirmed || !rechargeAmount || parseInt(rechargeAmount) < 100 || !isCardPaymentReady() ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        style={styles.actionButton}
                                    >
                                        <Text style={styles.actionButtonText}>
                                            Pay ₹{parseInt(rechargeAmount) || 0}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Issuer Selection Modal */}
                <Modal visible={showIssuerModal} transparent animationType="slide" onRequestClose={() => setShowIssuerModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select FASTag Issuer</Text>
                                <TouchableOpacity onPress={() => setShowIssuerModal(false)}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput
                                    style={styles.modalSearchInput}
                                    placeholder="Search Provider..."
                                    value={issuerSearchQuery}
                                    onChangeText={setIssuerSearchQuery}
                                />
                            </View>
                            <ScrollView style={styles.optionsList}>
                                {allIssuers.filter(b => b.toLowerCase().includes(issuerSearchQuery.toLowerCase())).map((name, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.optionItem}
                                        onPress={() => handleIssuerModalSelect(name)}
                                    >
                                        <Text style={styles.optionText}>{name}</Text>
                                        {selectedIssuer?.name === name && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
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

    // Grid
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

    // Browse
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

    // Form
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
    errorText: { fontSize: 11, color: '#D32F2F', marginTop: 6 },
    actionButton: { height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },

    // FASTag Card
    fastagCard: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        padding: 25,
        marginBottom: 20,
        elevation: 5,
        justifyContent: 'space-between'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardBankName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    cardVehicleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardVehicleNumber: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', letterSpacing: 3 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardLabel: { color: '#BBDEFB', fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
    cardValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },

    // Balance Banner
    balanceBanner: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 1,
        alignItems: 'center'
    },
    balanceItem: { flex: 1, alignItems: 'center' },
    balanceDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },
    balanceLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
    balanceValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },

    // Summary Card
    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 1 },
    summaryDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },

    // Quick Amounts
    quickAmounts: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    quickAmountChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center'
    },
    selectedQuickAmount: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    quickAmountText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    selectedQuickAmountText: { color: '#0D47A1' },

    // Payment Modes
    paymentModes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    paymentModeCard: {
        flex: 1,
        minWidth: '45%',
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