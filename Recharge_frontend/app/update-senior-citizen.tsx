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
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";

type UpdateType = "name" | "dob" | "address" | "photo";

interface UploadedFile {
    name: string;
    size: string;
    uri: string;
}

// Required documents per update type
const REQUIRED_DOCS: Record<string, { id: string; label: string }[]> = {
    name: [
        { id: "aadhaar_card", label: "Aadhaar Card (Corrected Name Proof)" },
        { id: "supporting_doc", label: "Government Photo ID (Passport/PAN)" },
    ],
    dob: [
        { id: "age_proof", label: "Birth Certificate or School Leaving Certificate" },
        { id: "aadhaar_card", label: "Aadhaar Card with correct DOB" },
    ],
    address: [
        { id: "address_proof", label: "Address Proof (Electricity/Water/Gas Bill)" },
        { id: "aadhaar_card", label: "Aadhaar Card with updated address" },
    ],
    photo: [
        { id: "photo", label: "Recent Passport Size Photograph" },
        { id: "aadhaar_card", label: "Aadhaar Card copy" },
    ],
};

export default function SeniorCitizenUpdateScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Section 1: Verification
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Section 2: Update Details
    const [selectedType, setSelectedType] = useState<UpdateType | null>(null);
    const [newName, setNewName] = useState("");
    const [newDob, setNewDob] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [newState, setNewState] = useState("");
    const [remarks, setRemarks] = useState("");

    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [refId, setRefId] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const backAction = () => {
            if (step > 1) { setStep(step - 1); return true; }
            else { router.back(); return true; }
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [step]);

    const formatDob = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = "";
        if (cleaned.length <= 2) formatted = cleaned;
        else if (cleaned.length <= 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        else formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 12)}`; 
        setNewDob(formatted);
    };

    const handleSendOtp = async () => {
        if (aadhaarNo.length !== 12) return Alert.alert("Error", "Enter valid 12-digit Aadhaar");
        if (mobileNumber.length !== 10) return Alert.alert("Error", "Enter valid 10-digit mobile");

        setIsVerifying(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.post(API_ENDPOINTS.SENIOR_CITIZEN_OTP_SEND, { 
                mobile_number: mobileNumber, 
                aadhaar_number: aadhaarNo 
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.data.success) {
                setIsOtpSent(true);
                Alert.alert("Success", "OTP sent to your registered mobile");
            } else {
                Alert.alert("Error", res.data.message || "Failed to send OTP");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return Alert.alert("Error", "Enter 6-digit OTP");
        setIsVerifying(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.post(API_ENDPOINTS.SENIOR_CITIZEN_OTP_VERIFY, { 
                mobile_number: mobileNumber, 
                otp: otp 
            }, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.data.success) {
                setStep(2);
            } else {
                Alert.alert("Error", "Invalid OTP code");
            }
        } catch (error: any) {
            Alert.alert("Error", "Verification service unavailable");
        } finally {
            setIsVerifying(false);
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

    const removeDoc = (docId: string) => {
        setUploadedDocs(prev => { const n = { ...prev }; delete n[docId]; return n; });
    };

    const validateStep2 = () => {
        if (!selectedType) return Alert.alert("Required", "Select correction type");
        const required = REQUIRED_DOCS[selectedType] || [];
        const missing = required.filter(d => !uploadedDocs[d.id]);
        
        if (selectedType === "name" && !newName) return Alert.alert("Required", "Enter corrected name");
        if (selectedType === "dob" && newDob.length < 10) return Alert.alert("Required", "Enter valid DOB");
        if (selectedType === "address" && (!newAddress || !newState)) return Alert.alert("Required", "Enter full address with state");

        if (missing.length > 0) {
            return Alert.alert("Incomplete", `Upload required files:\n${missing.map(m => "• " + m.label).join("\n")}`);
        }
        setStep(3);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();
            data.append("mobile_number", mobileNumber);
            data.append("aadhaar_number", aadhaarNo);
            data.append("correction_type", selectedType as string);
            data.append("other_details", remarks);

            if (newName) data.append("corrected_name", newName);
            if (newDob) data.append("corrected_dob", newDob);
            if (newAddress) data.append("corrected_address", newAddress);
            if (newState) data.append("corrected_state", newState);

            // Document mapping
            Object.keys(uploadedDocs).forEach(key => {
                const doc = uploadedDocs[key];
                data.append(key, { uri: doc.uri, name: doc.name, type: "application/pdf" } as any);
            });

            const res = await axios.post(API_ENDPOINTS.SENIOR_CITIZEN_CORRECTION_SUBMIT, data, {
                headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setRefId(res.data.data.reference_id);
                setIsSubmitted(true);
            } else {
                Alert.alert("Failed", res.data.message);
            }
        } catch (err: any) {
            Alert.alert("Error", "Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(refId);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    if (isSubmitted) {
        return (
            <View style={s.root}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={s.successContainer}>
                    <View style={s.successIconCircle}><Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" /></View>
                    <Text style={s.successTitle}>Correction Submitted!</Text>
                    <Text style={s.successSubtitle}>Your request for Senior Citizen Certificate correction has been received.</Text>
                    <View style={s.idCard}>
                        <Text style={s.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text style={s.idValue}>{refId}</Text>
                            <TouchableOpacity onPress={copyToClipboard}><Ionicons name="copy-outline" size={22} color="#0D47A1"/></TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={s.mainBtn} onPress={() => router.replace('/senior-citizen-services')}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                            <Text style={s.mainBtnText}>Return to Services</Text>
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
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={s.headerContent}>
                        <Text style={s.headerTitle}>Correction Request</Text>
                        <Text style={s.headerSubtitle}>Senior Citizen Certificate</Text>
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
                                <Text style={[s.stepLabel, step >= i && s.stepLabelActive]}>{i === 1 ? "Verify" : i === 2 ? "Update" : "Confirm"}</Text>
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
                                    <View style={s.iconBadge}><Ionicons name="card" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Identification</Text>
                                        <Text style={s.sectionSub}>Enter registered Aadhaar & Mobile</Text>
                                    </View>
                                </View>
                                <View style={s.card}>
                                    <Text style={s.inputLabel}>Aadhaar Number *</Text>
                                    <View style={s.inputRow}>
                                        <Ionicons name="person-outline" size={18} color="#64748B" />
                                        <TextInput style={s.field} placeholder="Enter 12-digit Aadhaar" keyboardType="numeric" maxLength={12} value={aadhaarNo} onChangeText={setAadhaarNo} editable={!isOtpSent} />
                                    </View>
                                    <Text style={[s.inputLabel, { marginTop: 15 }]}>Mobile Number *</Text>
                                    <View style={s.otpRow}>
                                        <View style={[s.inputRow, { flex: 1 }]}>
                                            <Ionicons name="phone-portrait-outline" size={18} color="#64748B" />
                                            <TextInput style={s.field} placeholder="Registered mobile" keyboardType="numeric" maxLength={10} value={mobileNumber} onChangeText={setMobileNumber} editable={!isOtpSent} />
                                        </View>
                                        <TouchableOpacity style={s.verifyBtn} onPress={handleSendOtp} disabled={isVerifying}>
                                            <Text style={s.verifyBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {isOtpSent && (
                                        <View style={{ marginTop: 15 }}>
                                            <Text style={s.inputLabel}>Verification OTP *</Text>
                                            <View style={s.inputRow}>
                                                <Ionicons name="lock-closed-outline" size={18} color="#64748B" />
                                                <TextInput style={s.field} placeholder="Enter 6-digit code" keyboardType="numeric" maxLength={6} value={otp} onChangeText={setOtp} />
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity style={[s.mainBtn, (!isOtpSent || otp.length < 6) && s.btnDisabled]} disabled={!isOtpSent || isVerifying} onPress={handleVerifyOtp}>
                                    <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                        <Text style={s.mainBtnText}>Verify & Proceed</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 2 && (
                            <View>
                                <Text style={s.cardTitle}>Correction Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeList}>
                                    {([
                                        { id: "name", label: "Name", icon: "person" },
                                        { id: "dob", label: "DOB", icon: "calendar" },
                                        { id: "address", label: "Address", icon: "home" },
                                        { id: "photo", label: "Photo", icon: "camera" }
                                    ] as { id: UpdateType; label: string; icon: string }[]).map(t => (
                                        <TouchableOpacity key={t.id} style={[s.typeItem, selectedType === t.id && s.typeItemActive]} onPress={() => setSelectedType(t.id)}>
                                            <View style={[s.typeIcon, selectedType === t.id && s.typeIconActive]}>
                                                <Ionicons name={t.icon as any} size={22} color={selectedType === t.id ? "#FFF" : "#64748B"} />
                                            </View>
                                            <Text style={[s.typeLabelText, selectedType === t.id && s.typeLabelActive]}>{t.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {selectedType && (
                                    <View>
                                        <View style={s.card}>
                                            <Text style={s.formHeader}>Correction Details</Text>
                                            {selectedType === "name" && (
                                                <View>
                                                    <Text style={s.inputLabel}>Correct Full Name *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="Correct Name" value={newName} onChangeText={setNewName} /></View>
                                                </View>
                                            )}
                                            {selectedType === "dob" && (
                                                <View>
                                                    <Text style={s.inputLabel}>Correct DOB *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="DD/MM/YYYY" value={newDob} onChangeText={formatDob} keyboardType="numeric" maxLength={10} /></View>
                                                </View>
                                            )}
                                            {selectedType === "address" && (
                                                <View>
                                                    <Text style={s.inputLabel}>New Address Details *</Text>
                                                    <View style={[s.inputRow, { height: 70 }]}><TextInput style={s.field} placeholder="Full Address" multiline value={newAddress} onChangeText={setNewAddress} /></View>
                                                    <Text style={[s.inputLabel, { marginTop: 15 }]}>State *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="State" value={newState} onChangeText={setNewState} /></View>
                                                </View>
                                            )}
                                            {selectedType === "photo" && (
                                                <Text style={s.infoText}>Please upload a recent passport size photograph below.</Text>
                                            )}
                                            <Text style={[s.inputLabel, { marginTop: 15 }]}>Special Remarks</Text>
                                            <View style={[s.inputRow, { height: 60 }]}><TextInput style={s.field} placeholder="Optional notes" multiline value={remarks} onChangeText={setRemarks} /></View>
                                        </View>

                                        <View style={s.card}>
                                            <Text style={s.formHeader}>Required Proofs</Text>
                                            {(REQUIRED_DOCS[selectedType] || []).map(doc => {
                                                const uploaded = uploadedDocs[doc.id];
                                                return (
                                                    <View key={doc.id} style={s.docCard}>
                                                        {uploaded ? (
                                                            <View style={s.uploadedInfo}>
                                                                <Ionicons name="document-text" size={24} color="#0D47A1" />
                                                                <View style={{ flex: 1 }}>
                                                                    <Text style={s.fileName} numberOfLines={1}>{uploaded.name}</Text>
                                                                    <Text style={s.fileSize}>{uploaded.size}</Text>
                                                                </View>
                                                                <TouchableOpacity onPress={() => removeDoc(doc.id)}><Ionicons name="trash-outline" size={20} color="#D32F2F" /></TouchableOpacity>
                                                            </View>
                                                        ) : (
                                                            <TouchableOpacity style={s.uploadBox} onPress={() => handleFileUpload(doc.id)}>
                                                                <Ionicons name="cloud-upload" size={24} color="#0D47A1" />
                                                                <Text style={s.uploadText}>{doc.label}</Text>
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                        <TouchableOpacity style={s.mainBtn} onPress={validateStep2}>
                                            <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}><Text style={s.mainBtnText}>Confirm Updates</Text></LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        {step === 3 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#F3E5F5' }]}><Ionicons name="eye" size={20} color="#7B1FA2" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Final Verification</Text>
                                        <Text style={s.sectionSub}>Review your correction summary</Text>
                                    </View>
                                </View>
                                <View style={s.card}>
                                    <ReviewRow label="Aadhaar" value={aadhaarNo} />
                                    <ReviewRow label="Correction Type" value={selectedType?.toUpperCase()} blue />
                                    {newName && <ReviewRow label="New Name" value={newName} />}
                                    {newDob && <ReviewRow label="New DOB" value={newDob} />}
                                    {newAddress && <ReviewRow label="New Address" value={`${newAddress}, ${newState}`} />}
                                    <ReviewRow label="Documents" value={`${Object.keys(uploadedDocs).length} Files`} green />
                                </View>
                                <TouchableOpacity style={s.mainBtn} onPress={handleSubmit} disabled={isSubmitting}>
                                    <LinearGradient colors={['#1B5E20', '#2E7D32']} style={s.btnGrad}>
                                        {isSubmitting ? <ActivityIndicator color="#FFF" /> : <><Text style={s.mainBtnText}>Confirm & Submit</Text><Ionicons name="checkmark-done" size={20} color="#FFF" /></>}
                                    </LinearGradient>
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

const ReviewRow = ({ label, value, blue, green }: any) => (
    <View style={s.reviewRow}>
        <Text style={s.reviewLabel}>{label}</Text>
        <Text style={[s.reviewVal, blue && { color: "#0D47A1" }, green && { color: "#2E7D32" }]}>{value}</Text>
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
    stepCircleDone: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    stepNum: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
    stepNumActive: { color: '#0D47A1' },
    stepLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#0D47A1' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: -10, marginTop: -15 },
    stepLineDone: { backgroundColor: '#2E7D32' },
    scroll: { padding: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    iconBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#64748B' },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 20 },
    cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 15, paddingLeft: 5 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, paddingLeft: 4 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 15, height: 50 },
    field: { flex: 1, fontSize: 15, color: '#1E293B', marginLeft: 10 },
    otpRow: { flexDirection: 'row', gap: 10 },
    verifyBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 15, borderRadius: 12, justifyContent: 'center' },
    verifyBtnText: { fontSize: 12, fontWeight: '800', color: '#0D47A1' },
    mainBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10 },
    btnGrad: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
    mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
    btnDisabled: { opacity: 0.6 },
    typeList: { gap: 15, paddingBottom: 25 },
    typeItem: { alignItems: 'center', width: 75 },
    typeItemActive: { opacity: 1 },
    typeIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    typeIconActive: { backgroundColor: '#0D47A1' },
    typeLabelText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
    typeLabelActive: { color: '#0D47A1', fontWeight: '800' },
    formHeader: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
    docCard: { marginBottom: 15 },
    uploadedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD', gap: 10 },
    fileName: { fontSize: 13, fontWeight: '600', color: '#0D47A1' },
    fileSize: { fontSize: 11, color: '#0D47A1', opacity: 0.7 },
    uploadBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#CBD5E1', gap: 10 },
    uploadText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    infoText: { fontSize: 14, color: '#64748B', lineHeight: 20 },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewVal: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFF' },
    successIconCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    successTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginVertical: 15, lineHeight: 22 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 25, width: '100%', alignItems: 'center', marginVertical: 30, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    idValue: { fontSize: 26, fontWeight: '900', color: '#0D47A1' },
});
