import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SecurityScreen() {
    const router = useRouter();
    const [hasAppPin, setHasAppPin] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

    // Handle hardware back button - go to account screen
    useFocusEffect(
        React.useCallback(() => {
            const checkSecurityStatus = async () => {
                try {
                    const [pin, biometric] = await Promise.all([
                        AsyncStorage.getItem("@user_app_pin"),
                        AsyncStorage.getItem("@biometric_enabled")
                    ]);
                    setHasAppPin(!!pin);
                    setIsBiometricEnabled(biometric === "true");
                } catch (e) {
                    console.error("Error fetching security status", e);
                }
            };
            checkSecurityStatus();

            const backAction = () => {
                router.push("/account");
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction
            );

            return () => backHandler.remove();
        }, [router])
    );

    const handleBiometricToggle = async () => {
        try {
            const newValue = !isBiometricEnabled;
            
            if (newValue) {
                // Check if device supports biometric
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                
                if (!hasHardware || !isEnrolled) {
                    alert("Biometric authentication is not available or not set up on this device.");
                    return;
                }
            }

            setIsBiometricEnabled(newValue);
            await AsyncStorage.setItem("@biometric_enabled", newValue.toString());
        } catch (e) {
            console.error("Error toggling biometric", e);
        }
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
                    <Text style={styles.headerTitle}>Security</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Security Options Section */}
                    <View style={styles.section}>
                        {/* Set / Change App PIN */}
                        {hasAppPin ? (
                            <TouchableOpacity
                                style={styles.securityCard}
                                onPress={() => router.push("/change-pin")}
                            >
                                <View style={styles.cardLeft}>
                                    <View style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}>
                                        <MaterialCommunityIcons
                                            name="lock-reset"
                                            size={22}
                                            color="#1976D2"
                                        />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>Change App PIN</Text>
                                        <Text style={styles.cardSubtext}>
                                            Update your 4-digit security PIN
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.securityCard}
                                onPress={() => router.push("/set-pin")}
                            >
                                <View style={styles.cardLeft}>
                                    <View style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}>
                                        <MaterialCommunityIcons
                                            name="lock-plus"
                                            size={22}
                                            color="#1976D2"
                                        />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.cardTitle}>Set App PIN</Text>
                                        <Text style={styles.cardSubtext}>
                                            Create a 4-digit security PIN
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        )}

                        {/* Biometric Login */}
                        <View style={styles.securityCard}>
                            <View style={styles.cardLeft}>
                                <View style={[styles.iconCircle, { backgroundColor: "#F3E5F5" }]}>
                                    <MaterialCommunityIcons
                                        name="fingerprint"
                                        size={22}
                                        color="#9C27B0"
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.cardTitle}>Biometric Login</Text>
                                    <Text style={styles.cardSubtext}>
                                        {isBiometricEnabled ? "Enabled" : "Disabled"}
                                    </Text>
                                </View>
                            </View>
                            {/* Toggle Switch */}
                            <TouchableOpacity
                                style={styles.toggleSwitch}
                                onPress={handleBiometricToggle}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.toggleTrack,
                                        {
                                            backgroundColor: isBiometricEnabled ? "#4CAF50" : "#E0E0E0",
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.toggleThumb,
                                            {
                                                alignSelf: isBiometricEnabled ? "flex-end" : "flex-start",
                                            },
                                        ]}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Two-Step Verification */}
                        <TouchableOpacity
                            style={styles.securityCard}
                            onPress={() => router.push("/two-step-verification")}
                        >
                            <View style={styles.cardLeft}>
                                <View style={[styles.iconCircle, { backgroundColor: "#E8F5E9" }]}>
                                    <MaterialCommunityIcons
                                        name="shield-check"
                                        size={22}
                                        color="#4CAF50"
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.cardTitle}>Two-Step Verification</Text>
                                    <Text style={styles.cardSubtext}>Extra OTP protection</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>

                        {/* Manage Devices */}
                        <TouchableOpacity
                            style={styles.securityCard}
                            onPress={() => router.push("/manage-devices")}
                        >
                            <View style={styles.cardLeft}>
                                <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}>
                                    <MaterialCommunityIcons
                                        name="cellphone-link"
                                        size={22}
                                        color="#FF9800"
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.cardTitle}>Manage Devices</Text>
                                    <Text style={styles.cardSubtext}>View logged-in devices</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>

                        {/* Logout from All Devices */}
                        <TouchableOpacity style={styles.securityCard}>
                            <View style={styles.cardLeft}>
                                <View style={[styles.iconCircle, { backgroundColor: "#FFEBEE" }]}>
                                    <MaterialCommunityIcons
                                        name="logout-variant"
                                        size={22}
                                        color="#E53935"
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.cardTitle, { color: "#E53935" }]}>
                                        Logout from All Devices
                                    </Text>
                                    <Text style={styles.cardSubtext}>
                                        Sign out from all active sessions
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#E53935" />
                        </TouchableOpacity>
                    </View>

                    {/* Security Info */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle" size={20} color="#2196F3" />
                            <Text style={styles.infoText}>
                                Keep your account secure by regularly updating your PIN and
                                enabling biometric login for faster access.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
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

    // Security Cards Section
    section: {
        paddingHorizontal: 15,
        paddingTop: 20,
    },

    securityCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },

    cardLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },

    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },

    textContainer: {
        flex: 1,
    },

    cardTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 4,
    },

    cardSubtext: {
        fontSize: 12,
        color: "#666",
    },

    // Toggle Switch
    toggleSwitch: {
        marginLeft: 10,
    },

    toggleTrack: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: "center",
        paddingHorizontal: 3,
    },

    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
    },

    // Info Section
    infoSection: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
    },

    infoCard: {
        flexDirection: "row",
        backgroundColor: "#E3F2FD",
        padding: 16,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: "#BBDEFB",
    },

    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#0D47A1",
        lineHeight: 18,
    },
});