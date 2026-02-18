import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    BackHandler,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BankAccount {
    id: number;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    isDefault: boolean;
    isVerified: boolean;
}

export default function BankAccountsScreen() {
    const router = useRouter();
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
    const [showOptionsModal, setShowOptionsModal] = useState(false);

    // Handle hardware back button - go to account screen
    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                router.push("/account");
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction
            );

            fetchAccounts();

            return () => backHandler.remove();
        }, [router])
    );

    const fetchAccounts = async () => {
        setIsLoading(true);
        setError("");
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch("http://192.168.1.26:5000/api/banking/accounts", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok) {
                // Map backend fields to frontend interface
                const mappedAccounts = data.map((acc: any) => ({
                    id: acc.account_id,
                    bankName: acc.bank_name,
                    accountNumber: `XXXX XXXX ${acc.account_number.slice(-4)}`,
                    ifscCode: acc.ifsc_code,
                    isDefault: acc.is_primary === 1,
                    isVerified: acc.is_verified === 1,
                }));
                setBankAccounts(mappedAccounts);
            } else {
                setError(data.message || "Failed to fetch accounts");
            }
        } catch (err) {
            console.error("Error fetching accounts:", err);
            setError("Server error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoreOptions = (account: BankAccount) => {
        setSelectedAccount(account);
        setShowOptionsModal(true);
    };

    const handleSetDefault = () => {
        if (!selectedAccount) return;
        setBankAccounts(
            bankAccounts.map((acc) => ({
                ...acc,
                isDefault: acc.id === selectedAccount.id,
            }))
        );
        setShowOptionsModal(false);
    };

    const handleRemoveAccount = () => {
        if (!selectedAccount) return;

        Alert.alert(
            "Remove Account",
            `Are you sure you want to remove your ${selectedAccount.bankName} account (${selectedAccount.accountNumber})?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const token = await AsyncStorage.getItem("userToken");
                            const response = await fetch("http://192.168.1.26:5000/api/banking/remove-account", {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    account_id: selectedAccount.id,
                                }),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                Alert.alert("Success", "Bank account removed successfully");
                                setBankAccounts(bankAccounts.filter((acc) => acc.id !== selectedAccount.id));
                            } else {
                                Alert.alert("Error", data.message || "Failed to remove account");
                            }
                        } catch (err) {
                            console.error("Error removing account:", err);
                            Alert.alert("Error", "Server error. Please try again later.");
                        } finally {
                            setIsLoading(false);
                            setShowOptionsModal(false);
                        }
                    },
                },
            ]
        );
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
                        onPress={() => router.push("/account")}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bank Accounts</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Linked Bank Accounts */}
                    <View style={styles.accountsSection}>
                        {isLoading ? (
                            <View style={styles.centerContainer}>
                                <ActivityIndicator size="large" color="#2196F3" />
                                <Text style={styles.loadingText}>Fetching accounts...</Text>
                            </View>
                        ) : error ? (
                            <View style={styles.centerContainer}>
                                <Ionicons name="alert-circle" size={48} color="#E53935" />
                                <Text style={styles.errorText}>{error}</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={fetchAccounts}>
                                    <Text style={styles.retryText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : bankAccounts.length > 0 ? (
                            bankAccounts.map((account) => (
                                <View key={account.id} style={styles.bankCardContainer}>
                                    <LinearGradient
                                        colors={["#E3F2FD", "#BBDEFB"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.bankCard}
                                    >
                                        {/* Top Row - Bank Icon and More Options */}
                                        <View style={styles.cardTopRow}>
                                            <View style={styles.bankIconCircle}>
                                                <MaterialCommunityIcons
                                                    name="bank"
                                                    size={32}
                                                    color="#0D47A1"
                                                />
                                            </View>
                                            <TouchableOpacity
                                                style={styles.moreButton}
                                                onPress={() => handleMoreOptions(account)}
                                            >
                                                <Ionicons
                                                    name="ellipsis-vertical"
                                                    size={20}
                                                    color="#0D47A1"
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Bank Name */}
                                        <Text style={styles.bankName}>{account.bankName}</Text>

                                        {/* Account Details */}
                                        <View style={styles.accountDetails}>
                                            <Text style={styles.detailLabel}>Account:</Text>
                                            <Text style={styles.detailValue}>
                                                {account.accountNumber}
                                            </Text>
                                        </View>

                                        <View style={styles.accountDetails}>
                                            <Text style={styles.detailLabel}>IFSC:</Text>
                                            <Text style={styles.detailValue}>{account.ifscCode}</Text>
                                        </View>

                                        {/* Status Badges */}
                                        <View style={styles.badgesRow}>
                                            {account.isVerified && (
                                                <View style={styles.verifiedBadge}>
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={16}
                                                        color="#4CAF50"
                                                    />
                                                    <Text style={styles.verifiedText}>Verified</Text>
                                                </View>
                                            )}
                                            {account.isDefault && (
                                                <View style={styles.defaultBadge}>
                                                    <Text style={styles.defaultText}>Default</Text>
                                                </View>
                                            )}
                                        </View>
                                    </LinearGradient>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="card-outline" size={60} color="#999" />
                                <Text style={styles.emptyText}>No linked bank accounts found</Text>
                            </View>
                        )}
                    </View>

                    {/* Add New Account Button */}
                    <View style={styles.addButtonContainer}>
                        <TouchableOpacity
                            style={styles.addNewButton}
                            onPress={() => router.push("/select-bank")}
                        >
                            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                            <Text style={styles.addNewButtonText}>
                                Add Another Bank Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Options Bottom Sheet Modal */}
                <Modal
                    visible={showOptionsModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowOptionsModal(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowOptionsModal(false)}
                    >
                        <View style={styles.bottomSheet}>
                            <View style={styles.sheetHeader}>
                                <View style={styles.sheetHandle} />
                            </View>

                            {/* Set as Default - Only show if not already default */}
                            {selectedAccount && !selectedAccount.isDefault && (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={handleSetDefault}
                                >
                                    <Ionicons name="star-outline" size={22} color="#2196F3" />
                                    <Text style={styles.optionText}>Set as Default</Text>
                                </TouchableOpacity>
                            )}

                            {/* Remove Account */}
                            <TouchableOpacity
                                style={styles.optionItem}
                                onPress={handleRemoveAccount}
                            >
                                <Ionicons name="trash-outline" size={22} color="#E53935" />
                                <Text style={[styles.optionText, { color: "#E53935" }]}>
                                    Remove Account
                                </Text>
                            </TouchableOpacity>

                            {/* Cancel */}
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowOptionsModal(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
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
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    placeholder: {
        width: 34,
    },

    // Bank Accounts Section
    accountsSection: {
        padding: 20,
    },

    bankCardContainer: {
        marginBottom: 15,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },

    bankCard: {
        padding: 16,
    },

    cardTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },

    bankIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },

    moreButton: {
        padding: 5,
    },

    bankName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0D47A1",
        marginBottom: 12,
    },

    accountDetails: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },

    detailLabel: {
        fontSize: 13,
        color: "#0D47A1",
        opacity: 0.7,
        width: 70,
    },

    detailValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0D47A1",
        flex: 1,
    },

    badgesRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },

    verifiedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    verifiedText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4CAF50",
    },

    defaultBadge: {
        backgroundColor: "#FFF3E0",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    defaultText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FF9800",
    },

    // Add New Account Button
    addButtonContainer: {
        padding: 20,
        paddingTop: 0,
    },

    addNewButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0D47A1",
        paddingVertical: 14,
        borderRadius: 25,
        gap: 10,
        shadowColor: "#0D47A1",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },

    addNewButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },

    // Bottom Sheet Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },

    bottomSheet: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 30,
    },

    sheetHeader: {
        alignItems: "center",
        paddingVertical: 12,
    },

    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#E0E0E0",
        borderRadius: 2,
    },

    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },

    optionText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1A1A1A",
    },

    cancelButton: {
        marginTop: 10,
        marginHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        alignItems: "center",
    },

    cancelText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    centerContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: "#666",
    },
    errorText: {
        marginTop: 10,
        fontSize: 15,
        color: "#E53935",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: "#2196F3",
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 15,
    },
});