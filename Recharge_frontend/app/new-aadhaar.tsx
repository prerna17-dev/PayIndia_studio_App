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
    const [documents, setDocuments] = useState<DocumentsState>({
        birthCertificate: null,
        schoolCertificate: null,
        addressProof: null,
        parentAadhaar: null,
    });
    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        dob: "",
        yob: "", // Year of Birth
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
                router.replace("/aadhaar-services");
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

                // Check file size (max 5MB)
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

    // Format DOB automatically
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

    // Calculate age to determine if minor
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

    // Handle step navigation
    const handleContinue = () => {
        if (currentStep === 1) {
            // Validate Details
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
            // Validate Documents
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
            // Submit
            Alert.alert(
                "Success",
                "Application submitted successfully!\n\nEnrollment ID: UID" +
                Math.random().toString(36).substr(2, 9).toUpperCase(),
            );
            router.replace("/aadhaar-services");
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.replace("/aadhaar-services");
        }
    };

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
                    <Text style={styles.headerTitle}>New Aadhaar Enrollment</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Step Indicator */}
                <View style={styles.stepIndicator}>
                    <View style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                currentStep >= 1 && styles.stepCircleActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.stepNumber,
                                    currentStep >= 1 && styles.stepNumberActive,
                                ]}
                            >
                                1
                            </Text>
                        </View>
                        <Text style={styles.stepLabel}>Details</Text>
                    </View>
                    <View
                        style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]}
                    />
                    <View style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                currentStep >= 2 && styles.stepCircleActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.stepNumber,
                                    currentStep >= 2 && styles.stepNumberActive,
                                ]}
                            >
                                2
                            </Text>
                        </View>
                        <Text style={styles.stepLabel}>Documents</Text>
                    </View>
                    <View
                        style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]}
                    />
                    <View style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                currentStep >= 3 && styles.stepCircleActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.stepNumber,
                                    currentStep >= 3 && styles.stepNumberActive,
                                ]}
                            >
                                3
                            </Text>
                        </View>
                        <Text style={styles.stepLabel}>Review</Text>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* STEP 1: Personal Details */}
                    {currentStep === 1 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Personal Details</Text>
                            <Text style={styles.stepSubtitle}>
                                Fill in mandatory information for enrollment
                            </Text>

                            <View style={styles.formSection}>
                                <Text style={styles.formLabel}>
                                    Full Name (as per documents) *
                                </Text>
                                <View style={styles.formInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter full name"
                                        value={formData.fullName}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, fullName: text })
                                        }
                                    />
                                </View>
                            </View>

                            <View style={styles.formSection}>
                                <View style={styles.labelRow}>
                                    <Text style={styles.formLabel}>
                                        {useYearOnly ? "Year of Birth *" : "Date of Birth *"}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setUseYearOnly(!useYearOnly)}
                                    >
                                        <Text style={styles.switchText}>
                                            {useYearOnly
                                                ? "I know exact DOB"
                                                : "Don't know exact DOB?"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.formInput}>
                                    {useYearOnly ? (
                                        <TextInput
                                            style={styles.input}
                                            placeholder="YYYY"
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            value={formData.yob}
                                            onChangeText={(text) =>
                                                setFormData({ ...formData, yob: text })
                                            }
                                        />
                                    ) : (
                                        <TextInput
                                            style={styles.input}
                                            placeholder="DD/MM/YYYY"
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            value={formData.dob}
                                            onChangeText={(text) => {
                                                const formatted = formatDOB(text);
                                                setFormData({ ...formData, dob: formatted });
                                            }}
                                        />
                                    )}
                                </View>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.formLabel}>Gender *</Text>
                                <View style={styles.genderButtons}>
                                    {["Male", "Female", "Other"].map((g) => (
                                        <TouchableOpacity
                                            key={g}
                                            style={[
                                                styles.genderButton,
                                                formData.gender === g && styles.genderButtonActive,
                                            ]}
                                            onPress={() => setFormData({ ...formData, gender: g })}
                                        >
                                            <Text
                                                style={[
                                                    styles.genderButtonText,
                                                    formData.gender === g &&
                                                    styles.genderButtonTextActive,
                                                ]}
                                            >
                                                {g}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Address Section */}
                            <Text style={styles.subSectionTitle}>Complete Address</Text>

                            <View style={styles.formSection}>
                                <Text style={styles.formLabel}>House No / Street</Text>
                                <View style={styles.formInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Flat, House No., Building, Company"
                                        value={formData.houseNo}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, houseNo: text })
                                        }
                                    />
                                </View>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.formLabel}>Area / Village / Locality</Text>
                                <View style={styles.formInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Area, Colony, Street, Sector, Village"
                                        value={formData.area}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, area: text })
                                        }
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formSection, { flex: 1 }]}>
                                    <Text style={styles.formLabel}>City / Taluka *</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="City/Taluka"
                                            value={formData.city}
                                            onChangeText={(text) =>
                                                setFormData({ ...formData, city: text })
                                            }
                                        />
                                    </View>
                                </View>

                                <View style={[styles.formSection, { flex: 1 }]}>
                                    <Text style={styles.formLabel}>District</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="District"
                                            value={formData.district}
                                            onChangeText={(text) =>
                                                setFormData({ ...formData, district: text })
                                            }
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formSection, { flex: 1 }]}>
                                    <Text style={styles.formLabel}>State *</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="State"
                                            value={formData.state}
                                            onChangeText={(text) =>
                                                setFormData({ ...formData, state: text })
                                            }
                                        />
                                    </View>
                                </View>

                                <View style={[styles.formSection, { flex: 1 }]}>
                                    <Text style={styles.formLabel}>Pincode *</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="6-digit"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            value={formData.pincode}
                                            onChangeText={(text) =>
                                                setFormData({ ...formData, pincode: text })
                                            }
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.formLabel}>
                                    Mobile Number (for OTP & updates) *
                                </Text>
                                <View style={styles.formInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="10-digit mobile"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={formData.mobile}
                                        onChangeText={(text) =>
                                            setFormData({ ...formData, mobile: text })
                                        }
                                    />
                                </View>
                            </View>

                            {/* Minor Section */}
                            {isMinor && (
                                <View style={styles.minorSection}>
                                    <View style={styles.minorHeader}>
                                        <MaterialCommunityIcons
                                            name="baby-face-outline"
                                            size={24}
                                            color="#E53935"
                                        />
                                        <Text style={styles.minorTitle}>
                                            Minor Details (Below 18 Years)
                                        </Text>
                                    </View>

                                    <View style={styles.formSection}>
                                        <Text style={styles.formLabel}>Parent/Guardian Name *</Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter guardian's full name"
                                                value={formData.parentName}
                                                onChangeText={(text) =>
                                                    setFormData({ ...formData, parentName: text })
                                                }
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formSection}>
                                        <Text style={styles.formLabel}>
                                            Parent Aadhaar Number *
                                        </Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="12-digit Aadhaar"
                                                keyboardType="number-pad"
                                                maxLength={12}
                                                value={formData.parentAadhaar}
                                                onChangeText={(text) =>
                                                    setFormData({ ...formData, parentAadhaar: text })
                                                }
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.formSection}>
                                        <Text style={styles.formLabel}>Relationship *</Text>
                                        <View style={styles.genderButtons}>
                                            {["Father", "Mother", "Guardian"].map((r) => (
                                                <TouchableOpacity
                                                    key={r}
                                                    style={[
                                                        styles.genderButton,
                                                        formData.relationship === r &&
                                                        styles.genderButtonActive,
                                                    ]}
                                                    onPress={() =>
                                                        setFormData({ ...formData, relationship: r })
                                                    }
                                                >
                                                    <Text
                                                        style={[
                                                            styles.genderButtonText,
                                                            formData.relationship === r &&
                                                            styles.genderButtonTextActive,
                                                        ]}
                                                    >
                                                        {r}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {/* STEP 2: Documents */}
                    {currentStep === 2 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Mandatory Documents</Text>
                            <Text style={styles.stepSubtitle}>
                                Upload proofs to support your enrollment
                            </Text>

                            {/* Birth Certificate */}
                            <View style={styles.documentCard}>
                                <View style={styles.documentHeader}>
                                    <MaterialCommunityIcons
                                        name="file-document"
                                        size={24}
                                        color="#2196F3"
                                    />
                                    <View style={styles.documentInfo}>
                                        <Text style={styles.documentTitle}>
                                            Birth Certificate *
                                        </Text>
                                        <Text style={styles.documentSubtitle}>जन्म प्रमाणपत्र</Text>
                                    </View>
                                </View>
                                {documents.birthCertificate ? (
                                    <View style={styles.uploadedFile}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#4CAF50"
                                        />
                                        <Text style={styles.uploadedFileName}>
                                            {documents.birthCertificate?.name || "File uploaded"}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setDocuments({ ...documents, birthCertificate: null })
                                            }
                                        >
                                            <Ionicons name="close-circle" size={20} color="#E53935" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.uploadButton}
                                        onPress={() => handleDocumentUpload("birthCertificate")}
                                    >
                                        <Ionicons name="cloud-upload" size={20} color="#2196F3" />
                                        <Text style={styles.uploadButtonText}>Upload Document</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* School Certificate */}
                            <View style={styles.documentCard}>
                                <View style={styles.documentHeader}>
                                    <MaterialCommunityIcons
                                        name="school"
                                        size={24}
                                        color="#FF9800"
                                    />
                                    <View style={styles.documentInfo}>
                                        <Text style={styles.documentTitle}>
                                            School Leaving Certificate *
                                        </Text>
                                        <Text style={styles.documentSubtitle}>
                                            शाळा सोडल्याचा दाखला
                                        </Text>
                                    </View>
                                </View>
                                {documents.schoolCertificate ? (
                                    <View style={styles.uploadedFile}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#4CAF50"
                                        />
                                        <Text style={styles.uploadedFileName}>
                                            {documents.schoolCertificate?.name || "File uploaded"}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setDocuments({ ...documents, schoolCertificate: null })
                                            }
                                        >
                                            <Ionicons name="close-circle" size={20} color="#E53935" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.uploadButton}
                                        onPress={() => handleDocumentUpload("schoolCertificate")}
                                    >
                                        <Ionicons name="cloud-upload" size={20} color="#FF9800" />
                                        <Text style={styles.uploadButtonText}>Upload Document</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Address Proof */}
                            <View style={styles.documentCard}>
                                <View style={styles.documentHeader}>
                                    <MaterialCommunityIcons
                                        name="home-map-marker"
                                        size={24}
                                        color="#4CAF50"
                                    />
                                    <View style={styles.documentInfo}>
                                        <Text style={styles.documentTitle}>Address Proof *</Text>
                                        <Text style={styles.documentSubtitle}>
                                            Light Bill / Ration Card / Bank Passbook
                                        </Text>
                                    </View>
                                </View>
                                {documents.addressProof ? (
                                    <View style={styles.uploadedFile}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#4CAF50"
                                        />
                                        <Text style={styles.uploadedFileName}>
                                            {documents.addressProof?.name || "File uploaded"}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setDocuments({ ...documents, addressProof: null })
                                            }
                                        >
                                            <Ionicons name="close-circle" size={20} color="#E53935" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.uploadButton}
                                        onPress={() => handleDocumentUpload("addressProof")}
                                    >
                                        <Ionicons name="cloud-upload" size={20} color="#4CAF50" />
                                        <Text style={styles.uploadButtonText}>Upload Document</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Parent Aadhaar - Mandatory for Minors */}
                            {isMinor && (
                                <View style={styles.documentCard}>
                                    <View style={styles.documentHeader}>
                                        <MaterialCommunityIcons
                                            name="account-details"
                                            size={24}
                                            color="#E53935"
                                        />
                                        <View style={styles.documentInfo}>
                                            <Text style={styles.documentTitle}>Parent Aadhaar *</Text>
                                            <Text style={styles.documentSubtitle}>
                                                Mandatory for minors
                                            </Text>
                                        </View>
                                    </View>
                                    {documents.parentAadhaar ? (
                                        <View style={styles.uploadedFile}>
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={20}
                                                color="#4CAF50"
                                            />
                                            <Text style={styles.uploadedFileName}>
                                                {documents.parentAadhaar?.name || "File uploaded"}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    setDocuments({ ...documents, parentAadhaar: null })
                                                }
                                            >
                                                <Ionicons
                                                    name="close-circle"
                                                    size={20}
                                                    color="#E53935"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.uploadButton}
                                            onPress={() => handleDocumentUpload("parentAadhaar")}
                                        >
                                            <Ionicons name="cloud-upload" size={20} color="#E53935" />
                                            <Text style={styles.uploadButtonText}>
                                                Upload Parent Aadhaar
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    )}

                    {/* STEP 3: Review */}
                    {currentStep === 3 && (
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Review & Submit</Text>
                            <Text style={styles.stepSubtitle}>
                                Please verify all details before submission
                            </Text>

                            <View style={styles.reviewCard}>
                                <Text style={styles.reviewCardTitle}>Personal Details</Text>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Full Name:</Text>
                                    <Text style={styles.reviewValue}>{formData.fullName}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>DOB / YOB:</Text>
                                    <Text style={styles.reviewValue}>
                                        {useYearOnly ? formData.yob : formData.dob}
                                    </Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Gender:</Text>
                                    <Text style={styles.reviewValue}>{formData.gender}</Text>
                                </View>
                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Mobile:</Text>
                                    <Text style={styles.reviewValue}>{formData.mobile}</Text>
                                </View>
                            </View>

                            <View style={styles.reviewCard}>
                                <Text style={styles.reviewCardTitle}>Address Details</Text>
                                <Text style={styles.reviewAddressText}>
                                    {formData.houseNo && `${formData.houseNo}, `}
                                    {formData.area && `${formData.area}, `}
                                    {formData.city},{" "}
                                    {formData.district && `${formData.district}, `}
                                    {formData.state} - {formData.pincode}
                                </Text>
                            </View>

                            {isMinor && (
                                <View style={styles.reviewCard}>
                                    <Text style={styles.reviewCardTitle}>Guardian Details</Text>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Name:</Text>
                                        <Text style={styles.reviewValue}>
                                            {formData.parentName}
                                        </Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Aadhaar:</Text>
                                        <Text style={styles.reviewValue}>
                                            {formData.parentAadhaar}
                                        </Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Relationship:</Text>
                                        <Text style={styles.reviewValue}>
                                            {formData.relationship}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.reviewCard}>
                                <Text style={styles.reviewCardTitle}>Uploaded Documents</Text>
                                {documents.birthCertificate && (
                                    <View style={styles.reviewDocRow}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#4CAF50"
                                        />
                                        <Text style={styles.reviewDocText}>Birth Certificate</Text>
                                    </View>
                                )}
                                {documents.schoolCertificate && (
                                    <View style={styles.reviewDocRow}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#4CAF50"
                                        />
                                        <Text style={styles.reviewDocText}>School Certificate</Text>
                                    </View>
                                )}
                                {documents.addressProof && (
                                    <View style={styles.reviewDocRow}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#4CAF50"
                                        />
                                        <Text style={styles.reviewDocText}>Address Proof</Text>
                                    </View>
                                )}
                                {isMinor && documents.parentAadhaar && (
                                    <View style={styles.reviewDocRow}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color="#4CAF50"
                                        />
                                        <Text style={styles.reviewDocText}>Parent Aadhaar</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.feeCard}>
                                <Text style={styles.feeLabel}>Enrollment Fee</Text>
                                <Text style={styles.feeValue}>₹0</Text>
                            </View>
                            <Text style={styles.feeNote}>
                                * New Aadhaar enrollment is free of cost at UIDAI centers.
                            </Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                    >
                        <LinearGradient
                            colors={["#4CAF50", "#45A049"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButtonGradient}
                        >
                            <Text style={styles.continueButtonText}>
                                {currentStep === 1
                                    ? "Continue"
                                    : currentStep === 2
                                        ? "Proceed"
                                        : "Submit & Pay"}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
        backgroundColor: "#F6F9FC",
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
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1A1A1A",
        textAlign: 'center',
    },
    placeholder: {
        width: 34,
    },

    // Step Indicator
    stepIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    stepItem: {
        alignItems: "center",
        gap: 6,
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#E0E0E0",
        alignItems: "center",
        justifyContent: "center",
    },
    stepCircleActive: {
        backgroundColor: "#4CAF50",
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#999",
    },
    stepNumberActive: {
        color: "#FFFFFF",
    },
    stepLabel: {
        fontSize: 11,
        color: "#666",
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: "#E0E0E0",
        marginHorizontal: 8,
    },
    stepLineActive: {
        backgroundColor: "#4CAF50",
    },

    scrollContent: {
        paddingBottom: 20,
    },

    stepContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 6,
    },
    stepSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginTop: 10,
        marginBottom: 15,
        backgroundColor: "#E8F5E9",
        padding: 10,
        borderRadius: 8,
    },
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    switchText: {
        fontSize: 12,
        color: "#2196F3",
        fontWeight: "600",
    },
    minorSection: {
        marginTop: 10,
        padding: 15,
        backgroundColor: "#FFF9F9",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#FFEBEE",
        marginBottom: 20,
    },
    minorHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 15,
    },
    minorTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#E53935",
    },

    // Document Cards
    documentCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    documentHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    documentInfo: {
        flex: 1,
    },
    documentTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 2,
    },
    documentSubtitle: {
        fontSize: 12,
        color: "#666",
    },
    uploadedFile: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#E8F5E9",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    uploadedFileName: {
        flex: 1,
        fontSize: 13,
        color: "#1A1A1A",
    },
    uploadedFileSize: {
        fontSize: 12,
        color: "#666",
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#F1F8FE",
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#BBDEFB",
    },
    uploadButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2196F3",
    },

    // Form
    formSection: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    input: {
        fontSize: 15,
        color: "#1A1A1A",
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    formRow: {
        flexDirection: "row",
        gap: 12,
    },
    genderButtons: {
        flexDirection: "row",
        gap: 10,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#E0E0E0",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    genderButtonActive: {
        borderColor: "#4CAF50",
        backgroundColor: "#E8F5E9",
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    genderButtonTextActive: {
        color: "#4CAF50",
    },

    // Review
    reviewCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    reviewCardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 12,
    },
    reviewRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    reviewLabel: {
        fontSize: 14,
        color: "#666",
    },
    reviewValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    reviewAddressText: {
        fontSize: 14,
        color: "#1A1A1A",
        lineHeight: 20,
    },
    reviewDocRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    reviewDocText: {
        fontSize: 14,
        color: "#1A1A1A",
    },
    feeCard: {
        backgroundColor: "#F1F8FE",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    feeLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    feeValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4CAF50",
    },
    feeNote: {
        fontSize: 11,
        color: "#999",
        marginTop: 10,
        fontStyle: "italic",
        textAlign: "center",
    },

    // Bottom Bar
    bottomBar: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
    },
    continueButton: {
        borderRadius: 24,
        overflow: "hidden",
    },
    continueButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 16,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
});
