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
    Clipboard,
    Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";

type CorrectionType = "name" | "area" | "occupant" | "land_use" | "other";

interface UploadedFile {
    name: string;
    size: string;
    uri: string;
}

const REQUIRED_DOCS: Record<string, { id: string; label: string }[]> = {
    name: [{ id: "supporting_doc", label: "Legal Name Change Document (Gazette/Affidavit)" }],
    area: [{ id: "supporting_doc", label: "Land Measurement Sheet (Mojani Patrak)" }],
    occupant: [{ id: "supporting_doc", label: "Heirship Certificate or Sale Deed" }],
    land_use: [{ id: "supporting_doc", label: "NA Order or Land Use Permission" }],
    other: [{ id: "supporting_doc", label: "Relevant Supporting Document" }],
};

export default function Mutation712UpdateScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Section 1: Verify
    const [satbaraId, setSatbaraId] = useState("");
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Section 2: Update Details
    const [selectedType, setSelectedType] = useState<CorrectionType | null>(null);
    const [correctedName, setCorrectedName] = useState("");
    const [correctedArea, setCorrectedArea] = useState("");
    const [correctedOccupant, setCorrectedOccupant] = useState("");
    const [correctedLandUse, setCorrectedLandUse] = useState("");
    const [otherDetails, setOtherDetails] = useState("");

    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [referenceId, setReferenceId] = useState("");

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        const backAction = () => {
            if (step > 1) { setStep(step - 1); return true; }
            else { router.back(); return true; }
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [step]);

    const formatAadhaar = (text: string) => {
        const cleaned = text.replace(/\s/g, "");
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
        if (!satbaraId) return Alert.alert("Error", "Enter Satbara ID / Reference ID");

        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.post(
                API_ENDPOINTS.LAND_712_OTP_SEND,
                { mobile_number: mobileNumber, aadhaar_number: cleanAadhaar },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setIsOtpSent(true);
                Alert.alert("Success", "OTP sent to registered mobile");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return Alert.alert("Error", "Enter 6-digit OTP");
        setIsVerifying(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.post(
                API_ENDPOINTS.LAND_712_OTP_VERIFY,
                { mobile_number: mobileNumber, otp_code: otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setIsVerifying(false);
                setStep(2);
            } else {
                setIsVerifying(false);
                Alert.alert("Error", res.data.message || "Invalid OTP");
            }
        } catch (error: any) {
            setIsVerifying(false);
            Alert.alert("Error", error.response?.data?.message || "Invalid OTP");
        }
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

    const validateStep2 = () => {
        if (!selectedType) return Alert.alert("Required", "Please select a correction type");
        if (!uploadedDocs.id_proof) return Alert.alert("Required", "Please upload ID Proof (Aadhaar/PAN)");
        if (!uploadedDocs.supporting_doc) return Alert.alert("Required", "Please upload supporting document");

        switch (selectedType) {
            case "name": if (!correctedName) return Alert.alert("Required", "Enter corrected name"); break;
            case "area": if (!correctedArea) return Alert.alert("Required", "Enter corrected area"); break;
            case "occupant": if (!correctedOccupant) return Alert.alert("Required", "Enter corrected occupant details"); break;
            case "land_use": if (!correctedLandUse) return Alert.alert("Required", "Enter land use details"); break;
        }

        setStep(3);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();
            data.append("satbara_id", satbaraId);
            data.append("aadhaar_number", aadhaarNo.replace(/\s/g, ""));
            data.append("mobile_number", mobileNumber);
            data.append("correction_type", selectedType as string);

            if (correctedName) data.append("corrected_name", correctedName);
            if (correctedArea) data.append("corrected_area", correctedArea);
            if (correctedOccupant) data.append("corrected_occupant", correctedOccupant);
            if (correctedLandUse) data.append("corrected_land_use", correctedLandUse);
            if (otherDetails) data.append("other_details", otherDetails);

            if (uploadedDocs.id_proof) {
                data.append("id_proof", { uri: uploadedDocs.id_proof.uri, name: uploadedDocs.id_proof.name, type: "application/pdf" } as any);
            }
            if (uploadedDocs.supporting_doc) {
                data.append("supporting_doc", { uri: uploadedDocs.supporting_doc.uri, name: uploadedDocs.supporting_doc.name, type: "application/pdf" } as any);
            }

            const res = await axios.post(API_ENDPOINTS.LAND_712_CORRECTION_SUBMIT, data, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setReferenceId(res.data.data.reference_id);
                setIsSubmitted(true);
            } else {
                Alert.alert("Error", res.data.message || "Submission failed");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [showToast, setShowToast] = useState(false);
    const copyToClipboard = () => {
        Clipboard.setString(referenceId);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const getNewValueDisplay = () => {
        switch (selectedType) {
            case "name": return correctedName;
            case "area": return correctedArea;
            case "occupant": return correctedOccupant;
            case "land_use": return correctedLandUse;
            case "other": return otherDetails || "N/A";
            default: return "N/A";
        }
    };

    if (isSubmitted) {
        return (
            <View style={s.root}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={s.successContainer}>
                    <View style={s.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#0D47A1" />
                    </View>
                    <Text style={s.successTitle}>Application Submitted!</Text>
                    <Text style={s.successSubtitle}>Your 7/12 Land Record correction request is being processed.</Text>
                    <View style={s.idCard}>
                        <Text style={s.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text style={s.idValue}>{referenceId}</Text>
                            <TouchableOpacity onPress={copyToClipboard} style={{ padding: 4 }}>
                                <Ionicons name="copy-outline" size={24} color="#0D47A1" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {showToast && (
                        <View style={s.toast}><Text style={s.toastText}>Reference ID Copied!</Text></View>
                    )}
                    <TouchableOpacity style={s.mainBtn} onPress={() => router.replace("/satbara-services")}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                            <Text style={s.mainBtnText}>Return to Services </Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
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
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <View style={s.headerContent}>
                        <Text style={s.headerTitle}>Mutation (7/12 Update)</Text>
                        <Text style={s.headerSubtitle}>Official Correction Service</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Step Indicator */}
                <View style={s.stepContainer}>
                    {[1, 2, 3].map((i) => (
                        <React.Fragment key={i}>
                            <View style={s.stepItem}>
                                <View style={[s.stepCircle, step >= i && s.stepCircleActive, step > i && s.stepCircleDone]}>
                                    {step > i ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[s.stepNum, step >= i && s.stepNumActive]}>{i}</Text>}
                                </View>
                                <Text style={[s.stepLabel, step >= i && s.stepLabelActive]}>
                                    {i === 1 ? "Verify" : i === 2 ? "Update" : "Confirm"}
                                </Text>
                            </View>
                            {i < 3 && <View style={[s.stepLine, step > i && s.stepLineDone]} />}
                        </React.Fragment>
                    ))}
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                        {/* STEP 1: Verify */}
                        {step === 1 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={s.iconBadge}><Ionicons name="shield-checkmark" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Verification</Text>
                                        <Text style={s.sectionSub}>Verify land record ownership</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <Text style={s.inputLabel}>Satbara ID / Survey Number *</Text>
                                    <View style={s.inputRow}>
                                        <Ionicons name="map-outline" size={20} color="#64748B" />
                                        <TextInput style={s.field} placeholder="Ex: 102/1A or EXT712..." value={satbaraId} onChangeText={setSatbaraId} />
                                    </View>

                                    <Text style={[s.inputLabel, { marginTop: 16 }]}>Owner's Aadhaar Number *</Text>
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
                                        <TouchableOpacity style={s.verifyBtn} onPress={handleSendOtp}>
                                            <Text style={s.verifyBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {isOtpSent && (
                                        <View style={{ marginTop: 16 }}>
                                            <Text style={s.inputLabel}>Enter OTP *</Text>
                                            <View style={s.inputRow}>
                                                <Ionicons name="key-outline" size={20} color="#64748B" />
                                                <TextInput style={s.field} placeholder="6 digit code" keyboardType="numeric" maxLength={6} value={otp} onChangeText={setOtp} />
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {!isKeyboardVisible && (
                                    <TouchableOpacity style={[s.mainBtn, !isOtpSent && s.btnDisabled]} disabled={!isOtpSent || isVerifying} onPress={handleVerifyOtp}>
                                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                            {isVerifying ? <ActivityIndicator color="#FFF" /> : <Text style={s.mainBtnText}>Verify & Proceed</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* STEP 2: Selection & Form */}
                        {step === 2 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#E0F2F1' }]}><Ionicons name="create" size={20} color="#007961" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Select Update Type</Text>
                                        <Text style={s.sectionSub}>What needs to be corrected?</Text>
                                    </View>
                                </View>

                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeList}>
                                    {([
                                        { id: "name", label: "Owner Name", icon: "person" },
                                        { id: "area", label: "Land Area", icon: "expand" },
                                        { id: "occupant", label: "Occupant", icon: "people" },
                                        { id: "land_use", label: "Land Use", icon: "leaf" },
                                        { id: "other", label: "Other", icon: "ellipsis-horizontal" },
                                    ] as { id: CorrectionType; label: string; icon: string }[]).map((t) => (
                                        <TouchableOpacity key={t.id} style={[s.typeItem, selectedType === t.id && s.typeItemActive]} onPress={() => setSelectedType(t.id)}>
                                            <View style={[s.typeIcon, selectedType === t.id && s.typeIconActive]}>
                                                <Ionicons name={t.icon as any} size={24} color={selectedType === t.id ? "#FFF" : "#64748B"} />
                                            </View>
                                            <Text style={[s.typeLabelText, selectedType === t.id && s.typeLabelActive]}>{t.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {selectedType && (
                                    <View style={s.card}>
                                        <Text style={s.formHeader}>Correction Details</Text>
                                        {selectedType === "name" && (
                                            <InputGroup label="Correct Full Name *" icon="person-outline" placeholder="Enter new name" value={correctedName} onChangeText={setCorrectedName} />
                                        )}
                                        {selectedType === "area" && (
                                            <InputGroup label="Correct Land Area (Hectors) *" icon="expand-outline" placeholder="Ex: 0.45.00" value={correctedArea} onChangeText={setCorrectedArea} />
                                        )}
                                        {selectedType === "occupant" && (
                                            <InputGroup label="Correct Occupant Details *" icon="people-outline" placeholder="Enter details" value={correctedOccupant} onChangeText={setCorrectedOccupant} />
                                        )}
                                        {selectedType === "land_use" && (
                                            <InputGroup label="Correct Land Use *" icon="leaf-outline" placeholder="Ex: Agricultural to NA" value={correctedLandUse} onChangeText={setCorrectedLandUse} />
                                        )}
                                        <InputGroup label="Any Other Details" icon="document-text-outline" placeholder="Optional comments" value={otherDetails} onChangeText={setOtherDetails} multiline style={{ height: 80 }} />
                                    </View>
                                )}

                                <View style={s.card}>
                                    <Text style={s.formHeader}>Document Uploads</Text>
                                    <DocUpload label="ID Proof (Aadhaar/PAN) *" id="id_proof" file={uploadedDocs.id_proof} onUpload={handleFileUpload} onRemove={(id: string) => setUploadedDocs(p => { const n = { ...p }; delete n[id]; return n; })} />
                                    {selectedType && (
                                        <DocUpload label={`${REQUIRED_DOCS[selectedType][0].label} *`} id="supporting_doc" file={uploadedDocs.supporting_doc} onUpload={handleFileUpload} onRemove={(id: string) => setUploadedDocs(p => { const n = { ...p }; delete n[id]; return n; })} />
                                    )}
                                </View>

                                {!isKeyboardVisible && (
                                    <TouchableOpacity style={s.mainBtn} onPress={validateStep2}>
                                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                            <Text style={s.mainBtnText}>Continue</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* STEP 3: Confirm */}
                        {step === 3 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#F3E5F5' }]}><Ionicons name="eye" size={20} color="#7B1FA2" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Review & Confirm</Text>
                                        <Text style={s.sectionSub}>Verify your correction request</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <ReviewRow label="Satbara ID" value={satbaraId} />
                                    <ReviewRow label="Correction Type" value={selectedType?.toUpperCase() || ""} />
                                    <ReviewRow label="Target Correction" value={selectedType?.replace('_', ' ').toUpperCase()} />
                                    <ReviewRow label="New Value" value={getNewValueDisplay()} isGreen />
                                </View>

                                <View style={s.warningBox}>
                                    <Ionicons name="information-circle" size={20} color="#856404" />
                                    <Text style={s.warningText}>Official records will be updated upon Revenue Officer's verification. Reference Number will be generated after submission.</Text>
                                </View>

                                {!isKeyboardVisible && (
                                    <TouchableOpacity style={s.mainBtn} onPress={handleSubmit} disabled={isSubmitting}>
                                        <LinearGradient colors={['#2E7D32', '#388E3C']} style={s.btnGrad}>
                                            {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={s.mainBtnText}>Submit Correction Request</Text>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const InputGroup = ({ label, icon, ...props }: any) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={s.inputLabel}>{label}</Text>
        <View style={[s.inputRow, props.multiline && { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
            <Ionicons name={icon} size={18} color="#64748B" />
            <TextInput style={[s.field, props.multiline && { textAlignVertical: 'top' }]} placeholderTextColor="#94A3B8" {...props} />
        </View>
    </View>
);

const DocUpload = ({ label, id, file, onUpload, onRemove }: any) => (
    <View style={{ marginBottom: 12 }}>
        <Text style={s.docLabel}>{label}</Text>
        {file ? (
            <View style={s.uploadedBox}>
                <View style={s.uploadedInfo}>
                    <MaterialCommunityIcons name="file-document" size={22} color="#0D47A1" />
                    <View style={{ flex: 1 }}>
                        <Text style={s.fileName} numberOfLines={1}>{file.name}</Text>
                        <Text style={s.fileSize}>{file.size}</Text>
                    </View>
                    <TouchableOpacity onPress={() => onRemove(id)}><Ionicons name="trash-outline" size={20} color="#D32F2F" /></TouchableOpacity>
                </View>
            </View>
        ) : (
            <TouchableOpacity style={s.uploadBox} onPress={() => onUpload(id)}>
                <Ionicons name="cloud-upload-outline" size={22} color="#0D47A1" />
                <Text style={s.uploadText}>Tap to Upload</Text>
            </TouchableOpacity>
        )}
    </View>
);

const ReviewRow = ({ label, value, isGreen }: any) => (
    <View style={s.reviewRow}>
        <Text style={s.reviewLabel}>{label}</Text>
        <Text style={[s.reviewVal, isGreen && { color: '#2E7D32' }]}>{value}</Text>
    </View>
);

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    safe: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFF" },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerContent: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },
    stepContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20, backgroundColor: '#FFF' },
    stepItem: { alignItems: 'center', zIndex: 2 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
    stepCircleActive: { borderColor: '#0D47A1' },
    stepCircleDone: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    stepNum: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
    stepNumActive: { color: '#0D47A1' },
    stepLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#0D47A1' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: -10, marginTop: -15 },
    stepLineDone: { backgroundColor: '#0D47A1' },
    scroll: { padding: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    iconBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#64748B' },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, marginBottom: 24 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 48, gap: 10 },
    field: { flex: 1, fontSize: 15, color: '#1E293B' },
    otpRow: { flexDirection: 'row', gap: 10 },
    verifyBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', height: 48 },
    verifyBtnText: { fontSize: 12, fontWeight: '700', color: '#0D47A1' },
    mainBtn: { borderRadius: 16, overflow: 'hidden', width: '100%' },
    btnDisabled: { opacity: 0.6 },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    typeList: { gap: 16, paddingRight: 20, marginBottom: 20 },
    typeItem: { alignItems: 'center', width: 75 },
    typeIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    typeItemActive: {},
    typeIconActive: { backgroundColor: '#0D47A1' },
    typeLabelText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
    typeLabelActive: { color: '#0D47A1', fontWeight: '800' },
    formHeader: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
    docLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
    uploadedBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BAE6FD' },
    uploadedInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    fileName: { fontSize: 12, fontWeight: '600', color: '#0369A1' },
    fileSize: { fontSize: 10, color: '#0EA5E9' },
    uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', borderRadius: 12, padding: 16, alignItems: 'center', backgroundColor: '#F8FAFC' },
    uploadText: { fontSize: 13, fontWeight: '700', color: '#0D47A1', marginTop: 4 },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewVal: { fontSize: 14, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'right' },
    warningBox: { flexDirection: 'row', backgroundColor: '#FFF3CD', borderRadius: 14, padding: 16, marginBottom: 24, gap: 12 },
    warningText: { flex: 1, fontSize: 12, color: '#856404', fontWeight: '600' },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 30 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 },
    idValue: { fontSize: 24, fontWeight: '800', color: '#0D47A1' },
    toast: { position: 'absolute', bottom: 120, backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    toastText: { color: '#FFF', fontSize: 14 },
});
