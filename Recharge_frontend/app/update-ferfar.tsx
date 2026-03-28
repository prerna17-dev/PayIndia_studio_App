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

type FerfarCorrectionType = "applicant_name" | "mutation_year" | "mutation_reason" | "other";

interface UploadedFile {
    name: string;
    size: string;
    uri: string;
}

const REQUIRED_DOCS: Record<string, { id: string; label: string }[]> = {
    applicant_name: [{ id: "supporting_doc", label: "Identity Proof or Name Change Affidavit" }],
    mutation_year: [{ id: "supporting_doc", label: "Copy of Old Ferfar/Mutation Entry" }],
    mutation_reason: [{ id: "supporting_doc", label: "Relevant Legal Document for Change" }],
    other: [{ id: "supporting_doc", label: "Supporting Document" }],
};

export default function FerfarUpdateScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Section 1: Verify
    const [ferfarNumber, setFerfarNumber] = useState("");
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Section 2: Update Details
    const [selectedType, setSelectedType] = useState<FerfarCorrectionType | null>(null);
    const [correctedName, setCorrectedName] = useState("");
    const [correctedYear, setCorrectedYear] = useState("");
    const [correctedReason, setCorrectedReason] = useState("");
    const [otherDetails, setOtherDetails] = useState("");

    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [referenceId, setReferenceId] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

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
        if (!ferfarNumber) return Alert.alert("Error", "Enter Ferfar Number");

        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.post(
                API_ENDPOINTS.FERFAR_OTP_SEND,
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
                API_ENDPOINTS.FERFAR_OTP_VERIFY,
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
        if (!uploadedDocs.id_proof) return Alert.alert("Required", "Please upload ID Proof");
        if (!uploadedDocs.supporting_doc) return Alert.alert("Required", "Please upload proof for correction");

        setStep(3);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();
            data.append("ferfar_number", ferfarNumber);
            data.append("aadhaar_number", aadhaarNo.replace(/\s/g, ""));
            data.append("mobile_number", mobileNumber);
            data.append("correction_type", selectedType as string);

            if (correctedName) data.append("corrected_applicant_name", correctedName);
            if (correctedYear) data.append("corrected_mutation_year", correctedYear);
            if (correctedReason) data.append("corrected_mutation_reason", correctedReason);
            if (otherDetails) data.append("other_details", otherDetails);

            if (uploadedDocs.id_proof) {
                data.append("id_proof", { uri: uploadedDocs.id_proof.uri, name: uploadedDocs.id_proof.name, type: "application/pdf" } as any);
            }
            if (uploadedDocs.supporting_doc) {
                data.append("supporting_doc", { uri: uploadedDocs.supporting_doc.uri, name: uploadedDocs.supporting_doc.name, type: "application/pdf" } as any);
            }

            const res = await axios.post(API_ENDPOINTS.FERFAR_CORRECTION_SUBMIT, data, {
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

    if (isSubmitted) {
        return (
            <View style={s.root}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={s.successContainer}>
                    <View style={s.successIconCircle}><Ionicons name="checkmark-done-circle" size={80} color="#0D47A1" /></View>
                    <Text style={s.successTitle}>Correction Requested!</Text>
                    <Text style={s.successSubtitle}>Your Ferfar entry correction request has been submitted successfully.</Text>
                    <View style={s.idCard}>
                        <Text style={s.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <Text style={s.idValue}>{referenceId}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    Clipboard.setString(referenceId);
                                    setShowToast(true);
                                    setTimeout(() => setShowToast(false), 2000);
                                }}
                                style={{ padding: 4 }}
                            >
                                <Ionicons name="copy-outline" size={24} color="#0D47A1" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {showToast && (
                        <View style={s.toast}><Text style={s.toastText}>Reference ID Copied!</Text></View>
                    )}
                    <TouchableOpacity style={s.mainBtn} onPress={() => router.replace("/ferfar-services")}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                            <Text style={s.mainBtnText}>Return to Services</Text>
                            <Ionicons name="arrow-forward" size={24} color="#FFF" />
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
                        <Text style={s.headerTitle}>Ferfar (Mutation) Correction</Text>
                        <Text style={s.headerSubtitle}>Official ownership update</Text>
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

                        {step === 1 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={s.iconBadge}><Ionicons name="shield-checkmark" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Verification</Text>
                                        <Text style={s.sectionSub}>Verify existing Ferfar detail</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <Text style={s.inputLabel}>Ferfar Number *</Text>
                                    <InputGroup icon="document-text-outline" placeholder="Ex: 4521 or REF..." value={ferfarNumber} onChangeText={setFerfarNumber} />
                                    <Text style={s.inputLabel}>Applicant Aadhaar Number *</Text>
                                    <InputGroup icon="card-outline" placeholder="XXXX XXXX XXXX" keyboardType="numeric" maxLength={14} value={aadhaarNo} onChangeText={formatAadhaar} />
                                    <Text style={s.inputLabel}>Registered Mobile *</Text>
                                    <View style={s.otpRow}>
                                        <View style={{ flex: 1 }}><InputGroup icon="phone-portrait-outline" placeholder="10-digit mobile" keyboardType="numeric" maxLength={10} value={mobileNumber} onChangeText={setMobileNumber} /></View>
                                        <TouchableOpacity style={s.verifyBtn} onPress={handleSendOtp}><Text style={s.verifyBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text></TouchableOpacity>
                                    </View>
                                    {isOtpSent && <InputGroup label="Enter OTP *" icon="key-outline" placeholder="6 digit code" keyboardType="numeric" maxLength={6} value={otp} onChangeText={setOtp} />}
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

                        {step === 2 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#E0F2F1' }]}><Ionicons name="create" size={20} color="#007961" /></View>
                                    <View><Text style={s.sectionTitle}>Correction Selection</Text><Text style={s.sectionSub}>Select the field to update</Text></View>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeList}>
                                    {([
                                        { id: "applicant_name", label: "Applicant Name", icon: "person" },
                                        { id: "mutation_year", label: "Mutation Year", icon: "calendar" },
                                        { id: "mutation_reason", label: "Mutation Reason", icon: "help-circle" },
                                        { id: "other", label: "Other", icon: "ellipsis-horizontal" },
                                    ] as { id: FerfarCorrectionType; label: string; icon: string }[]).map((t) => (
                                        <TouchableOpacity key={t.id} style={[s.typeItem, selectedType === t.id && s.typeItemActive]} onPress={() => setSelectedType(t.id)}>
                                            <View style={[s.typeIcon, selectedType === t.id && s.typeIconActive]}><Ionicons name={t.icon as any} size={24} color={selectedType === t.id ? "#FFF" : "#64748B"} /></View>
                                            <Text style={[s.typeLabelText, selectedType === t.id && s.typeLabelActive]} numberOfLines={2}>{t.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                {selectedType && (
                                    <View style={s.card}>
                                        <Text style={s.formHeader}>Update Details</Text>
                                        {selectedType === "applicant_name" && <InputGroup label="Correct Name *" icon="person-outline" placeholder="Enter Full Name" value={correctedName} onChangeText={setCorrectedName} />}
                                        {selectedType === "mutation_year" && <InputGroup label="Correct Year *" icon="calendar-outline" placeholder="Ex: 2023" value={correctedYear} onChangeText={setCorrectedYear} keyboardType="numeric" maxLength={4} />}
                                        {selectedType === "mutation_reason" && <InputGroup label="Correct Reason *" icon="help-circle-outline" placeholder="Reason for mutation" value={correctedReason} onChangeText={setCorrectedReason} multiline style={{ height: 60 }} />}
                                        <InputGroup label="Additional Info" icon="document-text-outline" placeholder="Optional notes" value={otherDetails} onChangeText={setOtherDetails} multiline style={{ height: 60 }} />
                                    </View>
                                )}
                                <View style={s.card}>
                                    <Text style={s.formHeader}>Proofs</Text>
                                    <DocUpload label="ID Proof (Aadhaar/PAN) *" id="id_proof" file={uploadedDocs.id_proof} onUpload={handleFileUpload} onRemove={(id: string) => setUploadedDocs(p => { const n = { ...p }; delete n[id]; return n; })} />
                                    {selectedType && <DocUpload label="Correction Proof *" id="supporting_doc" file={uploadedDocs.supporting_doc} onUpload={handleFileUpload} onRemove={(id: string) => setUploadedDocs(p => { const n = { ...p }; delete n[id]; return n; })} />}
                                </View>

                                {!isKeyboardVisible && (
                                    <TouchableOpacity style={s.mainBtn} onPress={validateStep2}>
                                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}><Text style={s.mainBtnText}>Continue</Text><Ionicons name="arrow-forward" size={20} color="#FFF" /></LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {step === 3 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#F3E5F5' }]}><Ionicons name="eye" size={20} color="#7B1FA2" /></View>
                                    <View><Text style={s.sectionTitle}>Summary</Text><Text style={s.sectionSub}>Review before submission</Text></View>
                                </View>
                                <View style={s.card}>
                                    <ReviewRow label="Ferfar Number" value={ferfarNumber} />
                                    <ReviewRow label="Target Correction" value={selectedType?.replace('_', ' ').toUpperCase()} />
                                    <ReviewRow label="New Value" value={correctedName || correctedYear || "See Docs"} isGreen />
                                </View>

                                {!isKeyboardVisible && (
                                    <TouchableOpacity style={s.mainBtn} onPress={handleSubmit} disabled={isSubmitting}>
                                        <LinearGradient colors={['#2E7D32', '#388E3C']} style={s.btnGrad}>{isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={s.mainBtnText}>Submit Correction</Text>}</LinearGradient>
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
    <View style={{ marginBottom: 12 }}>
        {label && <Text style={s.inputLabel}>{label}</Text>}
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
                    <MaterialCommunityIcons name="file-document" size={20} color="#0D47A1" />
                    <View style={{ flex: 1 }}><Text style={s.fileName} numberOfLines={1}>{file.name}</Text></View>
                    <TouchableOpacity onPress={() => onRemove(id)}><Ionicons name="trash-outline" size={18} color="#D32F2F" /></TouchableOpacity>
                </View>
            </View>
        ) : (
            <TouchableOpacity style={s.uploadBox} onPress={() => onUpload(id)}><Ionicons name="cloud-upload-outline" size={20} color="#0D47A1" /><Text style={s.uploadText}>Upload</Text></TouchableOpacity>
        )}
    </View>
);

const ReviewRow = ({ label, value, isGreen }: any) => (
    <View style={s.reviewRow}><Text style={s.reviewLabel}>{label}</Text><Text style={[s.reviewVal, isGreen && { color: '#2E7D32' }]}>{value}</Text></View>
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
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, marginBottom: 20 },
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
    typeItem: { alignItems: 'center', width: 80 },
    typeItemActive: {},
    typeIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    typeIconActive: { backgroundColor: '#0D47A1' },
    typeLabelText: { fontSize: 10, fontWeight: '600', color: '#64748B', textAlign: 'center' },
    typeLabelActive: { color: '#0D47A1', fontWeight: '800' },
    formHeader: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
    docLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
    uploadedBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BAE6FD' },
    uploadedInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    fileName: { fontSize: 12, fontWeight: '600', color: '#0369A1' },
    uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', borderRadius: 12, padding: 12, alignItems: 'center', backgroundColor: '#F8FAFC', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    uploadText: { fontSize: 13, fontWeight: '700', color: '#0D47A1' },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewVal: { fontSize: 14, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'right' },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 30 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 25, width: '100%', alignItems: 'center', marginBottom: 35, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    idValue: { fontSize: 28, fontWeight: '900', color: '#0D47A1' },
    toast: { position: 'absolute', bottom: 120, backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    toastText: { color: '#FFF', fontSize: 14 },
});
