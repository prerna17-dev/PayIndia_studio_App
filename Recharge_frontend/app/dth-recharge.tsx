import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback, useEffect } from "react";
import {
    ActivityIndicator,
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "@/constants/api";

const POPULAR_DTH_NAMES = ["TATA PLAY", "DISH TV", "AIRTEL DIGITAL TV", "SUN DIRECT", "D2H", "VIDEOCON D2H"];
const DTH_SHORT_NAMES: { [key: string]: string } = {
    "TATA PLAY": "Tata Play",
    "DISH TV": "Dish TV",
    "AIRTEL DIGITAL TV": "Airtel TV",
    "SUN DIRECT": "Sun Direct",
    "D2H": "D2H",
    "VIDEOCON D2H": "d2h"
};

const availablePlans = [
    { id: '1', price: '₹299', duration: '1 Month', popular: true, benefit: 'HD Sports Pack' },
    { id: '2', price: '₹599', duration: '3 Months', popular: false, benefit: 'Mega Family Pack' },
    { id: '3', price: '₹999', duration: '6 Months', popular: false, benefit: 'Value Plus' },
    { id: '4', price: '₹1799', duration: '1 Year', popular: true, benefit: 'Annual Super Saver' },
];

export default function DTHRechargeScreen() {
    const router = useRouter();

    // Form states
    const [selectedOperator, setSelectedOperator] = useState<any>(null);
    const [subscriberId, setSubscriberId] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");

    // API Data states
    const [allOperators, setAllOperators] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(true);

    // UI States
    const [operatorSearchQuery, setOperatorSearchQuery] = useState("");
    const [showOperatorModal, setShowOperatorModal] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    // Details Flow State
    const [accountDetails, setAccountDetails] = useState<any>(null);
    const [customAmount, setCustomAmount] = useState('');

    useEffect(() => {
        fetchOperators();
    }, []);

    const fetchOperators = async () => {
        setIsRefreshing(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(`${API_ENDPOINTS.BILL_OPERATORS}?category=DTH`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();

            if (result.status && result.data) {
                const formatted = result.data.map((op: any) => ({
                    id: op.id || op.operator_id,
                    name: op.name || op.operator_name,
                }));
                // Ensure unique operators (PaySprint sometimes has duplicates)
                const unique = Array.from(new Set(formatted.map((a: any) => a.name)))
                    .map(name => formatted.find((a: any) => a.name === name));
                setAllOperators(unique);
            }
        } catch (error) {
            console.error("Fetch DTH operators error:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const getOperatorIcon = (name: string) => {
        const n = name.toUpperCase();
        if (n.includes("TATA")) return "satellite-uplink";
        if (n.includes("DISH")) return "television-classic";
        if (n.includes("AIRTEL")) return "satellite-variant";
        if (n.includes("SUN")) return "weather-sunny";
        if (n.includes("D2H")) return "television-guide";
        return "satellite-variant";
    };

    const getOperatorColor = (name: string) => {
        if (name.includes("TATA")) return "#0066CC";
        if (name.includes("DISH")) return "#FF6B35";
        if (name.includes("AIRTEL")) return "#ED1C24";
        if (name.includes("SUN")) return "#FF9500";
        if (name.includes("D2H")) return "#00A8E1";
        return "#666";
    };

    const handleBack = useCallback(() => {
        if (accountDetails) {
            setAccountDetails(null);
            return true;
        }
        router.back();
        return true;
    }, [router, accountDetails]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

    const handleOperatorSelect = (operator: any) => {
        setSelectedOperator(operator);
        setShowOperatorModal(false);
        setAccountDetails(null);
    };

    const validateForm = () => {
        if (!selectedOperator) return false;
        if (subscriberId.trim().length < 8) return false;
        if (mobileNumber.length !== 10) return false;
        return true;
    };

    const handleFetchDetails = async () => {
        if (!validateForm()) {
            Alert.alert('Invalid Information', 'Please select an operator and enter a valid Subscriber ID.');
            return;
        }

        setIsFetching(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(API_ENDPOINTS.FETCH_BILL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    operator: selectedOperator.id,
                    canumber: subscriberId,
                }),
            });
            const result = await response.json();

            if (result.status === true || result.status === "true") {
                const billData = result.data || result;
                if (billData.amount || billData.name) {
                    setAccountDetails({
                        subscriberName: billData.name || 'Customer',
                        mobile: billData.ad1 || '',
                        currentPlan: billData.ad2 || 'N/A',
                        balance: `₹${billData.amount || '0'}`,
                        expiryDate: billData.duedate || 'N/A',
                        amount: billData.amount
                    });
                    setCustomAmount(billData.amount || '');
                } else {
                    Alert.alert('No Data', result.message || 'Could not fetch account details.');
                }
            } else {
                Alert.alert('Error', result.message || 'Failed to fetch details. Please check Subscriber ID.');
            }
        } catch (error) {
            console.error("Fetch DTH details error:", error);
            Alert.alert('Error', 'An error occurred while fetching details.');
        } finally {
            setIsFetching(false);
        }
    };

    const handlePlanSelect = (plan: any) => {
        const cleanPrice = plan.price.replace(/[^0-9.]/g, '');
        // Route to common recharge payment logic
        router.push({
            pathname: '/recharge-payment',
            params: {
                number: subscriberId,
                operator: selectedOperator.name,
                circle: 'India', // DTH doesn't depend on circles
                amount: cleanPrice,
                planName: plan.duration,
                planBenefit: plan.benefit
            }
        });
    };

    const handleCustomPay = () => {
        const amount = customAmount.replace(/[^0-9.]/g, '');
        if (!amount || parseInt(amount) < 10) {
            Alert.alert("Invalid Amount", "Please enter a valid amount greater than ₹10");
            return;
        }

        router.push({
            pathname: '/recharge-payment',
            params: {
                number: subscriberId,
                operator: selectedOperator.name,
                circle: 'India',
                amount: amount,
                planName: "Custom DTH Recharge",
                planBenefit: "Manual Amount Entry"
            }
        });
    };


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
                        <Text style={styles.headerTitle}>DTH Recharge</Text>
                        <Text style={styles.headerSubtitle}>Select operator & enter ID</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>

                            {!accountDetails ? (
                                <>
                                    {/* Select Provider & Enter ID */}
                                    <View style={{ marginBottom: 20 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Select DTH Provider</Text>
                                            {isRefreshing && <ActivityIndicator size="small" color="#0D47A1" />}
                                        </View>
                                        <View style={styles.grid}>
                                            {allOperators.map((item) => {
                                                const shortName = Object.entries(DTH_SHORT_NAMES).find(([full]) => 
                                                    item.name.toUpperCase().includes(full)
                                                )?.[1] || item.name;

                                                return (
                                                    <TouchableOpacity
                                                        key={item.id}
                                                        style={[styles.gridItem, selectedOperator?.id === item.id && styles.selectedGridItem]}
                                                        onPress={() => handleOperatorSelect(item)}
                                                    >
                                                        <View style={[styles.iconCircle, selectedOperator?.id === item.id && styles.selectedIconCircle]}>
                                                            <MaterialCommunityIcons
                                                                name={getOperatorIcon(item.name) as any}
                                                                size={24}
                                                                color={selectedOperator?.id === item.id ? "#FFFFFF" : "#0D47A1"}
                                                            />
                                                        </View>
                                                        <Text style={styles.gridLabel}>{shortName}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    <View style={styles.formCard}>
                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Subscriber ID / VC Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="tv-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter 8+ digit ID"
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="number-pad"
                                                    value={subscriberId}
                                                    onChangeText={setSubscriberId}
                                                />
                                            </View>
                                        </View>

                                        <View style={[styles.fieldGroup, { marginTop: 15 }]}>
                                            <Text style={styles.fieldLabel}>Mobile Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="call-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter 10-digit mobile"
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="number-pad"
                                                    maxLength={10}
                                                    value={mobileNumber}
                                                    onChangeText={setMobileNumber}
                                                />
                                            </View>
                                        </View>

                                        {selectedOperator && (
                                            <View style={[styles.fieldGroup, { marginTop: 15 }]}>
                                                <Text style={styles.fieldLabel}>Selected Provider</Text>
                                                <View style={[styles.inputContainer, styles.readOnlyInput]}>
                                                    <MaterialCommunityIcons name={selectedOperator.icon} size={16} color="#0D47A1" />
                                                    <TextInput
                                                        style={[styles.input, { color: '#0D47A1', fontWeight: 'bold' }]}
                                                        value={selectedOperator.name}
                                                        editable={false}
                                                    />
                                                    <TouchableOpacity onPress={() => setSelectedOperator(null)}>
                                                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity onPress={handleFetchDetails} disabled={!validateForm() || isFetching} style={{ marginBottom: 30 }}>
                                        <LinearGradient
                                            colors={!validateForm() || isFetching ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            {isFetching ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Fetch Account Details</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {/* Account Details View */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <Ionicons name="person-circle" size={24} color="#0D47A1" />
                                            <Text style={styles.summaryTitle}>Customer Details</Text>
                                        </View>
                                        <View style={styles.divider} />

                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Name</Text>
                                            <Text style={styles.summaryValue}>{accountDetails.subscriberName}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Plan</Text>
                                            <Text style={styles.summaryValue}>{accountDetails.currentPlan}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Expiry</Text>
                                            <Text style={[styles.summaryValue, { color: '#FF9800' }]}>{accountDetails.expiryDate}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Balance</Text>
                                            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{accountDetails.balance}</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.sectionTitle}>Available Plans</Text>
                                    <View style={styles.plansGrid}>
                                        {availablePlans.map((plan) => (
                                            <TouchableOpacity
                                                key={plan.id}
                                                style={styles.planCard}
                                                onPress={() => handlePlanSelect(plan)}
                                            >
                                                {plan.popular && (
                                                    <View style={styles.popularBadge}>
                                                        <Text style={styles.popularText}>POPULAR</Text>
                                                    </View>
                                                )}
                                                <Text style={styles.planPrice}>{plan.price}</Text>
                                                <Text style={styles.planDuration}>{plan.duration}</Text>
                                                <Text style={styles.planBenefit}>{plan.benefit}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Or Enter Custom Amount</Text>
                                    <View style={styles.formCard}>
                                        <View style={styles.inputContainer}>
                                            <Text style={{ fontSize: 18, color: '#64748B', fontWeight: 'bold' }}>₹</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter amount manually"
                                                placeholderTextColor="#94A3B8"
                                                keyboardType="numeric"
                                                value={customAmount}
                                                onChangeText={setCustomAmount}
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity onPress={handleCustomPay} disabled={customAmount.length === 0} style={{ marginBottom: 30 }}>
                                        <LinearGradient
                                            colors={customAmount.length === 0 ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            <Text style={styles.actionButtonText}>Proceed to Pay ₹{customAmount}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
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

    formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
    fieldGroup: { marginBottom: 15 },
    fieldLabel: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 6 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E0E0E0" },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },
    readOnlyInput: { backgroundColor: '#F1F5F9', borderColor: '#E0E0E0' },

    actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
    gridItem: { flex: 1, minWidth: '30%', alignItems: 'center', marginBottom: 5, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    selectedGridItem: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F8FE', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    selectedIconCircle: { backgroundColor: '#0D47A1' },
    gridLabel: { fontSize: 10, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },
    viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F7FF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#0D47A1', borderStyle: 'dashed', marginTop: 10 },
    viewAllText: { fontSize: 14, fontWeight: 'bold', color: '#0D47A1', marginRight: 8 },

    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 13, color: '#64748B' },
    summaryValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },

    plansGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
    planCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, position: 'relative', borderWidth: 1, borderColor: '#E2E8F0' },
    popularBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FF9800', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    popularText: { fontSize: 9, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 0.5 },
    planPrice: { fontSize: 24, fontWeight: 'bold', color: '#0D47A1', marginBottom: 6 },
    planDuration: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
    planBenefit: { fontSize: 11, color: '#64748B', marginTop: 4 },
});