import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
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

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // 1. Personal Details
    fullName: string;
    aadhaarNumber: string;
    dob: string;
    gender: string;
    mobileNumber: string;
    email: string;

    // 2. Address Details
    houseNo: string;
    street: string;
    village: string;
    taluka: string;
    district: string;
    pincode: string;

    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    aadhaarCard: DocumentType | null;
    ageProof: DocumentType | null;
    addressProof: DocumentType | null;
    photo: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewSeniorCitizenApplicationScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarCard: null,
        ageProof: null,
        addressProof: null,
        photo: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        dob: "",
        gender: "",
        mobileNumber: "",
        email: "",
        houseNo: "",
        street: "",
        village: "",
        taluka: "",
        district: "",
        pincode: "",
        declaration: false,
        finalConfirmation: false,
    });

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

    const REQUIRED_DOCS = [
        { id: 'aadhaarCard', name: 'Aadhaar Card (आधार कार्ड) *', icon: 'card-account-details', color: '#1565C0', hint: 'Front & Back side' },
        { id: 'ageProof', name: 'Age Proof (वयाचा पुरावा) *', icon: 'calendar-check', color: '#2E7D32', hint: 'Birth Certificate / School Leaving' },
        { id: 'addressProof', name: 'Address Proof (पत्त्याचा पुरावा) *', icon: 'home-map-marker', color: '#E65100', hint: 'Light Bill / Ration Card' },
        { id: 'photo', name: 'Passport Size Photo *', icon: 'account-box-outline', color: '#7B1FA2', hint: 'Recent color photo' },
    ];

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });
            if (result.canceled === false && result.assets && result.assets[0]) {
                const file = result.assets[0];
                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert("Too Large", "Max size is 5MB");
                    return;
                }
                setDocuments(prev => ({ ...prev, [docType]: file }));
            }
        } catch (err) { Alert.alert("Error", "Upload failed"); }
    };

    const handleDOBChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        setFormData(prev => ({ ...prev, dob: formatted }));
    };

    const calculateAge = (dob: string) => {
        if (!dob || dob.length < 10) return 0;
        const [day, month, year] = dob.split('/').map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (!formData.fullName || !formData.aadhaarNumber || !formData.dob || !formData.gender || !formData.mobileNumber) {
                Alert.alert("Wait", "Please fill all mandatory applicant details"); return;
            }
            if (formData.aadhaarNumber.length !== 12) { Alert.alert("Wait", "Invalid Aadhaar"); return; }
            if (formData.mobileNumber.length !== 10) { Alert.alert("Wait", "Invalid Mobile"); return; }

            const age = calculateAge(formData.dob);
            if (age < 60) {
                Alert.alert("Ineligible", "Applicant must be 60 years or above to apply for this certificate.");
                return;
            }

            if (!formData.houseNo || !formData.village || !formData.taluka || !formData.pincode) {
                Alert.alert("Wait", "Please fill address details"); return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.aadhaarCard || !documents.ageProof || !documents.addressProof || !documents.photo) {
                Alert.alert("Documents", "Please upload all mandatory documents"); return;
            }
            setCurrentStep(3);
        } else {
            if (!formData.finalConfirmation) { Alert.alert("Wait", "Confirm declaration"); return; }
            setIsSubmitting(true);
            setTimeout(() => {
                setApplicationId("SC-" + Math.random().toString(36).substr(2, 6).toUpperCase());
                setIsSubmitting(false);
                setIsSubmitted(true);
            }, 2000);
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
                            {currentStep > step ? <Ionicons name="checkmark" size={14} color="#FFF" /> : <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>{step}</Text>}
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
                    <Text style={styles.successSubtitle}>Your Senior Citizen Certificate application has been received.</Text>
                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <Text style={styles.idValue}>{applicationId}</Text>
                    </View>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/senior-citizen-services")}>
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
                    <TouchableOpacity style={styles.backButton} onPress={() => { if (currentStep > 1) setCurrentStep(currentStep - 1); else router.back(); }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Application</Text>
                        <Text style={styles.headerSubtitle}>Senior Citizen Certificate</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Applicant Information" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input value={formData.fullName} onChangeText={(t: string) => setFormData({ ...formData, fullName: t })} placeholder="Enter your full name" icon="person-outline" />

                                <Label text="Aadhaar Number *" />
                                <Input value={formData.aadhaarNumber} onChangeText={(t: string) => setFormData({ ...formData, aadhaarNumber: t })} placeholder="12-digit Aadhaar" keyboardType="number-pad" maxLength={12} icon="card-outline" />

                                <Label text="Date of Birth *" />
                                <Input value={formData.dob} onChangeText={handleDOBChange} placeholder="DD/MM/YYYY" maxLength={10} keyboardType="number-pad" icon="calendar-outline" />

                                <Label text="Gender *" />
                                <View style={styles.genderContainer}>
                                    {["Male", "Female", "Other"].map((g) => (
                                        <TouchableOpacity key={g} style={[styles.genderBox, formData.gender === g && styles.genderBoxActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                            <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(t: string) => setFormData({ ...formData, mobileNumber: t })} placeholder="10-digit mobile" keyboardType="phone-pad" maxLength={10} icon="phone-portrait-outline" />

                                <Label text="Email (Optional)" />
                                <Input value={formData.email} onChangeText={(t: string) => setFormData({ ...formData, email: t })} placeholder="Email address" keyboardType="email-address" icon="mail-outline" />
                            </View>

                            <SectionTitle title="Address Details" icon="location" />
                            <View style={styles.formCard}>
                                <Label text="House / Flat Number *" />
                                <Input value={formData.houseNo} onChangeText={(t: string) => setFormData({ ...formData, houseNo: t })} placeholder="House No" />

                                <Label text="Street / Area" />
                                <Input value={formData.street} onChangeText={(t: string) => setFormData({ ...formData, street: t })} placeholder="Area / Colony" />

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="City/Village *" />
                                        <Input value={formData.village} onChangeText={(t: string) => setFormData({ ...formData, village: t })} placeholder="City" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Taluka *" />
                                        <Input value={formData.taluka} onChangeText={(t: string) => setFormData({ ...formData, taluka: t })} placeholder="Taluka" />
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="District *" />
                                        <Input value={formData.district} onChangeText={(t: string) => setFormData({ ...formData, district: t })} placeholder="District" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="PIN Code *" />
                                        <Input value={formData.pincode} onChangeText={(t: string) => setFormData({ ...formData, pincode: t })} placeholder="6-digit" keyboardType="number-pad" maxLength={6} />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.noteCard}>
                                <Ionicons name="alert-circle" size={18} color="#0D47A1" />
                                <Text style={styles.noteText}>Applicant must be 60 years or above.</Text>
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Mandatory Documents" icon="cloud-upload" />
                            <View style={styles.docList}>
                                {REQUIRED_DOCS.map((doc) => (
                                    <TouchableOpacity
                                        key={doc.id}
                                        style={[styles.docUploadCard, documents[doc.id] && styles.docUploadCardActive]}
                                        onPress={() => pickDocument(doc.id as keyof DocumentsState)}
                                    >
                                        <View style={[styles.docIconCircle, { backgroundColor: doc.color + '15' }]}>
                                            <MaterialCommunityIcons name={doc.icon as any} size={24} color={documents[doc.id] ? "#FFF" : doc.color} style={documents[doc.id] && { backgroundColor: doc.color, borderRadius: 12, padding: 4 }} />
                                        </View>
                                        <View style={styles.docTextContent}>
                                            <Text style={styles.docTitle}>{doc.name}</Text>
                                            <Text style={styles.docHint}>{documents[doc.id] ? documents[doc.id]!.name : doc.hint}</Text>
                                        </View>
                                        <Ionicons name={documents[doc.id] ? "checkmark-circle" : "cloud-upload"} size={24} color={documents[doc.id] ? "#2E7D32" : "#94A3B8"} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Verify Details" icon="eye" />
                            <ReviewItem title="Personal Details" data={[
                                { label: "Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "DOB", value: formData.dob },
                                { label: "Mobile", value: formData.mobileNumber },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewItem title="Address" data={[
                                { label: "House No", value: formData.houseNo },
                                { label: "Village", value: formData.village },
                                { label: "Pincode", value: formData.pincode },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewItem title="Documents" data={[
                                { label: "Aadhaar Card", value: documents.aadhaarCard ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Age Proof", value: documents.ageProof ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Address Proof", value: documents.addressProof ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Photo", value: documents.photo ? "Uploaded ✅" : "Missing ❌" },
                            ]} onEdit={() => setCurrentStep(2)} />

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}>
                                <Ionicons name={formData.finalConfirmation ? "checkbox" : "square-outline"} size={22} color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that the above information is true and correct.</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={{ height: 120 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                            <Ionicons name={currentStep === 3 ? "checkmark-done" : "arrow-forward"} size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

// Sub-components
const SectionTitle = ({ title, icon }: any) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}><Ionicons name={icon} size={18} color="#0D47A1" /></View>
        <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
);
const Label = ({ text }: any) => <Text style={styles.inputLabel}>{text}</Text>;
const Input = ({ icon, ...props }: any) => (
    <View style={styles.inputContainer}>
        {icon && <Ionicons name={icon} size={18} color="#94A3B8" style={{ marginRight: 8 }} />}
        <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
    </View>
);
const ReviewItem = ({ title, data, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <Text style={styles.reviewSectionTitle}>{title}</Text>
            <TouchableOpacity onPress={onEdit}><Text style={styles.editLink}>Edit</Text></TouchableOpacity>
        </View>
        {data.map((item: any, i: number) => (
            <View key={i} style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{item.label}</Text>
                <Text style={styles.reviewValue}>{item.value}</Text>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: "#FFF", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    backButton: { padding: 4 },
    headerCenter: { alignItems: "center" },
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
    stepCircleCompleted: { backgroundColor: "#0D47A1", borderColor: "#0D47A1" },
    stepNumber: { fontSize: 12, fontWeight: "800", color: "#94A3B8" },
    stepNumberActive: { color: "#0D47A1" },
    stepLabel: { fontSize: 10, fontWeight: "700", color: "#94A3B8", marginTop: 6 },
    stepLabelActive: { color: "#0D47A1" },
    scrollContent: { padding: 16 },
    stepWrapper: { gap: 16 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    sectionIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#E3F2FD", alignItems: "center", justifyContent: "center" },
    sectionHeaderText: { fontSize: 15, fontWeight: "800", color: "#1E293B" },
    formCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 16, gap: 12, borderWidth: 1, borderColor: "#F1F5F9" },
    inputLabel: { fontSize: 13, fontWeight: "700", color: "#475569", marginLeft: 4 },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: "#F1F5F9" },
    input: { flex: 1, fontSize: 14, color: "#334155", height: "100%" },
    inputRow: { flexDirection: "row", gap: 12 },
    genderContainer: { flexDirection: "row", gap: 8, flex: 1 },
    genderBox: { flex: 1, height: 48, backgroundColor: "#F8FAFC", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#F1F5F9" },
    genderBoxActive: { backgroundColor: "#E3F2FD", borderColor: "#0D47A1" },
    genderText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
    genderTextActive: { color: "#0D47A1" },
    noteCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#E3F2FD", padding: 12, borderRadius: 12 },
    noteText: { fontSize: 12, color: "#0D47A1", fontWeight: "600" },
    docList: { gap: 12 },
    docUploadCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#F1F5F9" },
    docUploadCardActive: { borderColor: "#E3F2FD", backgroundColor: "#F1F8FE" },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    docTextContent: { flex: 1, marginLeft: 12 },
    docTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
    docHint: { fontSize: 11, color: "#64748B", marginTop: 2 },
    reviewCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: "#F1F5F9" },
    reviewHeader: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#F1F5F9", paddingBottom: 8 },
    reviewSectionTitle: { fontSize: 14, fontWeight: "800", color: "#0D47A1" },
    editLink: { fontSize: 12, color: "#2563EB", fontWeight: "700" },
    reviewRow: { flexDirection: "row", justifyContent: "space-between" },
    reviewLabel: { fontSize: 13, color: "#64748B" },
    reviewValue: { fontSize: 13, fontWeight: "600", color: "#1E293B" },
    declarationRow: { flexDirection: "row", gap: 10, marginTop: 10, paddingHorizontal: 4 },
    declarationLabel: { flex: 1, fontSize: 12, color: "#64748B", lineHeight: 18 },
    bottomBar: { padding: 20, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#F1F5F9" },
    continueButton: { height: 54, borderRadius: 16, overflow: "hidden" },
    buttonGradient: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    buttonText: { fontSize: 16, fontWeight: "800", color: "#FFF" },
    successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: "#FFF" },
    successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F1F8E9", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: "900", color: "#1E293B", textAlign: "center" },
    successSubtitle: { fontSize: 14, color: "#64748B", textAlign: "center", marginTop: 12, lineHeight: 22 },
    idCard: { backgroundColor: "#F8FAFC", borderRadius: 16, padding: 20, width: "100%", marginVertical: 30, alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9" },
    idLabel: { fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: "900", color: "#0D47A1", marginTop: 8 },
    mainBtn: { width: "100%", height: 56, borderRadius: 16, overflow: "hidden" },
    btnGrad: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    mainBtnText: { fontSize: 16, fontWeight: "800", color: "#FFF" },
});
