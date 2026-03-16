import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
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

interface BillDetails {
    patientName: string;
    hospitalName: string;
    billNumber: string;
    treatmentName: string;
    billDate: string;
    roomCharges: number;
    testCharges: number;
    consultationFees: number;
    otherCharges: number;
    totalPayable: number;
}

const serviceTypes = [
    { id: '1', name: "Hospital Bill Payment", desc: "Pay admission / treatment bill", icon: "hospital-building" },
    { id: '2', name: "Pathology Lab", desc: "Pay for lab tests and diagnostics", icon: "test-tube" },
    { id: '3', name: "Doctor Consultation", desc: "Pay consultation fees", icon: "stethoscope" },
    { id: '4', name: "Health Packages", desc: "Book preventive checkups", icon: "heart-pulse" },
];

const popularProviders = [
    { id: '1', name: "Apollo Hospitals", type: "Multi-speciality", icon: "hospital-marker" },
    { id: '2', name: "Max Healthcare", type: "Multi-speciality", icon: "hospital-marker" },
    { id: '3', name: "Fortis Hospital", type: "Multi-speciality", icon: "hospital-marker" },
    { id: '4', name: "Lal PathLabs", type: "Diagnostic Lab", icon: "flask-outline" },
    { id: '5', name: "SRL Diagnostics", type: "Diagnostic Lab", icon: "flask-outline" },
    { id: '6', name: "City Imaging Center", type: "Imaging Center", icon: "radiology-box" },
];

const allProviders = [
    "Apollo Hospitals", "Max Healthcare", "Fortis Hospital", "Lal PathLabs", "SRL Diagnostics",
    "City Imaging Center", "Medanta - The Medicity", "AIIMS Delhi", "Manipal Hospital",
    "Thyrocare Technologies", "Metropolis Healthcare", "Dr. Dang's Lab", "Sir Ganga Ram Hospital"
];

