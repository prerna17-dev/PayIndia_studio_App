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
    Modal,
    FlatList
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
    category: string;
    mobileNumber: string;
    email: string;

    // 2. Address & Employment
    houseNo: string;
    area: string;
    village: string;
    taluka: string;
    district: string;
    pincode: string;
    employmentStatus: string;
    experienceYears: string;

    // 3. Education & Skills
    qualification: string;
    computerSkills: string;
    languages: string;
    prefSector: string;

    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    aadhaarCard: DocumentType | null;
    educationCert: DocumentType | null;
    photo: DocumentType | null;
    experienceCert: DocumentType | null;
    casteCert: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewEmploymentRegistrationScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [activePicker, setActivePicker] = useState<string | null>(null);

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarCard: null,
        educationCert: null,
        photo: null,
        experienceCert: null,
        casteCert: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        dob: "",
        gender: "",
        category: "",
        mobileNumber: "",
        email: "",
        houseNo: "",
        area: "",
        village: "",
        taluka: "",
        district: "",
        pincode: "",
        employmentStatus: "",
        experienceYears: "",
        qualification: "",
        computerSkills: "",
        languages: "",
        prefSector: "",
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

    const categories = ["General", "OBC", "SC", "ST", "VJNT", "EWS", "Other"];
    const qualifications = ["10th Pass", "12th Pass", "Diploma", "Graduate", "Post Graduate", "ITI", "Ph.D"];
    const employmentStatuses = ["Student", "Unemployed", "Self-Employed", "Experienced Professional"];

    const REQUIRED_DOCS = [
        { id: 'aadhaarCard', name: 'Aadhaar Card *', icon: 'card-account-details', color: '#1565C0', hint: 'Front & Back side' },
        { id: 'photo', name: 'Passport Photo *', icon: 'account-box-outline', color: '#2E7D32', hint: 'Recent clear photo' },
        { id: 'educationCert', name: 'Education Certificate *', icon: 'school-outline', color: '#E65100', hint: 'Highest qualification docs' },
        { id: 'experienceCert', name: 'Experience (Optional)', icon: 'briefcase-outline', color: '#7B1FA2', hint: 'If applicable' },
        { id: 'casteCert', name: 'Caste Certificate', icon: 'certificate-outline', color: '#C62828', hint: 'For Category candidates' },
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

    const handleContinue = () => {
        if (currentStep === 1) {
            if (!formData.fullName || !formData.aadhaarNumber || !formData.dob || !formData.gender || !formData.category || !formData.mobileNumber) {
                Alert.alert("Wait", "Please fill all mandatory personal details"); return;
            }
            if (formData.aadhaarNumber.length !== 12) { Alert.alert("Wait", "Invalid Aadhaar"); return; }
            if (formData.mobileNumber.length !== 10) { Alert.alert("Wait", "Invalid Mobile"); return; }

            // Age validation
            const yearStr = formData.dob.split('/')[2];
            if (yearStr && yearStr.length === 4) {
                const age = new Date().getFullYear() - parseInt(yearStr);
                if (age < 18) { Alert.alert("Ineligible", "Applicant must be 18+"); return; }
            }

            if (!formData.village || !formData.taluka || !formData.pincode || !formData.employmentStatus) {
                Alert.alert("Wait", "Please fill address and status"); return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!formData.qualification || !formData.prefSector) { Alert.alert("Wait", "Education details required"); return; }
            if (!documents.aadhaarCard || !documents.photo || !documents.educationCert) {
                Alert.alert("Documents", "Please upload mandatory documents"); return;
            }
            setCurrentStep(3);
        } else {
            if (!formData.finalConfirmation) { Alert.alert("Wait", "Confirm declaration"); return; }
            setIsSubmitting(true);
            setTimeout(() => {
                setApplicationId("ER-" + Math.random().toString(36).substr(2, 6).toUpperCase());
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
                            {step === 1 ? "Details" : step === 2 ? "Education" : "Review"}
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
                    <Text style={styles.successTitle}>Registration Successful!</Text>
                    <Text style={styles.successSubtitle}>Your Job Seeker profile has been successfully registered.</Text>
                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Registration ID</Text>
                        <Text style={styles.idValue}>{applicationId}</Text>
                    </View>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/employment-services")}>
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
                        <Text style={styles.headerTitle}>New Registration</Text>
                        <Text style={styles.headerSubtitle}>Employment Exchange Profile</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Personal Information" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name *" />
                                <Input value={formData.fullName} onChangeText={(t: string) => setFormData({ ...formData, fullName: t })} placeholder="Enter your full name" icon="person-outline" />

                                <Label text="Aadhaar Number *" />
                                <Input value={formData.aadhaarNumber} onChangeText={(t: string) => setFormData({ ...formData, aadhaarNumber: t })} placeholder="12-digit Aadhaar" keyboardType="number-pad" maxLength={12} icon="card-outline" />

                                <Label text="Birth Date *" />
                                <Input value={formData.dob} onChangeText={handleDOBChange} placeholder="DD/MM/YYYY" maxLength={10} keyboardType="number-pad" icon="calendar-outline" />

                                <Label text="Gender *" />
                                <View style={styles.genderContainer}>
                                    {["Male", "Female", "Other"].map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.genderBox, formData.gender === g && styles.genderBoxActive]}
                                            onPress={() => setFormData({ ...formData, gender: g })}
                                        >
                                            <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Social Category *" />
                                <TouchableOpacity style={styles.selector} onPress={() => setActivePicker('category')}>
                                    <Text style={styles.selectorText}>{formData.category || "Select Caste Category"}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                                </TouchableOpacity>

                                <Label text="Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(t: string) => setFormData({ ...formData, mobileNumber: t })} placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} icon="phone-portrait-outline" />
                            </View>

                            <SectionTitle title="Mailing Address" icon="location" />
                            <View style={styles.formCard}>
                                <Label text="House/Area" />
                                <Input value={formData.houseNo} onChangeText={(t: string) => setFormData({ ...formData, houseNo: t })} placeholder="House No, Landmark" />

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="City/Village *" />
                                        <Input value={formData.village} onChangeText={(t: string) => setFormData({ ...formData, village: t })} placeholder="Village" />
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

                            <SectionTitle title="Current Status" icon="briefcase" />
                            <View style={styles.formCard}>
                                <Label text="Current Employment Status *" />
                                <TouchableOpacity style={styles.selector} onPress={() => setActivePicker('status')}>
                                    <Text style={styles.selectorText}>{formData.employmentStatus || "Select Status"}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                                </TouchableOpacity>

                                {formData.employmentStatus === "Experienced Professional" && (
                                    <>
                                        <Label text="Years of Experience" />
                                        <Input value={formData.experienceYears} onChangeText={(t: string) => setFormData({ ...formData, experienceYears: t })} placeholder="e.g. 2" keyboardType="number-pad" />
                                    </>
                                )}
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Education & Skills" icon="school" />
                            <View style={styles.formCard}>
                                <Label text="Highest Qualification *" />
                                <TouchableOpacity style={styles.selector} onPress={() => setActivePicker('qualification')}>
                                    <Text style={styles.selectorText}>{formData.qualification || "Select Level"}</Text>
                                    <Ionicons name="chevron-down" size={16} color="#94A3B8" />
                                </TouchableOpacity>

                                <Label text="Key Skills (IT/Technical)" />
                                <Input value={formData.computerSkills} onChangeText={(t: string) => setFormData({ ...formData, computerSkills: t })} placeholder="e.g. MS Office, Tally, Driving" />

                                <Label text="Preferred Jobs Sector *" />
                                <Input value={formData.prefSector} onChangeText={(t: string) => setFormData({ ...formData, prefSector: t })} placeholder="e.g. IT, Security, Banking" />
                            </View>

                            <SectionTitle title="Mandatory Documents" icon="cloud-upload" />
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
                            <SectionTitle title="Verify Details" icon="eye" />
                            <ReviewItem title="Personal & Contact" data={[
                                { label: "Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "DOB", value: formData.dob },
                                { label: "Status", value: formData.employmentStatus },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewItem title="Education & Skills" data={[
                                { label: "Education", value: formData.qualification },
                                { label: "Preference", value: formData.prefSector },
                            ]} onEdit={() => setCurrentStep(2)} />

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}>
                                <Ionicons name={formData.finalConfirmation ? "checkbox" : "square-outline"} size={22} color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that all details are accurate and I understand that false data will lead to disqualification.</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={{ height: 120 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>{currentStep === 3 ? "Submit Profile" : "Continue"}</Text>
                            <Ionicons name={currentStep === 3 ? "checkmark-done" : "arrow-forward"} size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Selection Modals */}
                <SelectionModal visible={activePicker === 'category'} title="Caste Category" data={categories} onSelect={(v: string) => { setFormData(prev => ({ ...prev, category: v })); setActivePicker(null); }} onClose={() => setActivePicker(null)} />
                <SelectionModal visible={activePicker === 'status'} title="Employment Status" data={employmentStatuses} onSelect={(v: string) => { setFormData(prev => ({ ...prev, employmentStatus: v })); setActivePicker(null); }} onClose={() => setActivePicker(null)} />
                <SelectionModal visible={activePicker === 'qualification'} title="Qualification" data={qualifications} onSelect={(v: string) => { setFormData(prev => ({ ...prev, qualification: v })); setActivePicker(null); }} onClose={() => setActivePicker(null)} />
            </SafeAreaView>
        </View>
    );
}

// Sub-components
const SectionTitle = ({ title, icon }: any) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
            <Ionicons name={icon} size={18} color="#0D47A1" />
        </View>
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

const SelectionModal = ({ visible, title, data, onSelect, onClose }: any) => (
    <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
                </View>
                <FlatList data={data} keyExtractor={(item) => item} renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                        <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                )} />
            </View>
        </View>
    </Modal>
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
    selector: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: "#F1F5F9" },
    selectorText: { fontSize: 14, color: "#334155" },

    genderContainer: { flexDirection: "row", gap: 8, height: 48, marginBottom: 12 },
    genderBox: { flex: 1, backgroundColor: "#F8FAFC", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#F1F5F9" },
    genderBoxActive: { backgroundColor: "#E3F2FD", borderColor: "#0D47A1" },
    genderText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
    genderTextActive: { color: "#0D47A1" },

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
    declarationRow: { flexDirection: "row", gap: 12, paddingHorizontal: 4, marginTop: 10 },
    declarationLabel: { flex: 1, fontSize: 12, color: "#64748B", lineHeight: 18 },

    bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: "#FFF", borderTopWidth: 1, borderTopColor: "#F1F5F9" },
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

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, maxHeight: "80%" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    modalTitle: { fontSize: 18, fontWeight: "800" },
    modalItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
    modalItemText: { fontSize: 16, color: "#1E293B" },
});
