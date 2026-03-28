import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    Alert,
    BackHandler,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";
import Constants from "expo-constants";

interface Device {
    id: number;
    name: string;
    location: string;
    lastActive: string;
    isCurrentDevice: boolean;
    icon: string;
}

export default function ManageDevicesScreen() {
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    const defaultDeviceName = Platform.OS === 'ios' ? 'iOS Device' : (Platform.OS === 'android' ? 'Android Device' : 'Unknown Device');
    const currentDeviceName = Constants.deviceName || defaultDeviceName;
    const isDesktop = Platform.OS === 'windows' || Platform.OS === 'macos' || Platform.OS === 'web';
    const currentIcon = isDesktop ? 'laptop' : 'phone-portrait';

    // Sample devices data
    const [devices, setDevices] = useState<Device[]>([
        {
            id: 1,
            name: currentDeviceName,
            location: "Current Location",
            lastActive: "Active Now",
            isCurrentDevice: true,
            icon: currentIcon,
        },
        {
            id: 2,
            name: "Chrome on Windows",
            location: "Delhi, India",
            lastActive: "2 hours ago",
            isCurrentDevice: false,
            icon: "laptop",
        },
    ]);

    // Handle hardware back button
    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                router.push("/security");
                return true;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction
            );

            return () => backHandler.remove();
        }, [router])
    );

    const handleLogoutDevice = (device: Device) => {
        setSelectedDevice(device);
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        if (!selectedDevice) return;

        // Remove device from list
        setDevices(devices.filter((device) => device.id !== selectedDevice.id));
        setShowLogoutModal(false);
        Alert.alert("Success", `Logged out from ${selectedDevice.name}`);
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
                        onPress={() => router.push("/security")}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Logged-in Devices</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        {/* Info Card */}
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle" size={20} color="#2196F3" />
                            <Text style={styles.infoText}>
                                Manage all devices where you're currently logged in. You can logout from any device remotely.
                            </Text>
                        </View>

                        {/* Devices List */}
                        <View style={styles.devicesSection}>
                            {devices.map((device) => (
                                <View key={device.id} style={styles.deviceCard}>
                                    {/* Device Icon */}
                                    <View style={styles.deviceIconCircle}>
                                        <Ionicons name={device.icon as any} size={28} color="#2196F3" />
                                    </View>

                                    {/* Device Details */}
                                    <View style={styles.deviceDetails}>
                                        <Text style={styles.deviceName}>{device.name}</Text>

                                        <View style={styles.locationRow}>
                                            <Ionicons name="location" size={14} color="#666" />
                                            <Text style={styles.locationText}>{device.location}</Text>
                                        </View>

                                        <View style={styles.activeRow}>
                                            <Ionicons name="time" size={14} color="#666" />
                                            <Text style={styles.activeText}>
                                                Last Active: {device.lastActive}
                                            </Text>
                                        </View>

                                        {/* Current Device Badge */}
                                        {device.isCurrentDevice && (
                                            <View style={styles.currentDeviceBadge}>
                                                <View style={styles.activeIndicator} />
                                                <Text style={styles.currentDeviceText}>This Device</Text>
                                            </View>
                                        )}

                                        {/* Logout Button - Only for other devices */}
                                        {!device.isCurrentDevice && (
                                            <TouchableOpacity
                                                style={styles.logoutButton}
                                                onPress={() => handleLogoutDevice(device)}
                                            >
                                                <Ionicons name="log-out-outline" size={18} color="#E53935" />
                                                <Text style={styles.logoutButtonText}>Logout</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Security Tip */}
                        <View style={styles.tipCard}>
                            <View style={styles.tipHeader}>
                                <Ionicons name="bulb" size={20} color="#FF9800" />
                                <Text style={styles.tipTitle}>Security Tip</Text>
                            </View>
                            <Text style={styles.tipText}>
                                If you see a device you don't recognize, logout immediately and change your PIN.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Logout Confirmation Modal */}
                <Modal
                    visible={showLogoutModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowLogoutModal(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowLogoutModal(false)}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalIconCircle}>
                                <Ionicons name="log-out" size={32} color="#E53935" />
                            </View>

                            <Text style={styles.modalTitle}>Logout from this device?</Text>
                            <Text style={styles.modalMessage}>
                                {selectedDevice ? selectedDevice.name : "This device"} will be logged out. You'll need to login again on that device.
                            </Text>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowLogoutModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.confirmLogoutButton}
                                    onPress={confirmLogout}
                                >
                                    <Text style={styles.confirmLogoutButtonText}>Logout</Text>
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: "#F5F7FA",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 15,
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

    content: {
        padding: 20,
    },

    infoCard: {
        flexDirection: "row",
        backgroundColor: "#E3F2FD",
        padding: 16,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: "#BBDEFB",
        marginBottom: 20,
    },

    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#0D47A1",
        lineHeight: 18,
    },

    devicesSection: {
        marginBottom: 20,
    },

    deviceCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },

    deviceIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#E3F2FD",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    deviceDetails: {
        flex: 1,
    },

    deviceName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 6,
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 4,
    },

    locationText: {
        fontSize: 13,
        color: "#666",
    },

    activeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 8,
    },

    activeText: {
        fontSize: 13,
        color: "#666",
    },

    currentDeviceBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "#E8F5E9",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    activeIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4CAF50",
    },

    currentDeviceText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#4CAF50",
    },

    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "#FFEBEE",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },

    logoutButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#E53935",
    },

    tipCard: {
        backgroundColor: "#FFF3E0",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#FFE0B2",
    },

    tipHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },

    tipTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#E65100",
    },

    tipText: {
        fontSize: 13,
        color: "#E65100",
        lineHeight: 18,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    modalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },

    modalIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFEBEE",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 8,
        textAlign: "center",
    },

    modalMessage: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
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
        backgroundColor: "#F5F5F5",
        alignItems: "center",
    },

    cancelButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
    },

    confirmLogoutButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#E53935",
        alignItems: "center",
    },

    confirmLogoutButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});