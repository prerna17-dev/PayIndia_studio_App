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
    ActivityIndicator,
} from "react-native";

interface MemberType {
    id: string;
    name: string;
    aadhaar: string;
    dob: string;
    relationship: string;
    gender: string;
}

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // Head of Family
    fullName: string;
    aadhaarNumber: string;
    mobileNumber: string;
    dob: string;
    gender: string;
    // Address
    houseNo: string;
    street: string;
    village: string;
    district: string;
    state: string;
    pincode: string;
    durationOfStay: string;
    // Income
    totalIncome: string;
    incomeCategory: string;
    occupation: string;
    // Gas
    gasConsumerNo: string;
    gasAgencyName: string;
    gasStatus: string;
}

interface DocumentsState {
    addressProof: DocumentType | null;
    incomeCert: DocumentType | null;
    headId: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewRationCardScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        mobileNumber: "",
        dob: "",
        gender: "",
        houseNo: "",
        street: "",
        village: "",
        district: "",
        state: "",
        pincode: "",
        durationOfStay: "",
        totalIncome: "",
        incomeCategory: "",
        occupation: "",
        gasConsumerNo: "",
        gasAgencyName: "",
        gasStatus: "Not Available",
    });

    const [members, setMembers] = useState<MemberType[]>([]);
    const [documents, setDocuments] = useState<DocumentsState>({
        addressProof: null,
        incomeCert: null,
        headId: null,
    });

    // Handle back
    useEffect(() => {
        const backAction = () => {
            if (isSubmitted) {
                router.replace("/ration-card-services");
                return true;
            }
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.replace("/ration-card-services");
                return true;
            }
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep, isSubmitted]);

    const REQUIRED_DOCS = [
        { id: 'addressProof', name: 'Address Proof *', icon: 'home-map-marker', color: '#1565C0', hint: 'Utility Bill / Rent Agreement' },
        { id: 'incomeCert', name: 'Income Certificate *', icon: 'file-document-outline', color: '#2E7D32', hint: 'Tehsildar / Authorized Signatory' },
        { id: 'headId', name: 'Identity Proof (Head) *', icon: 'card-account-details', color: '#E65100', hint: 'Aadhaar / Passport' },
    ];

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
            });
            if (result.canceled === false && result.assets && result.assets[0]) {
                const file = result.assets[0];
                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Please upload a file smaller than 5MB");
                    return;
                }
                setDocuments((prev) => ({ ...prev, [docType]: file }));
            }
        } catch (e) {
            Alert.alert("Error", "Upload failed");
        }
    };

    const addMember = () => {
        const newMember: MemberType = {
            id: Date.now().toString(),
            name: "",
            aadhaar: "",
            dob: "",
            relationship: "",
            gender: "",
        };
        setMembers([...members, newMember]);
    };

    const updateMember = (id: string, updates: Partial<MemberType>) => {
        setMembers(members.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const removeMember = (id: string) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (!formData.fullName || !formData.aadhaarNumber || !formData.mobileNumber) {
                Alert.alert("Required", "Please fill Head of Family details");
                return;
            }
            if (formData.aadhaarNumber.length !== 12) {
                Alert.alert("Invalid", "Aadhaar must be 12 digits");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.addressProof || !documents.incomeCert || !documents.headId) {
                Alert.alert("Required", "Please upload all mandatory documents");
                return;
            }
            setCurrentStep(3);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setApplicationId("RAT-" + Math.random().toString(36).substr(2, 6).toUpperCase());
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
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
                            {currentStep > step ? (
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            ) : (
                                <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>{step}</Text>
                            )}
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
                    <Text style={styles.successSubtitle}>Your new ration card application has been received.</Text>

                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <Text style={styles.idValue}>{applicationId}</Text>
                    </View>

                    <View style={styles.successActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="download-outline" size={24} color="#0D47A1" />
                            </View>
                            <Text style={styles.actionText}>Download{"\n"}Receipt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F1F8E9' }]}>
                                <Ionicons name="time-outline" size={24} color="#2E7D32" />
                            </View>
                            <Text style={styles.actionText}>Track{"\n"}Status</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/ration-card-services")}>
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.replace("/ration-card-services")}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Ration Card</Text>
                        <Text style={styles.headerSubtitle}>Official Enrollment Service</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {renderStepIndicator()}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.iconBadge}><Ionicons name="person" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Head of Family</Text>
                                    <Text style={styles.sectionSub}>Personal details of applicant</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.inputLabel}>Full Name *</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="As per Aadhaar" value={formData.fullName} onChangeText={t => setFormData({ ...formData, fullName: t })} />
                                </View>

                                <Text style={styles.inputLabel}>Aadhaar Number *</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="12 digit number" keyboardType="number-pad" maxLength={12} value={formData.aadhaarNumber} onChangeText={t => setFormData({ ...formData, aadhaarNumber: t })} />
                                </View>

                                <Text style={styles.inputLabel}>Mobile Number *</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="10 digit mobile" keyboardType="phone-pad" maxLength={10} value={formData.mobileNumber} onChangeText={t => setFormData({ ...formData, mobileNumber: t })} />
                                </View>
                            </View>

                            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                                <View style={styles.iconBadge}><Ionicons name="location" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Residential Address</Text>
                                    <Text style={styles.sectionSub}>Permanent dwelling details</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.inputLabel}>Village / City *</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="Enter locality" value={formData.village} onChangeText={t => setFormData({ ...formData, village: t })} />
                                </View>
                                <Text style={styles.inputLabel}>Pincode *</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder="6 digit area code" keyboardType="number-pad" maxLength={6} value={formData.pincode} onChangeText={t => setFormData({ ...formData, pincode: t })} />
                                </View>
                            </View>

                            <View style={styles.memberSectionHeader}>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.iconBadge}><Ionicons name="people" size={20} color="#0D47A1" /></View>
                                    <View>
                                        <Text style={styles.sectionTitle}>Family Members</Text>
                                        <Text style={styles.sectionSub}>Add all dependents</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.addBtn} onPress={addMember}>
                                    <Ionicons name="add" size={18} color="#FFF" />
                                    <Text style={styles.addBtnText}>Add</Text>
                                </TouchableOpacity>
                            </View>

                            {members.map((m, idx) => (
                                <View key={m.id} style={styles.memberCard}>
                                    <View style={styles.memberHeader}>
                                        <Text style={styles.memberNum}>Member #{idx + 1}</Text>
                                        <TouchableOpacity onPress={() => removeMember(m.id)}>
                                            <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <TextInput style={styles.input} placeholder="Member Name" value={m.name} onChangeText={t => updateMember(m.id, { name: t })} />
                                    </View>
                                    <View style={[styles.inputContainer, { marginTop: 10 }]}>
                                        <TextInput style={styles.input} placeholder="Aadhaar" keyboardType="number-pad" maxLength={12} value={m.aadhaar} onChangeText={t => updateMember(m.id, { aadhaar: t })} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.cardHeaderIcon, { backgroundColor: '#E3F2FD' }]}>
                                    <Ionicons name="document-text" size={20} color="#1565C0" />
                                </View>
                                <View>
                                    <Text style={styles.cardHeaderTitle}>Upload Documents</Text>
                                    <Text style={styles.cardHeaderSubtitle}>Clear photos or PDF (Max 5MB)</Text>
                                </View>
                            </View>

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
                            <View style={styles.sectionHeader}>
                                <View style={styles.iconBadge}><Ionicons name="checkmark-circle" size={20} color="#0D47A1" /></View>
                                <View>
                                    <Text style={styles.sectionTitle}>Review Summary</Text>
                                    <Text style={styles.sectionSub}>Double check all details</Text>
                                </View>
                            </View>

                            <View style={styles.reviewCard}>
                                <Text style={styles.reviewSectionTitle}>Family Overview</Text>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Head Name</Text>
                                    <Text style={styles.reviewValue}>{formData.fullName}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Aadhaar</Text>
                                    <Text style={styles.reviewValue}>{formData.aadhaarNumber}</Text>
                                </View>
                                <View style={styles.reviewItem}>
                                    <Text style={styles.reviewLabel}>Members Added</Text>
                                    <Text style={styles.reviewValue}>{members.length}</Text>
                                </View>
                                <View style={styles.divider} />
                                <Text style={styles.reviewSectionTitle}>Address</Text>
                                <Text style={styles.addressText}>{formData.village}, {formData.pincode}</Text>
                            </View>

                            <View style={styles.declarationBox}>
                                <Ionicons name="information-circle" size={20} color="#0D47A1" />
                                <Text style={styles.declarationText}>
                                    I hereby declare that all provided information is true to the best of my knowledge.
                                    I understand that physical verification may be required.
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={isSubmitting}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.buttonGradient}>
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 2 },

    // Step Indicator (Standardized)
    stepIndicatorContainer: {
        backgroundColor: '#FFF',
        paddingBottom: 20,
        paddingHorizontal: 30,
        position: 'relative',
    },
    progressLine: {
        position: 'absolute',
        top: 16,
        left: 60,
        right: 60,
        height: 2,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
    },
    progressLineActive: {
        height: '100%',
        backgroundColor: '#0D47A1',
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    stepCircleActive: {
        borderColor: '#0D47A1',
        backgroundColor: '#FFF',
    },
    stepCircleCompleted: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
    },
    stepNumberActive: {
        color: '#0D47A1',
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        marginTop: 6,
    },
    stepLabelActive: {
        color: '#0D47A1',
    },

    scrollContent: { padding: 20 },
    stepWrapper: { gap: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    sectionSub: { fontSize: 12, color: '#64748B' },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardHeaderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    cardHeaderSubtitle: {
        fontSize: 12,
        color: '#64748B',
    },

    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 16 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 48 },
    input: { flex: 1, fontSize: 15, color: '#1E293B' },

    memberSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
    addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#0D47A1", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, gap: 6 },
    addBtnText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
    memberCard: { backgroundColor: '#F8FAFC', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    memberHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    memberNum: { fontSize: 14, color: "#0D47A1", fontWeight: "800" },

    // Document Upload (Standardized)
    docList: { gap: 12 },
    docUploadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    docUploadCardActive: {
        borderColor: '#2E7D32',
        backgroundColor: '#F0FDF4',
    },
    docIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    docTextContent: {
        flex: 1,
        gap: 2,
    },
    docTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    docHint: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },

    reviewCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#64748B', shadowRadius: 12 },
    reviewSectionTitle: { fontSize: 12, fontWeight: '800', color: '#0D47A1', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    reviewItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reviewLabel: { fontSize: 14, color: '#64748B' },
    reviewValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    addressText: { fontSize: 14, fontWeight: '600', color: '#1E293B', lineHeight: 20 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
    declarationBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderRadius: 16, padding: 16, marginTop: 20, gap: 12 },
    declarationText: { flex: 1, fontSize: 12, color: '#0D47A1', lineHeight: 18, fontWeight: '600' },

    bottomBar: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    continueButton: { borderRadius: 16, overflow: 'hidden' },
    buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    buttonText: { fontSize: 16, fontWeight: '800', color: '#FFF' },

    successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: "#FFF" },
    successIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B" },
    successSubtitle: { color: "#64748B", textAlign: "center", marginTop: 8, lineHeight: 20 },
    idCard: { backgroundColor: "#F8FAFC", padding: 24, borderRadius: 20, width: "100%", alignItems: "center", marginVertical: 32, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: "#94A3B8", fontWeight: '700', textTransform: "uppercase", letterSpacing: 1 },
    idValue: { fontSize: 28, fontWeight: "800", color: "#0D47A1", marginTop: 4 },
    successActions: { flexDirection: 'row', gap: 20, marginBottom: 40 },
    actionBtn: { alignItems: 'center', gap: 8 },
    actionIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    actionText: { fontSize: 12, color: '#475569', fontWeight: '600', textAlign: 'center' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" }
});
