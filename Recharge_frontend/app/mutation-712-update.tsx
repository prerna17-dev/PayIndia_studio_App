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
    ActivityIndicator
} from "react-native";

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // Applicant Details
    fullName: string;
    aadhaarNumber: string;
    mobileNumber: string;

    // Property Details
    district: string;
    taluka: string;
    village: string;
    surveyNumber: string;

    // Mutation Detail
    mutationReason: "Sale" | "Inheritance" | "Partition" | "Gift Deed" | "Court Order" | "Other" | "";
    otherReason: string;

    // Declaration
    finalConfirmation: boolean;
}

interface DocumentsState {
    previousSatbara: DocumentType | null;
    mutationRecord: DocumentType | null;
    ownershipDoc: DocumentType | null;
    idProof: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function MutationSatbaraUpdateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState("");

    const [documents, setDocuments] = useState<DocumentsState>({
        previousSatbara: null,
        mutationRecord: null,
        ownershipDoc: null,
        idProof: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        mobileNumber: "",
        district: "",
        taluka: "",
        village: "",
        surveyNumber: "",
        mutationReason: "",
        otherReason: "",
        finalConfirmation: false,
    });

    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            if (isEditingMode) {
                setCurrentStep(3);
                setIsEditingMode(false);
                return true;
            }
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.replace("/satbara-services");
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep, isEditingMode]);

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets) {
                const asset = result.assets[0];
                if (asset.size && asset.size > 5 * 1024 * 1024) {
                    Alert.alert("File Too Large", "File size must be below 5MB");
                    return;
                }
                setDocuments(prev => ({
                    ...prev,
                    [docType]: {
                        name: asset.name,
                        size: asset.size,
                        uri: asset.uri
                    }
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const removeDocument = (docType: keyof DocumentsState) => {
        setDocuments(prev => ({ ...prev, [docType]: null }));
    };

    const handleSendOtp = () => {
        if (formData.mobileNumber.length !== 10) {
            Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number");
            return;
        }
        setIsOtpSent(true);
        Alert.alert("OTP Sent", "A verification code has been sent to your mobile number");
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            // Step 1 Validation
            if (!formData.fullName || formData.aadhaarNumber.length !== 12 || formData.mobileNumber.length !== 10) {
                Alert.alert("Required", "Please fill valid applicant details");
                return;
            }
            if (!formData.district || !formData.taluka || !formData.village || !formData.surveyNumber) {
                Alert.alert("Required", "Please fill all property details");
                return;
            }
            if (!formData.mutationReason) {
                Alert.alert("Required", "Please select a Mutation Reason");
                return;
            }
            if (formData.mutationReason === "Other" && !formData.otherReason) {
                Alert.alert("Required", "Please specify the mutation reason");
                return;
            }
            if (!isOtpSent) {
                Alert.alert("Verification Required", "Please verify your mobile via OTP");
                return;
            }

            if (isEditingMode) {
                setCurrentStep(3);
                setIsEditingMode(false);
            } else {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            // Mandatory Documents check
            if (!documents.previousSatbara || !documents.mutationRecord || !documents.ownershipDoc || !documents.idProof) {
                Alert.alert("Missing Documents", "Please upload all mandatory documents");
                return;
            }

            if (isEditingMode) {
                setCurrentStep(3);
                setIsEditingMode(false);
            } else {
                setCurrentStep(3);
            }
        } else {
            if (!formData.finalConfirmation) {
                Alert.alert("Confirmation", "Please check the declaration box");
                return;
            }

            setIsSubmitting(true);
            setTimeout(() => {
                const refId = "MUT" + Math.random().toString(36).substr(2, 9).toUpperCase();
                setApplicationId(refId);
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
                {[1, 2, 3].map((s) => (
                    <View key={s} style={styles.stepItem}>
                        <View style={[styles.stepCircle, currentStep >= s && styles.stepCircleActive, currentStep > s && styles.stepCircleCompleted]}>
                            {currentStep > s ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={[styles.stepNumber, currentStep >= s && styles.stepNumberActive]}>{s}</Text>}
                        </View>
                        <Text style={[styles.stepLabel, currentStep >= s && styles.stepLabelActive]}>
                            {s === 1 ? "Details" : s === 2 ? "Documents" : "Review"}
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
                        <Ionicons name="checkmark-done-circle" size={80} color="#1B5E20" />
                    </View>
                    <Text style={styles.successTitle}>Mutation Applied!</Text>
                    <Text style={styles.successSubtitle}>Your Ferfar / Mutation entry request has been recorded.</Text>
                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Application ID</Text>
                        <Text style={styles.idValue}>{applicationId}</Text>
                    </View>
                    <View style={styles.successActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}><Ionicons name="download-outline" size={24} color="#2E7D32" /></View>
                            <Text style={styles.actionText}>Download{"\n"}Receipt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}><Ionicons name="search-outline" size={24} color="#E65100" /></View>
                            <Text style={styles.actionText}>Track{"\n"}Status</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/satbara-services")}>
                        <LinearGradient colors={['#2E7D32', '#1B5E20']} style={styles.btnGrad}>
                            <Text style={styles.mainBtnText}>Back to Land Records</Text>
                            <Ionicons name="home-outline" size={18} color="#FFF" />
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
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (isEditingMode) {
                            setCurrentStep(3);
                            setIsEditingMode(false);
                        } else if (currentStep > 1) {
                            setCurrentStep(currentStep - 1);
                        } else {
                            router.replace("/satbara-services");
                        }
                    }}>
                        <Ionicons name={isEditingMode ? "close" : "arrow-back"} size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Mutation (Ferfar) Update</Text>
                        <Text style={styles.headerSubtitle}>Ownership Record Update</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Applicant Details" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name *" />
                                <Input value={formData.fullName} onChangeText={(v: string) => setFormData({ ...formData, fullName: v })} placeholder="Enter applicant name" icon="person-outline" />

                                <Label text="Aadhaar Number *" />
                                <Input value={formData.aadhaarNumber} onChangeText={(v: string) => setFormData({ ...formData, aadhaarNumber: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />

                                <Label text="Mobile Number *" />
                                <View style={styles.otpInputContainer}>
                                    <View style={{ flex: 1 }}>
                                        <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="Mobile number" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    <TouchableOpacity style={[styles.otpBtn, isOtpSent && styles.otpBtnDisabled]} onPress={handleSendOtp}>
                                        <Text style={styles.otpBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                    </TouchableOpacity>
                                </View>
                                {isOtpSent && (
                                    <View style={{ marginTop: 10 }}>
                                        <Input value={otp} onChangeText={setOtp} placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} icon="shield-checkmark-outline" />
                                    </View>
                                )}
                            </View>

                            <SectionTitle title="Property Details" icon="map" />
                            <View style={styles.formCard}>
                                <Label text="District *" />
                                <Input value={formData.district} onChangeText={(v: string) => setFormData({ ...formData, district: v })} placeholder="District" icon="location-outline" />
                                <Label text="Taluka *" />
                                <Input value={formData.taluka} onChangeText={(v: string) => setFormData({ ...formData, taluka: v })} placeholder="Taluka" icon="navigate-outline" />
                                <Label text="Village *" />
                                <Input value={formData.village} onChangeText={(v: string) => setFormData({ ...formData, village: v })} placeholder="Village" icon="business-outline" />
                                <Label text="Survey / Gat Number *" />
                                <Input value={formData.surveyNumber} onChangeText={(v: string) => setFormData({ ...formData, surveyNumber: v })} placeholder="e.g. 102/1" icon="grid-outline" />
                            </View>

                            <SectionTitle title="Mutation Reason" icon="help-circle" />
                            <View style={styles.formCard}>
                                <Label text="Reason for Update *" />
                                <View style={styles.genderRow}>
                                    {["Sale", "Inheritance", "Partition", "Gift Deed", "Court Order", "Other"].map(r => (
                                        <TouchableOpacity key={r} style={[styles.chip, formData.mutationReason === r && styles.chipActive]} onPress={() => setFormData({ ...formData, mutationReason: r as any })}>
                                            <Text style={[styles.chipText, formData.mutationReason === r && styles.chipTextActive]}>{r}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {formData.mutationReason === "Other" && (
                                    <View style={{ marginTop: 15 }}>
                                        <Label text="Please specify reason *" />
                                        <Input value={formData.otherReason} onChangeText={(v: string) => setFormData({ ...formData, otherReason: v })} placeholder="Explain mutation reason" />
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Mutation Documents" icon="cloud-upload" />
                            <View style={styles.docList}>
                                <DocUploadItem title="Previous 7/12 Extract *" hint="Copy of existing record" isUploaded={!!documents.previousSatbara} filename={documents.previousSatbara?.name} onUpload={() => pickDocument('previousSatbara')} onRemove={() => removeDocument('previousSatbara')} icon="file-document" color="#0D47A1" />

                                <DocUploadItem title="Mutation Application (Ferfar) *" hint="Signed application form" isUploaded={!!documents.mutationRecord} filename={documents.mutationRecord?.name} onUpload={() => pickDocument('mutationRecord')} onRemove={() => removeDocument('mutationRecord')} icon="file-edit" color="#2E7D32" />

                                <DocUploadItem title="Ownership Proof *" hint="Sale/Gift Deed / Index II" isUploaded={!!documents.ownershipDoc} filename={documents.ownershipDoc?.name} onUpload={() => pickDocument('ownershipDoc')} onRemove={() => removeDocument('ownershipDoc')} icon="certificate" color="#E65100" />

                                <DocUploadItem title="Identity Proof *" hint="Aadhaar / Voter ID" isUploaded={!!documents.idProof} filename={documents.idProof?.name} onUpload={() => pickDocument('idProof')} onRemove={() => removeDocument('idProof')} icon="card-account-details" color="#455A64" />
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Mutation Application" icon="checkmark-circle" />
                            <ReviewItem title="Applicant Details" data={[
                                { label: "Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "Mobile", value: formData.mobileNumber },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Property Information" data={[
                                { label: "Location", value: `${formData.village}, ${formData.taluka}, ${formData.district}` },
                                { label: "Survey No.", value: formData.surveyNumber },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Mutation Info" data={[
                                { label: "Reason", value: formData.mutationReason === 'Other' ? formData.otherReason : formData.mutationReason },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Documents Status" data={[
                                { label: "Prev 7/12", value: "Uploaded" },
                                { label: "Application", value: "Uploaded" },
                                { label: "Ownership Proof", value: "Uploaded" },
                            ]} onEdit={() => { setCurrentStep(2); setIsEditingMode(true); }} />

                            <TouchableOpacity style={[styles.declarationRow, { marginTop: 20 }]} onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}>
                                <Ionicons name={formData.finalConfirmation ? "checkbox" : "square-outline"} size={24} color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that the property details and ownership documents submitted are accurate and true.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                        <LinearGradient colors={['#2E7D32', '#1B5E20']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                            {isSubmitting ? <ActivityIndicator color="#FFF" size="small" /> : (
                                <>
                                    <Text style={styles.buttonText}>{currentStep === 3 ? "Submit for Mutation" : "Continue"}</Text>
                                    <Ionicons name={currentStep === 3 ? "shield-checkmark" : "arrow-forward"} size={20} color="#FFF" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

// Reusable components (Same as NewSatbaraExtractScreen)
const SectionTitle = ({ title, icon }: { title: string, icon: any }) => (
    <View style={styles.cardHeader}>
        <View style={styles.cardHeaderIcon}><Ionicons name={icon as any} size={20} color="#0D47A1" /></View>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
    </View>
);
const Label = ({ text }: { text: string }) => <Text style={styles.inputLabel}>{text}</Text>;
const Input = ({ icon, ...props }: any) => (
    <View style={[styles.inputContainer, props.editable === false && { backgroundColor: '#F1F5F9' }]}>
        {icon && <Ionicons name={icon as any} size={18} color="#94A3B8" style={{ marginRight: 10 }} />}
        <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
    </View>
);
const ReviewItem = ({ title, data, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}><Text style={styles.reviewSectionTitle}>{title}</Text><TouchableOpacity onPress={onEdit}><Text style={styles.editLink}>Edit</Text></TouchableOpacity></View>
        {data.map((item: any, index: number) => (
            <View key={index} style={styles.reviewRow}><Text style={styles.reviewLabel}>{item.label}</Text><Text style={styles.reviewValue}>{item.value}</Text></View>
        ))}
    </View>
);
const DocUploadItem = ({ title, hint, isUploaded, filename, onUpload, onRemove, icon, color }: any) => (
    <TouchableOpacity style={[styles.docUploadCard, isUploaded && styles.docUploadCardActive]} onPress={onUpload}>
        <View style={[styles.docIconCircle, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon as any} size={24} color={isUploaded ? "#FFF" : color} style={isUploaded && { backgroundColor: color, borderRadius: 12, padding: 4 }} />
        </View>
        <View style={styles.docTextContent}>
            <Text style={styles.docTitle}>{title}</Text>
            <Text style={styles.docHint}>{filename || hint || "Mandatory"}</Text>
        </View>
        <View style={styles.docActions}>{isUploaded ? <TouchableOpacity onPress={onRemove}><Ionicons name="checkmark-circle" size={24} color="#2E7D32" /></TouchableOpacity> : <Ionicons name="cloud-upload" size={24} color="#94A3B8" />}</View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFFFFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
    placeholder: { width: 32 },
    stepIndicatorContainer: { backgroundColor: '#FFF', paddingBottom: 20, paddingHorizontal: 30 },
    progressLine: { position: 'absolute', top: 17, left: 60, right: 60, height: 2, backgroundColor: '#F1F5F9' },
    progressLineActive: { height: '100%', backgroundColor: '#2E7D32' },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { alignItems: 'center' },
    stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    stepCircleActive: { borderColor: '#2E7D32' },
    stepCircleCompleted: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
    stepNumber: { fontSize: 14, fontWeight: '700', color: '#CBD5E1' },
    stepNumberActive: { color: '#2E7D32' },
    stepLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#2E7D32' },
    scrollContent: { padding: 20 },
    stepWrapper: {},
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 10 },
    cardHeaderIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center' },
    cardHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 12 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 50 },
    input: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500' },
    otpInputContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    otpBtn: { backgroundColor: '#F1F8E9', paddingHorizontal: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#C8E6C9' },
    otpBtnDisabled: { opacity: 0.6 },
    otpBtnText: { color: '#2E7D32', fontWeight: '700', fontSize: 12 },
    genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    chipActive: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
    chipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    chipTextActive: { color: '#2E7D32', fontWeight: '700' },
    declarationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4 },
    declarationLabel: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20, fontWeight: '500' },
    docList: { gap: 10 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    docUploadCardActive: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    docTextContent: { flex: 1, marginLeft: 15 },
    docTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 11, color: '#64748B', marginTop: 2 },
    docActions: { marginLeft: 10 },
    removeIcon: { padding: 4 },
    uploadIcon: { padding: 4 },
    reviewCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
    reviewSectionTitle: { fontSize: 13, fontWeight: '800', color: '#2E7D32', textTransform: 'uppercase' },
    editLink: { fontSize: 13, fontWeight: '700', color: '#2E7D32' },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reviewLabel: { fontSize: 13, color: '#64748B' },
    reviewValue: { fontSize: 13, fontWeight: '700', color: '#1E293B', textAlign: 'right', flex: 1, marginLeft: 20 },
    bottomBar: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    continueButton: { borderRadius: 16, overflow: 'hidden' },
    buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    buttonText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 35, lineHeight: 22 },
    idCard: { backgroundColor: '#F1F8E9', borderRadius: 20, padding: 25, width: '100%', alignItems: 'center', marginBottom: 35 },
    idLabel: { fontSize: 12, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    idValue: { fontSize: 28, fontWeight: '900', color: '#1B5E20' },
    successActions: { flexDirection: 'row', gap: 15, marginBottom: 35 },
    actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    actionIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    actionText: { fontSize: 12, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    mainBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
});
