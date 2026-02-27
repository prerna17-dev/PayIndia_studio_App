import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    ActivityIndicator,
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
} from "react-native";

interface BillDetails {
    consumerName: string;
    billNumber: string;
    billingPeriod: string;
    dueDate: string;
    amount: number;
    boardName: string;
}

export default function ElectricityBillScreen() {
    const router = useRouter();

    // Dynamic back navigation handling
    const handleBack = () => {
        router.back();
        return true;
    };

    useFocusEffect(
        React.useCallback(() => {
            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                handleBack
            );

            return () => backHandler.remove();
        }, [router])
    );

    // Form states
    const [selectedState, setSelectedState] = useState("");
    const [selectedBoard, setSelectedBoard] = useState("");
    const [consumerNumber, setConsumerNumber] = useState("");
    const [showStateModal, setShowStateModal] = useState(false);
    const [showBoardModal, setShowBoardModal] = useState(false);
    const [stateSearchQuery, setStateSearchQuery] = useState("");
    const [boardSearchQuery, setBoardSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
    const [fetchError, setFetchError] = useState("");
    const [consumerNumberError, setConsumerNumberError] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    // Sample data (will be replaced by API)
    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
    ];

    const boardsByState: { [key: string]: string[] } = {
        "Maharashtra": ["MSEDCL (Maharashtra State Electricity Distribution Co. Ltd.)", "Tata Power - Mumbai", "Adani Electricity - Mumbai"],
        "Delhi": ["BSES Rajdhani", "BSES Yamuna", "Tata Power Delhi", "NDMC"],
        "Karnataka": ["BESCOM (Bangalore)", "MESCOM (Mangalore)", "HESCOM (Hubli)", "GESCOM (Gulbarga)", "CHESCOM (Chamundeshwari)"],
        "Tamil Nadu": ["TNEB (Tamil Nadu Electricity Board)", "Tangedco"],
        "Gujarat": ["DGVCL (Dakshin Gujarat)", "MGVCL (Madhya Gujarat)", "PGVCL (Paschim Gujarat)", "UGVCL (Uttar Gujarat)", "Torrent Power - Ahmedabad"],
        "Uttar Pradesh": ["DVVNL (Dakshinanchal)", "MVVNL (Madhyanchal)", "PVVNL (Paschimanchal)", "PUVVNL (Purvanchal)"],
    };

    const filteredStates = states.filter(state =>
        state.toLowerCase().includes(stateSearchQuery.toLowerCase())
    );

    const boardsForSelectedState = selectedState ? (boardsByState[selectedState] || []) : [];
    const filteredBoards = boardsForSelectedState.filter(board =>
        board.toLowerCase().includes(boardSearchQuery.toLowerCase())
    );

    const handleStateSelect = (state: string) => {
        setSelectedState(state);
        setSelectedBoard(""); // Reset board when state changes
        setShowStateModal(false);
        setStateSearchQuery("");
    };

    const handleBoardSelect = (board: string) => {
        setSelectedBoard(board);
        setShowBoardModal(false);
        setBoardSearchQuery("");
    };

    const validateConsumerNumber = () => {
        if (consumerNumber.trim().length === 0) {
            setConsumerNumberError("Consumer number is required");
            return false;
        }
        if (consumerNumber.trim().length < 5) {
            setConsumerNumberError("Consumer number must be at least 5 characters");
            return false;
        }
        setConsumerNumberError("");
        return true;
    };

    const handleFetchBill = async () => {
        if (!validateConsumerNumber()) return;

        setIsLoading(true);
        setFetchError("");

        // Simulate API call (replace with actual API later)
        setTimeout(() => {
            // Sample response - replace with actual API response
            const mockBillData = {
                consumerName: "John Doe",
                billNumber: "MB123456789",
                billingPeriod: "01 Jan 2026 - 31 Jan 2026",
                dueDate: "15 Feb 2026",
                amount: 2450,
                boardName: selectedBoard.split("(")[0].trim(),
            };

            setBillDetails(mockBillData);
            setIsLoading(false);

            // Animate bill card appearance
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
        }, 2000);
    };

    const handlePayNow = () => {
        if (!billDetails) return;
        setShowPaymentModal(true);
    };

    const handleSelectPaymentMethod = (method: string) => {
        setShowPaymentModal(false);
        // Navigate to payment screen with bill details and selected method
        router.push({
            pathname: "/wallet" as any,
            params: {
                amount: billDetails?.amount.toString(),
                billType: "electricity",
                consumerName: billDetails?.consumerName,
                billNumber: billDetails?.billNumber,
                paymentMethod: method,
            },
        });
    };

    const isFormValid = selectedState && selectedBoard && consumerNumber.trim().length > 0;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Professional Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Electricity Bill</Text>
                        <Text style={styles.headerSubtitle}>Official Bill Payment Portal</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {/* Information Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.blueLeftBorder} />
                            <View style={styles.infoContent}>
                                <View style={styles.infoHeader}>
                                    <View style={styles.infoIconCircle}>
                                        <MaterialCommunityIcons name="flash" size={24} color="#0D47A1" />
                                    </View>
                                    <View>
                                        <Text style={styles.infoTitle}>Electricity Bill Payment</Text>
                                        <Text style={styles.infoSubtitle}>Select board and enter consumer ID</Text>
                                    </View>
                                </View>
                                <View style={styles.featureRow}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="shield-checkmark" size={14} color="#2E7D32" />
                                        <Text style={styles.featureText}>Safe Payment</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="flash" size={14} color="#2E7D32" />
                                        <Text style={styles.featureText}>Instant Fetch</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Aesthetic Form Section */}
                        <View style={styles.formCard}>
                            {/* Select State */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Select State</Text>
                                <TouchableOpacity
                                    style={styles.fieldInput}
                                    onPress={() => setShowStateModal(true)}
                                >
                                    <Ionicons name="map-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                                    <Text style={[styles.fieldText, !selectedState && styles.placeholderText]}>
                                        {selectedState || "Select State"}
                                    </Text>
                                    <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            {/* Select Board */}
                            <View style={[styles.fieldGroup, !selectedState && styles.disabledField]}>
                                <Text style={styles.fieldLabel}>Electricity Board</Text>
                                <TouchableOpacity
                                    style={styles.fieldInput}
                                    onPress={() => selectedState && setShowBoardModal(true)}
                                    disabled={!selectedState}
                                >
                                    <Ionicons name="business-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                                    <Text style={[styles.fieldText, !selectedBoard && styles.placeholderText]}>
                                        {selectedBoard || "Select Board"}
                                    </Text>
                                    <Ionicons name="chevron-down" size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            {/* Consumer Number Input */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Consumer / CA Number</Text>
                                <View style={styles.fieldInput}>
                                    <Ionicons name="person-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.textInputField}
                                        placeholder="Enter Consumer Number"
                                        placeholderTextColor="#94A3B8"
                                        value={consumerNumber}
                                        onChangeText={(text) => {
                                            setConsumerNumber(text);
                                            setConsumerNumberError("");
                                        }}
                                        onBlur={validateConsumerNumber}
                                    />
                                </View>
                                <View style={styles.inputFooter}>
                                    <Text style={styles.fieldHelper}>
                                        Available on your recent bill
                                    </Text>
                                    {consumerNumberError ? (
                                        <Text style={styles.errorTextSmall}>{consumerNumberError}</Text>
                                    ) : null}
                                </View>
                            </View>
                        </View>

                        {/* Fetch Bill Button */}
                        <TouchableOpacity
                            onPress={handleFetchBill}
                            disabled={!isFormValid || isLoading}
                            style={{ marginBottom: 24 }}
                        >
                            <LinearGradient
                                colors={!isFormValid || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.actionButton}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.actionButtonText}>Fetch Bill Details</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Bill Information Summary */}
                        {billDetails && (
                            <Animated.View
                                style={[
                                    styles.reviewCard,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{ translateY: slideAnim }],
                                    },
                                ]}
                            >
                                <Text style={styles.reviewTitle}>Bill Summary</Text>
                                <View style={styles.reviewDivider} />

                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Authority</Text>
                                    <Text style={styles.reviewValue}>{billDetails.boardName}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Consumer Name</Text>
                                    <Text style={styles.reviewValue}>{billDetails.consumerName}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Consumer ID</Text>
                                    <Text style={styles.reviewValue}>{billDetails.billNumber}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Billing Period</Text>
                                    <Text style={styles.reviewValue}>{billDetails.billingPeriod}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Due Date</Text>
                                    <Text style={[styles.reviewValue, { color: '#D32F2F' }]}>{billDetails.dueDate}</Text>
                                </View>

                                <View style={styles.amountSection}>
                                    <Text style={styles.amountLabel}>Payable Amount</Text>
                                    <Text style={styles.amountValue}>₹{billDetails.amount}</Text>
                                </View>
                            </Animated.View>
                        )}

                        {/* Error Card */}
                        {fetchError && (
                            <View style={styles.errorCard}>
                                <Ionicons name="alert-circle" size={40} color="#E53935" />
                                <Text style={styles.errorCardText}>{fetchError}</Text>
                            </View>
                        )}

                        {/* Pay Now Button */}
                        {billDetails && (
                            <TouchableOpacity
                                onPress={handlePayNow}
                                style={{ marginBottom: 40 }}
                            >
                                <LinearGradient
                                    colors={["#0D47A1", "#1565C0"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.actionButton}
                                >
                                    <Text style={styles.actionButtonText}>Proceed to Pay ₹{billDetails.amount}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                {/* State Selection Modal */}
                <Modal
                    visible={showStateModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowStateModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select State</Text>
                                <TouchableOpacity onPress={() => setShowStateModal(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search state..."
                                    value={stateSearchQuery}
                                    onChangeText={setStateSearchQuery}
                                />
                            </View>

                            <ScrollView style={styles.optionsList}>
                                {filteredStates.map((state, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.optionItem}
                                        onPress={() => handleStateSelect(state)}
                                    >
                                        <Text style={styles.optionText}>{state}</Text>
                                        {selectedState === state && (
                                            <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Board Selection Modal */}
                <Modal
                    visible={showBoardModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowBoardModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Electricity Board</Text>
                                <TouchableOpacity onPress={() => setShowBoardModal(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.searchContainer}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search board..."
                                    value={boardSearchQuery}
                                    onChangeText={setBoardSearchQuery}
                                />
                            </View>

                            <ScrollView style={styles.optionsList}>
                                {filteredBoards.map((board, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.optionItem}
                                        onPress={() => handleBoardSelect(board)}
                                    >
                                        <Text style={styles.optionText}>{board}</Text>
                                        {selectedBoard === board && (
                                            <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Payment Options Modal */}
                <Modal
                    visible={showPaymentModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowPaymentModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { height: 'auto', paddingBottom: 40 }]}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Payment Method</Text>
                                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={{ padding: 20 }}>
                                <TouchableOpacity
                                    style={styles.paymentOptionItem}
                                    onPress={() => handleSelectPaymentMethod('wallet')}
                                >
                                    <View style={styles.paymentIconCircle}>
                                        <Ionicons name="wallet-outline" size={22} color="#0D47A1" />
                                    </View>
                                    <Text style={styles.paymentOptionText}>Wallet</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#999" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.paymentOptionItem}
                                    onPress={() => handleSelectPaymentMethod('debit_card')}
                                >
                                    <View style={styles.paymentIconCircle}>
                                        <Ionicons name="card-outline" size={22} color="#0D47A1" />
                                    </View>
                                    <Text style={styles.paymentOptionText}>Debit Card</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#999" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.paymentOptionItem}
                                    onPress={() => handleSelectPaymentMethod('credit_card')}
                                >
                                    <View style={styles.paymentIconCircle}>
                                        <MaterialCommunityIcons name="credit-card-outline" size={22} color="#0D47A1" />
                                    </View>
                                    <Text style={styles.paymentOptionText}>Credit Card</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#999" />
                                </TouchableOpacity>
                            </View>
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
        padding: 20,
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    blueLeftBorder: {
        width: 4,
        backgroundColor: '#0D47A1',
    },
    infoContent: {
        flex: 1,
        padding: 16,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    infoSubtitle: {
        fontSize: 11,
        color: '#666',
    },
    featureRow: {
        flexDirection: 'row',
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: 12,
        color: '#2E7D32',
        fontWeight: '500',
    },

    // Form Section
    formCard: {
        marginBottom: 24,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    fieldInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    fieldText: {
        flex: 1,
        fontSize: 15,
        color: "#333",
    },
    textInputField: {
        flex: 1,
        fontSize: 15,
        color: "#333",
        padding: 0,
    },
    placeholderText: {
        color: "#999",
    },
    disabledField: {
        opacity: 0.6,
    },
    inputFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    fieldHelper: {
        fontSize: 11,
        color: "#666",
    },
    errorTextSmall: {
        fontSize: 11,
        color: "#D32F2F",
        fontWeight: "500",
    },

    // Action Button Styles
    actionButton: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#0D47A1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },

    // Review/Bill Info Card
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    reviewDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 16,
    },
    reviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    reviewLabel: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    reviewValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1.5,
        textAlign: 'right',
    },
    amountSection: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    amountValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0D47A1',
    },

    // Error Card
    errorCard: {
        backgroundColor: "#FFEBEE",
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#FFCDD2",
    },
    errorCardText: {
        fontSize: 13,
        color: "#D32F2F",
        textAlign: "center",
        marginTop: 8,
        fontWeight: "500",
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        margin: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    optionsList: {
        paddingHorizontal: 10,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F7FA',
    },
    optionText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    paymentOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    paymentIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    paymentOptionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
});
