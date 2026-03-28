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
    Clipboard,
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

interface DocumentType {
    name: string;
    uri: string;
}

export default function PMKisanUpdateScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Section 1: Verify
    const [aadhaarNumber, setAadhaarNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Section 2: Update Details
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [correctedName, setCorrectedName] = useState("");
    const [correctedBank, setCorrectedBank] = useState("");
    const [correctedLand, setCorrectedLand] = useState("");
    const [otherDetails, setOtherDetails] = useState("");

    const [uploadedDocs, setUploadedDocs] = useState<Record<string, DocumentType>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [referenceId, setReferenceId] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const backAction = () => {
            if (step > 1 && !isSubmitted) { setStep(step - 1); return true; }
            else { router.back(); return true; }
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [step, isSubmitted]);

    const formatAadhaar = (text: string) => {
        const cleaned = text.replace(/\s/g, "");
        let formatted = "";
        for (let i = 0; i < cleaned.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += " ";
            formatted += cleaned[i];
        }
        setAadhaarNumber(formatted);
    };

    const handleSendOtp = async () => {
        const cleanAadhaar = aadhaarNumber.replace(/\s/g, "");
        if (cleanAadhaar.length !== 12) return Alert.alert("Error", "Enter valid 12-digit Aadhaar");
        if (mobileNumber.length !== 10) return Alert.alert("Error", "Enter valid 10-digit mobile");

        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.post(
                API_ENDPOINTS.PM_KISAN_OTP_SEND,
                { mobileNumber, aadhaarNumber: cleanAadhaar, type: 'update' },
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
                API_ENDPOINTS.PM_KISAN_OTP_VERIFY,
                { mobileNumber, otp },
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
            Alert.alert("Error", error.response?.data?.message || "Verification failed");
        }
    };

    const handleFileUpload = async (docId: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"] });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                setUploadedDocs(prev => ({ ...prev, [docId]: { name: asset.name, uri: asset.uri } }));
            }
        } catch (err) { Alert.alert("Error", "Failed to upload document"); }
    };

    const validateStep2 = () => {
        if (!selectedType) return Alert.alert("Required", "Please select a correction type");
        setStep(3);
    };

    const validateStep3 = () => {
        if (!uploadedDocs.id_proof) return Alert.alert("Required", "Please upload ID Proof (Aadhaar)");
        if (!uploadedDocs.supporting_doc) return Alert.alert("Required", "Please upload Correction Proof");
        setStep(4);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();
            data.append("mobile_number", mobileNumber);
            data.append("aadhaar_number", aadhaarNumber.replace(/\s/g, ""));
            data.append("correction_type", selectedType as string);
            data.append("other_details", otherDetails);

            if (correctedName) data.append("corrected_name", correctedName);
            if (correctedBank) data.append("corrected_bank", correctedBank);
            if (correctedLand) data.append("corrected_land", correctedLand);

            if (uploadedDocs.id_proof) {
                data.append("id_proof", { uri: uploadedDocs.id_proof.uri, name: uploadedDocs.id_proof.name, type: "application/pdf" } as any);
            }
            if (uploadedDocs.supporting_doc) {
                data.append("supporting_doc", { uri: uploadedDocs.supporting_doc.uri, name: uploadedDocs.supporting_doc.name, type: "application/pdf" } as any);
            }

            const res = await axios.post(API_ENDPOINTS.PM_KISAN_CORRECTION_SUBMIT, data, {
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
            <View style={styles.root}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconCircle}><Ionicons name="checkmark-done-circle" size={80} color="#1565C0" /></View>
                    <Text style={styles.successTitle}>Update Requested!</Text>
                    <Text style={styles.successSubtitle}>Your request for PM-KISAN details update has been submitted successfully.</Text>
                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <Text style={styles.idValue}>{referenceId}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    Clipboard.setString(referenceId);
                                    setShowToast(true);
                                    setTimeout(() => setShowToast(false), 2000);
                                }}
                                style={{ padding: 4 }}
                            >
                                <Ionicons name="copy-outline" size={24} color="#1565C0" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {showToast && (
                        <View style={styles.toast}><Text style={styles.toastText}>Reference ID Copied!</Text></View>
                    )}
                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/pm-kisan-services")}>
                        <LinearGradient colors={['#1565C0', '#0D47A1']} style={styles.btnGrad}>
                            <Text style={styles.mainBtnText}>Return to Services</Text>
                            <Ionicons name="arrow-forward" size={24} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Update Family Details</Text>
                        <Text style={styles.headerSubtitle}>PM-KISAN Samman Nidhi</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Step Indicator */}
                <View style={styles.stepContainer}>
                    {[1, 2, 3, 4].map((i) => (
                        <React.Fragment key={i}>
                            <View style={styles.stepItem}>
                                <View style={[styles.stepCircle, step >= i && styles.stepCircleActive, step > i && styles.stepCircleDone]}>
                                    {step > i ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[styles.stepNum, step >= i && styles.stepNumActive]}>{i}</Text>}
                                </View>
                                <Text style={[styles.stepLabel, step >= i && styles.stepLabelActive]}>
                                    {i === 1 ? "Verify" : i === 2 ? "Select" : i === 3 ? "Update" : "Confirm"}
                                </Text>
                            </View>
                            {i < 4 && <View style={[styles.stepLine, step > i && styles.stepLineDone]} />}
                        </React.Fragment>
                    ))}
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                        {step === 1 && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.iconBadge}><Ionicons name="shield-checkmark" size={20} color="#1565C0" /></View>
                                    <View>
                                        <Text style={styles.sectionTitle}>Verification</Text>
                                        <Text style={styles.sectionSub}>Verify identity via registered mobile</Text>
                                    </View>
                                </View>

                                <View style={styles.card}>
                                    <Text style={styles.inputLabel}>Registered Mobile Number *</Text>
                                    <InputGroup icon="phone-portrait-outline" placeholder="10-digit mobile" keyboardType="numeric" maxLength={10} value={mobileNumber} onChangeText={setMobileNumber} editable={!isOtpSent} />
                                    
                                    <Text style={styles.inputLabel}>Aadhaar Number *</Text>
                                    <View style={styles.otpRow}>
                                        <View style={{ flex: 1 }}><InputGroup icon="card-outline" placeholder="XXXX XXXX XXXX" keyboardType="numeric" maxLength={14} value={aadhaarNumber} onChangeText={formatAadhaar} editable={!isOtpSent} /></View>
                                        <TouchableOpacity 
                                            style={[styles.verifyBtn, isOtpSent && { opacity: 0.6 }]} 
                                            onPress={handleSendOtp}
                                            disabled={isOtpSent}
                                        >
                                            <Text style={styles.verifyBtnText}>{isOtpSent ? "Sent" : "Send OTP"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {isOtpSent && <InputGroup label="Enter OTP *" icon="key-outline" placeholder="6 digit code" keyboardType="numeric" maxLength={6} value={otp} onChangeText={setOtp} />}
                                </View>

                                <TouchableOpacity style={[styles.mainBtn, !isOtpSent && styles.btnDisabled]} disabled={!isOtpSent || isVerifying} onPress={handleVerifyOtp}>
                                    <LinearGradient colors={['#1565C0', '#0D47A1']} style={styles.btnGrad}>
                                        {isVerifying ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>Verify & Proceed</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 2 && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.iconBadge, { backgroundColor: '#E0F2F1' }]}><Ionicons name="options" size={20} color="#007961" /></View>
                                    <View><Text style={styles.sectionTitle}>Correction Selection</Text><Text style={styles.sectionSub}>Select the field you want to update</Text></View>
                                </View>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeList}>
                                    {([
                                        { id: "mobile", label: "Mobile Number", icon: "phone-portrait" },
                                        { id: "aadhaar", label: "Aadhaar Name", icon: "card" },
                                        { id: "bank", label: "Bank Account", icon: "business" },
                                        { id: "land", label: "Land Record", icon: "map" },
                                    ]).map((t) => (
                                        <TouchableOpacity key={t.id} style={[styles.typeItem, selectedType === t.id && styles.typeItemActive]} onPress={() => setSelectedType(t.id)}>
                                            <View style={[styles.typeIcon, selectedType === t.id && styles.typeIconActive]}><Ionicons name={t.icon as any} size={24} color={selectedType === t.id ? "#FFF" : "#64748B"} /></View>
                                            <Text style={[styles.typeLabelText, selectedType === t.id && styles.typeLabelActive]} numberOfLines={2}>{t.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                
                                <TouchableOpacity style={[styles.mainBtn, !selectedType && styles.btnDisabled]} disabled={!selectedType} onPress={validateStep2}>
                                    <LinearGradient colors={['#1565C0', '#0D47A1']} style={styles.btnGrad}><Text style={styles.mainBtnText}>Continue</Text><Ionicons name="arrow-forward" size={20} color="#FFF" /></LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 3 && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.iconBadge, { backgroundColor: '#F3E5F5' }]}><Ionicons name="create" size={20} color="#7B1FA2" /></View>
                                    <View><Text style={styles.sectionTitle}>Update Details</Text><Text style={styles.sectionSub}>Enter correct values and upload proofs</Text></View>
                                </View>
                                <View style={styles.card}>
                                    {selectedType === "mobile" && <InputGroup label="New Mobile Number *" icon="phone-portrait-outline" placeholder="Enter 10-digit mobile" value={otherDetails} onChangeText={setOtherDetails} keyboardType="numeric" maxLength={10} />}
                                    {selectedType === "aadhaar" && <InputGroup label="Correct Name as per Aadhaar *" icon="person-outline" placeholder="Enter Full Name" value={correctedName} onChangeText={setCorrectedName} />}
                                    {selectedType === "bank" && <InputGroup label="Correct Bank Account Info *" icon="business-outline" placeholder="Bank Name / IFSC / Acc No" value={correctedBank} onChangeText={setCorrectedBank} multiline style={{ height: 60 }} />}
                                    {selectedType === "land" && <InputGroup label="Correct Land Record Info *" icon="map-outline" placeholder="Survey No / Area" value={correctedLand} onChangeText={setCorrectedLand} multiline style={{ height: 60 }} />}
                                    <InputGroup label="Additional Remarks" icon="document-text-outline" placeholder="Optional notes" value={otherDetails} onChangeText={setOtherDetails} multiline style={{ height: 60 }} />
                                </View>
                                <View style={styles.card}>
                                    <Text style={styles.formHeader}>Required Documents</Text>
                                    <DocUpload label="Aadhaar Card (ID Proof) *" id="id_proof" file={uploadedDocs.id_proof} onUpload={handleFileUpload} onRemove={(id: string) => setUploadedDocs(p => { const n = { ...p }; delete n[id]; return n; })} />
                                    <DocUpload label="Supporting Proof for Correction *" id="supporting_doc" file={uploadedDocs.supporting_doc} onUpload={handleFileUpload} onRemove={(id: string) => setUploadedDocs(p => { const n = { ...p }; delete n[id]; return n; })} />
                                </View>

                                <TouchableOpacity style={styles.mainBtn} onPress={validateStep3}>
                                    <LinearGradient colors={['#1565C0', '#0D47A1']} style={styles.btnGrad}><Text style={styles.mainBtnText}>Continue to Review</Text><Ionicons name="arrow-forward" size={20} color="#FFF" /></LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 4 && (
                            <View>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.iconBadge, { backgroundColor: '#FBE9E7' }]}><Ionicons name="eye" size={20} color="#D84315" /></View>
                                    <View><Text style={styles.sectionTitle}>Review Summary</Text><Text style={styles.sectionSub}>Check all details before final submit</Text></View>
                                </View>
                                <View style={styles.card}>
                                    <ReviewRow label="Update Type" value={selectedType?.toUpperCase()} />
                                    <ReviewRow label="Registration Mobile" value={mobileNumber} />
                                    <ReviewRow label="Correction Proof" value={uploadedDocs.supporting_doc?.name} isGreen />
                                    {correctedName && <ReviewRow label="New Name" value={correctedName} />}
                                    {correctedBank && <ReviewRow label="Bank Info" value={correctedBank} />}
                                    {correctedLand && <ReviewRow label="Land Info" value={correctedLand} />}
                                </View>

                                <TouchableOpacity style={styles.mainBtn} onPress={handleSubmit} disabled={isSubmitting}>
                                    <LinearGradient colors={['#2E7D32', '#1B5E20']} style={styles.btnGrad}>{isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.mainBtnText}>Confirm & Submit Request</Text>}</LinearGradient>
                                </TouchableOpacity>
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
        {label && <Text style={styles.inputLabel}>{label}</Text>}
        <View style={[styles.inputRow, props.multiline && { height: 80, alignItems: 'flex-start', paddingTop: 10 }, props.editable === false && { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name={icon} size={18} color="#64748B" />
            <TextInput style={[styles.field, props.multiline && { textAlignVertical: 'top' }]} placeholderTextColor="#94A3B8" {...props} />
        </View>
    </View>
);

const DocUpload = ({ label, id, file, onUpload, onRemove }: any) => (
    <View style={{ marginBottom: 12 }}>
        <Text style={styles.docLabel}>{label}</Text>
        {file ? (
            <View style={styles.uploadedBox}>
                <View style={styles.uploadedInfo}>
                    <MaterialCommunityIcons name="file-document" size={20} color="#1565C0" />
                    <View style={{ flex: 1 }}><Text style={styles.fileName} numberOfLines={1}>{file.name}</Text></View>
                    <TouchableOpacity onPress={() => onRemove(id)}><Ionicons name="trash-outline" size={18} color="#D32F2F" /></TouchableOpacity>
                </View>
            </View>
        ) : (
            <TouchableOpacity style={styles.uploadBox} onPress={() => onUpload(id)}><Ionicons name="cloud-upload-outline" size={20} color="#1565C0" /><Text style={styles.uploadText}>Upload Document</Text></TouchableOpacity>
        )}
    </View>
);

const ReviewRow = ({ label, value, isGreen }: any) => (
    <View style={styles.reviewRow}><Text style={styles.reviewLabel}>{label}</Text><Text style={[styles.reviewVal, isGreen && { color: '#2E7D32' }]}>{value}</Text></View>
);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    safe: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFF" },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerContent: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },
    stepContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, paddingVertical: 20, backgroundColor: '#FFF' },
    stepItem: { alignItems: 'center', zIndex: 2 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
    stepCircleActive: { borderColor: '#1565C0' },
    stepCircleDone: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
    stepNum: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
    stepNumActive: { color: '#1565C0' },
    stepLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#1565C0' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: -10, marginTop: -15 },
    stepLineDone: { backgroundColor: '#1565C0' },
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
    verifyBtn: { backgroundColor: '#1565C0', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', height: 48 },
    verifyBtnText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
    mainBtn: { borderRadius: 16, overflow: 'hidden', width: '100%' },
    btnDisabled: { opacity: 0.6 },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    typeList: { gap: 16, paddingRight: 20, marginBottom: 20 },
    typeItem: { alignItems: 'center', width: 85 },
    typeItemActive: {},
    typeIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    typeIconActive: { backgroundColor: '#1565C0' },
    typeLabelText: { fontSize: 10, fontWeight: '600', color: '#64748B', textAlign: 'center' },
    typeLabelActive: { color: '#1565C0', fontWeight: '800' },
    formHeader: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
    docLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
    uploadedBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BAE6FD' },
    uploadedInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    fileName: { fontSize: 12, fontWeight: '600', color: '#0369A1' },
    uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', borderRadius: 12, padding: 12, alignItems: 'center', backgroundColor: '#F8FAFC', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    uploadText: { fontSize: 13, fontWeight: '700', color: '#1565C0' },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewVal: { fontSize: 14, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'right' },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 35, lineHeight: 22 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 25, width: '100%', alignItems: 'center', marginBottom: 35, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: '700' },
    idValue: { fontSize: 28, fontWeight: '900', color: '#1565C0' },
    toast: { position: 'absolute', bottom: 120, backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, zIndex: 100 },
    toastText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});