const HospitalPathologyScreen = () => {
    const router = useRouter();

    // UI States
    const [selectedService, setSelectedService] = useState("");
    const [selectedProvider, setSelectedProvider] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [billDetails, setBillDetails] = useState<BillDetails | null>(null);

    // Form States
    const [patientName, setPatientName] = useState("");
    const [uhid, setUhid] = useState("");
    const [mobile, setMobile] = useState("");
    const [dob, setDob] = useState("");
    const [department, setDepartment] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({});

    // Payment States
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const handleBack = useCallback(() => {
        if (billDetails) {
            setBillDetails(null);
            return true;
        }
        if (selectedProvider) {
            setSelectedProvider("");
            return true;
        }
        if (selectedService) {
            setSelectedService("");
            return true;
        }
        router.back();
        return true;
    }, [router, selectedService, selectedProvider, billDetails]);

    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBack);
            return () => backHandler.remove();
        }, [handleBack])
    );

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

    const handlePickDocument = async (docName: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setUploadedDocs(prev => ({
                    ...prev,
                    [docName]: asset.name
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to pick document");
        }
    };

    const handleRemoveDocument = (docName: string) => {
        setUploadedDocs(prev => {
            const updated = { ...prev };
            delete updated[docName];
            return updated;
        });
    };

    const handleFetchBill = () => {
        if (!patientName || mobile.length !== 10) {
            Alert.alert("Error", "Please enter Patient Name and a valid Mobile Number.");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const mockBill: BillDetails = {
                patientName: patientName,
                hospitalName: selectedProvider,
                billNumber: `HB-${Math.floor(100000 + Math.random() * 900000)}`,
                treatmentName: department || "General Checkup",
                billDate: new Date().toLocaleDateString(),
                roomCharges: selectedService === "Hospital Bill Payment" ? 12000 : 0,
                testCharges: selectedService === "Pathology Lab" ? 3500 : 0,
                consultationFees: 800,
                otherCharges: 450,
                totalPayable: 0,
            };
            mockBill.totalPayable = mockBill.roomCharges + mockBill.testCharges + mockBill.consultationFees + mockBill.otherCharges;

            setBillDetails(mockBill);
            setIsLoading(false);

            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
        }, 1500);
    };

    const isReadyToPay = () => {
        if (!isConfirmed || !selectedPaymentMode || !billDetails) return false;

        if (selectedPaymentMode.includes("Card")) {
            if (!cardNumber || cardNumber.length < 19 || !expiryDate || expiryDate.length < 5 || !cvv || cvv.length < 3 || !cardHolder) return false;
        }
        return true;
    };

    const handleProceed = () => {
        if (!isReadyToPay()) {
            Alert.alert("Required", "Please complete all details and confirm the declaration.");
            return;
        }

        if (selectedPaymentMode === 'Wallet') {
            router.replace({
                pathname: "/wallet" as any,
                params: {
                    amount: billDetails?.totalPayable.toString(),
                    billType: "medical",
                    borrowerName: billDetails?.patientName,
                    loanAccountNumber: uhid || billDetails?.billNumber,
                    lenderName: selectedProvider,
                },
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowSuccess(true);
        }, 2000);
    };

    const filteredProviders = allProviders.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Hospital & Pathology</Text>
                        <Text style={styles.headerSubtitle}>Pay medical bills and book diagnostic tests</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>
                            {!selectedService ? (
                                <>
                                    <Text style={styles.sectionTitle}>Select Service Type</Text>
                                    <View style={styles.grid}>
                                        {serviceTypes.map((item) => (
                                            <TouchableOpacity key={item.id} style={styles.serviceRow} onPress={() => setSelectedService(item.name)}>
                                                <View style={styles.iconCircleBackground}>
                                                    <MaterialCommunityIcons name={item.icon as any} size={28} color="#0D47A1" />
                                                </View>
                                                <View style={{ flex: 1, marginLeft: 15 }}>
                                                    <Text style={styles.serviceName}>{item.name}</Text>
                                                    <Text style={styles.serviceDesc}>{item.desc}</Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : !selectedProvider ? (
                                <>
                                    <TouchableOpacity style={styles.searchBar} onPress={() => setShowSearchModal(true)}>
                                        <Ionicons name="search" size={20} color="#64748B" />
                                        <Text style={styles.searchBarText}>Search Hospital / Diagnostic Lab</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.sectionTitle}>Popular Options</Text>
                                    <View style={styles.gridMain}>
                                        {popularProviders.map((item) => (
                                            <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => setSelectedProvider(item.name)}>
                                                <View style={styles.iconCircleBackground}>
                                                    <MaterialCommunityIcons name={item.icon as any} size={28} color="#0D47A1" />
                                                </View>
                                                <Text style={styles.gridLabel}>{item.name}</Text>
                                                <Text style={styles.gridSubLabel}>{item.type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            ) : !billDetails ? (
                                <View style={styles.formCard}>
                                    <View style={styles.selectedHeader}>
                                        <MaterialCommunityIcons name="hospital-marker" size={32} color="#0D47A1" />
                                        <View style={{ marginLeft: 12, flex: 1 }}>
                                            <Text style={styles.selectedLabel}>{selectedService}</Text>
                                            <Text style={styles.selectedName}>{selectedProvider}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedProvider("")}>
                                            <Text style={styles.changeText}>Change</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.divider} />

                                    <Text style={styles.formTitle}>Patient Information</Text>
                                    <View style={styles.fieldGroup}>
                                        <Text style={styles.fieldLabel}>Patient Name *</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="Enter Patient Full Name" value={patientName} onChangeText={setPatientName} />
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                            <Text style={styles.fieldLabel}>UHID / Patient ID</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input} placeholder="e.g. PAT-12345" value={uhid} onChangeText={setUhid} />
                                            </View>
                                        </View>
                                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                                            <Text style={styles.fieldLabel}>Mobile Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input} placeholder="10 digit" keyboardType="phone-pad" maxLength={10} value={mobile} onChangeText={setMobile} />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                            <Text style={styles.fieldLabel}>Date of Birth</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input} placeholder="DD/MM/YYYY" value={dob} onChangeText={setDob} />
                                            </View>
                                        </View>
                                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                                            <Text style={styles.fieldLabel}>Dept / Test Type</Text>
                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input} placeholder="e.g. Cardiology" value={department} onChangeText={setDepartment} />
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.fetchBtn} onPress={handleFetchBill}>
                                        <LinearGradient colors={["#0D47A1", "#1565C0"]} style={styles.gradientBtn}>
                                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Fetch Bill Details</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                    {/* Bill Summary Card */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialCommunityIcons name="medical-bag" size={24} color="#0D47A1" />
                                            <Text style={styles.summaryTitle}>Bill Summary</Text>
                                        </View>
                                        <View style={styles.divider} />
                                        <View style={styles.summaryInfo}>
                                            <Text style={styles.summaryMainText}>{billDetails.patientName}</Text>
                                            <Text style={styles.summarySubText}>{selectedProvider} | Bill: {billDetails.billNumber}</Text>
                                            <Text style={styles.summarySubText}>Treatement: {billDetails.treatmentName}</Text>
                                        </View>
                                        <View style={styles.breakdown}>
                                            {billDetails.roomCharges > 0 && <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Room Charges</Text><Text style={styles.breakdownValue}>₹{billDetails.roomCharges.toFixed(2)}</Text></View>}
                                            {billDetails.testCharges > 0 && <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Test Charges</Text><Text style={styles.breakdownValue}>₹{billDetails.testCharges.toFixed(2)}</Text></View>}
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Consultation</Text><Text style={styles.breakdownValue}>₹{billDetails.consultationFees.toFixed(2)}</Text></View>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Other Charges</Text><Text style={styles.breakdownValue}>₹{billDetails.otherCharges.toFixed(2)}</Text></View>
                                        </View>
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Total Payable</Text>
                                            <Text style={styles.totalValue}>₹{billDetails.totalPayable.toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    {/* Document Upload Section */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Optional Documents</Text>
                                        <Text style={styles.uploadInfo}>Upload for hospital records (PDF/JPG/PNG)</Text>
                                        {["Doctor Prescription", "Lab Test Request Slip", "Insurance Card Copy"].map((doc) => (
                                            <TouchableOpacity key={doc} style={[styles.uploadItem, uploadedDocs[doc] && styles.uploadedItem]} onPress={() => handlePickDocument(doc)}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.uploadItemText}>{doc}</Text>
                                                    {uploadedDocs[doc] && <Text style={styles.fileName} numberOfLines={1}>{uploadedDocs[doc]}</Text>}
                                                </View>
                                                {uploadedDocs[doc] ? (
                                                    <TouchableOpacity onPress={() => handleRemoveDocument(doc)}>
                                                        <Ionicons name="close-circle" size={20} color="#DC2626" />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Ionicons name="cloud-upload-outline" size={20} color="#0D47A1" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Payment Section */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Payment Mode</Text>
                                        <View style={styles.paymentModesGrid}>
                                            {['Wallet', 'Debit Card', 'Credit Card', 'Net Banking'].map((mode) => (
                                                <TouchableOpacity key={mode} style={[styles.modeCard, selectedPaymentMode === mode && styles.selectedModeCard]} onPress={() => setSelectedPaymentMode(mode)}>
                                                    <Ionicons name={mode.includes('Card') ? 'card' : mode === 'Wallet' ? 'wallet' : 'globe'} size={20} color={selectedPaymentMode === mode ? '#0D47A1' : '#64748B'} />
                                                    <Text style={[styles.modeText, selectedPaymentMode === mode && styles.selectedModeText]}>{mode}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {selectedPaymentMode.includes("Card") && (
                                            <View style={styles.cardFormContainer}>
                                                <View style={styles.fieldGroup}>
                                                    <Text style={styles.fieldLabel}>Card Details</Text>
                                                    <View style={styles.inputContainer}>
                                                        <TextInput style={styles.input} placeholder="0000 0000 0000 0000" keyboardType="numeric" value={cardNumber} onChangeText={handleCardNumberChange} maxLength={19} />
                                                    </View>
                                                </View>
                                                <View style={styles.row}>
                                                    <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}><View style={styles.inputContainer}><TextInput style={styles.input} placeholder="MM/YY" keyboardType="numeric" value={expiryDate} onChangeText={handleExpiryChange} maxLength={5} /></View></View>
                                                    <View style={[styles.fieldGroup, { flex: 1 }]}><View style={styles.inputContainer}><TextInput style={styles.input} placeholder="CVV" keyboardType="numeric" secureTextEntry value={cvv} onChangeText={setCvv} maxLength={3} /></View></View>
                                                </View>
                                                <View style={styles.inputContainer}><TextInput style={styles.input} placeholder="Name on Card" value={cardHolder} onChangeText={setCardHolder} autoCapitalize="characters" /></View>
                                            </View>
                                        )}
                                    </View>

                                    <TouchableOpacity style={styles.declarationRow} onPress={() => setIsConfirmed(!isConfirmed)}>
                                        <Ionicons name={isConfirmed ? "checkbox" : "square-outline"} size={22} color={isConfirmed ? "#0D47A1" : "#64748B"} />
                                        <Text style={styles.declarationText}>I confirm that the above medical details are correct and authorize this payment.</Text>
                                    </TouchableOpacity>

                                    <View style={styles.footer}>
                                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setBillDetails(null)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
                                        <TouchableOpacity style={{ flex: 1 }} onPress={handleProceed}>
                                            <LinearGradient colors={!isReadyToPay() ? ["#E2E8F0", "#E2E8F0"] : ["#0D47A1", "#1565C0"]} style={styles.payBtn}>
                                                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnText}>Proceed to Pay</Text>}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Search Modal */}
                <Modal visible={showSearchModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Provider</Text>
                                <TouchableOpacity onPress={() => setShowSearchModal(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearchBox}>
                                <Ionicons name="search" size={20} color="#64748B" />
                                <TextInput style={styles.modalSearchInput} placeholder="Search Hospital or Lab..." value={searchQuery} onChangeText={setSearchQuery} />
                            </View>
                            <ScrollView style={styles.modalList}>
                                {filteredProviders.map((p, idx) => (
                                    <TouchableOpacity key={idx} style={styles.modalItem} onPress={() => { setSelectedProvider(p); setShowSearchModal(false); }}>
                                        <Text style={styles.modalItemText}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Success Modal */}
                <Modal visible={showSuccess} transparent animationType="fade">
                    <View style={styles.successOverlay}>
                        <View style={styles.successCard}>
                            <View style={styles.checkCircle}><Ionicons name="checkmark" size={40} color="#FFF" /></View>
                            <Text style={styles.successTitle}>Payment Successful</Text>
                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptValue}>MED-{Math.floor(Math.random() * 1000000)}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Patient</Text><Text style={styles.receiptValue}>{billDetails?.patientName}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Hospital/Lab</Text><Text style={styles.receiptValue}>{selectedProvider}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount Paid</Text><Text style={styles.receiptValue}>₹{billDetails?.totalPayable.toFixed(2)}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Date</Text><Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text></View>
                            </View>
                            <View style={styles.successActions}>
                                <TouchableOpacity style={styles.actionBtn}><Ionicons name="download-outline" size={20} color="#0D47A1" /><Text style={styles.actionBtnText}>Download</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-social-outline" size={20} color="#0D47A1" /><Text style={styles.actionBtnText}>Share</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.backHomeBtn} onPress={() => { setShowSuccess(false); router.back(); }}><Text style={styles.backHomeText}>Back to Services</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
};

export default HospitalPathologyScreen;

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
    sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1E293B", marginBottom: 12 },
    grid: { marginBottom: 20 },
    serviceRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
    serviceName: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
    serviceDesc: { fontSize: 12, color: "#64748B", marginTop: 2 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
    searchBarText: { marginLeft: 10, color: "#94A3B8", fontSize: 14 },
    gridMain: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    gridItem: { width: "31%", backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9" },
    iconCircleBackground: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
    gridLabel: { fontSize: 11, textAlign: "center", color: "#1E293B", fontWeight: "600", marginTop: 8 },
    gridSubLabel: { fontSize: 9, textAlign: "center", color: "#64748B", marginTop: 2 },
    formCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
    selectedHeader: { flexDirection: "row", alignItems: "center", paddingBottom: 16 },
    selectedLabel: { fontSize: 10, color: "#1D4ED8", textTransform: "uppercase", fontWeight: "700" },
    selectedName: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
    changeText: { color: "#0D47A1", fontSize: 12, fontWeight: "600" },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 16 },
    formTitle: { fontSize: 15, fontWeight: "600", color: "#1E293B", marginBottom: 16 },
    fieldGroup: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, color: "#64748B", marginBottom: 6, fontWeight: "500" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E2E8F0" },
    input: { flex: 1, fontSize: 14, color: "#334155", marginLeft: 8 },
    row: { flexDirection: "row" },
    fetchBtn: { marginTop: 8 },
    gradientBtn: { height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    btnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
    summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
    summaryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    summaryTitle: { fontSize: 16, fontWeight: "700", color: "#0D47A1", marginLeft: 10 },
    summaryInfo: { marginBottom: 16 },
    summaryMainText: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
    summarySubText: { fontSize: 13, color: "#64748B", marginTop: 2 },
    breakdown: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, marginBottom: 16 },
    breakdownRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    breakdownLabel: { fontSize: 13, color: "#64748B" },
    breakdownValue: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
    totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 12 },
    totalLabel: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
    totalValue: { fontSize: 18, fontWeight: "800", color: "#0D47A1" },
    uploadInfo: { fontSize: 12, color: "#94A3B8", marginBottom: 12 },
    uploadItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
    uploadedItem: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
    uploadItemText: { fontSize: 13, color: "#475569", fontWeight: "500" },
    fileName: { fontSize: 11, color: "#22C55E", marginTop: 2 },
    paymentModesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 8 },
    modeCard: { width: "48%", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9", flexDirection: "row" },
    selectedModeCard: { backgroundColor: "#EFF6FF", borderColor: "#0D47A1" },
    modeText: { marginLeft: 8, fontSize: 13, color: "#475569" },
    selectedModeText: { color: "#0D47A1", fontWeight: "600" },
    cardFormContainer: { marginTop: 15, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    declarationRow: { flexDirection: "row", paddingHorizontal: 4, marginBottom: 24 },
    declarationText: { flex: 1, fontSize: 12, color: "#64748B", marginLeft: 10, lineHeight: 18 },
    footer: { flexDirection: "row", alignItems: "center" },
    cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 12 },
    cancelBtnText: { color: "#64748B", fontWeight: "600" },
    payBtn: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center", flex: 1 },
    payBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: "80%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
    modalSearchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 16 },
    modalSearchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
    modalList: { flex: 1 },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    modalItemText: { fontSize: 15, color: "#334155" },
    successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
    successCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 24, alignItems: "center" },
    checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#22C55E", justifyContent: "center", alignItems: "center", marginBottom: 16 },
    successTitle: { fontSize: 22, fontWeight: "700", color: "#1E293B", marginBottom: 24 },
    receipt: { width: "100%", backgroundColor: "#F8FAFC", padding: 16, borderRadius: 16, marginBottom: 24 },
    receiptRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    receiptLabel: { fontSize: 13, color: "#64748B" },
    receiptValue: { fontSize: 13, fontWeight: "600", color: "#1E293B", textAlign: "right", flex: 1, marginLeft: 20 },
    successActions: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 16 },
    actionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, width: "48%", justifyContent: "center" },
    actionBtnText: { marginLeft: 8, fontSize: 14, color: "#0D47A1", fontWeight: "600" },
    backHomeBtn: { width: "100%", paddingVertical: 14, alignItems: "center" },
    backHomeText: { color: "#0D47A1", fontWeight: "700", fontSize: 15 },
});
