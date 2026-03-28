import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    Alert,
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function SettingsScreen() {
    const router = useRouter();

    // State
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [selectedTheme, setSelectedTheme] = useState("Light");

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

            return () => backHandler.remove();
        }, [router])
    );

    const handleBackPress = () => {
        router.push("/account");
    };

    // Handle Language Selection
    const handleLanguageChange = () => {
        Alert.alert("Select Language", "Choose your preferred language", [
            {
                text: "English",
                onPress: () => setSelectedLanguage("English"),
            },
            {
                text: "Hindi (हिंदी)",
                onPress: () => setSelectedLanguage("Hindi"),
            },
            {
                text: "Marathi (मराठी)",
                onPress: () => setSelectedLanguage("Marathi"),
            },
            {
                text: "Cancel",
                style: "cancel",
            },
        ]);
    };

    // Handle Theme Change
    const handleThemeChange = () => {
        Alert.alert("Select Theme", "Choose your preferred theme", [
            {
                text: "Light Mode",
                onPress: () => setSelectedTheme("Light"),
            },
            {
                text: "Dark Mode",
                onPress: () => setSelectedTheme("Dark"),
            },
            {
                text: "Cancel",
                style: "cancel",
            },
        ]);
    };

    // Handle Privacy Policy
    const handlePrivacyPolicy = () => {
        Alert.alert("Privacy Policy", "Opening privacy policy...");
        // In real app, navigate to privacy policy screen or web view
        // Linking.openURL('https://onlrecharge.com/privacy-policy');
    };

    // Handle About
    const handleAbout = () => {
        Alert.alert(
            "About PayIndia",
            "Version 1.0.0\n\n© 2026 PayIndia\nAll rights reserved.\n\nMade with ❤️ in India",
            [{ text: "OK" }],
        );
    };

    // Handle Delete Account
    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.\n\nAll your data will be permanently deleted.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert(
                            "Account Deleted",
                            "Your account has been deleted successfully.",
                        );
                        // In real app, call delete API and logout
                    },
                },
            ],
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
                        onPress={handleBackPress}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Notifications */}
                    <View style={styles.section}>
                        <View style={styles.settingCard}>
                            <View style={styles.settingLeft}>
                                <View
                                    style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}
                                >
                                    <Ionicons name="notifications" size={24} color="#FF9800" />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Notifications</Text>
                                    <Text style={styles.settingSubtext}>
                                        {notificationsEnabled ? "Enabled" : "Disabled"}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: "#E0E0E0", true: "#BBDEFB" }}
                                thumbColor={notificationsEnabled ? "#2196F3" : "#FFFFFF"}
                            />
                        </View>

                        {/* Language */}
                        <TouchableOpacity
                            style={styles.settingCard}
                            onPress={handleLanguageChange}
                        >
                            <View style={styles.settingLeft}>
                                <View
                                    style={[styles.iconCircle, { backgroundColor: "#E3F2FD" }]}
                                >
                                    <Ionicons name="language" size={24} color="#2196F3" />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Language</Text>
                                    <Text style={styles.settingSubtext}>{selectedLanguage}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>

                        {/* Theme Mode */}
                        <TouchableOpacity
                            style={styles.settingCard}
                            onPress={handleThemeChange}
                        >
                            <View style={styles.settingLeft}>
                                <View
                                    style={[styles.iconCircle, { backgroundColor: "#F3E5F5" }]}
                                >
                                    <Ionicons name="color-palette" size={24} color="#9C27B0" />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Theme Mode</Text>
                                    <Text style={styles.settingSubtext}>{selectedTheme}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>

                        {/* Privacy Policy */}
                        <TouchableOpacity
                            style={styles.settingCard}
                            onPress={handlePrivacyPolicy}
                        >
                            <View style={styles.settingLeft}>
                                <View
                                    style={[styles.iconCircle, { backgroundColor: "#E8F5E9" }]}
                                >
                                    <MaterialCommunityIcons
                                        name="shield-lock"
                                        size={24}
                                        color="#4CAF50"
                                    />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Privacy Policy</Text>
                                    <Text style={styles.settingSubtext}>
                                        View our privacy policy
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>

                        {/* About PayIndia */}
                        <TouchableOpacity style={styles.settingCard} onPress={handleAbout}>
                            <View style={styles.settingLeft}>
                                <View
                                    style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}
                                >
                                    <Ionicons
                                        name="information-circle"
                                        size={24}
                                        color="#FF9800"
                                    />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>About PayIndia</Text>
                                    <Text style={styles.settingSubtext}>Version 1.0.0</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* Delete Account - Separate Section */}
                    <View style={styles.dangerSection}>
                        <TouchableOpacity
                            style={styles.deleteCard}
                            onPress={handleDeleteAccount}
                        >
                            <View style={styles.settingLeft}>
                                <View
                                    style={[styles.iconCircle, { backgroundColor: "#FFEBEE" }]}
                                >
                                    <MaterialCommunityIcons
                                        name="delete-forever"
                                        size={24}
                                        color="#E53935"
                                    />
                                </View>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.deleteTitle}>Delete Account</Text>
                                    <Text style={styles.settingSubtext}>
                                        Permanently delete your account
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#E53935" />
                        </TouchableOpacity>
                    </View>

                    {/* App Info */}
                    <View style={styles.appInfo}>
                        <Text style={styles.appInfoText}>PayIndia</Text>
                        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
                        <Text style={styles.appInfoCopyright}>
                            © 2026 All Rights Reserved
                        </Text>
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
        fontSize: 20,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    placeholder: {
        width: 34,
    },

    scrollContent: {
        paddingBottom: 30,
    },

    // Settings Section
    section: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 16,
    },
    settingCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        flex: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 3,
    },
    settingSubtext: {
        fontSize: 13,
        color: "#666",
    },

    // Danger Section
    dangerSection: {
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    deleteCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        borderWidth: 1.5,
        borderColor: "#FFCDD2",
    },
    deleteTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#E53935",
        marginBottom: 3,
    },

    // App Info
    appInfo: {
        alignItems: "center",
        paddingTop: 40,
        paddingBottom: 20,
    },
    appInfoText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 6,
    },
    appInfoVersion: {
        fontSize: 13,
        color: "#999",
        marginBottom: 4,
    },
    appInfoCopyright: {
        fontSize: 12,
        color: "#999",
    },
});