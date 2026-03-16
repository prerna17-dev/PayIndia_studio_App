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

interface EducationFeeDetails {
    studentName: string;
    studentId: string;
    course: string;
    academicYear: string;
    tuitionFees: number;
    examFees: number;
    libraryFees: number;
    labFees: number;
    otherCharges: number;
    lateFee: number;
    totalPayable: number;
}

const popularInstitutions = [
    { id: '1', name: "School Fees", icon: "school-outline" },
    { id: '2', name: "Junior College", icon: "bank-outline" },
    { id: '3', name: "Degree College", icon: "certificate-outline" },
    { id: '4', name: "University", icon: "town-hall" },
    { id: '5', name: "Coaching Institute", icon: "book-open-variant" },
    { id: '6', name: "Exam Board", icon: "clipboard-text-outline" },
];

const allInstitutions = [
    "St. Xavier's High School", "Delhi Public School", "City International College",
    "State University of Mumbai", "IIT Coaching Center", "CBSE Board",
    "Don Bosco High School", "Junior College of Commerce", "Modern Arts College",
    "Engineering University of Pune", "Medical Science Institute", "Primary School Board"
];

const academicYears = ["2023-24", "2024-25", "2025-26", "2026-27"];

const EducationFeesScreen = () => {
    const router = useRouter();

    // UI States
    const [selectedInstitution, setSelectedInstitution] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [feeDetails, setFeeDetails] = useState<EducationFeeDetails | null>(null);
    const [manualEntry, setManualEntry] = useState(false);

    // Form States
    const [studentName, setStudentName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [aadhaar, setAadhaar] = useState("");
    const [course, setCourse] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [semester, setSemester] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
    const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({});

    // Card States
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // Animation
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const handleBack = useCallback(() => {
        if (feeDetails) {
            setFeeDetails(null);
            return true;
        }
        if (selectedInstitution || manualEntry) {
            setSelectedInstitution("");
            setManualEntry(false);
            return true;
        }
        router.back();
        return true;
    }, [router, feeDetails, selectedInstitution, manualEntry]);

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

    const validateForm = () => {
        if (studentName.trim().length < 3) return false;
        if (studentId.trim().length === 0) return false;
        if (!academicYear) return false;
        if (mobile.trim().length !== 10) return false;
        return true;
    };

    const handleFetchFees = () => {
        if (!validateForm()) {
            Alert.alert("Error", "Please fill all mandatory fields correctly.");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const mockData: EducationFeeDetails = {
                studentName: studentName,
                studentId: studentId,
                course: course || "N/A",
                academicYear: academicYear,
                tuitionFees: 45000,
                examFees: 2500,
                libraryFees: 1200,
                labFees: 3000,
                otherCharges: 500,
                lateFee: 0,
                totalPayable: 52200,
            };
            setFeeDetails(mockData);
            setPaymentAmount(mockData.totalPayable.toString());
            setIsLoading(false);

            Animated.parallel([
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            ]).start();
        }, 1500);
    };

    const isReadyToPay = () => {
        // Check mandatory fields
        if (!isConfirmed || !selectedPaymentMode || !paymentAmount) return false;

        // Check documents (Aadhaar and Photo are mandatory for this example)
        if (!uploadedDocs['Aadhaar Card'] || !uploadedDocs['Passport Size Photo']) return false;

        // Card validation
        if (selectedPaymentMode.includes("Card")) {
            if (!cardNumber || cardNumber.length < 19 || !expiryDate || expiryDate.length < 5 || !cvv || cvv.length < 3 || !cardHolder) return false;
        }
        return true;
    };

    const isReady = isReadyToPay();

    const handleProceedToPay = () => {
        if (!isReady || !paymentAmount) {
            Alert.alert("Required", "Please fill all details and upload mandatory documents (Aadhaar & Photo) before payment.");
            return;
        }

        if (selectedPaymentMode === 'Wallet') {
            router.replace({
                pathname: "/wallet" as any,
                params: {
                    amount: paymentAmount,
                    billType: "education",
                    borrowerName: feeDetails?.studentName,
                    loanAccountNumber: feeDetails?.studentId,
                    lenderName: selectedInstitution,
                },
            });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setShowPaymentSuccess(true);
        }, 2000);
    };

    const filteredInstitutions = allInstitutions.filter(inst =>
        inst.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Education Fees</Text>
                        <Text style={styles.headerSubtitle}>Pay school, college or university fees securely</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                        <View style={styles.content}>
                            {!selectedInstitution && !manualEntry ? (
                                <>
                                    {/* Institution Search */}
                                    <TouchableOpacity style={styles.searchBar} onPress={() => setShowSearchModal(true)}>
                                        <Ionicons name="search" size={20} color="#64748B" />
                                        <Text style={styles.searchBarText}>Search School / College / University</Text>
                                    </TouchableOpacity>

                                    {/* Popular Institutions Grid */}
                                    <Text style={styles.sectionTitle}>Popular Institutions</Text>
                                    <View style={styles.grid}>
                                        {popularInstitutions.map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={styles.gridItem}
                                                onPress={() => setSelectedInstitution(item.name)}
                                            >
                                                <View style={styles.iconCircle}>
                                                    <MaterialCommunityIcons name={item.icon as any} size={24} color="#0D47A1" />
                                                </View>
                                                <Text style={styles.gridLabel}>{item.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <TouchableOpacity style={styles.manualEntryButton} onPress={() => setManualEntry(true)}>
                                        <Text style={styles.manualEntryText}>Add Institution Manually →</Text>
                                    </TouchableOpacity>
                                </>
                            ) : !feeDetails ? (
                                <>
                                    {/* Selected Institution info */}
                                    <View style={styles.selectedInstCard}>
                                        <View style={styles.instInfoRow}>
                                            <MaterialCommunityIcons name="school" size={24} color="#0D47A1" />
                                            <View style={styles.instTextContainer}>
                                                <Text style={styles.selectedInstLabel}>Institution</Text>
                                                <Text style={styles.selectedInstName}>{selectedInstitution || "Manual Entry"}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => { setSelectedInstitution(""); setManualEntry(false); }}>
                                                <Text style={styles.changeText}>Change</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Student Details Form */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Student Information</Text>

                                        {manualEntry && !selectedInstitution && (
                                            <View style={styles.fieldGroup}>
                                                <Text style={styles.fieldLabel}>Institution Name *</Text>
                                                <View style={styles.inputContainer}>
                                                    <Ionicons name="business-outline" size={16} color="#94A3B8" />
                                                    <TextInput style={styles.input} placeholder="Enter Institution Name" value={selectedInstitution} onChangeText={setSelectedInstitution} />
                                                </View>
                                            </View>
                                        )}

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Student Full Name *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="person-outline" size={16} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="Enter Full Name" value={studentName} onChangeText={setStudentName} />
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Student ID / Enrollment Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="card-outline" size={16} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="Enter ID Number" value={studentId} onChangeText={setStudentId} />
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Aadhaar Number (Optional)</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="finger-print-outline" size={16} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="12 digit number" maxLength={12} keyboardType="numeric" value={aadhaar} onChangeText={setAadhaar} />
                                            </View>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                                <Text style={styles.fieldLabel}>Course / Class</Text>
                                                <View style={styles.inputContainer}>
                                                    <TextInput style={styles.input} placeholder="e.g. 10th / B.Tech" value={course} onChangeText={setCourse} />
                                                </View>
                                            </View>
                                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                                <Text style={styles.fieldLabel}>Academic Year *</Text>
                                                <TouchableOpacity style={styles.inputContainer} onPress={() => setShowYearModal(true)}>
                                                    <Text style={[styles.input, { color: academicYear ? '#333' : '#94A3B8' }]}>{academicYear || "Select"}</Text>
                                                    <Ionicons name="chevron-down" size={14} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
                                                <Text style={styles.fieldLabel}>Semester / Term</Text>
                                                <View style={styles.inputContainer}>
                                                    <TextInput style={styles.input} placeholder="Optional" value={semester} onChangeText={setSemester} />
                                                </View>
                                            </View>
                                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                                <Text style={styles.fieldLabel}>Registered Mobile *</Text>
                                                <View style={styles.inputContainer}>
                                                    <TextInput style={styles.input} placeholder="10 digit" keyboardType="phone-pad" maxLength={10} value={mobile} onChangeText={setMobile} />
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Email ID (Optional)</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="mail-outline" size={16} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="example@mail.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity style={{ marginVertical: 24 }} onPress={handleFetchFees} disabled={isLoading}>
                                        <LinearGradient colors={["#0D47A1", "#1565C0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionButton}>
                                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Fetch Fee Details</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                                    {/* Fee Summary Card */}
                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryHeader}>
                                            <MaterialCommunityIcons name="invoice-text-outline" size={24} color="#0D47A1" />
                                            <Text style={styles.summaryTitle}>Fee Summary</Text>
                                        </View>
                                        <View style={styles.divider} />

                                        <View style={styles.summaryInfo}>
                                            <Text style={styles.summaryMainText}>{feeDetails.studentName}</Text>
                                            <Text style={styles.summarySubText}>{feeDetails.studentId} | {feeDetails.course}</Text>
                                            <Text style={styles.summarySubText}>Year: {feeDetails.academicYear}</Text>
                                        </View>

                                        <View style={styles.breakdown}>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Tuition Fees</Text><Text style={styles.breakdownValue}>₹{feeDetails.tuitionFees}</Text></View>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Exam Fees</Text><Text style={styles.breakdownValue}>₹{feeDetails.examFees}</Text></View>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Library Fees</Text><Text style={styles.breakdownValue}>₹{feeDetails.libraryFees}</Text></View>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Laboratory Fees</Text><Text style={styles.breakdownValue}>₹{feeDetails.labFees}</Text></View>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Other Charges</Text><Text style={styles.breakdownValue}>₹{feeDetails.otherCharges}</Text></View>
                                            <View style={styles.breakdownRow}><Text style={styles.breakdownLabel}>Late Fee</Text><Text style={[styles.breakdownValue, { color: '#DC2626' }]}>₹{feeDetails.lateFee}</Text></View>
                                        </View>

                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Total Payable</Text>
                                            <Text style={styles.totalValue}>₹{feeDetails.totalPayable}</Text>
                                        </View>
                                    </View>

                                    {/* Document Upload Section (UI Only) */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>📄 Documents Required (If Applicable)</Text>
                                        <Text style={styles.uploadInfo}>Allowed: PDF / JPG / PNG</Text>
                                        <View style={styles.uploadList}>
                                            {['Aadhaar Card', 'Passport Size Photo', 'Educational Certificates'].map((doc, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={[styles.uploadItem, uploadedDocs[doc] && styles.uploadedItem]}
                                                    onPress={() => handlePickDocument(doc)}
                                                >
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.uploadItemText}>{doc}</Text>
                                                        {uploadedDocs[doc] && (
                                                            <Text style={styles.fileName} numberOfLines={1}>{uploadedDocs[doc]}</Text>
                                                        )}
                                                    </View>
                                                    <View style={[styles.uploadBadge, uploadedDocs[doc] && styles.uploadedBadge]}>
                                                        <Ionicons
                                                            name={uploadedDocs[doc] ? "checkmark-circle" : "cloud-upload-outline"}
                                                            size={14}
                                                            color={uploadedDocs[doc] ? "#22C55E" : "#0D47A1"}
                                                        />
                                                        <Text style={[styles.uploadBadgeText, uploadedDocs[doc] && styles.uploadedBadgeText]}>
                                                            {uploadedDocs[doc] ? "Uploaded" : "Upload"}
                                                        </Text>
                                                    </View>
                                                    {uploadedDocs[doc] && (
                                                        <TouchableOpacity
                                                            style={styles.removeBtn}
                                                            onPress={() => handleRemoveDocument(doc)}
                                                        >
                                                            <Ionicons name="close-circle" size={18} color="#EF4444" />
                                                        </TouchableOpacity>
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Payment Modes */}
                                    <View style={styles.formCard}>
                                        <Text style={styles.formTitle}>Payment Details</Text>
                                        <View style={styles.fieldGroup}>
                                            <Text style={styles.fieldLabel}>Enter Amount</Text>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.currencyPrefix}>₹</Text>
                                                <TextInput style={styles.input} keyboardType="numeric" value={paymentAmount} onChangeText={setPaymentAmount} />
                                            </View>
                                        </View>

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
                                        <Ionicons name={isConfirmed ? "checkbox" : "square-outline"} size={22} color={isConfirmed ? "#0D47A1" : "#64748B"} />
                                        <Text style={styles.declarationText}>I confirm that the above student details are correct and authorize this education fee payment.</Text>
                                    </TouchableOpacity>

                                    <View style={styles.footer}>
                                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setFeeDetails(null)}>
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ flex: 1 }} onPress={handleProceedToPay}>
                                            <LinearGradient colors={!isReady ? ["#E2E8F0", "#E2E8F0"] : ["#0D47A1", "#1565C0"]} style={styles.payBtn}>
                                                <Text style={styles.payBtnText}>Proceed to Pay</Text>
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
                                <Text style={styles.modalTitle}>Select Institution</Text>
                                <TouchableOpacity onPress={() => setShowSearchModal(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
                            </View>
                            <View style={styles.modalSearchBox}>
                                <Ionicons name="search" size={20} color="#64748B" />
                                <TextInput style={styles.modalSearchInput} placeholder="Search Name..." value={searchQuery} onChangeText={setSearchQuery} />
                            </View>
                            <ScrollView style={styles.modalList}>
                                {filteredInstitutions.map((inst, idx) => (
                                    <TouchableOpacity key={idx} style={styles.modalItem} onPress={() => { setSelectedInstitution(inst); setShowSearchModal(false); }}>
                                        <Text style={styles.modalItemText}>{inst}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Year Modal */}
                <Modal visible={showYearModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { height: 'auto', paddingBottom: 30 }]}>
                            <Text style={styles.modalTitle}>Select Academic Year</Text>
                            {academicYears.map(year => (
                                <TouchableOpacity key={year} style={styles.modalItem} onPress={() => { setAcademicYear(year); setShowYearModal(false); }}>
                                    <Text style={styles.modalItemText}>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>

                {/* Success Modal */}
                <Modal visible={showPaymentSuccess} transparent animationType="fade">
                    <View style={styles.successOverlay}>
                        <View style={styles.successCard}>
                            <View style={styles.checkCircle}><Ionicons name="checkmark" size={40} color="#FFF" /></View>
                            <Text style={styles.successTitle}>Payment Successful</Text>
                            <View style={styles.receipt}>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptValue}>EDU-{Math.floor(Math.random() * 1000000)}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Student Name</Text><Text style={styles.receiptValue}>{studentName}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Enrollment Number</Text><Text style={styles.receiptValue}>{studentId}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Amount Paid</Text><Text style={styles.receiptValue}>₹{paymentAmount}</Text></View>
                                <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Payment Date</Text><Text style={styles.receiptValue}>{new Date().toLocaleDateString()}</Text></View>
                            </View>
                            <View style={styles.successActions}>
                                <TouchableOpacity style={styles.actionBtn}><Ionicons name="download-outline" size={20} color="#0D47A1" /><Text style={styles.actionBtnText}>Download</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-social-outline" size={20} color="#0D47A1" /><Text style={styles.actionBtnText}>Share</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}><Text style={styles.backHomeText}>Back to Education Services</Text></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
};

export default EducationFeesScreen;

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
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 },
    searchBarText: { marginLeft: 10, color: "#94A3B8", fontSize: 14 },
    sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1E293B", marginBottom: 12 },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    gridItem: { width: "31%", backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9" },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center", marginBottom: 8 },
    gridLabel: { fontSize: 11, textAlign: "center", color: "#475569", fontWeight: "500" },
    manualEntryButton: { alignSelf: "center", marginTop: 12, padding: 8 },
    manualEntryText: { color: "#0D47A1", fontWeight: "600", fontSize: 14 },
    selectedInstCard: { backgroundColor: "#EFF6FF", padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: "#0D47A1", marginBottom: 16 },
    instInfoRow: { flexDirection: "row", alignItems: "center" },
    instTextContainer: { flex: 1, marginLeft: 12 },
    selectedInstLabel: { fontSize: 10, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: 0.5 },
    selectedInstName: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
    changeText: { color: "#0D47A1", fontSize: 12, fontWeight: "600" },
    formCard: { backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
    formTitle: { fontSize: 15, fontWeight: "600", color: "#1E293B", marginBottom: 16 },
    fieldGroup: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, color: "#64748B", marginBottom: 6, fontWeight: "500" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#E2E8F0" },
    input: { flex: 1, fontSize: 14, color: "#334155", marginLeft: 8 },
    row: { flexDirection: "row" },
    actionButton: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    actionButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
    summaryCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
    summaryHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    summaryTitle: { fontSize: 16, fontWeight: "700", color: "#0D47A1", marginLeft: 10 },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 12 },
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
    uploadInfo: { fontSize: 11, color: "#94A3B8", marginBottom: 12, marginTop: -12 },
    uploadList: { marginTop: 8 },
    uploadItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
    uploadedItem: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
    uploadItemText: { fontSize: 13, color: "#475569", fontWeight: "600" },
    fileName: { fontSize: 11, color: "#22C55E", marginTop: 2 },
    uploadBadge: { backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4 },
    uploadedBadge: { backgroundColor: "#DCFCE7" },
    uploadBadgeText: { fontSize: 11, color: "#0D47A1", fontWeight: "600" },
    uploadedBadgeText: { color: "#166534" },
    currencyPrefix: { fontSize: 16, fontWeight: "600", color: "#64748B", marginRight: 4 },
    paymentModesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 8 },
    modeCard: { width: "48%", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#F1F5F9", flexDirection: "row" },
    selectedModeCard: { backgroundColor: "#EFF6FF", borderColor: "#0D47A1" },
    modeText: { marginLeft: 8, fontSize: 13, color: "#475569" },
    selectedModeText: { color: "#0D47A1", fontWeight: "600" },
    declarationRow: { flexDirection: "row", paddingHorizontal: 4, marginBottom: 24 },
    declarationText: { flex: 1, fontSize: 12, color: "#64748B", marginLeft: 10, lineHeight: 18 },
    footer: { flexDirection: "row", alignItems: "center" },
    cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 12 },
    cancelBtnText: { color: "#64748B", fontWeight: "600" },
    payBtn: { height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center" },
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
    removeBtn: { marginLeft: 10 },
    cardFormContainer: { marginTop: 15, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
});
