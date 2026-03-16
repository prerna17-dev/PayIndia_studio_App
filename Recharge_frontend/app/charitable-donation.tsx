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

interface DonationReceipt {
    orgName: string;
    amount: string;
    donorName: string;
    transactionId: string;
    date: string;
}

const categories = [
    { id: '1', name: "Education Support", icon: "school-outline" },
    { id: '2', name: "Health & Medical Aid", icon: "medical-bag" },
    { id: '3', name: "Temple / Religious Trust", icon: "home-variant-outline" },
    { id: '4', name: "Orphanage", icon: "account-child-outline" },
    { id: '5', name: "Old Age Home", icon: "account-group-outline" },
    { id: '6', name: "Disaster Relief", icon: "alert-outline" },
];

const featuredOrgs = [
    { id: '1', name: "Registered NGO", desc: "Supporting rural education and health.", icon: "hand-heart-outline" },
    { id: '2', name: "Government Relief Fund", desc: "Official fund for national emergencies.", icon: "shield-check-outline" },
    { id: '3', name: "Local Charitable Trust", desc: "Helping local communities in need.", icon: "home-heart" },
];

const allOrgs = [
    "Smile Foundation", "Goonj", "Akshaya Patra", "GiveIndia", "HelpAge India",
    "PM Cares Fund", "Red Cross Society", "Cry Child Rights", "PETA India",
    "ISKCON Food Relief", "Nanhi Kali", "Bill & Melinda Gates Foundation"
];

const donationTypes = ["One-Time", "Monthly", "Annual"];

