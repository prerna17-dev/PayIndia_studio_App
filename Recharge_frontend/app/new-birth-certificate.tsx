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
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { API_ENDPOINTS } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from 'expo-clipboard';

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // Applicant Details (for OTP)
    applicantMobile: string;
    applicantAadhaar: string;
    email: string;

    // Child Details
    childName: string;
    gender: string;
    dob: string;
    timeOfBirth: string;
    placeOfBirth: "Hospital" | "Home" | "";
    hospitalName: string;
    registrationDate: string;

    // Father's Details
    fatherName: string;
    fatherAadhaar: string;
    fatherMobile: string;
    fatherOccupation: string;
    fatherDob: string;
    fatherMaritalStatus: string;
    fatherPlaceOfBirth: string;
    fatherAddress: string;

    // Mother's Details
    motherName: string;
    motherAadhaar: string;
    motherMobile: string;
    motherOccupation: string;
    motherDob: string;
    motherMaritalStatus: string;
    motherPlaceOfBirth: string;
    motherAddress: string;

    // Address Details
    houseNo: string;
    street: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;

    // Registration Type
    registrationType: "Normal" | "Late" | "";
    delayReason: string;

    declaration: boolean;
    finalDeclaration: boolean;
}

interface DocumentsState {
    hospitalReport: DocumentType | null;
    fatherAadhaar: DocumentType | null;
    motherAadhaar: DocumentType | null;
    addressProof: DocumentType | null;
    marriageCertificate: DocumentType | null;
    affidavit: DocumentType | null;
    [key: string]: DocumentType | null;
}

const REQUIRED_DOCS = [
    { id: 'hospitalReport', name: 'Hospital Birth Report *', icon: 'hospital-building', color: '#1565C0', hint: 'Birth certificate from hospital' },
    { id: 'fatherAadhaar', name: "Father's Aadhaar Card *", icon: 'card-account-details', color: '#2E7D32', hint: "Father's Aadhaar front & back" },
    { id: 'motherAadhaar', name: "Mother's Aadhaar Card *", icon: 'card-account-details', color: '#D32F2F', hint: "Mother's Aadhaar front & back" },
    { id: 'addressProof', name: 'Address Proof *', icon: 'home-map-marker', color: '#E65100', hint: 'Light Bill / Rent Agreement' },
    { id: 'marriageCertificate', name: 'Marriage Certificate', icon: 'ring', color: '#7B1FA2', hint: 'Optional but recommended' },
    { id: 'affidavit', name: 'Affidavit *', icon: 'file-document-edit', color: '#C62828', hint: 'Required for Late Registration' },
];

