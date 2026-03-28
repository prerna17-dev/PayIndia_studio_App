import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Image,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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

const MOCK_BILLS: Bill[] = [];

export default function MyBillsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'paid'>('upcoming');
    const [searchQuery, setSearchQuery] = useState('');
    const [userBills, setUserBills] = useState<Bill[]>(MOCK_BILLS);

    // Payment Modal State
    const [payingBill, setPayingBill] = useState<Bill | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // Card Details
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchManualBills = async () => {
                try {
                    const saved = await AsyncStorage.getItem('@my_manual_bills');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        setUserBills([...MOCK_BILLS, ...parsed]);
                    } else {
                        setUserBills(MOCK_BILLS);
                    }
                } catch (error) {
                    console.error('Error fetching manual bills:', error);
                }
            };
            fetchManualBills();
        }, [])
    );

    const filteredBills = userBills.filter(bill => {
        const matchesTab = activeTab === 'upcoming'
            ? (bill.status === 'pending' || bill.status === 'overdue')
            : bill.status === 'paid';
        const matchesSearch = bill.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bill.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleDeleteBill = (id: string, provider: string) => {
        Alert.alert(
            "Delete Bill",
            `Are you sure you want to remove ${provider}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const saved = await AsyncStorage.getItem('@my_manual_bills');
                            if (saved) {
                                const parsed = JSON.parse(saved);
                                const updated = parsed.filter((b: Bill) => b.id !== id);
                                await AsyncStorage.setItem('@my_manual_bills', JSON.stringify(updated));
                                setUserBills([...MOCK_BILLS, ...updated]);
                            }
                        } catch (error) {
                            console.error('Error deleting bill:', error);
                            Alert.alert('Error', 'Failed to delete bill');
                        }
                    }
                }
            ]
        );
    };

    const handleCardNumberChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = '';
        for (let i = 0; i < cleaned.length && i < 16; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += cleaned[i];
        }
        setCardNumber(formatted);
    };

    const handleExpiryChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        setExpiryDate(formatted);
    };

    const isReadyToPay = () => {
        if (!isConfirmed || !selectedPaymentMode) return false;
        if (selectedPaymentMode.includes('Card')) {
            if (cardNumber.replace(/\s/g, '').length !== 16) return false;
            if (expiryDate.length !== 5) return false;
            if (cvv.length !== 3) return false;
            if (cardHolder.trim().length < 3) return false;
        }
        return true;
    };

    const openPayment = (bill: Bill) => {
        setPayingBill(bill);
        setSelectedPaymentMode('');
        setIsConfirmed(false);
        setCardNumber(''); setExpiryDate(''); setCvv(''); setCardHolder('');
        setShowPaymentModal(true);
    };

    const handleProceedToPay = () => {
        if (!isReadyToPay() || !payingBill) return;
        if (selectedPaymentMode === 'Wallet') {
            setShowPaymentModal(false);
            router.push({
                pathname: '/wallet' as any,
                params: {
                    amount: payingBill.amount.replace('₹', ''),
                    billType: `${payingBill.category} Bill`,
                    borrowerName: payingBill.provider,
                    loanAccountNumber: payingBill.consumerNumber,
                    lenderName: payingBill.provider,
                },
            });
            return;
        }
        setIsProcessing(true);
        setTimeout(async () => {
            setIsProcessing(false);
            setShowPaymentModal(false);

            // Mark the bill as paid
            const today = new Date().toLocaleDateString();
            setUserBills(prev => prev.map(b =>
                b.id === payingBill.id
                    ? { ...b, status: 'paid' as const, paidDate: today }
                    : b
            ));

            // Persist update in AsyncStorage for manual bills
            try {
                const saved = await AsyncStorage.getItem('@my_manual_bills');
                if (saved) {
                    const parsed: Bill[] = JSON.parse(saved);
                    const updated = parsed.map(b =>
                        b.id === payingBill.id
                            ? { ...b, status: 'paid', paidDate: today }
                            : b
                    );
                    await AsyncStorage.setItem('@my_manual_bills', JSON.stringify(updated));
                }
            } catch (e) { /* silent */ }

            setShowSuccessModal(true);
        }, 2500);
    };

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
                                        <View style={styles.billHeaderLeft}>
                                            <View style={[styles.iconCircle, { backgroundColor: bill.iconBg }]}>
                                                <Ionicons name={bill.icon as any} size={18} color={bill.iconColor} />
                                            </View>
                                            <View style={styles.billMainInfo}>
                                                <View style={styles.providerRow}>
                                                    <Text style={styles.providerName}>{bill.provider}</Text>
                                                </View>
                                                <Text style={styles.categoryText}>{bill.category} • {bill.consumerNumber}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.billActionsRow}>
                                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bill.status) + '15' }]}>
                                                <Text style={[styles.statusText, { color: getStatusColor(bill.status) }]}>
                                                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => handleDeleteBill(bill.id, bill.provider)} style={{ marginLeft: 8 }}>
                                                <Ionicons name="trash-outline" size={20} color="#F44336" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.billDivider} />

                                    <View style={styles.billBottom}>
                                        <View>
                                            <Text style={styles.amountLabel}>Total Due</Text>
                                            <Text style={styles.amountValue}>{bill.amount}</Text>
                                        </View>
                                        <View style={styles.actionContainer}>
                                            <Text style={styles.dateText}>
                                                {bill.status === 'paid' ? `Paid on ${bill.paidDate}` : `Due by ${bill.dueDate}`}
                                            </Text>
                                            {bill.status !== 'paid' && (
                                                <TouchableOpacity
                                                    style={styles.payButton}
                                                    onPress={() => openPayment(bill)}
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

            {/* Payment Modal */}
            <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalTitleRow}>
                            <Text style={styles.modalTitle}>Pay Bill</Text>
                            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {payingBill && (
                            <View style={styles.payBillSummary}>
                                <View style={[styles.payBillIcon, { backgroundColor: payingBill.iconBg }]}>
                                    <Ionicons name={payingBill.icon as any} size={22} color={payingBill.iconColor} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.payBillProvider}>{payingBill.provider}</Text>
                                    <Text style={styles.payBillCategory}>{payingBill.category}</Text>
                                </View>
                                <Text style={styles.payBillAmount}>{payingBill.amount}</Text>
                            </View>
                        )}

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.payModeLabel}>Select Payment Mode</Text>
                            <View style={styles.paymentModes}>
                                {['Wallet', 'Debit Card', 'Credit Card', 'Net Banking'].map((mode) => (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[styles.paymentModeCard, selectedPaymentMode === mode && styles.selectedPaymentModeCard]}
                                        onPress={() => setSelectedPaymentMode(mode)}
                                    >
                                        <Ionicons
                                            name={mode === 'Wallet' ? 'wallet' : mode === 'Net Banking' ? 'globe-outline' : 'card'}
                                            size={20}
                                            color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'}
                                        />
                                        <Text style={[styles.paymentModeText, selectedPaymentMode === mode && styles.selectedPaymentModeText]}>{mode}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedPaymentMode.includes('Card') && (
                                <View style={styles.cardForm}>
                                    <View style={styles.cardFieldGroup}>
                                        <Text style={styles.cardFieldLabel}>Name on Card</Text>
                                        <View style={styles.cardInput}>
                                            <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                            <TextInput style={styles.cardInputText} placeholder="Card Holder Name" placeholderTextColor="#94A3B8" value={cardHolder} onChangeText={setCardHolder} autoCapitalize="characters" />
                                        </View>
                                    </View>
                                    <View style={styles.cardFieldGroup}>
                                        <Text style={styles.cardFieldLabel}>Card Number</Text>
                                        <View style={styles.cardInput}>
                                            <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                            <TextInput style={styles.cardInputText} placeholder="0000 0000 0000 0000" placeholderTextColor="#94A3B8" keyboardType="numeric" value={cardNumber} onChangeText={handleCardNumberChange} maxLength={19} />
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        <View style={[styles.cardFieldGroup, { flex: 1 }]}>
                                            <Text style={styles.cardFieldLabel}>Expiry</Text>
                                            <View style={styles.cardInput}>
                                                <TextInput style={styles.cardInputText} placeholder="MM/YY" placeholderTextColor="#94A3B8" keyboardType="numeric" value={expiryDate} onChangeText={handleExpiryChange} maxLength={5} />
                                            </View>
                                        </View>
                                        <View style={[styles.cardFieldGroup, { flex: 1 }]}>
                                            <Text style={styles.cardFieldLabel}>CVV</Text>
                                            <View style={styles.cardInput}>
                                                <TextInput style={styles.cardInputText} placeholder="123" placeholderTextColor="#94A3B8" keyboardType="numeric" secureTextEntry value={cvv} onChangeText={setCvv} maxLength={3} />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setIsConfirmed(!isConfirmed)}>
                                <Ionicons name={isConfirmed ? 'checkbox' : 'square-outline'} size={22} color={isConfirmed ? '#0D47A1' : '#64748B'} />
                                <Text style={styles.declarationText}>I confirm the above details and authorize this payment.</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                disabled={!isReadyToPay() || isProcessing}
                                onPress={handleProceedToPay}
                            >
                                <LinearGradient
                                    colors={!isReadyToPay() || isProcessing ? ['#E0E0E0', '#E0E0E0'] : ['#0D47A1', '#1565C0']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.proceedButton}
                                >
                                    {isProcessing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.proceedButtonText}>Proceed to Pay</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={styles.successOverlay}>
                    <View style={styles.successCard}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={50} color="#FFF" />
                        </View>
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <View style={styles.receipt}>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Transaction ID</Text>
                                <Text style={styles.receiptValue}>TX-BILL-{Math.floor(Math.random() * 900000) + 100000}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Provider</Text>
                                <Text style={styles.receiptValue}>{payingBill?.provider}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Amount Paid</Text>
                                <Text style={styles.receiptValue}>{payingBill?.amount}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>Date</Text>
                                <Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.backHomeButton} onPress={() => { setShowSuccessModal(false); }}>
                            <Text style={styles.backHomeText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    billTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    billActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    billMainInfo: {
        flex: 1,
    },
    providerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    providerName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    categoryText: {
        fontSize: 11,
        color: '#64748B',
    },
    billDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 8,
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
        fontSize: 16,
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    payButtonText: {
        fontSize: 12,
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
    // Payment Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    payBillSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 20 },
    payBillIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    payBillProvider: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
    payBillCategory: { fontSize: 12, color: '#64748B', marginTop: 2 },
    payBillAmount: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1' },
    payModeLabel: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 10 },
    paymentModes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    paymentModeCard: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
    selectedPaymentModeCard: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    paymentModeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    selectedPaymentModeText: { color: '#0D47A1' },
    cardForm: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    cardFieldGroup: { marginBottom: 12 },
    cardFieldLabel: { fontSize: 11, fontWeight: 'bold', color: '#475569', marginBottom: 5 },
    cardInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: '#E0E0E0', gap: 8 },
    cardInputText: { flex: 1, fontSize: 14, color: '#333' },
    declarationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    declarationText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 16 },
    proceedButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    proceedButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    // Success Modal
    successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successCard: { backgroundColor: '#FFF', borderRadius: 24, width: '100%', padding: 30, alignItems: 'center' },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 24, textAlign: 'center' },
    receipt: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 24 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    receiptLabel: { fontSize: 13, color: '#64748B' },
    receiptValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
    backHomeButton: { width: '100%', height: 52, backgroundColor: '#1E293B', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    backHomeText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
