import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../constants/api";

interface Bank {
    bank_id: string;
    bank_name: string;
    bank_code: string;
    active: string;
}

const POPULAR_BANKS = [
    { id: "11", name: "Axis Bank", icon: "bank", color: "#971C4B" },
    { id: "35", name: "HDFC Bank", icon: "bank", color: "#1D4A94" },
    { id: "37", name: "ICICI Bank", icon: "bank", color: "#F37021" },
    { id: "85", name: "State Bank of India", icon: "bank", color: "#2196F3" },
    { id: "75", name: "Punjab National Bank", icon: "bank", color: "#ED1C24" },
    { id: "13", name: "Bank of Baroda", icon: "bank", color: "#F06122" },
];

export default function SelectBankScreen() {
    const router = useRouter();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        setIsLoading(true);
        setError("");
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(API_ENDPOINTS.BANK_LIST, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok && data.banks) {
                setBanks(data.banks);
                setFilteredBanks(data.banks);
            } else {
                setError(data.message || "Failed to fetch bank list");
            }
        } catch (err) {
            console.error("Error fetching banks:", err);
            setError("Server error. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setFilteredBanks(banks);
        } else {
            const filtered = banks.filter((bank) =>
                bank.bank_name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredBanks(filtered);
        }
    };

    const handleBankSelect = (bank: Bank) => {
        router.push({
            pathname: "/add-bank-account",
            params: {
                bankName: bank.bank_name,
                bankId: bank.bank_id
            },
        });
    };

    const renderBankItem = ({ item }: { item: Bank }) => (
        <TouchableOpacity
            style={styles.bankItem}
            onPress={() => handleBankSelect(item)}
        >
            <View style={styles.bankIconCircle}>
                <MaterialCommunityIcons name="bank" size={24} color="#1976D2" />
            </View>
            <Text style={styles.bankName}>{item.bank_name}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace("/account")}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Select Bank</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for your bank"
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch("")}>
                                <Ionicons name="close-circle" size={20} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Bank List */}
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#2196F3" />
                        <Text style={styles.loadingText}>Fetching banks...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle" size={48} color="#E53935" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={fetchBanks}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredBanks}
                        renderItem={renderBankItem}
                        keyExtractor={(item) => item.bank_id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            searchQuery.trim() === "" ? (
                                <View style={styles.listHeader}>
                                    <Text style={styles.sectionHeader}>Select your bank</Text>
                                    <View style={styles.popularGrid}>
                                        {POPULAR_BANKS.map((bank) => (
                                            <TouchableOpacity
                                                key={bank.id}
                                                style={styles.popularBankItem}
                                                onPress={() => handleBankSelect({ bank_id: bank.id, bank_name: bank.name, bank_code: "", active: "1" })}
                                            >
                                                <View style={styles.popularBankIconCircle}>
                                                    <MaterialCommunityIcons name={bank.icon as any} size={28} color={bank.color} />
                                                </View>
                                                <Text style={styles.popularBankName} numberOfLines={2}>
                                                    {bank.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <Text style={styles.sectionHeader}>All banks</Text>
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No banks found for "{searchQuery}"</Text>
                            </View>
                        }
                    />
                )}
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
    searchContainer: {
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#333",
    },
    listContent: {
        paddingBottom: 20,
    },
    listHeader: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 15,
        marginTop: 10,
    },
    popularGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    popularBankItem: {
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    popularBankIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8F9FA",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    popularBankName: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: "#1A1A1A",
    },
    bankItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    bankIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8F9FA",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    bankName: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
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
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
    },
});
