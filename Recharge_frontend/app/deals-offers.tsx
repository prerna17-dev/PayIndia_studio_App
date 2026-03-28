import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const DEALS = [
    {
        id: 1,
        title: "Swiggy Munch",
        offer: "Flat ₹100 OFF",
        description: "On orders above ₹399",
        code: "PAYSWIGGY",
        expiry: "Ends in 3 days",
        colors: ["#FFF7ED", "#FFEDD5"] as [string, string],
        iconName: "hamburger",
        iconLibrary: "MaterialCommunityIcons",
        iconColor: "#F97316"
    },
    {
        id: 2,
        title: "Amazon Shopping",
        offer: "5% Cashback",
        description: "Up to ₹250 on first order",
        code: "PAYAMZ5",
        expiry: "Ends in 5 days",
        colors: ["#F0F9FF", "#E0F2FE"] as [string, string],
        iconName: "cart",
        iconLibrary: "Ionicons",
        iconColor: "#0284C7"
    },
    {
        id: 3,
        title: "MakeMyTrip Flights",
        offer: "Flat ₹1500 OFF",
        description: "On international flight bookings",
        code: "FLYINTL",
        expiry: "Limited period offer",
        colors: ["#FDF2F8", "#FCE7F3"] as [string, string],
        iconName: "airplane",
        iconLibrary: "Ionicons",
        iconColor: "#DB2777"
    },
    {
        id: 4,
        title: "Zomato Gold",
        offer: "Buy 1 Get 1 Free",
        description: "On Gold partner restaurants",
        code: "PAYGOLD",
        expiry: "Ends in 7 days",
        colors: ["#FFF1F2", "#FFE4E6"] as [string, string],
        iconName: "food-drumstick",
        iconLibrary: "MaterialCommunityIcons",
        iconColor: "#E11D48"
    },
    {
        id: 5,
        title: "Jio Recharge",
        offer: "Flat ₹50 OFF",
        description: "On recharges above ₹299",
        code: "JIO50",
        expiry: "Ends in 12 days",
        colors: ["#F5F3FF", "#EDE9FE"] as [string, string],
        iconName: "cellphone-check",
        iconLibrary: "MaterialCommunityIcons",
        iconColor: "#7C3AED"
    },
    {
        id: 6,
        title: "Uber Intercity",
        offer: "20% OFF",
        description: "Max discount up to ₹300",
        code: "UBERGO",
        expiry: "Limited time",
        colors: ["#F8FAFC", "#F1F5F9"] as [string, string],
        iconName: "car",
        iconLibrary: "Ionicons",
        iconColor: "#475569"
    }
];

export default function DealsOffersScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Deals & Offers</Text>
                        <Text style={styles.headerSubtitle}>Best savings just for you</Text>
                    </View>
                    <View style={{ width: 44 }} /> 
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.grid}>
                        {DEALS.map((deal) => (
                            <TouchableOpacity key={deal.id} style={styles.dealCard} activeOpacity={0.9}>
                                <LinearGradient
                                    colors={deal.colors}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.cardGradient}
                                >
                                    <View style={styles.cardTop}>
                                        <View style={styles.iconCircle}>
                                            {deal.iconLibrary === "Ionicons" ? (
                                                <Ionicons name={deal.iconName as any} size={18} color={deal.iconColor} />
                                            ) : (
                                                <MaterialCommunityIcons name={deal.iconName as any} size={18} color={deal.iconColor} />
                                            )}
                                        </View>
                                        <Text style={styles.dealExpiry}>{deal.expiry}</Text>
                                    </View>
                                    
                                    <Text style={styles.dealTitle}>{deal.title}</Text>
                                    <Text style={styles.dealOffer}>{deal.offer}</Text>
                                    <Text style={styles.dealDescription}>{deal.description}</Text>

                                    <View style={styles.promoBox}>
                                        <View style={styles.codeWrapper}>
                                            <Text style={styles.codeLabel}>CODE: </Text>
                                            <Text style={[styles.codeValue, { color: deal.iconColor }]}>{deal.code}</Text>
                                        </View>
                                        <TouchableOpacity style={[styles.claimBtn, { backgroundColor: deal.iconColor }]}>
                                            <Text style={styles.claimText}>Claim</Text>
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFD',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 5,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 1,
    },
    scrollContent: {
        padding: 16,
    },
    grid: {
        gap: 12,
    },
    dealCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
    },
    cardGradient: {
        padding: 12,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dealExpiry: {
        fontSize: 9,
        fontWeight: '600',
        color: '#94A3B8',
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    dealTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 2,
    },
    dealOffer: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
        marginBottom: 2,
    },
    dealDescription: {
        fontSize: 10,
        color: '#64748B',
        lineHeight: 14,
        marginBottom: 12,
    },
    promoBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 10,
        padding: 3,
        paddingLeft: 10,
    },
    codeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#94A3B8',
    },
    codeValue: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    claimBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    claimText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});
