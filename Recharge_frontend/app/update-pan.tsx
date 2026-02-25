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

interface UploadedFile {
    name: string;
    size: string;
    uri: string;
}

type CorrectionType = 'name' | 'dob' | 'father' | 'contact' | 'address' | 'photo';

// Required documents per correction type
const REQUIRED_DOCS: Record<CorrectionType, { id: string; label: string }[]> = {
    name: [
        { id: "nameProof", label: "Proof of Name (Passport / Voter ID / Driving License)" },
        { id: "nameId", label: "Identity Proof (Aadhaar Card)" },
    ],
    dob: [
        { id: "dobProof", label: "Proof of Date of Birth (Birth Certificate / School Leaving Certificate / Passport)" },
    ],
    father: [
        { id: "fatherProof", label: "Father's Identity Proof (Passport / Voter ID)" },
        { id: "fatherDeclare", label: "Affidavit / Declaration for Father's Name" },
    ],
    contact: [
        { id: "contactProof", label: "Proof of Updated Contact / Address" },
    ],
    address: [
        { id: "addressProof", label: "Proof of New Address (Utility Bill / Bank Statement)" },
        { id: "addressId", label: "Identity Proof at New Address (Aadhaar / Voter ID)" },
    ],
    photo: [
        { id: "photoPassport", label: "Recent Passport Size Photograph (2 copies)" },
        { id: "photoId", label: "Identity Proof (Aadhaar / Voter ID)" },
    ],
};



const CORRECTION_TYPES = [
    { id: 'name' as CorrectionType, label: 'Full Name', icon: 'account' },
    { id: 'dob' as CorrectionType, label: 'Date of Birth', icon: 'calendar' },
    { id: 'father' as CorrectionType, label: "Father's Name", icon: 'account-multiple' },
    { id: 'contact' as CorrectionType, label: 'Contact Details', icon: 'phone' },
    { id: 'address' as CorrectionType, label: 'Address', icon: 'map-marker' },
    { id: 'photo' as CorrectionType, label: 'Photo/Sign', icon: 'camera' },
];

