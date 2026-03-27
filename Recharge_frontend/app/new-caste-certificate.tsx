import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    BackHandler,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../constants/api";

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
    type?: string;
}

interface FormDataType {
    // A. Applicant Details
    fullName: string;
    aadhaarNumber: string;
    dob: string;
    gender: string;
    mobileNumber: string;
    email: string;

    // B. Family Details
    fatherName: string;
    motherName: string;
    fatherAadhaar: string;
    fatherOccupation: string;

    // C. Caste Details
    category: string;
    subCaste: string;
    religion: string;
    fatherCaste: string;
    existingCertificateNo: string;
    domicileStatus: string;
    state: string;
    durationOfResidence: string;
    previouslyIssued: string;

    // D. Address Details
    houseNo: string;
    street: string;
    village: string;
    district: string;
    pincode: string;

    // Declaration
    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    aadhaarCard: DocumentType | null;
    rationCard: DocumentType | null;
    schoolLeavingCert: DocumentType | null;
    casteProof: DocumentType | null;
    fatherCasteCert: DocumentType | null;
    selfDeclaration: DocumentType | null;
    passportPhoto: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewCasteCertificate() {
    const router = useRouter();

    // Steps: 1: Details, 2: Documents, 3: Review
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [showCopied, setShowCopied] = useState(false);

    // OTP States
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [timer, setTimer] = useState(0);

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        dob: "",
        gender: "",
        mobileNumber: "",
        email: "",
        fatherName: "",
        motherName: "",
        fatherAadhaar: "",
        fatherOccupation: "",
        category: "",
        subCaste: "",
        religion: "",
        fatherCaste: "",
        existingCertificateNo: "",
        domicileStatus: "Yes",
        state: "Maharashtra",
        durationOfResidence: "",
        previouslyIssued: "No",
        houseNo: "",
        street: "",
        village: "",
        district: "",
        pincode: "",
        declaration: false,
        finalConfirmation: false,
    });

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarCard: null,
        rationCard: null,
        schoolLeavingCert: null,
        casteProof: null,
        fatherCasteCert: null,
        selfDeclaration: null,
        passportPhoto: null,
    });

    const REQUIRED_DOCS = [
        { id: 'aadhaarCard', name: 'Aadhaar Card *', icon: 'card-account-details', color: '#1565C0', hint: 'Front & Back side' },
        { id: 'rationCard', name: 'Ration Card *', icon: 'book-open-variant', color: '#2E7D32', hint: 'Updated copy required' },
        { id: 'schoolLeavingCert', name: 'School Leaving Certificate *', icon: 'school-outline', color: '#E65100', hint: 'LC / Bonafide certificate' },
        { id: 'casteProof', name: 'Caste Proof *', icon: 'shield-check-outline', color: '#7B1FA2', hint: 'Any old caste document' },
        { id: 'fatherCasteCert', name: "Father's Caste Cert *", icon: 'account-child-circle', color: '#C62828', hint: 'Mandatory for blood relation' },
        { id: 'selfDeclaration', name: 'Self Declaration *', icon: 'file-sign', color: '#00838F', hint: 'Signed declaration copy' },
        { id: 'passportPhoto', name: 'Passport Size Photo *', icon: 'camera-outline', color: '#455A64', hint: 'Recent clear photo' },
    ];

    // Timer effect for OTP
    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

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

    const sendOtp = async () => {
        if (formData.aadhaarNumber.length !== 12) {
            Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number");
            return;
        }
        if (formData.mobileNumber.length !== 10) {
            Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number");
            return;
        }

        setIsSendingOtp(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(API_ENDPOINTS.CASTE_OTP_SEND, {
                mobile_number: formData.mobileNumber,
                aadhar_number: formData.aadhaarNumber
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setIsOtpSent(true);
                setTimer(60);
                Alert.alert("OTP Sent", "Verification code has been sent to your mobile number");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const verifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert("Invalid OTP", "Please enter 6-digit OTP");
            return;
        }

        setIsVerifyingOtp(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(API_ENDPOINTS.CASTE_OTP_VERIFY, {
                mobile_number: formData.mobileNumber,
                otp_code: otp
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setIsOtpVerified(true);
                Alert.alert("Success", "Aadhaar verified successfully");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Invalid OTP");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

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
                setDocuments((prev) => ({
                    ...prev,
                    [docType]: file,
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const handleDOBChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        setFormData((prev) => ({ ...prev, dob: formatted }));
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            // Detailed validation for consolidated Step 1
            if (!formData.fullName || !formData.aadhaarNumber || !formData.dob || !formData.gender || !formData.mobileNumber) {
                Alert.alert("Required", "Please fill mandatory applicant details");
                return;
            }
            if (!isOtpVerified) {
                Alert.alert("Verification", "Please verify Aadhaar OTP to continue");
                return;
            }
            if (!formData.fatherName || !formData.motherName) {
                Alert.alert("Required", "Please fill mandatory family details");
                return;
            }
            if (!formData.category || !formData.subCaste || !formData.religion) {
                Alert.alert("Required", "Please fill mandatory caste details");
                return;
            }
            if (!formData.houseNo || !formData.village || !formData.pincode) {
                Alert.alert("Required", "Please fill mandatory address details");
                return;
            }
            if (!formData.declaration) {
                Alert.alert("Declaration", "Please accept the declaration to continue");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validation for documents
            const requiredIds = REQUIRED_DOCS.map(d => d.id);
            const missing = requiredIds.filter(id => !documents[id]);
            if (missing.length > 0) {
                Alert.alert("Documents Required", "Please upload all mandatory documents to proceed");
                return;
            }
            setCurrentStep(3);
        } else {
            // Step 3 Submission
            if (!formData.finalConfirmation) {
                Alert.alert("Confirmation", "Please confirm that all details are accurate");
                return;
            }
            if (!isOtpVerified) {
                Alert.alert("Error", "Please verify your Aadhaar OTP first");
                return;
            }
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                setIsSubmitting(false);
                Alert.alert("Session Expired", "Please login again");
                router.replace("/auth/login");
                return;
            }

            const postData = new FormData();
            
            // Map frontend camelCase to backend snake_case
            const fieldMap: Record<string, string> = {
                fullName: "full_name",
                aadhaarNumber: "aadhaar_number",
                mobileNumber: "mobile_number",
                email: "email",
                dob: "dob",
                gender: "gender",
                fatherName: "father_name",
                motherName: "mother_name",
                fatherAadhaar: "father_aadhaar",
                fatherOccupation: "father_occupation",
                category: "category",
                subCaste: "sub_caste",
                religion: "religion",
                fatherCaste: "father_caste",
                existingCertificateNo: "existing_certificate_no",
                domicileStatus: "domicile_status",
                state: "state",
                durationOfResidence: "duration_of_residence",
                previouslyIssued: "previously_issued",
                houseNo: "house_no",
                street: "street",
                village: "village",
                district: "district",
                pincode: "pincode"
            };

            Object.keys(fieldMap).forEach(key => {
                const backendKey = fieldMap[key];
                const value = (formData as any)[key];
                if (value !== undefined && value !== null) {
                    postData.append(backendKey, value.toString());
                }
            });

            const docMapping: Record<string, string> = {
                aadhaarCard: "aadhaar_card",
                rationCard: "ration_card",
                schoolLeavingCert: "school_leaving",
                casteProof: "caste_proof",
                fatherCasteCert: "father_caste_cert",
                selfDeclaration: "self_declaration",
                passportPhoto: "photo"
            };

            Object.keys(documents).forEach(key => {
                const file = documents[key];
                const backendKey = docMapping[key];
                if (file && backendKey) {
                    postData.append(backendKey, {
                        uri: file.uri,
                        name: file.name,
                        type: file.type || "application/octet-stream",
                    } as any);
                }
            });

            const response = await axios.post(API_ENDPOINTS.CASTE_APPLY, postData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setApplicationId(response.data.data.reference_id);
                setIsSubmitted(true);
            } else {
                Alert.alert("Error", response.data.message || "Failed to submit application");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "An error occurred during submission");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(applicationId);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 3000);
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            <View style={styles.progressLine}>
                <View style={[styles.progressLineActive, { width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }]} />
            </View>

            <View style={styles.stepsRow}>
                {[1, 2, 3].map((step) => (
                    <View key={step} style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            currentStep >= step && styles.stepCircleActive,
                            currentStep > step && styles.stepCircleCompleted
                        ]}>
                            {currentStep > step ? (
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            ) : (
                                <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>{step}</Text>
                            )}
                        </View>
                        <Text style={[styles.stepLabel, currentStep >= step && styles.stepLabelActive]}>
                            {step === 1 ? "Details" : step === 2 ? "Documents" : "Review"}
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
                    <Text style={styles.successSubtitle}>Your Caste Certificate application has been received successfully.</Text>

                    <TouchableOpacity style={styles.idCard} onPress={copyToClipboard}>
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
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (currentStep > 1) setCurrentStep(currentStep - 1);
                        else router.back();
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Caste Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for caste verification</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            {/* A. Applicant Details */}
                            <SectionTitle title="Applicant Details" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input
                                    value={formData.fullName}
                                    onChangeText={(text: string) => setFormData({ ...formData, fullName: text })}
                                    placeholder="Enter full name"
                                    icon="person-outline"
                                />


                                <Label text="Date of Birth *" />
                                <Input
                                    value={formData.dob}
                                    onChangeText={handleDOBChange}
                                    placeholder="DD/MM/YYYY"
                                    maxLength={10}
                                    keyboardType="number-pad"
                                    icon="calendar-outline"
                                />

                                <Label text="Gender *" />
                                <View style={styles.chipGroup}>
                                    {["Male", "Female", "Other"].map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.chip, formData.gender === g && styles.chipActive]}
                                            onPress={() => setFormData({ ...formData, gender: g })}
                                        >
                                            <Text style={[styles.chipText, formData.gender === g && styles.chipTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Mobile Number *" />
                                <Input
                                    value={formData.mobileNumber}
                                    onChangeText={(text: string) => setFormData({ ...formData, mobileNumber: text })}
                                    placeholder="10-digit mobile"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    icon="phone-portrait-outline"
                                />

                                <Label text="Aadhaar Number *" />
                                <View style={styles.otpRow}>
                                    <View style={{ flex: 1 }}>
                                        <Input
                                            value={formData.aadhaarNumber}
                                            onChangeText={(text: string) => setFormData({ ...formData, aadhaarNumber: text.replace(/\D/g, '').substring(0, 12) })}
                                            placeholder="12-digit Aadhaar"
                                            keyboardType="number-pad"
                                            maxLength={12}
                                            icon="card-outline"
                                            editable={!isOtpVerified}
                                        />
                                    </View>
                                    {!isOtpVerified && (
                                        <TouchableOpacity
                                            style={[styles.otpBtn, (isSendingOtp || timer > 0) && styles.btnDisabled]}
                                            onPress={sendOtp}
                                            disabled={isSendingOtp || timer > 0}
                                        >
                                            {isSendingOtp ? <ActivityIndicator size="small" color="#FFF" /> : (
                                                <Text style={styles.otpBtnText}>{timer > 0 ? `${timer}s` : "Send"}</Text>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    {isOtpVerified && (
                                        <View style={styles.verifiedTag}>
                                            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                            <Text style={styles.verifiedText}>Verified</Text>
                                        </View>
                                    )}
                                </View>

                                {isOtpSent && !isOtpVerified && (
                                    <View style={styles.otpVerifyContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Input
                                                value={otp}
                                                onChangeText={setOtp}
                                                placeholder="Enter 6-digit OTP"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                icon="shield-checkmark-outline"
                                            />
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.otpBtn, isVerifyingOtp && styles.btnDisabled, { backgroundColor: '#2E7D32' }]}
                                            onPress={verifyOtp}
                                            disabled={isVerifyingOtp}
                                        >
                                            {isVerifyingOtp ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.otpBtnText}>Verify</Text>}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <Label text="Email (optional)" />
                                <Input
                                    value={formData.email}
                                    onChangeText={(text: string) => setFormData({ ...formData, email: text })}
                                    placeholder="Email address"
                                    keyboardType="email-address"
                                    icon="mail-outline"
                                />
                            </View>

                            {/* B. Family Details */}
                            <SectionTitle title="Family Details" icon="people" />
                            <View style={styles.formCard}>
                                <Label text="Father's Name *" />
                                <Input value={formData.fatherName} onChangeText={(t: string) => setFormData({ ...formData, fatherName: t })} placeholder="Enter father's name" />
                                <Label text="Mother's Name *" />
                                <Input value={formData.motherName} onChangeText={(t: string) => setFormData({ ...formData, motherName: t })} placeholder="Enter mother's name" />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Father's Aadhaar" />
                                        <Input value={formData.fatherAadhaar} onChangeText={(t: string) => setFormData({ ...formData, fatherAadhaar: t })} placeholder="12-digit Aadhaar" keyboardType="number-pad" maxLength={12} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Father's Occupation" />
                                        <Input value={formData.fatherOccupation} onChangeText={(t: string) => setFormData({ ...formData, fatherOccupation: t })} placeholder="Job/Business" />
                                    </View>
                                </View>
                            </View>

                            {/* C. Caste Information */}
                            <SectionTitle title="Caste Information" icon="shield-checkmark" />
                            <View style={styles.formCard}>
                                <Label text="Category *" />
                                <View style={styles.chipGroup}>
                                    {["SC", "ST", "OBC", "SBC", "VJ/NT", "EWS"].map((c) => (
                                        <TouchableOpacity key={c} style={[styles.chip, formData.category === c && styles.chipActive]} onPress={() => setFormData({ ...formData, category: c })}>
                                            <Text style={[styles.chipText, formData.category === c && styles.chipTextActive]}>{c}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Label text="Sub-Caste *" />
                                <Input value={formData.subCaste} onChangeText={(t: string) => setFormData({ ...formData, subCaste: t })} placeholder="e.g. Mahar, Gond, etc." />
                                <Label text="Religion *" />
                                <Input value={formData.religion} onChangeText={(t: string) => setFormData({ ...formData, religion: t })} placeholder="e.g. Hindu, Buddhist" />
                                <Label text="Father's Caste *" />
                                <Input value={formData.fatherCaste} onChangeText={(t: string) => setFormData({ ...formData, fatherCaste: t })} placeholder="As per father's certificate" />
                                <Label text="Existing Cert No. (If any)" />
                                <Input value={formData.existingCertificateNo} onChangeText={(t: string) => setFormData({ ...formData, existingCertificateNo: t })} placeholder="For renewals" />
                            </View>

                            {/* D. Address Details */}
                            <SectionTitle title="Residential Address" icon="location" />
                            <View style={styles.formCard}>
                                <Label text="House No / Street *" />
                                <Input value={formData.houseNo} onChangeText={(t: string) => setFormData({ ...formData, houseNo: t })} placeholder="Flat, Building, Street" />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Village / Town *" />
                                        <Input value={formData.village} onChangeText={(t: string) => setFormData({ ...formData, village: t })} placeholder="City" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="District *" />
                                        <Input value={formData.district} onChangeText={(t: string) => setFormData({ ...formData, district: t })} placeholder="District" />
                                    </View>
                                </View>
                                <Label text="Pincode *" />
                                <Input value={formData.pincode} onChangeText={(t: string) => setFormData({ ...formData, pincode: t })} placeholder="6-digit PIN" keyboardType="number-pad" maxLength={6} />
                            </View>

                            {/* Declaration */}
                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <Ionicons name={formData.declaration ? "checkbox" : "square-outline"} size={22} color={formData.declaration ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationText}>I declare that the information provided is true to the best of my knowledge.</Text>
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
                            <SectionTitle title="Review Your Application" icon="eye" />

                            <ReviewCard title="Applicant Details" onEdit={() => setCurrentStep(1)} data={[
                                { label: "Full Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "DOB", value: formData.dob },
                                { label: "Gender", value: formData.gender },
                                { label: "Mobile", value: formData.mobileNumber },
                            ]} />

                            <ReviewCard title="Caste Details" onEdit={() => setCurrentStep(1)} data={[
                                { label: "Category", value: formData.category },
                                { label: "Sub-Caste", value: formData.subCaste },
                                { label: "Religion", value: formData.religion },
                                { label: "Father's Caste", value: formData.fatherCaste },
                            ]} />

                            <ReviewCard title="Address Details" onEdit={() => setCurrentStep(1)} data={[
                                { label: "House/Street", value: formData.houseNo },
                                { label: "Village", value: formData.village },
                                { label: "District", value: formData.district },
                                { label: "Pincode", value: formData.pincode },
                            ]} />

                            <ReviewCard title="Documents" onEdit={() => setCurrentStep(2)} data={REQUIRED_DOCS.map(d => ({
                                label: d.name.replace(" *", ""),
                                value: documents[d.id] ? "Uploaded ✅" : "Missing ❌"
                            }))} />

                            <TouchableOpacity
                                style={[styles.declarationRow, { marginTop: 20 }]}
                                onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}
                            >
                                <Ionicons
                                    name={formData.finalConfirmation ? "checkbox" : "square-outline"}
                                    size={24}
                                    color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"}
                                />
                                <Text style={styles.declarationText}>
                                    I confirm that all submitted documents are genuine. I understand that false information may lead to rejection.
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                        <View style={{ height: 40 }} />
                        <View style={styles.bottomBar}>
                            <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isSubmitting}>
                                <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.buttonGradient}>
                                    {isSubmitting ? <ActivityIndicator size="small" color="#FFF" /> : (
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

// Standardized UI Helper Components
const SectionTitle = ({ title, icon }: any) => (
    <View style={styles.cardHeader}>
        <View style={styles.cardHeaderIcon}>
            <Ionicons name={icon} size={20} color="#0D47A1" />
        </View>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
    </View>
);

const Label = ({ text }: any) => <Text style={styles.inputLabel}>{text}</Text>;

const Input = ({ icon, ...props }: any) => (
    <View style={[styles.inputContainer, props.editable === false && { backgroundColor: '#F1F5F9' }]}>
        {icon && <Ionicons name={icon} size={18} color="#94A3B8" />}
        <TextInput {...props} style={styles.input} placeholderTextColor="#94A3B8" />
    </View>
);

const ReviewCard = ({ title, onEdit, data }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <Text style={styles.reviewSectionTitle}>{title}</Text>
            <TouchableOpacity onPress={onEdit}><Text style={styles.editLink}>Edit</Text></TouchableOpacity>
        </View>
        {data.map((item: any, idx: number) => (
            <View key={idx} style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{item.label}</Text>
                <Text style={styles.reviewValue}>{item.value}</Text>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
    placeholder: { width: 32 },

    stepIndicatorContainer: { backgroundColor: '#FFF', paddingBottom: 20, paddingHorizontal: 30, position: 'relative' },
    progressLine: { position: 'absolute', top: 16, left: 60, right: 60, height: 2, backgroundColor: '#F1F5F9', overflow: 'hidden' },
    progressLineActive: { height: '100%', backgroundColor: '#0D47A1' },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { alignItems: 'center' },
    stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    stepCircleActive: { borderColor: '#0D47A1', backgroundColor: '#FFF' },
    stepCircleCompleted: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    stepNumber: { fontSize: 14, fontWeight: '700', color: '#CBD5E1' },
    stepNumberActive: { color: '#0D47A1' },
    stepLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 4 },
    stepLabelActive: { color: '#1E293B' },

    scrollContent: { paddingTop: 15, paddingHorizontal: 20 },
    stepWrapper: { flex: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 10 },
    cardHeaderIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    cardHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    cardHeaderSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
    formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', height: 50 },
    input: { flex: 1, marginLeft: 6, fontSize: 14, color: '#1E293B', fontWeight: '500' },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between' },

    otpRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    otpBtn: { backgroundColor: '#0D47A1', paddingHorizontal: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 70 },
    otpBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    btnDisabled: { opacity: 0.5 },
    verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 10, height: 50, borderRadius: 12, marginTop: 10 },
    verifiedText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
    otpVerifyContainer: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12, marginBottom: 15 },

    chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    chipActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    chipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    chipTextActive: { color: '#0D47A1' },
    declarationRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, gap: 12 },
    declarationText: { flex: 1, fontSize: 13, color: '#475569', lineHeight: 20 },

    docList: { gap: 12, marginTop: 10 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 18, padding: 16, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
    docUploadCardActive: { borderColor: '#C8E6C9', backgroundColor: '#F1FBF4' },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    docTextContent: { flex: 1 },
    docTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

    reviewCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    reviewSectionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
    editLink: { fontSize: 13, color: '#0D47A1', fontWeight: '700' },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    reviewLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    reviewValue: { fontSize: 14, color: '#1E293B', fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 20 },

    bottomBar: { paddingVertical: 20 },
    continueButton: { borderRadius: 16, overflow: "hidden" },
    buttonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 10 },
    buttonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

    successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: "#FFF" },
    successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
    successSubtitle: { color: "#64748B", textAlign: "center", marginTop: 8, lineHeight: 20 },
    idCard: { backgroundColor: "#F8FAFC", padding: 24, borderRadius: 16, width: "100%", alignItems: "center", marginVertical: 32, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: "#94A3B8", fontWeight: '700', textTransform: "uppercase", letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: "800", color: "#0D47A1", marginTop: 4 },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
    toast: { position: 'absolute', bottom: 120, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignSelf: 'center' },
    toastText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
});
