import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    BackHandler,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface GasProvider {
    id: string;
    name: string;
    icon: string;
    color: string;
}

interface ConnectionDetails {
    consumerName: string;
    mobile: string;
    deliveryAddress: string;
    lastBookingDate: string;
    subsidyStatus: string;
    amountPayable: number;
    cylinderType: string;
    nextRefillEligible: string;
}

const popularProviders: GasProvider[] = [
    { id: '1', name: 'Indane Gas', icon: 'fire', color: '#FF6B35' },
    { id: '2', name: 'Bharat Gas', icon: 'gas-cylinder', color: '#0D47A1' },
    { id: '3', name: 'HP Gas', icon: 'propane-tank', color: '#2E7D32' },
    { id: '4', name: 'Super Gas', icon: 'gas-burner', color: '#7B1FA2' },
    { id: '5', name: 'Aavantika', icon: 'propane-tank-outline', color: '#E65100' },
    { id: '6', name: 'Total Gas', icon: 'barrel-outline', color: '#37474F' },
];

const allProviders = [
    'Indane Gas', 'Bharat Gas', 'HP Gas', 'Super Gas',
    'Aavantika Gas', 'Total Gas', 'GAIL Gas', 'IGL',
    'MGL - Maharashtra', 'Adani Gas', 'Gujarat Gas',
    'Hindustan Gas', 'Sabarmati Gas', 'Central UP Gas',
];

// Per-provider consumer number validation rules
const PROVIDER_RULES: Record<string, { min: number; max: number; hint: string; placeholder: string; validate: (n: string) => boolean }> = {
    'Indane Gas': {
        min: 10, max: 16,
        hint: 'Indane: 10-digit or 16-digit Consumer No.',
        placeholder: 'Enter 10 or 16-digit Consumer No.',
        validate: (n) => n.length === 10 || n.length === 16,
    },
    'Bharat Gas': {
        min: 10, max: 17,
        hint: 'Bharat Gas: 10 to 17-digit Consumer No.',
        placeholder: 'Enter 10–17 digit Consumer No.',
        validate: (n) => n.length >= 10 && n.length <= 17,
    },
    'HP Gas': {
        min: 10, max: 14,
        hint: 'HP Gas: 10 to 14-digit Consumer No.',
        placeholder: 'Enter 10–14 digit Consumer No.',
        validate: (n) => n.length >= 10 && n.length <= 14,
    },
};

const DEFAULT_PROVIDER_RULE = {
    min: 10, max: 17,
    hint: 'Check your gas book or SMS for LPG ID',
    placeholder: 'Enter LPG Consumer No.',
    validate: (n: string) => n.length >= 10,
};


