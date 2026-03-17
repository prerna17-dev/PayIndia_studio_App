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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FamilyMember {
    id: string;
    name: string;
    aadhaar: string;
    age: string;
    relationship: string;
}

interface FormDataType {
    // Applicant Information
    fullName: string;
    aadhaarNumber: string;
    mobileNumber: string;
    gender: string;
    dob: string;
    state: string;
    district: string;
    village: string;

    // Family Details
    rationCardNumber: string;
    familyMembers: FamilyMember[];

    // Eligibility Check
    eligibilityType: "Aadhaar" | "Ration Card";
    isEligible: boolean | null;

    declaration: boolean;
}

interface DocumentsState {
    aadhaarHead: DocumentType | null;
    rationCard: DocumentType | null;
    addressProof: DocumentType | null;
    photo: DocumentType | null;
    seccProof: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewAyushmanApplicationScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Temp Member State
    const [tempMember, setTempMember] = useState<FamilyMember>({
        id: "",
        name: "",
        aadhaar: "",
        age: "",
        relationship: "",
    });

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarHead: null,
        rationCard: null,
        addressProof: null,
        photo: null,
        seccProof: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        mobileNumber: "",
        gender: "",
        dob: "",
        state: "Maharashtra",
        district: "",
        village: "",
        rationCardNumber: "",
        familyMembers: [],
        eligibilityType: "Aadhaar",
        isEligible: null,
        declaration: false,
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

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        else router.back();
    };

    const addFamilyMember = () => {
        if (!tempMember.name || !tempMember.aadhaar || !tempMember.age || !tempMember.relationship) {
            Alert.alert("Error", "Please fill all member details");
            return;
        }
        if (tempMember.aadhaar.length !== 12) {
            Alert.alert("Error", "Invalid Aadhaar Number");
            return;
        }
        setFormData(prev => ({
            ...prev,
            familyMembers: [...prev.familyMembers, { ...tempMember, id: Date.now().toString() }]
        }));
        setTempMember({ id: "", name: "", aadhaar: "", age: "", relationship: "" });
        setShowMemberModal(false);
    };

    const removeMember = (id: string) => {
        setFormData(prev => ({
            ...prev,
            familyMembers: prev.familyMembers.filter(m => m.id !== id)
        }));
    };

    const verifyEligibility = () => {
        if (formData.eligibilityType === "Aadhaar" && !formData.aadhaarNumber) {
            Alert.alert("Wait", "Enter Aadhaar Number first"); return;
        }
        if (formData.eligibilityType === "Ration Card" && !formData.rationCardNumber) {
            Alert.alert("Wait", "Enter Ration Card Number first"); return;
        }

        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setFormData(prev => ({ ...prev, isEligible: true }));
            Alert.alert("Success", "You are eligible for PM-JAY scheme benefits!");
        }, 1500);
    };

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });
            if (result.canceled === false && result.assets && result.assets[0]) {
                setDocuments(prev => ({ ...prev, [docType]: result.assets[0] }));
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
            if (!formData.fullName || !formData.aadhaarNumber || !formData.mobileNumber || !formData.gender || !formData.dob) {
                Alert.alert("Wait", "Please fill applicant details"); return;
            }
            if (!formData.isEligible) {
                Alert.alert("Wait", "Please verify eligibility first"); return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.aadhaarHead || !documents.rationCard || !documents.addressProof || !documents.photo) {
                Alert.alert("Documents", "Please upload all mandatory documents"); return;
            }
            setCurrentStep(3);
        } else {
            if (!formData.declaration) { Alert.alert("Wait", "Confirm declaration"); return; }
            setIsSubmitting(true);
            setTimeout(() => {
                setApplicationId("PMJAY-" + Math.random().toString(36).substr(2, 6).toUpperCase());
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
                    <Text style={styles.successSubtitle}>Your Ayushman Card application has been received and is under verification.</Text>
                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <Text style={styles.idValue}>{applicationId}</Text>
                    </View>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/ayushman-services")}>
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
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Application</Text>
                        <Text style={styles.headerSubtitle}>Ayushman Bharat (PM-JAY)</Text>
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
                                <Input value={formData.fullName} onChangeText={(t: string) => setFormData({ ...formData, fullName: t })} placeholder="Enter full name" />

                                <Label text="Aadhaar Number *" />
                                <Input value={formData.aadhaarNumber} onChangeText={(t: string) => setFormData({ ...formData, aadhaarNumber: t })} placeholder="12-digit Aadhaar" keyboardType="number-pad" maxLength={12} icon="card-outline" />

                                <Label text="Date of Birth *" />
                                <Input value={formData.dob} onChangeText={handleDOBChange} placeholder="DD/MM/YYYY" maxLength={10} keyboardType="number-pad" icon="calendar-outline" />

                                <Label text="Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(t: string) => setFormData({ ...formData, mobileNumber: t })} placeholder="10-digit mobile" keyboardType="phone-pad" maxLength={10} icon="phone-portrait-outline" />

                                <Label text="Gender *" />
                                <View style={styles.genderContainer}>
                                    {["Male", "Female", "Other"].map((g) => (
                                        <TouchableOpacity key={g} style={[styles.genderBox, formData.gender === g && styles.genderBoxActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                            <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <SectionTitle title="Family Details" icon="people" />
                            <View style={styles.formCard}>
                                <Label text="Ration Card Number *" />
                                <Input value={formData.rationCardNumber} onChangeText={(t: string) => setFormData({ ...formData, rationCardNumber: t })} placeholder="Enter ration card number" />

                                <View style={styles.membersHeader}>
                                    <Text style={styles.membersTitle}>Family Members ({formData.familyMembers.length})</Text>
                                    <TouchableOpacity style={styles.addMemberBtn} onPress={() => setShowMemberModal(true)}>
                                        <Ionicons name="add-circle" size={18} color="#0D47A1" />
                                        <Text style={styles.addMemberText}>Add Member</Text>
                                    </TouchableOpacity>
                                </View>

                                {formData.familyMembers.map((member) => (
                                    <View key={member.id} style={styles.memberItem}>
                                        <View>
                                            <Text style={styles.memberName}>{member.name}</Text>
                                            <Text style={styles.memberDetail}>{member.relationship} | Age: {member.age}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => removeMember(member.id)}>
                                            <Ionicons name="trash-outline" size={20} color="#E53935" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>

                            <SectionTitle title="Eligibility Check" icon="shield-checkmark" />
                            <View style={styles.formCard}>
                                <Text style={styles.helperText}>Check if you are eligible for PM-JAY scheme</Text>
                                <View style={styles.typeToggle}>
                                    {["Aadhaar", "Ration Card"].map((type) => (
                                        <TouchableOpacity key={type} style={[styles.toggleBtn, formData.eligibilityType === type && styles.toggleBtnActive]} onPress={() => setFormData({ ...formData, eligibilityType: type as any })}>
                                            <Text style={[styles.toggleText, formData.eligibilityType === type && styles.toggleTextActive]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TouchableOpacity style={styles.verifyBtn} onPress={verifyEligibility} disabled={isVerifying}>
                                    <LinearGradient colors={formData.isEligible ? ['#2E7D32', '#43A047'] : ['#0D47A1', '#1565C0']} style={styles.verifyBtnGrad}>
                                        {isVerifying ? <Text style={styles.verifyBtnText}>Verifying...</Text> : (
                                            <>
                                                <Text style={styles.verifyBtnText}>{formData.isEligible ? "Eligibility Verified ✅" : "Verify Eligibility"}</Text>
                                                {!formData.isEligible && <Ionicons name="search" size={18} color="#FFF" />}
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Required Documents" icon="cloud-upload" />
                            <View style={styles.docList}>
                                <DocCard title="Aadhaar Card (Head) *" hint="Front & Back side" isUploaded={!!documents.aadhaarHead} onPress={() => pickDocument("aadhaarHead")} icon="card-account-details" />
                                <DocCard title="Ration Card *" hint="Full ration card copy" isUploaded={!!documents.rationCard} onPress={() => pickDocument("rationCard")} icon="book-open-outline" />
                                <DocCard title="Address Proof *" hint="Electricity Bill / Domicile" isUploaded={!!documents.addressProof} onPress={() => pickDocument("addressProof")} icon="home-outline" />
                                <DocCard title="Passport Size Photo *" hint="Recent color photo" isUploaded={!!documents.photo} onPress={() => pickDocument("photo")} icon="image-outline" />
                                <DocCard title="SECC / Eligibility Proof" hint="Optional, if available" isUploaded={!!documents.seccProof} onPress={() => pickDocument("seccProof")} icon="file-document-check-outline" />
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Application" icon="eye" />
                            <ReviewCard title="Applicant details" data={[
                                { label: "Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "DOB", value: formData.dob },
                                { label: "Gender", value: formData.gender },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewCard title="Family members" data={[
                                { label: "Ration Card", value: formData.rationCardNumber },
                                { label: "Total Members", value: formData.familyMembers.length.toString() },
                                { label: "Eligibility", value: formData.isEligible ? "Verified ✅" : "Not Verified ❌" },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewCard title="Documents" data={[
                                { label: "Aadhaar (Head)", value: documents.aadhaarHead ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Ration Card", value: documents.rationCard ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Other Docs", value: (!!documents.addressProof && !!documents.photo) ? "Uploaded ✅" : "Incomplete ❌" },
                            ]} onEdit={() => setCurrentStep(2)} />

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <Ionicons name={formData.declaration ? "checkbox" : "square-outline"} size={22} color={formData.declaration ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that the above information is correct and I am eligible under PM-JAY scheme.</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.buttonGradient}>
                            <Text style={styles.buttonText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                            <Ionicons name={currentStep === 3 ? "checkmark-done" : "arrow-forward"} size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Add Member Modal */}
                <Modal visible={showMemberModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Add Family Member</Text>
                                <TouchableOpacity onPress={() => setShowMemberModal(false)}><Ionicons name="close" size={24} color="#64748B" /></TouchableOpacity>
                            </View>
                            <ScrollView style={{ maxHeight: 400 }}>
                                <Label text="Member Full Name *" />
                                <Input value={tempMember.name} onChangeText={(t: string) => setTempMember({ ...tempMember, name: t })} placeholder="Full name" />
                                <Label text="Aadhaar Number *" />
                                <Input value={tempMember.aadhaar} onChangeText={(t: string) => setTempMember({ ...tempMember, aadhaar: t })} placeholder="12-digit Aadhaar" keyboardType="number-pad" maxLength={12} />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}><Label text="Age *" /><Input value={tempMember.age} onChangeText={(t: string) => setTempMember({ ...tempMember, age: t })} placeholder="Age" keyboardType="number-pad" /></View>
                                    <View style={{ flex: 1 }}><Label text="Relationship *" /><Input value={tempMember.relationship} onChangeText={(t: string) => setTempMember({ ...tempMember, relationship: t })} placeholder="e.g. Son" /></View>
                                </View>
                            </ScrollView>
                            <TouchableOpacity style={styles.modalBtn} onPress={addFamilyMember}>
                                <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.modalBtnGrad}><Text style={styles.modalBtnText}>Add to List</Text></LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
const DocCard = ({ title, hint, isUploaded, onPress, icon }: any) => (
    <TouchableOpacity style={[styles.docUploadCard, isUploaded && styles.docUploadCardActive]} onPress={onPress}>
        <View style={styles.docIconCircle}><MaterialCommunityIcons name={icon} size={24} color={isUploaded ? "#0D47A1" : "#64748B"} /></View>
        <View style={{ flex: 1, marginLeft: 12 }}><Text style={styles.docTitle}>{title}</Text><Text style={styles.docHint}>{isUploaded ? "File selected ✅" : hint}</Text></View>
        <Ionicons name={isUploaded ? "checkmark-circle" : "cloud-upload"} size={22} color={isUploaded ? "#2E7D32" : "#94A3B8"} />
    </TouchableOpacity>
);
const ReviewCard = ({ title, data, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}><Text style={styles.reviewSectionTitle}>{title}</Text><TouchableOpacity onPress={onEdit}><Text style={styles.editLink}>Edit</Text></TouchableOpacity></View>
        {data.map((item: any, i: number) => (
            <View key={i} style={styles.reviewRow}><Text style={styles.reviewLabel}>{item.label}</Text><Text style={styles.reviewValue}>{item.value}</Text></View>
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
    genderContainer: { flexDirection: "row", gap: 8 },
    genderBox: { flex: 1, height: 48, backgroundColor: "#F8FAFC", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#F1F5F9" },
    genderBoxActive: { backgroundColor: "#E3F2FD", borderColor: "#0D47A1" },
    genderText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
    genderTextActive: { color: "#0D47A1" },
    membersHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 16 },
    membersTitle: { fontSize: 14, fontWeight: "800", color: "#1E293B" },
    addMemberBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E3F2FD", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    addMemberText: { fontSize: 12, fontWeight: "700", color: "#0D47A1" },
    memberItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#F1F5F9" },
    memberName: { fontSize: 14, fontWeight: "700", color: "#334155" },
    memberDetail: { fontSize: 12, color: "#64748B", marginTop: 2 },
    helperText: { fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 4 },
    typeToggle: { flexDirection: "row", gap: 10, marginBottom: 8 },
    toggleBtn: { flex: 1, height: 44, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
    toggleBtnActive: { backgroundColor: "#0D47A1" },
    toggleText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
    toggleTextActive: { color: "#FFF" },
    verifyBtn: { height: 50, borderRadius: 12, overflow: "hidden" },
    verifyBtnGrad: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    verifyBtnText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
    docList: { gap: 12 },
    docUploadCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#F1F5F9" },
    docUploadCardActive: { borderColor: "#0D47A1", backgroundColor: "#F1F8FE" },
    docIconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center" },
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
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
    modalContent: { backgroundColor: "#FFF", borderRadius: 24, padding: 20, gap: 15 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
    modalTitle: { fontSize: 18, fontWeight: "900", color: "#1E293B" },
    modalBtn: { height: 50, borderRadius: 12, overflow: "hidden", marginTop: 10 },
    modalBtnGrad: { flex: 1, alignItems: "center", justifyContent: "center" },
    modalBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
});
