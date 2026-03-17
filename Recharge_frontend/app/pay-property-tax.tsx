import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Image,
    Modal,
    FlatList
} from "react-native";

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // Step 1: Property Details
    propertyId: string;
    ownerName: string;
    mobileNumber: string;
    municipalCorporation: string;
    previousReceiptNo: string;

    // Step 2: Verification (Fetched Data)
    address: string;
    propertyType: string;
    taxYear: string;
    pendingDues: number;
    interest: number;
    totalAmount: number;

    // Consent
    confirmation: boolean;
}

interface DocumentsState {
    previousReceipt: DocumentType | null;
    [key: string]: DocumentType | null;
}

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
    { en: "Jalna Municipal Corporation (JMC)", mr: "जालना महानगरपालिका" },
];

export default function PayPropertyTaxScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [receiptNumber, setReceiptNumber] = useState("");

    const [documents, setDocuments] = useState<DocumentsState>({
        previousReceipt: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        propertyId: "",
        ownerName: "",
        mobileNumber: "",
        municipalCorporation: "",
        previousReceiptNo: "",
        address: "123, Heritage Residency, Model Colony, Pune - 411016",
        propertyType: "Residential",
        taxYear: "2023-2024",
        pendingDues: 4500,
        interest: 250,
        totalAmount: 4750,
        confirmation: false,
    });

    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCorporations, setFilteredCorporations] = useState(MUNICIPAL_CORPORATIONS);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        const filtered = MUNICIPAL_CORPORATIONS.filter(item =>
            item.en.toLowerCase().includes(text.toLowerCase()) ||
            item.mr.includes(text)
        );
        setFilteredCorporations(filtered);
    };

    const selectCorporation = (item: { en: string; mr: string }) => {
        setFormData({ ...formData, municipalCorporation: item.en });
        setShowModal(false);
        setSearchQuery("");
        setFilteredCorporations(MUNICIPAL_CORPORATIONS);
    };

    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1 && !paymentSuccess) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.back();
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep, paymentSuccess]);

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets) {
                const asset = result.assets[0];
                if (asset.size && asset.size > 5 * 1024 * 1024) {
                    Alert.alert("File Too Large", "File size must be below 5MB");
                    return;
                }
                setDocuments(prev => ({
                    ...prev,
                    [docType]: {
                        name: asset.name,
                        size: asset.size,
                        uri: asset.uri
                    }
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const removeDocument = (docType: keyof DocumentsState) => {
        setDocuments(prev => ({ ...prev, [docType]: null }));
    };

    const handleSendOtp = () => {
        if (formData.mobileNumber.length !== 10) {
            Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number");
            return;
        }
        setIsOtpSent(true);
        Alert.alert("OTP Sent", "A verification code has been sent to your registered mobile number");
    };

    const handleVerifyOtp = () => {
        if (otp.length === 6) {
            setIsOtpVerified(true);
            Alert.alert("Verified", "Mobile number verified successfully");
        } else {
            Alert.alert("Error", "Please enter a valid 6-digit OTP");
        }
    };

    const handleFetchDetails = () => {
        if (!formData.propertyId || !formData.ownerName || formData.mobileNumber.length !== 10 || !formData.municipalCorporation) {
            Alert.alert("Required", "Please fill all mandatory property details");
            return;
        }
        if (!isOtpVerified) {
            Alert.alert("Verification Required", "Please verify your mobile number with OTP");
            return;
        }

        setIsFetchingData(true);
        // Simulate API fetch
        setTimeout(() => {
            setIsFetchingData(false);
            setCurrentStep(2);
        }, 1500);
    };

    const handleProceedToPayment = () => {
        if (!formData.confirmation) {
            Alert.alert("Confirmation Required", "Please confirm that the property details are correct");
            return;
        }
        setCurrentStep(3);
    };

    const handlePayment = (method: string) => {
        setIsSubmitting(true);
        // Simulate payment gateway
        setTimeout(() => {
            const tId = "TXN" + Math.floor(Math.random() * 90000000 + 10000000);
            const rId = "RCP" + Math.floor(Math.random() * 900000 + 100000);
            setTransactionId(tId);
            setReceiptNumber(rId);
            setIsSubmitting(false);
            setPaymentSuccess(true);
        }, 2500);
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            <View style={styles.progressLine}>
                <View style={[styles.progressLineActive, { width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }]} />
            </View>
            <View style={styles.stepsRow}>
                {[1, 2, 3].map((s) => (
                    <View key={s} style={styles.stepItem}>
                        <View style={[styles.stepCircle, currentStep >= s && styles.stepCircleActive, currentStep > s && styles.stepCircleCompleted]}>
                            {currentStep > s ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[styles.stepNumber, currentStep >= s && styles.stepNumberActive]}>{s}</Text>}
                        </View>
                        <Text style={[styles.stepLabel, currentStep >= s && styles.stepLabelActive]}>
                            {s === 1 ? "Property\nDetails" : s === 2 ? "Verification" : "Payment"}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    if (paymentSuccess) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={styles.successTitle}>Payment Successful!</Text>
                    <Text style={styles.successSubtitle}>Your property tax payment has been processed successfully.</Text>

                    <View style={styles.receiptCard}>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Transaction ID</Text>
                            <Text style={styles.receiptValue}>{transactionId}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Receipt Number</Text>
                            <Text style={styles.receiptValue}>{receiptNumber}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Amount Paid</Text>
                            <Text style={styles.receiptValue}>₹{formData.totalAmount.toLocaleString()}</Text>
                        </View>
                        <View style={styles.receiptRow}>
                            <Text style={styles.receiptLabel}>Date</Text>
                            <Text style={styles.receiptValue}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                        </View>
                    </View>

                    <View style={styles.successActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}><Ionicons name="download-outline" size={24} color="#0D47A1" /></View>
                            <Text style={styles.actionText}>Download{"\n"}Receipt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F1F8E9' }]}><Ionicons name="share-social-outline" size={24} color="#2E7D32" /></View>
                            <Text style={styles.actionText}>Share{"\n"}Receipt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}><Ionicons name="time-outline" size={24} color="#E65100" /></View>
                            <Text style={styles.actionText}>View{"\n"}History</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.back()}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                            <Text style={styles.mainBtnText}>Return to Services</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Pay Property Tax</Text>
                        <Text style={styles.headerSubtitle}>Official Payment Gateway</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                    {currentStep === 1 && (
                        <View>
                            {/* Documents Required Display */}
                            <View style={styles.docsRequiredBox}>
                                <View style={styles.docsHeader}>
                                    <Ionicons name="document-text-outline" size={20} color="#0D47A1" />
                                    <Text style={styles.docsTitle}>Documents Required – Property Tax</Text>
                                </View>
                                <View style={styles.docsList}>
                                    <Text style={styles.docBullet}>• Property Number / Property ID</Text>
                                    <Text style={styles.docBullet}>• Previous Tax Receipt</Text>
                                    <Text style={styles.docBullet}>• Owner Name</Text>
                                    <Text style={styles.docBullet}>• Registered Mobile Number</Text>
                                </View>
                            </View>

                            <SectionTitle title="Property Information" icon="home" />
                            <View style={styles.formCard}>
                                <Label text="Municipal Corporation *" />
                                <TouchableOpacity
                                    style={styles.dropdownTrigger}
                                    onPress={() => setShowModal(!showModal)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <Ionicons name="business-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                                        <Text style={[styles.dropdownText, !formData.municipalCorporation && { color: '#94A3B8' }]} numberOfLines={1}>
                                            {formData.municipalCorporation || "Select Municipal Corporation"}
                                        </Text>
                                    </View>
                                    <Ionicons name={showModal ? "chevron-up" : "chevron-down"} size={18} color="#0D47A1" />
                                </TouchableOpacity>

                                {showModal && (
                                    <View style={styles.inlineDropdown}>
                                        <View style={styles.dropdownSearchContainer}>
                                            <Ionicons name="search" size={16} color="#94A3B8" />
                                            <TextInput
                                                style={styles.dropdownSearchInput}
                                                placeholder="Search Corporation..."
                                                value={searchQuery}
                                                onChangeText={handleSearch}
                                                autoFocus={true}
                                            />
                                        </View>
                                        <View style={{ maxHeight: 250 }}>
                                            <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                                {filteredCorporations.map((item) => (
                                                    <TouchableOpacity
                                                        key={item.en}
                                                        style={styles.dropdownItem}
                                                        onPress={() => selectCorporation(item)}
                                                    >
                                                        <Text style={styles.dropdownItemEn}>{item.en}</Text>
                                                        <Text style={styles.dropdownItemMr}>{item.mr}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                                {filteredCorporations.length === 0 && (
                                                    <Text style={styles.noResults}>No corporations found</Text>
                                                )}
                                            </ScrollView>
                                        </View>
                                    </View>
                                )}

                                <Label text="Property Number / Property ID *" />
                                <Input value={formData.propertyId} onChangeText={(v: string) => setFormData({ ...formData, propertyId: v })} placeholder="Enter Property ID (e.g. PN-123456)" icon="barcode-outline" />

                                <Label text="Owner Name *" />
                                <Input value={formData.ownerName} onChangeText={(v: string) => setFormData({ ...formData, ownerName: v })} placeholder="Enter owner name" icon="person-outline" />

                                <Label text="Registered Mobile Number *" />
                                <View style={styles.otpInputContainer}>
                                    <View style={{ flex: 1 }}>
                                        <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="Enter Mobile Number" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    {!isOtpVerified && (
                                        <TouchableOpacity style={[styles.otpBtn, isOtpSent && styles.otpBtnDisabled]} onPress={handleSendOtp}>
                                            <Text style={styles.otpBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                        </TouchableOpacity>
                                    )}
                                    {isOtpVerified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                                        </View>
                                    )}
                                </View>

                                {isOtpSent && !isOtpVerified && (
                                    <View style={{ marginTop: 15 }}>
                                        <Label text="Enter 6-digit OTP *" />
                                        <View style={styles.otpInputContainer}>
                                            <View style={{ flex: 1 }}>
                                                <Input value={otp} onChangeText={setOtp} placeholder="Enter OTP" keyboardType="number-pad" maxLength={6} icon="shield-checkmark-outline" />
                                            </View>
                                            <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyOtp}>
                                                <Text style={styles.verifyBtnText}>Verify</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>

                            <SectionTitle title="Previous Tax Details" icon="time" />
                            <View style={styles.formCard}>
                                <Label text="Previous Tax Receipt Number (Optional)" />
                                <Input value={formData.previousReceiptNo} onChangeText={(v: string) => setFormData({ ...formData, previousReceiptNo: v })} placeholder="e.g. 2022-23/A123" icon="document-text-outline" />

                                <Label text="Upload Previous Tax Receipt" />
                                <DocUploadItem
                                    title="Previous Receipt"
                                    hint="PDF/JPG/PNG (Max 5MB)"
                                    isUploaded={!!documents.previousReceipt}
                                    filename={documents.previousReceipt?.name}
                                    onUpload={() => pickDocument('previousReceipt')}
                                    onRemove={() => removeDocument('previousReceipt')}
                                    icon="file-upload-outline"
                                    color="#0D47A1"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 10 }]}
                                onPress={handleFetchDetails}
                                disabled={isFetchingData}
                            >
                                <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                                    {isFetchingData ? <ActivityIndicator color="#FFF" /> : (
                                        <>
                                            <Text style={styles.actionButtonText}>Fetch Tax Details</Text>
                                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View>
                            <SectionTitle title="Property Summary" icon="list-circle" />
                            <View style={styles.summaryCard}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Property ID</Text>
                                    <Text style={styles.summaryValue}>{formData.propertyId}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Owner Name</Text>
                                    <Text style={styles.summaryValue}>{formData.ownerName}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Address</Text>
                                    <Text style={styles.summaryValue}>{formData.address}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Property Type</Text>
                                    <Text style={styles.summaryValue}>{formData.propertyType}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Tax Year</Text>
                                    <Text style={styles.summaryValue}>{formData.taxYear}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Pending Dues</Text>
                                    <Text style={styles.summaryValue}>₹{formData.pendingDues.toLocaleString()}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Interest / Penalty</Text>
                                    <Text style={styles.summaryValue}>₹{formData.interest.toLocaleString()}</Text>
                                </View>
                                <View style={[styles.summaryRow, { marginTop: 10 }]}>
                                    <Text style={styles.totalLabel}>Total Payable</Text>
                                    <Text style={styles.totalValue}>₹{formData.totalAmount.toLocaleString()}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.confirmationRow}
                                onPress={() => setFormData({ ...formData, confirmation: !formData.confirmation })}
                            >
                                <Ionicons name={formData.confirmation ? "checkbox" : "square-outline"} size={24} color={formData.confirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.confirmationLabel}>I confirm that the details are correct.</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 20 }]}
                                onPress={handleProceedToPayment}
                            >
                                <LinearGradient colors={['#2E7D32', '#388E3C']} style={styles.btnGrad}>
                                    <Text style={styles.actionButtonText}>Proceed to Payment</Text>
                                    <Ionicons name="card-outline" size={18} color="#FFF" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View>
                            <SectionTitle title="Payment Options" icon="wallet" />
                            <View style={styles.paymentContainer}>
                                <PaymentOption icon="wallet-outline" title="Wallet" subtitle="Pay via App Wallet" onPress={() => handlePayment('WALLET')} />
                                <PaymentOption icon="card-outline" title="Debit Card" subtitle="All Indian Banks" onPress={() => handlePayment('DEBIT')} />
                                <PaymentOption icon="card" title="Credit Card" subtitle="Visa, Master, Amex" onPress={() => handlePayment('CREDIT')} />
                                <PaymentOption icon="globe-outline" title="Net Banking" subtitle="Fast & Secure" onPress={() => handlePayment('NB')} />
                            </View>

                            <View style={styles.secureBadge}>
                                <MaterialCommunityIcons name="shield-check" size={20} color="#2E7D32" />
                                <Text style={styles.secureText}>Secure Payment Gateway</Text>
                            </View>

                            {isSubmitting && (
                                <View style={styles.overlay}>
                                    <View style={styles.loadingBox}>
                                        <ActivityIndicator size="large" color="#0D47A1" />
                                        <Text style={styles.loadingText}>Processing Secure Payment...</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const SectionTitle = ({ title, icon }: { title: string, icon: any }) => (
    <View style={styles.cardHeader}>
        <View style={styles.cardHeaderIcon}>
            <Ionicons name={icon as any} size={20} color="#0D47A1" />
        </View>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
    </View>
);
const Label = ({ text }: { text: string }) => <Text style={styles.inputLabel}>{text}</Text>;
const Input = ({ icon, ...props }: any) => (
    <View style={styles.inputContainer}>
        {icon && <Ionicons name={icon as any} size={18} color="#94A3B8" style={{ marginRight: 10 }} />}
        <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
    </View>
);

const DocUploadItem = ({ title, hint, isUploaded, filename, onUpload, onRemove, icon, color }: any) => (
    <TouchableOpacity style={[styles.docUploadCard, isUploaded && styles.docUploadCardActive]} onPress={onUpload}>
        <View style={[styles.docIconCircle, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon as any} size={24} color={isUploaded ? "#FFF" : color} style={isUploaded && { backgroundColor: color, borderRadius: 12, padding: 4 }} />
        </View>
        <View style={styles.docTextContent}>
            <Text style={styles.docTitle}>{title}</Text>
            <Text style={styles.docHint}>{filename || hint}</Text>
        </View>
        {isUploaded ? (
            <TouchableOpacity onPress={onRemove} style={styles.removeIcon}><Ionicons name="close-circle" size={24} color="#EF4444" /></TouchableOpacity>
        ) : (
            <Ionicons name="cloud-upload-outline" size={24} color="#94A3B8" />
        )}
    </TouchableOpacity>
);

const PaymentOption = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.paymentOption} onPress={onPress}>
        <View style={styles.paymentIconBox}>
            <Ionicons name={icon} size={24} color="#0D47A1" />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.paymentTitle}>{title}</Text>
            <Text style={styles.paymentSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFFFFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
    placeholder: { width: 32 },
    stepIndicatorContainer: { backgroundColor: '#FFF', paddingBottom: 20, paddingHorizontal: 30 },
    progressLine: { position: 'absolute', top: 17, left: 60, right: 60, height: 2, backgroundColor: '#F1F5F9' },
    progressLineActive: { height: '100%', backgroundColor: '#0D47A1' },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { alignItems: 'center' },
    stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    stepCircleActive: { borderColor: '#0D47A1' },
    stepCircleCompleted: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    stepNumber: { fontSize: 14, fontWeight: '700', color: '#CBD5E1' },
    stepNumberActive: { color: '#0D47A1' },
    stepLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8', marginTop: 6, textAlign: 'center' },
    stepLabelActive: { color: '#0D47A1' },
    scrollContent: { padding: 20 },
    docsRequiredBox: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 16, marginBottom: 20 },
    docsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    docsTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1' },
    docsList: { gap: 4 },
    docBullet: { fontSize: 12, color: '#1E3A8A', fontWeight: '500' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 10 },
    cardHeaderIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
    cardHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 12 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 50 },
    input: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500' },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 50 },
    dropdownText: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
    otpInputContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    otpBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#BBDEFB' },
    otpBtnDisabled: { opacity: 0.6 },
    otpBtnText: { color: '#0D47A1', fontWeight: '700', fontSize: 12 },
    verifiedBadge: { padding: 5 },
    verifyBtn: { backgroundColor: '#0D47A1', paddingHorizontal: 20, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    verifyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 5 },
    docUploadCardActive: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
    docIconCircle: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    docTextContent: { flex: 1, marginLeft: 12 },
    docTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 11, color: '#64748B', marginTop: 2 },
    removeIcon: { padding: 4 },
    actionButton: { borderRadius: 16, overflow: 'hidden' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
    actionButtonText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    summaryCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 13, color: '#64748B' },
    summaryValue: { fontSize: 14, fontWeight: '700', color: '#1E293B', textAlign: 'right', flex: 1, marginLeft: 20 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
    totalLabel: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    totalValue: { fontSize: 18, fontWeight: '900', color: '#2E7D32' },
    confirmationRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10 },
    confirmationLabel: { flex: 1, fontSize: 14, color: '#475569', fontWeight: '600' },
    paymentContainer: { gap: 12 },
    paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    paymentIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    paymentTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    paymentSubtitle: { fontSize: 12, color: '#64748B' },
    secureBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25 },
    secureText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    loadingBox: { backgroundColor: '#FFF', padding: 30, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    loadingText: { marginTop: 15, fontSize: 14, fontWeight: '700', color: '#1E293B' },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 35, lineHeight: 22 },
    receiptCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 20, width: '100%', marginBottom: 35, borderWidth: 1, borderColor: '#E2E8F0' },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    receiptLabel: { fontSize: 13, color: '#64748B' },
    receiptValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    successActions: { flexDirection: 'row', gap: 10, marginBottom: 35 },
    actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 10, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    mainBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '80%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    closeBtn: {
        padding: 4,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        margin: 20,
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        height: 50,
        marginLeft: 10,
        fontSize: 14,
        color: '#1E293B',
    },
    corporationItem: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    corporationNameEn: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    corporationNameMr: {
        fontSize: 13,
        color: '#64748B',
    },
    // Inline Dropdown Styles
    inlineDropdown: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFF',
    },
    dropdownSearchInput: {
        flex: 1,
        height: 45,
        marginLeft: 8,
        fontSize: 14,
        color: '#1E293B',
    },
    dropdownItem: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    dropdownItemEn: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2,
    },
    dropdownItemMr: {
        fontSize: 12,
        color: '#64748B',
    },
    noResults: {
        padding: 20,
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 14,
    },
});
