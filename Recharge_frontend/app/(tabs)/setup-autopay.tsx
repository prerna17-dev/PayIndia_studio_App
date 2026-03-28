import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
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
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SetupAutopayScreen() {
    const router = useRouter();

    // Handle hardware back button
    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                router.push("/autopay");
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction,
            );

            return () => backHandler.remove();
        }, [router]),
    );

    // Form data
    const [selectedService, setSelectedService] = useState("");
    
    // Step 2 & 3 Inputs
    const [otherServiceName, setOtherServiceName] = useState("");
    const [identifier, setIdentifier] = useState(""); // mobile/consumer numbmer
    const [operator, setOperator] = useState("Auto-detect");
    const [circle, setCircle] = useState("Auto-detect");
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState("");
    
    const [frequency, setFrequency] = useState("every28days");
    
    // Payment State
    const [paymentMethod, setPaymentMethod] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [isConfirmedDecl, setIsConfirmedDecl] = useState(false);

    // Modals
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Dynamic reset when service changes
    useEffect(() => {
        setIdentifier("");
        setSelectedPlan(null);
        setCustomAmount("");
        setOtherServiceName("");
    }, [selectedService]);

    // Services data
    const services = [
        { id: "mobile", name: "Mobile", icon: "phone-portrait-outline", label: "Mobile Number", hasPlans: true },
        { id: "dth", name: "DTH", icon: "tv-outline", label: "Subscriber ID", hasPlans: true },
        { id: "electricity", name: "Electricity", icon: "bulb-outline", label: "Consumer Number", hasPlans: false },
        { id: "water", name: "Water", icon: "water-outline", label: "Account Number", hasPlans: false },
        { id: "broadband", name: "Broadband", icon: "wifi-outline", label: "Landline Number", hasPlans: false },
        { id: "landline", name: "Landline", icon: "call-outline", label: "Landline Number", hasPlans: false },
        { id: "cable", name: "Cable TV", icon: "desktop-outline", label: "Subscriber ID", hasPlans: false },
        { id: "other", name: "Other", icon: "grid-outline", label: "Consumer / Account Number", hasPlans: false },
    ];

    const currentServiceData = services.find(s => s.id === selectedService);

    // Sample plans
    const plans = [
        { id: 1, amount: 299, validity: "28 Days", data: "1.5GB/day" },
        { id: 2, amount: 399, validity: "56 Days", data: "2GB/day" },
        { id: 3, amount: 599, validity: "84 Days", data: "2.5GB/day" },
    ];

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

    const isReadyToEnable = () => {
        if (!paymentMethod) return false;
        
        if (paymentMethod.includes('Card')) {
            if (!isConfirmedDecl) return false;
            if (cardNumber.replace(/\s/g, '').length !== 16) return false;
            if (expiryDate.length !== 5) return false;
            if (cvv.length !== 3) return false;
            if (cardHolder.trim().length < 3) return false;
        }

        return true;
    };

    const handleEnableAutopay = () => {
        if (!isReadyToEnable()) return;
        setShowConfirmModal(true);
    };

    const confirmSetup = async () => {
        setShowConfirmModal(false);

        // Build the mandate object
        const iconMap: Record<string, string> = {
            mobile: "phone-portrait-outline",
            dth: "tv-outline",
            electricity: "bulb-outline",
            water: "water-outline",
            broadband: "wifi-outline",
            landline: "call-outline",
            cable: "desktop-outline",
            other: "grid-outline",
        };
        const colorMap: Record<string, string> = {
            mobile: "#3B82F6",
            dth: "#8B5CF6",
            electricity: "#F59E0B",
            water: "#06B6D4",
            broadband: "#10B981",
            landline: "#6366F1",
            cable: "#EC4899",
            other: "#64748B",
        };
        const freqLabel = frequency === "every28days" ? "Every 28 Days" : frequency === "monthly" ? "Monthly" : "Custom";
        const amount = selectedPlan
            ? plans.find((p) => p.id === selectedPlan)?.amount || 0
            : Number(customAmount) || 0;
        const serviceName = selectedService === "other"
            ? (otherServiceName || "Other Service")
            : (currentServiceData?.name || "Service");

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + (frequency === "every28days" ? 28 : 30));
        const nextPaymentStr = nextDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

        const newMandate = {
            id: Date.now(),
            type: serviceName,
            icon: iconMap[selectedService] || "grid-outline",
            color: colorMap[selectedService] || "#64748B",
            amount: amount.toString(),
            frequency: freqLabel,
            nextPayment: nextPaymentStr,
            isPaused: false,
            identifier: identifier,
            paymentMethod: paymentMethod,
        };

        try {
            const existing = await AsyncStorage.getItem("@autopay_mandates");
            const list = existing ? JSON.parse(existing) : [];
            list.push(newMandate);
            await AsyncStorage.setItem("@autopay_mandates", JSON.stringify(list));
        } catch (e) {
            console.error("Failed to save mandate", e);
        }

        setTimeout(() => {
            setShowSuccessModal(true);
        }, 300);
    };

    const handleViewAutopay = () => {
        setShowSuccessModal(false);
        router.push("/autopay");
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.push("/autopay")}
                    >
                        <Ionicons name="arrow-back" size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Setup Autopay</Text>
                        <Text style={styles.headerSubtext}>Never miss a payment again</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                >
                    <View style={styles.content}>
                        {/* Step 1: Select Service */}
                        <View style={styles.stepSection}>
                            <Text style={styles.stepTitle}>Step 1: Select Service</Text>
                            
                            <View style={styles.servicesGrid}>
                                {services.map((service) => (
                                    <TouchableOpacity
                                        key={service.id}
                                        style={styles.serviceItem}
                                        onPress={() => setSelectedService(service.id)}
                                    >
                                        <View style={[
                                            styles.serviceIconWrapper,
                                            selectedService === service.id && styles.serviceIconWrapperSelected
                                        ]}>
                                            <Ionicons
                                                name={service.icon as any}
                                                size={30}
                                                color="#0D47A1"
                                            />
                                        </View>
                                        <Text style={[styles.serviceName, selectedService === service.id && styles.serviceNameSelected]}>
                                            {service.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Step 2: Enter Details */}
                        {currentServiceData && (
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 2: Enter Details</Text>

                                {currentServiceData.id === 'other' && (
                                    <View style={styles.inputCard}>
                                        <Text style={styles.inputLabel}>Service Name</Text>
                                        <View style={styles.inputRow}>
                                            <Ionicons name="grid-outline" size={20} color="#94A3B8" />
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="E.g., Gym Membership, Tuition Fee"
                                                value={otherServiceName}
                                                onChangeText={setOtherServiceName}
                                            />
                                        </View>
                                    </View>
                                )}

                                <View style={styles.inputCard}>
                                    <Text style={styles.inputLabel}>{currentServiceData.label}</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons 
                                            name={currentServiceData.id === 'mobile' ? "phone-portrait" : "document-text"} 
                                            size={20} 
                                            color="#94A3B8" 
                                        />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder={`Enter ${currentServiceData.label}`}
                                            keyboardType={currentServiceData.id === 'mobile' ? "phone-pad" : "default"}
                                            value={identifier}
                                            onChangeText={setIdentifier}
                                            maxLength={currentServiceData.id === 'mobile' ? 10 : 30}
                                        />
                                    </View>
                                </View>

                                {(identifier.length > 5 && currentServiceData.id === 'mobile') && (
                                    <View style={styles.detailsRow}>
                                        <View style={styles.detailCard}>
                                            <Text style={styles.detailLabel}>Operator</Text>
                                            <Text style={styles.detailValue}>{operator}</Text>
                                        </View>
                                        <View style={styles.detailCard}>
                                            <Text style={styles.detailLabel}>Circle</Text>
                                            <Text style={styles.detailValue}>{circle}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Step 3: Select Plan or Amount */}
                        {(identifier.length > 4) && currentServiceData && currentServiceData.hasPlans && (
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 3: Select Plan</Text>

                                {plans.map((plan) => (
                                    <TouchableOpacity
                                        key={plan.id}
                                        style={[
                                            styles.planCard,
                                            selectedPlan === plan.id && styles.planCardSelected,
                                        ]}
                                        onPress={() => setSelectedPlan(plan.id)}
                                    >
                                        <View style={styles.planLeft}>
                                            <Text style={styles.planAmount}>₹{plan.amount}</Text>
                                            <Text style={styles.planDetails}>
                                                {plan.validity} | {plan.data}
                                            </Text>
                                        </View>
                                        {selectedPlan === plan.id && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={24}
                                                color="#0F172A"
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}

                                <View style={styles.orDivider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.orText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <View style={styles.customAmountCard}>
                                    <Text style={styles.inputLabel}>Custom Amount</Text>
                                    <View style={styles.inputRow}>
                                        <Text style={styles.rupeeSymbol}>₹</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter Amount"
                                            keyboardType="number-pad"
                                            value={customAmount}
                                            onChangeText={setCustomAmount}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {(identifier.length > 4) && currentServiceData && !currentServiceData.hasPlans && (
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 3: Enter Amount</Text>
                                <View style={styles.customAmountCard}>
                                    <Text style={styles.inputLabel}>Bill Amount Limit / Value</Text>
                                    <View style={styles.inputRow}>
                                        <Text style={styles.rupeeSymbol}>₹</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter Amount"
                                            keyboardType="number-pad"
                                            value={customAmount}
                                            onChangeText={setCustomAmount}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Step 4: Set Frequency */}
                        {(selectedPlan || customAmount) && (
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 4: Set Frequency</Text>

                                <View style={styles.frequencyCard}>
                                    <Text style={styles.inputLabel}>Repeat Every:</Text>

                                    <View style={styles.freqContainerRow}>
                                        <TouchableOpacity
                                            style={styles.frequencyOption}
                                            onPress={() => setFrequency("every28days")}
                                        >
                                            <View style={[styles.radio, frequency === "every28days" && styles.radioActive]}>
                                                {frequency === "every28days" && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.frequencyText}>28 Days</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.frequencyOption}
                                            onPress={() => setFrequency("monthly")}
                                        >
                                            <View style={[styles.radio, frequency === "monthly" && styles.radioActive]}>
                                                {frequency === "monthly" && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.frequencyText}>Monthly</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.frequencyOption}
                                            onPress={() => setFrequency("custom")}
                                        >
                                            <View style={[styles.radio, frequency === "custom" && styles.radioActive]}>
                                                {frequency === "custom" && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.frequencyText}>Custom</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Step 5: Payment Method */}
                        {frequency && (selectedPlan || customAmount) && (
                            <View style={styles.stepSection}>
                                <Text style={styles.stepTitle}>Step 5: Payment Method</Text>

                                <View style={styles.paymentModesGrid}>
                                    {['Wallet', 'Debit Card', 'Credit Card', 'Net Banking'].map((mode) => (
                                        <TouchableOpacity
                                            key={mode}
                                            style={[
                                                styles.paymentModeCard,
                                                paymentMethod === mode && styles.selectedPaymentModeCard
                                            ]}
                                            onPress={() => {
                                                setPaymentMethod(mode);
                                                setIsConfirmedDecl(false);
                                            }}
                                        >
                                            <Ionicons
                                                name={mode === 'Wallet' ? 'wallet' : mode === 'Net Banking' ? 'globe-outline' : 'card'}
                                                size={20}
                                                color={paymentMethod === mode ? '#0F172A' : '#64748B'}
                                            />
                                            <Text style={[styles.paymentModeText, paymentMethod === mode && styles.selectedPaymentModeText]}>{mode}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Card Input Form */}
                                {paymentMethod.includes('Card') && (
                                    <View style={styles.cardForm}>
                                        <View style={styles.cardFieldGroup}>
                                            <Text style={styles.cardFieldLabel}>Name on Card</Text>
                                            <View style={styles.cardInput}>
                                                <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                <TextInput 
                                                    style={styles.cardInputText} 
                                                    placeholder="Card Holder Name" 
                                                    placeholderTextColor="#94A3B8" 
                                                    value={cardHolder} 
                                                    onChangeText={setCardHolder} 
                                                    autoCapitalize="characters" 
                                                />
                                            </View>
                                        </View>
                                        
                                        <View style={styles.cardFieldGroup}>
                                            <Text style={styles.cardFieldLabel}>Card Number</Text>
                                            <View style={styles.cardInput}>
                                                <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                                <TextInput 
                                                    style={styles.cardInputText} 
                                                    placeholder="0000 0000 0000 0000" 
                                                    placeholderTextColor="#94A3B8" 
                                                    keyboardType="numeric" 
                                                    value={cardNumber} 
                                                    onChangeText={handleCardNumberChange} 
                                                    maxLength={19} 
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.rowInputs}>
                                            <View style={[styles.cardFieldGroup, { flex: 1 }]}>
                                                <Text style={styles.cardFieldLabel}>Expiry</Text>
                                                <View style={styles.cardInput}>
                                                    <TextInput 
                                                        style={styles.cardInputText} 
                                                        placeholder="MM/YY" 
                                                        placeholderTextColor="#94A3B8" 
                                                        keyboardType="numeric" 
                                                        value={expiryDate} 
                                                        onChangeText={handleExpiryChange} 
                                                        maxLength={5} 
                                                    />
                                                </View>
                                            </View>
                                            <View style={[styles.cardFieldGroup, { flex: 1 }]}>
                                                <Text style={styles.cardFieldLabel}>CVV</Text>
                                                <View style={styles.cardInput}>
                                                    <TextInput 
                                                        style={styles.cardInputText} 
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

                                        <TouchableOpacity 
                                            style={styles.declarationRow} 
                                            onPress={() => setIsConfirmedDecl(!isConfirmedDecl)}
                                        >
                                            <Ionicons 
                                                name={isConfirmedDecl ? 'checkbox' : 'square-outline'} 
                                                size={22} 
                                                color={isConfirmedDecl ? '#0F172A' : '#64748B'} 
                                            />
                                            <Text style={styles.declarationText}>I confirm the above details to authorize future automated payments.</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                        
                        <View style={{height: 40}} />
                    </View>
                </ScrollView>

                {/* Bottom CTA */}
                {paymentMethod && (
                    <View style={styles.bottomCTA}>
                        <TouchableOpacity
                            style={[styles.enableButton, !isReadyToEnable() && styles.enableButtonDisabled]}
                            onPress={handleEnableAutopay}
                            disabled={!isReadyToEnable()}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={isReadyToEnable() ? ["#0F172A", "#1E293B"] : ["#E2E8F0", "#CBD5E1"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.enableGradient}
                            >
                                <Ionicons name="shield-checkmark" size={20} color={isReadyToEnable() ? "#FFFFFF" : "#64748B"} />
                                <Text style={[styles.enableButtonText, !isReadyToEnable() && styles.enableButtonTextDisabled]}>Enable Autopay</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Confirmation Modal */}
                <Modal
                    visible={showConfirmModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowConfirmModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalIconCircle}>
                                <Ionicons name="shield-checkmark" size={40} color="#0F172A" />
                            </View>

                            <Text style={styles.modalTitle}>Confirm Autopay Setup?</Text>
                            <Text style={styles.modalMessage}>
                                You authorize automatic payments of ₹
                                {selectedPlan
                                    ? plans.find((p) => p.id === selectedPlan)?.amount
                                    : customAmount || 0}{" "}
                                according to your selected schedule.
                            </Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowConfirmModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={confirmSetup}
                                >
                                    <Text style={styles.confirmButtonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Success Modal */}
                <Modal
                    visible={showSuccessModal}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.successContent}>
                            <View style={styles.successIconCircle}>
                                <Ionicons name="checkmark-circle" size={80} color="#059669" />
                            </View>

                            <Text style={styles.successTitle}>
                                Autopay Enabled Successfully!
                            </Text>
                            <Text style={styles.successMessage}>
                                Your future payments will be processed securely and automatically.
                            </Text>

                            <TouchableOpacity
                                style={styles.viewAutopayButton}
                                onPress={handleViewAutopay}
                            >
                                <Text style={styles.viewAutopayButtonText}>View Mandates</Text>
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
        backgroundColor: "#F8FAFC",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
    },
    backButton: {
        padding: 5,
    },
    headerTextContainer: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0F172A",
    },
    headerSubtext: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },
    placeholder: {
        width: 34,
    },

    content: {
        padding: 20,
    },

    // Steps
    stepSection: {
        marginBottom: 32,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 16,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    // Step 1: Icons Grid
    servicesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: 10,
    },
    serviceItem: {
        width: "22.5%",
        alignItems: "center",
        marginBottom: 20,
    },
    serviceIconWrapper: {
        width: 55,
        height: 55,
        borderRadius: 32.5,
        backgroundColor: '#F1F8FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    serviceIconWrapperSelected: {
        borderColor: "#0D47A1",
        backgroundColor: "#E3F2FD",
        borderWidth: 2,
    },
    serviceName: {
        fontSize: 10,
        fontWeight: "600",
        color: "#1A1A1A",
        textAlign: "center",
        lineHeight: 13,
    },
    serviceNameSelected: {
        color: "#0F172A",
        fontWeight: "800",
    },

    // Input Cards (Step 2/3)
    inputCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 8,
        textTransform: "uppercase",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingBottom: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: "#0F172A",
    },
    rupeeSymbol: {
        fontSize: 18,
        fontWeight: "600",
        color: "#64748B",
    },
    detailsRow: {
        flexDirection: "row",
        gap: 12,
    },
    detailCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: "#94A3B8",
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0F172A",
    },

    // Step 3: Plan Cards
    planCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    planCardSelected: {
        borderColor: "#0F172A",
        backgroundColor: "#F8FAFC",
        borderWidth: 2,
    },
    planLeft: {
        flex: 1,
    },
    planAmount: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 4,
    },
    planDetails: {
        fontSize: 13,
        color: "#64748B",
    },
    orDivider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E2E8F0",
    },
    orText: {
        fontSize: 12,
        color: "#94A3B8",
        marginHorizontal: 12,
        fontWeight: "600",
    },
    customAmountCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    // Frequency
    frequencyCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    freqContainerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    frequencyOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: "#94A3B8",
        justifyContent: "center",
        alignItems: "center",
    },
    radioActive: {
        borderColor: "#0F172A",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#0F172A",
    },
    frequencyText: {
        fontSize: 13,
        color: "#0F172A",
        fontWeight: "500",
    },

    // Payment Grid
    paymentModesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 16,
    },
    paymentModeCard: {
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        gap: 8,
    },
    selectedPaymentModeCard: {
        borderColor: "#0F172A",
        backgroundColor: "#F1F5F9",
    },
    paymentModeText: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
    selectedPaymentModeText: {
        color: "#0F172A",
        fontWeight: "700",
    },

    // Card Input Form
    cardForm: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    cardFieldGroup: {
        marginBottom: 16,
    },
    cardFieldLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 6,
        textTransform: "uppercase",
    },
    cardInput: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        gap: 10,
    },
    cardInputText: {
        flex: 1,
        fontSize: 15,
        color: "#0F172A",
    },
    rowInputs: {
        flexDirection: "row",
        gap: 12,
    },
    declarationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 8,
    },
    declarationText: {
        flex: 1,
        fontSize: 12,
        color: "#64748B",
        lineHeight: 18,
    },

    // Bottom CTA
    bottomCTA: {
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    enableButton: {
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    enableButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    enableGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        gap: 8,
    },
    enableButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    enableButtonTextDisabled: {
        color: "#64748B",
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 24,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 8,
        textAlign: "center",
    },
    modalMessage: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#475569",
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#0F172A",
        alignItems: "center",
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    // Success Modal
    successContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 30,
        width: "100%",
        alignItems: "center",
    },
    successIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#ECFDF5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 12,
        textAlign: "center",
    },
    successMessage: {
        fontSize: 15,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
    },
    viewAutopayButton: {
        width: "100%",
        backgroundColor: "#0F172A",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    viewAutopayButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
