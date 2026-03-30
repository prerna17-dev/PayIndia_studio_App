import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";

export default function PMKisanStatusScreen() {
    const router = useRouter();

    const [idType, setIdType] = useState("Aadhaar");
    const [idNumber, setIdNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [benData, setBenData] = useState<any>(null);

    const handleCheckStatus = async () => {
        if (!idNumber) {
            Alert.alert("Error", `Please enter ${idType} Number`);
            return;
        }
        if (mobileNumber.length !== 10) {
            Alert.alert("Error", "Please enter valid 10-digit Mobile Number");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(API_ENDPOINTS.PM_KISAN_STATUS, { idType, idNumber });
            if (response.data.success) {
                setBenData(response.data.data);
                setShowStatus(true);
            } else {
                Alert.alert("Error", response.data.message || "Failed to fetch status");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Application not found or data error");
        } finally {
            setIsLoading(true);
            // Simulate minor delay for UX
            setTimeout(() => setIsLoading(false), 800);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Check Status</Text>
                        <Text style={styles.headerSubtitle}>Installment Tracking</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {!showStatus ? (
                        <View style={styles.searchSection}>
                            <View style={styles.searchCard}>
                                <Text style={styles.label}>Select ID Type</Text>
                                <View style={styles.typeRow}>
                                    {["Aadhaar", "Registration"].map(t => (
                                        <TouchableOpacity key={t} style={[styles.typeBtn, idType === t && styles.typeBtnActive]} onPress={() => setIdType(t)}>
                                            <Text style={[styles.typeText, idType === t && styles.typeTextActive]}>{t} Number</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.label}>{idType} Number *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={`Enter ${idType} Number`}
                                    value={idNumber}
                                    onChangeText={(t) => setIdNumber(t.replace(/\D/g, "").substring(0, idType === "Aadhaar" ? 12 : 15))}
                                    keyboardType="number-pad"
                                    maxLength={idType === "Aadhaar" ? 12 : 15}
                                />

                                <Text style={styles.label}>Mobile Number *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter registered mobile"
                                    value={mobileNumber}
                                    onChangeText={setMobileNumber}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                />

                                <TouchableOpacity style={styles.searchBtn} onPress={handleCheckStatus} disabled={isLoading}>
                                    <LinearGradient colors={["#1565C0", "#0D47A1"]} style={styles.btnContent}>
                                        {isLoading ? <ActivityIndicator color="#FFF" /> : (
                                            <><Text style={styles.btnLabel}>Check Installment Status</Text><Ionicons name="search" size={18} color="#FFF" /></>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.statusSection}>
                            <View style={styles.beneficiaryCard}>
                                <View style={styles.benHeader}>
                                    <View style={styles.benIcon}><Ionicons name="person" size={24} color="#1565C0" /></View>
                                    <View>
                                        <Text style={styles.benName}>{benData?.farmer_name || "N/A"}</Text>
                                        <Text style={styles.benId}>Reg No: {benData?.reference_id || "N/A"}</Text>
                                    </View>
                                </View>
                                <View style={styles.benDivider} />
                                <View style={styles.benInfoRow}>
                                    <View style={styles.benInfoItem}>
                                        <Text style={styles.benInfoLabel}>District</Text>
                                        <Text style={styles.benInfoValue}>{benData?.district || "N/A"}</Text>
                                    </View>
                                    <View style={styles.benInfoItem}>
                                        <Text style={styles.benInfoLabel}>Reg. Date</Text>
                                        <Text style={styles.benInfoValue}>{benData?.created_at ? new Date(benData.created_at).toLocaleDateString() : "N/A"}</Text>
                                    </View>
                                    <View style={styles.benInfoItem}>
                                        <Text style={styles.benInfoLabel}>Status</Text>
                                        <Text style={[styles.benInfoValue, { color: benData?.status === 'APPROVED' ? '#2E7D32' : benData?.status === 'REJECTED' ? '#D32F2F' : '#F57C00' }]}>
                                            {benData?.status || "PENDING"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Installment History</Text>
                            <View style={styles.emptyHistoryCard}>
                                <View style={styles.emptyIconCircle}>
                                    <MaterialCommunityIcons name="calendar-clock" size={32} color="#64748B" />
                                </View>
                                <Text style={styles.emptyTitle}>No Installments Found</Text>
                                <Text style={styles.emptySubtitle}>There are no installments started or made for this beneficiary until now.</Text>
                            </View>

                            <TouchableOpacity style={styles.resetBtn} onPress={() => setShowStatus(false)}>
                                <Text style={styles.resetBtnText}>Check Another Beneficiary</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 11, color: "#64748B", marginTop: 2 },
    scrollContent: { padding: 20 },
    searchSection: { marginBottom: 20 },
    statusSection: { marginBottom: 20 },

    searchCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, elevation: 4, shadowColor: "#64748B", shadowOpacity: 0.1, shadowRadius: 12 },
    label: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 10, marginTop: 15 },
    typeRow: { flexDirection: "row", gap: 10, marginBottom: 5 },
    typeBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0" },
    typeBtnActive: { backgroundColor: "#E3F2FD", borderColor: "#1565C0" },
    typeText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
    typeTextActive: { color: "#1565C0", fontWeight: "700" },
    input: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 14, fontSize: 15, color: "#1E293B", borderWidth: 1, borderColor: "#E2E8F0" },
    searchBtn: { marginTop: 30, borderRadius: 16, overflow: "hidden" },
    btnContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
    btnLabel: { fontSize: 16, fontWeight: "800", color: "#FFF" },

    beneficiaryCard: { backgroundColor: "#E3F2FD", borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: "#BBDEFB" },
    benHeader: { flexDirection: "row", alignItems: "center", gap: 15 },
    benIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#BBDEFB", alignItems: "center", justifyContent: "center" },
    benName: { fontSize: 18, fontWeight: "800", color: "#1565C0" },
    benId: { fontSize: 12, color: "#64748B", marginTop: 2 },
    benDivider: { height: 1, backgroundColor: "#BBDEFB", marginVertical: 15 },
    benInfoRow: { flexDirection: "row", justifyContent: "space-between" },
    benInfoItem: { flex: 1 },
    benInfoLabel: { fontSize: 11, color: "#64748B", textTransform: "uppercase" },
    benInfoValue: { fontSize: 14, fontWeight: "700", color: "#1E293B", marginTop: 4 },

    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 15, marginLeft: 4 },
    emptyHistoryCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 40, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#F1F5F9", borderStyle: 'dashed' },
    emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    emptyTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 8 },
    emptySubtitle: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20 },

    resetBtn: { marginTop: 30, alignItems: "center", paddingVertical: 15 },
    resetBtnText: { fontSize: 14, fontWeight: "700", color: "#1565C0" },
});