export default function NewBirthCertificateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [showCopied, setShowCopied] = useState(false);

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const [isFatherOtpSent, setIsFatherOtpSent] = useState(false);
    const [fatherOtpCode, setFatherOtpCode] = useState("");
    const [isFatherOtpVerified, setIsFatherOtpVerified] = useState(false);
    const [isFatherVerifyingOtp, setIsFatherVerifyingOtp] = useState(false);
    const [isFatherSendingOtp, setIsFatherSendingOtp] = useState(false);

    const [isMotherOtpSent, setIsMotherOtpSent] = useState(false);
    const [motherOtpCode, setMotherOtpCode] = useState("");
    const [isMotherOtpVerified, setIsMotherOtpVerified] = useState(false);
    const [isMotherVerifyingOtp, setIsMotherVerifyingOtp] = useState(false);
    const [isMotherSendingOtp, setIsMotherSendingOtp] = useState(false);

    const [documents, setDocuments] = useState<DocumentsState>({
        hospitalReport: null,
        fatherAadhaar: null,
        motherAadhaar: null,
        addressProof: null,
        marriageCertificate: null,
        affidavit: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        applicantMobile: "",
        applicantAadhaar: "",
        email: "",
        childName: "",
        gender: "",
        dob: "",
        timeOfBirth: "",
        placeOfBirth: "",
        hospitalName: "",
        registrationDate: "",
        fatherName: "",
        fatherAadhaar: "",
        fatherMobile: "",
        fatherOccupation: "",
        fatherDob: "",
        fatherMaritalStatus: "",
        fatherPlaceOfBirth: "",
        fatherAddress: "",
        motherName: "",
        motherAadhaar: "",
        motherMobile: "",
        motherOccupation: "",
        motherDob: "",
        motherMaritalStatus: "",
        motherPlaceOfBirth: "",
        motherAddress: "",
        houseNo: "",
        street: "",
        village: "",
        taluka: "",
        district: "",
        state: "",
        pincode: "",
        registrationType: "",
        delayReason: "",
        declaration: false,
        finalDeclaration: false,
    });

    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.back();
                return true;
            }
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep]);

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });
            if (result.canceled === false && result.assets && result.assets[0]) {
                const file = result.assets[0];
                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Please upload a file smaller than 5MB");
                    return;
                }
                setDocuments(prev => ({ ...prev, [docType]: { name: file.name, size: file.size, uri: file.uri } }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const formatDate = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        return formatted;
    };

    const formatTime = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + ":" + cleaned.slice(2, 4);
        return formatted;
    };

    const handleSendOTP = async (type: 'applicant' | 'father' | 'mother') => {
        const mobile = type === 'father' ? formData.fatherMobile : type === 'mother' ? formData.motherMobile : formData.applicantMobile;
        const aadhaar = type === 'father' ? formData.fatherAadhaar : type === 'mother' ? formData.motherAadhaar : formData.applicantAadhaar;
        const purpose = type === 'father' ? 'BIRTH_FATHER_VERIFY' : type === 'mother' ? 'BIRTH_MOTHER_VERIFY' : 'BIRTH_APPLY';
        const setSending = type === 'father' ? setIsFatherSendingOtp : type === 'mother' ? setIsMotherSendingOtp : setIsSendingOtp;
        const setSent = type === 'father' ? setIsFatherOtpSent : type === 'mother' ? setIsMotherOtpSent : setIsOtpSent;

        if (mobile.length !== 10) { Alert.alert("Error", "Valid 10-digit mobile number required"); return; }
        if (aadhaar.length !== 12) { Alert.alert("Error", "Valid 12-digit Aadhaar number required"); return; }

        setSending(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(API_ENDPOINTS.BIRTH_OTP_SEND, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ mobile_number: mobile, aadhar_number: aadhaar, purpose }),
            });
            const data = await response.json();
            if (data.success) {
                setSent(true);
                Alert.alert("Success", `OTP sent to ${type}'s mobile number`);
            } else {
                Alert.alert("Error", data.message || "Failed to send OTP");
            }
        } catch (error) {
            Alert.alert("Error", "Connection failed");
        } finally {
            setSending(false);
        }
    };

    const handleVerifyOTP = async (type: 'applicant' | 'father' | 'mother') => {
        const mobile = type === 'father' ? formData.fatherMobile : type === 'mother' ? formData.motherMobile : formData.applicantMobile;
        const otp = type === 'father' ? fatherOtpCode : type === 'mother' ? motherOtpCode : otpCode;
        const purpose = type === 'father' ? 'BIRTH_FATHER_VERIFY' : type === 'mother' ? 'BIRTH_MOTHER_VERIFY' : 'BIRTH_APPLY';
        const setVerifying = type === 'father' ? setIsFatherVerifyingOtp : type === 'mother' ? setIsMotherVerifyingOtp : setIsVerifyingOtp;
        const setVerified = type === 'father' ? setIsFatherOtpVerified : type === 'mother' ? setIsMotherOtpVerified : setIsOtpVerified;

        if (otp.length !== 6) { Alert.alert("Error", "Enter valid 6-digit OTP"); return; }

        setVerifying(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(API_ENDPOINTS.BIRTH_OTP_VERIFY, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ mobile_number: mobile, otp_code: otp, purpose }),
            });
            const data = await response.json();
            if (data.success) {
                setVerified(true);
                Alert.alert("Success", "Verified successfully");
            } else {
                Alert.alert("Error", data.message || "Invalid OTP");
            }
        } catch (error) {
            Alert.alert("Error", "Connection failed");
        } finally {
            setVerifying(false);
        }
    };

    const handleContinue = async () => {
        if (currentStep === 1) {
            const { childName, gender, dob, timeOfBirth, placeOfBirth, applicantMobile, applicantAadhaar, registrationType, fatherName, fatherAadhaar, fatherMobile, fatherDob, fatherMaritalStatus, fatherPlaceOfBirth, fatherAddress, motherName, motherAadhaar, motherMobile, motherDob, motherMaritalStatus, motherPlaceOfBirth, motherAddress } = formData;

            if (!childName || !gender || !dob || !timeOfBirth || !placeOfBirth || !registrationType) {
                Alert.alert("Required", "Please fill all mandatory child details");
                return;
            }
            if (!isOtpVerified) {
                Alert.alert("Verification Required", "Please verify Applicant's Aadhaar with OTP");
                return;
            }

            if (!fatherName || !fatherAadhaar || !fatherMobile || !fatherDob || !fatherMaritalStatus || !fatherPlaceOfBirth || !fatherAddress || !motherName || !motherAadhaar || !motherMobile || !motherDob || !motherMaritalStatus || !motherPlaceOfBirth || !motherAddress) {
                Alert.alert("Required", "Please fill all mandatory parents details");
                return;
            }
            if (!isFatherOtpVerified || !isMotherOtpVerified) {
                Alert.alert("Verification Required", "Both parents must verify Aadhaar via OTP");
                return;
            }

            const { houseNo, village, taluka, district, state, pincode } = formData;
            if (!houseNo || !village || !taluka || !district || !state || !pincode) {
                Alert.alert("Required", "Please fill all mandatory address details");
                return;
            }

            if (!formData.declaration) {
                Alert.alert("Required", "Please accept the declaration");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.hospitalReport || !documents.fatherAadhaar || !documents.motherAadhaar || !documents.addressProof) {
                Alert.alert("Documents Required", "Please upload all mandatory documents");
                return;
            }
            if (formData.registrationType === "Late" && !documents.affidavit) {
                Alert.alert("Document Required", "Affidavit is mandatory for late registration");
                return;
            }
            setCurrentStep(3);
        } else {
            if (!formData.finalDeclaration) {
                Alert.alert("Required", "Please accept the final declaration");
                return;
            }
            setIsSubmitting(true);
            try {
                const token = await AsyncStorage.getItem("userToken");
                const body = new FormData();
                const fieldMap: any = {
                    applicantMobile: 'applicant_mobile', applicantAadhaar: 'applicant_aadhaar', email: 'email',
                    childName: 'child_name', gender: 'gender', dob: 'dob', timeOfBirth: 'time_of_birth',
                    placeOfBirth: 'place_of_birth', hospitalName: 'hospital_name', registrationDate: 'registration_date',
                    fatherName: 'father_name', fatherAadhaar: 'father_aadhaar', fatherMobile: 'father_mobile', fatherOccupation: 'father_occupation',
                    fatherDob: 'father_dob', fatherMaritalStatus: 'father_marital_status', fatherPlaceOfBirth: 'father_place_of_birth', fatherAddress: 'father_address',
                    motherName: 'mother_name', motherAadhaar: 'mother_aadhaar', motherMobile: 'mother_mobile', motherOccupation: 'mother_occupation',
                    motherDob: 'mother_dob', motherMaritalStatus: 'mother_marital_status', motherPlaceOfBirth: 'mother_place_of_birth', motherAddress: 'mother_address',
                    houseNo: 'house_no', street: 'street', village: 'village', taluka: 'taluka', district: 'district', state: 'state', pincode: 'pincode',
                    registrationType: 'registration_type', delayReason: 'delay_reason'
                };
                Object.keys(fieldMap).forEach(key => {
                    if (formData[key as keyof FormDataType] !== undefined) {
                        body.append(fieldMap[key], String(formData[key as keyof FormDataType]));
                    }
                });
                const docMap: any = {
                    hospitalReport: 'hospital_report', fatherAadhaar: 'father_aadhaar_card', motherAadhaar: 'mother_aadhaar_card', addressProof: 'address_proof',
                    marriageCertificate: 'marriage_certificate', affidavit: 'affidavit'
                };
                Object.keys(docMap).forEach(key => {
                    const doc = documents[key];
                    if (doc) {
                        body.append(docMap[key], { uri: doc.uri, name: doc.name, type: doc.uri.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' } as any);
                    }
                });
                const response = await fetch(API_ENDPOINTS.BIRTH_APPLY, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: body
                });
                const result = await response.json();
                if (result.success) {
                    setApplicationId(result.data.reference_id || result.data.applicationId);
                    setIsSubmitted(true);
                } else {
                    Alert.alert("Error", result.message || "Failed to submit application");
                }
            } catch (error) {
                Alert.alert("Error", "Something went wrong during submission");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            <View style={styles.progressLine}><View style={[styles.progressLineActive, { width: `${((currentStep - 1) / 2) * 100}%` }]} /></View>
            <View style={styles.stepsRow}>
                {[1, 2, 3].map((s) => (
                    <View key={s} style={styles.stepItem}>
                        <View style={[styles.stepCircle, currentStep >= s && styles.stepCircleActive, currentStep > s && styles.stepCircleCompleted]}>
                            {currentStep > s ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[styles.stepNumber, currentStep >= s && styles.stepNumberActive]}>{s}</Text>}
                        </View>
                        <Text style={[styles.stepLabel, currentStep >= s && styles.stepLabelActive]}>
                            {s === 1 ? "Details" : s === 2 ? "Documents" : "Review"}
                        </Text>
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
                    <Text style={styles.successSubtitle}>Your Birth Certificate application has been received successfully.</Text>
                    <TouchableOpacity style={styles.idCard} onPress={() => { Clipboard.setString(applicationId); setShowCopied(true); setTimeout(() => setShowCopied(false), 2000); }}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={styles.idValue}>{applicationId}</Text>
                            <Ionicons name="copy-outline" size={20} color="#0D47A1" />
                        </View>
                    </TouchableOpacity>
                    {showCopied && <View style={styles.toast}><Text style={styles.toastText}>Copied to clipboard</Text></View>}
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
                    <TouchableOpacity style={styles.backButton} onPress={() => { if (currentStep > 1) setCurrentStep(currentStep - 1); else router.back(); }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Birth Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for registration</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>
                {renderStepIndicator()}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Applicant Verification" icon="shield-checkmark" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Mobile Number *" />
                                <Input value={formData.applicantMobile} onChangeText={(v: string) => setFormData({ ...formData, applicantMobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />
                                <Label text="Aadhaar Number *" />
                                <View style={styles.otpRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input value={formData.applicantAadhaar} onChangeText={(v: string) => setFormData({ ...formData, applicantAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} editable={!isOtpVerified} />
                                    </View>
                                    {!isOtpVerified && (
                                        <TouchableOpacity style={[styles.otpBtn, isSendingOtp && styles.btnDisabled]} onPress={() => handleSendOTP('applicant')} disabled={isSendingOtp}>
                                            {isSendingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>}
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {isOtpSent && !isOtpVerified && (
                                    <View style={styles.otpVerifyContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Input value={otpCode} onChangeText={setOtpCode} placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} icon="shield-checkmark-outline" />
                                        </View>
                                        <TouchableOpacity style={[styles.otpBtn, isVerifyingOtp && styles.btnDisabled, { backgroundColor: '#2E7D32' }]} onPress={() => handleVerifyOTP('applicant')} disabled={isVerifyingOtp}>
                                            {isVerifyingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>Verify</Text>}
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {isOtpVerified && <View style={styles.verifiedBadge}><Ionicons name="checkmark-circle" size={16} color="#2E7D32" /><Text style={styles.verifiedText}>Aadhaar Verified</Text></View>}
                                <Label text="Email (Optional)" />
                                <Input value={formData.email} onChangeText={(v: string) => setFormData({ ...formData, email: v })} placeholder="Enter email address" icon="mail-outline" />
                            </View>

                            <SectionTitle title="Child Details" icon="person" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Child Full Name *" />
                                <Input value={formData.childName} onChangeText={(v: string) => setFormData({ ...formData, childName: v })} placeholder="Enter child name" icon="person-outline" />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}><Label text="Gender *" /><View style={styles.radioGroup}>{["Male", "Female"].map(g => (<TouchableOpacity key={g} style={[styles.radioBtn, formData.gender === g && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, gender: g })}><Text style={[styles.radioText, formData.gender === g && styles.radioTextActive]}>{g}</Text></TouchableOpacity>))}</View></View>
                                </View>
                                <View style={[styles.inputRow, { marginTop: 15, marginBottom: 5 }]}>
                                    <View style={{ flex: 1, marginRight: 15 }}>
                                        <Label text="Date of Birth *" />
                                        <Input value={formData.dob} onChangeText={(v: string) => setFormData({ ...formData, dob: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Time of Birth *" />
                                        <Input value={formData.timeOfBirth} onChangeText={(v: string) => setFormData({ ...formData, timeOfBirth: formatTime(v) })} placeholder="HH:MM" icon="time-outline" keyboardType="number-pad" maxLength={5} />
                                    </View>
                                </View>
                                <Label text="Place of Birth *" />
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>{["Hospital", "Home"].map(p => (<TouchableOpacity key={p} style={[styles.radioBtn, formData.placeOfBirth === p && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, placeOfBirth: p as any })}><Text style={[styles.radioText, formData.placeOfBirth === p && styles.radioTextActive]}>{p}</Text></TouchableOpacity>))}</View>
                                {formData.placeOfBirth === "Hospital" && (<><Label text="Hospital Name *" /><Input value={formData.hospitalName} onChangeText={(v: string) => setFormData({ ...formData, hospitalName: v })} placeholder="Enter hospital name" icon="business-outline" /></>)}
                                <Label text="Registration Date *" /><Input value={formData.registrationDate} onChangeText={(v: string) => setFormData({ ...formData, registrationDate: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />
                            </View>

                            <SectionTitle title="Father's Details" icon="person" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Father's Full Name *" /><Input value={formData.fatherName} onChangeText={(v: string) => setFormData({ ...formData, fatherName: v })} placeholder="Enter entry full name" icon="person-outline" />
                                <View style={[styles.inputRow, { marginBottom: 5 }]}>
                                    <View style={{ flex: 1, marginRight: 15 }}><Label text="Mobile Number *" /><Input value={formData.fatherMobile} onChangeText={(v: string) => setFormData({ ...formData, fatherMobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} /></View>
                                    <View style={{ flex: 1 }}><Label text="Date of Birth *" /><Input value={formData.fatherDob} onChangeText={(v: string) => setFormData({ ...formData, fatherDob: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} /></View>
                                </View>
                                <Label text="Aadhaar Number *" />
                                <View style={styles.otpRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input value={formData.fatherAadhaar} onChangeText={(v: string) => setFormData({ ...formData, fatherAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} editable={!isFatherOtpVerified} />
                                    </View>
                                    {!isFatherOtpVerified && (
                                        <TouchableOpacity style={[styles.otpBtn, isFatherSendingOtp && styles.btnDisabled]} onPress={() => handleSendOTP('father')} disabled={isFatherSendingOtp}>
                                            {isFatherSendingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>{isFatherOtpSent ? "Resend" : "Send OTP"}</Text>}
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {isFatherOtpSent && !isFatherOtpVerified && (
                                    <View style={styles.otpVerifyContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Input value={fatherOtpCode} onChangeText={setFatherOtpCode} placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} icon="shield-checkmark-outline" />
                                        </View>
                                        <TouchableOpacity style={[styles.otpBtn, isFatherVerifyingOtp && styles.btnDisabled, { backgroundColor: '#2E7D32' }]} onPress={() => handleVerifyOTP('father')} disabled={isFatherVerifyingOtp}>
                                            {isFatherVerifyingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>Verify</Text>}
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {isFatherOtpVerified && <View style={styles.verifiedBadge}><Ionicons name="checkmark-circle" size={16} color="#2E7D32" /><Text style={styles.verifiedText}>Father verified</Text></View>}
                                <Label text="Marital Status *" />
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>{["Married", "Divorced", "Widower"].map(s => (<TouchableOpacity key={s} style={[styles.radioBtn, formData.fatherMaritalStatus === s && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, fatherMaritalStatus: s })}><Text style={[styles.radioText, formData.fatherMaritalStatus === s && styles.radioTextActive]}>{s}</Text></TouchableOpacity>))}</View>
                                <Label text="Place of Birth *" /><Input value={formData.fatherPlaceOfBirth} onChangeText={(v: string) => setFormData({ ...formData, fatherPlaceOfBirth: v })} placeholder="City/Village" icon="location-outline" />
                                <Label text="Permanent Address *" /><Input value={formData.fatherAddress} onChangeText={(v: string) => setFormData({ ...formData, fatherAddress: v })} placeholder="Full address" icon="home-outline" multiline numberOfLines={2} style={{ height: 60, textAlignVertical: 'top' }} />
                                <Label text="Occupation" /><Input value={formData.fatherOccupation} onChangeText={(v: string) => setFormData({ ...formData, fatherOccupation: v })} placeholder="Father's occupation" icon="briefcase-outline" />
                            </View>

                            <SectionTitle title="Mother's Details" icon="person" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Mother's Full Name *" /><Input value={formData.motherName} onChangeText={(v: string) => setFormData({ ...formData, motherName: v })} placeholder="Enter entry full name" icon="person-outline" />
                                <View style={[styles.inputRow, { marginBottom: 5 }]}>
                                    <View style={{ flex: 1, marginRight: 15 }}><Label text="Mobile Number *" /><Input value={formData.motherMobile} onChangeText={(v: string) => setFormData({ ...formData, motherMobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} /></View>
                                    <View style={{ flex: 1 }}><Label text="Date of Birth *" /><Input value={formData.motherDob} onChangeText={(v: string) => setFormData({ ...formData, motherDob: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} /></View>
                                </View>
                                <Label text="Aadhaar Number *" />
                                <View style={styles.otpRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input value={formData.motherAadhaar} onChangeText={(v: string) => setFormData({ ...formData, motherAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} editable={!isMotherOtpVerified} />
                                    </View>
                                    {!isMotherOtpVerified && (
                                        <TouchableOpacity style={[styles.otpBtn, isMotherSendingOtp && styles.btnDisabled]} onPress={() => handleSendOTP('mother')} disabled={isMotherSendingOtp}>
                                            {isMotherSendingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>{isMotherOtpSent ? "Resend" : "Send OTP"}</Text>}
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {isMotherOtpSent && !isMotherOtpVerified && (
                                    <View style={styles.otpVerifyContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Input value={motherOtpCode} onChangeText={setMotherOtpCode} placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} icon="shield-checkmark-outline" />
                                        </View>
                                        <TouchableOpacity style={[styles.otpBtn, isMotherVerifyingOtp && styles.btnDisabled, { backgroundColor: '#2E7D32' }]} onPress={() => handleVerifyOTP('mother')} disabled={isMotherVerifyingOtp}>
                                            {isMotherVerifyingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>Verify</Text>}
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {isMotherOtpVerified && <View style={styles.verifiedBadge}><Ionicons name="checkmark-circle" size={16} color="#2E7D32" /><Text style={styles.verifiedText}>Mother verified</Text></View>}
                                <Label text="Marital Status *" />
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>{["Married", "Divorced", "Widow"].map(s => (<TouchableOpacity key={s} style={[styles.radioBtn, formData.motherMaritalStatus === s && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, motherMaritalStatus: s })}><Text style={[styles.radioText, formData.motherMaritalStatus === s && styles.radioTextActive]}>{s}</Text></TouchableOpacity>))}</View>
                                <Label text="Place of Birth *" /><Input value={formData.motherPlaceOfBirth} onChangeText={(v: string) => setFormData({ ...formData, motherPlaceOfBirth: v })} placeholder="City/Village" icon="location-outline" />
                                <Label text="Permanent Address *" /><Input value={formData.motherAddress} onChangeText={(v: string) => setFormData({ ...formData, motherAddress: v })} placeholder="Full address" icon="home-outline" multiline numberOfLines={2} style={{ height: 60, textAlignVertical: 'top' }} />
                                <Label text="Occupation" /><Input value={formData.motherOccupation} onChangeText={(v: string) => setFormData({ ...formData, motherOccupation: v })} placeholder="Mother's occupation" icon="briefcase-outline" />
                            </View>

                            <SectionTitle title="Residential Address" icon="home" color="#1A237E" />
                            <View style={styles.formCard}>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}><Label text="House/Flat No *" /><Input value={formData.houseNo} onChangeText={(v: string) => setFormData({ ...formData, houseNo: v })} placeholder="Flat No / House No" /></View>
                                    <View style={{ flex: 1 }}><Label text="Village/City *" /><Input value={formData.village} onChangeText={(v: string) => setFormData({ ...formData, village: v })} placeholder="Village/City" /></View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}><Label text="Taluka *" /><Input value={formData.taluka} onChangeText={(v: string) => setFormData({ ...formData, taluka: v })} placeholder="Taluka" /></View>
                                    <View style={{ flex: 1 }}><Label text="District *" /><Input value={formData.district} onChangeText={(v: string) => setFormData({ ...formData, district: v })} placeholder="District" /></View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}><Label text="State *" /><Input value={formData.state} onChangeText={(v: string) => setFormData({ ...formData, state: v })} placeholder="State" /></View>
                                    <View style={{ flex: 1 }}><Label text="Pincode *" /><Input value={formData.pincode} onChangeText={(v: string) => setFormData({ ...formData, pincode: v.replace(/\D/g, '').substring(0, 6) })} placeholder="6-digit" keyboardType="number-pad" maxLength={6} /></View>
                                </View>
                            </View>

                            <SectionTitle title="Registration Type" icon="options" color="#1A237E" />
                            <View style={styles.formCard}>
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>{[{ id: "Normal", label: "Normal (On-time)" }, { id: "Late", label: "Late Registration" }].map(r => (<TouchableOpacity key={r.id} style={[styles.radioBtn, formData.registrationType === r.id && styles.radioBtnActive, { flex: 1 }]} onPress={() => setFormData({ ...formData, registrationType: r.id as any })}><Text style={[styles.radioText, formData.registrationType === r.id && styles.radioTextActive]}>{r.label}</Text></TouchableOpacity>))}</View>
                                {formData.registrationType === "Late" && (<><Label text="Reason for Delay *" /><Input value={formData.delayReason} onChangeText={(v: string) => setFormData({ ...formData, delayReason: v })} placeholder="State reason for delay" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} /></>)}
                            </View>
                            <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}><View style={[styles.checkBox, formData.declaration && styles.checkBoxActive]}>{formData.declaration && <Ionicons name="checkmark" size={14} color="#FFF" />}</View><Text style={styles.declarationText}>I declare that the information provided is true and correct.</Text></TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.cardHeaderIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="document-text" size={20} color="#1565C0" />
                                </View>
                                <View>
                                    <Text style={styles.cardHeaderTitle}>Upload Documents</Text>
                                    <Text style={styles.cardHeaderSubtitle}>Clear photos or PDF (Max 5MB)</Text>
                                </View>
                            </View>

                            <View style={styles.docList}>
                                {REQUIRED_DOCS.map((doc) => (
                                    (doc.id !== 'affidavit' || formData.registrationType === 'Late') && (
                                        <TouchableOpacity key={doc.id} style={[styles.docUploadCard, documents[doc.id] && styles.docUploadCardActive]} onPress={() => pickDocument(doc.id as keyof DocumentsState)}>
                                            <View style={[styles.docIconCircle, { backgroundColor: doc.color + '15' }]}><MaterialCommunityIcons name={doc.icon as any} size={24} color={documents[doc.id] ? "#FFF" : doc.color} style={documents[doc.id] && { backgroundColor: doc.color, borderRadius: 12, padding: 4 }} /></View>
                                            <View style={styles.docTextContent}><Text style={styles.docTitle}>{doc.name}</Text><Text style={styles.docHint}>{documents[doc.id] ? documents[doc.id]!.name : doc.hint}</Text></View>
                                            <Ionicons name={documents[doc.id] ? "checkmark-circle" : "cloud-upload"} size={24} color={documents[doc.id] ? "#2E7D32" : "#94A3B8"} />
                                        </TouchableOpacity>
                                    )
                                ))}
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Your Details" icon="eye" color="#1A237E" />
                            <ReviewCard title="Child Info" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Full Name" value={formData.childName} />
                                <ReviewItem label="DOB" value={formData.dob} />
                                <ReviewItem label="Place" value={formData.placeOfBirth} />
                            </ReviewCard>
                            <ReviewCard title="Applicant Info" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Mobile" value={formData.applicantMobile} />
                                <ReviewItem label="Aadhaar" value={formData.applicantAadhaar} />
                            </ReviewCard>
                            <ReviewCard title="Father's Details" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Name" value={formData.fatherName} />
                                <ReviewItem label="Aadhaar" value={formData.fatherAadhaar} />
                                <ReviewItem label="Verified" value={isFatherOtpVerified ? "Yes ✅" : "No ❌"} />
                            </ReviewCard>
                            <ReviewCard title="Mother's Details" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Name" value={formData.motherName} />
                                <ReviewItem label="Aadhaar" value={formData.motherAadhaar} />
                                <ReviewItem label="Verified" value={isMotherOtpVerified ? "Yes ✅" : "No ❌"} />
                            </ReviewCard>
                            <ReviewCard title="Residential Address" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Address" value={`${formData.houseNo}, ${formData.village}, ${formData.taluka}, ${formData.district}, ${formData.state} - ${formData.pincode}`} />
                            </ReviewCard>
                            <ReviewCard title="Documents" onEdit={() => setCurrentStep(2)}>
                                <View style={styles.reviewDocList}>
                                    {Object.entries(documents).filter(([_, v]) => v).map(([k, v]) => (
                                        <View key={k} style={styles.reviewDocItem}><Ionicons name="checkmark-circle" size={16} color="#2E7D32" /><Text style={styles.reviewDocName}>{v?.name}</Text></View>
                                    ))}
                                </View>
                            </ReviewCard>
                            <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, finalDeclaration: !formData.finalDeclaration })}><View style={[styles.checkBox, formData.finalDeclaration && styles.checkBoxActive]}>{formData.finalDeclaration && <Ionicons name="checkmark" size={14} color="#FFF" />}</View><Text style={styles.declarationText}>I confirm that all submitted documents are genuine.</Text></TouchableOpacity>
                        </View>
                    )}
                    <View style={{ height: 40 }} />
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.mainBtn} onPress={handleContinue} disabled={isSubmitting}>
                            <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                                {isSubmitting ? <ActivityIndicator color="#FFF" size="small" /> : (<><Text style={styles.mainBtnText}>{currentStep === 4 ? "Submit Application" : "Continue"}</Text><Ionicons name={currentStep === 4 ? "checkmark-done" : "arrow-forward"} size={18} color="#FFF" /></>)}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const SectionTitle = ({ title, icon, color }: any) => (<View style={styles.sectionHeader}><View style={[styles.iconCircle, { backgroundColor: color + '15' }]}><Ionicons name={icon} size={18} color={color} /></View><Text style={[styles.sectionTitle, { color }]}>{title}</Text></View>);
const Label = ({ text }: any) => <Text style={styles.label}>{text}</Text>;
const Input = ({ icon, style, ...props }: any) => (<View style={[styles.inputContainer, style]}>{icon && <Ionicons name={icon} size={18} color="#94A3B8" style={{ marginRight: 10 }} />}<TextInput style={styles.field} placeholderTextColor="#94A3B8" {...props} /></View>);
const ReviewCard = ({ title, children, onEdit }: any) => (<View style={styles.reviewCard}><View style={styles.reviewHeader}><Text style={styles.reviewTitle}>{title}</Text><TouchableOpacity onPress={onEdit}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity></View><View style={styles.reviewContent}>{children}</View></View>);
const ReviewItem = ({ label, value }: any) => (<View style={styles.reviewItem}><Text style={styles.reviewLabel}>{label}:</Text><Text style={styles.reviewValue}>{value || "N/A"}</Text></View>);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
    placeholder: { width: 34 },
    stepIndicatorContainer: { backgroundColor: '#FFF', paddingVertical: 15, paddingHorizontal: 30 },
    progressLine: { position: 'absolute', top: 32, left: 60, right: 60, height: 2, backgroundColor: '#F1F5F9' },
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
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 20 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, elevation: 2, marginBottom: 15 },
    label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 50, marginBottom: 15 },
    field: { flex: 1, fontSize: 14, color: '#1E293B' },
    inputRow: { flexDirection: 'row' },
    radioGroup: { flexDirection: 'row', gap: 10 },
    radioBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
    radioBtnActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    radioText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    radioTextActive: { color: '#0D47A1', fontWeight: '700' },
    lateNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
    lateNoticeText: { fontSize: 12, color: '#C62828', fontWeight: '600' },
    docList: { gap: 12, marginTop: 10 },
    docUploadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    docUploadCardActive: { borderColor: '#C8E6C9', backgroundColor: '#F1FBF4' },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    docTextContent: { flex: 1 },
    docTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    cardHeaderIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    cardHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    cardHeaderSubtitle: { fontSize: 12, color: '#64748B' },
    reviewCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
    reviewContent: { marginTop: 4 },
    reviewTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1', textTransform: 'uppercase' },
    editBtn: { fontSize: 12, fontWeight: '700', color: '#1565C0' },
    reviewItem: { flexDirection: 'row', marginBottom: 6 },
    reviewLabel: { width: 100, fontSize: 13, color: '#64748B' },
    reviewValue: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1E293B' },
    reviewDocList: { gap: 6 },
    reviewDocItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    reviewDocName: { fontSize: 12, color: '#1E293B' },
    declarationBox: { flexDirection: 'row', marginTop: 20, gap: 12, alignItems: 'flex-start', padding: 4 },
    checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#0D47A1', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    checkBoxActive: { backgroundColor: '#0D47A1' },
    declarationText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },
    bottomBar: { paddingVertical: 20 },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFF' },
    successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
    successSubtitle: { color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 },
    idCard: { backgroundColor: '#F8FAFC', padding: 24, borderRadius: 20, width: '100%', alignItems: 'center', marginVertical: 32, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: '800', color: '#0D47A1', marginTop: 4 },
    toast: { position: 'absolute', bottom: 120, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignSelf: 'center' },
    toastText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    otpRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    otpBtn: { backgroundColor: '#0D47A1', paddingHorizontal: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 70 },
    otpBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    btnDisabled: { opacity: 0.5 },
    otpVerifyContainer: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12, marginBottom: 15 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    verifiedText: { color: '#2E7D32', fontSize: 12, fontWeight: '600' },
});