export default function LPGCylinderScreen() {
    const router = useRouter();

    // Form states
    const [selectedProvider, setSelectedProvider] = useState('');
    const [consumerNumber, setConsumerNumber] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);

    // UI states
    const [providerSearchQuery, setProviderSearchQuery] = useState('');
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState('');


    // Card states
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const handleBack = useCallback(() => {
        if (connectionDetails) {
            setConnectionDetails(null);
            setSelectedPaymentMode('');
            setIsConfirmed(false);
            return true;
        }

        router.back();
        return true;
    }, [router, connectionDetails]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

    const handleProviderSelect = (name: string) => {
        setSelectedProvider(name);
        setShowProviderModal(false);
        setConnectionDetails(null);
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

    const validateForm = () => {
        if (!selectedProvider) return false;
        const rule = PROVIDER_RULES[selectedProvider] ?? DEFAULT_PROVIDER_RULE;
        if (!rule.validate(consumerNumber.trim())) return false;
        if (mobileNumber.trim().length !== 10) return false;
        return true;
    };


    const handleFetchConnection = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        setTimeout(() => {
            const amount = 853;
            setConnectionDetails({
                consumerName: 'Rahul Kumar',
                mobile: mobileNumber,
                deliveryAddress: 'Flat 101, Krishna Apartments, Pune - 411001',
                lastBookingDate: '15 Jan 2026',
                subsidyStatus: 'Eligible',
                amountPayable: amount,
                cylinderType: '14.2 KG',
                nextRefillEligible: 'Yes',
            });
            setPaymentAmount(amount.toString());

            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
            setIsLoading(false);
        }, 1500);
    };



    const isReadyToPay = () => {
        if (!isConfirmed || !selectedPaymentMode || !paymentAmount || parseFloat(paymentAmount) <= 0) return false;
        if (selectedPaymentMode.includes('Card')) {
            if (cardNumber.replace(/\s/g, '').length !== 16) return false;
            if (expiryDate.length !== 5) return false;
            if (cvv.length !== 3) return false;
            if (cardHolder.trim().length < 3) return false;
        }
        return true;
    };

    const isReady = isReadyToPay();

    const handleProceedToPay = () => {
        if (!isReady || !paymentAmount) return;

        if (selectedPaymentMode === 'Wallet') {
            router.replace({
                pathname: '/wallet' as any,
                params: {
                    amount: paymentAmount,
                    billType: 'LPG Cylinder Booking',
                    borrowerName: connectionDetails?.consumerName,
                    loanAccountNumber: consumerNumber,
                    lenderName: selectedProvider,
                },
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowPaymentSuccess(true);
        }, 3000);
    };

    const filteredProviders = allProviders.filter(p =>
        p.toLowerCase().includes(providerSearchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>LPG Cylinder</Text>
                        <Text style={styles.headerSubtitle}>Book & pay across all providers</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.content}>

                            {!connectionDetails ? (
                                <>
                                    {/* Popular Providers Grid */}
                                    <Text style={styles.sectionTitle}>Popular Providers</Text>
                                    <View style={styles.grid}>
                                        {popularProviders.map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[styles.gridItem, selectedProvider === item.name && styles.selectedGridItem]}
                                                onPress={() => handleProviderSelect(item.name)}
                                            >
                                                <View style={[styles.iconCircle, selectedProvider === item.name && styles.selectedIconCircle]}>
                                                    <MaterialCommunityIcons
                                                        name={item.icon as any}
                                                        size={24}
                                                        color={selectedProvider === item.name ? '#FFFFFF' : '#0D47A1'}
                                                    />
                                                </View>
                                                <Text style={styles.gridLabel}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <View style={styles.browseContainer}>
                                        <TouchableOpacity style={styles.browseButton} onPress={() => setShowProviderModal(true)}>
                                            <Text style={styles.browseText}>View All LPG Providers</Text>
                                            <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Form Card */}
                                    <View style={styles.formCard}>
                                        {selectedProvider ? (
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Selected Provider</Text>
                                                <View style={[styles.inputContainer, styles.readOnlyInput]}>
                                                    <MaterialCommunityIcons name="gas-cylinder" size={16} color="#94A3B8" />
                                                    <TextInput
                                                        style={[styles.input, { color: '#64748B' }]}
                                                        value={selectedProvider}
                                                        editable={false}
                                                    />
                                                    <TouchableOpacity onPress={() => setSelectedProvider('')}>
                                                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : null}

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Consumer Number / LPG ID *</Text>
                                            <View style={styles.inputContainer}>
                                                <MaterialCommunityIcons name="card-account-details-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder={(PROVIDER_RULES[selectedProvider] ?? DEFAULT_PROVIDER_RULE).placeholder}
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="number-pad"
                                                    maxLength={(PROVIDER_RULES[selectedProvider] ?? DEFAULT_PROVIDER_RULE).max}
                                                    value={consumerNumber}
                                                    onChangeText={setConsumerNumber}
                                                />
                                            </View>
                                            <Text style={styles.helperText}>
                                                {(PROVIDER_RULES[selectedProvider] ?? DEFAULT_PROVIDER_RULE).hint}
                                            </Text>
                                            {consumerNumber.length > 0 && selectedProvider && !( PROVIDER_RULES[selectedProvider] ?? DEFAULT_PROVIDER_RULE).validate(consumerNumber) && (
                                                <Text style={styles.errorText}>
                                                    {selectedProvider === 'Indane Gas'
                                                        ? 'Must be exactly 10 or 16 digits'
                                                        : `Must be ${ (PROVIDER_RULES[selectedProvider] ?? DEFAULT_PROVIDER_RULE).min }–${ (PROVIDER_RULES[selectedProvider] ?? DEFAULT_PROVIDER_RULE).max } digits`
                                                    }
                                                </Text>
                                            )}
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Registered Mobile Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="phone-portrait-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="10 digit mobile number"
                                                    placeholderTextColor="#94A3B8"
                                                    keyboardType="phone-pad"
                                                    maxLength={10}
                                                    value={mobileNumber}
                                                    onChangeText={setMobileNumber}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleFetchConnection}
                                        disabled={!validateForm() || isLoading}
                                        style={{ marginBottom: 24 }}
                                    >
                                        <LinearGradient
                                            colors={!validateForm() || isLoading ? ['#E0E0E0', '#E0E0E0'] : ['#0D47A1', '#1565C0']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            {isLoading
                                                ? <ActivityIndicator color="#FFFFFF" />
                                                : <Text style={styles.actionButtonText}>Fetch Connection Details</Text>
                                            }
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                /* Connection Details + Payment */
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                                    {/* Connection Summary Card */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialCommunityIcons name="gas-cylinder" size={24} color="#0D47A1" />
                                            <Text style={styles.summaryTitle}>Connection Details</Text>
                                        </View>
                                        <View style={styles.divider} />

                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Consumer</Text>
                                            <Text style={styles.summaryValue}>{connectionDetails!.consumerName}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>LPG ID</Text>
                                            <Text style={styles.summaryValue}>{consumerNumber}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Provider</Text>
                                            <Text style={styles.summaryValue}>{selectedProvider}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Cylinder Type</Text>
                                            <Text style={styles.summaryValue}>{connectionDetails!.cylinderType}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Last Booking</Text>
                                            <Text style={styles.summaryValue}>{connectionDetails!.lastBookingDate}</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Subsidy Status</Text>
                                            <View style={styles.subsidyBadge}>
                                                <Text style={styles.subsidyText}>{connectionDetails!.subsidyStatus}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Refill Eligible</Text>
                                            <View style={styles.eligibleBadge}>
                                                <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                                <Text style={styles.eligibleText}>{connectionDetails!.nextRefillEligible}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Delivery Address</Text>
                                            <Text style={[styles.summaryValue, { flex: 1, textAlign: 'right', marginLeft: 12 }]}>{connectionDetails!.deliveryAddress}</Text>
                                        </View>

                                        <View style={styles.amountBanner}>
                                            <View>
                                                <Text style={styles.bannerLabel}>Cylinder Amount</Text>
                                                <Text style={styles.bannerValue}>₹{connectionDetails!.amountPayable}</Text>
                                            </View>
                                            <View style={styles.verticalDivider} />
                                            <View>
                                                <Text style={styles.bannerLabel}>Subsidy</Text>
                                                <Text style={[styles.bannerValue, { color: '#2E7D32' }]}>Eligible</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Payment Section */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.sectionTitle}>Payment Details</Text>
                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Enter Amount</Text>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.currencyPrefix}>₹</Text>
                                                <TextInput
                                                    style={styles.input}
                                                    keyboardType="numeric"
                                                    value={paymentAmount}
                                                    onChangeText={setPaymentAmount}
                                                />
                                            </View>
                                        </View>

                                        <Text style={styles.fieldLabel}>Select Payment Mode</Text>
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
                                                    <Text style={[styles.paymentModeText, selectedPaymentMode === mode && styles.selectedPaymentModeText]}>
                                                        {mode}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {selectedPaymentMode.includes('Card') && (
                                            <View style={styles.cardFormContainer}>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Name on Card</Text>
                                                    <View style={styles.inputContainer}>
                                                        <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                        <TextInput style={styles.input} placeholder="Card Holder Name" placeholderTextColor="#94A3B8" value={cardHolder} onChangeText={setCardHolder} autoCapitalize="characters" />
                                                    </View>
                                                </View>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Card Number</Text>
                                                    <View style={styles.inputContainer}>
                                                        <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                                        <TextInput style={styles.input} placeholder="0000 0000 0000 0000" placeholderTextColor="#94A3B8" keyboardType="numeric" value={cardNumber} onChangeText={handleCardNumberChange} maxLength={19} />
                                                    </View>
                                                </View>
                                                <View style={styles.row}>
                                                    <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                                        <Text style={styles.fieldLabel}>Expiry</Text>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#94A3B8" keyboardType="numeric" value={expiryDate} onChangeText={handleExpiryChange} maxLength={5} />
                                                        </View>
                                                    </View>
                                                    <View style={[styles.fieldGroup, { flex: 1 }]}>
                                                        <Text style={styles.fieldLabel}>CVV</Text>
                                                        <View style={styles.inputContainer}>
                                                            <TextInput style={styles.input} placeholder="123" placeholderTextColor="#94A3B8" keyboardType="numeric" secureTextEntry value={cvv} onChangeText={setCvv} maxLength={3} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity style={styles.declarationRow} onPress={() => setIsConfirmed(!isConfirmed)}>
                                        <Ionicons name={isConfirmed ? 'checkbox' : 'square-outline'} size={22} color={isConfirmed ? '#0D47A1' : '#64748B'} />
                                        <Text style={styles.declarationText}>I confirm that the above details are correct and authorize this LPG cylinder booking and payment.</Text>
                                    </TouchableOpacity>

                                    <View style={styles.footerButtons}>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => { setConnectionDetails(null); setSelectedPaymentMode(''); setIsConfirmed(false); }}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleProceedToPay} disabled={!isReady || isLoading} style={{ flex: 1 }}>
                                            <LinearGradient
                                                colors={!isReady || isLoading ? ['#E0E0E0', '#E0E0E0'] : ['#0D47A1', '#1565C0']}
                                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                style={styles.payButton}
                                            >
                                                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Book & Pay ₹{paymentAmount}</Text>}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Provider Selection Modal */}
                <Modal visible={showProviderModal} transparent animationType="slide" onRequestClose={() => setShowProviderModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Gas Provider</Text>
                                <TouchableOpacity onPress={() => setShowProviderModal(false)}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#666" />
                                <TextInput
                                    style={styles.modalSearchInput}
                                    placeholder="Search provider..."
                                    value={providerSearchQuery}
                                    onChangeText={setProviderSearchQuery}
                                />
                            </View>
                            <ScrollView style={styles.optionsList}>
                                {filteredProviders.map((name, index) => (
                                    <TouchableOpacity key={index} style={styles.optionItem} onPress={() => handleProviderSelect(name)}>
                                        <Text style={styles.optionText}>{name}</Text>
                                        {selectedProvider === name && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Payment Success Modal */}
                <Modal visible={showPaymentSuccess} transparent animationType="fade">
                    <View style={styles.successOverlay}>
                        <View style={styles.successCard}>
                            <View style={styles.successIcon}>
                                <Ionicons name="checkmark" size={50} color="#FFFFFF" />
                            </View>
                            <Text style={styles.successTitle}>Booking Confirmed!</Text>
                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Transaction ID</Text>
                                    <Text style={styles.receiptValue}>TX-LPG-{Math.floor(Math.random() * 900000) + 100000}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Provider</Text>
                                    <Text style={styles.receiptValue}>{selectedProvider}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>LPG ID</Text>
                                    <Text style={styles.receiptValue}>{consumerNumber}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Amount Paid</Text>
                                    <Text style={styles.receiptValue}>₹{paymentAmount}</Text>
                                </View>
                                <View style={styles.receiptRow}>
                                    <Text style={styles.receiptLabel}>Date</Text>
                                    <Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <View style={styles.successActionRow}>
                                <TouchableOpacity style={styles.receiptAction}>
                                    <Ionicons name="download-outline" size={20} color="#0D47A1" />
                                    <Text style={styles.receiptActionText}>Download</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.receiptAction}>
                                    <Ionicons name="share-social-outline" size={20} color="#0D47A1" />
                                    <Text style={styles.receiptActionText}>Share</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.backHomeButton}
                                onPress={() => { setShowPaymentSuccess(false); router.back(); }}
                            >
                                <Text style={styles.backHomeText}>Back to Services</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
    placeholder: { width: 34 },

    scrollContent: { padding: 20 },
    content: { paddingVertical: 10 },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    gridItem: { width: '30%', alignItems: 'center', marginBottom: 16, padding: 8, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
    selectedGridItem: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F8FE', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    selectedIconCircle: { backgroundColor: '#0D47A1' },
    gridLabel: { fontSize: 9, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },

    browseContainer: { alignItems: 'center', marginBottom: 20 },
    browseButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#BBDEFB', gap: 4 },
    browseText: { fontSize: 12, fontWeight: '700', color: '#0D47A1' },

    formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
    fieldGroup: { marginBottom: 15 },
    fieldLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 6 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#E0E0E0' },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },
    readOnlyInput: { backgroundColor: '#F1F5F9', borderColor: '#E0E0E0' },
    helperText: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
    currencyPrefix: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },

    actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },

    // Summary card
    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryLabel: { fontSize: 13, color: '#64748B' },
    summaryValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
    subsidyBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    subsidyText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
    eligibleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    eligibleText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },
    amountBanner: { flexDirection: 'row', backgroundColor: '#F1F8FE', borderRadius: 12, padding: 15, marginTop: 10, justifyContent: 'space-around' },
    bannerLabel: { fontSize: 11, color: '#64748B', textAlign: 'center', marginBottom: 4 },
    bannerValue: { fontSize: 18, fontWeight: 'bold', color: '#0D47A1', textAlign: 'center' },
    verticalDivider: { width: 1, backgroundColor: '#D1E9FF' },

    // Payment
    paymentModes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 10 },
    paymentModeCard: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
    selectedPaymentModeCard: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    paymentModeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    selectedPaymentModeText: { color: '#0D47A1' },
    cardFormContainer: { marginTop: 10, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    row: { flexDirection: 'row' },

    declarationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
    declarationText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 16 },
    footerButtons: { flexDirection: 'row', gap: 15, marginBottom: 40 },
    cancelButton: { flex: 0.4, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
    cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
    payButton: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    // Error card
    errorCard: { backgroundColor: '#FFEBEE', borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#FFCDD2', marginBottom: 20 },
    errorCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#C62828', marginTop: 15, marginBottom: 8 },
    errorCardText: { fontSize: 14, color: '#E53935', textAlign: 'center', marginBottom: 20 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', paddingTop: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, margin: 20, paddingHorizontal: 15, paddingVertical: 10 },
    modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1A1A1A' },
    optionsList: { paddingHorizontal: 20 },
    optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    optionText: { fontSize: 15, color: '#1A1A1A' },

    // Success Modal
    successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successCard: { backgroundColor: '#FFFFFF', borderRadius: 24, width: '100%', padding: 30, alignItems: 'center' },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 30, textAlign: 'center' },
    receipt: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 25 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    receiptLabel: { fontSize: 13, color: '#64748B' },
    receiptValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
    successActionRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
    receiptAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    receiptActionText: { fontSize: 14, fontWeight: 'bold', color: '#0D47A1' },
    backHomeButton: { width: '100%', height: 56, backgroundColor: '#1E293B', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    backHomeText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    errorText: { fontSize: 11, color: '#E53935', marginTop: 4, fontWeight: '600' },
});