export default function PANCorrectionScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Step 1
    const [panNumber, setPanNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Step 2 - single selection only
    const [selectedType, setSelectedType] = useState<CorrectionType | null>(null);
    const [newName, setNewName] = useState("");
    const [newDob, setNewDob] = useState("");
    const [newFatherName, setNewFatherName] = useState("");
    const [newContact, setNewContact] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    useEffect(() => {
        const backAction = () => {
            if (step > 1) { setStep(step - 1); return true; }
            router.back();
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [step]);

    // Reset docs when type changes
    useEffect(() => {
        setUploadedDocs({});
        setNewName(""); setNewDob(""); setNewFatherName(""); setNewContact(""); setNewAddress("");
    }, [selectedType]);

    const handleSendOtp = () => {
        if (panNumber.length !== 10 || mobileNumber.length !== 10) return Alert.alert("Error", "Enter valid PAN and Mobile number");
        setIsOtpSent(true);
        Alert.alert("OTP Sent", "Verification code sent to your mobile");
    };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) return Alert.alert("Error", "Enter 6-digit OTP");
        setIsVerifying(true);
        setTimeout(() => { setIsVerifying(false); setStep(2); }, 1200);
    };

    const handleFileUpload = async (docId: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/*"] });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                if (asset.size && asset.size > 5 * 1024 * 1024) return Alert.alert("Too Large", "Max file size is 5MB");
                const sizeInMb = asset.size ? (asset.size / (1024 * 1024)).toFixed(1) : "0.5";
                setUploadedDocs(prev => ({ ...prev, [docId]: { name: asset.name, size: `${sizeInMb} MB`, uri: asset.uri } }));
            }
        } catch (err) { Alert.alert("Error", "Failed to upload document"); }
    };

    const removeDoc = (docId: string) => {
        setUploadedDocs(prev => { const n = { ...prev }; delete n[docId]; return n; });
    };

    const validateStep2 = () => {
        if (!selectedType) return Alert.alert("Required", "Select a correction type");

        if (selectedType === 'name' && !newName) return Alert.alert("Required", "Enter corrected name");
        if (selectedType === 'dob' && !newDob) return Alert.alert("Required", "Enter corrected date of birth");
        if (selectedType === 'father' && !newFatherName) return Alert.alert("Required", "Enter corrected father's name");

        const requiredDocs = REQUIRED_DOCS[selectedType] || [];
        const missingDocs = requiredDocs.filter(d => !uploadedDocs[d.id]);
        if (missingDocs.length > 0) {
            return Alert.alert("Required", `Please upload:\n${missingDocs.map(d => "• " + d.label).join("\n")}`);
        }

        setStep(3);
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const refId = "PAN" + Math.random().toString(36).substr(2, 9).toUpperCase();
            setApplicationId(refId);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    const getNewValue = () => {
        switch (selectedType) {
            case 'name': return newName;
            case 'dob': return newDob;
            case 'father': return newFatherName;
            case 'contact': return newContact;
            case 'address': return newAddress;
            case 'photo': return "New photo submitted";
            default: return "";
        }
    };

    const renderDocumentUploads = () => {
        if (!selectedType) return null;
        const docs = REQUIRED_DOCS[selectedType] || [];
        return (
            <View style={{ marginTop: 20 }}>
                <Text style={s.docSectionTitle}>Required Documents</Text>
                {docs.map((doc) => {
                    const uploaded = uploadedDocs[doc.id];
                    return (
                        <View key={doc.id} style={s.docCard}>
                            <View style={s.docLabelRow}>
                                <Ionicons name="document-text-outline" size={18} color="#0D47A1" />
                                <Text style={s.docLabel}>{doc.label}</Text>
                            </View>
                            {uploaded ? (
                                <View style={s.uploadedBox}>
                                    <View style={s.uploadedInfo}>
                                        <MaterialCommunityIcons name="file-document" size={22} color="#0D47A1" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.fileName} numberOfLines={1}>{uploaded.name}</Text>
                                            <Text style={s.fileSize}>{uploaded.size}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => removeDoc(doc.id)}>
                                            <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity style={s.uploadBox} onPress={() => handleFileUpload(doc.id)}>
                                    <Ionicons name="cloud-upload-outline" size={26} color="#0D47A1" />
                                    <Text style={s.uploadText}>Tap to Upload</Text>
                                    <Text style={s.uploadSub}>PDF or Image (Max 5MB)</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>
        );
    };

    if (isSubmitted) {
        return (
            <View style={s.root}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={s.successContainer}>
                    <View style={s.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={s.successTitle}>Request Submitted!</Text>
                    <Text style={s.successSubtitle}>Your PAN correction request has been received successfully.</Text>

                    <View style={s.idCard}>
                        <Text style={s.idLabel}>Reference ID</Text>
                        <Text style={s.idValue}>{applicationId}</Text>
                    </View>

                    <View style={s.successActions}>
                        <TouchableOpacity style={s.actionBtn}>
                            <View style={[s.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="download-outline" size={24} color="#0D47A1" />
                            </View>
                            <Text style={s.actionText}>Download{"\n"}Receipt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={s.actionBtn}>
                            <View style={[s.actionIcon, { backgroundColor: '#F1F8E9' }]}>
                                <Ionicons name="time-outline" size={24} color="#2E7D32" />
                            </View>
                            <Text style={s.actionText}>Track{"\n"}Status</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={s.mainBtn} onPress={() => router.replace("/pan-card-services")}>
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
                {/* Header - plain back arrow, no circle */}
                <View style={s.header}>
                    <TouchableOpacity style={s.backBtn} onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={s.headerContent}>
                        <Text style={s.headerTitle}>PAN Correction</Text>
                        <Text style={s.headerSubtitle}>Official PAN data update</Text>
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
                                    {i === 1 ? "Verify" : i === 2 ? "Correct" : "Confirm"}
                                </Text>
                            </View>
                            {i < 3 && <View style={[s.stepLine, step > i && s.stepLineDone]} />}
                        </React.Fragment>
                    ))}
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={s.iconBadge}><Ionicons name="shield-checkmark" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Verification Details</Text>
                                        <Text style={s.sectionSub}>Verify your existing PAN records</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <Text style={s.inputLabel}>PAN Number *</Text>
                                    <View style={s.inputRow}>
                                        <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#64748B" />
                                        <TextInput style={s.field} placeholder="ABCDE1234F" autoCapitalize="characters" maxLength={10} value={panNumber} onChangeText={setPanNumber} />
                                    </View>

                                    <Text style={[s.inputLabel, { marginTop: 16 }]}>Registered Mobile *</Text>
                                    <View style={s.otpRow}>
                                        <View style={[s.inputRow, { flex: 1 }]}>
                                            <Ionicons name="phone-portrait-outline" size={20} color="#64748B" />
                                            <TextInput style={s.field} placeholder="10-digit mobile" keyboardType="numeric" maxLength={10} value={mobileNumber} onChangeText={setMobileNumber} />
                                        </View>
                                        <TouchableOpacity style={s.verifyBtn} onPress={handleSendOtp} disabled={mobileNumber.length !== 10 || panNumber.length !== 10}>
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

                                <TouchableOpacity style={[s.mainBtn, (!isOtpSent || otp.length !== 6) && s.btnDisabled]} disabled={!isOtpSent || otp.length !== 6 || isVerifying} onPress={handleVerifyOtp}>
                                    <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                        {isVerifying ? <ActivityIndicator color="#FFF" /> : <><Text style={s.mainBtnText}>Verify & Proceed</Text><Ionicons name="arrow-forward" size={20} color="#FFF" /></>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#E0F2F1' }]}><Ionicons name="create" size={20} color="#007961" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Correction Area</Text>
                                        <Text style={s.sectionSub}>Select one field to correct</Text>
                                    </View>
                                </View>

                                {/* Single-select grid */}
                                <View style={s.typeGrid}>
                                    {CORRECTION_TYPES.map((type) => (
                                        <TouchableOpacity
                                            key={type.id}
                                            style={[s.typeCard, selectedType === type.id && s.typeCardActive]}
                                            onPress={() => setSelectedType(type.id)}
                                        >
                                            <MaterialCommunityIcons name={type.icon as any} size={28} color={selectedType === type.id ? "#FFF" : "#64748B"} />
                                            <Text style={[s.typeCardLabel, selectedType === type.id && s.typeCardLabelActive]}>{type.label}</Text>
                                            {selectedType === type.id && (
                                                <View style={s.selectedBadge}><Ionicons name="checkmark" size={10} color="#0D47A1" /></View>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {selectedType && (
                                    <View>
                                        {/* Input form */}
                                        <View style={s.card}>
                                            <Text style={s.formHeader}>Enter Corrected Details</Text>

                                            {selectedType === 'name' && (
                                                <View>
                                                    <Text style={s.inputLabel}>Corrected Full Name *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="Full name as per proof" value={newName} onChangeText={setNewName} /></View>
                                                </View>
                                            )}

                                            {selectedType === 'dob' && (
                                                <View>
                                                    <Text style={s.inputLabel}>Corrected Date of Birth *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="DD/MM/YYYY" value={newDob} onChangeText={setNewDob} keyboardType="numeric" maxLength={10} /></View>
                                                </View>
                                            )}

                                            {selectedType === 'father' && (
                                                <View>
                                                    <Text style={s.inputLabel}>Corrected Father's Name *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="Father's full legal name" value={newFatherName} onChangeText={setNewFatherName} /></View>
                                                </View>
                                            )}

                                            {selectedType === 'contact' && (
                                                <View>
                                                    <Text style={s.inputLabel}>Updated Mobile Number *</Text>
                                                    <View style={s.inputRow}><TextInput style={s.field} placeholder="10-digit mobile" value={newContact} onChangeText={setNewContact} keyboardType="numeric" maxLength={10} /></View>
                                                </View>
                                            )}

                                            {selectedType === 'address' && (
                                                <View>
                                                    <Text style={s.inputLabel}>New Address *</Text>
                                                    <View style={[s.inputRow, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                                                        <TextInput style={[s.field, { textAlignVertical: 'top' }]} placeholder="House No, Street, City, State - PIN" value={newAddress} onChangeText={setNewAddress} multiline />
                                                    </View>
                                                </View>
                                            )}

                                            {selectedType === 'photo' && (
                                                <View style={s.photoNotice}>
                                                    <Ionicons name="camera-outline" size={22} color="#7B1FA2" />
                                                    <Text style={s.photoNoticeText}>Upload a recent passport-size photograph with white background. Signature should be clear on plain white paper.</Text>
                                                </View>
                                            )}

                                            {/* Document Uploads */}
                                            {renderDocumentUploads()}
                                        </View>
                                    </View>
                                )}

                                <TouchableOpacity style={[s.mainBtn, !selectedType && s.btnDisabled]} disabled={!selectedType} onPress={validateStep2}>
                                    <LinearGradient colors={['#0D47A1', '#1565C0']} style={s.btnGrad}>
                                        <Text style={s.mainBtnText}>Continue</Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#F3E5F5' }]}><Ionicons name="eye" size={20} color="#7B1FA2" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Review Application</Text>
                                        <Text style={s.sectionSub}>Verify your correction request</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>PAN Number</Text>
                                        <Text style={s.reviewVal}>{panNumber}</Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>Correction Field</Text>
                                        <Text style={s.reviewVal}>{CORRECTION_TYPES.find(t => t.id === selectedType)?.label}</Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>New Value</Text>
                                        <Text style={[s.reviewVal, { color: '#2E7D32' }]}>{getNewValue()}</Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>Documents</Text>
                                        <Text style={s.reviewVal}>{Object.keys(uploadedDocs).length} Uploaded</Text>
                                    </View>
                                </View>

                                <View style={s.infoBox}>
                                    <Ionicons name="information-circle-outline" size={20} color="#0D47A1" />
                                    <Text style={s.infoText}>Standard processing time is 15-20 working days. Updated PAN card will be delivered by post.</Text>
                                </View>

                                <TouchableOpacity style={s.mainBtn} onPress={handleSubmit} disabled={isSubmitting}>
                                    <LinearGradient colors={['#2E7D32', '#388E3C']} style={s.btnGrad}>
                                        {isSubmitting ? <ActivityIndicator color="#FFF" /> : <><Text style={s.mainBtnText}>Submit Correction Request</Text><Ionicons name="checkmark-done" size={20} color="#FFF" /></>}
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

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    safe: { flex: 1 },
    // Header - no circle
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

    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4, marginBottom: 24 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 48, gap: 10 },
    field: { flex: 1, fontSize: 15, color: '#1E293B' },
    otpRow: { flexDirection: 'row', gap: 10 },
    verifyBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', height: 48 },
    verifyBtnText: { fontSize: 12, fontWeight: '700', color: '#0D47A1' },

    mainBtn: { borderRadius: 16, overflow: 'hidden' },
    btnDisabled: { opacity: 0.6 },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    // Single-select grid (radio style)
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    typeCard: { width: '31%', aspectRatio: 1, backgroundColor: '#FFF', borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, borderWidth: 2, borderColor: 'transparent' },
    typeCardActive: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    typeCardLabel: { fontSize: 11, color: '#64748B', marginTop: 8, textAlign: 'center', fontWeight: '600' },
    typeCardLabelActive: { color: '#FFF' },
    selectedBadge: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },

    formHeader: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 16 },

    // Documents
    docSectionTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
    docCard: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
    docLabelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
    docLabel: { flex: 1, fontSize: 12, fontWeight: '700', color: '#1E293B', lineHeight: 18 },
    uploadedBox: { backgroundColor: '#F0F9FF', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#BAE6FD' },
    uploadedInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    fileName: { fontSize: 12, fontWeight: '600', color: '#0369A1' },
    fileSize: { fontSize: 10, color: '#0EA5E9' },
    uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', borderRadius: 12, padding: 16, alignItems: 'center', backgroundColor: '#F8FAFC' },
    uploadText: { fontSize: 13, fontWeight: '700', color: '#0D47A1', marginTop: 6 },
    uploadSub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },

    photoNotice: { flexDirection: 'row', backgroundColor: '#F3E5F5', borderRadius: 12, padding: 14, gap: 12, marginBottom: 8 },
    photoNoticeText: { flex: 1, fontSize: 13, color: '#4A148C', fontWeight: '600', lineHeight: 20 },

    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, alignItems: 'center' },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewVal: { fontSize: 14, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'right', marginLeft: 12 },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    infoBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderRadius: 16, padding: 16, marginBottom: 24, gap: 12 },
    infoText: { flex: 1, fontSize: 12, color: '#0D47A1', lineHeight: 18, fontWeight: '600' },

    // Success Screen
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
});
