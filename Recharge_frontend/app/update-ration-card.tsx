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
    KeyboardAvoidingView,
    Platform,
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

interface UpdateType {
    id: string;
    label: string;
    selected: boolean;
    icon: any;
}

// ----------- Detail field configs per update type ----------------------------
const UPDATE_DETAIL_CONFIG: Record<string, { label: string; fields: { key: string; placeholder: string; label: string; keyboardType?: any; maxLength?: number; icon?: any }[] }> = {
    add: {
        label: "Add Member",
        fields: [
            { key: "name", label: "Full Name *", placeholder: "Enter member's full name", icon: "person-outline" },
            { key: "aadhaar", label: "Aadhaar Number *", placeholder: "12-digit Aadhaar", keyboardType: "number-pad", maxLength: 12, icon: "finger-print-outline" },
            { key: "relation", label: "Relation with Head *", placeholder: "e.g. Son, Daughter, Wife", icon: "people-outline" },
            { key: "dob", label: "Date of Birth *", placeholder: "DD/MM/YYYY", icon: "calendar-outline" },
        ],
    },
    remove: {
        label: "Remove Member",
        fields: [
            { key: "name", label: "Member's Full Name *", placeholder: "Name as on ration card", icon: "person-outline" },
            { key: "memberAadhaar", label: "Member's Aadhaar Number", placeholder: "12-digit Aadhaar", keyboardType: "number-pad", maxLength: 12, icon: "finger-print-outline" },
            { key: "reason", label: "Reason for Removal *", placeholder: "e.g. Death, Migration, Marriage", icon: "document-text-outline" },
        ],
    },
    address: {
        label: "Address Change",
        fields: [
            { key: "fullAddress", label: "New Full Address *", placeholder: "House No., Street, Locality, City", icon: "home-outline" },
            { key: "district", label: "District *", placeholder: "Enter district", icon: "business-outline" },
            { key: "pincode", label: "Pincode *", placeholder: "6-digit pincode", keyboardType: "number-pad", maxLength: 6, icon: "pin-outline" },
        ],
    },
    head: {
        label: "Change Head of Family",
        fields: [
            { key: "name", label: "New Head's Full Name *", placeholder: "Enter full name", icon: "person-outline" },
            { key: "aadhaar", label: "New Head's Aadhaar *", placeholder: "12-digit Aadhaar", keyboardType: "number-pad", maxLength: 12, icon: "finger-print-outline" },
            { key: "relation", label: "Relation with Current Head *", placeholder: "e.g. Son, Sister, Spouse", icon: "people-outline" },
        ],
    },
    name: {
        label: "Name Correction",
        fields: [
            { key: "memberName", label: "Member to Correct *", placeholder: "Name as on ration card", icon: "person-outline" },
            { key: "currentName", label: "Incorrect / Current Name *", placeholder: "As it appears now", icon: "close-circle-outline" },
            { key: "correctedName", label: "Correct Name *", placeholder: "As it should be", icon: "checkmark-circle-outline" },
        ],
    },
    mobile: {
        label: "Mobile Number Update",
        fields: [
            { key: "oldNumber", label: "Current Registered Mobile", placeholder: "Old 10-digit number", keyboardType: "number-pad", maxLength: 10, icon: "call-outline" },
            { key: "number", label: "New Mobile Number *", placeholder: "New 10-digit number", keyboardType: "phone-pad", maxLength: 10, icon: "phone-portrait-outline" },
        ],
    },
};

