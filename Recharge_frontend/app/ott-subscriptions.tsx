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
    Alert,
} from "react-native";

interface PlanDetails {
    planName: string;
    duration: string;
    amount: number;
    taxes: number;
    total: number;
    subscriberName: string;
    renewalDate: string;
}

const mainOttPlatforms = [
    { id: '1', name: "Netflix", icon: "netflix" },
    { id: '2', name: "Amazon Prime", icon: "video-outline" },
    { id: '3', name: "JioHotstar", icon: "star-outline" },
    { id: '4', name: "Sony LIV", icon: "play-circle-outline" },
    { id: '5', name: "Zee5", icon: "numeric-5-circle-outline" },
    { id: '6', name: "JioCinema", icon: "movie-open-outline" },
];

const otherSubscriptions = [
    { id: '1', name: "YouTube Premium", icon: "youtube" },
    { id: '2', name: "Spotify", icon: "spotify" },
    { id: '3', name: "Apple Music", icon: "apple" },
    { id: '4', name: "Newspaper", icon: "newspaper-variant-outline" },
    { id: '5', name: "Magazine", icon: "book-open-variant" },
];

const subscriptionPlans = ["Monthly", "Quarterly", "Annual"];

const OTTSubscriptionsScreen = () => {
    const router = useRouter();

    // UI States
    const [selectedPlatform, setSelectedPlatform] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);

    // Form States
    const [accountIdentifier, setAccountIdentifier] = useState("");
    const [selectedPlan, setSelectedPlan] = useState("Monthly");
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Payment States
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const handleBack = useCallback(() => {
        if (planDetails) {
            setPlanDetails(null);
            return true;
        }
        if (selectedPlatform) {
            setSelectedPlatform("");
            return true;
        }
        router.back();
        return true;
    }, [router, selectedPlatform, planDetails]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

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

    const handleFetchPlan = () => {
        if (!accountIdentifier) {
            Alert.alert("Error", "Please enter registered mobile or email.");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const mockPlan: PlanDetails = {
                planName: `${selectedPlatform} Premium`,
                duration: selectedPlan,
                amount: selectedPlan === "Monthly" ? 199 : selectedPlan === "Quarterly" ? 499 : 1499,
                taxes: selectedPlan === "Monthly" ? 35.82 : selectedPlan === "Quarterly" ? 89.82 : 269.82,
                total: selectedPlan === "Monthly" ? 234.82 : selectedPlan === "Quarterly" ? 588.82 : 1768.82,
                subscriberName: "John Doe",
                renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            };
            setPlanDetails(mockPlan);
            setIsLoading(false);

            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
        }, 1500);
    };

    const isReadyToPay = () => {
        if (!isConfirmed || !selectedPaymentMode || !planDetails) return false;

        if (selectedPaymentMode.includes("Card")) {
            if (!cardNumber || cardNumber.length < 19 || !expiryDate || expiryDate.length < 5 || !cvv || cvv.length < 3 || !cardHolder) return false;
        }
        return true;
    };

    const handleProceed = () => {
        if (!isReadyToPay()) {
            Alert.alert("Required", "Please complete all payment details and confirm the declaration.");
            return;
        }

        if (selectedPaymentMode === 'Wallet') {
            router.replace({
                pathname: "/wallet" as any,
                params: {
                    amount: planDetails?.total.toString(),
                    billType: "ott",
                    borrowerName: planDetails?.subscriberName,
                    loanAccountNumber: accountIdentifier,
                    lenderName: selectedPlatform,
                },
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowSuccess(true);
        }, 2000);
    };

    const platforms = [...mainOttPlatforms, ...otherSubscriptions].map(p => p.name);
    const filteredPlatforms = platforms.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

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
                        <Text style={styles.headerTitle}>OTT & Subscriptions</Text>
                        <Text style={styles.headerSubtitle}>Manage and renew your digital subscriptions</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>
                            {!selectedPlatform ? (
                                <>
                                    {/* Platform Search */}
                                    <TouchableOpacity style={styles.searchBar} onPress={() => setShowSearchModal(true)}>
                                        <Ionicons name="search" size={20} color="#64748B" />
                                        <Text style={styles.searchBarText}>Search OTT Platform / Subscription Service</Text>
                                    </TouchableOpacity>

                                    {/* Popular OTT Platforms Grid */}
                                    <Text style={styles.sectionTitle}>Popular OTT Platforms</Text>
                                    <View style={styles.grid}>
                                        {mainOttPlatforms.map((item) => (
                                            <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => setSelectedPlatform(item.name)}>
                                                <View style={styles.iconCircle}>
                                                    <MaterialCommunityIcons name={item.icon as any} size={28} color="#0D47A1" />
                                                </View>
                                                <Text style={styles.gridLabel}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Other Subscriptions Grid */}
                                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Other Subscriptions</Text>
                                    <View style={styles.grid}>
                                        {otherSubscriptions.map((item) => (
                                            <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => setSelectedPlatform(item.name)}>
                                                <View style={styles.iconCircle}>
                                                    <MaterialCommunityIcons name={item.icon as any} size={28} color="#0D47A1" />
                                                </View>
                                                <Text style={styles.gridLabel}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : !planDetails ? (
                                <View style={styles.formCard}>
                                    <View style={styles.selectedPlatformHeader}>
                                        <MaterialCommunityIcons
                                            name={([...mainOttPlatforms, ...otherSubscriptions].find(p => p.name === selectedPlatform)?.icon || "television-play") as any}
                                            size={32}
                                            color="#0D47A1"
                                        />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={styles.selectedPlatformLabel}>Selected Platform</Text>
                                            <Text style={styles.selectedPlatformName}>{selectedPlatform}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedPlatform("")}>
                                            <Text style={styles.changeText}>Change</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.divider} />

                                    <Text style={styles.formTitle}>Account Information</Text>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Mobile Number / Email ID *</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="Enter Mobile number or email" value={accountIdentifier} onChangeText={setAccountIdentifier} />
                                        </View>
                                    </View>

                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Subscription Plan</Text>
                                        <TouchableOpacity style={styles.inputContainer} onPress={() => setShowPlanModal(true)}>
                                            <Text style={styles.input}>{selectedPlan}</Text>
                                            <Ionicons name="chevron-down" size={16} color="#64748B" />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity style={styles.fetchBtn} onPress={handleFetchPlan}>
                                        <LinearGradient colors={["#0D47A1", "#1565C0"]} style={styles.gradientBtn}>
                                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Fetch Plan Details</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                    {/* Plan Summary Card */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#0D47A1" />
                                            <Text style={styles.summaryTitle}>Subscription Summary</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.summaryInfo}>
                                            <Text style={styles.summaryMainText}>{planDetails.subscriberName}</Text>
                                            <Text style={styles.summarySubText}>{selectedPlatform} | Plan: {planDetails.planName}</Text>
                                            <Text style={styles.summarySubText}>Valid Till: {planDetails.renewalDate}</Text>
                                        </View>
                                        <View style={styles.breakdown}>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Plan Amount</Text><Text style={styles.breakdownValue}>₹{planDetails.amount.toFixed(2)}</Text></View>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>GST & Taxes</Text><Text style={styles.breakdownValue}>₹{planDetails.taxes.toFixed(2)}</Text></View>
                                        </View>
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Total Payable</Text>
                                            <Text style={styles.totalValue}>₹{planDetails.total.toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    {/* Payment Section */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Payment Details</Text>
                                        <View style={styles.paymentModesGrid}>
                                            {['Wallet', 'Debit Card', 'Credit Card', 'Net Banking'].map((mode) => (
                                                <TouchableOpacity key={mode} style={[styles.modeCard, selectedPaymentMode === mode && styles.selectedModeCard]} onPress={() => setSelectedPaymentMode(mode)}>
                                                    <Ionicons name={mode.includes('Card') ? 'card' : mode === 'Wallet' ? 'wallet' : 'globe'} size={20} color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'} />
                                                    <Text style={[styles.modeText, selectedPaymentMode === mode && styles.selectedModeText]}>{mode}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {selectedPaymentMode.includes("Card") && (
                                            <View style={styles.cardFormContainer}>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Name on Card</Text>
                                                    <View style={styles.inputContainer}>
                                                        <TextInput style={styles.input} placeholder="Card Holder Name" value={cardHolder} onChangeText={setCardHolder} autoCapitalize="characters" />
                                                    </View>
                                                </View>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Card Number</Text>
                                                    <View style={styles.inputContainer}>
                                                        <TextInput style={styles.input} placeholder="0000 0000 0000 0000" keyboardType="numeric" value={cardNumber} onChangeText={handleCardNumberChange} maxLength={19} />
                                                    </View>
                                                </View>
                                                <View style={styles.row}>
                                                    <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                                        <Text style={styles.fieldLabel}>Expiry</Text>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput style={styles.input} placeholder="MM/YY" keyboardType="numeric" value={expiryDate} onChangeText={handleExpiryChange} maxLength={5} />
                                                        </View>
                                                    </View>
                                                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                                                        <Text style={styles.fieldLabel}>CVV</Text>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput style={styles.input} placeholder="123" keyboardType="numeric" secureTextEntry value={cvv} onChangeText={setCvv} maxLength={3} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity style={styles.declarationRow} onPress={() => setIsConfirmed(!isConfirmed)}>
                                        <Ionicons name={isConfirmed ? "checkbox" : "square-outline"} size={22} color={isConfirmed ? "#0D47A1" : "#64748B"} />
                                        <Text style={styles.declarationText}>I confirm that the above subscription details are correct and authorize this payment.</Text>
                                    </TouchableOpacity>

                                    <View style={styles.footer}>
                                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setPlanDetails(null)}>
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flex: 1 }} onPress={handleProceed}>
                                            <LinearGradient colors={!isReadyToPay() ? ["#E2E8F0", "#E2E8F0"] : ["#0D47A1", "#1565C0"]} style={styles.payBtn}>
                                                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnText}>Proceed to Pay</Text>}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Search Modal */}
                <Modal visible={showSearchModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Platform</Text>
                                <TouchableOpacity onPress={() => setShowSearchModal(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearchBox}>
                                <Ionicons name="search" size={20} color="#64748B" />
                                <TextInput style={styles.modalSearchInput} placeholder="Search Platforms..." value={searchQuery} onChangeText={setSearchQuery} />
                            </View>
                            <ScrollView style={styles.modalList}>
                                {filteredPlatforms.map((p, idx) => (
                                    <TouchableOpacity key={idx} style={styles.modalItem} onPress={() => { setSelectedPlatform(p); setShowSearchModal(false); }}>
                                        <Text style={styles.modalItemText}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Plan Modal */}
                <Modal visible={showPlanModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { height: 'auto', paddingBottom: 30 }]}>
                            <Text style={styles.modalTitle}>Select Plan Duration</Text>
                            {subscriptionPlans.map(plan => (
                                <TouchableOpacity key={plan} style={styles.modalItem} onPress={() => { setSelectedPlan(plan); setShowPlanModal(false); }}>
                                    <Text style={styles.modalItemText}>{plan}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>

                {/* Success Modal */}
                <Modal visible={showSuccess} transparent animationType="fade">
                    <View style={styles.successOverlay}>
                        <View style={styles.successCard}>
                            <View style={styles.checkCircle}><Ionicons name="checkmark" size={40} color="#FFF" /></View>
                            <Text style={styles.successTitle}>Subscription Renewed</Text>
                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptValue}>OTT-{Math.floor(Math.random() * 1000000)}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Platform</Text><Text style={styles.receiptValue}>{selectedPlatform}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Subscriber</Text><Text style={styles.receiptValue}>{planDetails?.subscriberName}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount Paid</Text><Text style={styles.receiptValue}>₹{planDetails?.total.toFixed(2)}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Renewal Date</Text><Text style={styles.receiptValue}>{planDetails?.renewalDate}</Text></View>
                            </View>
                            <View style={styles.successActions}>
                                <TouchableOpacity style={styles.actionBtn}><Ionicons name="download-outline" size={20} color="#0D47A1" /><Text style={styles.actionBtnText}>Download</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-social-outline" size={20} color="#0D47A1" /><Text style={styles.actionBtnText}>Share</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.backHomeBtn} onPress={() => { setShowSuccess(false); router.back(); }}><Text style={styles.backHomeText}>Back to Subscriptions</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
};

export default OTTSubscriptionsScreen;

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
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
    searchBarText: { marginLeft: 10, color: "#94A3B8", fontSize: 14 },
    sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1E293B", marginBottom: 12 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    gridItem: { width: "31%", backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9" },
    iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginBottom: 8 },
    gridLabel: { fontSize: 11, textAlign: "center", color: "#475569", fontWeight: "500" },
    formCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
    selectedPlatformHeader: { flexDirection: "row", alignItems: "center", paddingBottom: 16 },
    selectedPlatformLabel: { fontSize: 10, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: 0.5 },
    selectedPlatformName: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
    changeText: { color: "#0D47A1", fontSize: 12, fontWeight: "600" },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 16 },
    formTitle: { fontSize: 15, fontWeight: "600", color: "#1E293B", marginBottom: 16 },
    fieldGroup: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, color: "#64748B", marginBottom: 6, fontWeight: "500" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E2E8F0" },
    input: { flex: 1, fontSize: 14, color: "#334155", marginLeft: 8 },
    row: { flexDirection: "row" },
    fetchBtn: { marginTop: 8 },
    gradientBtn: { height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
    summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
    summaryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    summaryTitle: { fontSize: 16, fontWeight: "700", color: "#0D47A1", marginLeft: 10 },
    summaryInfo: { marginBottom: 16 },
    summaryMainText: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
    summarySubText: { fontSize: 13, color: "#64748B", marginTop: 2 },
    breakdown: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, marginBottom: 16 },
    breakdownRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    breakdownLabel: { fontSize: 13, color: "#64748B" },
    breakdownValue: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
    totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 12 },
    totalLabel: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
    totalValue: { fontSize: 18, fontWeight: "800", color: "#0D47A1" },
    paymentModesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 8 },
    modeCard: { width: "48%", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9", flexDirection: "row" },
    selectedModeCard: { backgroundColor: "#EFF6FF", borderColor: "#0D47A1" },
    modeText: { marginLeft: 8, fontSize: 13, color: "#475569" },
    selectedModeText: { color: "#0D47A1", fontWeight: "600" },
    cardFormContainer: { marginTop: 15, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    declarationRow: { flexDirection: "row", paddingHorizontal: 4, marginBottom: 24 },
    declarationText: { flex: 1, fontSize: 12, color: "#64748B", marginLeft: 10, lineHeight: 18 },
    footer: { flexDirection: "row", alignItems: "center" },
    cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 12 },
    cancelBtnText: { color: "#64748B", fontWeight: "600" },
    payBtn: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", flex: 1 },
    payBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: "80%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
    modalSearchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 16 },
    modalSearchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
    modalList: { flex: 1 },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    modalItemText: { fontSize: 15, color: "#334155" },
    successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
    successCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center" },
    checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#22C55E", justifyContent: "center", alignItems: "center", marginBottom: 16 },
    successTitle: { fontSize: 22, fontWeight: "700", color: "#1E293B", marginBottom: 24 },
    receipt: { width: "100%", backgroundColor: "#F8FAFC", padding: 16, borderRadius: 16, marginBottom: 24 },
    receiptRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    receiptLabel: { fontSize: 13, color: "#64748B" },
    receiptValue: { fontSize: 13, fontWeight: "600", color: "#1E293B", textAlign: "right", flex: 1, marginLeft: 20 },
    successActions: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 16 },
    actionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, width: "48%", justifyContent: "center" },
    actionBtnText: { marginLeft: 8, fontSize: 14, color: "#0D47A1", fontWeight: "600" },
    backHomeBtn: { width: "100%", paddingVertical: 14, alignItems: "center" },
    backHomeText: { color: "#0D47A1", fontWeight: "700", fontSize: 15 },
});
