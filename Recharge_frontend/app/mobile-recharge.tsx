import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import * as Contacts from "expo-contacts";
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

const popularOperators = [
    { id: 'jio', name: "Jio", icon: "signal-cellular-3" },
    { id: 'airtel', name: "Airtel", icon: "signal-cellular-outline" },
    { id: 'vi', name: "Vi", icon: "cellphone-wireless" },
    { id: 'bsnl', name: "BSNL", icon: "radio-tower" },
    { id: 'mtnl-mumbai', name: "MTNL Mumbai", icon: "deskphone" },
    { id: 'mtnl-delhi', name: "MTNL Delhi", icon: "deskphone" },
];

const allOperators = [
    { id: 'jio', name: "Jio" },
    { id: 'airtel', name: "Airtel" },
    { id: 'vi', name: "Vi" },
    { id: 'bsnl', name: "BSNL" },
    { id: 'mtnl-mumbai', name: "MTNL Mumbai" },
    { id: 'mtnl-delhi', name: "MTNL Delhi" }
];

export default function MobileRechargeScreen() {
    const router = useRouter();

    // Form states
    const [selectedOperator, setSelectedOperator] = useState<any>(null);
    const [mobileNumber, setMobileNumber] = useState("");

    // UI States
    const [operatorSearchQuery, setOperatorSearchQuery] = useState("");
    const [showOperatorModal, setShowOperatorModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingOperator, setIsFetchingOperator] = useState(false);

    React.useEffect(() => {
        if (mobileNumber.length === 10) {
            autoDetectOperator(mobileNumber);
        } else if (mobileNumber.length < 10 && selectedOperator) {
            setSelectedOperator(null);
        }
    }, [mobileNumber]);

    const autoDetectOperator = async (number: string) => {
        setIsFetchingOperator(true);
        // Simulate API call to fetch operator based on number
        setTimeout(() => {
            let detected = null;
            
            const numStr = number.toLowerCase();
            
            // User requested explicit check logic:
            // "if jio then jio , if vi then vi, if number is airtel hen airtel if number is bsnl then bsnl"
            // We use standard Indian prefixes out of necessity to simulate "fetching" since
            // it's just a 10 digit number.
            if (numStr.startsWith('98') || numStr.startsWith('99')) {
                detected = allOperators.find(op => op.id === 'airtel');
            } else if (numStr.startsWith('88') || numStr.startsWith('89')) {
                detected = allOperators.find(op => op.id === 'vi');
            } else if (numStr.startsWith('77') || numStr.startsWith('94')) {
                detected = allOperators.find(op => op.id === 'bsnl');
            } else {
                detected = allOperators.find(op => op.id === 'jio'); 
            }

            if (detected) {
                setSelectedOperator(detected);
            }
            setIsFetchingOperator(false);
        }, 1000); // UI delay simulation
    };

    const handleBack = useCallback(() => {
        router.back();
        return true;
    }, [router]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

    const handleOperatorSelect = (operator: any) => {
        setSelectedOperator(operator);
        setShowOperatorModal(false);
    };

    const handleContactPicker = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const contact = await Contacts.presentContactPickerAsync();
                if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                    const phoneNumber = contact.phoneNumbers[0].number;
                    if (phoneNumber) {
                        const phone = phoneNumber.replace(/\D/g, '').slice(-10);
                        setMobileNumber(phone);
                    }
                }
            } else {
                Alert.alert("Permission Denied", "We need contacts permission to pick a number.");
            }
        } catch (err) {
            console.log("Contact pick error", err);
        }
    };

    const validateForm = () => {
        if (!selectedOperator && mobileNumber.trim().length !== 10) return false;
        return true;
    };

    const handleContinue = () => {
        if (mobileNumber.length !== 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            // Navigate to recharge plans screen with the number and operator details
            router.push({
                pathname: '/recharge-plans',
                params: {
                    number: mobileNumber,
                    operator: selectedOperator ? selectedOperator.id : 'auto',
                    operatorName: selectedOperator ? selectedOperator.name : 'Unknown',
                    circle: 'Maharashtra'
                }
            });
        }, 500);
    };

    const filteredOperators = allOperators.filter(operator =>
        operator.name.toLowerCase().includes(operatorSearchQuery.toLowerCase())
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
                        <Text style={styles.headerTitle}>Prepaid Recharge</Text>
                        <Text style={styles.headerSubtitle}>Select plan & pay instantly</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>



                            {/* Mobile Details Form */}
                            <View style={styles.formCard}>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>Mobile Number *</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="phone-portrait-outline" size={16} color="#94A3B8" />
                                        <Text style={{ marginLeft: 6, fontWeight: 'bold', color: '#111' }}>+91</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter 10-digit number"
                                            placeholderTextColor="#94A3B8"
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            value={mobileNumber}
                                            onChangeText={setMobileNumber}
                                        />
                                        <TouchableOpacity
                                            onPress={handleContactPicker}
                                            style={styles.keyboardToggle}
                                        >
                                            <Ionicons name="people-circle" size={24} color="#0D47A1" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {isFetchingOperator ? (
                                    <View style={[styles.fieldGroup, { alignItems: 'center', padding: 10 }]}>
                                        <ActivityIndicator color="#0D47A1" />
                                        <Text style={{ fontSize: 13, color: '#64748B', marginTop: 8, fontWeight: '600' }}>Fetching Operator Details...</Text>
                                    </View>
                                ) : selectedOperator ? (
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Detected Operator</Text>
                                        <View style={[styles.inputContainer, styles.readOnlyInput]}>
                                            <Ionicons name="globe-outline" size={16} color="#94A3B8" />
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
                                ) : null}
                            </View>

                            <TouchableOpacity onPress={handleContinue} disabled={!validateForm() || isLoading} style={{ marginBottom: 30 }}>
                                <LinearGradient
                                    colors={!validateForm() || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.actionButton}
                                >
                                    {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Browse Plans</Text>}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Popular Operators */}
                            <Text style={styles.sectionTitle}>Select Operator Manually</Text>
                            <View style={styles.grid}>
                                {popularOperators.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.gridItem, selectedOperator?.id === item.id && styles.selectedGridItem]}
                                        onPress={() => handleOperatorSelect(item)}
                                    >
                                        <View style={[styles.iconCircle, selectedOperator?.id === item.id && styles.selectedIconCircle]}>
                                            <MaterialCommunityIcons
                                                name={item.icon as any}
                                                size={24}
                                                color={selectedOperator?.id === item.id ? "#FFFFFF" : "#0D47A1"}
                                            />
                                        </View>
                                        <Text style={styles.gridLabel}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.browseContainer}>
                                <TouchableOpacity style={styles.browseButton} onPress={() => setShowOperatorModal(true)}>
                                    <Text style={styles.browseText}>View All Operators</Text>
                                    <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Operator Selection Modal */}
                <Modal visible={showOperatorModal} transparent animationType="slide" onRequestClose={() => setShowOperatorModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Operator</Text>
                                <TouchableOpacity onPress={() => setShowOperatorModal(false)}><Ionicons name="close" size={24} color="#666" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput style={styles.modalSearchInput} placeholder="Search Operator..." value={operatorSearchQuery} onChangeText={setOperatorSearchQuery} />
                            </View>
                            <ScrollView style={styles.optionsList}>
                                {filteredOperators.map((op, index) => (
                                    <TouchableOpacity key={index} style={styles.optionItem} onPress={() => handleOperatorSelect(op)}>
                                        <Text style={styles.optionText}>{op.name}</Text>
                                        {selectedOperator?.id === op.id && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
    headerSubtitle: { fontSize: 11, color: "#666", marginTop: 2 },
    placeholder: { width: 34 },
    scrollContent: { padding: 20 },
    content: { paddingVertical: 10 },
    promoBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 24, gap: 12 },
    promoIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
    promoTextContainer: { flex: 1 },
    promoTitle: { fontSize: 16, fontWeight: '700', color: '#0D47A1' },
    promoSubtitle: { fontSize: 12, color: '#1565C0', marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    gridItem: { width: '30%', alignItems: 'center', marginBottom: 16, padding: 8, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
    selectedGridItem: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F8FE', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    selectedIconCircle: { backgroundColor: '#0D47A1' },
    gridLabel: { fontSize: 9, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },
    browseContainer: { alignItems: 'center', marginBottom: 20 },
    browseButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#BBDEFB', gap: 4 },
    browseText: { fontSize: 12, fontWeight: '700', color: '#0D47A1' },
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
    fieldGroup: { marginBottom: 15 },
    fieldLabel: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 6 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E0E0E0" },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },
    keyboardToggle: { padding: 4, marginLeft: 8, backgroundColor: '#E3F2FD', borderRadius: 8 },
    readOnlyInput: { backgroundColor: '#F1F5F9', borderColor: '#E0E0E0' },
    actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', paddingTop: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, margin: 20, paddingHorizontal: 15, paddingVertical: 10 },
    modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1A1A1A' },
    optionsList: { paddingHorizontal: 20 },
    optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    optionText: { fontSize: 15, color: '#1A1A1A' }
});