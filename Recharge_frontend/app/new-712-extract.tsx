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
    // A. Applicant Details
    fullName: string;
    aadhaarNumber: string;
    mobileNumber: string;
    email: string;

    // B. Property Details
    district: string;
    taluka: string;
    village: string;
    surveyNumber: string;
    subDivisionNumber: string;

    // C. Application Type
    applicationType: "Certified Copy" | "Informational Copy" | "";

    // D. Mode of Application
    applicationMode: "Online" | "Offline" | "";

    // Declaration
    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    applicationForm: DocumentType | null;
    idProof: DocumentType | null;
    ownershipDoc: DocumentType | null;
    propertySupportingDoc: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewSatbaraExtractScreen() {
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
        applicationForm: null,
        idProof: null,
        ownershipDoc: null,
        propertySupportingDoc: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        mobileNumber: "",
        email: "",
        district: "",
        taluka: "",
        village: "",
        surveyNumber: "",
        subDivisionNumber: "",
        applicationType: "",
        applicationMode: "",
        declaration: false,
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
            if (!formData.fullName || formData.aadhaarNumber.length !== 12 || formData.mobileNumber.length !== 10 || !formData.declaration) {
                Alert.alert("Required", "Please fill applicant details and accept declaration");
                return;
            }
            if (!formData.district || !formData.taluka || !formData.village || !formData.surveyNumber) {
                Alert.alert("Required", "Please fill property details (District, Taluka, Village, Survey No)");
                return;
            }
            if (!formData.applicationType || !formData.applicationMode) {
                Alert.alert("Required", "Please select Application Type and Mode");
                return;
            }
            if (formData.applicationMode === "Online" && !isOtpSent) {
                Alert.alert("Verification Required", "Please verify your mobile via OTP for Online application");
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
            if (!documents.applicationForm || !documents.idProof || !documents.ownershipDoc) {
                Alert.alert("Missing Documents", "Please upload Application Form, ID Proof, and Ownership Documents");
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
                Alert.alert("Confirmation", "Please confirm that all details are accurate");
                return;
            }

            setIsSubmitting(true);
            setTimeout(() => {
                const refId = "SAT" + Math.random().toString(36).substr(2, 9).toUpperCase();
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
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={styles.successTitle}>Application Submitted!</Text>
                    <Text style={styles.successSubtitle}>Your 7/12 Extract application has been received successfully.</Text>
                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <Text style={styles.idValue}>{applicationId}</Text>
                    </View>
                    <View style={styles.successActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}><Ionicons name="download-outline" size={24} color="#0D47A1" /></View>
                            <Text style={styles.actionText}>Download{"\n"}Receipt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F1F8E9' }]}><Ionicons name="time-outline" size={24} color="#2E7D32" /></View>
                            <Text style={styles.actionText}>Track{"\n"}Status</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/satbara-services")}>
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
                        <Text style={styles.headerTitle}>New 7/12 Extract</Text>
                        <Text style={styles.headerSubtitle}>Land Record Application</Text>
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
                                <Input value={formData.fullName} onChangeText={(v: string) => setFormData({ ...formData, fullName: v })} placeholder="Enter full name" icon="person-outline" />

                                <Label text="Aadhaar Number *" />
                                <Input value={formData.aadhaarNumber} onChangeText={(v: string) => setFormData({ ...formData, aadhaarNumber: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />

                                <Label text="Mobile Number *" />
                                <View style={styles.otpInputContainer}>
                                    <View style={{ flex: 1 }}>
                                        <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    <TouchableOpacity style={[styles.otpBtn, isOtpSent && styles.otpBtnDisabled]} onPress={handleSendOtp}>
                                        <Text style={styles.otpBtnText}>{isOtpSent ? "Resend" : "Send OTP"}</Text>
                                    </TouchableOpacity>
                                </View>

                                {isOtpSent && (
                                    <View style={{ marginTop: 10 }}>
                                        <Label text="Enter OTP *" />
                                        <Input value={otp} onChangeText={setOtp} placeholder="6-digit OTP" keyboardType="number-pad" maxLength={6} icon="shield-checkmark-outline" />
                                    </View>
                                )}

                                <Label text="Email (Optional)" />
                                <Input value={formData.email} onChangeText={(v: string) => setFormData({ ...formData, email: v })} placeholder="Email address" icon="mail-outline" />
                            </View>

                            <SectionTitle title="Property Details" icon="map" />
                            <View style={styles.formCard}>
                                <Label text="District *" />
                                <Input value={formData.district} onChangeText={(v: string) => setFormData({ ...formData, district: v })} placeholder="Enter District" icon="location-outline" />

                                <Label text="Taluka *" />
                                <Input value={formData.taluka} onChangeText={(v: string) => setFormData({ ...formData, taluka: v })} placeholder="Enter Taluka" icon="navigate-outline" />

                                <Label text="Village *" />
                                <Input value={formData.village} onChangeText={(v: string) => setFormData({ ...formData, village: v })} placeholder="Enter Village" icon="business-outline" />

                                <Label text="Survey Number / Gat Number *" />
                                <Input value={formData.surveyNumber} onChangeText={(v: string) => setFormData({ ...formData, surveyNumber: v })} placeholder="e.g. 104 or 55/2" icon="grid-outline" />

                                <Label text="Sub-Division Number" />
                                <Input value={formData.subDivisionNumber} onChangeText={(v: string) => setFormData({ ...formData, subDivisionNumber: v })} placeholder="e.g. 3/A (if any)" icon="list-outline" />
                            </View>

                            <SectionTitle title="Application Type" icon="options" />
                            <View style={styles.formCard}>
                                <Label text="Select Type *" />
                                <View style={styles.genderRow}>
                                    {["Certified Copy", "Informational Copy"].map(t => (
                                        <TouchableOpacity key={t} style={[styles.chip, formData.applicationType === t && styles.chipActive]} onPress={() => setFormData({ ...formData, applicationType: t as any })}>
                                            <Text style={[styles.chipText, formData.applicationType === t && styles.chipTextActive]}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Mode of Application *" />
                                <View style={styles.genderRow}>
                                    {["Online", "Offline"].map(m => (
                                        <TouchableOpacity key={m} style={[styles.chip, formData.applicationMode === m && styles.chipActive]} onPress={() => setFormData({ ...formData, applicationMode: m as any })}>
                                            <Text style={[styles.chipText, formData.applicationMode === m && styles.chipTextActive]}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {formData.applicationMode === 'Online' && (
                                    <View style={styles.infoBox}>
                                        <Ionicons name="information-circle" size={18} color="#0D47A1" />
                                        <Text style={styles.infoBoxText}>Online mode requires e-KYC using Aadhaar + Mobile OTP verification.</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <Ionicons name={formData.declaration ? "checkbox" : "square-outline"} size={24} color={formData.declaration ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that the property details provided are true to my knowledge.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Required Documents" icon="document-text" />
                            <View style={styles.docList}>
                                <DocUploadItem title="Application Form *" hint="Duly filled and signed" isUploaded={!!documents.applicationForm} filename={documents.applicationForm?.name} onUpload={() => pickDocument('applicationForm')} onRemove={() => removeDocument('applicationForm')} icon="file-document" color="#0D47A1" />

                                <DocUploadItem title="Identity Proof *" hint="Aadhaar / Voter ID / DL" isUploaded={!!documents.idProof} filename={documents.idProof?.name} onUpload={() => pickDocument('idProof')} onRemove={() => removeDocument('idProof')} icon="card-account-details" color="#1565C0" />

                                <DocUploadItem title="Land Ownership Docs *" hint="Sale Deed / Index II" isUploaded={!!documents.ownershipDoc} filename={documents.ownershipDoc?.name} onUpload={() => pickDocument('ownershipDoc')} onRemove={() => removeDocument('ownershipDoc')} icon="certificate" color="#2E7D32" />

                                <DocUploadItem title="Supporting property document" hint="Optional" isUploaded={!!documents.propertySupportingDoc} filename={documents.propertySupportingDoc?.name} onUpload={() => pickDocument('propertySupportingDoc')} onRemove={() => removeDocument('propertySupportingDoc')} icon="folder-open" color="#455A64" />
                            </View>

                            <View style={[styles.infoBox, { marginTop: 20 }]}>
                                <Ionicons name="alert-circle" size={20} color="#E65100" />
                                <Text style={styles.infoBoxText}>Survey / Gat number in documents must match the entered property details.</Text>
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Your Application" icon="eye" />
                            <ReviewItem title="Applicant Details" data={[
                                { label: "Full Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "Mobile", value: formData.mobileNumber },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Property Details" data={[
                                { label: "Location", value: `${formData.village}, ${formData.taluka}, ${formData.district}` },
                                { label: "Survey/Gat No.", value: formData.surveyNumber },
                                { label: "Sub-Division", value: formData.subDivisionNumber || "N/A" },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Application Info" data={[
                                { label: "Copy Type", value: formData.applicationType },
                                { label: "Mode", value: formData.applicationMode },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Uploaded Documents" data={[
                                { label: "Form", value: documents.applicationForm ? "Uploaded" : "Missing" },
                                { label: "ID Proof", value: documents.idProof ? "Uploaded" : "Missing" },
                                { label: "Ownership", value: documents.ownershipDoc ? "Uploaded" : "Missing" },
                            ]} onEdit={() => { setCurrentStep(2); setIsEditingMode(true); }} />

                            <TouchableOpacity style={[styles.declarationRow, { marginTop: 20 }]} onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}>
                                <Ionicons name={formData.finalConfirmation ? "checkbox" : "square-outline"} size={24} color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that all details are accurate and the ownership documents are true.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buttonGradient}>
                            {isSubmitting ? <ActivityIndicator color="#FFF" size="small" /> : (
                                <>
                                    <Text style={styles.buttonText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                                    <Ionicons name={currentStep === 3 ? "checkmark-done" : "arrow-forward"} size={20} color="#FFF" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const SectionTitle = ({ title, icon }: { title: string, icon: any }) => (
    <View style={styles.cardHeader}>
        <View style={styles.cardHeaderIcon}>
            <Ionicons name={icon as any} size={20} color="#0D47A1" />
        </View>
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
            <Text style={styles.docHint}>{filename || hint || "Upload mandatory document"}</Text>
        </View>
        <View style={styles.docActions}>
            {isUploaded ? (
                <TouchableOpacity onPress={onRemove} style={styles.removeIcon}><Ionicons name="checkmark-circle" size={24} color="#2E7D32" /></TouchableOpacity>
            ) : (
                <View style={styles.uploadIcon}><Ionicons name="cloud-upload" size={24} color="#94A3B8" /></View>
            )}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    safeArea: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: "#FFFFFF" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
    headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
    placeholder: { width: 32 },
    stepIndicatorContainer: { backgroundColor: '#FFF', paddingBottom: 20, paddingHorizontal: 30 },
    progressLine: { position: 'absolute', top: 17, left: 60, right: 60, height: 2, backgroundColor: '#F1F5F9' },
    progressLineActive: { height: '100%', backgroundColor: '#0D47A1' },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { alignItems: 'center' },
    stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    stepCircleActive: { borderColor: '#0D47A1' },
    stepCircleCompleted: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    stepNumber: { fontSize: 14, fontWeight: '700', color: '#CBD5E1' },
    stepNumberActive: { color: '#0D47A1' },
    stepLabel: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 6 },
    stepLabelActive: { color: '#0D47A1' },
    scrollContent: { padding: 20 },
    stepWrapper: {},
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 10 },
    cardHeaderIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
    cardHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    formCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 12 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 50 },
    input: { flex: 1, fontSize: 14, color: '#1E293B', fontWeight: '500' },
    otpInputContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    otpBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#BBDEFB' },
    otpBtnDisabled: { opacity: 0.6 },
    otpBtnText: { color: '#0D47A1', fontWeight: '700', fontSize: 12 },
    genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', marginRight: 8, marginBottom: 8 },
    chipActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    chipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    chipTextActive: { color: '#0D47A1', fontWeight: '700' },
    infoBox: { flexDirection: 'row', backgroundColor: '#F1F8FE', padding: 12, borderRadius: 12, gap: 10, marginTop: 12 },
    infoBoxText: { flex: 1, fontSize: 12, color: '#0D47A1', lineHeight: 18 },
    declarationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4 },
    declarationLabel: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20, fontWeight: '500' },
    docList: { gap: 12 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
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
    reviewSectionTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1', textTransform: 'uppercase' },
    editLink: { fontSize: 13, fontWeight: '700', color: '#1565C0' },
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
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 25, width: '100%', alignItems: 'center', marginBottom: 35, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    idValue: { fontSize: 28, fontWeight: '900', color: '#0D47A1' },
    successActions: { flexDirection: 'row', gap: 15, marginBottom: 35 },
    actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    actionIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    actionText: { fontSize: 12, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    mainBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
});