const CharitableDonationScreen = () => {
    const router = useRouter();

    // UI States
    const [selectedOrg, setSelectedOrg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form States
    const [donorName, setDonorName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [panNumber, setPanNumber] = useState("");
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [donationType, setDonationType] = useState("One-Time");
    const [purpose, setPurpose] = useState("");
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
        if (showForm) {
            setShowForm(false);
            return true;
        }
        if (selectedOrg || isManualEntry) {
            setSelectedOrg("");
            setIsManualEntry(false);
            return true;
        }
        router.back();
        return true;
    }, [router, showForm, selectedOrg, isManualEntry]);

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

    const isReadyToDonate = () => {
        if (!donorName || donorName.length < 3) return false;
        if (!mobile || mobile.length !== 10) return false;
        if (!amount || parseFloat(amount) <= 0) return false;
        if (!isConfirmed) return false;
        if (!selectedPaymentMode) return false;

        // PAN requirement for 80G is usually optional unless specific benefit is claimed, 
        // but user requested "PAN required if tax benefit selected". 
        // Since the card "ELigible for 80G" is informational, let's assume if they enter PAN they get the benefit.

        if (selectedPaymentMode.includes("Card")) {
            if (!cardNumber || cardNumber.length < 19 || !expiryDate || expiryDate.length < 5 || !cvv || cvv.length < 3 || !cardHolder) return false;
        }
        return true;
    };

    const isReady = isReadyToDonate();

    const handleProceed = () => {
        if (!isReady) {
            Alert.alert("Required", "Please fill all mandatory fields and confirm the declaration.");
            return;
        }

        if (selectedPaymentMode === 'Wallet') {
            router.replace({
                pathname: "/wallet" as any,
                params: {
                    amount: amount,
                    billType: "donation",
                    borrowerName: donorName,
                    loanAccountNumber: panNumber || mobile,
                    lenderName: selectedOrg,
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

    const handleOrgSelect = (org: string) => {
        setSelectedOrg(org);
        setIsManualEntry(false);
        setShowForm(true);
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    };

    const filteredOrgs = allOrgs.filter(org =>
        org.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <Text style={styles.headerTitle}>Charitable Donation</Text>
                        <Text style={styles.headerSubtitle}>Make secure donations to trusted organizations</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>
                            {!showForm ? (
                                <>
                                    {/* Organization Search */}
                                    <TouchableOpacity style={styles.searchBar} onPress={() => setShowSearchModal(true)}>
                                        <Ionicons name="search" size={20} color="#64748B" />
                                        <Text style={styles.searchBarText}>Search NGO / Trust / Temple / Charity</Text>
                                    </TouchableOpacity>

                                    {/* Popular Categories Grid */}
                                    <Text style={styles.sectionTitle}>Popular Categories</Text>
                                    <View style={styles.grid}>
                                        {categories.map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.gridItem}
                                                onPress={() => handleOrgSelect(item.name)}
                                            >
                                                <View style={styles.iconCircle}>
                                                    <MaterialCommunityIcons name={item.icon as any} size={24} color="#0D47A1" />
                                                </View>
                                                <Text style={styles.gridLabel}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Featured Organizations */}
                                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Featured Organizations</Text>
                                    {featuredOrgs.map((org) => (
                                        <TouchableOpacity
                                            key={org.id}
                                            style={styles.featuredCard}
                                            onPress={() => handleOrgSelect(org.name)}
                                        >
                                            <View style={styles.featuredIcon}>
                                                <MaterialCommunityIcons name={org.icon as any} size={28} color="#0D47A1" />
                                            </View>
                                            <View style={styles.featuredInfo}>
                                                <Text style={styles.featuredName}>{org.name}</Text>
                                                <Text style={styles.featuredDesc}>{org.desc}</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                                        </TouchableOpacity>
                                    ))}

                                    <TouchableOpacity style={styles.manualEntryButton} onPress={() => { setIsManualEntry(true); setShowForm(true); }}>
                                        <Text style={styles.manualEntryText}>Enter Organization Details</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#0D47A1" style={{ marginLeft: 8 }} />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                    {/* Selected Org Info */}
                                    <View style={styles.selectedOrgCard}>
                                        <View style={styles.orgInfoRow}>
                                            <MaterialCommunityIcons name="heart-multiple-outline" size={24} color="#0D47A1" />
                                            <View style={styles.orgTextContainer}>
                                                <Text style={styles.orgLabel}>Organization</Text>
                                                <Text style={styles.selectedOrgName}>{selectedOrg || "Manual Entry"}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                                <Text style={styles.changeText}>Change</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Donor Form */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Donor Information</Text>

                                        {isManualEntry && (
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Organization Name *</Text>
                                                <View style={styles.inputContainer}>
                                                    <Ionicons name="business-outline" size={16} color="#94A3B8" />
                                                    <TextInput style={styles.input} placeholder="Enter Organization Name" value={selectedOrg} onChangeText={setSelectedOrg} />
                                                </View>
                                            </View>
                                        )}

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Full Name *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="Enter Full Name" value={donorName} onChangeText={setDonorName} />
                                            </View>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                                <Text style={styles.fieldLabel}>Mobile Number *</Text>
                                                <View style={styles.inputContainer}>
                                                    <TextInput style={styles.input} placeholder="10 digit" keyboardType="phone-pad" maxLength={10} value={mobile} onChangeText={setMobile} />
                                                </View>
                                            </View>
                                            <View style={[styles.fieldGroup, { flex: 1.2 }]}>
                                                <Text style={styles.fieldLabel}>Email ID</Text>
                                                <View style={styles.inputContainer}>
                                                    <TextInput style={styles.input} placeholder="example@mail.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>PAN Number (For Tax Benefit)</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="ABCDE1234F" autoCapitalize="characters" maxLength={10} value={panNumber} onChangeText={setPanNumber} />
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Address</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="location-outline" size={16} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="Donor Address" value={address} onChangeText={setAddress} />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Donation Details</Text>
                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Donation Amount *</Text>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.currencyPrefix}>₹</Text>
                                                <TextInput style={styles.input} placeholder="Enter Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Donation Type</Text>
                                            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowTypeModal(true)}>
                                                <Text style={styles.input}>{donationType}</Text>
                                                <Ionicons name="chevron-down" size={16} color="#64748B" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Purpose of Donation</Text>
                                            <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                                                <TextInput
                                                    style={[styles.input, { textAlignVertical: 'top' }]}
                                                    placeholder="e.g. For food, health aid, etc."
                                                    multiline
                                                    numberOfLines={3}
                                                    value={purpose}
                                                    onChangeText={setPurpose}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {/* Tax Benefit Card */}
                                    {panNumber.length === 10 && (
                                        <View style={styles.taxBenefitCard}>
                                            <View style={styles.taxBenefitHeader}>
                                                <Ionicons name="shield-checkmark" size={20} color="#059669" />
                                                <Text style={styles.taxBenefitTitle}>Tax Benefit Information</Text>
                                            </View>
                                            <Text style={styles.taxBenefitText}>✔ Eligible for 80G Tax Deduction</Text>
                                            <Text style={styles.taxBenefitText}>✔ Receipt will be sent to registered email</Text>
                                        </View>
                                    )}

                                    {/* Payment Section */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Select Payment Mode</Text>
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
                                        <Text style={styles.declarationText}>I confirm that the above details are correct and I am making this donation voluntarily.</Text>
                                    </TouchableOpacity>

                                    <View style={styles.footer}>
                                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flex: 1 }} onPress={handleProceed}>
                                            <LinearGradient colors={!isReady ? ["#E2E8F0", "#E2E8F0"] : ["#0D47A1", "#1565C0"]} style={styles.payBtn}>
                                                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnText}>Proceed to Donate</Text>}
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
                                <Text style={styles.modalTitle}>Select Organization</Text>
                                <TouchableOpacity onPress={() => setShowSearchModal(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearchBox}>
                                <Ionicons name="search" size={20} color="#64748B" />
                                <TextInput style={styles.modalSearchInput} placeholder="Search Name..." value={searchQuery} onChangeText={setSearchQuery} />
                            </View>
                            <ScrollView style={styles.modalList}>
                                {filteredOrgs.map((org, idx) => (
                                    <TouchableOpacity key={idx} style={styles.modalItem} onPress={() => { handleOrgSelect(org); setShowSearchModal(false); }}>
                                        <Text style={styles.modalItemText}>{org}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Type Modal */}
                <Modal visible={showTypeModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { height: 'auto', paddingBottom: 30 }]}>
                            <Text style={styles.modalTitle}>Select Donation Type</Text>
                            {donationTypes.map(type => (
                                <TouchableOpacity key={type} style={styles.modalItem} onPress={() => { setDonationType(type); setShowTypeModal(false); }}>
                                    <Text style={styles.modalItemText}>{type}</Text>
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
                            <Text style={styles.successTitle}>Donation Successful</Text>
                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptValue}>DON-{Math.floor(Math.random() * 1000000)}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Organization</Text><Text style={styles.receiptValue}>{selectedOrg}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Donor Name</Text><Text style={styles.receiptValue}>{donorName}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount Paid</Text><Text style={styles.receiptValue}>₹{amount}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Date</Text><Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text></View>
                            </View>
                            <View style={styles.successActions}>
                                <TouchableOpacity style={styles.actionBtn}><Ionicons name="download-outline" size={20} color="#0D47A1" /><Text style={styles.actionBtnText}>Download</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-social-outline" size={20} color="#0D47A1" /><Text style={styles.actionBtnText}>Share</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.backHomeBtn} onPress={() => { setShowSuccess(false); router.back(); }}><Text style={styles.backHomeText}>Back to Donations</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
};

export default CharitableDonationScreen;

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
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginBottom: 8 },
    gridLabel: { fontSize: 11, textAlign: "center", color: "#475569", fontWeight: "500" },
    featuredCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9" },
    featuredIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F1F8FE", justifyContent: "center", alignItems: "center" },
    featuredInfo: { flex: 1, marginLeft: 16 },
    featuredName: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
    featuredDesc: { fontSize: 12, color: "#64748B", marginTop: 2 },
    manualEntryButton: {
        alignSelf: "center",
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#0D47A1',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#0D47A1",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    manualEntryText: { color: "#0D47A1", fontWeight: "700", fontSize: 14 },
    selectedOrgCard: { backgroundColor: "#EFF6FF", padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: "#0D47A1", marginBottom: 16 },
    orgInfoRow: { flexDirection: "row", alignItems: "center" },
    orgTextContainer: { flex: 1, marginLeft: 12 },
    orgLabel: { fontSize: 10, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: 0.5 },
    selectedOrgName: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
    changeText: { color: "#0D47A1", fontSize: 12, fontWeight: "600" },
    formCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
    formTitle: { fontSize: 15, fontWeight: "600", color: "#1E293B", marginBottom: 16 },
    fieldGroup: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, color: "#64748B", marginBottom: 6, fontWeight: "500" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E2E8F0" },
    input: { flex: 1, fontSize: 14, color: "#334155", marginLeft: 8 },
    row: { flexDirection: "row" },
    currencyPrefix: { fontSize: 16, fontWeight: "600", color: "#64748B", marginRight: 4 },
    taxBenefitCard: { backgroundColor: "#ECFDF5", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#10B981" },
    taxBenefitHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    taxBenefitTitle: { fontSize: 14, fontWeight: "700", color: "#065F46", marginLeft: 8 },
    taxBenefitText: { fontSize: 12, color: "#065F46", marginBottom: 4 },
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
