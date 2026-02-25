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

type UpdateType = "name" | "dob" | "address" | "gender" | "photo";

interface UploadedFile {
    name: string;
    size: string;
    uri: string;
}

// Required documents per update type
const REQUIRED_DOCS: Record<string, { id: string; label: string }[]> = {
    name: [
        { id: "nameProof", label: "Identity Proof with Name (Passport/PAN/Aadhaar)" },
    ],
    dob: [
        { id: "dobProof", label: "Birth Certificate or School Leaving Certificate" },
    ],
    address: [
        { id: "addressProof", label: "Address Proof (Electricity/Water Bill/Rent Agreement)" },
    ],
    gender: [
        { id: "genderProof", label: "Self-Declaration or Medical Certificate" },
    ],
    photo: [
        { id: "newPhoto", label: "Recent Passport Size Photograph" },
    ],
};

export default function VoterIDUpdateScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    // Section 1 States
    const [voterID, setVoterID] = useState("");
    const [aadhaarNo, setAadhaarNo] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Section 2 States
    const [selectedType, setSelectedType] = useState<UpdateType | null>(null);
    const [newName, setNewName] = useState("");
    const [newDob, setNewDob] = useState("");
    const [newGender, setNewGender] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [newState, setNewState] = useState("");
    const [newPincode, setNewPincode] = useState("");

    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    useEffect(() => {
        const backAction = () => {
            if (step > 1) { setStep(step - 1); return true; }
            router.replace("/voter-id-services");
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [step]);

    // Reset docs when type changes
    useEffect(() => {
        setUploadedDocs({});
    }, [selectedType]);

    const formatAadhaar = (text: string) => {
        const cleaned = text.replace(/\s/g, "");
        let formatted = "";
        for (let i = 0; i < cleaned.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += " ";
            formatted += cleaned[i];
        }
        setAadhaarNo(formatted);
    };

    const formatDob = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = "";
        if (cleaned.length <= 2) formatted = cleaned;
        else if (cleaned.length <= 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        else formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        setNewDob(formatted);
    };

    const handleSendOtp = () => {
        const cleanAadhaar = aadhaarNo.replace(/\s/g, "");
        if (cleanAadhaar.length !== 12) return Alert.alert("Error", "Enter valid 12-digit Aadhaar");
        if (mobileNumber.length !== 10) return Alert.alert("Error", "Enter valid 10-digit mobile");
        setIsOtpSent(true);
        Alert.alert("Success", "OTP sent to registered mobile");
    };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) return Alert.alert("Error", "Enter 6-digit OTP");
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setStep(2);
        }, 1200);
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
        if (!selectedType) return Alert.alert("Required", "Please select a correction type");

        const requiredDocs = REQUIRED_DOCS[selectedType] || [];
        const missingDocs = requiredDocs.filter(d => !uploadedDocs[d.id]);

        switch (selectedType) {
            case "name": if (!newName) return Alert.alert("Required", "Enter new name"); break;
            case "dob": if (newDob.length !== 10) return Alert.alert("Required", "Enter valid DOB (DD/MM/YYYY)"); break;
            case "gender": if (!newGender) return Alert.alert("Required", "Select gender"); break;
            case "address": if (!newAddress || !newState || !newPincode) return Alert.alert("Required", "Fill all address fields"); break;
        }

        if (missingDocs.length > 0) {
            return Alert.alert("Required", `Please upload:\n${missingDocs.map(d => "• " + d.label).join("\n")}`);
        }

        setStep(3);
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const refId = "VOT" + Math.random().toString(36).substr(2, 9).toUpperCase();
            setApplicationId(refId);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
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
                    <Text style={s.successTitle}>Update Requested!</Text>
                    <Text style={s.successSubtitle}>Your Voter ID correction request has been submitted successfully.</Text>

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

                    <TouchableOpacity style={s.mainBtn} onPress={() => router.replace("/voter-id-services")}>
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
                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity style={s.backBtn} onPress={() => step > 1 ? setStep(step - 1) : router.replace("/voter-id-services")}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={s.headerContent}>
                        <Text style={s.headerTitle}>Voter ID Correction</Text>
                        <Text style={s.headerSubtitle}>Official data update service</Text>
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
                                        <Text style={s.sectionTitle}>Identification</Text>
                                        <Text style={s.sectionSub}>Verify your Voter ID & Aadhaar</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <Text style={s.inputLabel}>Voter ID Number (EPIC No) *</Text>
                                    <View style={s.inputRow}>
                                        <Ionicons name="card-outline" size={20} color="#64748B" />
                                        <TextInput style={s.field} placeholder="Ex: ABC1234567" autoCapitalize="characters" value={voterID} onChangeText={setVoterID} />
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
                                        <TouchableOpacity style={s.verifyBtn} onPress={handleSendOtp} disabled={aadhaarNo.replace(/\s/g, "").length !== 12 || mobileNumber.length !== 10}>
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

                        {/* STEP 2: Select & Update */}
                        {step === 2 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#E0F2F1' }]}><Ionicons name="create" size={20} color="#007961" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Select Correction Type</Text>
                                        <Text style={s.sectionSub}>Pick the field you want to fix</Text>
                                    </View>
                                </View>

                                {/* chips */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeList}>
                                    {([
                                        { id: "name", label: "Name", icon: "person" },
                                        { id: "dob", label: "DOB", icon: "calendar" },
                                        { id: "address", label: "Address", icon: "home" },
                                        { id: "gender", label: "Gender", icon: "transgender" },
                                        { id: "photo", label: "Photo", icon: "camera" },
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
                                            <Text style={s.formHeader}>Correction Details</Text>

                                            {selectedType === "name" && (
                                                <View>
                                                    <Text style={s.inputLabel}>Correct Full Name *</Text>
                                                    <View style={s.inputRow}>
                                                        <Ionicons name="person-outline" size={18} color="#64748B" />
                                                        <TextInput style={s.field} placeholder="Enter correct full name" value={newName} onChangeText={setNewName} />
                                                    </View>
                                                </View>
                                            )}

                                            {selectedType === "dob" && (
                                                <View>
                                                    <Text style={s.inputLabel}>Correct Date of Birth *</Text>
                                                    <View style={s.inputRow}>
                                                        <Ionicons name="calendar-outline" size={18} color="#64748B" />
                                                        <TextInput style={s.field} placeholder="DD/MM/YYYY" value={newDob} onChangeText={formatDob} keyboardType="numeric" maxLength={10} />
                                                    </View>
                                                </View>
                                            )}

                                            {selectedType === "gender" && (
                                                <View>
                                                    <Text style={s.inputLabel}>Select Correct Gender *</Text>
                                                    <View style={s.genderRow}>
                                                        {["Male", "Female", "Other"].map(g => (
                                                            <TouchableOpacity key={g} style={[s.genderBtn, newGender === g && s.genderBtnActive]} onPress={() => setNewGender(g)}>
                                                                <Text style={[s.genderBtnText, newGender === g && s.genderBtnTextActive]}>{g}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}

                                            {selectedType === "address" && (
                                                <View>
                                                    <Text style={s.inputLabel}>Correct Detailed Address *</Text>
                                                    <View style={[s.inputRow, { height: 80, alignItems: 'flex-start', paddingTop: 10 }]}>
                                                        <TextInput style={[s.field, { textAlignVertical: 'top' }]} placeholder="House No, Area, Locality" value={newAddress} onChangeText={setNewAddress} multiline />
                                                    </View>
                                                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={s.inputLabel}>State *</Text>
                                                            <View style={s.inputRow}><TextInput style={s.field} placeholder="State" value={newState} onChangeText={setNewState} /></View>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={s.inputLabel}>Pincode *</Text>
                                                            <View style={s.inputRow}><TextInput style={s.field} placeholder="Pincode" value={newPincode} onChangeText={setNewPincode} keyboardType="numeric" maxLength={6} /></View>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}

                                            {selectedType === "photo" && (
                                                <View>
                                                    <Text style={s.inputLabel}>Status</Text>
                                                    <View style={s.uploadedBox}>
                                                        <View style={s.uploadedInfo}>
                                                            <Ionicons name="camera-outline" size={22} color="#0D47A1" />
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={s.fileName}>Photo Upgrade Selected</Text>
                                                                <Text style={s.fileSize}>Upload doc below</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}

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

                        {/* STEP 3: Review */}
                        {step === 3 && (
                            <View>
                                <View style={s.sectionHeader}>
                                    <View style={[s.iconBadge, { backgroundColor: '#F3E5F5' }]}><Ionicons name="eye" size={20} color="#7B1FA2" /></View>
                                    <View>
                                        <Text style={s.sectionTitle}>Review & Confirm</Text>
                                        <Text style={s.sectionSub}>Verify your final update request</Text>
                                    </View>
                                </View>

                                <View style={s.card}>
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>Voter ID (EPIC)</Text>
                                        <Text style={s.reviewVal}>{voterID}</Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>Field for Correction</Text>
                                        <Text style={s.reviewVal}>{selectedType?.toUpperCase()}</Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>New Value</Text>
                                        <Text style={[s.reviewVal, { color: '#2E7D32' }]}>
                                            {selectedType === "name" ? newName :
                                                selectedType === "dob" ? newDob :
                                                    selectedType === "gender" ? newGender :
                                                        selectedType === "address" ? `${newAddress}, ${newState} - ${newPincode}` :
                                                            "New Photo Uploaded"}
                                        </Text>
                                    </View>
                                    <View style={s.divider} />
                                    <View style={s.reviewRow}>
                                        <Text style={s.reviewLabel}>Proofs Attached</Text>
                                        <Text style={s.reviewVal}>{Object.keys(uploadedDocs).length} Proof(s)</Text>
                                    </View>
                                </View>

                                <View style={s.warningBox}>
                                    <Ionicons name="information-circle" size={20} color="#856404" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.warningText}>
                                            Changes will be reflected in EPIC records after field officer verification. This usually takes 15-30 days.
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity style={s.mainBtn} onPress={handleSubmit} disabled={isSubmitting}>
                                    <LinearGradient colors={['#2E7D32', '#388E3C']} style={s.btnGrad}>
                                        {isSubmitting ? <ActivityIndicator color="#FFF" /> : <><Text style={s.mainBtnText}>Submit Correction</Text><Ionicons name="checkmark-done" size={20} color="#FFF" /></>}
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

    typeList: { gap: 16, paddingRight: 20, marginBottom: 20 },
    typeItem: { alignItems: 'center', width: 70 },
    typeIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    typeItemActive: {},
    typeIconActive: { backgroundColor: '#0D47A1' },
    typeLabelText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
    typeLabelActive: { color: '#0D47A1', fontWeight: '800' },

    formHeader: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 16 },

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

    genderRow: { flexDirection: 'row', gap: 12 },
    genderBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', alignItems: 'center' },
    genderBtnActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
    genderBtnText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    genderBtnTextActive: { color: '#2E7D32' },

    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, alignItems: 'center' },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewVal: { fontSize: 14, fontWeight: '800', color: '#1E293B', flex: 1, textAlign: 'right', marginLeft: 12 },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    warningBox: { flexDirection: 'row', backgroundColor: '#FFF3CD', borderRadius: 14, padding: 16, marginBottom: 24, gap: 12 },
    warningText: { flex: 1, fontSize: 12, color: '#856404', lineHeight: 18, fontWeight: '600' },

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
