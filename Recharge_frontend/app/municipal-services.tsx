import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import {
    ActivityIndicator,
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
} from "react-native";

interface ServiceDetails {
    ownerName: string;
    consumerId: string;
    address: string;
    pendingAmount: number;
    penalty: number;
    totalPayable: number;
    serviceName: string;
}

const serviceCategories = [
    { id: '1', name: "Property Tax", icon: "home-city", desc: "Pay property tax" },
    { id: '2', name: "Water Tax", icon: "water", desc: "Pay municipal water charges" },
    { id: '3', name: "Garbage / Sanitation Tax", icon: "trash-can", desc: "Pay sanitation charges" },
    { id: '4', name: "Building Permission / Plan", icon: "office-building-cog", desc: "Construction approval payments" },
    { id: '5', name: "Trade License", icon: "file-certificate", desc: "Apply / Renew trade license" },
    { id: '6', name: "Shop Act License", icon: "store", desc: "Apply / Renew shop registration" },
    { id: '7', name: "Birth Certificate", icon: "baby-face-outline", desc: "Apply / Download certificate" },
    { id: '8', name: "Death Certificate", icon: "heart-off", desc: "Apply / Download certificate" },
    { id: '9', name: "Land & Map Fees", icon: "map-marker-radius", desc: "Pay land & map fees" },
    { id: '10', name: "Advertisement Tax", icon: "billboard", desc: "Pay advertisement tax" },
    { id: '11', name: "Fire Safety Cess", icon: "fire-hydrant", desc: "Pay fire safety cess" },
    { id: '12', name: "Municipal Lease Rent", icon: "key-chain", desc: "Pay municipal lease rent" },
];

