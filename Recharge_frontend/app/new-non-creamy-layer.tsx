import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    Clipboard,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from "react-native";
import { API_ENDPOINTS } from "../constants/api";

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    fullName: string;
    aadhaarNumber: string;
    dob: string;
    gender: string;
    mobileNumber: string;
    email: string;
    category: "OBC" | "";
    subCaste: string;
    casteCertNumber: string;
    issuingAuthority: string;
    issueDate: string;
    fatherName: string;
    motherName: string;
    parentOccupation: string;
    incomeYear1: string;
    incomeYear2: string;
    incomeYear3: string;
    incomeSource: "Service" | "Business" | "Farming" | "Labor" | "Other" | "";
    maritalStatus: "Unmarried" | "Married" | "";
    casteBeforeMarriage: string;
    husbandName: string;
    marriageRegDetails: string;
    gazetteNameChange: string;
    isMigrant: "Yes" | "No" | "";
    previousState: string;
    previousDistrict: string;
    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    idProof: DocumentType | null;
    addressProof: DocumentType | null;
    casteCert: DocumentType | null;
    incomeProofYear1: DocumentType | null;
    incomeProofYear2: DocumentType | null;
    incomeProofYear3: DocumentType | null;
    photo: DocumentType | null;
    schoolLeaving: DocumentType | null;
    casteAffidavit: DocumentType | null;
    preMarriageCaste: DocumentType | null;
    marriageCert: DocumentType | null;
    gazetteCopy: DocumentType | null;
    fatherCasteCert: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewNonCreamyLayerScreen() {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [showCopied, setShowCopied] = useState(false);

    // OTP State
    const [otpCode, setOtpCode] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const [documents, setDocuments] = useState<DocumentsState>({
        idProof: null,
        addressProof: null,
        casteCert: null,
        incomeProofYear1: null,
        incomeProofYear2: null,
        incomeProofYear3: null,
        photo: null,
        schoolLeaving: null,
        casteAffidavit: null,
        preMarriageCaste: null,
        marriageCert: null,
        gazetteCopy: null,
        fatherCasteCert: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        dob: "",
        gender: "",
        mobileNumber: "",
        email: "",
        category: "",
        subCaste: "",
        casteCertNumber: "",
        issuingAuthority: "",
        issueDate: "",
        fatherName: "",
        motherName: "",
        parentOccupation: "",
        incomeYear1: "",
        incomeYear2: "",
        incomeYear3: "",
        incomeSource: "",
        maritalStatus: "",
        casteBeforeMarriage: "",
        husbandName: "",
        marriageRegDetails: "",
        gazetteNameChange: "",
        isMigrant: "",
        previousState: "",
        previousDistrict: "",
        declaration: false,
        finalConfirmation: false,
    });

    useEffect(() => {
        const backAction = () => {
            if (isEditingMode) { setCurrentStep(3); setIsEditingMode(false); return true; }
            if (currentStep > 1) { setCurrentStep(currentStep - 1); return true; }
            router.back(); return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep, isEditingMode]);

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"], copyToCacheDirectory: true });
            if (result.canceled === false && result.assets) {
                const asset = result.assets[0];
                if (asset.size && asset.size > 5 * 1024 * 1024) { Alert.alert("File Too Large", "File size must be below 5MB"); return; }
                setDocuments(prev => ({ ...prev, [docType]: { name: asset.name, size: asset.size, uri: asset.uri } }));
            }
        } catch (error) { Alert.alert("Error", "Failed to upload document"); }
    };

    const removeDocument = (docType: keyof DocumentsState) => setDocuments(prev => ({ ...prev, [docType]: null }));

    const handleDOBChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        setFormData(prev => ({ ...prev, dob: formatted }));
    };

    const handleIssueDateChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        setFormData(prev => ({ ...prev, issueDate: formatted }));
    };

    const handleSendOTP = async () => {
        if (formData.aadhaarNumber.length !== 12) { Alert.alert("Error", "Please enter a valid 12-digit Aadhaar number"); return; }
        if (formData.mobileNumber.length !== 10) { Alert.alert("Error", "Please enter a valid 10-digit mobile number"); return; }
        setIsSendingOtp(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(API_ENDPOINTS.NCL_OTP_SEND, {
                mobile_number: formData.mobileNumber,
                aadhar_number: formData.aadhaarNumber
            }, { headers: { "Authorization": `Bearer ${token}` } });

            if (response.data.success) {
                setIsOtpSent(true);
                Alert.alert("OTP Sent", "Verification code sent to your mobile.");
            } else {
                Alert.alert("Error", response.data.message || "Failed to send OTP");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Service temporarily unavailable.");
        } finally { setIsSendingOtp(false); }
    };

    const handleVerifyOTP = async () => {
        if (otpCode.length !== 6) { Alert.alert("Error", "Please enter 6-digit OTP"); return; }
        setIsVerifyingOtp(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(API_ENDPOINTS.NCL_OTP_VERIFY, {
                mobile_number: formData.mobileNumber,
                otp_code: otpCode
            }, { headers: { "Authorization": `Bearer ${token}` } });

            if (response.data.success) {
                setIsOtpVerified(true);
                Alert.alert("Success", "Aadhaar verified successfully!");
            } else {
                Alert.alert("Error", response.data.message || "Invalid OTP");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Verification failed.");
        } finally { setIsVerifyingOtp(false); }
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (!formData.fullName || formData.aadhaarNumber.length !== 12 || !formData.dob || !formData.category || !formData.declaration) {
                Alert.alert("Required", "Please fill all mandatory details and accept declaration"); return;
            }
            if (!isOtpVerified) { Alert.alert("Required", "Please verify your Aadhaar with OTP to proceed"); return; }
            if (!formData.incomeYear1 || !formData.incomeYear2 || !formData.incomeYear3) {
                Alert.alert("Required", "Please enter income details for all 3 years"); return;
            }
            if (isEditingMode) { setCurrentStep(3); setIsEditingMode(false); } else { setCurrentStep(2); }
        } else if (currentStep === 2) {
            const mandatoryDocs: (keyof DocumentsState)[] = ['idProof', 'addressProof', 'casteCert', 'incomeProofYear1', 'photo', 'schoolLeaving', 'casteAffidavit'];
            for (const doc of mandatoryDocs) {
                if (!documents[doc]) { Alert.alert("Missing Document", `Please upload: ${(doc as string).replace(/([A-Z])/g, ' $1')}`); return; }
            }
            if (formData.maritalStatus === 'Married' && (!documents.marriageCert || !documents.preMarriageCaste)) {
                Alert.alert("Missing Document", "Married applicants must upload Marriage Certificate and Pre-marriage Caste proof"); return;
            }
            if (formData.isMigrant === 'Yes' && !documents.fatherCasteCert) {
                Alert.alert("Missing Document", "Migrants must upload Father's Caste Certificate"); return;
            }
            if (isEditingMode) { setCurrentStep(3); setIsEditingMode(false); } else { setCurrentStep(3); }
        } else {
            if (!formData.finalConfirmation) { Alert.alert("Confirmation", "Please confirm that all details are accurate"); return; }
            setIsSubmitting(true);

            const submitApplication = async () => {
                try {
                    const token = await AsyncStorage.getItem("userToken");
                    if (!token) { setIsSubmitting(false); Alert.alert("Session Expired", "Please login again."); return; }

                    const fd = new FormData();
                    fd.append("full_name", formData.fullName);
                    fd.append("aadhaar_number", formData.aadhaarNumber);
                    fd.append("dob", formData.dob);
                    fd.append("gender", formData.gender);
                    fd.append("mobile_number", formData.mobileNumber);
                    fd.append("email", formData.email);
                    fd.append("category", formData.category);
                    fd.append("sub_caste", formData.subCaste);
                    fd.append("caste_cert_number", formData.casteCertNumber);
                    fd.append("issuing_authority", formData.issuingAuthority);
                    fd.append("issue_date", formData.issueDate);
                    fd.append("father_name", formData.fatherName);
                    fd.append("mother_name", formData.motherName);
                    fd.append("parent_occupation", formData.parentOccupation);
                    fd.append("income_year1", formData.incomeYear1);
                    fd.append("income_year2", formData.incomeYear2);
                    fd.append("income_year3", formData.incomeYear3);
                    fd.append("income_source", formData.incomeSource);
                    fd.append("marital_status", formData.maritalStatus);
                    fd.append("caste_before_marriage", formData.casteBeforeMarriage);
                    fd.append("husband_name", formData.husbandName);
                    fd.append("marriage_reg_details", formData.marriageRegDetails);
                    fd.append("gazette_name_change", formData.gazetteNameChange);
                    fd.append("is_migrant", formData.isMigrant);
                    fd.append("previous_state", formData.previousState);
                    fd.append("previous_district", formData.previousDistrict);

                    if (documents.idProof) fd.append("id_proof", { uri: documents.idProof.uri, name: documents.idProof.name, type: "application/pdf" } as any);
                    if (documents.addressProof) fd.append("address_proof", { uri: documents.addressProof.uri, name: documents.addressProof.name, type: "application/pdf" } as any);
                    if (documents.casteCert) fd.append("caste_cert", { uri: documents.casteCert.uri, name: documents.casteCert.name, type: "application/pdf" } as any);
                    if (documents.incomeProofYear1) fd.append("income_proof_year1", { uri: documents.incomeProofYear1.uri, name: documents.incomeProofYear1.name, type: "application/pdf" } as any);
                    if (documents.incomeProofYear2) fd.append("income_proof_year2", { uri: documents.incomeProofYear2.uri, name: documents.incomeProofYear2.name, type: "application/pdf" } as any);
                    if (documents.incomeProofYear3) fd.append("income_proof_year3", { uri: documents.incomeProofYear3.uri, name: documents.incomeProofYear3.name, type: "application/pdf" } as any);
                    if (documents.photo) fd.append("photo", { uri: documents.photo.uri, name: documents.photo.name, type: "image/jpeg" } as any);
                    if (documents.schoolLeaving) fd.append("school_leaving", { uri: documents.schoolLeaving.uri, name: documents.schoolLeaving.name, type: "application/pdf" } as any);
                    if (documents.casteAffidavit) fd.append("caste_affidavit", { uri: documents.casteAffidavit.uri, name: documents.casteAffidavit.name, type: "application/pdf" } as any);
                    if (documents.preMarriageCaste) fd.append("pre_marriage_caste", { uri: documents.preMarriageCaste.uri, name: documents.preMarriageCaste.name, type: "application/pdf" } as any);
                    if (documents.marriageCert) fd.append("marriage_cert", { uri: documents.marriageCert.uri, name: documents.marriageCert.name, type: "application/pdf" } as any);
                    if (documents.gazetteCopy) fd.append("gazette_copy", { uri: documents.gazetteCopy.uri, name: documents.gazetteCopy.name, type: "application/pdf" } as any);
                    if (documents.fatherCasteCert) fd.append("father_caste_cert", { uri: documents.fatherCasteCert.uri, name: documents.fatherCasteCert.name, type: "application/pdf" } as any);

                    const response = await axios.post(API_ENDPOINTS.NCL_APPLY, fd, {
                        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
                    });

                    if (response.data.success) {
                        setApplicationId(response.data.data.reference_id);
                        setIsSubmitted(true);
                    } else {
                        Alert.alert("Error", response.data.message || "Failed to submit application");
                    }
                } catch (error: any) {
                    Alert.alert("Error", error.response?.data?.message || "An error occurred during submission");
                } finally { setIsSubmitting(false); }
            };
            submitApplication();
        }
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
                        <Text style={[styles.stepLabel, currentStep >= s && styles.stepLabelActive]}>{s === 1 ? "Details" : s === 2 ? "Documents" : "Review"}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    if (isSubmitted) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconCircle}><Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" /></View>
                    <Text style={styles.successTitle}>Application Submitted!</Text>
                    <Text style={styles.successSubtitle}>Your Non-Creamy Layer Certificate application has been received successfully.</Text>
                    <TouchableOpacity
                        style={styles.idCard}
                        onPress={() => { Clipboard.setString(applicationId); setShowCopied(true); setTimeout(() => setShowCopied(false), 2000); }}
                    >
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={styles.idValue}>{applicationId}</Text>
                            <Ionicons name="copy-outline" size={20} color="#0D47A1" />
                        </View>
                    </TouchableOpacity>
                    {showCopied && (<View style={styles.toast}><Text style={styles.toastText}>Copied to clipboard</Text></View>)}
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
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (isEditingMode) { setCurrentStep(3); setIsEditingMode(false); }
                        else if (currentStep > 1) { setCurrentStep(currentStep - 1); }
                        else { router.back(); }
                    }}>
                        <Ionicons name={isEditingMode ? "close" : "arrow-back"} size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New NCL Certificate</Text>
                        <Text style={styles.headerSubtitle}>OBC Non-Creamy Layer</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Applicant Details" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input value={formData.fullName} onChangeText={(v: string) => setFormData({ ...formData, fullName: v })} placeholder="Enter full name" icon="person-outline" />

                                <Label text="Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} editable={!isOtpVerified} />

                                <Label text="Aadhaar Number *" />
                                <View style={styles.otpRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input
                                            value={formData.aadhaarNumber}
                                            onChangeText={(v: string) => setFormData({ ...formData, aadhaarNumber: v.replace(/\D/g, '').substring(0, 12) })}
                                            placeholder="12-digit Aadhaar"
                                            keyboardType="number-pad"
                                            maxLength={12}
                                            icon="card-outline"
                                            editable={!isOtpVerified}
                                        />
                                    </View>
                                    {!isOtpVerified && (
                                        <TouchableOpacity style={[styles.otpBtn, isSendingOtp && styles.btnDisabled]} onPress={handleSendOTP} disabled={isSendingOtp}>
                                            {isSendingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>}
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {isOtpSent && !isOtpVerified && (
                                    <View style={styles.otpVerifyContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Input value={otpCode} onChangeText={setOtpCode} placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} icon="shield-checkmark-outline" />
                                        </View>
                                        <TouchableOpacity style={[styles.otpBtn, isVerifyingOtp && styles.btnDisabled, { backgroundColor: '#2E7D32' }]} onPress={handleVerifyOTP} disabled={isVerifyingOtp}>
                                            {isVerifyingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>Verify</Text>}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {isOtpVerified && (
                                    <View style={styles.verifiedBadge}>
                                        <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                        <Text style={styles.verifiedText}>Aadhaar Verified</Text>
                                    </View>
                                )}

                                <Label text="Date of Birth *" />
                                <Input value={formData.dob} onChangeText={handleDOBChange} placeholder="DD/MM/YYYY" keyboardType="number-pad" maxLength={10} icon="calendar-outline" />

                                <Label text="Gender *" />
                                <View style={styles.genderRow}>
                                    {["Male", "Female", "Other"].map(g => (
                                        <TouchableOpacity key={g} style={[styles.chip, formData.gender === g && styles.chipActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                            <Text style={[styles.chipText, formData.gender === g && styles.chipTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Email (Optional)" />
                                <Input value={formData.email} onChangeText={(v: string) => setFormData({ ...formData, email: v })} placeholder="Email address" icon="mail-outline" />
                            </View>

                            <SectionTitle title="Caste Details" icon="ribbon" />
                            <View style={styles.formCard}>
                                <Label text="Category *" />
                                <TouchableOpacity style={[styles.chip, formData.category === "OBC" && styles.chipActive]} onPress={() => setFormData({ ...formData, category: "OBC" })}>
                                    <Text style={[styles.chipText, formData.category === "OBC" && styles.chipTextActive]}>OBC</Text>
                                </TouchableOpacity>

                                <Label text="Sub-Caste *" />
                                <Input value={formData.subCaste} onChangeText={(v: string) => setFormData({ ...formData, subCaste: v })} placeholder="e.g. Kunbi, Mali, etc." icon="layers-outline" />

                                <Label text="Caste Certificate Number *" />
                                <Input value={formData.casteCertNumber} onChangeText={(v: string) => setFormData({ ...formData, casteCertNumber: v })} placeholder="Enter certificate number" icon="document-text-outline" />

                                <Label text="Issuing Authority *" />
                                <Input value={formData.issuingAuthority} onChangeText={(v: string) => setFormData({ ...formData, issuingAuthority: v })} placeholder="e.g. Tahsildar / SDO" icon="ribbon-outline" />

                                <Label text="Issue Date *" />
                                <Input value={formData.issueDate} onChangeText={handleIssueDateChange} placeholder="DD/MM/YYYY" keyboardType="number-pad" maxLength={10} icon="calendar-outline" />
                            </View>

                            <SectionTitle title="Family Income (Last 3 Years)" icon="cash" />
                            <View style={styles.formCard}>
                                <Label text="Father's Name *" />
                                <Input value={formData.fatherName} onChangeText={(v: string) => setFormData({ ...formData, fatherName: v })} placeholder="Father's Name" icon="person-outline" />
                                <Label text="Mother's Name *" />
                                <Input value={formData.motherName} onChangeText={(v: string) => setFormData({ ...formData, motherName: v })} placeholder="Mother's Name" icon="person-outline" />
                                <Label text="Parent's Occupation *" />
                                <Input value={formData.parentOccupation} onChangeText={(v: string) => setFormData({ ...formData, parentOccupation: v })} placeholder="e.g. Service / Farming" icon="briefcase-outline" />

                                <View style={{ borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginVertical: 15 }} />

                                <Label text="Current Year Income (Year 1) *" />
                                <Input value={formData.incomeYear1} onChangeText={(v: string) => setFormData({ ...formData, incomeYear1: v.replace(/\D/g, '') })} placeholder="Amount in ₹" keyboardType="number-pad" icon="wallet-outline" />
                                <Label text="Previous Year Income (Year 2) *" />
                                <Input value={formData.incomeYear2} onChangeText={(v: string) => setFormData({ ...formData, incomeYear2: v.replace(/\D/g, '') })} placeholder="Amount in ₹" keyboardType="number-pad" icon="wallet-outline" />
                                <Label text="Previous Year Income (Year 3) *" />
                                <Input value={formData.incomeYear3} onChangeText={(v: string) => setFormData({ ...formData, incomeYear3: v.replace(/\D/g, '') })} placeholder="Amount in ₹" keyboardType="number-pad" icon="wallet-outline" />

                                <Label text="Main Income Source *" />
                                <View style={styles.genderRow}>
                                    {["Service", "Business", "Farming", "Labor", "Other"].map(o => (
                                        <TouchableOpacity key={o} style={[styles.chip, formData.incomeSource === o && styles.chipActive]} onPress={() => setFormData({ ...formData, incomeSource: o as any })}>
                                            <Text style={[styles.chipText, formData.incomeSource === o && styles.chipTextActive]}>{o}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <SectionTitle title="Marital & Migrant Status" icon="information-circle" />
                            <View style={styles.formCard}>
                                <Label text="Marital Status *" />
                                <View style={styles.genderRow}>
                                    {["Unmarried", "Married"].map(m => (
                                        <TouchableOpacity key={m} style={[styles.chip, formData.maritalStatus === m && styles.chipActive]} onPress={() => setFormData({ ...formData, maritalStatus: m as any })}>
                                            <Text style={[styles.chipText, formData.maritalStatus === m && styles.chipTextActive]}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {formData.maritalStatus === 'Married' && (
                                    <View style={styles.conditionalSection}>
                                        <Label text="Caste before Marriage *" />
                                        <Input value={formData.casteBeforeMarriage} onChangeText={(v: string) => setFormData({ ...formData, casteBeforeMarriage: v })} placeholder="Original Caste" icon="ribbon-outline" />
                                        <Label text="Husband's Name *" />
                                        <Input value={formData.husbandName} onChangeText={(v: string) => setFormData({ ...formData, husbandName: v })} placeholder="Full Name" icon="person-outline" />
                                        <Label text="Marriage Registration Details" />
                                        <Input value={formData.marriageRegDetails} onChangeText={(v: string) => setFormData({ ...formData, marriageRegDetails: v })} placeholder="Reg No. / Date" icon="document-text-outline" />
                                    </View>
                                )}

                                <View style={{ height: 15 }} />

                                <Label text="Are you a Migrant? *" />
                                <View style={styles.genderRow}>
                                    {["Yes", "No"].map(y => (
                                        <TouchableOpacity key={y} style={[styles.chip, formData.isMigrant === y && styles.chipActive]} onPress={() => setFormData({ ...formData, isMigrant: y as any })}>
                                            <Text style={[styles.chipText, formData.isMigrant === y && styles.chipTextActive]}>{y}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {formData.isMigrant === 'Yes' && (
                                    <View style={styles.conditionalSection}>
                                        <Label text="Previous State *" />
                                        <Input value={formData.previousState} onChangeText={(v: string) => setFormData({ ...formData, previousState: v })} placeholder="e.g. Gujarat" icon="map-outline" />
                                        <Label text="Previous District *" />
                                        <Input value={formData.previousDistrict} onChangeText={(v: string) => setFormData({ ...formData, previousDistrict: v })} placeholder="District Name" icon="location-outline" />
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <Ionicons name={formData.declaration ? "checkbox" : "square-outline"} size={24} color={formData.declaration ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I declare that my family income does not fall under the creamy layer category and the information provided is true.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Proof of Identity & Address" icon="card" />
                            <View style={styles.docList}>
                                <DocUploadItem title="Proof of Identity *" hint="Aadhaar / PAN / Voter ID" isUploaded={!!documents.idProof} filename={documents.idProof?.name} onUpload={() => pickDocument('idProof')} onRemove={() => removeDocument('idProof')} icon="card-account-details" color="#0D47A1" />
                                <DocUploadItem title="Proof of Address *" hint="Ration Card / Electricity Bill" isUploaded={!!documents.addressProof} filename={documents.addressProof?.name} onUpload={() => pickDocument('addressProof')} onRemove={() => removeDocument('addressProof')} icon="map-marker-radius" color="#1565C0" />
                            </View>

                            <SectionTitle title="Caste & Income Proof" icon="document-text" />
                            <View style={styles.docList}>
                                <DocUploadItem title="OBC Caste Certificate *" hint="Mandatory" isUploaded={!!documents.casteCert} filename={documents.casteCert?.name} onUpload={() => pickDocument('casteCert')} onRemove={() => removeDocument('casteCert')} icon="shield-account" color="#2E7D32" />
                                <DocUploadItem title="Income Proof (Year 1) *" hint="ITR / Salary Slip" isUploaded={!!documents.incomeProofYear1} filename={documents.incomeProofYear1?.name} onUpload={() => pickDocument('incomeProofYear1')} onRemove={() => removeDocument('incomeProofYear1')} icon="cash" color="#E65100" />
                                <DocUploadItem title="Income Proof (Year 2)" hint="ITR / Salary Slip" isUploaded={!!documents.incomeProofYear2} filename={documents.incomeProofYear2?.name} onUpload={() => pickDocument('incomeProofYear2')} onRemove={() => removeDocument('incomeProofYear2')} icon="cash" color="#E65100" />
                                <DocUploadItem title="Income Proof (Year 3)" hint="ITR / Salary Slip" isUploaded={!!documents.incomeProofYear3} filename={documents.incomeProofYear3?.name} onUpload={() => pickDocument('incomeProofYear3')} onRemove={() => removeDocument('incomeProofYear3')} icon="cash" color="#E65100" />
                            </View>

                            <SectionTitle title="Additional Documents" icon="attach" />
                            <View style={styles.docList}>
                                <DocUploadItem title="Passport Size Photo *" isUploaded={!!documents.photo} filename={documents.photo?.name} onUpload={() => pickDocument('photo')} onRemove={() => removeDocument('photo')} icon="camera-account" color="#D81B60" />
                                <DocUploadItem title="School Leaving Certificate *" isUploaded={!!documents.schoolLeaving} filename={documents.schoolLeaving?.name} onUpload={() => pickDocument('schoolLeaving')} onRemove={() => removeDocument('schoolLeaving')} icon="school" color="#455A64" />
                                <DocUploadItem title="Caste Affidavit *" isUploaded={!!documents.casteAffidavit} filename={documents.casteAffidavit?.name} onUpload={() => pickDocument('casteAffidavit')} onRemove={() => removeDocument('casteAffidavit')} icon="file-sign" color="#7B1FA2" />

                                {formData.maritalStatus === 'Married' && (
                                    <>
                                        <DocUploadItem title="Marriage Certificate *" isUploaded={!!documents.marriageCert} filename={documents.marriageCert?.name} onUpload={() => pickDocument('marriageCert')} onRemove={() => removeDocument('marriageCert')} icon="book-heart" color="#C2185B" />
                                        <DocUploadItem title="Pre-Marriage Caste Proof *" isUploaded={!!documents.preMarriageCaste} filename={documents.preMarriageCaste?.name} onUpload={() => pickDocument('preMarriageCaste')} onRemove={() => removeDocument('preMarriageCaste')} icon="account-details" color="#00796B" />
                                    </>
                                )}
                                {formData.isMigrant === 'Yes' && (
                                    <DocUploadItem title="Father's Caste Proof *" hint="From previous state" isUploaded={!!documents.fatherCasteCert} filename={documents.fatherCasteCert?.name} onUpload={() => pickDocument('fatherCasteCert')} onRemove={() => removeDocument('fatherCasteCert')} icon="shield-account" color="#2E7D32" />
                                )}
                                <DocUploadItem title="Gazette Copy (if name change)" isUploaded={!!documents.gazetteCopy} filename={documents.gazetteCopy?.name} onUpload={() => pickDocument('gazetteCopy')} onRemove={() => removeDocument('gazetteCopy')} icon="newspaper-variant" color="#6D4C41" />
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Your Application" icon="eye" />
                            <ReviewItem title="Applicant Details" data={[
                                { label: "Full Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "DOB", value: formData.dob },
                                { label: "Gender", value: formData.gender },
                                { label: "Category", value: formData.category },
                                { label: "Mobile", value: formData.mobileNumber },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Caste Details" data={[
                                { label: "Sub-Caste", value: formData.subCaste },
                                { label: "Cert No.", value: formData.casteCertNumber },
                                { label: "Authority", value: formData.issuingAuthority },
                                { label: "Issue Date", value: formData.issueDate },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Income Details (3-Year)" data={[
                                { label: "Year 1", value: "₹ " + formData.incomeYear1 },
                                { label: "Year 2", value: "₹ " + formData.incomeYear2 },
                                { label: "Year 3", value: "₹ " + formData.incomeYear3 },
                                { label: "Source", value: formData.incomeSource },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Marital/Migrant Status" data={[
                                { label: "Status", value: formData.maritalStatus },
                                { label: "Migrant", value: formData.isMigrant },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Uploaded Documents" data={[
                                { label: "Identity Proof", value: documents.idProof ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Address Proof", value: documents.addressProof ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Caste Cert", value: documents.casteCert ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Affidavit", value: documents.casteAffidavit ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Photo", value: documents.photo ? "Uploaded ✅" : "Missing ❌" },
                            ]} onEdit={() => { setCurrentStep(2); setIsEditingMode(true); }} />

                            <TouchableOpacity style={[styles.declarationRow, { marginTop: 20 }]} onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}>
                                <Ionicons name={formData.finalConfirmation ? "checkbox" : "square-outline"} size={24} color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that the income details provided are accurate and I do not fall under the creamy layer as per government norms.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                            <LinearGradient colors={['#0D47A1', '#1565C0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                                {isSubmitting ? <ActivityIndicator color="#FFF" size="small" /> : (
                                    <>
                                        <Text style={styles.buttonText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                                        <Ionicons name={currentStep === 3 ? "checkmark-done" : "arrow-forward"} size={20} color="#FFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const SectionTitle = ({ title, icon }: { title: string, icon: any }) => (
    <View style={styles.cardHeader}>
        <View style={styles.cardHeaderIcon}><Ionicons name={icon as any} size={20} color="#0D47A1" /></View>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
    </View>
);
const Label = ({ text }: { text: string }) => <Text style={styles.inputLabel}>{text}</Text>;
const Input = ({ icon, ...props }: any) => (
    <View style={[styles.inputContainer, props.editable === false && { backgroundColor: '#F1F5F9' }]}>
        {icon && <Ionicons name={icon as any} size={18} color="#94A3B8" style={{ marginRight: 10 }} />}
        <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
    </View>
);
const ReviewItem = ({ title, data, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}><Text style={styles.reviewSectionTitle}>{title}</Text><TouchableOpacity onPress={onEdit}><Text style={styles.editLink}>Edit</Text></TouchableOpacity></View>
        {data.map((item: any, index: number) => (
            <View key={index} style={styles.reviewRow}><Text style={styles.reviewLabel}>{item.label}</Text><Text style={styles.reviewValue}>{item.value}</Text></View>
        ))}
    </View>
);
const DocUploadItem = ({ title, hint, isUploaded, filename, onUpload, onRemove, icon, color }: any) => (
    <TouchableOpacity style={[styles.docUploadCard, isUploaded && styles.docUploadCardActive]} onPress={onUpload}>
        <View style={[styles.docIconCircle, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon as any} size={24} color={isUploaded ? "#FFF" : color} style={isUploaded && { backgroundColor: color, borderRadius: 12, padding: 4 }} />
        </View>
        <View style={styles.docTextContent}>
            <Text style={styles.docTitle}>{title}</Text>
            <Text style={styles.docHint}>{filename || hint || "Upload mandatory document"}</Text>
        </View>
        <View style={styles.docActions}>
            {isUploaded ? (
                <TouchableOpacity onPress={onRemove} style={styles.removeIcon}><Ionicons name="checkmark-circle" size={24} color="#2E7D32" /></TouchableOpacity>
            ) : (
                <View style={styles.uploadIcon}><Ionicons name="cloud-upload" size={24} color="#94A3B8" /></View>
            )}
        </View>
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
    stepLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#0D47A1' },
    scrollContent: { padding: 20 },
    stepWrapper: {},
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 10 },
    cardHeaderIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
    cardHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 12 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 50 },
    input: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500' },
    genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', marginRight: 8, marginBottom: 8 },
    chipActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    chipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    chipTextActive: { color: '#0D47A1', fontWeight: '700' },
    conditionalSection: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, marginTop: 10, borderWidth: 1, borderColor: '#E2E8F0' },
    declarationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4 },
    declarationLabel: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20, fontWeight: '500' },
    docList: { gap: 12 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
    docUploadCardActive: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    docTextContent: { flex: 1, marginLeft: 15 },
    docTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 11, color: '#64748B', marginTop: 2 },
    docActions: { marginLeft: 10 },
    removeIcon: { padding: 4 },
    uploadIcon: { padding: 4 },
    reviewCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
    reviewSectionTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1', textTransform: 'uppercase' },
    editLink: { fontSize: 13, fontWeight: '700', color: '#1565C0' },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reviewLabel: { fontSize: 13, color: '#64748B' },
    reviewValue: { fontSize: 13, fontWeight: '700', color: '#1E293B', textAlign: 'right', flex: 1, marginLeft: 20 },
    bottomBar: { paddingVertical: 20 },
    continueButton: { borderRadius: 16, overflow: 'hidden' },
    buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    buttonText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 35, lineHeight: 22 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 25, width: '100%', alignItems: 'center', marginBottom: 35, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    idValue: { fontSize: 28, fontWeight: '900', color: '#0D47A1' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    mainBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
    otpRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    otpBtn: { backgroundColor: '#0D47A1', paddingHorizontal: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 90 },
    otpBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    btnDisabled: { opacity: 0.7 },
    otpVerifyContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F1F8E9', padding: 10, borderRadius: 8, marginTop: 10 },
    verifiedText: { color: '#2E7D32', fontSize: 13, fontWeight: '700' },
    toast: { position: 'absolute', bottom: 120, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignSelf: 'center' },
    toastText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
});
