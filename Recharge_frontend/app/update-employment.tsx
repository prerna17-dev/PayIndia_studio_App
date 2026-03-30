import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
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
import * as Clipboard from "expo-clipboard";

type UpdateType = "Qualification" | "Experience" | "Skills" | "Address" | "Photo";

interface UploadedFile {
    name: string;
    size: string;
    uri: string;
}

const REQUIRED_DOCS: Record<string, { id: string; label: string }[]> = {
    Qualification: [
        { id: "eduProof", label: "Educational Degree/Marksheet (PDF/Image)" },
    ],
    Experience: [
        { id: "expProof", label: "Work Experience Certificate (PDF/Image)" },
    ],
    Skills: [
        { id: "skillProof", label: "Skill Certificate or Diploma (PDF/Image)" },
    ],
    Address: [
        { id: "addrProof", label: "Address Proof (Electricity/Water Bill/Aadhaar)" },
    ],
    Photo: [
        { id: "newPhoto", label: "Recent Passport Size Photograph (JPG/PNG)" },
    ],
};

export default function UpdateEmploymentScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Step 1: Verification
    const [regID, setRegID] = useState("");
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Step 2: Select & Filling
    const [selectedType, setSelectedType] = useState<UpdateType | null>(null);
    const [correctedValue, setCorrectedValue] = useState("");
    const [newState, setNewState] = useState("");
    const [newPincode, setNewPincode] = useState("");
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile>>({});
    
    // Status & Success
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [showCopied, setShowCopied] = useState(false);

    useEffect(() => {
        const backAction = () => {
            if (step > 1) { setStep(step - 1); return true; }
            else { router.back(); return true; }
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [step]);

    // Reset fields when type changes
    useEffect(() => {
        setUploadedDocs({});
        setCorrectedValue("");
        setNewState("");
        setNewPincode("");
    }, [selectedType]);

    const formatAadhaar = (text: string) => {
        const cleaned = text.replace(/\D/g, "").substring(0, 12);
        let formatted = "";
        for (let i = 0; i < cleaned.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += " ";
            formatted += cleaned[i];
        }
        setAadhaarNo(formatted);
    };

    const handleSendOtp = async () => {
        const cleanAadhaar = aadhaarNo.replace(/\s/g, "");
        if (cleanAadhaar.length !== 12) return Alert.alert("Error", "Enter valid 12-digit Aadhaar");
        if (mobileNumber.length !== 10) return Alert.alert("Error", "Enter valid 10-digit mobile");
        if (!regID) return Alert.alert("Error", "Enter Registration ID");

        setIsVerifying(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.post(API_ENDPOINTS.EMPLOYMENT_CORRECTION_OTP_SEND, {
                mobile_number: mobileNumber,
                registration_id: regID,
                aadhaar_number: cleanAadhaar
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (res.data.success) {
                setIsOtpSent(true);
                Alert.alert("Success", "OTP sent to your registered mobile.");
            } else {
                Alert.alert("Error", res.data.message || "Failed to send OTP");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Verification failed");
        } finally { setIsVerifying(false); }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return Alert.alert("Error", "Enter 6-digit OTP");
        setIsVerifying(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.post(API_ENDPOINTS.EMPLOYMENT_CORRECTION_OTP_VERIFY, {
                mobile_number: mobileNumber,
                otp_code: otp
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (res.data.success) {
                setStep(2);
            } else {
                Alert.alert("Error", "Invalid OTP code");
            }
        } catch (error: any) {
            Alert.alert("Error", "Invalid OTP. Please try again.");
        } finally { setIsVerifying(false); }
    };

    const handleFileUpload = async (docId: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"] });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const sizeInMb = asset.size ? (asset.size / (1024 * 1024)).toFixed(1) : "0.5";
                setUploadedDocs(prev => ({ ...prev, [docId]: { name: asset.name, size: `${sizeInMb} MB`, uri: asset.uri } }));
            }
        } catch (err) { Alert.alert("Error", "Failed to upload document"); }
    };

    const handleContinueToReview = () => {
        if (!selectedType) return Alert.alert("Wait", "Please select a correction type");
        if (!correctedValue) return Alert.alert("Wait", "Please fill in the new details");
        
        const docs = REQUIRED_DOCS[selectedType] || [];
        const missing = docs.find(d => !uploadedDocs[d.id]);
        if (missing) return Alert.alert("Wait", `Please upload the ${missing.label}`);
        
        setStep(3);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();
            data.append("registration_id", regID);
            data.append("aadhaar_number", aadhaarNo.replace(/\s/g, ""));
            data.append("mobile_number", mobileNumber);
            data.append("correction_type", selectedType || "");
            
            if (selectedType === "Qualification") data.append("corrected_qualification", correctedValue);
            if (selectedType === "Experience") data.append("corrected_experience", correctedValue);
            if (selectedType === "Skills") data.append("corrected_skills", correctedValue);
            if (selectedType === "Address") {
                data.append("corrected_address", correctedValue);
                data.append("corrected_state", newState);
                data.append("corrected_pincode", newPincode);
            }

            // Correctly map frontend document keys to backend expected field names
            const map: Record<string, string> = { 
                eduProof: "education_cert", 
                expProof: "experience_cert", 
                skillProof: "supporting_doc", 
                addrProof: "supporting_doc", 
                newPhoto: "photo",
                aadhaarProof: "aadhaar_card"
            };
            
            Object.keys(uploadedDocs).forEach(key => {
                const file = uploadedDocs[key];
                if (file && map[key]) {
                    data.append(map[key], {
                        uri: file.uri,
                        name: file.name,
                        type: key === "newPhoto" ? "image/jpeg" : "application/pdf"
                    } as any);
                }
            });

            const res = await axios.post(API_ENDPOINTS.EMPLOYMENT_CORRECTION_SUBMIT, data, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setApplicationId(res.data.data.reference_id);
                setIsSubmitted(true);
            } else {
                Alert.alert("Error", res.data.message || "Failed to submit request");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to submit application. Please check your data.");
        } finally { setIsSubmitting(false); }
    };

    const renderStepIndicator = () => (
        <View style={s.stepIndicatorContainer}>
            <View style={s.progressLine}>
                <View style={[s.progressLineActive, { width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }]} />
            </View>
            <View style={s.stepsRow}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={s.stepItem}>
                        <View style={[
                            s.stepCircle,
                            step >= i && s.stepCircleActive,
                            step > i && s.stepCircleDone
                        ]}>
                            {step > i ? <Ionicons name="checkmark" size={14} color="#FFF" /> : <Text style={[s.stepNum, step >= i && s.stepNumActive]}>{i}</Text>}
                        </View>
                        <Text style={[s.stepLabel, step >= i && s.stepLabelActive]}>
                            {i === 1 ? "Verify" : i === 2 ? "Update" : "Submit"}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(applicationId);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    if (isSubmitted) {
        return (
            <View style={s.root}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={s.safe}>
                    <View style={s.successContainer}>
                        <View style={s.successIconCircle}>
                            <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                        </View>
                        <Text style={s.successTitle}>Application Submitted !</Text>
                        <Text style={s.successSubtitle}>Your Job Seeker profile correction has been successfully registered.</Text>
                        
                        <TouchableOpacity 
                            style={s.idCard} 
                            activeOpacity={0.7}
                            onPress={copyToClipboard}
                        >
                            <Text style={s.idLabel}>Reference ID</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Text style={s.idValue}>{applicationId}</Text>
                                <Ionicons name="copy-outline" size={22} color="#0D47A1" />
                            </View>
                        </TouchableOpacity>

                        {showCopied && (
                            <View style={s.toast}>
                                <Text style={s.toastText}>Copied to clipboard</Text>
                            </View>
                        )}

                        <TouchableOpacity style={s.mainBtn} onPress={() => router.replace("/employment-services")}>
                            <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                <Text style={s.mainBtnText}>Return to Services</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={s.root}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView style={s.safe}>
                <View style={s.header}>
                    <TouchableOpacity style={s.backBtn} onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={s.headerContent}>
                        <Text style={s.headerTitle}>Update Details</Text>
                        <Text style={s.headerSubtitle}>Employment Registration Correction</Text>
                    </View>
                    <View style={s.placeholder} />
                </View>

                {renderStepIndicator()}

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                        {step === 1 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={s.iconBadge}><Ionicons name="shield-checkmark" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Identification</Text>
                                        <Text style={s.sectionSub}>Verify your profile credentials</Text>
                                    </View>
                                </View>
                                <View style={s.card}>
                                    <Text style={s.inputLabel}>Employment Registration ID *</Text>
                                    <View style={s.inputRow}>
                                        <Ionicons name="id-card-outline" size={20} color="#64748B" />
                                        <TextInput style={s.field} placeholder="EMP123456" value={regID} onChangeText={setRegID} autoCapitalize="characters" />
                                    </View>

                                    <Text style={[s.inputLabel, { marginTop: 16 }]}>Aadhaar Number *</Text>
                                    <View style={s.inputRow}>
                                        <Ionicons name="card-outline" size={20} color="#64748B" />
                                        <TextInput style={s.field} placeholder="XXXX XXXX XXXX" keyboardType="numeric" maxLength={14} value={aadhaarNo} onChangeText={formatAadhaar} />
                                    </View>

                                    <Text style={[s.inputLabel, { marginTop: 16 }]}>Registered Mobile *</Text>
                                    <View style={s.otpRow}>
                                        <View style={[s.inputRow, { flex: 1 }]}>
                                            <Ionicons name="phone-portrait-outline" size={20} color="#64748B" />
                                            <TextInput style={s.field} placeholder="10-digit mobile" keyboardType="numeric" maxLength={10} value={mobileNumber} onChangeText={setMobileNumber} />
                                        </View>
                                        <TouchableOpacity 
                                            style={[s.verifyBtn, isOtpSent && { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1' }]} 
                                            onPress={handleSendOtp}
                                        >
                                            <Text style={[s.verifyBtnText, isOtpSent && { color: '#64748B' }]}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {isOtpSent && (
                                        <View style={{ marginTop: 16 }}>
                                            <Text style={s.inputLabel}>Enter 6-Digit OTP *</Text>
                                            <View style={s.inputRow}>
                                                <Ionicons name="key-outline" size={20} color="#64748B" />
                                                <TextInput style={s.field} placeholder="XXXXXX" keyboardType="numeric" maxLength={6} value={otp} onChangeText={setOtp} />
                                            </View>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity 
                                    style={[s.mainBtn, (!isOtpSent || otp.length !== 6) && s.btnDisabled]} 
                                    disabled={!isOtpSent || otp.length !== 6 || isVerifying} 
                                    onPress={handleVerifyOtp}
                                >
                                    <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                        {isVerifying ? <ActivityIndicator color="#FFF" /> : (
                                            <>
                                                <Text style={s.mainBtnText}>Verify & Proceed</Text>
                                                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 2 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#E0F2F1' }]}><Ionicons name="create" size={20} color="#007961" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Correction Selection</Text>
                                        <Text style={s.sectionSub}>Select the field you want to update</Text>
                                    </View>
                                </View>

                                {/* chips */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeList}>
                                    {([
                                        { id: "Qualification", label: "Education", icon: "school" },
                                        { id: "Experience", label: "Experience", icon: "briefcase" },
                                        { id: "Skills", label: "Skills", icon: "construct" },
                                        { id: "Address", label: "Address", icon: "home" },
                                        { id: "Photo", label: "Photo", icon: "camera" },
                                    ] as { id: UpdateType; label: string; icon: string }[]).map((t) => (
                                        <TouchableOpacity key={t.id}
                                            style={[s.typeItem, selectedType === t.id && s.typeItemActive]}
                                            onPress={() => setSelectedType(t.id)}>
                                            <View style={[s.typeIcon, selectedType === t.id && s.typeIconActive]}>
                                                <Ionicons name={t.icon as any} size={24} color={selectedType === t.id ? "#FFF" : "#64748B"} />
                                            </View>
                                            <Text style={[s.typeLabelText, selectedType === t.id && s.typeLabelActive]}>{t.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {selectedType && (
                                    <View>
                                        <View style={s.card}>
                                            <Text style={s.formHeader}>Update Details</Text>
                                            
                                            {selectedType === "Address" ? (
                                                <View>
                                                    <Text style={s.inputLabel}>New Detailed Address *</Text>
                                                    <TextInput 
                                                        style={s.textArea} 
                                                        multiline 
                                                        placeholder="House No, Area, Village, Landmark" 
                                                        value={correctedValue} 
                                                        onChangeText={setCorrectedValue} 
                                                    />
                                                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={s.inputLabel}>State *</Text>
                                                            <View style={s.inputRow}>
                                                                <TextInput style={s.field} placeholder="State" value={newState} onChangeText={setNewState} />
                                                            </View>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={s.inputLabel}>Pincode *</Text>
                                                            <View style={s.inputRow}>
                                                                <TextInput 
                                                                    style={s.field} 
                                                                    placeholder="6-digit" 
                                                                    value={newPincode} 
                                                                    onChangeText={setNewPincode} 
                                                                    keyboardType="numeric" 
                                                                    maxLength={6} 
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            ) : (
                                                <View>
                                                    <Text style={s.inputLabel}>Enter Corrected {selectedType} *</Text>
                                                    <TextInput 
                                                        style={s.textArea} 
                                                        multiline 
                                                        placeholder={`Enter your new ${selectedType} information here...`} 
                                                        value={correctedValue} 
                                                        onChangeText={setCorrectedValue} 
                                                    />
                                                </View>
                                            )}

                                            {/* Doc Uploads */}
                                            <View style={{ marginTop: 20 }}>
                                                <Text style={s.docSectionTitle}>Required Documents</Text>
                                                {(REQUIRED_DOCS[selectedType] || []).map((doc) => {
                                                    const uploaded = uploadedDocs[doc.id];
                                                    return (
                                                        <View key={doc.id} style={s.docCard}>
                                                            <View style={s.docLabelRow}>
                                                                <Ionicons name="document-text-outline" size={18} color="#0D47A1" />
                                                                <Text style={s.docLabel}>{doc.label}</Text>
                                                            </View>
                                                            {uploaded ? (
                                                                <View style={s.uploadedBox}>
                                                                    <MaterialCommunityIcons name="file-document" size={24} color="#0D47A1" />
                                                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                                                        <Text style={s.fileName} numberOfLines={1}>{uploaded.name}</Text>
                                                                        <Text style={s.fileSize}>{uploaded.size}</Text>
                                                                    </View>
                                                                    <TouchableOpacity onPress={() => setUploadedDocs({})}>
                                                                        <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            ) : (
                                                                <TouchableOpacity style={s.uploadBox} onPress={() => handleFileUpload(doc.id)}>
                                                                    <Ionicons name="cloud-upload-outline" size={26} color="#0D47A1" />
                                                                    <Text style={s.uploadText}>Tap to Upload</Text>
                                                                    <Text style={s.uploadSubText}>PDF, JPG or PNG (Max 5MB)</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity 
                                    style={[s.mainBtn, !selectedType && s.btnDisabled]} 
                                    disabled={!selectedType} 
                                    onPress={handleContinueToReview}
                                >
                                    <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                        <Text style={s.mainBtnText}>Continue to Review</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 3 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#F3E5F5' }]}><Ionicons name="eye" size={20} color="#7B1FA2" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Final Confirmation</Text>
                                        <Text style={s.sectionSub}>Review your details before submission</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <ReviewRow label="Registration ID" value={regID} />
                                    <View style={s.divider} />
                                    <ReviewRow label="Aadhaar Number" value={aadhaarNo} />
                                    <View style={s.divider} />
                                    <ReviewRow label="Correction Category" value={selectedType || ""} />
                                    <View style={s.divider} />
                                    <View style={s.reviewCol}>
                                        <Text style={s.reviewLabel}>New Information</Text>
                                        <Text style={s.reviewValFull}>{correctedValue}</Text>
                                        {selectedType === "Address" && (
                                            <Text style={s.reviewSubVal}>{newState} - {newPincode}</Text>
                                        )}
                                    </View>
                                    <View style={s.divider} />
                                    <ReviewRow label="Documents" value={`${Object.keys(uploadedDocs).length} Proof Attached`} />
                                </View>

                                <TouchableOpacity 
                                    style={[s.mainBtn, isSubmitting && s.btnDisabled]} 
                                    disabled={isSubmitting} 
                                    onPress={handleSubmit}
                                >
                                    <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                        {isSubmitting ? <ActivityIndicator color="#FFF" /> : (
                                            <>
                                                <Text style={s.mainBtnText}>Confirm & Apply</Text>
                                                <Ionicons name="cloud-upload" size={20} color="#FFF" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const ReviewRow = ({ label, value }: { label: string, value: string }) => (
    <View style={s.reviewRow}>
        <Text style={s.reviewLabel}>{label}</Text>
        <Text style={s.reviewVal}>{value}</Text>
    </View>
);

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    safe: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    backBtn: { padding: 4 },
    headerContent: { alignItems: "center" },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 11, color: "#64748B", marginTop: 2 },
    placeholder: { width: 34 },

    stepIndicatorContainer: { paddingVertical: 20, paddingHorizontal: 40, backgroundColor: "#FFF" },
    progressLine: { position: "absolute", top: 35, left: 60, right: 60, height: 2, backgroundColor: "#F1F5F9", zIndex: 0 },
    progressLineActive: { height: "100%", backgroundColor: "#0D47A1" },
    stepsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    stepItem: { alignItems: "center" },
    stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#F1F5F9", zIndex: 1 },
    stepCircleActive: { backgroundColor: "#FFF", borderColor: "#0D47A1" },
    stepCircleDone: { backgroundColor: "#0D47A1", borderColor: "#0D47A1" },
    stepNum: { fontSize: 12, fontWeight: "800", color: "#94A3B8" },
    stepNumActive: { color: "#0D47A1" },
    stepLabel: { fontSize: 10, fontWeight: "700", color: "#94A3B8", marginTop: 6 },
    stepLabelActive: { color: "#0D47A1" },

    scroll: { padding: 16 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 15 },
    iconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#E3F2FD", alignItems: "center", justifyContent: "center" },
    sectionTitle: { fontSize: 18, fontWeight: "900", color: "#1E293B" },
    sectionSub: { fontSize: 12, color: "#64748B" },

    card: { backgroundColor: "#FFF", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#F1F5F9", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    inputLabel: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8, marginLeft: 4 },
    inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 16, paddingHorizontal: 15, height: 52, borderWidth: 1, borderColor: "#F1F5F9" },
    field: { flex: 1, marginLeft: 10, fontSize: 15, color: "#1E293B" },
    otpRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    verifyBtn: { backgroundColor: '#0D47A1', paddingHorizontal: 15, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    verifyBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

    mainBtn: { width: "100%", height: 56, borderRadius: 16, overflow: "hidden", marginTop: 25 },
    btnGrad: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    mainBtnText: { fontSize: 16, fontWeight: "800", color: "#FFF" },
    btnDisabled: { opacity: 0.6 },

    typeList: { gap: 12, paddingBottom: 25 },
    typeItem: { alignItems: 'center', width: 75 },
    typeItemActive: { opacity: 1 },
    typeIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
    typeIconActive: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    typeLabelText: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 6 },
    typeLabelActive: { color: '#0D47A1', fontWeight: '800' },

    formHeader: { fontSize: 15, fontWeight: '800', color: '#0D47A1', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
    textArea: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 15, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#F1F5F9', fontSize: 14 },

    docSectionTitle: { fontSize: 14, fontWeight: '800', color: '#445161', marginBottom: 12 },
    docCard: { marginBottom: 15 },
    docLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    docLabel: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    uploadBox: { height: 80, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#0D47A1', borderRadius: 16, backgroundColor: '#F1F8FE', alignItems: 'center', justifyContent: 'center' },
    uploadText: { fontSize: 12, fontWeight: '800', color: '#0D47A1' },
    uploadSubText: { fontSize: 10, color: '#64748B', marginTop: 2 },
    uploadedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F8E9', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#C8E6C9' },
    fileName: { fontSize: 13, fontWeight: '700', color: '#1B5E20' },
    fileSize: { fontSize: 11, color: '#4CAF50' },

    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reviewCol: { gap: 4 },
    reviewLabel: { fontSize: 13, color: '#64748B' },
    reviewVal: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
    reviewValFull: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginTop: 2 },
    reviewSubVal: { fontSize: 12, color: '#64748B' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

    successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: "#FFF" },
    successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F1F8E9", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: "900", color: "#1E293B", textAlign: "center" },
    successSubtitle: { fontSize: 14, color: "#64748B", textAlign: "center", marginTop: 12, lineHeight: 22 },
    idCard: { backgroundColor: "#F8FAFC", borderRadius: 20, padding: 24, width: "100%", marginVertical: 30, alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9" },
    idLabel: { fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: "900", color: "#0D47A1", marginTop: 8 },
    toast: { position: 'absolute', bottom: 120, backgroundColor: 'rgba(0,0,0,0.85)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
    toastText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
