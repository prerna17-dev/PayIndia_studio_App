import React, { useState, useRef, useEffect } from 'react';
import {
    ActivityIndicator,
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Animated,
    Easing,
    Clipboard,
    Share,
    Platform,
    LayoutAnimation,
    UIManager
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ReferEarnScreen() {
    const router = useRouter();
    const [referralData, setReferralData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [termsExpanded, setTermsExpanded] = useState(false);

    // Animation values
    const floatAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchReferralInfo = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(API_ENDPOINTS.REFERRAL_INFO, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setReferralData(data);
            }
        } catch (error) {
            console.error("Error fetching referral info:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralInfo();

        // Hero float animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -10,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();

        // Entrance animation
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const referralCode = referralData?.referralCode || "PayIndia";

    const copyToClipboard = () => {
        Clipboard.setString(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareCode = async () => {
        try {
            await Share.share({
                message: `Hey! Sign up using my referral code ${referralCode} and we both earn cashback! 🎁`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const toggleTerms = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setTermsExpanded(!termsExpanded);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            {/* Top App Bar */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Refer & Earn</Text>
                <TouchableOpacity style={styles.shareButton} onPress={shareCode}>
                    <Ionicons name="share-social-outline" size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Hero Reward Card */}
                <Animated.View style={[styles.heroCardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={['#F3E8FF', '#EBEBFF', '#DBEAFE']} // Pastel purple to pastel blue
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroHeader}>
                            <Animated.Text style={[styles.heroTitle, { transform: [{ translateY: floatAnim }] }]}>
                                🎁 Refer Friends & Earn ₹100
                            </Animated.Text>
                            <Text style={styles.heroSubtitle}>
                                Invite your friends and earn cashback when they complete their first transaction.
                            </Text>
                        </View>

                        <View style={styles.benefitsRow}>
                            <View style={styles.benefitBox}>
                                <View style={styles.benefitIconBox}>
                                    <Ionicons name="wallet" size={20} color="#3B82F6" />
                                </View>
                                <Text style={styles.benefitText}>You Earn</Text>
                                <Text style={styles.benefitAmount}>₹100</Text>
                                <Text style={styles.benefitSubtext}>per referral</Text>
                            </View>

                            <View style={styles.benefitDivider} />

                            <View style={styles.benefitBox}>
                                <View style={styles.benefitIconBox}>
                                    <Ionicons name="gift" size={20} color="#3B82F6" />
                                </View>
                                <Text style={styles.benefitText}>Friend Gets</Text>
                                <Text style={styles.benefitAmount}>₹50</Text>
                                <Text style={styles.benefitSubtext}>bonus</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.inviteButton} onPress={shareCode}>
                            <Text style={styles.inviteButtonText}>Invite Now</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* Your Referral Code Section */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>Your Referral Code</Text>
                    <View style={styles.codeCard}>
                        <View style={styles.codeRow}>
                            <Text style={styles.codeLabel}>REF CODE:</Text>
                            <Text style={styles.codeValue}>{referralCode}</Text>
                        </View>

                        <View style={styles.codeActions}>
                            <TouchableOpacity
                                style={[styles.codeActionButton, copied && styles.codeActionSuccess]}
                                onPress={copyToClipboard}
                            >
                                <Ionicons name={copied ? "checkmark-circle" : "copy-outline"} size={20} color={copied ? "#16A34A" : "#9333EA"} />
                                <Text style={[styles.codeActionText, copied && styles.codeActionTextSuccess]}>
                                    {copied ? "Copied!" : "Copy Code"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.codeActionButtonPrimary} onPress={shareCode}>
                                <Ionicons name="share-social" size={20} color="#FFF" />
                                <Text style={styles.codeActionTextPrimary}>Share Code</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.codeHintText}>Share this code with your friends to earn rewards.</Text>
                    </View>
                </Animated.View>

                {/* Referral Stats Section */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>Your Earnings</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, styles.statCardTotal]}>
                            <Text style={[styles.statValue, styles.statValueTotal]}>
                                {referralData?.stats?.total_referrals || 0}
                            </Text>
                            <Text style={styles.statLabel}>Total{'\n'}Referrals</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardSuccess]}>
                            <Text style={[styles.statValue, styles.statValueSuccess]}>
                                {referralData?.stats?.successful_referrals || 0}
                            </Text>
                            <Text style={styles.statLabel}>Successful{'\n'}Referrals</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardEarnings]}>
                            <Text style={styles.statValueEarnings}>
                                ₹{referralData?.stats?.total_earnings || 0}
                            </Text>
                            <Text style={styles.statLabelEarnings}>Total{'\n'}Earnings</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* How It Works Section */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    <View style={styles.timelineCard}>

                        <View style={styles.timelineStep}>
                            <View style={styles.timelineIconContainer}>
                                <Text style={styles.stepNumber}>1</Text>
                                <View style={styles.timelineLine} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Share your referral code</Text>
                                <Text style={styles.timelineDesc}>Share your unique link or code with friends.</Text>
                            </View>
                        </View>

                        <View style={styles.timelineStep}>
                            <View style={styles.timelineIconContainer}>
                                <Text style={styles.stepNumber}>2</Text>
                                <View style={styles.timelineLine} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Friend signs up</Text>
                                <Text style={styles.timelineDesc}>Friend creates a new account using your code.</Text>
                            </View>
                        </View>

                        <View style={styles.timelineStep}>
                            <View style={styles.timelineIconContainer}>
                                <Text style={styles.stepNumber}>3</Text>
                                <View style={styles.timelineLine} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>First transaction</Text>
                                <Text style={styles.timelineDesc}>Friend completes a mobile recharge or bill payment.</Text>
                            </View>
                        </View>

                        <View style={styles.timelineStep}>
                            <View style={styles.timelineIconContainer}>
                                <Text style={styles.stepNumber}>4</Text>
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>Both receive cashback!</Text>
                                <Text style={styles.timelineDesc}>Cashback is directly added to your wallets.</Text>
                            </View>
                        </View>

                    </View>
                </Animated.View>

                {/* Referral History Section */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Recent Referrals</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.historyCard}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#3B82F6" style={{ marginVertical: 20 }} />
                        ) : referralData?.recentReferrals?.length > 0 ? (
                            referralData.recentReferrals.map((item: any, index: number) => (
                                <React.Fragment key={item.referral_id}>
                                    <View style={styles.historyItem}>
                                        <View style={styles.historyUser}>
                                            <View style={[styles.avatarPlaceholder, { backgroundColor: index % 2 === 0 ? '#E8F5E9' : '#FFEDD5' }]}>
                                                <Text style={[styles.avatarText, { color: index % 2 === 0 ? '#2E7D32' : '#F97316' }]}>
                                                    {(item.referred_user_name || "U")[0].toUpperCase()}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.historyName}>{item.referred_user_name || item.referred_user_mobile}</Text>
                                                <Text style={item.status === 'SUCCESS' ? styles.historyStatusSuccess : styles.historyStatusPending}>
                                                    {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={item.status === 'SUCCESS' ? styles.historyAmountText : styles.historyAmountPending}>
                                            {item.status === 'SUCCESS' ? `+₹${item.reward_amount}` : '-'}
                                        </Text>
                                    </View>
                                    {index < referralData.recentReferrals.length - 1 && <View style={styles.historyDivider} />}
                                </React.Fragment>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No referrals yet</Text>
                                <Text style={styles.emptySubtext}>Invite your friends to start earning!</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Terms & Conditions */}

                {/* Terms & Conditions */}
                <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.termsHeader} onPress={toggleTerms}>
                        <View style={styles.termsHeaderLeft}>
                            <Ionicons name="document-text-outline" size={20} color="#666" />
                            <Text style={styles.termsTitle}>Terms & Conditions</Text>
                        </View>
                        <Ionicons name={termsExpanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                    </TouchableOpacity>
                    {termsExpanded && (
                        <View style={styles.termsContent}>
                            <View style={styles.termItem}>
                                <View style={styles.bulletPoint} />
                                <Text style={styles.termText}>Reward credited within 24 hours of successful transaction.</Text>
                            </View>
                            <View style={styles.termItem}>
                                <View style={styles.bulletPoint} />
                                <Text style={styles.termText}>Maximum 10 referrals allowed per month.</Text>
                            </View>
                            <View style={styles.termItem}>
                                <View style={styles.bulletPoint} />
                                <Text style={styles.termText}>Fraudulent activity leads to immediate disqualification.</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>

                {/* Trust Strip */}
                <Animated.View style={[styles.trustStrip, { opacity: fadeAnim }]}>
                    <View style={styles.trustItem}>
                        <Ionicons name="flash" size={16} color="#4CAF50" />
                        <Text style={styles.trustText}>Instant Cashback</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <MaterialCommunityIcons name="shield-check" size={16} color="#4CAF50" />
                        <Text style={styles.trustText}>Secure Tracking</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                        <Text style={styles.trustText}>No Hidden Charges</Text>
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    shareButton: {
        padding: 8,
        marginRight: -8,
    },
    scrollContent: {
        padding: 16,
    },
    heroCardContainer: {
        marginBottom: 20,
        shadowColor: "#3B82F6", // Match blue/purple shadow
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
    },
    heroHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A', // Black text for better contrast
        marginBottom: 10,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#4B5563', // Dark gray for subtitle
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    benefitsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.4)', // Slightly more opaque white for the inner box
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    benefitBox: {
        flex: 1,
        alignItems: 'center',
    },
    benefitDivider: {
        width: 1,
        height: '80%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Darker divider for contrast
        marginHorizontal: 16,
    },
    benefitIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    benefitText: {
        fontSize: 13,
        color: '#4B5563', // Dark text
        marginBottom: 4,
    },
    benefitAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A', // Black text
        marginBottom: 2,
    },
    benefitSubtext: {
        fontSize: 11,
        color: '#6B7280', // Medium gray
    },
    inviteButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    inviteButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3B82F6', // Blue text for button
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    codeCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF', // Very light blue
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE', // Light blue border
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    codeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
        marginRight: 8,
    },
    codeValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#3B82F6',
        letterSpacing: 2,
    },
    codeActions: {
        flexDirection: 'row',
        gap: 12,
    },
    codeActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#DBEAFE', // Pastel blue button
        gap: 8,
    },
    codeActionSuccess: {
        backgroundColor: '#DCFCE7',
    },
    codeActionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    codeActionTextSuccess: {
        color: '#16A34A',
    },
    codeActionButtonPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#3B82F6', // Stronger blue primary button
        gap: 8,
    },
    codeActionTextPrimary: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    codeHintText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
    },
    statCardTotal: {
        backgroundColor: '#F5F3FF',
        borderColor: '#EDE9FE',
    },
    statCardSuccess: {
        backgroundColor: '#DCFCE7',
        borderColor: '#86EFAC',
    },
    statCardEarnings: {
        backgroundColor: '#FEF9C3',
        borderColor: '#FDE047',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
    },
    statValueTotal: {
        color: '#3B82F6',
    },
    statValueSuccess: {
        color: '#16A34A',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '600',
    },
    statValueEarnings: {
        fontSize: 24,
        fontWeight: '800',
        color: '#D97706',
        marginBottom: 8,
    },
    statLabelEarnings: {
        fontSize: 12,
        color: '#B45309',
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '600',
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    historyButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#3B82F6',
    },
    timelineCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    timelineStep: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    timelineIconContainer: {
        alignItems: 'center',
        width: 32,
        marginRight: 16,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EFF6FF',
        color: '#3B82F6',
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 28,
        fontSize: 14,
        zIndex: 2,
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: '#EFF6FF',
        minHeight: 30,
        marginTop: -4,
        marginBottom: -4,
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 24,
        marginTop: 2,
    },
    timelineTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    timelineDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    historyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    historyDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 12,
    },
    historyUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2E7D32',
    },
    historyName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    historyStatusSuccess: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
    },
    historyStatusPending: {
        fontSize: 12,
        color: '#F57C00',
        fontWeight: '500',
    },
    historyAmountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4CAF50',
    },
    historyAmountPending: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#94A3B8',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
        textAlign: 'center',
    },
    termsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 12,
    },
    termsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    termsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    termsContent: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderWidth: 1,
        borderColor: '#F5F5F5',
        borderTopWidth: 0,
        marginTop: -4,
        paddingTop: 12,
    },
    termItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 8,
    },
    bulletPoint: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#999',
        marginTop: 6,
    },
    termText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    trustStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginTop: 10,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
});