export default function MunicipalServicesScreen() {
    const router = useRouter();

    // Form states
    const [selectedService, setSelectedService] = useState("");
    const [consumerId, setConsumerId] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Dropdown State
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Card States
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const handleBack = useCallback(() => {
        if (showDropdown) {
            setShowDropdown(false);
            return true;
        }
        if (serviceDetails) {
            setServiceDetails(null);
            return true;
        }
        router.back();
        return true;
    }, [router, serviceDetails, showDropdown]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

    const handleServiceSelect = (service: string) => {
        setSelectedService(service);
        setShowDropdown(false);
        setSearchQuery("");
    };

    const validateForm = () => {
        if (!selectedService) return false;
        if (consumerId.trim().length < 4) return false;
        if (mobileNumber.trim().length !== 10) return false;
        return true;
    };

    const handleFetchDetails = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setTimeout(() => {
            const mockData: ServiceDetails = {
                ownerName: ownerName || "Amit Sharma",
                consumerId: consumerId,
                address: "Flat 402, Lotus Residency, MG Road",
                pendingAmount: 2450,
                penalty: 50,
                totalPayable: 2500,
                serviceName: selectedService,
            };

            setServiceDetails(mockData);
            setPaymentAmount(mockData.totalPayable.toString());
            setIsLoading(false);

            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
        }, 1500);
    };

    const handleCardNumberChange = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        setCardNumber(formatted.substring(0, 19));
    };

    const handleExpiryChange = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        setExpiryDate(formatted);
    };

    const isReadyToPay = () => {
        if (!isConfirmed || !selectedPaymentMode || !paymentAmount || parseFloat(paymentAmount) <= 0) return false;
        if (selectedPaymentMode.includes("Card")) {
            if (!cardNumber || cardNumber.length < 19 || !expiryDate || expiryDate.length < 5 || !cvv || cvv.length < 3 || !cardHolder) return false;
        }
        return true;
    };

    const isReady = isReadyToPay();

    const handleProceedToPay = () => {
        if (!isReady || !paymentAmount) return;

        if (selectedPaymentMode === 'Wallet') {
            router.replace({
                pathname: "/wallet" as any,
                params: {
                    amount: paymentAmount,
                    billType: "municipal",
                    borrowerName: serviceDetails?.ownerName,
                    loanAccountNumber: serviceDetails?.consumerId,
                    lenderName: selectedService,
                },
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowPaymentSuccess(true);
        }, 3000);
    };

    const filteredServices = serviceCategories.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Municipal Services</Text>
                        <Text style={styles.headerSubtitle}>Access and pay for municipal services</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>

                            {!serviceDetails ? (
                                <>
                                    {/* Dropdown Selector */}
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionTitle}>Select Service Type</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.dropdownTrigger}
                                        onPress={() => setShowDropdown(true)}
                                    >
                                        <View style={styles.dropdownLeft}>
                                            <MaterialCommunityIcons
                                                name={selectedService ? serviceCategories.find(s => s.name === selectedService)?.icon as any : "office-building"}
                                                size={24}
                                                color="#0D47A1"
                                            />
                                            <Text style={[styles.dropdownValue, !selectedService && styles.dropdownPlaceholder]}>
                                                {selectedService || "Choose Municipal Service"}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={20} color="#64748B" />
                                    </TouchableOpacity>

                                    {/* Service Detail Form */}
                                    <View style={styles.formCard}>
                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Consumer / Property ID *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="document-text-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter ID or Consumer Number"
                                                    placeholderTextColor="#94A3B8"
                                                    value={consumerId}
                                                    onChangeText={setConsumerId}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Owner Name</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter Owner Name"
                                                    placeholderTextColor="#94A3B8"
                                                    value={ownerName}
                                                    onChangeText={setOwnerName}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Registered Mobile Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="phone-portrait-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="10 digit mobile number"
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="phone-pad"
                                                    maxLength={10}
                                                    value={mobileNumber}
                                                    onChangeText={setMobileNumber}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity onPress={handleFetchDetails} disabled={!validateForm() || isLoading} style={{ marginBottom: 24 }}>
                                        <LinearGradient
                                            colors={!validateForm() || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Fetch Details</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                    {/* Bill Summary Card */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialCommunityIcons name="office-building" size={24} color="#0D47A1" />
                                            <Text style={styles.summaryTitle}>{selectedService} Summary</Text>
                                        </View>
                                        <View style={styles.divider} />

                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Owner Name</Text>
                                            <Text style={styles.summaryValue}>{serviceDetails.ownerName}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Property ID</Text>
                                            <Text style={styles.summaryValue}>{serviceDetails.consumerId}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Service</Text>
                                            <Text style={styles.summaryValue}>{serviceDetails.serviceName}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Address</Text>
                                            <Text style={[styles.summaryValue, { flex: 0.7, textAlign: 'right' }]}>{serviceDetails.address}</Text>
                                        </View>

                                        <View style={styles.amountBanner}>
                                            <View>
                                                <Text style={styles.bannerLabel}>Pending</Text>
                                                <Text style={styles.bannerValue}>₹{serviceDetails.pendingAmount}</Text>
                                            </View>
                                            <View style={styles.verticalDivider} />
                                            <View>
                                                <Text style={styles.bannerLabel}>Penalty</Text>
                                                <Text style={styles.bannerValue}>₹{serviceDetails.penalty}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Payment Section */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.sectionTitle}>Payment Details</Text>
                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Enter Amount</Text>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.currencyPrefix}>₹</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    keyboardType="numeric"
                                                    value={paymentAmount}
                                                    onChangeText={setPaymentAmount}
                                                />
                                            </View>
                                        </View>

                                        <Text style={styles.fieldLabel}>Select Payment Mode</Text>
                                        <View style={styles.paymentModes}>
                                            {['Wallet', 'Debit Card', 'Credit Card', 'Net Banking'].map((mode) => (
                                                <TouchableOpacity
                                                    key={mode}
                                                    style={[styles.paymentModeCard, selectedPaymentMode === mode && styles.selectedPaymentModeCard]}
                                                    onPress={() => setSelectedPaymentMode(mode)}
                                                >
                                                    <Ionicons name={mode === 'Wallet' ? 'wallet' : 'card'} size={20} color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'} />
                                                    <Text style={[styles.paymentModeText, selectedPaymentMode === mode && styles.selectedPaymentModeText]}>{mode}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {selectedPaymentMode.includes("Card") && (
                                            <View style={styles.cardFormContainer}>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Name on Card</Text>
                                                    <View style={styles.inputContainer}>
                                                        <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                        <TextInput style={styles.input} placeholder="Card Holder Name" placeholderTextColor="#94A3B8" value={cardHolder} onChangeText={setCardHolder} autoCapitalize="characters" />
                                                    </View>
                                                </View>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Card Number</Text>
                                                    <View style={styles.inputContainer}>
                                                        <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                                        <TextInput style={styles.input} placeholder="0000 0000 0000 0000" placeholderTextColor="#94A3B8" keyboardType="numeric" value={cardNumber} onChangeText={handleCardNumberChange} maxLength={19} />
                                                    </View>
                                                </View>
                                                <View style={styles.row}>
                                                    <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                                        <Text style={styles.fieldLabel}>Expiry</Text>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#94A3B8" keyboardType="numeric" value={expiryDate} onChangeText={handleExpiryChange} maxLength={5} />
                                                        </View>
                                                    </View>
                                                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                                                        <Text style={styles.fieldLabel}>CVV</Text>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput style={styles.input} placeholder="123" placeholderTextColor="#94A3B8" keyboardType="numeric" secureTextEntry value={cvv} onChangeText={setCvv} maxLength={3} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity style={styles.declarationRow} onPress={() => setIsConfirmed(!isConfirmed)}>
                                        <Ionicons name={isConfirmed ? "checkbox" : "square-outline"} size={22} color={isConfirmed ? "#0D47A1" : "#64748B"} />
                                        <Text style={styles.declarationText}>I confirm that the above details are correct and authorize this municipal payment.</Text>
                                    </TouchableOpacity>

                                    <View style={styles.footerButtons}>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setServiceDetails(null)}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={handleProceedToPay} disabled={!isReady || isLoading} style={{ flex: 1 }}>
                                            <LinearGradient
                                                colors={!isReady || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                style={styles.payButton}
                                            >
                                                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Proceed to Pay</Text>}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            )}

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Aesthetic Dropdown Modal */}
                <Modal visible={showDropdown} transparent animationType="slide" onRequestClose={() => setShowDropdown(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Service</Text>
                                <TouchableOpacity onPress={() => setShowDropdown(false)}>
                                    <Ionicons name="close" size={24} color="#1A1A1A" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#94A3B8" />
                                <TextInput
                                    style={styles.modalSearchInput}
                                    placeholder="Search services..."
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>

                            <ScrollView style={styles.optionsList}>
                                {filteredServices.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.optionItem, selectedService === item.name && styles.selectedOption]}
                                        onPress={() => handleServiceSelect(item.name)}
                                    >
                                        <View style={styles.optionLeft}>
                                            <View style={styles.modalIconCircle}>
                                                <MaterialCommunityIcons name={item.icon as any} size={22} color="#0D47A1" />
                                            </View>
                                            <View>
                                                <Text style={[styles.optionText, selectedService === item.name && styles.selectedOptionText]}>{item.name}</Text>
                                                <Text style={styles.optionDesc}>{item.desc}</Text>
                                            </View>
                                        </View>
                                        {selectedService === item.name && (
                                            <Ionicons name="checkmark-circle" size={24} color="#0D47A1" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Success Modal */}
                <Modal visible={showPaymentSuccess} transparent animationType="fade">
                    <View style={styles.successOverlay}>
                        <View style={styles.successCard}>
                            <View style={styles.successIcon}><Ionicons name="checkmark" size={50} color="#FFFFFF" /></View>
                            <Text style={styles.successTitle}>Payment Successful</Text>
                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptValue}>TX-MUN-{Math.floor(Math.random() * 900000) + 100000}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Service Type</Text><Text style={styles.receiptValue}>{selectedService}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount Paid</Text><Text style={styles.receiptValue}>₹{paymentAmount}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Date</Text><Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text></View>
                            </View>
                            <View style={styles.successActionRow}>
                                <TouchableOpacity style={styles.receiptAction}><Ionicons name="download-outline" size={20} color="#0D47A1" /><Text style={styles.receiptActionText}>Download</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.receiptAction}><Ionicons name="share-social-outline" size={20} color="#0D47A1" /><Text style={styles.receiptActionText}>Share</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.backHomeButton} onPress={() => { setShowPaymentSuccess(false); router.back(); }}><Text style={styles.backHomeText}>Back to Services</Text></TouchableOpacity>
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
    headerSubtitle: { fontSize: 11, color: "#666", marginTop: 2 },
    placeholder: { width: 34 },
    scrollContent: { padding: 20 },
    content: { paddingVertical: 10 },
    sectionHeaderRow: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
    dropdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dropdownValue: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    dropdownPlaceholder: { color: '#94A3B8' },
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
    fieldGroup: { marginBottom: 15 },
    fieldLabel: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 6 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: "#E0E0E0" },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },
    actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 13, color: '#64748B' },
    summaryValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
    amountBanner: { flexDirection: 'row', backgroundColor: '#F1F8FE', borderRadius: 12, padding: 15, marginTop: 10, justifyContent: 'space-around' },
    bannerLabel: { fontSize: 11, color: '#64748B', textAlign: 'center', marginBottom: 4 },
    bannerValue: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1', textAlign: 'center' },
    verticalDivider: { width: 1, backgroundColor: '#D1E9FF' },
    currencyPrefix: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    paymentModes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 10 },
    paymentModeCard: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
    selectedPaymentModeCard: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    paymentModeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    selectedPaymentModeText: { color: '#0D47A1' },
    cardFormContainer: { marginTop: 15, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    row: { flexDirection: 'row' },
    declarationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
    declarationText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 16 },
    footerButtons: { flexDirection: 'row', gap: 15, marginBottom: 40 },
    cancelButton: { flex: 0.4, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
    cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
    payButton: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '70%', padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
    modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 15 },
    modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B' },
    optionsList: { flex: 1 },
    optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    selectedOption: { backgroundColor: '#F0F7FF', borderRadius: 12, paddingHorizontal: 10, marginHorizontal: -10 },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    modalIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F8FE', justifyContent: 'center', alignItems: 'center' },
    optionText: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
    selectedOptionText: { color: '#0D47A1' },
    optionDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
    successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successCard: { backgroundColor: '#FFFFFF', borderRadius: 24, width: '100%', padding: 30, alignItems: 'center' },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 30, textAlign: 'center' },
    receipt: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 25 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    receiptLabel: { fontSize: 13, color: '#64748B' },
    receiptValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
    successActionRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
    receiptAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    receiptActionText: { fontSize: 14, fontWeight: 'bold', color: '#0D47A1' },
    backHomeButton: { width: '100%', height: 56, backgroundColor: '#1E293B', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    backHomeText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
