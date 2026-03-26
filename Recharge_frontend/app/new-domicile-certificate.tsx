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
    Modal,
    FlatList,
    ToastAndroid,
    Platform,
    KeyboardAvoidingView
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
    // Applicant Details
    fullName: string;
    aadhaarNumber: string;
    dob: string;
    gender: string;
    mobileNumber: string;
    email: string;

    // Residence Details
    houseNo: string;
    street: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;
    durationOfStay: string;

    // Occupation Details
    occupation: string;
    isStudent: string; // "Yes" | "No"
    schoolName: string;
    standard: string;

    // Purpose
    purpose: string;

    declaration: boolean;
    finalDeclaration: boolean;
}

interface DocumentsState {
    aadhaarCard: DocumentType | null;
    addressProof: DocumentType | null;
    rationCard: DocumentType | null;
    birthCert: DocumentType | null;
    schoolLeaving: DocumentType | null;
    residenceProof: DocumentType | null;
    selfDeclaration: DocumentType | null;
    photo: DocumentType | null;
    [key: string]: DocumentType | null;
}

const PURPOSES = [
    "Education",
    "Government Job",
    "Scholarship",
    "Legal Purpose",
    "Other"
];

export default function NewDomicileCertificateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [showPurposeModal, setShowPurposeModal] = useState(false);

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarCard: null,
        addressProof: null,
        rationCard: null,
        birthCert: null,
        schoolLeaving: null,
        residenceProof: null,
        selfDeclaration: null,
        photo: null,
    });

    const [showCopied, setShowCopied] = useState(false);

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        dob: "",
        gender: "",
        mobileNumber: "",
        email: "",
        houseNo: "",
        street: "",
        village: "",
        taluka: "",
        district: "",
        state: "",
        pincode: "",
        durationOfStay: "",
        occupation: "",
        isStudent: "",
        schoolName: "",
        standard: "",
        purpose: "",
        declaration: false,
        finalDeclaration: false,
    });

    const REQUIRED_DOCS = [
        { id: 'photo', name: 'Photo (फोटो) *', icon: 'camera', color: '#1565C0', hint: 'Passsport size photo' },
        { id: 'aadhaarCard', name: 'Aadhaar Card *', icon: 'card-account-details', color: '#2E7D32', hint: 'Front & Back side' },
        { id: 'addressProof', name: 'Address Proof *', icon: 'home-map-marker', color: '#E65100', hint: 'Light Bill / Rent Agreement' },
        { id: 'birthCert', name: 'Birth Certificate *', icon: 'baby-carriage', color: '#7B1FA2', hint: 'Age proof document' },
        { id: 'rationCard', name: 'Ration Card *', icon: 'book-open-variant', color: '#C62828', hint: 'Updated copy required' },
        { id: 'selfDeclaration', name: 'Self Declaration *', icon: 'file-document-edit', color: '#1A237E', hint: 'Standard format' },
        { id: 'schoolLeaving', name: 'School Leaving Certificate *', icon: 'school', color: '#00796B', hint: 'Bonafide or TC' },
    ];

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

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

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

                if (file.size && file.size > 2 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Please upload a file smaller than 2MB");
                    return;
                }

                setDocuments((prev) => ({
                    ...prev,
                    [docType]: {
                        name: file.name,
                        size: file.size,
                        uri: file.uri,
                    },
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const removeDocument = (docType: keyof DocumentsState) => {
        setDocuments((prev) => ({
            ...prev,
            [docType]: null,
        }));
    };

    const formatDate = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        return formatted;
    };

    const handleSendOTP = async () => {
        if (formData.mobileNumber.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit mobile number");
            return;
        }
        if (formData.aadhaarNumber.length !== 12) {
            Alert.alert("Error", "Please enter a valid 12-digit Aadhaar number");
            return;
        }

        setIsSendingOtp(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(API_ENDPOINTS.DOMICILE_OTP_SEND, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    mobile_number: formData.mobileNumber,
                    aadhar_number: formData.aadhaarNumber
                }),
            });

            const data = await response.json();
            if (data.success) {
                setIsOtpSent(true);
                Alert.alert("Success", "OTP sent to your mobile number");
            } else {
                Alert.alert("Error", data.message || "Failed to send OTP");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otpCode.length !== 6) {
            Alert.alert("Error", "Please enter a valid 6-digit OTP");
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await fetch(API_ENDPOINTS.DOMICILE_OTP_VERIFY, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    mobile_number: formData.mobileNumber,
                    otp_code: otpCode
                }),
            });

            const data = await response.json();
            if (data.success) {
                setIsOtpVerified(true);
                Alert.alert("Success", "Aadhaar verified successfully");
            } else {
                Alert.alert("Error", data.message || "Invalid OTP");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleContinue = async () => {
        if (currentStep === 1) {
            // Step 1 Validation
            const { fullName, aadhaarNumber, dob, gender, mobileNumber, houseNo, village, taluka, district, pincode, isStudent, purpose, declaration } = formData;

            if (!fullName || aadhaarNumber.length !== 12 || !dob || !gender || mobileNumber.length !== 10) {
                Alert.alert("Required", "Please fill mandatory applicant details correctly");
                return;
            }
            if (!isOtpVerified) {
                Alert.alert("Verification Required", "Please verify your Aadhaar with OTP");
                return;
            }
            if (!houseNo || !village || !taluka || !district || pincode.length !== 6) {
                Alert.alert("Required", "Please fill mandatory residence details correctly");
                return;
            }
            if (!isStudent) {
                Alert.alert("Required", "Please select if you are a student");
                return;
            }
            if (isStudent === "Yes" && (!formData.schoolName || !formData.standard)) {
                Alert.alert("Required", "Please fill school/college details");
                return;
            }
            if (!purpose) {
                Alert.alert("Required", "Please select the purpose of certificate");
                return;
            }
            if (!declaration) {
                Alert.alert("Required", "Please accept the declaration");
                return;
            }

            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Step 2 Validation - Mandatory documents
            if (!documents.aadhaarCard || !documents.addressProof || !documents.rationCard || !documents.selfDeclaration || !documents.photo || !documents.birthCert) {
                Alert.alert("Documents Required", "Please upload all mandatory documents");
                return;
            }
            // Conditional document
            if (formData.isStudent === "Yes" && !documents.schoolLeaving) {
                Alert.alert("Document Required", "School Leaving/Bonafide is mandatory for students");
                return;
            }
            setCurrentStep(3);
        } else {
            // Step 3
            if (!formData.finalDeclaration) {
                Alert.alert("Required", "Please accept the final declaration");
                return;
            }

            setIsSubmitting(true);
            try {
                const token = await AsyncStorage.getItem("userToken");
                const body = new FormData();

                // Append text fields
                const fieldMap: any = {
                    fullName: 'full_name',
                    aadhaarNumber: 'aadhaar_number',
                    mobileNumber: 'mobile_number',
                    email: 'email',
                    dob: 'dob',
                    gender: 'gender',
                    durationOfStay: 'years_in_state',
                    occupation: 'occupation',
                    purpose: 'reason',
                    houseNo: 'house_no',
                    street: 'street',
                    village: 'village',
                    taluka: 'taluka',
                    district: 'district',
                    state: 'state',
                    pincode: 'pincode',
                    isStudent: 'is_student',
                    schoolName: 'school_name',
                    standard: 'standard'
                };

                Object.keys(fieldMap).forEach(key => {
                    if (formData[key as keyof FormDataType] !== undefined) {
                        body.append(fieldMap[key], String(formData[key as keyof FormDataType]));
                    }
                });

                // Append documents
                const docMap: any = {
                    aadhaarCard: 'aadhaar_card',
                    addressProof: 'residence_proof',
                    rationCard: 'ration_card',
                    birthCert: 'birth_cert',
                    schoolLeaving: 'school_leaving',
                    selfDeclaration: 'self_declaration',
                    photo: 'photo'
                };

                Object.keys(docMap).forEach(key => {
                    const doc = documents[key];
                    if (doc) {
                        body.append(docMap[key], {
                            uri: doc.uri,
                            name: doc.name,
                            type: doc.uri.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
                        } as any);
                    }
                });

                const response = await fetch(API_ENDPOINTS.DOMICILE_APPLY, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
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
            <View style={styles.progressLine}>
                <View style={[styles.progressLineActive, { width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }]} />
            </View>
            <View style={styles.stepsRow}>
                {[1, 2, 3].map((s) => (
                    <View key={s} style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            currentStep >= s && styles.stepCircleActive,
                            currentStep > s && styles.stepCircleCompleted
                        ]}>
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
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={styles.successTitle}>Application Submitted!</Text>
                    <Text style={styles.successSubtitle}>Your Domicile Certificate application has been received successfully.</Text>

                    <TouchableOpacity
                        style={styles.idCard}
                        onPress={() => {
                            Clipboard.setString(applicationId);
                            setShowCopied(true);
                            setTimeout(() => setShowCopied(false), 2000);
                        }}
                    >
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={styles.idValue}>{applicationId}</Text>
                            <Ionicons name="copy-outline" size={20} color="#0D47A1" />
                        </View>
                    </TouchableOpacity>

                    {showCopied && (
                        <View style={styles.toast}>
                            <Text style={styles.toastText}>Copied to clipboard</Text>
                        </View>
                    )}

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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (currentStep > 1) setCurrentStep(currentStep - 1);
                        else router.back();
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Domicile Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for registration</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                        {currentStep === 1 && (
                            <View style={styles.stepWrapper}>
                                <SectionTitle title="Applicant Details" icon="person" color="#1A237E" />
                                <View style={styles.formCard}>
                                    <Label text="Full Name (as per Aadhaar) *" />
                                    <Input value={formData.fullName} onChangeText={(v: string) => setFormData({ ...formData, fullName: v })} placeholder="Enter your full name" icon="person-outline" />

                                    <Label text="Date of Birth *" />
                                    <Input value={formData.dob} onChangeText={(v: string) => setFormData({ ...formData, dob: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />

                                    <Label text="Gender *" />
                                    <View style={[styles.radioGroup, { marginBottom: 12 }]}>
                                        {["Male", "Female", "Other"].map(g => (
                                            <TouchableOpacity key={g} style={[styles.radioBtn, formData.gender === g && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                                <Text style={[styles.radioText, formData.gender === g && styles.radioTextActive]}>{g}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <Label text="Mobile Number *" />
                                    <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />

                                    <Label text="Aadhaar Number *" />
                                    <View style={styles.otpRow}>
                                        <View style={{ flex: 1 }}>
                                            <Input
                                                value={formData.aadhaarNumber}
                                                onChangeText={(v: string) => setFormData({ ...formData, aadhaarNumber: v.replace(/\D/g, '').substring(0, 12) })}
                                                placeholder="12-digit Aadhaar"
                                                icon="card-outline"
                                                keyboardType="number-pad"
                                                maxLength={12}
                                                editable={!isOtpVerified}
                                            />
                                        </View>
                                        {!isOtpVerified && (
                                            <TouchableOpacity
                                                style={[styles.otpBtn, isSendingOtp && { opacity: 0.7 }]}
                                                onPress={handleSendOTP}
                                                disabled={isSendingOtp}
                                            >
                                                {isSendingOtp ? <ActivityIndicator size="small" color="#0D47A1" /> : (
                                                    <Text style={styles.otpBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {isOtpSent && !isOtpVerified && (
                                        <View style={styles.otpVerifyContainer}>
                                            <View style={{ flex: 1 }}>
                                                <Input
                                                    value={otpCode}
                                                    onChangeText={setOtpCode}
                                                    placeholder="Enter 6-digit OTP"
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                    icon="shield-checkmark-outline"
                                                />
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.otpBtn, isVerifyingOtp && { opacity: 0.5 }, { backgroundColor: '#2E7D32' }]}
                                                onPress={handleVerifyOTP}
                                                disabled={isVerifyingOtp}
                                            >
                                                {isVerifyingOtp ? <ActivityIndicator size="small" color="#FFF" /> : (
                                                    <Text style={styles.otpBtnText}>Verify</Text>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {isOtpVerified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                            <Text style={styles.verifiedText}>Aadhaar Verified</Text>
                                        </View>
                                    )}

                                    <Label text="Email (Optional)" />
                                    <Input value={formData.email} onChangeText={(v: string) => setFormData({ ...formData, email: v })} placeholder="Enter email address" icon="mail-outline" />
                                </View>

                                <SectionTitle title="Residence Details" icon="home" color="#1A237E" />
                                <View style={styles.formCard}>
                                    <Label text="House/Flat No *" />
                                    <Input value={formData.houseNo} onChangeText={(v: string) => setFormData({ ...formData, houseNo: v })} placeholder="Flat No / House No" />
                                    <Label text="Street / Area" />
                                    <Input value={formData.street} onChangeText={(v: string) => setFormData({ ...formData, street: v })} placeholder="Landmark / Area" />
                                    <View style={styles.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Label text="Village/City *" />
                                            <Input value={formData.village} onChangeText={(v: string) => setFormData({ ...formData, village: v })} placeholder="Village/City" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Label text="Taluka *" />
                                            <Input value={formData.taluka} onChangeText={(v: string) => setFormData({ ...formData, taluka: v })} placeholder="Taluka" />
                                        </View>
                                    </View>
                                    <View style={styles.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Label text="District *" />
                                            <Input value={formData.district} onChangeText={(v: string) => setFormData({ ...formData, district: v })} placeholder="District" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Label text="State *" />
                                            <Input value={formData.state} onChangeText={(v: string) => setFormData({ ...formData, state: v })} placeholder="State" />
                                        </View>
                                    </View>
                                    <View style={styles.inputRow}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Label text="PIN Code *" />
                                            <Input value={formData.pincode} onChangeText={(v: string) => setFormData({ ...formData, pincode: v.replace(/\D/g, '').substring(0, 6) })} placeholder="6-digit" keyboardType="number-pad" maxLength={6} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Label text="Duration of Stay (Years) *" />
                                            <Input value={formData.durationOfStay} onChangeText={(v: string) => setFormData({ ...formData, durationOfStay: v.replace(/\D/g, '') })} placeholder="No. of years" keyboardType="number-pad" />
                                        </View>
                                    </View>
                                </View>

                                <SectionTitle title="Occupation Details" icon="briefcase" color="#1A237E" />
                                <View style={styles.formCard}>
                                    <Label text="Occupation" />
                                    <Input value={formData.occupation} onChangeText={(v: string) => setFormData({ ...formData, occupation: v })} placeholder="Your primary occupation" icon="briefcase-outline" />

                                    <Label text="Are you a Student? *" />
                                    <View style={[styles.radioGroup, { marginBottom: 12 }]}>
                                        {["Yes", "No"].map(o => (
                                            <TouchableOpacity key={o} style={[styles.radioBtn, formData.isStudent === o && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, isStudent: o })}>
                                                <Text style={[styles.radioText, formData.isStudent === o && styles.radioTextActive]}>{o}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {formData.isStudent === "Yes" && (
                                        <>
                                            <Label text="School / College Name *" />
                                            <Input value={formData.schoolName} onChangeText={(v: string) => setFormData({ ...formData, schoolName: v })} placeholder="Enter school/college name" icon="business-outline" />
                                            <Label text="Standard / Course *" />
                                            <Input value={formData.standard} onChangeText={(v: string) => setFormData({ ...formData, standard: v })} placeholder="Standard/Course" icon="school-outline" />
                                        </>
                                    )}
                                </View>

                                <SectionTitle title="Purpose of Certificate" icon="ribbon" color="#1A237E" />
                                <View style={styles.formCard}>
                                    <Label text="Purpose *" />
                                    <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowPurposeModal(true)}>
                                        <Text style={[styles.dropdownValue, !formData.purpose && { color: '#94A3B8' }]}>
                                            {formData.purpose || "Select the purpose"}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#64748B" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                    <View style={[styles.checkBox, formData.declaration && styles.checkBoxActive]}>
                                        {formData.declaration && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                    </View>
                                    <Text style={styles.declarationText}>I declare that I am residing at the above address and the information provided is true.</Text>
                                </TouchableOpacity>
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
                                        <TouchableOpacity
                                            key={doc.id}
                                            style={[styles.docUploadCard, documents[doc.id] && styles.docUploadCardActive]}
                                            onPress={() => pickDocument(doc.id as keyof DocumentsState)}
                                        >
                                            <View style={[styles.docIconCircle, { backgroundColor: doc.color + '15' }]}>
                                                <MaterialCommunityIcons
                                                    name={doc.icon as any}
                                                    size={24}
                                                    color={documents[doc.id] ? "#FFF" : doc.color}
                                                    style={documents[doc.id] && { backgroundColor: doc.color, borderRadius: 12, padding: 4 }}
                                                />
                                            </View>
                                            <View style={styles.docTextContent}>
                                                <Text style={styles.docTitle}>{doc.name}</Text>
                                                <Text style={styles.docHint}>
                                                    {documents[doc.id] ? documents[doc.id]!.name : doc.hint}
                                                </Text>
                                            </View>
                                            <Ionicons
                                                name={documents[doc.id] ? "checkmark-circle" : "cloud-upload"}
                                                size={24}
                                                color={documents[doc.id] ? "#2E7D32" : "#94A3B8"}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {currentStep === 3 && (
                            <View style={styles.stepWrapper}>
                                <SectionTitle title="Review Your Details" icon="eye" color="#1A237E" />
                                <ReviewCard title="Applicant Info" onEdit={() => setCurrentStep(1)}>
                                    <ReviewItem label="Full Name" value={formData.fullName} />
                                    <ReviewItem label="Aadhaar" value={formData.aadhaarNumber} />
                                    <ReviewItem label="DOB" value={formData.dob} />
                                    <ReviewItem label="Gender" value={formData.gender} />
                                </ReviewCard>

                                <ReviewCard title="Residence" onEdit={() => setCurrentStep(1)}>
                                    <ReviewItem label="Address" value={`${formData.houseNo}, ${formData.street}, ${formData.village}, ${formData.taluka}, ${formData.district}, ${formData.state} - ${formData.pincode}`} />
                                    <ReviewItem label="Duration" value={`${formData.durationOfStay} Years`} />
                                </ReviewCard>

                                <ReviewCard title="Purpose & Student" onEdit={() => setCurrentStep(1)}>
                                    <ReviewItem label="Purpose" value={formData.purpose} />
                                    <ReviewItem label="Student" value={formData.isStudent} />
                                    {formData.isStudent === "Yes" && (
                                        <>
                                            <ReviewItem label="School" value={formData.schoolName} />
                                            <ReviewItem label="Standard" value={formData.standard} />
                                        </>
                                    )}
                                </ReviewCard>

                                <ReviewCard title="Documents" onEdit={() => setCurrentStep(2)}>
                                    <View style={styles.reviewDocList}>
                                        {Object.entries(documents).filter(([_, v]) => v).map(([k, v]) => (
                                            <View key={k} style={styles.reviewDocItem}>
                                                <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                                <Text style={styles.reviewDocName}>{v?.name}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </ReviewCard>

                                <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, finalDeclaration: !formData.finalDeclaration })}>
                                    <View style={[styles.checkBox, formData.finalDeclaration && styles.checkBoxActive]}>
                                        {formData.finalDeclaration && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                    </View>
                                    <Text style={styles.declarationText}>I confirm that all submitted documents are genuine and I am a resident of the stated address.</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                        <View style={styles.bottomBar}>
                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={handleContinue}
                                activeOpacity={0.8}
                                disabled={isSubmitting}
                            >
                                <LinearGradient
                                    colors={['#0D47A1', '#1565C0']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#FFF" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonText}>
                                                {currentStep === 3 ? "Submit Application" : "Continue"}
                                            </Text>
                                            <Ionicons
                                                name={currentStep === 3 ? "checkmark-done" : "arrow-forward"}
                                                size={20}
                                                color="#FFF"
                                            />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Purpose Modal */}
                <Modal visible={showPurposeModal} transparent animationType="fade">
                    <View style={styles.modalBg}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Purpose</Text>
                                <TouchableOpacity onPress={() => setShowPurposeModal(false)}>
                                    <Ionicons name="close" size={24} color="#1A1A1A" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={PURPOSES}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.purposeOption} onPress={() => { setFormData({ ...formData, purpose: item }); setShowPurposeModal(false); }}>
                                        <Text style={[styles.purposeOptionText, formData.purpose === item && { color: '#0D47A1', fontWeight: '700' }]}>
                                            {item}
                                        </Text>
                                        {formData.purpose === item && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>


            </SafeAreaView>
        </View>
    );
}

const SectionTitle = ({ title, icon, color }: { title: string, icon: any, color: string }) => (
    <View style={styles.sectionHeader}>
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
);

const Label = ({ text }: { text: string }) => <Text style={styles.inputLabel}>{text}</Text>;

const Input = ({ icon, ...props }: any) => (
    <View style={[styles.inputContainer, props.editable === false && { backgroundColor: '#F1F5F9' }]}>
        {icon && <Ionicons name={icon} size={18} color="#94A3B8" />}
        <TextInput {...props} style={styles.input} placeholderTextColor="#94A3B8" />
    </View>
);

const ReviewCard = ({ title, children, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>{title}</Text>
            <TouchableOpacity onPress={onEdit}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
        </View>
        <View style={styles.reviewContent}>{children}</View>
    </View>
);

const ReviewItem = ({ label, value }: any) => (
    <View style={styles.reviewItem}>
        <Text style={styles.reviewLabel}>{label}:</Text>
        <Text style={styles.reviewValue}>{value || "N/A"}</Text>
    </View>
);

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

    formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', height: 50 },
    input: { flex: 1, marginLeft: 6, fontSize: 14, color: '#1E293B', fontWeight: '500' },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between' },

    radioGroup: { flexDirection: 'row', gap: 10 },
    radioBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
    radioBtnActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    radioText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    radioTextActive: { color: '#0D47A1', fontWeight: '700' },

    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', paddingHorizontal: 12, justifyContent: 'space-between' },
    dropdownValue: { fontSize: 14, color: '#1E293B' },

    declarationBox: { flexDirection: 'row', marginTop: 20, gap: 12, alignItems: 'flex-start', padding: 4 },
    checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#0D47A1', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    checkBoxActive: { backgroundColor: '#0D47A1' },
    declarationText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },

    requiredDocsCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#0D47A1', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    requiredDocsTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1', marginBottom: 12 },
    docsList: { gap: 8 },
    docItem: { fontSize: 13, color: '#475569', lineHeight: 20 },

    uploadGrid: { gap: 12 },
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

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    purposeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    purposeOptionText: { fontSize: 16, color: '#1A237E' },

    bottomBar: {
        paddingVertical: 20,
    },
    continueButton: {
        borderRadius: 16,
        overflow: "hidden",
    },
    buttonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },

    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

    successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: "#FFF" },
    successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
    successSubtitle: { color: "#64748B", textAlign: "center", marginTop: 8, lineHeight: 20 },
    idCard: { backgroundColor: "#F8FAFC", padding: 24, borderRadius: 16, width: "100%", alignItems: "center", marginVertical: 32, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: "#94A3B8", fontWeight: '700', textTransform: "uppercase", letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: "800", color: "#0D47A1", marginTop: 4 },
    refCodeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    otpRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    otpBtn: { backgroundColor: '#0D47A1', paddingHorizontal: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 70 },
    otpBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    otpVerifyContainer: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12, marginBottom: 15 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    verifiedText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
    successActions: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 12, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    timeEstimate: { fontSize: 12, color: '#94A3B8', marginTop: 20 },
    toast: { position: 'absolute', bottom: 120, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignSelf: 'center' },
    toastText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#0D47A1' },
    cardHeaderIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    cardHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    cardHeaderSubtitle: { fontSize: 12, color: '#64748B' },
    docList: { gap: 12 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 18, padding: 16, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
    docUploadCardActive: { borderColor: '#C8E6C9', backgroundColor: '#F1FBF4' },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    docTextContent: { flex: 1 },
    docTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
});
