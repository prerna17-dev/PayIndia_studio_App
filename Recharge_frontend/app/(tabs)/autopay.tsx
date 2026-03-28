import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import {
    Alert,
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AutopayScreen() {
    const router = useRouter();

    // Handle hardware back button - go to account screen
    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                router.push("/account");
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction,
            );

            return () => backHandler.remove();
        }, [router]),
    );

    // Initialized without mock data for a clean professional start
    const [autopayList, setAutopayList] = useState<any[]>([]);

    const hasAutopay = autopayList.length > 0;

    // Load mandates from AsyncStorage every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const loadMandates = async () => {
                try {
                    const saved = await AsyncStorage.getItem("@autopay_mandates");
                    if (saved) {
                        setAutopayList(JSON.parse(saved));
                    } else {
                        setAutopayList([]);
                    }
                } catch (e) {
                    console.error("Failed to load mandates", e);
                }
            };
            loadMandates();
        }, [])
    );

    const handlePauseAutopay = async (id: number) => {
        const updatedList = autopayList.map((item) =>
            item.id === id ? { ...item, isPaused: !item.isPaused } : item,
        );
        setAutopayList(updatedList);
        await AsyncStorage.setItem("@autopay_mandates", JSON.stringify(updatedList));
    };

    const handleCancelAutopay = (id: number, type: string) => {
        Alert.alert(
            "Cancel Autopay?",
            `Are you sure you want to completely cancel autopay for ${type}?`,
            [
                { text: "Keep Active", style: "cancel" },
                {
                    text: "Cancel Autopay",
                    style: "destructive",
                    onPress: async () => {
                        const updatedList = autopayList.filter((item) => item.id !== id);
                        setAutopayList(updatedList);
                        await AsyncStorage.setItem("@autopay_mandates", JSON.stringify(updatedList));
                    },
                },
            ],
        );
    };

    const handleSetupAutopay = () => {
        router.push("/setup-autopay");
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Premium Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.push("/account")}
                    >
                        <Ionicons name="arrow-back" size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Autopay</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={!hasAutopay && styles.scrollEmpty}>
                    {hasAutopay && autopayList.length > 0 ? (
                        /* Active Autopay View */
                        <View style={styles.content}>
                            <Text style={styles.sectionHeading}>Your Active Autopays</Text>

                            <View style={styles.autopaySection}>
                                {autopayList.map((autopay) => (
                                    <View key={autopay.id} style={styles.premiumCard}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.cardHeaderLeft}>
                                                <View style={[styles.iconBox, { backgroundColor: `${autopay.color}15` }]}>
                                                    <Ionicons
                                                        name={autopay.icon as any}
                                                        size={20}
                                                        color={autopay.isPaused ? "#94A3B8" : autopay.color}
                                                    />
                                                </View>
                                                <View>
                                                    <Text style={[styles.autopayType, autopay.isPaused && styles.textMuted]}>
                                                        {autopay.type}
                                                    </Text>
                                                    <Text style={[styles.frequency, autopay.isPaused && styles.textMuted]}>
                                                        {autopay.frequency}
                                                    </Text>
                                                </View>
                                            </View>

                                            {autopay.isPaused ? (
                                                <View style={styles.statusBadgePaused}>
                                                    <Text style={styles.statusTextPaused}>Paused</Text>
                                                </View>
                                            ) : (
                                                <View style={styles.statusBadgeActive}>
                                                    <Text style={styles.statusTextActive}>Active</Text>
                                                </View>
                                            )}
                                        </View>

                                        <View style={styles.divider} />

                                        <View style={styles.cardDetails}>
                                            <View>
                                                <Text style={styles.detailLabel}>Amount Limit</Text>
                                                <Text style={[styles.autopayAmount, autopay.isPaused && styles.textMuted]}>
                                                    ₹{autopay.amount}
                                                </Text>
                                            </View>
                                            <View style={styles.nextPaymentBox}>
                                                <Text style={styles.detailLabel}>Next Payment</Text>
                                                <Text style={[styles.nextPaymentText, autopay.isPaused && styles.textMuted]}>
                                                    {autopay.nextPayment}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Action Buttons */}
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={[styles.outlineBtn, autopay.isPaused && styles.outlineBtnActive]}
                                                onPress={() => handlePauseAutopay(autopay.id)}
                                            >
                                                <Ionicons
                                                    name={autopay.isPaused ? "play" : "pause"}
                                                    size={16}
                                                    color={autopay.isPaused ? "#0F172A" : "#64748B"}
                                                />
                                                <Text style={[styles.outlineBtnText, autopay.isPaused && styles.outlineBtnTextActive]}>
                                                    {autopay.isPaused ? "Resume" : "Pause"}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.outlineBtnDanger}
                                                onPress={() => handleCancelAutopay(autopay.id, autopay.type)}
                                            >
                                                <Text style={styles.outlineBtnTextDanger}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Setup New Autopay Button */}
                            <TouchableOpacity
                                style={styles.addMandateBtn}
                                onPress={handleSetupAutopay}
                            >
                                <MaterialCommunityIcons name="plus" size={18} color="#0F172A" />
                                <Text style={styles.addMandateText}>Set Up New Autopay</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* Premium Empty State */
                        <View style={styles.emptyStateContainer}>
                            <View style={styles.emptyIllustrationWrapper}>
                                <LinearGradient
                                    colors={["#F1F5F9", "#E2E8F0"]}
                                    style={styles.emptyCircleLarge}
                                >
                                    <View style={styles.emptyCircleSmall}>
                                        <MaterialCommunityIcons name="credit-card-sync-outline" size={48} color="#0F172A" />
                                    </View>
                                </LinearGradient>
                                <View style={styles.floatingBadge}>
                                    <MaterialCommunityIcons name="shield-check" size={16} color="#059669" />
                                </View>
                            </View>

                            <Text style={styles.emptyTitle}>Automate Your Payments</Text>
                            <Text style={styles.emptyDescription}>
                                Set up secure autopay mandates and never worry about late fees or service interruptions again.
                            </Text>

                            <TouchableOpacity
                                style={styles.primaryBtn}
                                onPress={handleSetupAutopay}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={["#0F172A", "#1E293B"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.primaryBtnGradient}
                                >
                                    <Text style={styles.primaryBtnText}>Set Up Autopay</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Crisp Benefits List */}
                            <View style={styles.featuresWrapper}>
                                <View style={styles.featureItem}>
                                    <View style={styles.featureIcon}>
                                        <MaterialCommunityIcons name="clock-fast" size={18} color="#3B82F6" />
                                    </View>
                                    <View>
                                        <Text style={styles.featureTitle}>Punctual Payments</Text>
                                        <Text style={styles.featureText}>Bills are paid exactly when they're due.</Text>
                                    </View>
                                </View>

                                <View style={styles.featureItem}>
                                    <View style={styles.featureIcon}>
                                        <MaterialCommunityIcons name="tune" size={18} color="#8B5CF6" />
                                    </View>
                                    <View>
                                        <Text style={styles.featureTitle}>Full Control</Text>
                                        <Text style={styles.featureText}>Pause, modify, or cancel at any time.</Text>
                                    </View>
                                </View>

                                <View style={styles.featureItem}>
                                    <View style={styles.featureIcon}>
                                        <MaterialCommunityIcons name="lock-outline" size={18} color="#10B981" />
                                    </View>
                                    <View>
                                        <Text style={styles.featureTitle}>Bank-grade Security</Text>
                                        <Text style={styles.featureText}>Fully encrypted and safely processed.</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC", // Sleek cool gray
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
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0F172A",
        letterSpacing: -0.5,
    },
    placeholder: {
        width: 40,
    },

    scrollEmpty: {
        flexGrow: 1,
        justifyContent: "center",
        paddingBottom: 40,
    },

    /* Premium Empty State */
    emptyStateContainer: {
        paddingHorizontal: 24,
        alignItems: "center",
    },
    emptyIllustrationWrapper: {
        position: "relative",
        marginBottom: 32,
        marginTop: 20,
    },
    emptyCircleLarge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyCircleSmall: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    floatingBadge: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "#D1FAE5",
        padding: 6,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 12,
        letterSpacing: -0.5,
        textAlign: "center",
    },
    emptyDescription: {
        fontSize: 15,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 36,
        paddingHorizontal: 10,
    },
    primaryBtn: {
        width: "100%",
        marginBottom: 40,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryBtnGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        borderRadius: 16,
        gap: 8,
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    featuresWrapper: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        gap: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: 4,
    },
    featureText: {
        fontSize: 13,
        color: "#64748B",
        lineHeight: 18,
        paddingRight: 20,
    },

    /* Active State styling (if data exists) */
    content: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    sectionHeading: {
        fontSize: 15,
        fontWeight: "700",
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 16,
    },
    autopaySection: {
        marginBottom: 16,
    },
    premiumCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    autopayType: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 2,
    },
    frequency: {
        fontSize: 12,
        color: "#64748B",
    },
    statusBadgeActive: {
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusTextActive: {
        fontSize: 12,
        fontWeight: "600",
        color: "#059669",
    },
    statusBadgePaused: {
        backgroundColor: "#FFF7ED",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusTextPaused: {
        fontSize: 12,
        fontWeight: "600",
        color: "#EA580C",
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
        marginBottom: 16,
    },
    cardDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    detailLabel: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "500",
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    autopayAmount: {
        fontSize: 17,
        fontWeight: "800",
        color: "#0F172A",
    },
    nextPaymentBox: {
        alignItems: "flex-end",
    },
    nextPaymentText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#3B82F6",
    },
    textMuted: {
        color: "#94A3B8",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    outlineBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
    },
    outlineBtnActive: {
        borderColor: "#0F172A",
        backgroundColor: "#0F172A",
    },
    outlineBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748B",
    },
    outlineBtnTextActive: {
        color: "#FFFFFF",
    },
    outlineBtnDanger: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#FEF2F2",
    },
    outlineBtnTextDanger: {
        fontSize: 13,
        fontWeight: "600",
        color: "#EF4444",
    },
    addMandateBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    addMandateText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
});
