import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";

interface MemberType {
    id: string;
    name: string;
    aadhaar: string;
    dob: string;
    relationship: string;
    gender: string;
    isOtpSent: boolean;
    isOtpVerified: boolean;
    otp: string;
}

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // Head of Family
    fullName: string;
    aadhaarNumber: string;
    mobileNumber: string;
    dob: string;
    gender: string;
    // Address
    houseNo: string;
    street: string;
    village: string;
    district: string;
    state: string;
    pincode: string;
    durationOfStay: string;
    // Income
    totalIncome: string;
    incomeCategory: string;
    occupation: string;
    // Gas
    gasConsumerNo: string;
    gasAgencyName: string;
    gasStatus: string;
}

interface DocumentsState {
    addressProof: DocumentType | null;
    incomeCert: DocumentType | null;
    headId: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewRationCardScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");
    const [showToast, setShowToast] = useState(false);

    const copyToClipboard = () => {
        Clipboard.setString(applicationId);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        mobileNumber: "",
        dob: "",
        gender: "",
        houseNo: "",
        street: "",
        village: "",
        district: "",
        state: "",
        pincode: "",
        durationOfStay: "",
        totalIncome: "",
        incomeCategory: "",
        occupation: "",
        gasConsumerNo: "",
        gasAgencyName: "",
        gasStatus: "",
    });

    const [members, setMembers] = useState<MemberType[]>([]);
    const [documents, setDocuments] = useState<DocumentsState>({
        addressProof: null,
        incomeCert: null,
        headId: null,
    });

    // Handle back
    useEffect(() => {
        const backAction = () => {
            if (isSubmitted) {
                router.back();
                return true;
            }
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
    }, [currentStep, isSubmitted]);

    const REQUIRED_DOCS = [
        { id: 'addressProof', name: 'Address Proof *', icon: 'home-map-marker', color: '#1565C0', hint: 'Utility Bill / Rent Agreement' },
        { id: 'incomeCert', name: 'Income Certificate *', icon: 'file-document-outline', color: '#2E7D32', hint: 'Tehsildar / Authorized Signatory' },
        { id: 'headId', name: 'Identity Proof (Head) *', icon: 'card-account-details', color: '#E65100', hint: 'Aadhaar / Passport' },
    ];

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
            });
            if (result.canceled === false && result.assets && result.assets[0]) {
                const file = result.assets[0];
                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Please upload a file smaller than 5MB");
                    return;
                }
                setDocuments((prev) => ({ ...prev, [docType]: file }));
            }
        } catch (e) {
            Alert.alert("Error", "Upload failed");
        }
    };

    const addMember = () => {
        const newMember: MemberType = {
            id: Date.now().toString(),
            name: "",
            aadhaar: "",
            dob: "",
            relationship: "",
            gender: "",
            isOtpSent: false,
            isOtpVerified: false,
            otp: ""
        };
        setMembers([...members, newMember]);
    };

    const updateMember = (id: string, updates: Partial<MemberType>) => {
        setMembers(members.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const removeMember = (id: string) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleSendOtp = async () => {
        if (formData.aadhaarNumber.replace(/\s/g, "").length !== 12) {
            Alert.alert("Error", "Please enter valid 12-digit Aadhaar number");
            return;
        }
        if (formData.mobileNumber.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit mobile number");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.RATION_CARD_APPLY_OTP_SEND,
                { mobile_number: formData.mobileNumber, aadhar_number: formData.aadhaarNumber.replace(/\s/g, "") },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsOtpSent(true);
                Alert.alert("Success", "OTP sent to registered mobile number");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
        }
    };

    const handleDOBChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        }
        setFormData({ ...formData, dob: formatted });
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert("Error", "Please enter valid 6-digit OTP");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.RATION_CARD_APPLY_OTP_VERIFY,
                { mobile_number: formData.mobileNumber, otp_code: otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsOtpVerified(true);
                Alert.alert("Verified", "Aadhaar OTP verified successfully");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Invalid or expired OTP");
        }
    };

    const handleMemberSendOtp = async (memberId: string, memberAadhaar: string) => {
        if (memberAadhaar.replace(/\s/g, "").length !== 12) {
            Alert.alert("Error", "Please enter valid 12-digit Aadhaar number for member");
            return;
        }
        if (formData.mobileNumber.length !== 10) {
            Alert.alert("Error", "Applicant mobile number is missing or invalid");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.RATION_CARD_APPLY_OTP_SEND,
                { mobile_number: formData.mobileNumber, aadhar_number: memberAadhaar.replace(/\s/g, "") },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                updateMember(memberId, { isOtpSent: true });
                Alert.alert("Success", "OTP sent to applicant registered mobile number");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to send OTP for member");
        }
    };

    const handleMemberVerifyOtp = async (memberId: string, memberOtp: string) => {
        if (memberOtp.length !== 6) {
            Alert.alert("Error", "Please enter valid 6-digit OTP");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.RATION_CARD_APPLY_OTP_VERIFY,
                { mobile_number: formData.mobileNumber, otp_code: memberOtp },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                updateMember(memberId, { isOtpVerified: true });
                Alert.alert("Verified", "Member Aadhaar OTP verified successfully");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Invalid or expired member OTP");
        }
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (
                !formData.fullName ||
                !formData.aadhaarNumber ||
                !formData.mobileNumber ||
                !formData.dob ||
                !formData.gender ||
                !formData.houseNo ||
                !formData.village ||
                !formData.district ||
                !formData.state ||
                !formData.pincode ||
                !formData.totalIncome ||
                !formData.occupation ||
                !formData.incomeCategory ||
                !isOtpVerified
            ) {
                Alert.alert("Required", "Please fill all mandatory personal, address, and income details (*) and verify Aadhaar");
                return;
            }

            const unverifiedMembers = members.filter(m => !m.isOtpVerified);
            if (unverifiedMembers.length > 0) {
                Alert.alert("Required", `Please verify Aadhaar OTP for ${unverifiedMembers.length} family member(s)`);
                return;
            }
            if (formData.aadhaarNumber.length !== 12) {
                Alert.alert("Invalid", "Aadhaar must be 12 digits");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.addressProof || !documents.incomeCert || !documents.headId) {
                Alert.alert("Required", "Please upload all mandatory documents");
                return;
            }
            setCurrentStep(3);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();

            // Append form data
            data.append("full_name", formData.fullName);
            data.append("aadhaar_number", formData.aadhaarNumber);
            data.append("mobile_number", formData.mobileNumber);
            data.append("dob", formData.dob);
            data.append("gender", formData.gender);
            data.append("house_no", formData.houseNo);
            data.append("street", formData.street);
            data.append("village", formData.village);
            data.append("district", formData.district);
            data.append("state", formData.state);
            data.append("pincode", formData.pincode);
            data.append("duration_of_stay", formData.durationOfStay);
            data.append("total_income", formData.totalIncome);
            data.append("income_category", formData.incomeCategory);
            data.append("occupation", formData.occupation);
            data.append("gas_consumer_no", formData.gasConsumerNo);
            data.append("gas_agency_name", formData.gasAgencyName);
            data.append("gas_status", formData.gasStatus);
            data.append("members", JSON.stringify(members));

            // Append documents
            if (documents.addressProof) {
                data.append("address_proof", {
                    uri: documents.addressProof.uri,
                    name: documents.addressProof.name,
                    type: "application/pdf", // or detect by extension
                } as any);
            }
            if (documents.incomeCert) {
                data.append("income_cert", {
                    uri: documents.incomeCert.uri,
                    name: documents.incomeCert.name,
                    type: "application/pdf",
                } as any);
            }
            if (documents.headId) {
                data.append("head_id", {
                    uri: documents.headId.uri,
                    name: documents.headId.name,
                    type: "application/pdf",
                } as any);
            }

            const response = await axios.post(API_ENDPOINTS.RATION_CARD_APPLY, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                setApplicationId(response.data.data.applicationId?.toString() || ("RAT" + Math.random().toString(36).substr(2, 6).toUpperCase()));
                setIsSubmitted(true);
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.message || "Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
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
                    <Text style={styles.successSubtitle}>Your new ration card application has been received.</Text>

                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <Text style={styles.idValue}>{applicationId}</Text>
                            <TouchableOpacity onPress={copyToClipboard} style={{ padding: 4 }}>
                                <Ionicons name="copy-outline" size={24} color="#0D47A1" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showToast && (
                        <View style={{
                            position: 'absolute',
                            bottom: 120,
                            backgroundColor: '#333',
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 20,
                            zIndex: 100
                        }}>
                            <Text style={{ color: '#FFF', fontSize: 14 }}>Reference ID Copied!</Text>
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
                    <TouchableOpacity style={styles.backButton} onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Ration Card</Text>
                        <Text style={styles.headerSubtitle}>Official Enrollment Service</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {renderStepIndicator()}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.iconBadge}><Ionicons name="person" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Head of Family</Text>
                                    <Text style={styles.sectionSub}>Personal details of applicant</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={[styles.inputLabel, { marginTop: 0 }]}>Full Name *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={18} color="#94A3B8" />
                                    <TextInput style={styles.input} placeholder="As per Aadhaar" value={formData.fullName} onChangeText={t => setFormData({ ...formData, fullName: t })} />
                                </View>

                                <Text style={styles.inputLabel}>Mobile Number *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="call-outline" size={18} color="#94A3B8" />
                                    <TextInput style={styles.input} placeholder="10 digit mobile" keyboardType="phone-pad" maxLength={10} value={formData.mobileNumber} onChangeText={t => setFormData({ ...formData, mobileNumber: t })} />
                                </View>

                                <Text style={styles.inputLabel}>Aadhaar Number *</Text>
                                <View style={styles.otpSection}>
                                    <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                                        <Ionicons name="finger-print-outline" size={18} color="#94A3B8" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="XXXX XXXX XXXX"
                                            keyboardType="number-pad"
                                            maxLength={12}
                                            value={formData.aadhaarNumber}
                                            onChangeText={(text) => setFormData({ ...formData, aadhaarNumber: text })}
                                            editable={!isOtpVerified}
                                        />
                                    </View>
                                    {!isOtpVerified && (
                                        <TouchableOpacity
                                            style={[styles.otpButton, (formData.aadhaarNumber.replace(/\s/g, "").length !== 12 || formData.mobileNumber.length !== 10) && styles.otpButtonDisabled]}
                                            onPress={handleSendOtp}
                                            disabled={formData.aadhaarNumber.replace(/\s/g, "").length !== 12 || formData.mobileNumber.length !== 10}
                                        >
                                            <Text style={styles.otpButtonText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                        </TouchableOpacity>
                                    )}
                                    {isOtpVerified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                            <Text style={styles.verifiedText}>Verified</Text>
                                        </View>
                                    )}
                                </View>

                                {isOtpSent && !isOtpVerified && (
                                    <View style={styles.otpVerifyContainer}>
                                        <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                                            <Ionicons name="key-outline" size={18} color="#94A3B8" />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter 6-digit OTP"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                value={otp}
                                                onChangeText={setOtp}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.verifyButton, otp.length !== 6 && styles.otpButtonDisabled]}
                                            onPress={handleVerifyOtp}
                                            disabled={otp.length !== 6}
                                        >
                                            <Text style={styles.verifyButtonText}>Verify</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}


                                <Text style={styles.inputLabel}>Date of Birth *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="DD/MM/YYYY"
                                        keyboardType="number-pad"
                                        maxLength={10}
                                        value={formData.dob}
                                        onChangeText={handleDOBChange}
                                    />
                                </View>

                                <Text style={styles.inputLabel}>Gender *</Text>
                                <View style={styles.genderContainer}>
                                    {["Male", "Female", "Other"].map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.genderBox, formData.gender === g && styles.genderBoxActive]}
                                            onPress={() => setFormData({ ...formData, gender: g })}
                                        >
                                            <MaterialCommunityIcons
                                                name={g === 'Male' ? 'gender-male' : g === 'Female' ? 'gender-female' : 'gender-transgender'}
                                                size={20}
                                                color={formData.gender === g ? '#0D47A1' : '#64748B'}
                                            />
                                            <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                                <View style={styles.iconBadge}><Ionicons name="wallet" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Income & Employment</Text>
                                    <Text style={styles.sectionSub}>Financial details</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={[styles.inputLabel, { marginTop: 0 }]}>Occupation *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="briefcase-outline" size={18} color="#94A3B8" />
                                    <TextInput style={styles.input} placeholder="e.g. Farmer, Shopkeeper" value={formData.occupation} onChangeText={t => setFormData({ ...formData, occupation: t })} />
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Total Income *</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="cash-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="Yearly income" keyboardType="numeric" value={formData.totalIncome} onChangeText={t => setFormData({ ...formData, totalIncome: t })} />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Category *</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="list-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="APL / BPL" value={formData.incomeCategory} onChangeText={t => setFormData({ ...formData, incomeCategory: t })} />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                                <View style={styles.iconBadge}><Ionicons name="location" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Residential Address</Text>
                                    <Text style={styles.sectionSub}>Permanent dwelling details</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.inputLabel, { marginTop: 0 }]}>House No. *</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="home-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="No." value={formData.houseNo} onChangeText={t => setFormData({ ...formData, houseNo: t })} />
                                        </View>
                                    </View>
                                    <View style={{ flex: 2 }}>
                                        <Text style={[styles.inputLabel, { marginTop: 0 }]}>Street / Area</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="map-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="Street name" value={formData.street} onChangeText={t => setFormData({ ...formData, street: t })} />
                                        </View>
                                    </View>
                                </View>

                                <Text style={styles.inputLabel}>Village / Locality *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="business-outline" size={18} color="#94A3B8" />
                                    <TextInput style={styles.input} placeholder="Enter locality" value={formData.village} onChangeText={t => setFormData({ ...formData, village: t })} />
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>District *</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="location-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="District" value={formData.district} onChangeText={t => setFormData({ ...formData, district: t })} />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>State *</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="map-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="State" value={formData.state} onChangeText={t => setFormData({ ...formData, state: t })} />
                                        </View>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Pincode *</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="pin-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="6 digit area code" keyboardType="number-pad" maxLength={6} value={formData.pincode} onChangeText={t => setFormData({ ...formData, pincode: t })} />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Stay Duration</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="time-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="e.g. 5 Years" value={formData.durationOfStay} onChangeText={t => setFormData({ ...formData, durationOfStay: t })} />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                                <View style={styles.iconBadge}><Ionicons name="flame" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Gas Connection Details</Text>
                                    <Text style={styles.sectionSub}>LPG provider specifics</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={[styles.inputLabel, { marginTop: 0 }]}>Gas Status *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="flame-outline" size={18} color="#94A3B8" />
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="Enter status (e.g. Available, Not Available)" 
                                        value={formData.gasStatus} 
                                        onChangeText={t => setFormData({ ...formData, gasStatus: t })} 
                                    />
                                </View>
                                {formData.gasStatus.toLowerCase() === 'available' && (
                                    <>
                                        <Text style={styles.inputLabel}>Agency Name</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="business-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="e.g. Bharat Gas" value={formData.gasAgencyName} onChangeText={t => setFormData({ ...formData, gasAgencyName: t })} />
                                        </View>
                                        <Text style={styles.inputLabel}>Consumer Number</Text>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="pricetag-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="Enter consumer ID" value={formData.gasConsumerNo} onChangeText={t => setFormData({ ...formData, gasConsumerNo: t })} />
                                        </View>
                                    </>
                                )}
                            </View>

                            <View style={styles.memberSectionHeader}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.iconBadge}><Ionicons name="people" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={styles.sectionTitle}>Family Members</Text>
                                        <Text style={styles.sectionSub}>Add all dependents</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.addBtn} onPress={addMember}>
                                    <Ionicons name="add" size={18} color="#FFF" />
                                    <Text style={styles.addBtnText}>Add</Text>
                                </TouchableOpacity>
                            </View>

                            {members.map((m, idx) => (
                                <View key={m.id} style={styles.memberCard}>
                                    <View style={styles.memberHeader}>
                                        <Text style={styles.memberNum}>Member #{idx + 1}</Text>
                                        <TouchableOpacity onPress={() => removeMember(m.id)}>
                                            <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={18} color="#94A3B8" />
                                        <TextInput style={styles.input} placeholder="Member Name" value={m.name} onChangeText={t => updateMember(m.id, { name: t })} />
                                    </View>
                                    <View style={styles.otpSection}>
                                        <View style={[styles.inputContainer, { flex: 1, marginBottom: 0, marginTop: 10 }]}>
                                            <Ionicons name="finger-print-outline" size={18} color="#94A3B8" />
                                            <TextInput style={styles.input} placeholder="Aadhaar" keyboardType="number-pad" maxLength={12} value={m.aadhaar} onChangeText={t => updateMember(m.id, { aadhaar: t })} editable={!m.isOtpVerified} />
                                        </View>
                                        {!m.isOtpVerified && (
                                            <TouchableOpacity
                                                style={[styles.otpButton, { marginTop: 10 }, (m.aadhaar.replace(/\s/g, "").length !== 12 || formData.mobileNumber.length !== 10) && styles.otpButtonDisabled]}
                                                onPress={() => handleMemberSendOtp(m.id, m.aadhaar)}
                                                disabled={m.aadhaar.replace(/\s/g, "").length !== 12 || formData.mobileNumber.length !== 10}
                                            >
                                                <Text style={styles.otpButtonText}>{m.isOtpSent ? "Resend" : "Send OTP"}</Text>
                                            </TouchableOpacity>
                                        )}
                                        {m.isOtpVerified && (
                                            <View style={[styles.verifiedBadge, { marginTop: 10 }]}>
                                                <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                                <Text style={styles.verifiedText}>Verified</Text>
                                            </View>
                                        )}
                                    </View>

                                    {m.isOtpSent && !m.isOtpVerified && (
                                        <View style={styles.otpVerifyContainer}>
                                            <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                                                <Ionicons name="key-outline" size={18} color="#94A3B8" />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter 6-digit OTP"
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                    value={m.otp}
                                                    onChangeText={t => updateMember(m.id, { otp: t })}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.verifyButton, m.otp.length !== 6 && styles.otpButtonDisabled]}
                                                onPress={() => handleMemberVerifyOtp(m.id, m.otp)}
                                                disabled={m.otp.length !== 6}
                                            >
                                                <Text style={styles.verifyButtonText}>Verify</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <View style={[styles.inputContainer, { marginTop: 10 }]}>
                                        <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Date of Birth (DD/MM/YYYY)"
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            value={m.dob || ""}
                                            onChangeText={t => {
                                                const cleaned = t.replace(/[^0-9]/g, "");
                                                let formatted = cleaned;
                                                if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
                                                if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 9); // Corrected to 10 chars total
                                                updateMember(m.id, { dob: formatted });
                                            }}
                                        />
                                    </View>
                                </View>
                            ))}
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
                            <View style={styles.sectionHeader}>
                                <View style={styles.iconBadge}><Ionicons name="checkmark-circle" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Review Summary</Text>
                                    <Text style={styles.sectionSub}>Double check all details</Text>
                                </View>
                            </View>

                            <View style={styles.reviewCard}>
                                <Text style={styles.reviewSectionTitle}>Family Overview</Text>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Head Name</Text>
                                    <Text style={styles.reviewValue}>{formData.fullName}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Aadhaar</Text>
                                    <Text style={styles.reviewValue}>{formData.aadhaarNumber}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Members Added</Text>
                                    <Text style={styles.reviewValue}>{members.length}</Text>
                                </View>
                                <View style={styles.divider} />
                                <Text style={styles.reviewSectionTitle}>Address</Text>
                                <Text style={styles.addressText}>
                                    {formData.houseNo}{formData.street ? `, ${formData.street}` : ""}, {formData.village}, {formData.district}, {formData.state} - {formData.pincode}
                                </Text>
                                <View style={styles.divider} />
                                <Text style={styles.reviewSectionTitle}>Income & Gas</Text>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Occupation</Text>
                                    <Text style={styles.reviewValue}>{formData.occupation}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Category</Text>
                                    <Text style={styles.reviewValue}>{formData.incomeCategory}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Gas Status</Text>
                                    <Text style={styles.reviewValue}>{formData.gasStatus}</Text>
                                </View>
                            </View>

                            <View style={styles.declarationBox}>
                                <Ionicons name="information-circle" size={20} color="#0D47A1" />
                                <Text style={styles.declarationText}>
                                    I hereby declare that all provided information is true to the best of my knowledge.
                                    I understand that physical verification may be required.
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isSubmitting}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.buttonGradient}>
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },

    // Step Indicator (Standardized)
    stepIndicatorContainer: {
        backgroundColor: '#FFF',
        paddingBottom: 20,
        paddingHorizontal: 30,
        position: 'relative',
    },
    progressLine: {
        position: 'absolute',
        top: 16,
        left: 60,
        right: 60,
        height: 2,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
    },
    progressLineActive: {
        height: '100%',
        backgroundColor: '#0D47A1',
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    stepCircleActive: {
        borderColor: '#0D47A1',
        backgroundColor: '#FFF',
    },
    stepCircleCompleted: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
    },
    stepNumberActive: {
        color: '#0D47A1',
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        marginTop: 6,
    },
    stepLabelActive: {
        color: '#0D47A1',
    },

    scrollContent: { padding: 20 },
    stepWrapper: { gap: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#64748B' },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardHeaderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    cardHeaderSubtitle: {
        fontSize: 12,
        color: '#64748B',
    },

    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 16 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, height: 48 },
    input: { flex: 1, fontSize: 15, color: '#1E293B', padding: 0, marginLeft: 10 },

    genderContainer: { flexDirection: 'row', gap: 10, marginTop: 4 },
    genderBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', height: 46 },
    genderBoxActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    genderText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    genderTextActive: { color: '#0D47A1' },

    memberSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
    addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#0D47A1", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, gap: 6 },
    addBtnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
    memberCard: { backgroundColor: '#F8FAFC', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    memberHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    memberNum: { fontSize: 14, color: "#0D47A1", fontWeight: "800" },

    // Document Upload (Standardized)
    docList: { gap: 12 },
    docUploadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    docUploadCardActive: {
        borderColor: '#2E7D32',
        backgroundColor: '#F0FDF4',
    },
    docIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    docTextContent: {
        flex: 1,
        gap: 2,
    },
    docTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    docHint: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },

    reviewCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowRadius: 12 },
    reviewSectionTitle: { fontSize: 12, fontWeight: '800', color: '#0D47A1', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    reviewItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    addressText: { fontSize: 14, fontWeight: '600', color: '#1E293B', lineHeight: 20 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
    declarationBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderRadius: 16, padding: 16, marginTop: 20, gap: 12 },
    declarationText: { flex: 1, fontSize: 12, color: '#0D47A1', lineHeight: 18, fontWeight: '600' },

    bottomBar: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    continueButton: { borderRadius: 16, overflow: 'hidden' },
    buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    buttonText: { fontSize: 16, fontWeight: '800', color: '#FFF' },

    successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: "#FFF" },
    successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
    successSubtitle: { color: "#64748B", textAlign: "center", marginTop: 8, lineHeight: 20 },
    idCard: { backgroundColor: "#F8FAFC", padding: 24, borderRadius: 20, width: "100%", alignItems: "center", marginVertical: 32, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: "#94A3B8", fontWeight: '700', textTransform: "uppercase", letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: "800", color: "#0D47A1", marginTop: 4 },
    successActions: { flexDirection: 'row', gap: 20, marginBottom: 40 },
    actionBtn: { alignItems: 'center', gap: 8 },
    actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    actionText: { fontSize: 12, color: '#475569', fontWeight: '600', textAlign: 'center' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

    otpSection: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    otpButton: { backgroundColor: '#0D47A1', paddingHorizontal: 16, height: 48, borderRadius: 12, justifyContent: 'center' },
    otpButtonDisabled: { opacity: 0.5 },
    otpButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', paddingHorizontal: 12, height: 48, borderRadius: 12 },
    verifiedText: { color: '#2E7D32', fontSize: 14, fontWeight: '700' },
    otpVerifyContainer: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },
    verifyButton: { backgroundColor: '#2E7D32', paddingHorizontal: 24, height: 48, borderRadius: 12, justifyContent: 'center' },
    verifyButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' }
});
