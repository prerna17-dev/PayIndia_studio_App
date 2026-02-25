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
    // A. Applicant Details
    fullName: string;
    aadhaarNumber: string;
    dob: string;
    gender: string;
    mobileNumber: string;
    email: string;

    // B. Family Details
    fatherName: string;
    motherName: string;
    spouseName: string;
    familyMembersCount: string;
    occupation: string;

    // C. Income Details
    annualIncome: string;
    monthlyIncome: string;
    incomeSource: string;
    employerName: string;
    requiredFor: string;

    // D. Address Details
    houseNo: string;
    street: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;

    // Declaration
    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    aadhaarCard: DocumentType | null;
    addressProof: DocumentType | null;
    rationCard: DocumentType | null;
    incomeProof: DocumentType | null;
    selfDeclaration: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewIncomeCertificateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarCard: null,
        addressProof: null,
        rationCard: null,
        incomeProof: null,
        selfDeclaration: null,
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
            Alert.alert("Session Expired", "Please login again to continue.", [
                { text: "OK", onPress: () => router.replace("/auth/login") }
            ]);
        }
    };

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        dob: "",
        gender: "",
        mobileNumber: "",
        email: "",
        fatherName: "",
        motherName: "",
        spouseName: "",
        familyMembersCount: "",
        occupation: "",
        annualIncome: "",
        monthlyIncome: "",
        incomeSource: "",
        employerName: "",
        requiredFor: "",
        houseNo: "",
        street: "",
        village: "",
        taluka: "",
        district: "",
        state: "",
        pincode: "",
        declaration: false,
        finalConfirmation: false,
    });

    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.replace("/income-certificate-services");
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [currentStep]);

    const REQUIRED_DOCS = [
        { id: 'aadhaarCard', name: 'Aadhaar Card *', icon: 'card-account-details', color: '#1565C0', hint: 'Front & Back side' },
        { id: 'addressProof', name: 'Address Proof *', icon: 'home-map-marker', color: '#2E7D32', hint: 'Light Bill / Rent Agreement' },
        { id: 'rationCard', name: 'Ration Card *', icon: 'book-open-variant', color: '#E65100', hint: 'Updated copy required' },
        { id: 'incomeProof', name: 'Income Proof *', icon: 'file-document-outline', color: '#7B1FA2', hint: 'Salary Slip / IT Return' },
        { id: 'selfDeclaration', name: 'Self Declaration *', icon: 'file-sign', color: '#C62828', hint: 'Signed declaration copy' },
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
                    Alert.alert("File Too Large", "Please upload a file smaller than 5MB");
                    return;
                }

                setDocuments((prev) => ({
                    ...prev,
                    [docType]: file,
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const removeDocument = (docType: keyof DocumentsState) => {
        setDocuments((prev) => ({
            ...prev,
            [docType]: null,
        }));
    };

    const handleDOBChange = (text: string) => {
        // Remove non-numeric
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;

        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        }

        setFormData((prev) => ({ ...prev, dob: formatted }));
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            // Validation for Step 1
            if (!formData.fullName || !formData.aadhaarNumber || !formData.dob || !formData.gender || !formData.mobileNumber) {
                Alert.alert("Required", "Please fill mandatory applicant details");
                return;
            }
            if (!formData.fatherName || !formData.motherName || !formData.occupation) {
                Alert.alert("Required", "Please fill mandatory family details");
                return;
            }
            if (!formData.annualIncome || !formData.incomeSource || !formData.requiredFor) {
                Alert.alert("Required", "Please fill mandatory income details");
                return;
            }
            if (!formData.houseNo || !formData.village || !formData.taluka || !formData.pincode) {
                Alert.alert("Required", "Please fill mandatory address details");
                return;
            }
            if (!formData.declaration) {
                Alert.alert("Declaration", "Please accept the declaration to continue");
                return;
            }
            if (formData.aadhaarNumber.length !== 12) {
                Alert.alert("Invalid", "Aadhaar number must be 12 digits");
                return;
            }
            if (formData.mobileNumber.length !== 10) {
                Alert.alert("Invalid", "Mobile number must be 10 digits");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Validation for Step 2
            if (!documents.aadhaarCard || !documents.addressProof || !documents.rationCard || !documents.incomeProof || !documents.selfDeclaration) {
                Alert.alert("Documents Required", "Please upload all mandatory documents to proceed");
                return;
            }
            setCurrentStep(3);
        } else {
            // Step 3 Confirmation
            if (!formData.finalConfirmation) {
                Alert.alert("Confirmation", "Please confirm that all details are accurate");
                return;
            }

            setIsSubmitting(true);

            // Token check before submission
            const submitApplication = async () => {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) {
                    setIsSubmitting(false);
                    Alert.alert("Session Expired", "Please login again to continue.", [
                        { text: "OK", onPress: () => router.replace("/auth/login") }
                    ]);
                    return;
                }

                // Simulate API call
                setTimeout(() => {
                    const refId = "INC" + Math.random().toString(36).substr(2, 9).toUpperCase();
                    setApplicationId(refId);
                    setIsSubmitting(false);
                    setIsSubmitted(true);
                }, 2000);
            };

            submitApplication();
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
                    <Text style={styles.successSubtitle}>Your Income Certificate application has been received successfully.</Text>

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

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/income-certificate-services")}>
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
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (currentStep > 1) setCurrentStep(currentStep - 1);
                        else router.replace("/income-certificate-services");
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Income Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for fresh certificate</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            {/* A. Applicant Details */}
                            <SectionTitle title="Applicant Details" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input
                                    value={formData.fullName}
                                    onChangeText={(text: string) => setFormData({ ...formData, fullName: text })}
                                    placeholder="Enter full name"
                                    icon="person-outline"
                                />

                                <Label text="Aadhaar Number *" />
                                <Input
                                    value={formData.aadhaarNumber}
                                    onChangeText={(text: string) => setFormData({ ...formData, aadhaarNumber: text })}
                                    placeholder="12-digit Aadhaar"
                                    keyboardType="number-pad"
                                    maxLength={12}
                                    icon="card-outline"
                                />

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Date of Birth *" />
                                        <Input
                                            value={formData.dob}
                                            onChangeText={handleDOBChange}
                                            placeholder="DD/MM/YYYY"
                                            maxLength={10}
                                            keyboardType="number-pad"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
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
                                    </View>
                                </View>

                                <Label text="Mobile Number *" />
                                <Input
                                    value={formData.mobileNumber}
                                    onChangeText={(text: string) => setFormData({ ...formData, mobileNumber: text })}
                                    placeholder="10-digit mobile"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    icon="phone-portrait-outline"
                                />

                                <Label text="Email (optional)" />
                                <Input
                                    value={formData.email}
                                    onChangeText={(text: string) => setFormData({ ...formData, email: text })}
                                    placeholder="Email address"
                                    keyboardType="email-address"
                                    icon="mail-outline"
                                />
                            </View>

                            {/* B. Family Details */}
                            <SectionTitle title="Family Details" icon="people" />
                            <View style={styles.formCard}>
                                <Label text="Father's Name *" />
                                <Input
                                    value={formData.fatherName}
                                    onChangeText={(text: string) => setFormData({ ...formData, fatherName: text })}
                                    placeholder="Enter father's name"
                                />

                                <Label text="Mother's Name *" />
                                <Input
                                    value={formData.motherName}
                                    onChangeText={(text: string) => setFormData({ ...formData, motherName: text })}
                                    placeholder="Enter mother's name"
                                />

                                <Label text="Spouse Name (if applicable)" />
                                <Input
                                    value={formData.spouseName}
                                    onChangeText={(text: string) => setFormData({ ...formData, spouseName: text })}
                                    placeholder="Enter spouse name"
                                />

                                <Label text="Number of Family Members" />
                                <Input
                                    value={formData.familyMembersCount}
                                    onChangeText={(text: string) => setFormData({ ...formData, familyMembersCount: text })}
                                    placeholder="Count"
                                    keyboardType="number-pad"
                                />

                                <Label text="Occupation *" />
                                <View style={styles.occupationContainer}>
                                    {["Service", "Business", "Agriculture", "Labor", "Other"].map((o) => (
                                        <TouchableOpacity
                                            key={o}
                                            style={[styles.chip, formData.occupation === o && styles.chipActive]}
                                            onPress={() => setFormData({ ...formData, occupation: o })}
                                        >
                                            <Text style={[styles.chipText, formData.occupation === o && styles.chipTextActive]}>{o}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* C. Income Details */}
                            <SectionTitle title="Income Details" icon="wallet" />
                            <View style={styles.formCard}>
                                <Label text="Total Annual Income *" />
                                <Input
                                    value={formData.annualIncome}
                                    onChangeText={(text: string) => setFormData({ ...formData, annualIncome: text })}
                                    placeholder="e.g. 150000"
                                    keyboardType="number-pad"
                                    icon="cash-outline"
                                />

                                <Label text="Monthly Income" />
                                <Input
                                    value={formData.monthlyIncome}
                                    onChangeText={(text: string) => setFormData({ ...formData, monthlyIncome: text })}
                                    placeholder="e.g. 12500"
                                    keyboardType="number-pad"
                                />

                                <Label text="Income Source *" />
                                <Input
                                    value={formData.incomeSource}
                                    onChangeText={(text: string) => setFormData({ ...formData, incomeSource: text })}
                                    placeholder="e.g. Salary / Business"
                                />

                                <Label text="Employer Name (if salaried)" />
                                <Input
                                    value={formData.employerName}
                                    onChangeText={(text: string) => setFormData({ ...formData, employerName: text })}
                                    placeholder="Company name"
                                />

                                <Label text="Income Certificate Required For *" />
                                <View style={styles.occupationContainer}>
                                    {["Scholarship", "Education", "Government Scheme", "Loan", "Other"].map((r) => (
                                        <TouchableOpacity
                                            key={r}
                                            style={[styles.chip, formData.requiredFor === r && styles.chipActive]}
                                            onPress={() => setFormData({ ...formData, requiredFor: r })}
                                        >
                                            <Text style={[styles.chipText, formData.requiredFor === r && styles.chipTextActive]}>{r}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* D. Residential Address */}
                            <SectionTitle title="Residential Address" icon="location" />
                            <View style={styles.formCard}>
                                <Label text="House / Flat Number *" />
                                <Input
                                    value={formData.houseNo}
                                    onChangeText={(text: string) => setFormData({ ...formData, houseNo: text })}
                                    placeholder="Flat No, Building"
                                />

                                <Label text="Street / Area" />
                                <Input
                                    value={formData.street}
                                    onChangeText={(text: string) => setFormData({ ...formData, street: text })}
                                    placeholder="Street, Landmark"
                                />

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Village / City *" />
                                        <Input
                                            value={formData.village}
                                            onChangeText={(text: string) => setFormData({ ...formData, village: text })}
                                            placeholder="City"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Taluka *" />
                                        <Input
                                            value={formData.taluka}
                                            onChangeText={(text: string) => setFormData({ ...formData, taluka: text })}
                                            placeholder="Taluka"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="District *" />
                                        <Input
                                            value={formData.district}
                                            onChangeText={(text: string) => setFormData({ ...formData, district: text })}
                                            placeholder="District"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="State *" />
                                        <Input
                                            value={formData.state}
                                            onChangeText={(text: string) => setFormData({ ...formData, state: text })}
                                            placeholder="State"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1 }}>
                                        <Label text="PIN Code *" />
                                        <Input
                                            value={formData.pincode}
                                            onChangeText={(text: string) => setFormData({ ...formData, pincode: text })}
                                            placeholder="6-digit"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }} />
                                </View>
                            </View>

                            {/* Declaration */}
                            <TouchableOpacity
                                style={styles.declarationRow}
                                onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}
                            >
                                <Ionicons
                                    name={formData.declaration ? "checkbox" : "square-outline"}
                                    size={24}
                                    color={formData.declaration ? "#0D47A1" : "#94A3B8"}
                                />
                                <Text style={styles.declarationLabel}>
                                    I declare that the income details provided are true and correct to the best of my knowledge.
                                </Text>
                            </TouchableOpacity>
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
                            <SectionTitle title="Review Your Application" icon="eye" />

                            <ReviewItem title="Applicant Details" data={[
                                { label: "Full Name", value: formData.fullName },
                                { label: "Aadhaar", value: formData.aadhaarNumber },
                                { label: "DOB", value: formData.dob },
                                { label: "Gender", value: formData.gender },
                                { label: "Mobile", value: formData.mobileNumber },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewItem title="Income Details" data={[
                                { label: "Annual Income", value: "₹ " + formData.annualIncome },
                                { label: "Source", value: formData.incomeSource },
                                { label: "Required For", value: formData.requiredFor },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewItem title="Documents" data={[
                                { label: "Aadhaar Card", value: documents.aadhaarCard ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Address Proof", value: documents.addressProof ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Ration Card", value: documents.rationCard ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Income Proof", value: documents.incomeProof ? "Uploaded ✅" : "Missing ❌" },
                                { label: "Declaration", value: documents.selfDeclaration ? "Uploaded ✅" : "Missing ❌" },
                            ]} onEdit={() => setCurrentStep(2)} />

                            <TouchableOpacity
                                style={[styles.declarationRow, { marginTop: 20 }]}
                                onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}
                            >
                                <Ionicons
                                    name={formData.finalConfirmation ? "checkbox" : "square-outline"}
                                    size={24}
                                    color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"}
                                />
                                <Text style={styles.declarationLabel}>
                                    I confirm that all submitted documents are genuine and the income declared is accurate. I understand that false information may lead to rejection or legal action.
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#0D47A1', '#1565C0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>
                                {currentStep === 3 ? "Submit Application" : "Continue"}
                            </Text>
                            <Ionicons
                                name={currentStep === 3 ? "checkmark-done" : "arrow-forward"}
                                size={20}
                                color="#FFF"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

// Sub-components
const SectionTitle = ({ title, icon }: { title: string, icon: any }) => (
    <View style={styles.cardHeader}>
        <View style={styles.cardHeaderIcon}>
            <Ionicons name={icon} size={20} color="#0D47A1" />
        </View>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
    </View>
);

const Label = ({ text }: { text: string }) => (
    <Text style={styles.inputLabel}>{text}</Text>
);

const Input = ({ ...props }: any) => (
    <View style={[styles.inputContainer, props.editable === false && { backgroundColor: '#F1F5F9' }]}>
        {props.icon && <Ionicons name={props.icon} size={18} color="#94A3B8" />}
        <TextInput
            style={styles.input}
            placeholderTextColor="#94A3B8"
            {...props}
        />
    </View>
);

const ReviewItem = ({ title, data, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <Text style={styles.reviewSectionTitle}>{title}</Text>
            <TouchableOpacity onPress={onEdit}>
                <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
        </View>
        {data.map((item: any, index: number) => (
            <View key={index} style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{item.label}</Text>
                <Text style={styles.reviewValue}>{item.value}</Text>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1E293B",
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2
    },
    placeholder: {
        width: 32,
    },

    // Step Indicator
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
        color: '#CBD5E1',
    },
    stepNumberActive: {
        color: '#0D47A1',
    },
    stepLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 4,
    },
    stepLabelActive: {
        color: '#1E293B',
    },

    scrollContent: {
        paddingTop: 15,
        paddingHorizontal: 20,
    },
    stepWrapper: {
        flex: 1,
    },

    // Form Elements
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    cardHeaderIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    cardHeaderSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 50,
    },
    input: {
        flex: 1,
        marginLeft: 6,
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    genderBox: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    genderBoxActive: {
        borderColor: '#0D47A1',
        backgroundColor: '#E3F2FD',
    },
    genderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    genderTextActive: {
        color: '#0D47A1',
    },
    occupationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    chipActive: {
        borderColor: '#0D47A1',
        backgroundColor: '#E3F2FD',
    },
    chipText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#0D47A1',
    },
    declarationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        gap: 12,
    },
    declarationLabel: {
        flex: 1,
        fontSize: 13,
        color: '#475569',
        lineHeight: 20,
    },

    // Step 2: Documents
    docList: {
        gap: 12,
        marginTop: 10,
    },
    docUploadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 18,
        padding: 16,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    docUploadCardActive: {
        borderColor: '#C8E6C9',
        backgroundColor: '#F1FBF4',
    },
    docIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    docTextContent: {
        flex: 1,
    },
    docTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    docHint: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },


    // Review
    reviewCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    reviewSectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
    },
    editLink: {
        fontSize: 13,
        color: '#0D47A1',
        fontWeight: '700',
    },
    reviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    reviewLabel: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    reviewValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '700',
        flex: 1,
        textAlign: 'right',
        marginLeft: 20,
    },

    // Bottom Bar
    bottomBar: {
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    continueButton: {
        borderRadius: 16,
        overflow: "hidden",
    },
    buttonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 10,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },

    // Success Screen
    successContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
        backgroundColor: "#FFF",
    },
    successIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#F0FDF4",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1E293B",
    },
    successSubtitle: {
        color: "#64748B",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 20,
    },
    idCard: {
        backgroundColor: "#F8FAFC",
        padding: 24,
        borderRadius: 20,
        width: "100%",
        alignItems: "center",
        marginVertical: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    idLabel: {
        fontSize: 12,
        color: "#94A3B8",
        fontWeight: '700',
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    idValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#0D47A1",
        marginTop: 4,
    },
    successActions: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 8,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
        textAlign: 'center',
    },
    mainBtn: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    btnGrad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    mainBtnText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "800",
    },
});
