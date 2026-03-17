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

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
    [key: string]: any;
}

interface FormDataType {
    fullName: string;
    dob: string;
    yob: string;
    gender: string;
    address: string;
    houseNo: string;
    area: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    mobile: string;
    parentName: string;
    parentAadhaar: string;
    relationship: string;
}

interface DocumentsState {
    birthCertificate: DocumentType | null;
    schoolCertificate: DocumentType | null;
    addressProof: DocumentType | null;
    parentAadhaar: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewAadhaarScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [documents, setDocuments] = useState<DocumentsState>({
        birthCertificate: null,
        schoolCertificate: null,
        addressProof: null,
        parentAadhaar: null,
    });
    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        dob: "",
        yob: "",
        gender: "",
        address: "",
        houseNo: "",
        area: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        mobile: "",
        parentName: "",
        parentAadhaar: "",
        relationship: "",
    });

    const [isMinor, setIsMinor] = useState(false);
    const [useYearOnly, setUseYearOnly] = useState(false);

    // Update age and minor status when DOB changes
    useEffect(() => {
        if (formData.dob.length === 10) {
            const minor = checkIsMinor(formData.dob);
            setIsMinor(minor);
        }
    }, [formData.dob]);

    // Handle hardware back button
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

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction,
        );

        return () => backHandler.remove();
    }, [currentStep]);

    // Handle document upload
    const handleDocumentUpload = async (docType: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets[0]) {
                const file = result.assets[0];

                if (file.size && file.size > 5 * 1024 * 1024) {
                    Alert.alert(
                        "File Too Large",
                        "Please upload a file smaller than 5MB",
                    );
                    return;
                }

                setDocuments((prev) => ({
                    ...prev,
                    [docType]: file,
                }));

                Alert.alert("Success", "Document uploaded successfully");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const formatDOB = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        }
        return formatted;
    };

    const checkIsMinor = (dob: string) => {
        if (dob.length !== 10) return false;
        const [day, month, year] = dob.split("/").map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age < 18;
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (
                !formData.fullName ||
                (!formData.dob && !formData.yob) ||
                !formData.gender ||
                !formData.mobile
            ) {
                Alert.alert("Required", "Please fill all mandatory personal details");
                return;
            }
            if (!formData.pincode || !formData.state || !formData.city) {
                Alert.alert("Required", "Please fill complete address details");
                return;
            }
            if (
                isMinor &&
                (!formData.parentName ||
                    !formData.parentAadhaar ||
                    !formData.relationship)
            ) {
                Alert.alert("Required", "Guardian details are mandatory for minors");
                return;
            }
            if (formData.parentAadhaar && formData.parentAadhaar.length !== 12) {
                Alert.alert("Invalid", "Parent Aadhaar must be 12 digits");
                return;
            }
            if (formData.mobile.length !== 10) {
                Alert.alert("Invalid", "Mobile number must be 10 digits");
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!documents.birthCertificate) {
                Alert.alert("Required", "Birth Certificate is mandatory");
                return;
            }
            if (!documents.addressProof) {
                Alert.alert("Required", "Address Proof is mandatory");
                return;
            }
            if (isMinor && !documents.parentAadhaar) {
                Alert.alert(
                    "Required",
                    "Parent's Aadhaar copy is mandatory for minors",
                );
                return;
            }
            setCurrentStep(3);
        } else {
            setIsSubmitting(true);
            // Simulate API call
            setTimeout(() => {
                const enrollmentId = "UID" + Math.random().toString(36).substr(2, 9).toUpperCase();
                setApplicationId(enrollmentId);
                setIsSubmitting(false);
                setIsSubmitted(true);
            }, 2000);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    if (isSubmitted) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.successContainer}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#2E7D32" />
                    </View>
                    <Text style={styles.successTitle}>Application Submitted!</Text>
                    <Text style={styles.successSubtitle}>Your Aadhaar enrollment application has been received successfully.</Text>

                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Enrollment ID</Text>
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

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.back()}>
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
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Aadhaar Enrollment</Text>
                        <Text style={styles.headerSubtitle}>Apply for fresh identification</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {/* Step Indicator */}
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

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* STEP 1: Personal Details */}
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderIcon}>
                                    <Ionicons name="person" size={20} color="#0D47A1" />
                                </View>
                                <View>
                                    <Text style={styles.cardHeaderTitle}>Personal Details</Text>
                                    <Text style={styles.cardHeaderSubtitle}>Please fill mandatory information</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.inputLabel}>Full Name (as per documents) *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex: John Doe"
                                        value={formData.fullName}
                                        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                    />
                                </View>

                                <View style={styles.labelRow}>
                                    <Text style={styles.inputLabel}>{useYearOnly ? "Year of Birth *" : "Date of Birth *"}</Text>
                                    <TouchableOpacity onPress={() => setUseYearOnly(!useYearOnly)}>
                                        <Text style={styles.helperLink}>{useYearOnly ? "Use exact DOB" : "Use year only"}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
                                    {useYearOnly ? (
                                        <TextInput
                                            style={styles.input}
                                            placeholder="YYYY"
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            value={formData.yob}
                                            onChangeText={(text) => setFormData({ ...formData, yob: text })}
                                        />
                                    ) : (
                                        <TextInput
                                            style={styles.input}
                                            placeholder="DD/MM/YYYY"
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            value={formData.dob}
                                            onChangeText={(text) => setFormData({ ...formData, dob: formatDOB(text) })}
                                        />
                                    )}
                                </View>

                                <Text style={styles.inputLabel}>Gender *</Text>
                                <View style={styles.genderContainer}>
                                    {["Male", "Female", "Other"].map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[styles.genderBox, formData.gender === g && styles.genderBoxActive]}
                                            onPress={() => setFormData({ ...formData, gender: g })}
                                        >
                                            <MaterialCommunityIcons
                                                name={g === 'Male' ? 'gender-male' : g === 'Female' ? 'gender-female' : 'gender-transgender'}
                                                size={20}
                                                color={formData.gender === g ? '#0D47A1' : '#64748B'}
                                            />
                                            <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={[styles.cardHeader, { marginTop: 20 }]}>
                                <View style={[styles.cardHeaderIcon, { backgroundColor: '#E0F2F1' }]}>
                                    <Ionicons name="location" size={20} color="#00796B" />
                                </View>
                                <View>
                                    <Text style={styles.cardHeaderTitle}>Address Details</Text>
                                    <Text style={styles.cardHeaderSubtitle}>Where do you stay?</Text>
                                </View>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.inputLabel}>House No / Building *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="home-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Flat/House No., Company"
                                        value={formData.houseNo}
                                        onChangeText={(text) => setFormData({ ...formData, houseNo: text })}
                                    />
                                </View>

                                <Text style={styles.inputLabel}>Area / Locality</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="map-outline" size={18} color="#94A3B8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Area, Street, Sector"
                                        value={formData.area}
                                        onChangeText={(text) => setFormData({ ...formData, area: text })}
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Text style={styles.inputLabel}>City / Taluka *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="City"
                                                value={formData.city}
                                                onChangeText={(text) => setFormData({ ...formData, city: text })}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>District *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="District"
                                                value={formData.district}
                                                onChangeText={(text) => setFormData({ ...formData, district: text })}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1.5, marginRight: 10 }}>
                                        <Text style={styles.inputLabel}>State *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="State"
                                                value={formData.state}
                                                onChangeText={(text) => setFormData({ ...formData, state: text })}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Pincode *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="6-digit"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                value={formData.pincode}
                                                onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <Text style={styles.inputLabel}>Mobile Number *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="phone-portrait-outline" size={18} color="#94A3B8" />
                                    <Text style={styles.countryCode}>+91</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10-digit mobile"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={formData.mobile}
                                        onChangeText={(text) => setFormData({ ...formData, mobile: text })}
                                    />
                                </View>
                            </View>

                            {isMinor && (
                                <View style={styles.minorSection}>
                                    <LinearGradient colors={['#FFF5F5', '#FFF']} style={styles.minorCard}>
                                        <View style={styles.minorHeader}>
                                            <MaterialCommunityIcons name="baby-face-outline" size={24} color="#E53935" />
                                            <Text style={styles.minorTitle}>Minor Details (Below 18)</Text>
                                        </View>

                                        <Text style={styles.inputLabel}>Parent/Guardian Name *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Guardian's full name"
                                                value={formData.parentName}
                                                onChangeText={(text) => setFormData({ ...formData, parentName: text })}
                                            />
                                        </View>

                                        <Text style={styles.inputLabel}>Parent Aadhaar Number *</Text>
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="12-digit Aadhaar"
                                                keyboardType="number-pad"
                                                maxLength={12}
                                                value={formData.parentAadhaar}
                                                onChangeText={(text) => setFormData({ ...formData, parentAadhaar: text })}
                                            />
                                        </View>

                                        <Text style={styles.inputLabel}>Relationship *</Text>
                                        <View style={styles.genderContainer}>
                                            {["Father", "Mother", "Guardian"].map((r) => (
                                                <TouchableOpacity
                                                    key={r}
                                                    style={[styles.genderBox, formData.relationship === r && styles.genderBoxActive]}
                                                    onPress={() => setFormData({ ...formData, relationship: r })}
                                                >
                                                    <Text style={[styles.genderText, formData.relationship === r && styles.genderTextActive]}>{r}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </LinearGradient>
                                </View>
                            )}
                        </View>
                    )}

                    {/* STEP 2: Documents */}
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
                                {/* Birth Certificate */}
                                <TouchableOpacity
                                    style={[styles.docUploadCard, documents.birthCertificate && styles.docUploadCardActive]}
                                    onPress={() => handleDocumentUpload("birthCertificate")}
                                >
                                    <View style={styles.docIconCircle}>
                                        <MaterialCommunityIcons name="calendar-account" size={24} color={documents.birthCertificate ? "#FFF" : "#2196F3"} />
                                    </View>
                                    <View style={styles.docTextContent}>
                                        <Text style={styles.docTitle}>Birth Certificate *</Text>
                                        <Text style={styles.docHint}>{documents.birthCertificate ? documents.birthCertificate.name : "Tap to upload birth proof"}</Text>
                                    </View>
                                    <Ionicons
                                        name={documents.birthCertificate ? "checkmark-circle" : "cloud-upload"}
                                        size={24}
                                        color={documents.birthCertificate ? "#2E7D32" : "#94A3B8"}
                                    />
                                </TouchableOpacity>

                                {/* School Certificate */}
                                <TouchableOpacity
                                    style={[styles.docUploadCard, documents.schoolCertificate && styles.docUploadCardActive]}
                                    onPress={() => handleDocumentUpload("schoolCertificate")}
                                >
                                    <View style={[styles.docIconCircle, { backgroundColor: '#FFF8E1' }]}>
                                        <MaterialCommunityIcons name="school" size={24} color={documents.schoolCertificate ? "#FFF" : "#FFB300"} />
                                    </View>
                                    <View style={styles.docTextContent}>
                                        <Text style={styles.docTitle}>School Certificate *</Text>
                                        <Text style={styles.docHint}>{documents.schoolCertificate ? documents.schoolCertificate.name : "Tap to upload LC/Certificate"}</Text>
                                    </View>
                                    <Ionicons
                                        name={documents.schoolCertificate ? "checkmark-circle" : "cloud-upload"}
                                        size={24}
                                        color={documents.schoolCertificate ? "#2E7D32" : "#94A3B8"}
                                    />
                                </TouchableOpacity>

                                {/* Address Proof */}
                                <TouchableOpacity
                                    style={[styles.docUploadCard, documents.addressProof && styles.docUploadCardActive]}
                                    onPress={() => handleDocumentUpload("addressProof")}
                                >
                                    <View style={[styles.docIconCircle, { backgroundColor: '#E8F5E9' }]}>
                                        <MaterialCommunityIcons name="home-map-marker" size={24} color={documents.addressProof ? "#FFF" : "#43A047"} />
                                    </View>
                                    <View style={styles.docTextContent}>
                                        <Text style={styles.docTitle}>Address Proof *</Text>
                                        <Text style={styles.docHint}>{documents.addressProof ? documents.addressProof.name : "Tap to upload Bill/Ration Card"}</Text>
                                    </View>
                                    <Ionicons
                                        name={documents.addressProof ? "checkmark-circle" : "cloud-upload"}
                                        size={24}
                                        color={documents.addressProof ? "#2E7D32" : "#94A3B8"}
                                    />
                                </TouchableOpacity>

                                {/* Parent Aadhaar - Mandatory for Minors */}
                                {isMinor && (
                                    <TouchableOpacity
                                        style={[styles.docUploadCard, documents.parentAadhaar && styles.docUploadCardActive]}
                                        onPress={() => handleDocumentUpload("parentAadhaar")}
                                    >
                                        <View style={[styles.docIconCircle, { backgroundColor: '#FFEBEE' }]}>
                                            <MaterialCommunityIcons name="account-details" size={24} color={documents.parentAadhaar ? "#FFF" : "#E53935"} />
                                        </View>
                                        <View style={styles.docTextContent}>
                                            <Text style={styles.docTitle}>Parent Aadhaar *</Text>
                                            <Text style={styles.docHint}>{documents.parentAadhaar ? documents.parentAadhaar.name : "Tap to upload guardian's card"}</Text>
                                        </View>
                                        <Ionicons
                                            name={documents.parentAadhaar ? "checkmark-circle" : "cloud-upload"}
                                            size={24}
                                            color={documents.parentAadhaar ? "#2E7D32" : "#94A3B8"}
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    {/* STEP 3: Review */}
                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.cardHeaderIcon, { backgroundColor: '#F3E5F5' }]}>
                                    <Ionicons name="eye" size={20} color="#7B1FA2" />
                                </View>
                                <View>
                                    <Text style={styles.cardHeaderTitle}>Final Review</Text>
                                    <Text style={styles.cardHeaderSubtitle}>Confirm your details</Text>
                                </View>
                            </View>

                            <View style={styles.reviewCard}>
                                <View style={styles.reviewSection}>
                                    <Text style={styles.reviewSectionTitle}>Personal Info</Text>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>Name</Text>
                                        <Text style={styles.reviewValue}>{formData.fullName}</Text>
                                    </View>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>DOB/YOB</Text>
                                        <Text style={styles.reviewValue}>{useYearOnly ? formData.yob : formData.dob}</Text>
                                    </View>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>Gender</Text>
                                        <Text style={styles.reviewValue}>{formData.gender}</Text>
                                    </View>
                                    <View style={styles.reviewItem}>
                                        <Text style={styles.reviewLabel}>Mobile</Text>
                                        <Text style={styles.reviewValue}>+91 {formData.mobile}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.reviewSection}>
                                    <Text style={styles.reviewSectionTitle}>Address Info</Text>
                                    <Text style={styles.addressText}>
                                        {formData.houseNo}, {formData.area}, {formData.city}, {formData.district}, {formData.state} - {formData.pincode}
                                    </Text>
                                </View>

                                {isMinor && (
                                    <>
                                        <View style={styles.divider} />
                                        <View style={styles.reviewSection}>
                                            <Text style={styles.reviewSectionTitle}>Guardian Info</Text>
                                            <View style={styles.reviewItem}>
                                                <Text style={styles.reviewLabel}>Guardian</Text>
                                                <Text style={styles.reviewValue}>{formData.parentName} ({formData.relationship})</Text>
                                            </View>
                                            <View style={styles.reviewItem}>
                                                <Text style={styles.reviewLabel}>UID</Text>
                                                <Text style={styles.reviewValue}>{formData.parentAadhaar}</Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>

                            <View style={styles.declarationBox}>
                                <Ionicons name="information-circle" size={20} color="#0D47A1" />
                                <Text style={styles.declarationText}>
                                    By submitting, you confirm that all information and documents provided are authentic and belong to the applicant.
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 20 }} />
                </ScrollView>

                {/* Bottom Bar */}
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
        marginTop: 6,
    },
    stepLabelActive: {
        color: '#0D47A1',
    },

    scrollContent: {
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    stepWrapper: {
        animationDuration: '300ms'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardHeaderIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#E3F2FD',
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

    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        marginTop: 16,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    helperLink: {
        fontSize: 12,
        color: '#0D47A1',
        fontWeight: '700',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        marginLeft: 10,
    },
    inputRow: {
        flexDirection: 'row',
        marginTop: 0,
    },
    countryCode: {
        fontSize: 15,
        fontWeight: '700',
        color: '#475569',
        marginLeft: 8,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    genderBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 12,
    },
    genderBoxActive: {
        borderColor: '#0D47A1',
        backgroundColor: '#E3F2FD',
    },
    genderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    genderTextActive: {
        color: '#0D47A1',
    },

    minorSection: {
        marginTop: 20,
    },
    minorCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    minorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    minorTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#E53935',
    },

    // Step 2: Documents
    docList: {
        gap: 12,
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
        backgroundColor: '#E3F2FD',
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

    // Step 3: Review
    reviewCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    reviewSection: {
        paddingVertical: 10,
    },
    reviewSectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0D47A1',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    reviewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    reviewLabel: {
        fontSize: 14,
        color: '#64748B',
    },
    reviewValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    addressText: {
        fontSize: 14,
        color: '#1E293B',
        lineHeight: 20,
        fontWeight: '600'
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 10,
    },
    declarationBox: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
        gap: 12,
    },
    declarationText: {
        flex: 1,
        fontSize: 12,
        color: '#0D47A1',
        lineHeight: 18,
        fontWeight: '600'
    },

    // Bottom Bar
    bottomBar: {
        backgroundColor: '#FFF',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    continueButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
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
