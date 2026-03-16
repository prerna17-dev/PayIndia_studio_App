import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import {
    ActivityIndicator,
    Animated,
    BackHandler,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Alert,
} from "react-native";

interface TaxDetails {
    ownerName: string;
    propertyId: string;
    address: string;
    financialYear: string;
    baseAmount: number;
    penalty: number;
    rebate: number;
    totalPayable: number;
    taxType: string;
}

const taxCategories = [
    { id: '1', name: "Property Tax", icon: "home-city", desc: "Pay annual property tax", bgColor: "#E0F2FE" },
    { id: '2', name: "Water Tax", icon: "water", desc: "Pay municipal water charges", bgColor: "#E0F2FE" },
    { id: '3', name: "Sanitation Tax", icon: "trash-can", desc: "Pay waste collection tax", bgColor: "#E0F2FE" },
    { id: '4', name: "Commercial Tax", icon: "office-building", desc: "Pay business property tax", bgColor: "#E0F2FE" },
    { id: '5', name: "Vacant Land Tax", icon: "map-marker-radius", desc: "Pay tax for open plots", bgColor: "#E0F2FE" },
    { id: '6', name: "Infrastructure Tax", icon: "bridge", desc: "Pay development charges", bgColor: "#E0F2FE" },
    { id: '7', name: "Advertisement Tax", icon: "billboard", desc: "Pay hoarding/display tax", bgColor: "#E0F2FE" },
    { id: '8', name: "Fire Safety Cess", icon: "fire-hydrant", desc: "Pay fire safety charges", bgColor: "#E0F2FE" },
    { id: '9', name: "Trade License Fee", icon: "file-certificate", desc: "Annual trade license tax", bgColor: "#E0F2FE" },
    { id: '10', name: "Entertainment Tax", icon: "movie-open", desc: "Cinema/Event municipal tax", bgColor: "#E0F2FE" },
];

const MUNICIPAL_CORPORATIONS = [
    { en: "Brihanmumbai Municipal Corporation (BMC)", mr: "बृहन्मुंबई महानगरपालिका" },
    { en: "Pune Municipal Corporation (PMC)", mr: "पुणे महानगरपालिका" },
    { en: "Nagpur Municipal Corporation (NMC)", mr: "नागपूर महानगरपालिका" },
    { en: "Thane Municipal Corporation (TMC)", mr: "ठाणे महानगरपालिका" },
    { en: "Pimpri-Chinchwad Municipal Corporation (PCMC)", mr: "पिंपरी-चिंचवड महानगरपालिका" },
    { en: "Nashik Municipal Corporation (NMC)", mr: "नाशिक महानगरपालिका" },
    { en: "Kalyan-Dombivli Municipal Corporation (KDMC)", mr: "कल्याण-डोंबिवली महानगरपालिका" },
    { en: "Vasai-Virar City Municipal Corporation (VVCMC)", mr: "वसई-विरार शहर महानगरपालिका" },
    { en: "Aurangabad Municipal Corporation (AMC)", mr: "छत्रपती संभाजीनगर (औरंगाबाद) महानगरपालिका" },
    { en: "Navi Mumbai Municipal Corporation (NMMC)", mr: "नवी मुंबई महानगरपालिका" },
    { en: "Solapur Municipal Corporation (SMC)", mr: "सोलापूर महानगरपालिका" },
    { en: "Mira-Bhayandar Municipal Corporation (MBMC)", mr: "मीरा-भाईंदर महानगरपालिका" },
    { en: "Kolhapur Municipal Corporation (KMC)", mr: "कोल्हापूर महानगरपालिका" },
    { en: "Amravati Municipal Corporation (AMC)", mr: "अमरावती महानगरपालिका" },
    { en: "Ulhasnagar Municipal Corporation (UMC)", mr: "उल्हासनगर महानगरपालिका" },
    { en: "Akola Municipal Corporation (AMC)", mr: "अकोला महानगरपालिका" },
    { en: "Jalgaon Municipal Corporation (JMC)", mr: "जळगाव महानगरपालिका" },
    { en: "Ahmednagar Municipal Corporation (AMC)", mr: "अहमदनगर महानगरपालिका" },
    { en: "Malegaon Municipal Corporation (MMC)", mr: "मालेगाव महानगरपालिका" },
    { en: "Dhule Municipal Corporation (DMC)", mr: "धुळे महानगरपालिका" },
    { en: "Sangli-Miraj-Kupwad Municipal Corporation (SMKMC)", mr: "सांगली-मिरज-कुपवाड महानगरपालिका" },
    { en: "Latur Municipal Corporation (LMC)", mr: "लातूर महानगरपालिका" },
    { en: "Parbhani Municipal Corporation (PMC)", mr: "परभणी महानगरपालिका" },
    { en: "Chandrapur Municipal Corporation (CMC)", mr: "चंद्रपूर महानगरपालिका" },
    { en: "Nanded-Waghala Municipal Corporation (NWMC)", mr: "नांदेड-वाघाळा महानगरपालिका" },
    { en: "Bhiwandi-Nizampur Municipal Corporation (BNMC)", mr: "भिवंडी-निजामपूर महानगरपालिका" },
    { en: "Panvel Municipal Corporation (PMC)", mr: "पनवेल महानगरपालिका" },
    { en: "Ichalkaranji Municipal Corporation (IMC)", mr: "इचलकरंजी महानगरपालिका" },
    { en: "Jalna Municipal Corporation (JMC)", mr: "जळगाव महानगरपालिका" },
];

