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
    FlatList,
    KeyboardAvoidingView,
} from "react-native";

interface LoanDetails {
    borrowerName: string;
    loanAccountNumber: string;
    loanType: string;
    dueDate: string;
    outstandingAmount: number;
    currentEmiAmount: number;
    lenderName: string;
}

const popularLenders = [
    { id: '1', name: "HDFC Bank", icon: "bank" },
    { id: '2', name: "SBI", icon: "bank" },
    { id: '3', name: "ICICI Bank", icon: "bank" },
    { id: '4', name: "Axis Bank", icon: "bank" },
    { id: '5', name: "Bajaj Finance", icon: "cash" },
    { id: '6', name: "Tata Capital", icon: "cash" },
];

const allLenders = [
    "HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "Bajaj Finance", "Tata Capital",
    "Aditya Birla Finance", "IDFC First Bank", "Fullerton India", "L&T Finance",
    "Muthoot Finance", "Manappuram Finance", "Shriram City Union Finance",
    "Kotak Mahindra Bank", "IndusInd Bank", "Federal Bank", "Canara Bank",
    "Bank of Baroda", "Union Bank of India", "Dhani Loans", "Navi", "MoneyTap"
];

export default function LoanRepaymentScreen() {
    const router = useRouter();

    // Dynamic back navigation handling

    // Form states
    const [selectedLender, setSelectedLender] = useState("");
    const [loanAccountNumber, setLoanAccountNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [dob, setDob] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);

    // UI States
    const [searchQuery, setSearchQuery] = useState("");
    const [lenderSearchQuery, setLenderSearchQuery] = useState("");
    const [showLenderModal, setShowLenderModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
    const [loanError, setLoanError] = useState("");
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardHolder, setCardHolder] = useState("");

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    // Dynamic back navigation handling
    const handleBack = useCallback(() => {
        if (loanDetails) {
            setLoanDetails(null);
            return true;
        }
        router.back();
        return true;
    }, [router, loanDetails]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                handleBack
            );

            return () => backHandler.remove();
        }, [handleBack])
    );

    const handleLenderSelect = (lender: string) => {
        setSelectedLender(lender);
        setShowLenderModal(false);
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
        if (!selectedLender) return false;
        if (loanAccountNumber.trim().length < 5) return false;
        if (mobileNumber.trim().length !== 10) return false;
        return true;
    };

    const handleFetchDetails = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setLoanError("");

        // Simulate API call
        setTimeout(() => {
            const mockLoanData: LoanDetails = {
                borrowerName: "John Doe",
                loanAccountNumber: loanAccountNumber,
                loanType: "Personal Loan",
                dueDate: "10 Mar 2026",
                outstandingAmount: 45000,
                currentEmiAmount: 4500,
                lenderName: selectedLender,
            };

            setLoanDetails(mockLoanData);
            setPaymentAmount(mockLoanData.currentEmiAmount.toString());
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

    const handleProceedToPay = () => {
        if (!isReady || !paymentAmount) return;

        if (selectedPaymentMode === 'Wallet') {
            // Navigate to wallet screen with data
            router.replace({
                pathname: "/wallet" as any,
                params: {
                    amount: paymentAmount,
                    billType: "loan",
                    borrowerName: loanDetails?.borrowerName,
                    loanAccountNumber: loanDetails?.loanAccountNumber,
                    lenderName: selectedLender,
                },
            });
            return;
        }

        setIsLoading(true);
        const processingDelay = selectedPaymentMode.includes("Card") ? 3000 : 2000;

        // Simulate Payment Processing
        setTimeout(() => {
            setIsLoading(false);
            setShowPaymentSuccess(true);
        }, processingDelay);
    };

    const filteredLenders = allLenders.filter(lender =>
        lender.toLowerCase().includes(lenderSearchQuery.toLowerCase())
    );

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
                        <Text style={styles.headerTitle}>Loan Repayment</Text>
                        <Text style={styles.headerSubtitle}>Repay your loan EMIs securely</Text>
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

                            {!loanDetails ? (
                                <>
                                    {/* Popular Lenders */}
                                    <Text style={styles.sectionTitle}>Popular Lenders</Text>
                                    <View style={styles.lendersGrid}>
                                        {popularLenders.map((lender) => (
                                            <TouchableOpacity
                                                key={lender.id}
                                                style={[
                                                    styles.lenderItem,
                                                    selectedLender === lender.name && styles.selectedLenderItem
                                                ]}
                                                onPress={() => handleLenderSelect(lender.name)}
                                            >
                                                <View style={[
                                                    styles.lenderIconCircle,
                                                    selectedLender === lender.name && styles.selectedLenderIconCircle
                                                ]}>
                                                    <MaterialCommunityIcons
                                                        name={lender.icon as any}
                                                        size={24}
                                                        color={selectedLender === lender.name ? "#FFFFFF" : "#0D47A1"}
                                                    />
                                                </View>
                                                <Text style={styles.lenderLabel}>{lender.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <View style={styles.browseAllContainer}>
                                        <TouchableOpacity
                                            style={styles.browseAllButtonSmall}
                                            onPress={() => setShowLenderModal(true)}
                                        >
                                            <Text style={styles.browseAllTextSmall}>Browse All Lenders</Text>
                                            <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Loan Details Form */}
                                    <View style={styles.formCard}>
                                        {selectedLender ? (
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Selected Lender</Text>
                                                <View style={[styles.inputContainer, styles.readOnlyInput]}>
                                                    <MaterialCommunityIcons name="bank-outline" size={16} color="#94A3B8" />
                                                    <TextInput
                                                        style={[styles.input, { color: '#64748B' }]}
                                                        value={selectedLender}
                                                        editable={false}
                                                    />
                                                    <TouchableOpacity onPress={() => setSelectedLender("")}>
                                                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : null}

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Loan Account Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="document-text-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter Account Number"
                                                    placeholderTextColor="#94A3B8"
                                                    value={loanAccountNumber}
                                                    onChangeText={setLoanAccountNumber}
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
                                            <Text style={styles.fieldLabel}>Date of Birth (Optional)</Text>
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
                                                <Text style={styles.actionButtonText}>Fetch Loan Details</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                    {/* Loan Summary Card */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialCommunityIcons name="finance" size={24} color="#0D47A1" />
                                            <Text style={styles.summaryTitle}>Loan Summary</Text>
                                        </View>
                                        <View style={styles.divider} />

                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Lender</Text>
                                            <Text style={styles.summaryValue}>{loanDetails.lenderName}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Borrower</Text>
                                            <Text style={styles.summaryValue}>{loanDetails.borrowerName}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Loan Type</Text>
                                            <Text style={styles.summaryValue}>{loanDetails.loanType}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Account No.</Text>
                                            <Text style={styles.summaryValue}>{loanDetails.loanAccountNumber}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Due Date</Text>
                                            <Text style={[styles.summaryValue, { color: '#D32F2F' }]}>{loanDetails.dueDate}</Text>
                                        </View>

                                        <View style={styles.amountBanner}>
                                            <View>
                                                <Text style={styles.bannerLabel}>Outstanding</Text>
                                                <Text style={styles.bannerValue}>₹{loanDetails.outstandingAmount}</Text>
                                            </View>
                                            <View style={styles.verticalDivider} />
                                            <View>
                                                <Text style={styles.bannerLabel}>EMI Amount</Text>
                                                <Text style={styles.bannerValue}>₹{loanDetails.currentEmiAmount}</Text>
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
                                            <Animated.View style={styles.cardFormContainer}>
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
                                                            <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
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
                                                            <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" />
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
                                            </Animated.View>
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
                                            I confirm that the above details are correct and I authorize this payment.
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Action Buttons */}
                                    <View style={styles.footerButtons}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => setLoanDetails(null)}
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

                {/* Lender Selection Modal */}
                <Modal
                    visible={showLenderModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowLenderModal(false)}
                >
                    <View style={styles.modalOverlayBottom}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Lender</Text>
                                <TouchableOpacity onPress={() => setShowLenderModal(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalSearchContainer}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput
                                    style={styles.modalSearchInput}
                                    placeholder="Search lender..."
                                    value={lenderSearchQuery}
                                    onChangeText={setLenderSearchQuery}
                                />
                            </View>

                            <ScrollView style={styles.optionsList}>
                                {filteredLenders.map((lender, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.optionItem}
                                        onPress={() => handleLenderSelect(lender)}
                                    >
                                        <Text style={styles.optionText}>{lender}</Text>
                                        {selectedLender === lender && (
                                            <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Success Modal */}
                <Modal
                    visible={showPaymentSuccess}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlayCenter}>
                        <View style={styles.successCard}>
                            <View style={styles.successIconCircle}>
                                <Ionicons name="checkmark" size={50} color="#FFFFFF" />
                            </View>
                            <Text style={styles.successTitle}>Payment Successful</Text>

                            <View style={styles.receiptDetails}>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Transaction ID</Text>
                                    <Text style={styles.receiptValue}>TXN987654321</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Loan Account</Text>
                                    <Text style={styles.receiptValue}>{loanAccountNumber}</Text>
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

                            <TouchableOpacity style={styles.receiptAction}>
                                <Ionicons name="download-outline" size={20} color="#0D47A1" />
                                <Text style={styles.receiptActionText}>Download Receipt</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.successCloseButton}
                                onPress={() => {
                                    setShowPaymentSuccess(false);
                                    router.back();
                                }}
                            >
                                <Text style={styles.successCloseText}>Back to Services</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    safeArea: {
        flex: 1,
    },
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
    backButton: {
        padding: 5,
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    headerSubtitle: {
        fontSize: 11,
        color: "#666",
        marginTop: 2,
    },
    placeholder: {
        width: 34,
    },
    content: {
        paddingVertical: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1A1A1A',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    lendersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    lenderItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedLenderItem: {
        borderColor: '#0D47A1',
        backgroundColor: '#F0F7FF',
    },
    lenderIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F8FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    selectedLenderIconCircle: {
        backgroundColor: '#0D47A1',
    },
    lenderLabel: {
        fontSize: 9,
        fontWeight: '600',
        color: '#1A1A1A',
        textAlign: 'center',
    },
    browseAllContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    browseAllButtonSmall: {
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
    browseAllTextSmall: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0D47A1',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
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
    currencyPrefix: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginRight: 8,
    },
    actionButton: {
        height: 56,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0D47A1',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 15,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#64748B',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
    },
    amountBanner: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 15,
        marginTop: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    bannerLabel: {
        fontSize: 11,
        color: '#64748B',
        textAlign: 'center',
    },
    bannerValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0D47A1',
        textAlign: 'center',
    },
    verticalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E2E8F0',
    },
    paymentModes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
    paymentModeCard: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FAFBFC',
    },
    selectedPaymentModeCard: {
        borderColor: '#0D47A1',
        backgroundColor: '#F0F7FF',
    },
    paymentModeText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    selectedPaymentModeText: {
        color: '#0D47A1',
        fontWeight: '700',
    },
    declarationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 5,
        marginBottom: 30,
    },
    declarationText: {
        flex: 1,
        fontSize: 12,
        color: '#475569',
        lineHeight: 18,
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 40,
    },
    cancelButton: {
        flex: 0.4,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748B',
    },
    payButton: {
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Modal Styles
    modalOverlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalOverlayCenter: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        width: '100%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    modalSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        margin: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1A1A1A',
    },
    optionsList: {
        paddingHorizontal: 20,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    optionText: {
        fontSize: 15,
        color: '#1A1A1A',
    },
    successCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        width: '100%',
        padding: 30,
        alignItems: 'center',
    },
    successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 30,
    },
    receiptDetails: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    receiptLabel: {
        fontSize: 13,
        color: '#64748B',
    },
    receiptValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    receiptAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 30,
    },
    receiptActionText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0D47A1',
    },
    successCloseButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successCloseText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
    },
    cardFormContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    row: {
        flexDirection: 'row',
    },
});
