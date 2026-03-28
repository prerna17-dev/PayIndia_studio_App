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
    Keyboard,
    Clipboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINTS } from "../constants/api";

interface DocumentType {
    name: string;
    size?: number;
    uri: string;
}

interface FormDataType {
    // A. Owner Details
    fullName: string;
    aadhaarNumber: string;
    mobileNumber: string;
    email: string;

    // B. Property Information
    district: string;
    taluka: string;
    village: string;
    propertyID: string;
    propertyType: string;
    propertyArea: string;
    registrationDate: string;

    // C. Application Type
    applicationType: string;

    // Declaration
    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    aadhaarCard: DocumentType | null;
    taxBill: DocumentType | null;
    indexII: DocumentType | null;
    posessionLetter: DocumentType | null;
    photo: DocumentType | null;
    otherDoc: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewPropertyTaxScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarCard: null,
        taxBill: null,
        indexII: null,
        posessionLetter: null,
        photo: null,
        otherDoc: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        mobileNumber: "",
        email: "",
        district: "",
        taluka: "",
        village: "",
        propertyID: "",
        propertyType: "",
        propertyArea: "",
        registrationDate: "",
        applicationType: "",
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
                router.back();
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

    const handleSendOtp = async () => {
        if (formData.aadhaarNumber.length !== 12) {
            Alert.alert("Invalid Aadhaar", "Please enter a valid 12-digit Aadhaar number");
            return;
        }
        if (formData.mobileNumber.length !== 10) {
            Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.PROPERTY_TAX_OTP_SEND,
                { mobile_number: formData.mobileNumber, aadhaar_number: formData.aadhaarNumber },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsOtpSent(true);
                Alert.alert("Success", "OTP sent to your mobile number");
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert("Error", "Please enter valid 6-digit OTP");
            return;
        }

        setIsVerifying(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const response = await axios.post(
                API_ENDPOINTS.PROPERTY_TAX_OTP_VERIFY,
                { mobile_number: formData.mobileNumber, otp_code: otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setIsVerifying(false);
                setIsOtpSent(false);
                setIsOtpVerified(true);
                Alert.alert("Success", "OTP verified successfully");
            } else {
                setIsVerifying(false);
                Alert.alert("Error", response.data.message || "Invalid OTP");
            }
        } catch (error: any) {
            setIsVerifying(false);
            Alert.alert("Error", error.response?.data?.message || "OTP verification failed");
        }
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            if (!formData.fullName || formData.aadhaarNumber.length !== 12 || formData.mobileNumber.length !== 10 || !formData.declaration) {
                Alert.alert("Required", "Please fill owner details and accept declaration");
                return;
            }
            if (!formData.district || !formData.taluka || !formData.village || !formData.propertyID) {
                Alert.alert("Required", "Please fill mandatory property information");
                return;
            }
            if (!isOtpVerified) {
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
            if (!documents.aadhaarCard || !documents.indexII || !documents.photo) {
                Alert.alert("Missing Documents", "Please upload Aadhaar Card, Index II, and Photo");
                return;
            }

            if (isEditingMode) {
                setCurrentStep(3);
                setIsEditingMode(false);
            } else {
                setCurrentStep(3);
            }
        } else if (currentStep === 3) {
            if (!formData.finalConfirmation) {
                Alert.alert("Confirmation Required", "Please check the final confirmation box");
                return;
            }
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = new FormData();

            // Map frontend fields to backend fields
            const submissionData = {
                full_name: formData.fullName,
                aadhaar_number: formData.aadhaarNumber,
                mobile_number: formData.mobileNumber,
                email: formData.email,
                district: formData.district,
                taluka: formData.taluka,
                village: formData.village,
                property_id: formData.propertyID,
                property_type: formData.propertyType,
                property_area: formData.propertyArea,
                registration_date: formData.registrationDate,
                application_type: formData.applicationType || "New Registration"
            };

            // Append form fields
            Object.keys(submissionData).forEach(key => {
                data.append(key, (submissionData as any)[key]);
            });

            // Append documents
            const docMapping: any = {
                aadhaarCard: 'aadhaar_card',
                taxBill: 'tax_bill',
                indexII: 'index_ii',
                posessionLetter: 'posession_letter',
                photo: 'photo',
                otherDoc: 'other_doc'
            };

            Object.keys(documents).forEach(key => {
                const doc = documents[key];
                if (doc) {
                    const backendKey = docMapping[key] || key;
                    data.append(backendKey, {
                        uri: doc.uri,
                        name: doc.name,
                        type: doc.uri.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
                    } as any);
                }
            });

            const response = await axios.post(
                API_ENDPOINTS.PROPERTY_TAX_APPLY_NEW,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                const refId = response.data.data.reference_id || "PTAX-PENDING";
                setApplicationId(refId);
                setIsSubmitting(false);
                setIsSubmitted(true);
            } else {
                setIsSubmitting(false);
                Alert.alert("Error", response.data.message || "Submission failed");
            }
        } catch (error: any) {
            setIsSubmitting(false);
            Alert.alert("Error", error.response?.data?.message || "Failed to submit application");
        }
    };

    const handleBack = () => {
        if (isEditingMode) {
            setCurrentStep(3);
            setIsEditingMode(false);
        } else if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
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
                    <Text style={styles.successSubtitle}>Your new property tax registration has been received.</Text>
                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
                            <Text style={styles.idValue}>{applicationId}</Text>
                            <TouchableOpacity onPress={() => {
                                Clipboard.setString(applicationId);
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 2000);
                            }} style={{ padding: 4 }}>
                                <Ionicons name="copy-outline" size={24} color="#0D47A1" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {showToast && (
                        <View style={{ position: 'absolute', bottom: 120, backgroundColor: '#333', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, zIndex: 100 }}>
                            <Text style={{ color: '#FFF', fontSize: 14 }}>Reference ID Copied!</Text>
                        </View>
                    )}
                    <View style={{ height: 40 }} />
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
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name={isEditingMode ? "close" : "arrow-back"} size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Property Tax</Text>
                        <Text style={styles.headerSubtitle}>Property Registration</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Owner Details" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (As per Aadhaar) *" />
                                <Input value={formData.fullName} onChangeText={(v: string) => setFormData({ ...formData, fullName: v })} placeholder="Enter full name" icon="person-outline" />

                                <Label text="Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="call-outline" keyboardType="number-pad" maxLength={10} />

                                <Label text="Aadhaar Number *" />
                                <View style={styles.otpInputContainer}>
                                    <View style={{ flex: 1 }}>
                                        <Input value={formData.aadhaarNumber} onChangeText={(v: string) => setFormData({ ...formData, aadhaarNumber: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="finger-print-outline" keyboardType="number-pad" maxLength={12} />
                                    </View>
                                    <TouchableOpacity style={[styles.otpBtn, isOtpVerified && styles.otpBtnDisabled]} onPress={handleSendOtp} disabled={isOtpVerified}>
                                        <Text style={styles.otpBtnText}>{isOtpVerified ? "Verified" : isOtpSent ? "Resend" : "Send OTP"}</Text>
                                    </TouchableOpacity>
                                </View>

                                {isOtpSent && !isOtpVerified && (
                                    <View style={{ marginTop: 10 }}>
                                        <Label text="Enter OTP *" />
                                        <View style={styles.otpInputContainer}>
                                            <View style={{ flex: 1 }}>
                                                <Input value={otp} onChangeText={setOtp} placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} icon="key-outline" />
                                            </View>
                                            <TouchableOpacity style={styles.verifyBtn} onPress={handleVerifyOtp} disabled={isVerifying}>
                                                {isVerifying ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>

                            <SectionTitle title="Property Information" icon="business" />
                            <View style={styles.formCard}>
                                <Label text="District *" />
                                <Input value={formData.district} onChangeText={(v: string) => setFormData({ ...formData, district: v })} placeholder="Enter District" icon="location-outline" />

                                <Label text="Taluka/Tehsil *" />
                                <Input value={formData.taluka} onChangeText={(v: string) => setFormData({ ...formData, taluka: v })} placeholder="Enter Taluka" icon="navigate-outline" />

                                <Label text="Village/Ward *" />
                                <Input value={formData.village} onChangeText={(v: string) => setFormData({ ...formData, village: v })} placeholder="Enter Village" icon="home-outline" />

                                <Label text="Property ID / No. *" />
                                <Input value={formData.propertyID} onChangeText={(v: string) => setFormData({ ...formData, propertyID: v })} placeholder="Enter Property ID" icon="barcode-outline" />

                                <Label text="Property Type" />
                                <View style={styles.genderRow}>
                                    {["Residential", "Commercial", "Industrial", "Open Land", "Mixed"].map(t => (
                                        <TouchableOpacity key={t} style={[styles.chip, formData.propertyType === t && styles.chipActive]} onPress={() => setFormData({ ...formData, propertyType: t })}>
                                            <Text style={[styles.chipText, formData.propertyType === t && styles.chipTextActive]}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Total Area (Sq.Ft)" />
                                <Input value={formData.propertyArea} onChangeText={(v: string) => setFormData({ ...formData, propertyArea: v })} placeholder="Enter area size" icon="square-outline" keyboardType="number-pad" />
                            </View>

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <Ionicons name={formData.declaration ? "checkbox" : "square-outline"} size={24} color={formData.declaration ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that the owner and property details are correct.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Required Documents" icon="document-text" />
                            <Text style={styles.stepDesc}>📄 DOCUMENTS REQUIRED – PROPERTY TAX</Text>

                            <View style={styles.docList}>
                                <DocUploadItem title="Aadhaar Card *" hint="Owner's Aadhaar Card" isUploaded={!!documents.aadhaarCard} filename={documents.aadhaarCard?.name} onUpload={() => pickDocument('aadhaarCard')} onRemove={() => removeDocument('aadhaarCard')} icon="card-account-details" color="#0D47A1" />

                                <DocUploadItem title="Index II *" hint="Latest Index II copy" isUploaded={!!documents.indexII} filename={documents.indexII?.name} onUpload={() => pickDocument('indexII')} onRemove={() => removeDocument('indexII')} icon="file-document" color="#1565C0" />

                                <DocUploadItem title="Latest Tax Bill (if any)" hint="Previous year tax statement" isUploaded={!!documents.taxBill} filename={documents.taxBill?.name} onUpload={() => pickDocument('taxBill')} onRemove={() => removeDocument('taxBill')} icon="receipt" color="#2E7D32" />

                                <DocUploadItem title="Possession Letter" hint="Property possession doc" isUploaded={!!documents.posessionLetter} filename={documents.posessionLetter?.name} onUpload={() => pickDocument('posessionLetter')} onRemove={() => removeDocument('posessionLetter')} icon="file-sign" color="#388E3C" />

                                <DocUploadItem title="Passport Photo *" hint="Current owner photo" isUploaded={!!documents.photo} filename={documents.photo?.name} onUpload={() => pickDocument('photo')} onRemove={() => removeDocument('photo')} icon="account-box" color="#7B1FA2" />
                                <DocUploadItem title="Other Documents" hint="Any additional supporting docs" isUploaded={!!documents.otherDoc} filename={documents.otherDoc?.name} onUpload={() => pickDocument('otherDoc')} onRemove={() => removeDocument('otherDoc')} icon="file-plus" color="#455A64" />
                            </View>

                            <View style={styles.uploadRulesBox}>
                                <Text style={styles.uploadRulesTitle}>📌 Upload Rules</Text>
                                <Text style={styles.rule}>• Allowed formats: PDF / JPG / PNG</Text>
                                <Text style={styles.rule}>• Max file size: 5MB</Text>
                                <Text style={styles.rule}>• Mandatory documents must be uploaded</Text>
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Details" icon="eye" />
                            <ReviewSectionItem title="Owner Info" data={[
                                { label: "Full Name", value: formData.fullName || "N/A" },
                                { label: "Phone", value: formData.mobileNumber || "N/A" },
                                { label: "Email", value: formData.email || "N/A" },
                                { label: "Aadhaar", value: formData.aadhaarNumber || "N/A" },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewSectionItem title="Property Details" data={[
                                { label: "Property ID", value: formData.propertyID || "N/A" },
                                { label: "Location", value: `${formData.village}, ${formData.taluka}, ${formData.district}` },
                                { label: "Type", value: formData.propertyType || "N/A" },
                                { label: "Area", value: formData.propertyArea ? `${formData.propertyArea} Sq.Ft` : "N/A" },
                            ]} onEdit={() => { setCurrentStep(1); setIsEditingMode(true); }} />

                            <ReviewSectionItem title="Documents" data={[
                                { label: "Aadhaar Card", value: documents.aadhaarCard ? "Uploaded ✅" : "Not Uploaded", color: documents.aadhaarCard ? "#2E7D32" : "#64748B" },
                                { label: "Index II", value: documents.indexII ? "Uploaded ✅" : "Not Uploaded", color: documents.indexII ? "#2E7D32" : "#64748B" },
                                { label: "Passport Photo", value: documents.photo ? "Uploaded ✅" : "Not Uploaded", color: documents.photo ? "#2E7D32" : "#64748B" },
                                { label: "Tax Bill", value: documents.taxBill ? "Uploaded ✅" : "Optional / Not Uploaded", color: documents.taxBill ? "#2E7D32" : "#64748B" },
                                { label: "Possession Letter", value: documents.posessionLetter ? "Uploaded ✅" : "Optional / Not Uploaded", color: documents.posessionLetter ? "#2E7D32" : "#64748B" },
                                { label: "Other Docs", value: documents.otherDoc ? "Uploaded ✅" : "Optional / Not Uploaded", color: documents.otherDoc ? "#2E7D32" : "#64748B" },
                            ]} onEdit={() => { setCurrentStep(2); setIsEditingMode(true); }} />

                            <TouchableOpacity style={[styles.declarationRow, { marginTop: 20 }]} onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}>
                                <Ionicons name={formData.finalConfirmation ? "checkbox" : "square-outline"} size={24} color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that all information provided is accurate to my knowledge.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {!isKeyboardVisible && (
                    <View style={styles.bottomBar}>
                        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
                            <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.buttonGradient}>
                                {isSubmitting ? <ActivityIndicator color="#FFF" size="small" /> : (
                                    <>
                                        <Text style={styles.buttonText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                                        <Ionicons name={currentStep === 3 ? "checkmark-done" : "arrow-forward"} size={20} color="#FFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
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
const ReviewSectionItem = ({ title, data, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}><Text style={styles.reviewSectionTitle}>{title}</Text><TouchableOpacity onPress={onEdit}><Text style={styles.editLink}>Edit</Text></TouchableOpacity></View>
        {data.map((item: any, index: number) => (
            <ReviewItem key={index} label={item.label} value={item.value} color={item.color} />
        ))}
    </View>
);
const ReviewItem = ({ label, value, color }: { label: string, value: string, color?: string }) => (
    <View style={styles.reviewRow}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={[styles.reviewValue, color ? { color } : {}]}>{value}</Text>
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
    otpBtn: { backgroundColor: '#0D47A1', paddingHorizontal: 15, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    otpBtnDisabled: { opacity: 0.6 },
    otpBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    verifyBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 20, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    verifyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', marginRight: 8, marginBottom: 8 },
    chipActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    chipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    chipTextActive: { color: '#0D47A1', fontWeight: '700' },
    declarationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4 },
    declarationLabel: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20, fontWeight: '500' },
    docHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25, backgroundColor: '#E3F2FD', padding: 20, borderRadius: 20 },
    docHeaderText: { fontSize: 16, fontWeight: '900', color: '#0D47A1' },
    docHeaderHindi: { fontSize: 14, color: '#1E3A8A', marginTop: 2 },
    docList: { gap: 12 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12 },
    docUploadCardActive: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    docTextContent: { flex: 1, marginLeft: 15 },
    docTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 11, color: '#64748B', marginTop: 2 },
    docActions: { marginLeft: 10 },
    stepDesc: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
    removeIcon: { padding: 4 },
    uploadIcon: { padding: 4 },
    uploadRulesBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginTop: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    uploadRulesTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    rule: { fontSize: 12, color: '#64748B', marginBottom: 5, fontWeight: '500' },
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
    mainBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
    mainBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
});