export default function MunicipalTaxesScreen() {
    const router = useRouter();

    // UI States
    const [selectedCategory, setSelectedCategory] = useState<typeof taxCategories[0] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [taxDetails, setTaxDetails] = useState<TaxDetails | null>(null);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
    const [showCorpModal, setShowCorpModal] = useState(false);
    const [selectedCorporation, setSelectedCorporation] = useState("");
    const [corpSearchQuery, setCorpSearchQuery] = useState("");

    // Form states
    const [propertyId, setPropertyId] = useState("");
    const [ownerNameInput, setOwnerNameInput] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [selectedYear, setSelectedYear] = useState("2024-2025");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Card States
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const handleBack = useCallback(() => {
        if (showCorpModal) {
            setShowCorpModal(false);
            return true;
        }
        if (taxDetails) {
            setTaxDetails(null);
            return true;
        }
        if (selectedCategory) {
            setSelectedCategory(null);
            return true;
        }
        router.back();
        return true;
    }, [router, selectedCategory, taxDetails, showCorpModal]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

    const isValidFinancialYear = (year: string) => {
        const regex = /^(\d{4})-(\d{4})$/;
        const match = year.match(regex);
        if (!match) return false;

        const year1 = parseInt(match[1]);
        const year2 = parseInt(match[2]);

        return year2 === year1 + 1;
    };

    const handleYearChange = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length > 4) {
            formatted = `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}`;
        }
        setSelectedYear(formatted.substring(0, 9));
    };

    const validateForm = () => {
        if (!selectedCorporation) return false;
        if (propertyId.trim().length < 4) return false;
        if (mobileNumber.trim().length !== 10) return false;
        if (!isValidFinancialYear(selectedYear)) return false;
        return true;
    };

    const handleFetchDetails = async () => {
        if (!selectedCorporation) {
            Alert.alert("Required", "Please select Municipal Corporation");
            return;
        }

        if (!isValidFinancialYear(selectedYear)) {
            Alert.alert("Invalid Input", "Please enter valid Financial Year");
            return;
        }

        if (!validateForm()) return;

        setIsLoading(true);
        setTimeout(() => {
            const mockData: TaxDetails = {
                ownerName: ownerNameInput || "Rajesh Kumar",
                propertyId: propertyId,
                address: "Plot 12, Sector 5, Municipal Colony",
                financialYear: selectedYear,
                baseAmount: 4800,
                penalty: 200,
                rebate: 150,
                totalPayable: 4850,
                taxType: selectedCategory?.name || "Tax",
            };

            setTaxDetails(mockData);
            setPaymentAmount(mockData.totalPayable.toString());
            setIsLoading(false);

            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
        }, 1500);
    };

    const handleCardNumberChange = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        setCardNumber(formatted.substring(0, 19));
    };

    const handleExpiryChange = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        setExpiryDate(formatted);
    };

    const isReadyToPay = () => {
        if (!isConfirmed || !selectedPaymentMode || !paymentAmount || parseFloat(paymentAmount) <= 0) return false;
        if (selectedPaymentMode.includes("Card")) {
            if (!cardNumber || cardNumber.length < 19 || !expiryDate || expiryDate.length < 5 || !cvv || cvv.length < 3 || !cardHolder) return false;
        }
        return true;
    };

    const handleProceedToPay = () => {
        if (!isReadyToPay() || !paymentAmount) return;

        if (selectedPaymentMode === 'Wallet') {
            router.replace({
                pathname: "/wallet" as any,
                params: {
                    amount: paymentAmount,
                    billType: "municipal_tax",
                    borrowerName: taxDetails?.ownerName,
                    loanAccountNumber: taxDetails?.propertyId,
                    lenderName: taxDetails?.taxType,
                },
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowPaymentSuccess(true);
        }, 2500);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header Section - Matches municipal-services */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Municipal Taxes</Text>
                        <Text style={styles.headerSubtitle}>Pay and manage your municipal tax payments</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>

                            {!selectedCategory ? (
                                <>
                                    {/* Tax Category Grid */}
                                    <View style={styles.grid}>
                                        {taxCategories.map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[styles.gridItem, { backgroundColor: item.bgColor }]}
                                                onPress={() => setSelectedCategory(item)}
                                            >
                                                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
                                                    <MaterialCommunityIcons name={item.icon as any} size={28} color="#0D47A1" />
                                                </View>
                                                <Text style={styles.gridLabel}>{item.name}</Text>
                                                <Text style={styles.gridDesc}>{item.desc}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : !taxDetails ? (
                                <View>
                                    {/* Tax Payment Page (Form) */}
                                    <View style={styles.selectedServiceHeader}>
                                        <MaterialCommunityIcons name={selectedCategory.icon as any} size={24} color="#0D47A1" />
                                        <Text style={styles.selectedServiceName}>{selectedCategory.name}</Text>
                                    </View>

                                    {/* Corporation Dropdown */}
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionTitle}>Select Municipal Corporation</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.dropdownTrigger}
                                        onPress={() => setShowCorpModal(true)}
                                    >
                                        <View style={styles.dropdownLeft}>
                                            <MaterialCommunityIcons
                                                name="office-building-marker-outline"
                                                size={24}
                                                color="#0D47A1"
                                            />
                                            <Text
                                                style={[
                                                    styles.dropdownValue,
                                                    !selectedCorporation && styles.dropdownPlaceholder,
                                                    selectedCorporation.length > 35 && { fontSize: 12 },
                                                    selectedCorporation.length > 45 && { fontSize: 11 }
                                                ]}
                                                numberOfLines={1}
                                                adjustsFontSizeToFit
                                                minimumFontScale={0.8}
                                            >
                                                {selectedCorporation || "Choose Municipal Corporation"}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-down" size={20} color="#64748B" />
                                    </TouchableOpacity>

                                    <View style={styles.formCard}>
                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Financial Year *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="e.g. 20242025"
                                                    placeholderTextColor="#94A3B8"
                                                    value={selectedYear}
                                                    onChangeText={handleYearChange}
                                                    keyboardType="number-pad"
                                                    maxLength={9}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Property Number / Assessment ID *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="barcode-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter ID or Assessment Number"
                                                    placeholderTextColor="#94A3B8"
                                                    value={propertyId}
                                                    onChangeText={setPropertyId}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Owner Name</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter Owner Name (Optional)"
                                                    placeholderTextColor="#94A3B8"
                                                    value={ownerNameInput}
                                                    onChangeText={setOwnerNameInput}
                                                />
                                            </View>
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

                                    <TouchableOpacity onPress={handleFetchDetails} disabled={!validateForm() || isLoading} style={{ marginBottom: 24 }}>
                                        <LinearGradient
                                            colors={!validateForm() || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={styles.actionButton}
                                        >
                                            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Fetch Tax Details</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                    {/* Tax Summary Card */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialCommunityIcons name={selectedCategory.icon as any} size={24} color="#0D47A1" />
                                            <Text style={styles.summaryTitle}>{selectedCategory.name} Summary</Text>
                                        </View>
                                        <View style={styles.divider} />

                                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Corporation</Text><Text style={[styles.summaryValue, { flex: 0.7, textAlign: 'right' }]}>{selectedCorporation}</Text></View>
                                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Owner Name</Text><Text style={styles.summaryValue}>{taxDetails.ownerName}</Text></View>
                                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Property ID</Text><Text style={styles.summaryValue}>{taxDetails.propertyId}</Text></View>
                                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Address</Text><Text style={[styles.summaryValue, { flex: 0.7, textAlign: 'right' }]}>{taxDetails.address}</Text></View>
                                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Financial Year</Text><Text style={styles.summaryValue}>{taxDetails.financialYear}</Text></View>

                                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Base Tax Amount</Text><Text style={styles.summaryValue}>₹{taxDetails.baseAmount}</Text></View>
                                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Penalty</Text><Text style={[styles.summaryValue, { color: '#DC2626' }]}>+ ₹{taxDetails.penalty}</Text></View>
                                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Rebate</Text><Text style={[styles.summaryValue, { color: '#059669' }]}>- ₹{taxDetails.rebate}</Text></View>

                                        <View style={styles.totalBanner}>
                                            <Text style={styles.totalLabel}>Total Payable Amount</Text>
                                            <Text style={styles.totalValue}>₹{taxDetails.totalPayable}</Text>
                                        </View>
                                    </View>

                                    {/* Payment Section */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formSectionTitle}>Payment Details</Text>
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
                                                    <Ionicons name={mode === 'Wallet' ? 'wallet' : 'card'} size={20} color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'} />
                                                    <Text style={[styles.paymentModeText, selectedPaymentMode === mode && styles.selectedPaymentModeText]}>{mode}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {selectedPaymentMode.includes("Card") && (
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

                                    {/* Declaration */}
                                    <TouchableOpacity style={styles.declarationRow} onPress={() => setIsConfirmed(!isConfirmed)}>
                                        <Ionicons name={isConfirmed ? "checkbox" : "square-outline"} size={22} color={isConfirmed ? "#0D47A1" : "#64748B"} />
                                        <Text style={styles.declarationText}>I confirm that the above tax details are correct and authorize this municipal tax payment.</Text>
                                    </TouchableOpacity>

                                    {/* Action Buttons */}
                                    <View style={styles.footerButtons}>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setTaxDetails(null)}>
                                            <Text style={styles.cancelButtonText}>Cancel</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={handleProceedToPay} disabled={!isReadyToPay() || isLoading} style={{ flex: 1 }}>
                                            <LinearGradient
                                                colors={!isReadyToPay() || isLoading ? ["#E0E0E0", "#E0E0E0"] : ["#0D47A1", "#1565C0"]}
                                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                style={styles.payButton}
                                            >
                                                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Proceed to Pay</Text>}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            )}

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Municipal Corporation Modal */}
                <Modal visible={showCorpModal} transparent animationType="slide" onRequestClose={() => setShowCorpModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.corpModalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Corporation</Text>
                                <TouchableOpacity onPress={() => setShowCorpModal(false)}>
                                    <Ionicons name="close" size={24} color="#1A1A1A" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalSearch}>
                                <Ionicons name="search" size={20} color="#94A3B8" />
                                <TextInput
                                    style={styles.modalSearchInput}
                                    placeholder="Search corporation..."
                                    value={corpSearchQuery}
                                    onChangeText={setCorpSearchQuery}
                                />
                            </View>

                            <ScrollView style={styles.optionsList}>
                                {MUNICIPAL_CORPORATIONS.filter(c =>
                                    c.en.toLowerCase().includes(corpSearchQuery.toLowerCase()) ||
                                    c.mr.includes(corpSearchQuery)
                                ).map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.optionItem, selectedCorporation === item.en && styles.selectedOption]}
                                        onPress={() => { setSelectedCorporation(item.en); setShowCorpModal(false); }}
                                    >
                                        <View style={styles.optionLeft}>
                                            <View style={[styles.modalIconCircle, selectedCorporation === item.en && { backgroundColor: 'transparent' }]}>
                                                <MaterialCommunityIcons name="office-building" size={22} color={selectedCorporation === item.en ? "#0D47A1" : "#0D47A1"} />
                                            </View>
                                            <View>
                                                <Text style={[styles.optionText, selectedCorporation === item.en && styles.selectedOptionText]}>{item.en}</Text>
                                                <Text style={styles.optionDesc}>{item.mr}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Success Modal */}
                <Modal visible={showPaymentSuccess} transparent animationType="fade">
                    <View style={styles.successOverlay}>
                        <View style={styles.successCard}>
                            <View style={styles.successIcon}><Ionicons name="checkmark" size={50} color="#FFFFFF" /></View>
                            <Text style={styles.successTitle}>Tax Payment Successful</Text>
                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptValue}>TX-TAX-{Math.floor(Math.random() * 900000) + 100000}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Property ID</Text><Text style={styles.receiptValue}>{propertyId}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Tax Type</Text><Text style={styles.receiptValue}>{selectedCategory?.name}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount Paid</Text><Text style={styles.receiptValue}>₹{paymentAmount}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Payment Date</Text><Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text></View>
                            </View>
                            <View style={styles.successActionRow}>
                                <TouchableOpacity style={styles.receiptAction}><Ionicons name="download-outline" size={20} color="#0D47A1" /><Text style={styles.receiptActionText}>Download Receipt</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.receiptAction}><Ionicons name="share-social-outline" size={20} color="#0D47A1" /><Text style={styles.receiptActionText}>Share Receipt</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.backHomeButton} onPress={() => { setShowPaymentSuccess(false); router.back(); }}><Text style={styles.backHomeText}>Back to Municipal Taxes</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FA" },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
    headerSubtitle: { fontSize: 11, color: "#666", marginTop: 2 },
    placeholder: { width: 34 },
    scrollContent: { padding: 20 },
    content: { paddingVertical: 10 },
    sectionHeaderRow: { marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
    dropdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dropdownValue: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
    dropdownPlaceholder: { color: '#94A3B8' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    gridItem: { width: '48%', borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    gridLabel: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 4, textAlign: 'center' },
    gridDesc: { fontSize: 10, color: '#64748B', textAlign: 'center' },
    selectedServiceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingHorizontal: 4 },
    selectedServiceName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
    formCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    fieldGroup: { marginBottom: 15 },
    fieldLabel: { fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 6 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E0E0E0" },
    input: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },
    dropdownValueText: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333', fontWeight: '500' },
    actionButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    actionButtonText: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
    summaryCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, borderLeftWidth: 5, borderLeftColor: '#0D47A1', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 13, color: '#64748B' },
    summaryValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
    totalBanner: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 16, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#0369A1' },
    totalValue: { fontSize: 20, fontWeight: '900', color: '#0369A1' },
    formSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
    currencyPrefix: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    paymentModes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 10 },
    paymentModeCard: { flex: 1, minWidth: '45%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
    selectedPaymentModeCard: { borderColor: '#0D47A1', backgroundColor: '#F0F7FF' },
    paymentModeText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    selectedPaymentModeText: { color: '#0D47A1' },
    cardFormContainer: { marginTop: 15, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    row: { flexDirection: 'row' },
    declarationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
    declarationText: { flex: 1, fontSize: 11, color: '#64748B', lineHeight: 16 },
    footerButtons: { flexDirection: 'row', gap: 15, marginBottom: 40 },
    cancelButton: { flex: 0.4, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E2E8F0' },
    cancelButtonText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
    payButton: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    corpModalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, width: '100%', height: '85%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },

    modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', marginBottom: 15, paddingHorizontal: 15, height: 50, borderRadius: 12 },
    modalSearchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1E293B' },

    optionsList: { flex: 1 },
    optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    selectedOption: { backgroundColor: '#F0F7FF', borderRadius: 12, paddingHorizontal: 15, marginHorizontal: -15 },
    optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
    modalIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F8FE', justifyContent: 'center', alignItems: 'center' },
    optionText: { fontSize: 16, color: '#1E293B', fontWeight: 'bold' },
    selectedOptionText: { color: '#0D47A1' },
    optionDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },

    successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successCard: { backgroundColor: '#FFFFFF', borderRadius: 24, width: '100%', padding: 30, alignItems: 'center' },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 24, textAlign: 'center' },
    receipt: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 24 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    receiptLabel: { fontSize: 13, color: '#64748B' },
    receiptValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },
    successActionRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
    receiptAction: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    receiptActionText: { fontSize: 14, fontWeight: 'bold', color: '#0D47A1' },
    backHomeButton: { width: '100%', height: 56, backgroundColor: '#1E293B', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    backHomeText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
