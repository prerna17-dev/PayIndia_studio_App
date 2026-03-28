import React, { useEffect, useRef } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const VOUCHERS = [
    { id: 1, name: "Amazon Pay", icon: "cart", library: "Ionicons", color: "#FF9900", bg: "#FFF7ED" },
    { id: 2, name: "Flipkart", icon: "cart", library: "Ionicons", color: "#2874F0", bg: "#F0F9FF" },
    { id: 3, name: "MakeMyTrip", icon: "airplane", library: "Ionicons", color: "#1976D2", bg: "#F0F9FF" },
    { id: 4, name: "Zomato", icon: "alpha-z", library: "MaterialCommunityIcons", color: "#E23744", bg: "#FFF1F2" },
    { id: 5, name: "Swiggy", icon: "hamburger", library: "MaterialCommunityIcons", color: "#F97316", bg: "#FFF7ED" },
    { id: 6, name: "BookMyShow", icon: "movie-open", library: "MaterialCommunityIcons", color: "#F84464", bg: "#FFF1F2" },
    { id: 7, name: "BigBasket", icon: "basket", library: "MaterialCommunityIcons", color: "#689F38", bg: "#F1F8E9" },
    { id: 8, name: "Starbucks", icon: "coffee", library: "MaterialCommunityIcons", color: "#00704A", bg: "#E8F5E9" },
    { id: 9, name: "Myntra", icon: "shopping", library: "MaterialCommunityIcons", color: "#FF3F6C", bg: "#FFF1F2" },
    { id: 10, name: "Nykaa", icon: "brush", library: "MaterialCommunityIcons", color: "#E91E63", bg: "#FCE4EC" },
    { id: 11, name: "Uber", icon: "car", library: "Ionicons", color: "#000000", bg: "#F1F5F9" },
    { id: 12, name: "Netflix", icon: "netflix", library: "MaterialCommunityIcons", color: "#E50914", bg: "#FEE2E2" },
];

export default function GiftCardsVouchersScreen() {
    const router = useRouter();
    
    // Animation refs for emojis
    const floatAnim1 = useRef(new Animated.Value(0)).current;
    const floatAnim2 = useRef(new Animated.Value(0)).current;
    const floatAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createFloatAnimation = (anim: Animated.Value, duration: number, delay: number) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: -15,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        createFloatAnimation(floatAnim1, 2000, 0);
        createFloatAnimation(floatAnim2, 2500, 500);
        createFloatAnimation(floatAnim3, 2200, 300);
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
                        <Text style={styles.headerTitle}>Gift Cards & Vouchers</Text>
                        <Text style={styles.headerSubtitle}>Gift the power of choice</Text>
                    </View>
                    <View style={{ width: 44 }} /> 
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionHeading}>Popular Brands</Text>
                    <View style={styles.grid}>
                        {VOUCHERS.map((voucher) => (
                            <TouchableOpacity key={voucher.id} style={styles.voucherItem} activeOpacity={0.8}>
                                <View style={[styles.iconWrapper, { backgroundColor: voucher.bg }]}>
                                    {voucher.library === "Ionicons" ? (
                                        <Ionicons name={voucher.icon as any} size={28} color={voucher.color} />
                                    ) : (
                                        <MaterialCommunityIcons name={voucher.icon as any} size={voucher.name === "Zomato" ? 34 : 28} color={voucher.color} />
                                    )}
                                </View>
                                <Text style={styles.voucherName}>{voucher.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.bannerContainer}>
                        <LinearGradient 
                            colors={['#F5F3FF', '#FCE7F3']} 
                            start={{ x: 0, y: 0 }} 
                            end={{ x: 1, y: 1 }}
                            style={styles.banner}
                        >
                            <View style={styles.bannerLeft}>
                                <Text style={styles.bannerTitle}>Occasion Gift Cards</Text>
                                <Text style={styles.bannerText}>Birthday, Wedding & More</Text>
                                <TouchableOpacity style={styles.exploreBtn}>
                                    <Text style={styles.exploreBtnText}>Explore all</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.emojiSpread}>
                                <Animated.Text style={[styles.emoji, styles.emoji1, { transform: [{ translateY: floatAnim1 }] }]}>🎂</Animated.Text>
                                <Animated.Text style={[styles.emoji, styles.emoji2, { transform: [{ translateY: floatAnim2 }] }]}>🎁</Animated.Text>
                                <Animated.Text style={[styles.emoji, styles.emoji3, { transform: [{ translateY: floatAnim3 }] }]}>💐</Animated.Text>
                            </View>
                            
                            <Ionicons name="gift" size={100} color="rgba(139, 92, 246, 0.08)" style={styles.bannerIcon} />
                        </LinearGradient>
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
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    scrollContent: {
        padding: 20,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    voucherItem: {
        width: (width - 70) / 3,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
        marginBottom: 5,
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    voucherName: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
    },
    bannerContainer: {
        marginTop: 40,
        marginBottom: 20,
    },
    banner: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        minHeight: 145,
        borderWidth: 1,
        borderColor: '#EDE9FE',
    },
    bannerLeft: {
        flex: 1,
        zIndex: 2,
    },
    bannerTitle: {
        color: '#1E293B',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bannerText: {
        color: '#64748B',
        fontSize: 13,
        marginBottom: 16,
    },
    exploreBtn: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    exploreBtnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emojiSpread: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 1,
    },
    emoji: {
        fontSize: 28,
        position: 'absolute',
    },
    emoji1: {
        top: 20,
        right: 80,
    },
    emoji2: {
        bottom: 25,
        right: 40,
    },
    emoji3: {
        top: 50,
        right: 20,
    },
    bannerIcon: {
        position: 'absolute',
        right: -15,
        top: -15,
        transform: [{ rotate: '15deg' }],
    },
});