// ----------- Document configs per update type --------------------------------
const UPDATE_DOCUMENT_CONFIG: Record<string, { key: string; label: string; required: boolean }[]> = {
    add: [
        { key: "add_aadhaar", label: "New Member's Aadhaar Card *", required: true },
        { key: "add_birthCert", label: "Birth Certificate (if < 5 years)", required: false },
    ],
    remove: [
        { key: "remove_proof", label: "Removal Proof (Death Cert / Transfer Doc) *", required: true },
    ],
    address: [
        { key: "address_proof", label: "New Address Proof (Electricity Bill / Lease Deed) *", required: true },
    ],
    head: [
        { key: "head_aadhaar", label: "New Head's Aadhaar Card *", required: true },
        { key: "head_proof", label: "Relationship Proof *", required: true },
    ],
    name: [
        { key: "name_aadhaar", label: "Aadhaar / PAN with Correct Name *", required: true },
        { key: "name_gazette", label: "Gazette Notification (if applicable)", required: false },
    ],
    mobile: [
        { key: "mobile_aadhaar", label: "Aadhaar Card of Head *", required: true },
    ],
};

// Common doc always required
const COMMON_DOC = { key: "existingCard", label: "Existing Ration Card Copy *", required: true };

export default function UpdateRationCardScreen() {
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const [mobileNumber, setMobileNumber] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otp, setOtp] = useState("");

    const [rationCardNumber, setRationCardNumber] = useState("");
    const [headAadhaar, setHeadAadhaar] = useState("");
    const [applicationId, setApplicationId] = useState("");

    const [showToast, setShowToast] = useState(false);

    const copyToClipboard = () => {
        Clipboard.setString(applicationId);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const [updateTypes, setUpdateTypes] = useState<UpdateType[]>([
        { id: "add", label: "Add Member", selected: false, icon: "account-plus" },
        { id: "remove", label: "Remove Member", selected: false, icon: "account-minus" },
        { id: "address", label: "Address Change", selected: false, icon: "map-marker" },
        { id: "head", label: "Change Head", selected: false, icon: "account-star" },
        { id: "name", label: "Name Correction", selected: false, icon: "pencil" },
        { id: "mobile", label: "Mobile Update", selected: false, icon: "phone" },
    ]);

    // updateDetails: { [typeId]: { [fieldKey]: value } }
    const [updateDetails, setUpdateDetails] = useState<Record<string, Record<string, string>>>({
        add: {},
        remove: {},
        address: {},
        head: {},
        name: {},
        mobile: {},
    });

    const [documents, setDocuments] = useState<Record<string, any>>({});

    const selectedTypes = updateTypes.filter(t => t.selected);

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    useEffect(() => {
        const backAction = () => {
            if (isSubmitted) { router.back(); return true; }
            handleBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep, isSubmitted]);

    const toggleUpdateType = (id: string) => {
        setUpdateTypes(updateTypes.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
    };

    const setDetailField = (typeId: string, fieldKey: string, value: string) => {
        setUpdateDetails(prev => ({
            ...prev,
            [typeId]: { ...prev[typeId], [fieldKey]: value },
        }));
    };

    // Auto-format DOB as DD/MM/YYYY
    const formatDOB = (raw: string): string => {
        const digits = raw.replace(/\D/g, "").slice(0, 8);
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    };

    const handleFileUpload = async (key: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"] });
            if (!result.canceled && result.assets[0]) {
                setDocuments(prev => ({ ...prev, [key]: result.assets[0] }));
            }
        } catch (e) { Alert.alert("Error", "Upload failed"); }
    };

    const handleSendOtp = async () => {
        if (!rationCardNumber) {
            Alert.alert("Required", "Please enter Ration Card number first");
            return;
        }
        if (headAadhaar.replace(/\s/g, "").length !== 12) {
            Alert.alert("Error", "Please enter valid 12-digit Aadhaar number");
            return;
        }
        if (mobileNumber.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit mobile number");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.RATION_CARD_CORRECTION_OTP_SEND,
                { mobile_number: mobileNumber, ration_card_number: rationCardNumber },
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

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert("Error", "Please enter valid 6-digit OTP");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.RATION_CARD_CORRECTION_OTP_VERIFY,
                { mobile_number: mobileNumber, otp_code: otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsOtpVerified(true);
                setIsVerified(true);
                Alert.alert("Verified", "Aadhaar OTP verified successfully");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Invalid or expired OTP");
        }
    };

    const handleVerifyToken = () => {
        // Obsoleted by OTP but keeping backward compat locally if needed
        if (!rationCardNumber || headAadhaar.length !== 12) {
            Alert.alert("Required", "Please enter Ration Card number and 12-digit Aadhaar");
            return;
        }
        setIsVerified(true);
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            // Step 1: verify + select at least one
            if (!isVerified || !isOtpVerified) { Alert.alert("Verification", "Please verify Aadhaar OTP first"); return; }
            if (!selectedTypes.length) { Alert.alert("Select", "Choose at least one update type"); return; }
            setCurrentStep(2);

        } else if (currentStep === 2) {
            // Step 2: validate detail fields for each selected type
            for (const type of selectedTypes) {
                const config = UPDATE_DETAIL_CONFIG[type.id];
                const details = updateDetails[type.id] || {};
                for (const field of config.fields) {
                    if (field.label.endsWith("*") && !details[field.key]?.trim()) {
                        Alert.alert("Required", `Please fill "${field.label.replace(" *", "")}" for ${config.label}`);
                        return;
                    }
                }
            }
            setCurrentStep(3);

        } else if (currentStep === 3) {
            // Step 3: validate required documents
            if (!documents[COMMON_DOC.key]) {
                Alert.alert("Required", `Please upload: ${COMMON_DOC.label.replace(" *", "")}`);
                return;
            }
            for (const type of selectedTypes) {
                const docList = UPDATE_DOCUMENT_CONFIG[type.id] || [];
                for (const doc of docList) {
                    if (doc.required && !documents[doc.key]) {
                        Alert.alert("Required", `Please upload: ${doc.label.replace(" *", "")} (for ${UPDATE_DETAIL_CONFIG[type.id].label})`);
                        return;
                    }
                }
            }
            setCurrentStep(4);

        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();
            
            data.append("ration_card_number", rationCardNumber);
            data.append("head_aadhaar", headAadhaar);
            data.append("update_types", selectedTypes.map(t => t.id).join(","));
            data.append("update_details", JSON.stringify(updateDetails));

            // Append all documents dynamically
            Object.keys(documents).forEach(docKey => {
                const file = documents[docKey];
                if (file) {
                    data.append(docKey, {
                        uri: file.uri,
                        name: file.name,
                        type: "application/pdf",
                    } as any);
                }
            });

            const response = await axios.post(API_ENDPOINTS.RATION_CARD_CORRECTION, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                const refId = response.data.data?.correctionId?.toString() || ("RAT" + Math.random().toString(36).substr(2, 6).toUpperCase());
                setApplicationId(refId);
                setIsSubmitted(true);
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", error.response?.data?.message || "Failed to submit correction request");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ----------------------------- Success Screen ----------------------------
    if (isSubmitted) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={styles.successTitle}>Update Requested!</Text>
                    <Text style={styles.successSubtitle}>Your Ration Card correction request has been submitted successfully.</Text>
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

    const STEP_LABELS = ["Verify", "Details", "Upload", "Confirm"];

    // ----------------------------- Main Screen --------------------------------
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
                        <Text style={styles.headerTitle}>Update Ration Card</Text>
                        <Text style={styles.headerSubtitle}>Official Correction Service</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress Indicators */}
                <View style={styles.stepContainer}>
                    {[1, 2, 3, 4].map((i) => (
                        <React.Fragment key={i}>
                            <View style={styles.stepItem}>
                                <View style={[styles.stepCircle, currentStep >= i && styles.stepCircleActive, currentStep > i && styles.stepCircleDone]}>
                                    {currentStep > i
                                        ? <Ionicons name="checkmark" size={16} color="#FFF" />
                                        : <Text style={[styles.stepNum, currentStep >= i && styles.stepNumActive]}>{i}</Text>}
                                </View>
                                <Text style={[styles.stepLabelText, currentStep >= i && styles.stepLabelActive]}>
                                    {STEP_LABELS[i - 1]}
                                </Text>
                            </View>
                            {i < 4 && <View style={[styles.stepLine, currentStep > i && styles.stepLineDone]} />}
                        </React.Fragment>
                    ))}
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        {/* ====== STEP 1: Verify & Select Types ====== */}
                        {currentStep === 1 && (
                            <View>
                                {!isVerified ? (
                                    <View>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.iconBadge}><Ionicons name="shield-checkmark" size={20} color="#0D47A1" /></View>
                                            <View>
                                                <Text style={styles.sectionTitle}>Identity Check</Text>
                                                <Text style={styles.sectionSub}>Verify card ownership</Text>
                                            </View>
                                        </View>
                                        <View style={styles.formCard}>
                                            <Text style={[styles.inputLabel, { marginTop: 0 }]}>Ration Card Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="card-outline" size={18} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="Enter existing number" value={rationCardNumber} onChangeText={setRationCardNumber} />
                                            </View>
                                            <Text style={styles.inputLabel}>Mobile Number *</Text>
                                            <View style={styles.inputContainer}>
                                                <Ionicons name="call-outline" size={18} color="#94A3B8" />
                                                <TextInput style={styles.input} placeholder="10 digit mobile" keyboardType="phone-pad" maxLength={10} value={mobileNumber} onChangeText={setMobileNumber} />
                                            </View>
                                            
                                            <Text style={styles.inputLabel}>Head Aadhaar Number *</Text>
                                            <View style={styles.otpSection}>
                                                <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                                                    <Ionicons name="finger-print-outline" size={18} color="#94A3B8" />
                                                    <TextInput style={styles.input} placeholder="12 digit Aadhaar" keyboardType="number-pad" maxLength={12} value={headAadhaar} onChangeText={setHeadAadhaar} editable={!isOtpVerified} />
                                                </View>
                                                {!isOtpVerified && (
                                                    <TouchableOpacity 
                                                        style={[styles.otpButton, (headAadhaar.replace(/\s/g, "").length !== 12 || mobileNumber.length !== 10) && styles.otpButtonDisabled]} 
                                                        onPress={handleSendOtp} 
                                                        disabled={headAadhaar.replace(/\s/g, "").length !== 12 || mobileNumber.length !== 10}
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
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        <View style={styles.verifiedBox}>
                                            <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                                            <Text style={styles.verifiedText}>Verified: {rationCardNumber}</Text>
                                        </View>
                                        <View style={styles.sectionHeader}>
                                            <View style={styles.iconBadge}><MaterialCommunityIcons name="format-list-checks" size={20} color="#0D47A1" /></View>
                                            <View>
                                                <Text style={styles.sectionTitle}>Select Update Types</Text>
                                                <Text style={styles.sectionSub}>Choose one or more updates to request</Text>
                                            </View>
                                        </View>
                                        <View style={styles.typeGrid}>
                                            {updateTypes.map(type => (
                                                <TouchableOpacity key={type.id} style={[styles.typeItem, type.selected && styles.typeSelected]} onPress={() => toggleUpdateType(type.id)}>
                                                    <View style={[styles.typeIconBox, type.selected && styles.typeIconActive]}>
                                                        <MaterialCommunityIcons name={type.icon} size={22} color={type.selected ? "#FFF" : "#64748B"} />
                                                    </View>
                                                    <Text style={[styles.typeLabel, type.selected && styles.typeLabelActive]}>{type.label}</Text>
                                                    <Ionicons name={type.selected ? "checkbox" : "square-outline"} size={20} color={type.selected ? "#0D47A1" : "#CCC"} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* ====== STEP 2: Details for each selected type ====== */}
                        {currentStep === 2 && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.iconBadge}><Ionicons name="create-outline" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={styles.sectionTitle}>Update Details</Text>
                                        <Text style={styles.sectionSub}>Fill details for each selected update</Text>
                                    </View>
                                </View>

                                {selectedTypes.map((type, idx) => {
                                    const config = UPDATE_DETAIL_CONFIG[type.id];
                                    const details = updateDetails[type.id] || {};
                                    return (
                                        <View key={type.id} style={[styles.typeSection, idx > 0 && { marginTop: 20 }]}>
                                            {/* Type heading badge */}
                                            <View style={styles.typeSectionHeader}>
                                                <View style={styles.typeSectionIconBox}>
                                                    <MaterialCommunityIcons name={type.icon} size={18} color="#0D47A1" />
                                                </View>
                                                <Text style={styles.typeSectionTitle}>{config.label}</Text>
                                            </View>
                                            <View style={styles.formCard}>
                                                {config.fields.map((field, index) => (
                                                    <View key={field.key}>
                                                        <Text style={[styles.inputLabel, index === 0 && { marginTop: 0 }]}>{field.label}</Text>
                                                        <View style={styles.inputContainer}>
                                                            {field.icon && <Ionicons name={field.icon} size={18} color="#94A3B8" />}
                                                            <TextInput
                                                                style={styles.input}
                                                                placeholder={field.placeholder}
                                                                keyboardType={field.key === "dob" ? "number-pad" : (field.keyboardType || "default")}
                                                                maxLength={field.key === "dob" ? 10 : field.maxLength}
                                                                value={details[field.key] || ""}
                                                                onChangeText={val =>
                                                                    setDetailField(
                                                                        type.id,
                                                                        field.key,
                                                                        field.key === "dob" ? formatDOB(val) : val
                                                                    )
                                                                }
                                                            />
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* ====== STEP 3: Documents for each selected type ====== */}
                        {currentStep === 3 && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.iconBadge}><Ionicons name="cloud-upload-outline" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={styles.sectionTitle}>Upload Documents</Text>
                                        <Text style={styles.sectionSub}>Required proofs for your updates</Text>
                                    </View>
                                </View>

                                {/* Common doc always required */}
                                <View style={styles.docSection}>
                                    <View style={styles.docSectionHeader}>
                                        <View style={styles.docSectionIconBox}>
                                            <Ionicons name="document-text-outline" size={18} color="#0D47A1" />
                                        </View>
                                        <Text style={styles.docSectionTitle}>Common Document</Text>
                                    </View>
                                    <View style={styles.formCard}>
                                        <Text style={styles.uploadLabel}>{COMMON_DOC.label}</Text>
                                        <TouchableOpacity style={[styles.uploadBtn, documents[COMMON_DOC.key] && styles.uploadBtnDone]} onPress={() => handleFileUpload(COMMON_DOC.key)}>
                                            <Ionicons name={documents[COMMON_DOC.key] ? "checkmark-circle" : "attach-outline"} size={18} color={documents[COMMON_DOC.key] ? "#2E7D32" : "#0D47A1"} />
                                            <Text style={[styles.uploadBtnText, documents[COMMON_DOC.key] && styles.uploadBtnTextDone]}>
                                                {documents[COMMON_DOC.key] ? documents[COMMON_DOC.key].name : "Tap to Select File"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Per-type docs */}
                                {selectedTypes.map((type, idx) => {
                                    const docList = UPDATE_DOCUMENT_CONFIG[type.id] || [];
                                    const config = UPDATE_DETAIL_CONFIG[type.id];
                                    return (
                                        <View key={type.id} style={[styles.docSection, { marginTop: 20 }]}>
                                            <View style={styles.docSectionHeader}>
                                                <View style={styles.docSectionIconBox}>
                                                    <MaterialCommunityIcons name={type.icon} size={18} color="#0D47A1" />
                                                </View>
                                                <Text style={styles.docSectionTitle}>{config.label}</Text>
                                            </View>
                                            <View style={styles.formCard}>
                                                {docList.map(doc => (
                                                    <View key={doc.key}>
                                                        <Text style={styles.uploadLabel}>{doc.label}</Text>
                                                        <TouchableOpacity
                                                            style={[styles.uploadBtn, documents[doc.key] && styles.uploadBtnDone]}
                                                            onPress={() => handleFileUpload(doc.key)}
                                                        >
                                                            <Ionicons
                                                                name={documents[doc.key] ? "checkmark-circle" : "attach-outline"}
                                                                size={18}
                                                                color={documents[doc.key] ? "#2E7D32" : "#0D47A1"}
                                                            />
                                                            <Text style={[styles.uploadBtnText, documents[doc.key] && styles.uploadBtnTextDone]}>
                                                                {documents[doc.key] ? documents[doc.key].name : "Tap to Select File"}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* ====== STEP 4: Review & Confirm ====== */}
                        {currentStep === 4 && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.iconBadge}><Ionicons name="list" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={styles.sectionTitle}>Review & Confirm</Text>
                                        <Text style={styles.sectionSub}>Verify all details before submitting</Text>
                                    </View>
                                </View>

                                <View style={styles.reviewCard}>
                                    <Text style={styles.reviewLabelMain}>Ration Card: {rationCardNumber}</Text>
                                    <View style={styles.divider} />

                                    {selectedTypes.map((type) => {
                                        const config = UPDATE_DETAIL_CONFIG[type.id];
                                        const details = updateDetails[type.id] || {};
                                        return (
                                            <View key={type.id} style={styles.reviewTypeBlock}>
                                                <View style={styles.reviewTypeHeader}>
                                                    <MaterialCommunityIcons name={type.icon} size={16} color="#0D47A1" />
                                                    <Text style={styles.reviewTypeName}>{config.label}</Text>
                                                </View>
                                                {config.fields.map(field => {
                                                    const val = details[field.key];
                                                    return val ? (
                                                        <View key={field.key} style={styles.reviewRow}>
                                                            <Text style={styles.reviewKey}>{field.label.replace(" *", "")}:</Text>
                                                            <Text style={styles.reviewVal}>{val}</Text>
                                                        </View>
                                                    ) : null;
                                                })}
                                                <View style={styles.divider} />
                                            </View>
                                        );
                                    })}

                                    <Text style={styles.modifyTitle}>DOCUMENTS UPLOADED:</Text>
                                    {Object.keys(documents).map(key => (
                                        <View key={key} style={styles.updateRow}>
                                            <Ionicons name="document-attach" size={14} color="#0D47A1" />
                                            <Text style={styles.updateLabelText}>{documents[key]?.name}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.declarationBox}>
                                    <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                                    <Text style={styles.declText}>I confirm that all provided information and uploaded documents are accurate and true to the best of my knowledge.</Text>
                                </View>
                            </View>
                        )}

                    </ScrollView>
                </KeyboardAvoidingView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.continueButton, !isVerified && currentStep === 1 && styles.btnDisabled]}
                        disabled={!isVerified && currentStep === 1}
                        onPress={handleContinue}
                    >
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.buttonGradient}>
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>
                                        {currentStep === 4 ? "Submit Request" : "Continue"}
                                    </Text>
                                    <Ionicons name={currentStep === 4 ? "send" : "arrow-forward"} size={18} color="#FFF" />
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

    // Step Indicator
    stepContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 20, backgroundColor: '#FFF' },
    stepItem: { alignItems: 'center', zIndex: 1, backgroundColor: '#FFF', paddingHorizontal: 8 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
    stepCircleActive: { backgroundColor: '#E3F2FD', borderColor: '#0D47A1' },
    stepCircleDone: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    stepNum: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
    stepNumActive: { color: '#0D47A1' },
    stepLabelText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#0D47A1' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: -15, marginTop: -15 },
    stepLineDone: { backgroundColor: '#0D47A1' },

    scroll: { padding: 20, paddingBottom: 40 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#64748B' },

    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 16 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16, height: 48 },
    input: { flex: 1, fontSize: 15, color: '#1E293B', padding: 0, marginLeft: 10 },

    verifyBtn: { backgroundColor: "#0D47A1", borderRadius: 12, padding: 15, alignItems: "center" },
    verifyText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
    verifiedBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F5E9', padding: 12, borderRadius: 12, marginBottom: 20 },
    verifiedText: { color: '#2E7D32', fontWeight: '800' },
    
    otpSection: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    otpButton: { backgroundColor: '#0D47A1', paddingHorizontal: 16, height: 48, borderRadius: 12, justifyContent: 'center' },
    otpButtonDisabled: { opacity: 0.5 },
    otpButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', paddingHorizontal: 12, height: 48, borderRadius: 12 },
    otpVerifyContainer: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },
    verifyButton: { backgroundColor: '#2E7D32', paddingHorizontal: 24, height: 48, borderRadius: 12, justifyContent: 'center' },
    verifyButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

    typeGrid: { gap: 12 },
    typeItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#F1F5F9", gap: 12, elevation: 2, shadowColor: '#64748B', shadowOpacity: 0.05, shadowRadius: 8 },
    typeSelected: { borderColor: "#0D47A1", backgroundColor: "#F0F7FF" },
    typeIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
    typeIconActive: { backgroundColor: '#0D47A1' },
    typeLabel: { flex: 1, fontSize: 15, color: "#475569", fontWeight: '600' },
    typeLabelActive: { color: "#0D47A1", fontWeight: "800" },

    // Per-type section headers (Step 2)
    typeSection: {},
    typeSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, paddingHorizontal: 4 },
    typeSectionIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
    typeSectionTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1' },

    // Per-type doc section headers (Step 3)
    docSection: {},
    docSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, paddingHorizontal: 4 },
    docSectionIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
    docSectionTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1' },

    uploadLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8, color: "#475569", marginTop: 12 },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: "#F8FAFC", borderRadius: 14, padding: 14, borderStyle: "dashed", borderWidth: 1.5, borderColor: "#0D47A1", marginBottom: 8 },
    uploadBtnDone: { borderStyle: 'solid', borderColor: '#2E7D32', backgroundColor: '#F0FDF4' },
    uploadBtnText: { color: "#0D47A1", fontSize: 13, fontWeight: "800", flex: 1 },
    uploadBtnTextDone: { color: "#2E7D32" },

    // Review styles (Step 4)
    reviewCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowRadius: 12 },
    reviewLabelMain: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
    reviewTypeBlock: { marginBottom: 4 },
    reviewTypeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    reviewTypeName: { fontSize: 14, fontWeight: '800', color: '#0D47A1' },
    reviewRow: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
    reviewKey: { fontSize: 12, color: '#94A3B8', fontWeight: '600', minWidth: 100 },
    reviewVal: { fontSize: 12, color: '#1E293B', fontWeight: '700', flex: 1 },
    modifyTitle: { fontSize: 12, fontWeight: '800', color: '#0D47A1', marginBottom: 10, letterSpacing: 1, marginTop: 4 },
    updateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    updateLabelText: { color: '#475569', fontSize: 12, fontWeight: '600', flex: 1 },
    declarationBox: { flexDirection: 'row', backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginTop: 20, gap: 12, borderWidth: 1, borderColor: '#DCFCE7' },
    declText: { flex: 1, fontSize: 12, color: '#166534', lineHeight: 18, fontWeight: '600' },

    bottomBar: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    continueButton: { borderRadius: 16, overflow: 'hidden' },
    buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    buttonText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    btnDisabled: { opacity: 0.5 },

    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    idValue: { fontSize: 24, fontWeight: '800', color: '#0D47A1' },
    successActions: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 12, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btnGrad: { paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    mainBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});