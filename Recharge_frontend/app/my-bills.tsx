import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Image,
} from 'react-native';

interface Bill {
    id: string;
    category: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    provider: string;
    consumerNumber: string;
    amount: string;
    dueDate?: string;
    paidDate?: string;
    status: 'pending' | 'paid' | 'overdue';
}

const MOCK_BILLS: Bill[] = [
    {
        id: '1',
        category: 'Electricity',
        icon: 'flash',
        iconBg: '#FFF3E0',
        iconColor: '#FF9800',
        provider: 'TNEB Limited',
        consumerNumber: '04234567890',
        amount: '₹1,450',
        dueDate: '25 Feb 2026',
        status: 'pending',
    },
    {
        id: '2',
        category: 'Postpaid',
        icon: 'phone-portrait',
        iconBg: '#E3F2FD',
        iconColor: '#2196F3',
        provider: 'Airtel Mobile',
        consumerNumber: '9876543210',
        amount: '₹799',
        dueDate: '20 Feb 2026',
        status: 'overdue',
    },
    {
        id: '3',
        category: 'Broadband',
        icon: 'wifi',
        iconBg: '#E8F5E9',
        iconColor: '#4CAF50',
        provider: 'ACT Fibernet',
        consumerNumber: 'ACT12345678',
        amount: '₹899',
        paidDate: '10 Feb 2026',
        status: 'paid',
    },
    {
        id: '4',
        category: 'DTH',
        icon: 'tv',
        iconBg: '#F3E5F5',
        iconColor: '#9C27B0',
        provider: 'Tata Play',
        consumerNumber: '1092837465',
        amount: '₹350',
        paidDate: '05 Feb 2026',
        status: 'paid',
    },
];

export default function MyBillsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'paid'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBills = MOCK_BILLS.filter(bill => {
        const matchesTab = activeTab === 'upcoming'
            ? (bill.status === 'pending' || bill.status === 'overdue')
            : bill.status === 'paid';
        const matchesSearch = bill.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'overdue': return '#F44336';
            case 'pending': return '#FF9800';
            case 'paid': return '#4CAF50';
            default: return '#666';
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Custom Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Bills</Text>
                    <TouchableOpacity style={styles.addIcon} onPress={() => router.push('/add-all-bills')}>
                        <Ionicons name="add-circle-outline" size={26} color="#2196F3" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by provider or category"
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
                        {activeTab === 'upcoming' && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'paid' && styles.activeTab]}
                        onPress={() => setActiveTab('paid')}
                    >
                        <Text style={[styles.tabText, activeTab === 'paid' && styles.activeTabText]}>Paid</Text>
                        {activeTab === 'paid' && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {filteredBills.length > 0 ? (
                        <View style={styles.billsList}>
                            {filteredBills.map((bill) => (
                                <View key={bill.id} style={styles.billCard}>
                                    <View style={styles.billTop}>
                                        <View style={[styles.iconCircle, { backgroundColor: bill.iconBg }]}>
                                            <Ionicons name={bill.icon as any} size={24} color={bill.iconColor} />
                                        </View>
                                        <View style={styles.billMainInfo}>
                                            <View style={styles.providerRow}>
                                                <Text style={styles.providerName}>{bill.provider}</Text>
                                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bill.status) + '15' }]}>
                                                    <Text style={[styles.statusText, { color: getStatusColor(bill.status) }]}>
                                                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.categoryText}>{bill.category} • {bill.consumerNumber}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.billDivider} />

                                    <View style={styles.billBottom}>
                                        <View>
                                            <Text style={styles.amountLabel}>Amount Due</Text>
                                            <Text style={styles.amountValue}>{bill.amount}</Text>
                                        </View>
                                        <View style={styles.actionContainer}>
                                            <Text style={styles.dateText}>
                                                {bill.status === 'paid' ? `Paid on ${bill.paidDate}` : `Due by ${bill.dueDate}`}
                                            </Text>
                                            {bill.status !== 'paid' && (
                                                <TouchableOpacity
                                                    style={styles.payButton}
                                                    onPress={() => {
                                                        // Navigate to respective payment screen
                                                        const route = bill.category.toLowerCase().includes('electricity') ? '/electricity-bill' :
                                                            bill.category.toLowerCase().includes('postpaid') ? '/mobile-postpaid' :
                                                                bill.category.toLowerCase().includes('broadband') ? '/broadband-bill' : '/more-services';
                                                        router.push(route as any);
                                                    }}
                                                >
                                                    <LinearGradient
                                                        colors={['#2196F3', '#1976D2']}
                                                        style={styles.payGradient}
                                                    >
                                                        <Text style={styles.payButtonText}>Pay Now</Text>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="document-text-outline" size={60} color="#CBD5E1" />
                            </View>
                            <Text style={styles.emptyTitle}>No bills found</Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery ? "We couldn't find any bills matching your search." :
                                    activeTab === 'upcoming' ? "Hurray! You don't have any upcoming bills." :
                                        "You haven't paid any bills yet."}
                            </Text>
                            {!searchQuery && (
                                <TouchableOpacity style={styles.addNowButton} onPress={() => router.push('/add-all-bills')}>
                                    <Text style={styles.addNowText}>Add New Bill</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Security Footer */}
                    <View style={styles.footer}>
                        <View style={styles.securityBadge}>
                            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                            <Text style={styles.securityText}>100% Safe & Secure Payments</Text>
                        </View>
                        <Text style={styles.footerBrand}>Powered by BharatConnect</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    addIcon: {
        padding: 5,
    },
    searchContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 48,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingTop: 5,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 15,
        position: 'relative',
    },
    activeTab: {
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabText: {
        color: '#2196F3',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '40%',
        height: 3,
        backgroundColor: '#2196F3',
        borderRadius: 3,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    billsList: {
        gap: 16,
    },
    billCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    billTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    billMainInfo: {
        flex: 1,
    },
    providerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    providerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    categoryText: {
        fontSize: 12,
        color: '#64748B',
    },
    billDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 16,
    },
    billBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: 11,
        color: '#64748B',
        marginBottom: 4,
    },
    amountValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
    },
    actionContainer: {
        alignItems: 'flex-end',
        gap: 8,
    },
    dateText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '500',
    },
    payButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    payGradient: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    addNowButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 24,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addNowText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        marginTop: 40,
        gap: 10,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    securityText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    footerBrand: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
