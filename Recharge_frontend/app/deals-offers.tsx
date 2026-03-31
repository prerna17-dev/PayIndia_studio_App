import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const DEALS = [
    {
        id: 1,
        title: "Electricity Bill",
        offer: "Flat ₹50 Cashback",
        description: "On bill payments above ₹800",
        code: "POWER50",
        expiry: "Ends in 3 days",
        colors: ["#FFF7ED", "#FFEDD5"] as [string, string], // Amber
        iconName: "bulb",
        iconLibrary: "Ionicons",
        iconColor: "#D97706"
    },
    {
        id: 2,
        title: "Mobile Recharge",
        offer: "10% Cashback",
        description: "Get up to ₹100 on all recharges",
        code: "MOBILE10",
        expiry: "Ends in 5 days",
        colors: ["#F0F9FF", "#E0F2FE"] as [string, string], // Sky
        iconName: "phone-portrait",
        iconLibrary: "Ionicons",
        iconColor: "#0284C7"
    },
    {
        id: 4,
        title: "DTH Recharge",
        offer: "Save Flat ₹75",
        description: "On select DTH operators",
        code: "DTHSAVE",
        expiry: "Ends in 7 days",
        colors: ["#F0FDF4", "#DCFCE7"] as [string, string], // Green
        iconName: "satellite-variant",
        iconLibrary: "MaterialCommunityIcons",
        iconColor: "#16A34A"
    },
    {
        id: 5,
        title: "LPG Gas",
        offer: "₹40 Cashback",
        description: "On first gas booking via app",
        code: "GAS40",
        expiry: "Ends in 12 days",
        colors: ["#FFF1F2", "#FFE4E6"] as [string, string], // Rose
        iconName: "gas-cylinder",
        iconLibrary: "MaterialCommunityIcons",
        iconColor: "#E11D48"
    },
    {
        id: 6,
        title: "Fastag",
        offer: "1% Reward",
        description: "On top-ups above ₹1000",
        code: "FASTAG1",
        expiry: "Limited time",
        colors: ["#F8FAFC", "#F1F5F9"] as [string, string], // Slate
        iconName: "card",
        iconLibrary: "Ionicons",
        iconColor: "#475569"
    }
];

export default function DealsOffersScreen() {
    const router = useRouter();
    const fadeAnims = useRef(DEALS.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const animations = fadeAnims.map((anim: Animated.Value, index: number) => {
            return Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            });
        });
        Animated.stagger(100, animations).start();
    }, []);

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
                        {DEALS.map((deal, index) => (
                            <Animated.View 
                                key={deal.id} 
                                style={{ 
                                    opacity: fadeAnims[index],
                                    transform: [{
                                        translateY: fadeAnims[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0]
                                        })
                                    }]
                                }}
                            >
                                <TouchableOpacity style={styles.dealCard} activeOpacity={0.9}>
                                    <LinearGradient
                                        colors={deal.colors}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.cardGradient}
                                    >
                                        <View style={styles.cardLeft}>
                                            <View style={styles.iconCircle}>
                                                {deal.iconLibrary === "Ionicons" ? (
                                                    <Ionicons name={deal.iconName as any} size={18} color={deal.iconColor} />
                                                ) : (
                                                    <MaterialCommunityIcons name={deal.iconName as any} size={18} color={deal.iconColor} />
                                                )}
                                            </View>
                                            <View style={styles.cardInfo}>
                                                <Text style={styles.dealTitle}>{deal.title}</Text>
                                                <Text style={styles.dealOffer}>{deal.offer}</Text>
                                            </View>
                                        </View>
                                        
                                        <View style={styles.cardRight}>
                                            <View style={styles.promoContainer}>
                                                <Text style={styles.promoText}>{deal.code}</Text>
                                            </View>
                                            <TouchableOpacity style={[styles.claimBtn, { backgroundColor: deal.iconColor }]}>
                                                <Text style={styles.claimText}>Claim</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
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
        gap: 10,
    },
    dealCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        backgroundColor: '#FFFFFF',
        height: 85,
    },
    cardGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardInfo: {
        flex: 1,
    },
    dealTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 1,
    },
    dealOffer: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    promoContainer: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    promoText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#475569',
        letterSpacing: 0.5,
    },
    claimBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
    },
    claimText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});
