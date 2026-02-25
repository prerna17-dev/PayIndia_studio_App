import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function RationCardServicesScreen() {
    const router = useRouter();
    const { from } = useLocalSearchParams();
    const backPath = from === "more-seva" ? "/more-seva" : "/(tabs)/explore";

    // Handle hardware back button
    useEffect(() => {
        const backAction = () => {
            router.replace(backPath as any);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction,
        );

        return () => backHandler.remove();
    }, [backPath]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace(backPath as any)}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Ration Card Services</Text>
                        <Text style={styles.headerSubtitle}>
                            Apply for new ration card or update existing details
                        </Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Authority Information Card (Aadhaar Style) */}
                    <View style={styles.authorityCard}>
                        <View style={styles.accentBorder} />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconCircle}>
                                    <MaterialCommunityIcons
                                        name="food-apple"
                                        size={28}
                                        color="#D32F2F"
                                    />
                                </View>
                                <View style={styles.titleSection}>
                                    <Text style={styles.cardTitle}>Public Distribution System (PDS)</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Authorized Support Center for Ration Card Applications
                                    </Text>
                                </View>
                            </View>

                            {/* Trust Badges */}
                            <View style={styles.badgesRow}>
                                {[
                                    { icon: "shield-check", label: "Secure Application" },
                                    { icon: "file-document-edit-outline", label: "Document Assisted" },
                                    { icon: "account-group-outline", label: "Family Management" },
                                    { icon: "bank", label: "State-Level Processing" },
                                ].map((badge, index) => (
                                    <View key={index} style={styles.badge}>
                                        <MaterialCommunityIcons
                                            name={badge.icon as any}
                                            size={16}
                                            color="#2E7D32"
                                        />
                                        <Text style={styles.badgeText}>{badge.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Service Card 1 – NEW RATION CARD */}
                    <View style={styles.serviceCard}>
                        <View style={styles.serviceGradient}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={styles.serviceIconContainer}>
                                    <MaterialCommunityIcons
                                        name="card-account-details-outline"
                                        size={28}
                                        color="#0D47A1"
                                    />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>New Ration Card</Text>
                                    <Text style={styles.serviceMarathi}>नवीन रेशन कार्ड</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>
                                    Apply for a new family ration card
                                </Text>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => router.push("/new-ration-card")}
                                >
                                    <Text style={styles.actionButtonText}>Start Application</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#0D47A1" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Service Card 2 – UPDATE / ADD MEMBER */}
                    <View style={styles.serviceCard}>
                        <View style={[styles.serviceGradient, { backgroundColor: '#F1F8E9' }]}>
                            <View style={styles.serviceHeaderRow}>
                                <View style={[styles.serviceIconContainer, { backgroundColor: '#FFF' }]}>
                                    <MaterialCommunityIcons
                                        name="account-multiple-plus-outline"
                                        size={28}
                                        color="#2E7D32"
                                    />
                                </View>
                                <View style={styles.serviceContent}>
                                    <Text style={styles.serviceTitle}>Update / Add Member</Text>
                                    <Text style={styles.serviceMarathi}>नाव वाढवणे / बदल</Text>
                                </View>
                            </View>

                            <View style={styles.serviceBottomRow}>
                                <Text style={styles.serviceDesc}>
                                    Modify family details, add or remove members, update address
                                </Text>
                                <TouchableOpacity
                                    style={[styles.actionButton, { borderColor: '#A5D6A7', backgroundColor: '#E8F5E9' }]}
                                    onPress={() => router.push("/update-ration-card")}
                                >
                                    <Text style={[styles.actionButtonText, { color: '#2E7D32' }]}>Update Details</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#2E7D32" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Important Note Section */}
                    <View style={styles.noteCard}>
                        <View style={styles.noteHeader}>
                            <Ionicons name="information-circle" size={20} color="#0D47A1" />
                            <Text style={styles.noteTitle}>Important Note</Text>
                        </View>
                        <Text style={styles.noteText}>
                            Approval depends on verification by local food supply authority.
                            Physical verification may be required.
                        </Text>
                    </View>

                    <View style={{ height: 20 }} />
                </ScrollView>
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
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        padding: 5,
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    headerSubtitle: {
        fontSize: 11,
        color: "#666",
        marginTop: 2,
    },
    placeholder: {
        width: 34,
    },
    scrollContent: {
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    authorityCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: "hidden",
    },
    accentBorder: {
        width: 4,
        backgroundColor: "#D32F2F",
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFEBEE",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    titleSection: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 11,
        color: "#666",
    },
    badgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    badgeText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    serviceCard: {
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        overflow: "hidden",
    },
    serviceGradient: {
        backgroundColor: "#F0F7FF",
        padding: 16,
    },
    serviceHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },
    serviceIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    serviceContent: {
        flex: 1,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 2,
    },
    serviceMarathi: {
        fontSize: 12,
        color: "#666",
    },
    serviceBottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    serviceDesc: {
        flex: 1,
        fontSize: 12,
        color: "#777",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#E3F2FD",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#BBDEFB",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#0D47A1",
    },
    noteCard: {
        backgroundColor: "#FFF9E6",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#FFE0B2",
    },
    noteHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    noteText: {
        fontSize: 12,
        color: "#666",
        lineHeight: 18,
    },
});
