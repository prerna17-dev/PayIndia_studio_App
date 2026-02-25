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
    dob: string;
    gender: string;
    mobileNumber: string;
    email: string;
    category: "General / Open" | "";

    // B. Family Details
    fatherName: string;
    motherName: string;
    spouseName: string;
    familyMembersCount: string;
    familyOccupation: "Service" | "Agriculture" | "Business" | "Labor" | "Other" | "";

    // C. Income Details
    incomeSalary: string;
    incomeAgri: string;
    incomeBusiness: string;
    incomeOther: string;
    totalAnnualIncome: number;

    // D. Asset Details
    flatSize: string;
    plotSize: string;
    locationType: "Municipal" | "Non-Municipal" | "";
    agriLandDetails: string;
    ownershipStatus: string;

    // Declaration
    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    incomeCert: DocumentType | null;
    proofOfIncome: DocumentType[]; // Multiple allowed
    propertyDocs: DocumentType[]; // Multiple allowed
    idProof: DocumentType | null;
    residenceProof: DocumentType | null;
    selfDeclaration: DocumentType | null;
    photo: DocumentType | null;
    casteCert: DocumentType | null;
    [key: string]: DocumentType | DocumentType[] | null;
}

export default function NewEWSCertificateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [isEditingMode, setIsEditingMode] = useState(false);

    const [documents, setDocuments] = useState<DocumentsState>({
        incomeCert: null,
        proofOfIncome: [],
        propertyDocs: [],
        idProof: null,
        residenceProof: null,
        selfDeclaration: null,
        photo: null,
        casteCert: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        dob: "",
        gender: "",
        mobileNumber: "",
        email: "",
        category: "",
        fatherName: "",
        motherName: "",
        spouseName: "",
        familyMembersCount: "",
        familyOccupation: "",
        incomeSalary: "0",
        incomeAgri: "0",
        incomeBusiness: "0",
        incomeOther: "0",
        totalAnnualIncome: 0,
        flatSize: "0",
        plotSize: "0",
        locationType: "",
        agriLandDetails: "",
        ownershipStatus: "",
        declaration: false,
        finalConfirmation: false,
    });

    // Sync total income
    useEffect(() => {
        const total =
            (parseFloat(formData.incomeSalary) || 0) +
            (parseFloat(formData.incomeAgri) || 0) +
            (parseFloat(formData.incomeBusiness) || 0) +
            (parseFloat(formData.incomeOther) || 0);
        setFormData(prev => ({ ...prev, totalAnnualIncome: total }));
    }, [formData.incomeSalary, formData.incomeAgri, formData.incomeBusiness, formData.incomeOther]);

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
                router.replace("/ews-certificate-services");
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep]);

    const pickDocument = async (docType: keyof DocumentsState, isMultiple = false) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
                multiple: isMultiple
            });

            if (result.canceled === false && result.assets) {
                const newFiles = result.assets.map(asset => ({
                    name: asset.name,
                    size: asset.size,
                    uri: asset.uri
                }));

                // Check size for each
                for (const file of newFiles) {
                    if (file.size && file.size > 5 * 1024 * 1024) {
                        Alert.alert("File Too Large", `File ${file.name} is larger than 5MB`);
                        return;
                    }
                }

                if (isMultiple) {
                    setDocuments(prev => ({
                        ...prev,
                        [docType]: [...(prev[docType] as DocumentType[]), ...newFiles]
                    }));
                } else {
                    setDocuments(prev => ({
                        ...prev,
                        [docType]: newFiles[0]
                    }));
                }
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const removeDocument = (docType: keyof DocumentsState, index?: number) => {
        if (index !== undefined && Array.isArray(documents[docType])) {
            const newList = [...(documents[docType] as DocumentType[])];
            newList.splice(index, 1);
            setDocuments(prev => ({ ...prev, [docType]: newList }));
        } else {
            setDocuments(prev => ({ ...prev, [docType]: Array.isArray(documents[docType]) ? [] : null }));
        }
    };

    const formatDob = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        return formatted;
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            // Validation
            if (!formData.fullName || formData.aadhaarNumber.length !== 12 || !formData.dob || !formData.category || !formData.declaration) {
                Alert.alert("Required", "Please fill all mandatory details and accept declaration");
                return;
            }

            // Income Validation
            if (formData.totalAnnualIncome >= 800000) {
                Alert.alert("Ineligible", "Family income must be below ₹8,00,000 per annum for EWS Certificate.");
                return;
            }

            // Asset Validation
            if (parseFloat(formData.flatSize) >= 1000) {
                Alert.alert("Asset Limit Exceeded", "Residential flat size must be below 1000 sq. ft.");
                return;
            }

            const plotLimit = formData.locationType === "Municipal" ? 100 : 200;
            if (parseFloat(formData.plotSize) >= plotLimit) {
                Alert.alert("Asset Limit Exceeded", `Residential plot size must be below ${plotLimit} sq. yards in ${formData.locationType} areas.`);
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
            if (!documents.incomeCert || documents.proofOfIncome.length === 0 || documents.propertyDocs.length === 0 || !documents.idProof || !documents.residenceProof || !documents.selfDeclaration || !documents.photo || !documents.casteCert) {
                Alert.alert("Documents Required", "Please upload all mandatory documents to proceed.");
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
                const refId = "EWS" + Math.random().toString(36).substr(2, 9).toUpperCase();
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
                    <Text style={styles.successSubtitle}>Your EWS Certificate application has been received successfully.</Text>
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
                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/ews-certificate-services")}>
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
                            router.replace("/ews-certificate-services");
                        }
                    }}>
                        <Ionicons name={isEditingMode ? "close" : "arrow-back"} size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New EWS Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for fresh certificate</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Applicant Details" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input value={formData.fullName} onChangeText={(v: string) => setFormData({ ...formData, fullName: v })} placeholder="Enter full name" icon="person-outline" />

                                <Label text="Aadhaar Number *" />
                                <Input value={formData.aadhaarNumber} onChangeText={(v: string) => setFormData({ ...formData, aadhaarNumber: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />

                                <Label text="Date of Birth *" />
                                <Input value={formData.dob} onChangeText={(v: string) => setFormData({ ...formData, dob: formatDob(v) })} placeholder="DD/MM/YYYY" keyboardType="number-pad" maxLength={10} icon="calendar-outline" />

                                <Label text="Gender *" />
                                <View style={styles.genderRow}>
                                    {["Male", "Female", "Other"].map(g => (
                                        <TouchableOpacity key={g} style={[styles.chip, formData.gender === g && styles.chipActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                            <Text style={[styles.chipText, formData.gender === g && styles.chipTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />

                                <Label text="Email (Optional)" />
                                <Input value={formData.email} onChangeText={(v: string) => setFormData({ ...formData, email: v })} placeholder="Email address" icon="mail-outline" />

                                <Label text="Category *" />
                                <TouchableOpacity style={[styles.chip, formData.category === "General / Open" && styles.chipActive]} onPress={() => setFormData({ ...formData, category: "General / Open" })}>
                                    <Text style={[styles.chipText, formData.category === "General / Open" && styles.chipTextActive]}>General / Open</Text>
                                </TouchableOpacity>
                                <Text style={styles.hintText}>Only General category candidates can apply for EWS.</Text>
                            </View>

                            <SectionTitle title="Family Details" icon="people" />
                            <View style={styles.formCard}>
                                <Label text="Father's Name *" />
                                <Input value={formData.fatherName} onChangeText={(v: string) => setFormData({ ...formData, fatherName: v })} placeholder="Father's Name" icon="person-outline" />
                                <Label text="Mother's Name *" />
                                <Input value={formData.motherName} onChangeText={(v: string) => setFormData({ ...formData, motherName: v })} placeholder="Mother's Name" icon="person-outline" />
                                <Label text="Spouse Name (if applicable)" />
                                <Input value={formData.spouseName} onChangeText={(v: string) => setFormData({ ...formData, spouseName: v })} placeholder="Spouse Name" icon="person-outline" />
                                <Label text="Number of Family Members *" />
                                <Input value={formData.familyMembersCount} onChangeText={(v: string) => setFormData({ ...formData, familyMembersCount: v.replace(/\D/g, '') })} placeholder="Count" keyboardType="number-pad" icon="people-outline" />
                                <Label text="Family Occupation Type *" />
                                <View style={styles.radioGroup}>
                                    {["Service", "Agriculture", "Business", "Labor", "Other"].map(o => (
                                        <TouchableOpacity key={o} style={[styles.chip, formData.familyOccupation === o && styles.chipActive]} onPress={() => setFormData({ ...formData, familyOccupation: o as any })}>
                                            <Text style={[styles.chipText, formData.familyOccupation === o && styles.chipTextActive]}>{o}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <SectionTitle title="Income Details (Annual)" icon="cash" />
                            <View style={styles.formCard}>
                                <Label text="Salary Income" />
                                <Input value={formData.incomeSalary} onChangeText={(v: string) => setFormData({ ...formData, incomeSalary: v.replace(/\D/g, '') })} placeholder="Amount from salary" keyboardType="number-pad" icon="wallet-outline" />
                                <Label text="Agriculture Income" />
                                <Input value={formData.incomeAgri} onChangeText={(v: string) => setFormData({ ...formData, incomeAgri: v.replace(/\D/g, '') })} placeholder="Amount from agri" keyboardType="number-pad" icon="leaf-outline" />
                                <Label text="Business Income" />
                                <Input value={formData.incomeBusiness} onChangeText={(v: string) => setFormData({ ...formData, incomeBusiness: v.replace(/\D/g, '') })} placeholder="Amount from business" keyboardType="number-pad" icon="briefcase-outline" />
                                <Label text="Other Income" />
                                <Input value={formData.incomeOther} onChangeText={(v: string) => setFormData({ ...formData, incomeOther: v.replace(/\D/g, '') })} placeholder="Amount from other sources" keyboardType="number-pad" icon="receipt-outline" />

                                <View style={styles.totalIncomeBox}>
                                    <Text style={styles.totalIncomeLabel}>Total Annual Family Income:</Text>
                                    <Text style={[styles.totalIncomeValue, formData.totalAnnualIncome >= 800000 && { color: '#D32F2F' }]}>₹ {formData.totalAnnualIncome.toLocaleString()}</Text>
                                </View>
                                {formData.totalAnnualIncome >= 800000 && (
                                    <View style={styles.warningBox}>
                                        <Ionicons name="warning" size={16} color="#D32F2F" />
                                        <Text style={styles.warningText}>Income exceeds ₹8L limit for eligibility.</Text>
                                    </View>
                                )}
                            </View>

                            <SectionTitle title="Asset Details" icon="home" />
                            <View style={styles.formCard}>
                                <Label text="Residential Flat Size (sq. ft.)" />
                                <Input value={formData.flatSize} onChangeText={(v: string) => setFormData({ ...formData, flatSize: v.replace(/\D/g, '') })} placeholder="e.g. 850" keyboardType="number-pad" icon="business-outline" />
                                {parseFloat(formData.flatSize) >= 1000 && <Text style={styles.warningTextSmall}>Must be below 1000 sq. ft.</Text>}

                                <Label text="Location Type *" />
                                <View style={styles.genderRow}>
                                    {["Municipal", "Non-Municipal"].map(l => (
                                        <TouchableOpacity key={l} style={[styles.chip, formData.locationType === l && styles.chipActive]} onPress={() => setFormData({ ...formData, locationType: l as any })}>
                                            <Text style={[styles.chipText, formData.locationType === l && styles.chipTextActive]}>{l}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Residential Plot Size (sq. yards)" />
                                <Input value={formData.plotSize} onChangeText={(v: string) => setFormData({ ...formData, plotSize: v.replace(/\D/g, '') })} placeholder="e.g. 50" keyboardType="number-pad" icon="map-outline" />
                                {formData.locationType === "Municipal" && parseFloat(formData.plotSize) >= 100 && <Text style={styles.warningTextSmall}>Must be below 100 sq. yards in Municipal area.</Text>}
                                {formData.locationType === "Non-Municipal" && parseFloat(formData.plotSize) >= 200 && <Text style={styles.warningTextSmall}>Must be below 200 sq. yards in Non-Municipal area.</Text>}

                                <Label text="Agricultural Land Details (if any)" />
                                <Input value={formData.agriLandDetails} onChangeText={(v: string) => setFormData({ ...formData, agriLandDetails: v })} placeholder="e.g. 2 Acres, Village name" multiline icon="leaf-outline" />

                                <Label text="Property Ownership Status *" />
                                <Input value={formData.ownershipStatus} onChangeText={(v: string) => setFormData({ ...formData, ownershipStatus: v })} placeholder="e.g. Owned / Rented / Family Property" icon="key-outline" />
                            </View>

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <Ionicons name={formData.declaration ? "checkbox" : "square-outline"} size={24} color={formData.declaration ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I declare that my family income is below ₹8 Lakhs annually and I do not belong to SC/ST/OBC reserved category.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Standard Documents" icon="document-text" />
                            <View style={styles.docList}>
                                <DocUploadItem title="Income Certificate (Tehsildar) *" hint="Issued by Competent Authority" isUploaded={!!documents.incomeCert} filename={documents.incomeCert?.name} onUpload={() => pickDocument('incomeCert')} onRemove={() => removeDocument('incomeCert')} icon="file-certificate" color="#0D47A1" />

                                <DocUploadItem title="ID Proof *" hint="Aadhaar / PAN / Voter ID / Passport" isUploaded={!!documents.idProof} filename={documents.idProof?.name} onUpload={() => pickDocument('idProof')} onRemove={() => removeDocument('idProof')} icon="card-account-details" color="#1565C0" />

                                <DocUploadItem title="Residential Proof *" hint="Ration Card / Electricity Bill / Domicile" isUploaded={!!documents.residenceProof} filename={documents.residenceProof?.name} onUpload={() => pickDocument('residenceProof')} onRemove={() => removeDocument('residenceProof')} icon="map-marker-radius" color="#455A64" />

                                <DocUploadItem title="Self-Declaration *" hint="Signed Affidavit" isUploaded={!!documents.selfDeclaration} filename={documents.selfDeclaration?.name} onUpload={() => pickDocument('selfDeclaration')} onRemove={() => removeDocument('selfDeclaration')} icon="file-sign" color="#7B1FA2" />

                                <DocUploadItem title="Photo *" hint="Passport size photograph" isUploaded={!!documents.photo} filename={documents.photo?.name} onUpload={() => pickDocument('photo')} onRemove={() => removeDocument('photo')} icon="camera-account" color="#D81B60" />

                                <DocUploadItem title="Caste/General Proof *" hint="Caste certificate for General category" isUploaded={!!documents.casteCert} filename={documents.casteCert?.name} onUpload={() => pickDocument('casteCert')} onRemove={() => removeDocument('casteCert')} icon="shield-account" color="#2E7D32" />

                                <SectionTitle title="Multi-File Documents" icon="folder-open" />
                                <DocUploadItem title="Proof of Income *" hint="Salary Slips / Form 16 / ITR" isUploaded={documents.proofOfIncome.length > 0} multiCount={documents.proofOfIncome.length} onUpload={() => pickDocument('proofOfIncome', true)} onRemove={() => removeDocument('proofOfIncome')} icon="cash-register" color="#E65100" />

                                <DocUploadItem title="Property Documents *" hint="7/12 / ROR / Ownership Docs" isUploaded={documents.propertyDocs.length > 0} multiCount={documents.propertyDocs.length} onUpload={() => pickDocument('propertyDocs', true)} onRemove={() => removeDocument('propertyDocs')} icon="file-document-multiple" color="#546E7A" />
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Your Application" icon="eye" />
                            <ReviewItem title="Applicant Details" data={[
                                { label: "Full Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "DOB", value: formData.dob },
                                { label: "Gender", value: formData.gender },
                                { label: "Category", value: formData.category },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Income Details" data={[
                                { label: "Salary", value: "₹ " + formData.incomeSalary },
                                { label: "Agriculture", value: "₹ " + formData.incomeAgri },
                                { label: "Business", value: "₹ " + formData.incomeBusiness },
                                { label: "Others", value: "₹ " + formData.incomeOther },
                                { label: "TOTAL", value: "₹ " + formData.totalAnnualIncome },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Asset Details" data={[
                                { label: "Flat Size", value: formData.flatSize + " sq. ft." },
                                { label: "Plot Size", value: formData.plotSize + " sq. yards" },
                                { label: "Location", value: formData.locationType },
                                { label: "Ownership", value: formData.ownershipStatus },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewItem title="Uploaded Documents" data={[
                                { label: "Income Cert", value: documents.incomeCert ? "Uploaded" : "Missing" },
                                { label: "ID Proof", value: documents.idProof ? "Uploaded" : "Missing" },
                                { label: "Residence Proof", value: documents.residenceProof ? "Uploaded" : "Missing" },
                                { label: "Self-Declaration", value: documents.selfDeclaration ? "Uploaded" : "Missing" },
                                { label: "Photo", value: documents.photo ? "Uploaded" : "Missing" },
                                { label: "Proof of Income", value: documents.proofOfIncome.length > 0 ? `${documents.proofOfIncome.length} Files` : "Missing" },
                                { label: "Property Docs", value: documents.propertyDocs.length > 0 ? `${documents.propertyDocs.length} Files` : "Missing" },
                            ]} onEdit={() => { setCurrentStep(2); setIsEditingMode(true); }} />

                            <TouchableOpacity style={[styles.declarationRow, { marginTop: 20 }]} onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}>
                                <Ionicons name={formData.finalConfirmation ? "checkbox" : "square-outline"} size={24} color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that all income and property details submitted are true. I understand that false information may lead to cancellation and legal action.</Text>
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
        </View >
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
const DocUploadItem = ({ title, hint, isUploaded, filename, multiCount, onUpload, onRemove, icon, color }: any) => (
    <TouchableOpacity
        style={[styles.docUploadCard, isUploaded && styles.docUploadCardActive]}
        onPress={onUpload}
    >
        <View style={[styles.docIconCircle, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons
                name={icon as any}
                size={24}
                color={isUploaded ? "#FFF" : color}
                style={isUploaded && { backgroundColor: color, borderRadius: 12, padding: 4 }}
            />
        </View>
        <View style={styles.docTextContent}>
            <Text style={styles.docTitle}>{title}</Text>
            <Text style={styles.docHint}>
                {filename || (multiCount ? `${multiCount} file(s) uploaded` : hint)}
            </Text>
        </View>
        <View style={styles.docActions}>
            {isUploaded ? (
                <TouchableOpacity onPress={onRemove} style={styles.removeIcon}>
                    <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                </TouchableOpacity>
            ) : (
                <View style={styles.uploadIcon}>
                    <Ionicons name="cloud-upload" size={24} color="#94A3B8" />
                </View>
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
    inputRow: { flexDirection: 'row' },
    genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', marginRight: 8, marginBottom: 8 },
    chipActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    chipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    chipTextActive: { color: '#0D47A1', fontWeight: '700' },
    radioGroup: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
    totalIncomeBox: { marginTop: 20, padding: 15, borderRadius: 12, backgroundColor: '#F8FAFC', borderLeftWidth: 4, borderLeftColor: '#0D47A1' },
    totalIncomeLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    totalIncomeValue: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 5 },
    warningBox: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF5F5', padding: 10, borderRadius: 8 },
    warningText: { fontSize: 12, color: '#D32F2F', fontWeight: '600' },
    warningTextSmall: { fontSize: 11, color: '#D32F2F', marginTop: 5, marginLeft: 5 },
    hintText: { fontSize: 12, color: '#64748B', marginTop: 5, fontStyle: 'italic' },
    declarationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4 },
    declarationLabel: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20, fontWeight: '500' },
    docList: { gap: 12 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
    docUploadCardActive: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    docTextContent: { flex: 1, marginLeft: 15 },
    docTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 12, color: '#64748B', marginTop: 2 },
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
