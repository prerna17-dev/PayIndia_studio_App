import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    ActivityIndicator,
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

export default function RechargePaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        number: string;
        operator: string;
        circle: string;
        amount: string;
        planName: string;
        planBenefit: string;
    }>();

    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardHolder, setCardHolder] = useState("");

    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

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

    const isReadyToPay = () => {
        if (!isConfirmed || !selectedPaymentMode || !params.amount) return false;

        if (selectedPaymentMode.includes("Card")) {
            if (cardNumber.replace(/\s/g, '').length !== 16) return false;
            if (expiryDate.length !== 5) return false;
            if (cvv.length !== 3) return false;
            if (cardHolder.trim().length < 3) return false;
        }

        return true;
    };

    const handleProceedToPay = () => {
        if (!isReadyToPay() || !params.amount) return;

        if (selectedPaymentMode === 'Wallet') {
            router.replace({
                pathname: "/wallet" as any,
                params: {
                    amount: params.amount,
                    billType: "Recharge Payment",
                    mobileNumber: params.number,
                    operatorName: params.operator,
                },
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowPaymentSuccess(true);
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Complete Payment</Text>
                        <Text style={styles.headerSubtitle}>Recharge for {params.number}</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>

                        {/* Summary Card */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryHeader}>
                                <Ionicons name="phone-portrait" size={24} color="#0D47A1" />
                                <Text style={styles.summaryTitle}>Recharge Summary</Text>
                            </View>
                            <View style={styles.divider} />

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Mobile</Text>
                                <Text style={styles.summaryValue}>+91 {params.number}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Operator</Text>
                                <Text style={styles.summaryValue}>{params.operator} - {params.circle}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Plan</Text>
                                <Text style={styles.summaryValue}>{params.planName}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Benefit</Text>
                                <Text style={styles.summaryValue}>{params.planBenefit}</Text>
                            </View>

                            <View style={styles.amountBanner}>
                                <View>
                                    <Text style={styles.bannerLabel}>Total Amount</Text>
                                    <Text style={styles.bannerValue}>₹{params.amount}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Payment Selection */}
                        <View style={styles.formCard}>
                            <Text style={styles.sectionTitle}>Payment Details</Text>

                            <Text style={styles.fieldLabel}>Select Payment Mode</Text>
                            <View style={styles.paymentModes}>
                                {['Wallet', 'Debit Card', 'Credit Card', 'UPI / Net Banking'].map((mode) => (
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
                            <Text style={styles.declarationText}>I authorize this recharge payment for ₹{params.amount}.</Text>
                        </TouchableOpacity>

                        <View style={styles.footerButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleProceedToPay} disabled={!isReadyToPay() || isLoading} style={{ flex: 1 }}>
                                <LinearGradient
                                    colors={!isReadyToPay() || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.payButton}
                                >
                                    {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Proceed to Pay</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Success Modal */}
                <Modal visible={showPaymentSuccess} transparent animationType="fade">
                    <View style={styles.successOverlay}>
                        <View style={styles.successCard}>
                            <View style={styles.successIcon}><Ionicons name="checkmark" size={50} color="#FFFFFF" /></View>
                            <Text style={styles.successTitle}>Recharge Successful</Text>

                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptValue}>TX-REC-{Math.floor(Math.random() * 900000) + 100000}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Mobile No.</Text><Text style={styles.receiptValue}>+91 {params.number}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount Paid</Text><Text style={styles.receiptValue}>₹{params.amount}</Text></View>
                            </View>

                            <View style={styles.successActionRow}>
                                <TouchableOpacity style={styles.receiptAction}><Ionicons name="download-outline" size={20} color="#0D47A1" /><Text style={styles.receiptActionText}>Download</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.receiptAction}><Ionicons name="share-social-outline" size={20} color="#0D47A1" /><Text style={styles.receiptActionText}>Share</Text></TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.backHomeButton} onPress={() => {
                                setShowPaymentSuccess(false);
                                router.push('/(tabs)/explore');
                            }}>
                                <Text style={styles.backHomeText}>Back to Home</Text>
                            </TouchableOpacity>
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
    scrollContent: { padding: 20, paddingBottom: 50 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },

    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 13, color: '#64748B' },
    summaryValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
    amountBanner: { flexDirection: 'row', backgroundColor: '#F1F8FE', borderRadius: 12, padding: 15, marginTop: 10, justifyContent: 'center' },
    bannerLabel: { fontSize: 11, color: '#64748B', textAlign: 'center', marginBottom: 4 },
    bannerValue: { fontSize: 22, fontWeight: 'bold', color: '#0D47A1', textAlign: 'center' },

    formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
    fieldGroup: { marginBottom: 15 },
    fieldLabel: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 6 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E0E0E0" },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },

    paymentModes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 10 },
    paymentModeCard: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
    selectedPaymentModeCard: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    paymentModeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    selectedPaymentModeText: { color: '#0D47A1' },

    cardFormContainer: { marginTop: 10, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    row: { flexDirection: 'row' },

    declarationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
    declarationText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 16 },

    footerButtons: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    cancelButton: { flex: 0.4, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
    cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
    payButton: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },

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
