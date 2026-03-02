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

interface RdDetails {
    accountHolderName: string;
    accountNumber: string;
    installmentAmount: number;
    installmentNumber: number;
    dueDate: string;
    penalty: number;
    totalPayable: number;
    bankName: string;
}

const popularBanks = [
    { id: '1', name: "SBI", icon: "bank" },
    { id: '2', name: "HDFC Bank", icon: "bank" },
    { id: '3', name: "ICICI Bank", icon: "bank" },
    { id: '4', name: "Bank of Baroda", icon: "bank" },
    { id: '5', name: "Axis Bank", icon: "bank" },
    { id: '6', name: "India Post", icon: "mailbox" },
];

const allBanks = [
    "SBI", "HDFC Bank", "ICICI Bank", "Bank of Baroda", "Axis Bank", "India Post",
    "Punjab National Bank", "Canara Bank", "Union Bank of India", "Bank of India",
    "IDFC First Bank", "Kotak Mahindra Bank", "IndusInd Bank", "Federal Bank",
    "Yes Bank", "Standard Chartered", "Citibank", "HSBC", "DBS Bank",
    "Indian Overseas Bank", "UCO Bank", "Central Bank of India", "Allahabad Bank"
];

export default function RecurringDepositPaymentScreen() {
    const router = useRouter();

    // Dynamic back navigation handling

    // Form states
    const [selectedBank, setSelectedBank] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolderName, setAccountHolderName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [dob, setDob] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Card Details states
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardHolder, setCardHolder] = useState("");

    // Keyboard states
    const [accKeyboardType, setAccKeyboardType] = useState<"number-pad" | "default">("number-pad");

    // UI States
    const [bankSearchQuery, setBankSearchQuery] = useState("");
    const [showBankModal, setShowBankModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rdDetails, setRdDetails] = useState<RdDetails | null>(null);
    const [error, setError] = useState("");
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    // Dynamic back navigation handling
    const handleBack = useCallback(() => {
        if (rdDetails) {
            setRdDetails(null);
            return true;
        }
        router.back();
        return true;
    }, [router, rdDetails]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                handleBack
            );

            return () => backHandler.remove();
        }, [handleBack])
    );

    const handleBankSelect = (bank: string) => {
        setSelectedBank(bank);
        setShowBankModal(false);
    };

    const handleDobChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
        if (cleaned.length > 4) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
        setDob(formatted);
    };

    const handleCardNumberChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = "";
        for (let i = 0; i < cleaned.length && i < 16; i++) {
            if (i > 0 && i % 4 === 0) formatted += " ";
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

    const validateForm = () => {
        if (!selectedBank) return false;
        if (accountNumber.trim().length < 5) return false;
        if (mobileNumber.trim().length !== 10) return false;
        return true;
    };

    const handleFetchDetails = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError("");

        // Simulate API call
        setTimeout(() => {
            const mockData: RdDetails = {
                accountHolderName: accountHolderName || "Siddharth Verma",
                accountNumber: accountNumber,
                installmentAmount: 5000,
                installmentNumber: 14,
                dueDate: "15 Mar 2026",
                penalty: 0,
                totalPayable: 5000,
                bankName: selectedBank,
            };

            setRdDetails(mockData);
            setPaymentAmount(mockData.totalPayable.toString());
            setIsLoading(false);

            // Animation
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 1500);
    };

    const isReadyToPay = () => {
        if (!isConfirmed || !selectedPaymentMode || !paymentAmount || parseFloat(paymentAmount) <= 0) return false;

        if (selectedPaymentMode.includes("Card")) {
            if (cardNumber.replace(/\s/g, '').length !== 16) return false;
            if (expiryDate.length !== 5) return false;
            if (cvv.length !== 3) return false;
            if (cardHolder.trim().length < 3) return false;
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
                    billType: "rd",
                    borrowerName: rdDetails?.accountHolderName,
                    loanAccountNumber: rdDetails?.accountNumber,
                    lenderName: selectedBank,
                },
            });
            return;
        }

        setIsLoading(true);
        const processingDelay = selectedPaymentMode.includes("Card") ? 3000 : 2000;

        setTimeout(() => {
            setIsLoading(false);
            setShowPaymentSuccess(true);
        }, processingDelay);
    };

    const filteredBanks = allBanks.filter(bank =>
        bank.toLowerCase().includes(bankSearchQuery.toLowerCase())
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
                        <Text style={styles.headerTitle}>Recurring Deposit (RD)</Text>
                        <Text style={styles.headerSubtitle}>Pay your recurring deposit installment</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.content}>

                            {!rdDetails ? (
                                <>
                                    {/* Popular Banks */}
                                    <Text style={styles.sectionTitle}>Popular Institutions</Text>
                                    <View style={styles.grid}>
                                        {popularBanks.map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[
                                                    styles.gridItem,
                                                    selectedBank === item.name && styles.selectedGridItem
                                                ]}
                                                onPress={() => handleBankSelect(item.name)}
                                            >
                                                <View style={[
                                                    styles.iconCircle,
                                                    selectedBank === item.name && styles.selectedIconCircle
                                                ]}>
                                                    <MaterialCommunityIcons
                                                        name={item.icon as any}
                                                        size={24}
                                                        color={selectedBank === item.name ? "#FFFFFF" : "#0D47A1"}
                                                    />
                                                </View>
                                                <Text style={styles.gridLabel}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <View style={styles.browseContainer}>
                                        <TouchableOpacity
                                            style={styles.browseButton}
                                            onPress={() => setShowBankModal(true)}
                                        >
                                            <Text style={styles.browseText}>View All Banks</Text>
                                            <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* RD Details Form */}
                                    <View style={styles.formCard}>
                                        {selectedBank ? (
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Selected Bank</Text>
                                                <View style={[styles.inputContainer, styles.readOnlyInput]}>
                                                    <MaterialCommunityIcons name="bank-outline" size={16} color="#94A3B8" />
                                                    <TextInput
                                                        style={[styles.input, { color: '#64748B' }]}
                                                        value={selectedBank}
                                                        editable={false}
                                                    />
                                                    <TouchableOpacity onPress={() => setSelectedBank("")}>
                                                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : null}

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>RD Account Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="document-text-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter Account Number"
                                                    placeholderTextColor="#94A3B8"
                                                    value={accountNumber}
                                                    onChangeText={setAccountNumber}
                                                    keyboardType={accKeyboardType}
                                                />
                                                <TouchableOpacity
                                                    onPress={() => setAccKeyboardType(accKeyboardType === 'number-pad' ? 'default' : 'number-pad')}
                                                    style={styles.keyboardToggle}
                                                >
                                                    <MaterialCommunityIcons
                                                        name={accKeyboardType === 'number-pad' ? 'alphabetical' : 'numeric'}
                                                        size={18}
                                                        color="#0D47A1"
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Account Holder Name</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter Holder Name"
                                                    placeholderTextColor="#94A3B8"
                                                    value={accountHolderName}
                                                    onChangeText={setAccountHolderName}
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

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Date of Birth (if required)</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="DD/MM/YYYY"
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="number-pad"
                                                    maxLength={10}
                                                    value={dob}
                                                    onChangeText={handleDobChange}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleFetchDetails}
                                        disabled={!validateForm() || isLoading}
                                        style={{ marginBottom: 24 }}
                                    >
                                        <LinearGradient
                                            colors={!validateForm() || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="#FFFFFF" />
                                            ) : (
                                                <Text style={styles.actionButtonText}>Fetch RD Details</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                    {/* RD Summary Card */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialCommunityIcons name="card-text" size={24} color="#0D47A1" />
                                            <Text style={summaryStyles.summaryTitle}>RD Summary</Text>
                                        </View>
                                        <View style={styles.divider} />

                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Bank</Text>
                                            <Text style={styles.summaryValue}>{rdDetails.bankName}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Holder</Text>
                                            <Text style={styles.summaryValue}>{rdDetails.accountHolderName}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Account No.</Text>
                                            <Text style={styles.summaryValue}>{rdDetails.accountNumber}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Installment #</Text>
                                            <Text style={styles.summaryValue}>{rdDetails.installmentNumber}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Due Date</Text>
                                            <Text style={[styles.summaryValue, { color: '#D32F2F' }]}>{rdDetails.dueDate}</Text>
                                        </View>

                                        <View style={styles.amountBanner}>
                                            <View>
                                                <Text style={styles.bannerLabel}>Installment</Text>
                                                <Text style={styles.bannerValue}>₹{rdDetails.installmentAmount}</Text>
                                            </View>
                                            <View style={styles.verticalDivider} />
                                            <View>
                                                <Text style={styles.bannerLabel}>Penalty</Text>
                                                <Text style={styles.bannerValue}>₹{rdDetails.penalty}</Text>
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
                                                    style={[
                                                        styles.paymentModeCard,
                                                        selectedPaymentMode === mode && styles.selectedPaymentModeCard
                                                    ]}
                                                    onPress={() => setSelectedPaymentMode(mode)}
                                                >
                                                    <Ionicons
                                                        name={mode === 'Wallet' ? 'wallet' : 'card'}
                                                        size={20}
                                                        color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'}
                                                    />
                                                    <Text style={[
                                                        styles.paymentModeText,
                                                        selectedPaymentMode === mode && styles.selectedPaymentModeText
                                                    ]}>{mode}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {/* Dynamic Card Form */}
                                        {selectedPaymentMode.includes("Card") && (
                                            <View style={styles.cardFormContainer}>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Card Holder Name</Text>
                                                    <View style={styles.inputContainer}>
                                                        <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                        <TextInput
                                                            style={styles.input}
                                                            placeholder="AS SHOWN ON CARD"
                                                            placeholderTextColor="#94A3B8"
                                                            value={cardHolder}
                                                            onChangeText={setCardHolder}
                                                            autoCapitalize="characters"
                                                        />
                                                    </View>
                                                </View>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Card Number</Text>
                                                    <View style={styles.inputContainer}>
                                                        <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                                        <TextInput
                                                            style={styles.input}
                                                            placeholder="0000 0000 0000 0000"
                                                            placeholderTextColor="#94A3B8"
                                                            keyboardType="numeric"
                                                            value={cardNumber}
                                                            onChangeText={handleCardNumberChange}
                                                            maxLength={19}
                                                        />
                                                    </View>
                                                </View>
                                                <View style={styles.row}>
                                                    <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                                        <Text style={styles.fieldLabel}>Expiry Date</Text>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput
                                                                style={styles.input}
                                                                placeholder="MM/YY"
                                                                placeholderTextColor="#94A3B8"
                                                                keyboardType="numeric"
                                                                value={expiryDate}
                                                                onChangeText={handleExpiryChange}
                                                                maxLength={5}
                                                            />
                                                        </View>
                                                    </View>
                                                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                                                        <Text style={styles.fieldLabel}>CVV</Text>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput
                                                                style={styles.input}
                                                                placeholder="123"
                                                                placeholderTextColor="#94A3B8"
                                                                keyboardType="numeric"
                                                                secureTextEntry
                                                                value={cvv}
                                                                onChangeText={setCvv}
                                                                maxLength={3}
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {/* Declaration */}
                                    <TouchableOpacity
                                        style={styles.declarationRow}
                                        onPress={() => setIsConfirmed(!isConfirmed)}
                                    >
                                        <Ionicons
                                            name={isConfirmed ? "checkbox" : "square-outline"}
                                            size={24}
                                            color={isConfirmed ? "#0D47A1" : "#64748B"}
                                        />
                                        <Text style={styles.declarationText}>
                                            I confirm that the above RD details are correct and I authorize this installment payment.
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Action Buttons */}
                                    <View style={styles.footerButtons}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => setRdDetails(null)}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={handleProceedToPay}
                                            disabled={!isReady || isLoading}
                                            style={{ flex: 1 }}
                                        >
                                            <LinearGradient
                                                colors={!isReady || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.payButton}
                                            >
                                                {isLoading ? (
                                                    <ActivityIndicator color="#FFFFFF" />
                                                ) : (
                                                    <Text style={styles.actionButtonText}>Proceed to Pay</Text>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            )}

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bank Selection Modal */}
                <Modal
                    visible={showBankModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowBankModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Institution</Text>
                                <TouchableOpacity onPress={() => setShowBankModal(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput
                                    style={styles.modalSearchInput}
                                    placeholder="Search bank..."
                                    value={bankSearchQuery}
                                    onChangeText={setBankSearchQuery}
                                />
                            </View>

                            <ScrollView style={styles.optionsList}>
                                {filteredBanks.map((name, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.optionItem}
                                        onPress={() => handleBankSelect(name)}
                                    >
                                        <Text style={styles.optionText}>{name}</Text>
                                        {selectedBank === name && (
                                            <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />
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
                            <View style={styles.successIcon}>
                                <Ionicons name="checkmark" size={50} color="#FFFFFF" />
                            </View>
                            <Text style={styles.successTitle}>Installment Paid Successfully</Text>

                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Transaction ID</Text>
                                    <Text style={styles.receiptValue}>TXN-RD-{Math.floor(Math.random() * 9000000) + 1000000}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>RD Account No.</Text>
                                    <Text style={styles.receiptValue}>{accountNumber}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Amount Paid</Text>
                                    <Text style={styles.receiptValue}>₹{paymentAmount}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Date</Text>
                                    <Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text>
                                </View>
                            </View>

                            <View style={styles.successActionRow}>
                                <TouchableOpacity style={styles.receiptAction}>
                                    <Ionicons name="download-outline" size={20} color="#0D47A1" />
                                    <Text style={styles.receiptActionText}>Download</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.receiptAction}>
                                    <Ionicons name="share-social-outline" size={20} color="#0D47A1" />
                                    <Text style={styles.receiptActionText}>Share</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.backHomeButton}
                                onPress={() => {
                                    setShowPaymentSuccess(false);
                                    router.back();
                                }}
                            >
                                <Text style={styles.backHomeText}>Back to Services</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const summaryStyles = StyleSheet.create({
    summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
});

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
        borderBottomColor: '#F0F0F0',
    },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
    headerSubtitle: { fontSize: 11, color: "#666", marginTop: 2 },
    placeholder: { width: 34 },
    scrollContent: { padding: 20 },
    content: { paddingVertical: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    gridItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedGridItem: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F8FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    selectedIconCircle: { backgroundColor: '#0D47A1' },
    gridLabel: { fontSize: 9, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },
    browseContainer: { alignItems: 'center', marginBottom: 20 },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#BBDEFB',
        gap: 4,
    },
    browseText: { fontSize: 12, fontWeight: '700', color: '#0D47A1' },
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
    fieldGroup: { marginBottom: 15 },
    fieldLabel: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 6 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },
    readOnlyInput: { backgroundColor: '#F1F5F9', borderColor: '#E0E0E0' },
    keyboardToggle: {
        padding: 4,
        marginLeft: 4,
        backgroundColor: '#E3F2FD',
        borderRadius: 4,
    },
    actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
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
    paymentModeCard: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    selectedPaymentModeCard: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    paymentModeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    selectedPaymentModeText: { color: '#0D47A1' },
    cardFormContainer: { marginTop: 10, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    row: { flexDirection: 'row' },
    declarationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
    declarationText: { flex: 1, fontSize: 12, color: '#64748B', lineHeight: 18 },
    footerButtons: { flexDirection: 'row', gap: 15, marginBottom: 40 },
    cancelButton: { flex: 0.4, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
    cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
    payButton: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', paddingTop: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, margin: 20, paddingHorizontal: 15, paddingVertical: 10 },
    modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1A1A1A' },
    optionsList: { paddingHorizontal: 20 },
    optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    optionText: { fontSize: 15, color: '#1A1A1A' },
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
