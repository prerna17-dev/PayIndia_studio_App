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
    Modal,
    FlatList
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
    dob: string;
    gender: string;
    mobileNumber: string;
    email: string;

    // Residence Details
    houseNo: string;
    street: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
    pincode: string;
    durationOfStay: string;

    // Occupation Details
    occupation: string;
    isStudent: string; // "Yes" | "No"
    schoolName: string;
    standard: string;

    // Purpose
    purpose: string;

    declaration: boolean;
    finalDeclaration: boolean;
}

interface DocumentsState {
    aadhaarCard: DocumentType | null;
    addressProof: DocumentType | null;
    rationCard: DocumentType | null;
    selfDeclaration: DocumentType | null;
    schoolBonafide: DocumentType | null;
    [key: string]: DocumentType | null;
}

const PURPOSES = [
    "Education",
    "Government Job",
    "Scholarship",
    "Legal Purpose",
    "Other"
];

export default function NewDomicileCertificateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");
    const [showPurposeModal, setShowPurposeModal] = useState(false);

    const [documents, setDocuments] = useState<DocumentsState>({
        aadhaarCard: null,
        addressProof: null,
        rationCard: null,
        selfDeclaration: null,
        schoolBonafide: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        fullName: "",
        aadhaarNumber: "",
        dob: "",
        gender: "",
        mobileNumber: "",
        email: "",
        houseNo: "",
        street: "",
        village: "",
        taluka: "",
        district: "",
        state: "",
        pincode: "",
        durationOfStay: "",
        occupation: "",
        isStudent: "",
        schoolName: "",
        standard: "",
        purpose: "",
        declaration: false,
        finalDeclaration: false,
    });

    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.replace("/domicile-certificate-services");
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [currentStep]);

    const pickDocument = async (docType: keyof DocumentsState) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets[0]) {
                const file = result.assets[0];

                if (file.size && file.size > 2 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Please upload a file smaller than 2MB");
                    return;
                }

                setDocuments((prev) => ({
                    ...prev,
                    [docType]: {
                        name: file.name,
                        size: file.size,
                        uri: file.uri,
                    },
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

    const formatDate = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        return formatted;
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            // Step 1 Validation
            const { fullName, aadhaarNumber, dob, gender, mobileNumber, houseNo, village, taluka, district, pincode, isStudent, purpose, declaration } = formData;

            if (!fullName || aadhaarNumber.length !== 12 || !dob || !gender || mobileNumber.length !== 10) {
                Alert.alert("Required", "Please fill mandatory applicant details correctly");
                return;
            }
            if (!houseNo || !village || !taluka || !district || pincode.length !== 6) {
                Alert.alert("Required", "Please fill mandatory residence details correctly");
                return;
            }
            if (!isStudent) {
                Alert.alert("Required", "Please select if you are a student");
                return;
            }
            if (isStudent === "Yes" && (!formData.schoolName || !formData.standard)) {
                Alert.alert("Required", "Please fill school/college details");
                return;
            }
            if (!purpose) {
                Alert.alert("Required", "Please select the purpose of certificate");
                return;
            }
            if (!declaration) {
                Alert.alert("Required", "Please accept the declaration");
                return;
            }

            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Step 2 Validation - Mandatory documents
            if (!documents.aadhaarCard || !documents.addressProof || !documents.rationCard || !documents.selfDeclaration) {
                Alert.alert("Documents Required", "Please upload all mandatory documents");
                return;
            }
            // Conditional document
            if (formData.isStudent === "Yes" && !documents.schoolBonafide) {
                Alert.alert("Document Required", "School Bonafide is mandatory for students");
                return;
            }
            setCurrentStep(3);
        } else {
            // Step 3
            if (!formData.finalDeclaration) {
                Alert.alert("Required", "Please accept the final declaration");
                return;
            }

            setIsSubmitting(true);
            setTimeout(() => {
                const refId = "DOM" + Math.random().toString(36).substr(2, 9).toUpperCase();
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
                        <View style={[
                            styles.stepCircle,
                            currentStep >= s && styles.stepCircleActive,
                            currentStep > s && styles.stepCircleCompleted
                        ]}>
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
                    <Text style={styles.successSubtitle}>Your Domicile Certificate application has been received successfully.</Text>

                    <View style={styles.idCard}>
                        <Text style={styles.idLabel}>Reference ID</Text>
                        <Text style={styles.idValue}>{applicationId}</Text>
                    </View>

                    <View style={styles.successActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="download-outline" size={24} color="#0D47A1" />
                            </View>
                            <Text style={styles.actionText}>Download{"\n"}Acknowledgement</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn}>
                            <View style={[styles.actionIcon, { backgroundColor: '#F1F8E9' }]}>
                                <Ionicons name="time-outline" size={24} color="#2E7D32" />
                            </View>
                            <Text style={styles.actionText}>Track{"\n"}Status</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/domicile-certificate-services")}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                            <Text style={styles.mainBtnText}>Return to Services</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.timeEstimate}>Estimated Processing Time: 15-20 Working Days</Text>
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
                        else router.replace("/domicile-certificate-services");
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Domicile Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for registration</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Applicant Details" icon="person" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input value={formData.fullName} onChangeText={(v: string) => setFormData({ ...formData, fullName: v })} placeholder="Enter your full name" icon="person-outline" />

                                <Label text="Aadhaar Number *" />
                                <Input value={formData.aadhaarNumber} onChangeText={(v: string) => setFormData({ ...formData, aadhaarNumber: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Date of Birth *" />
                                        <Input value={formData.dob} onChangeText={(v: string) => setFormData({ ...formData, dob: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                </View>

                                <Label text="Gender *" />
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>
                                    {["Male", "Female", "Other"].map(g => (
                                        <TouchableOpacity key={g} style={[styles.radioBtn, formData.gender === g && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                            <Text style={[styles.radioText, formData.gender === g && styles.radioTextActive]}>{g}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Label text="Mobile Number *" />
                                <Input value={formData.mobileNumber} onChangeText={(v: string) => setFormData({ ...formData, mobileNumber: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />

                                <Label text="Email (Optional)" />
                                <Input value={formData.email} onChangeText={(v: string) => setFormData({ ...formData, email: v })} placeholder="Enter email address" icon="mail-outline" />
                            </View>

                            <SectionTitle title="Residence Details" icon="home" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="House/Flat No *" />
                                <Input value={formData.houseNo} onChangeText={(v: string) => setFormData({ ...formData, houseNo: v })} placeholder="Flat No / House No" />
                                <Label text="Street / Area" />
                                <Input value={formData.street} onChangeText={(v: string) => setFormData({ ...formData, street: v })} placeholder="Landmark / Area" />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Village/City *" />
                                        <Input value={formData.village} onChangeText={(v: string) => setFormData({ ...formData, village: v })} placeholder="Village/City" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Taluka *" />
                                        <Input value={formData.taluka} onChangeText={(v: string) => setFormData({ ...formData, taluka: v })} placeholder="Taluka" />
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="District *" />
                                        <Input value={formData.district} onChangeText={(v: string) => setFormData({ ...formData, district: v })} placeholder="District" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="State *" />
                                        <Input value={formData.state} onChangeText={(v: string) => setFormData({ ...formData, state: v })} placeholder="State" />
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="PIN Code *" />
                                        <Input value={formData.pincode} onChangeText={(v: string) => setFormData({ ...formData, pincode: v.replace(/\D/g, '').substring(0, 6) })} placeholder="6-digit" keyboardType="number-pad" maxLength={6} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Duration of Stay (Years) *" />
                                        <Input value={formData.durationOfStay} onChangeText={(v: string) => setFormData({ ...formData, durationOfStay: v.replace(/\D/g, '') })} placeholder="No. of years" keyboardType="number-pad" />
                                    </View>
                                </View>
                            </View>

                            <SectionTitle title="Occupation Details" icon="briefcase" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Occupation" />
                                <Input value={formData.occupation} onChangeText={(v: string) => setFormData({ ...formData, occupation: v })} placeholder="Your primary occupation" icon="briefcase-outline" />

                                <Label text="Are you a Student? *" />
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>
                                    {["Yes", "No"].map(o => (
                                        <TouchableOpacity key={o} style={[styles.radioBtn, formData.isStudent === o && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, isStudent: o })}>
                                            <Text style={[styles.radioText, formData.isStudent === o && styles.radioTextActive]}>{o}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {formData.isStudent === "Yes" && (
                                    <>
                                        <Label text="School / College Name *" />
                                        <Input value={formData.schoolName} onChangeText={(v: string) => setFormData({ ...formData, schoolName: v })} placeholder="Enter school/college name" icon="business-outline" />
                                        <Label text="Standard / Course *" />
                                        <Input value={formData.standard} onChangeText={(v: string) => setFormData({ ...formData, standard: v })} placeholder="Standard/Course" icon="school-outline" />
                                    </>
                                )}
                            </View>

                            <SectionTitle title="Purpose of Certificate" icon="ribbon" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Purpose *" />
                                <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowPurposeModal(true)}>
                                    <Text style={[styles.dropdownValue, !formData.purpose && { color: '#94A3B8' }]}>
                                        {formData.purpose || "Select the purpose"}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <View style={[styles.checkBox, formData.declaration && styles.checkBoxActive]}>
                                    {formData.declaration && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                </View>
                                <Text style={styles.declarationText}>I declare that I am residing at the above address and the information provided is true.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <View style={styles.requiredDocsCard}>
                                <Text style={styles.requiredDocsTitle}>📄 DOCUMENTS REQUIRED</Text>
                                <View style={styles.docsList}>
                                    <Text style={styles.docItem}>• Aadhaar Card (आधार कार्ड)</Text>
                                    <Text style={styles.docItem}>• Address Proof (Light Bill / Rent Agreement)</Text>
                                    <Text style={styles.docItem}>• Ration Card (रेशन कार्ड)</Text>
                                    <Text style={styles.docItem}>• Self Declaration (स्वघोषणा पत्र)</Text>
                                    {formData.isStudent === "Yes" && <Text style={styles.docItem}>• School Bonafide (विद्यार्थी असल्यास)</Text>}
                                </View>
                            </View>

                            <SectionTitle title="Upload Documents" icon="cloud-upload" color="#2E7D32" />
                            <View style={styles.uploadGrid}>
                                <DocUploadItem title="Aadhaar Card" hindi="आधार कार्ड" isUploaded={!!documents.aadhaarCard} filename={documents.aadhaarCard?.name} onUpload={() => pickDocument('aadhaarCard')} onRemove={() => removeDocument('aadhaarCard')} required />
                                <DocUploadItem title="Address Proof" hindi="पत्त्याचा पुरावा" isUploaded={!!documents.addressProof} filename={documents.addressProof?.name} onUpload={() => pickDocument('addressProof')} onRemove={() => removeDocument('addressProof')} required />
                                <DocUploadItem title="Ration Card" hindi="रेशन कार्ड" isUploaded={!!documents.rationCard} filename={documents.rationCard?.name} onUpload={() => pickDocument('rationCard')} onRemove={() => removeDocument('rationCard')} required />
                                <DocUploadItem title="Self Declaration" hindi="स्वघोषणा पत्र" isUploaded={!!documents.selfDeclaration} filename={documents.selfDeclaration?.name} onUpload={() => pickDocument('selfDeclaration')} onRemove={() => removeDocument('selfDeclaration')} required />
                                {formData.isStudent === "Yes" && (
                                    <DocUploadItem title="School Bonafide" hindi="विद्यार्थी असल्यास" isUploaded={!!documents.schoolBonafide} filename={documents.schoolBonafide?.name} onUpload={() => pickDocument('schoolBonafide')} onRemove={() => removeDocument('schoolBonafide')} required />
                                )}
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Your Details" icon="eye" color="#1A237E" />
                            <ReviewCard title="Applicant Info" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Full Name" value={formData.fullName} />
                                <ReviewItem label="Aadhaar" value={formData.aadhaarNumber} />
                                <ReviewItem label="DOB" value={formData.dob} />
                                <ReviewItem label="Gender" value={formData.gender} />
                            </ReviewCard>

                            <ReviewCard title="Residence" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Address" value={`${formData.houseNo}, ${formData.street}, ${formData.village}, ${formData.taluka}, ${formData.district}, ${formData.state} - ${formData.pincode}`} />
                                <ReviewItem label="Duration" value={`${formData.durationOfStay} Years`} />
                            </ReviewCard>

                            <ReviewCard title="Purpose & Student" onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Purpose" value={formData.purpose} />
                                <ReviewItem label="Student" value={formData.isStudent} />
                                {formData.isStudent === "Yes" && (
                                    <>
                                        <ReviewItem label="School" value={formData.schoolName} />
                                        <ReviewItem label="Standard" value={formData.standard} />
                                    </>
                                )}
                            </ReviewCard>

                            <ReviewCard title="Documents" onEdit={() => setCurrentStep(2)}>
                                <View style={styles.reviewDocList}>
                                    {Object.entries(documents).filter(([_, v]) => v).map(([k, v]) => (
                                        <View key={k} style={styles.reviewDocItem}>
                                            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                            <Text style={styles.reviewDocName}>{v?.name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ReviewCard>

                            <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, finalDeclaration: !formData.finalDeclaration })}>
                                <View style={[styles.checkBox, formData.finalDeclaration && styles.checkBoxActive]}>
                                    {formData.finalDeclaration && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                </View>
                                <Text style={styles.declarationText}>I confirm that all submitted documents are genuine and I am a resident of the stated address.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Purpose Modal */}
                <Modal visible={showPurposeModal} transparent animationType="fade">
                    <View style={styles.modalBg}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Purpose</Text>
                                <TouchableOpacity onPress={() => setShowPurposeModal(false)}>
                                    <Ionicons name="close" size={24} color="#1A1A1A" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={PURPOSES}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.purposeOption} onPress={() => { setFormData({ ...formData, purpose: item }); setShowPurposeModal(false); }}>
                                        <Text style={[styles.purposeOptionText, formData.purpose === item && { color: '#0D47A1', fontWeight: '700' }]}>
                                            {item}
                                        </Text>
                                        {formData.purpose === item && <Ionicons name="checkmark-circle" size={20} color="#0D47A1" />}
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.mainBtn} onPress={handleContinue} disabled={isSubmitting}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                            {isSubmitting ? <ActivityIndicator color="#FFF" size="small" /> : (
                                <>
                                    <Text style={styles.mainBtnText}>{currentStep === 3 ? "Submit Application" : "Continue"}</Text>
                                    <Ionicons name={currentStep === 3 ? "checkmark-done" : "arrow-forward"} size={18} color="#FFF" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const SectionTitle = ({ title, icon, color }: { title: string, icon: any, color: string }) => (
    <View style={styles.sectionHeader}>
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
    </View>
);

const Label = ({ text }: { text: string }) => <Text style={styles.label}>{text}</Text>;

const Input = ({ icon, style, ...props }: any) => (
    <View style={[styles.inputContainer, style]}>
        {icon && <Ionicons name={icon} size={18} color="#94A3B8" style={{ marginRight: 10 }} />}
        <TextInput style={styles.field} placeholderTextColor="#94A3B8" {...props} />
    </View>
);

const DocUploadItem = ({ title, hindi, isUploaded, filename, onUpload, onRemove, required }: any) => (
    <TouchableOpacity style={[styles.docCard, isUploaded && styles.docCardActive]} onPress={isUploaded ? undefined : onUpload}>
        <View style={styles.docInfo}>
            <View style={[styles.docIcon, { backgroundColor: isUploaded ? '#E8F5E9' : '#F1F5F9' }]}>
                <Ionicons name={isUploaded ? "document" : "cloud-upload-outline"} size={22} color={isUploaded ? "#2E7D32" : "#475569"} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>{title} {required && "*"}</Text>
                {hindi && <Text style={styles.docHindi}>{hindi}</Text>}
                {isUploaded && <Text style={styles.filename} numberOfLines={1}>{filename}</Text>}
            </View>
            {isUploaded ? (
                <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
                    <Ionicons name="close-circle" size={24} color="#C62828" />
                </TouchableOpacity>
            ) : (
                <View style={styles.uploadBadge}>
                    <Text style={styles.uploadBadgeText}>Upload</Text>
                </View>
            )}
        </View>
    </TouchableOpacity>
);

const ReviewCard = ({ title, children, onEdit }: any) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>{title}</Text>
            <TouchableOpacity onPress={onEdit}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
        </View>
        <View style={styles.reviewContent}>{children}</View>
    </View>
);

const ReviewItem = ({ label, value }: any) => (
    <View style={styles.reviewItem}>
        <Text style={styles.reviewLabel}>{label}:</Text>
        <Text style={styles.reviewValue}>{value || "N/A"}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 11, color: '#666', marginTop: 2 },
    placeholder: { width: 34 },

    stepIndicatorContainer: { backgroundColor: '#FFF', paddingVertical: 15, paddingHorizontal: 30 },
    progressLine: { position: 'absolute', top: 32, left: 60, right: 60, height: 2, backgroundColor: '#F1F5F9' },
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
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 20 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },

    formCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, height: 48 },
    field: { flex: 1, fontSize: 14, color: '#1E293B' },
    inputRow: { flexDirection: 'row' },

    radioGroup: { flexDirection: 'row', gap: 10 },
    radioBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
    radioBtnActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    radioText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    radioTextActive: { color: '#0D47A1', fontWeight: '700' },

    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', paddingHorizontal: 12, justifyContent: 'space-between' },
    dropdownValue: { fontSize: 14, color: '#1E293B' },

    declarationBox: { flexDirection: 'row', marginTop: 20, gap: 12, alignItems: 'flex-start', padding: 4 },
    checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#0D47A1', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    checkBoxActive: { backgroundColor: '#0D47A1' },
    declarationText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },

    requiredDocsCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#0D47A1', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    requiredDocsTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1', marginBottom: 12 },
    docsList: { gap: 8 },
    docItem: { fontSize: 13, color: '#475569', lineHeight: 20 },

    uploadGrid: { gap: 12 },
    docCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    docCardActive: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
    docInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    docIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    docTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    docHindi: { fontSize: 11, color: '#64748B' },
    filename: { fontSize: 11, color: '#2E7D32', marginTop: 2 },
    uploadBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    uploadBadgeText: { fontSize: 12, fontWeight: '700', color: '#0D47A1' },
    removeBtn: { padding: 4 },

    reviewCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
    reviewContent: { marginTop: 4 },
    reviewTitle: { fontSize: 14, fontWeight: '800', color: '#0D47A1', textTransform: 'uppercase' },
    editBtn: { fontSize: 12, fontWeight: '700', color: '#1565C0' },
    reviewItem: { flexDirection: 'row', marginBottom: 6 },
    reviewLabel: { width: 100, fontSize: 13, color: '#64748B' },
    reviewValue: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1E293B' },
    reviewDocList: { gap: 6 },
    reviewDocItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    reviewDocName: { fontSize: 12, color: '#1E293B' },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    purposeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    purposeOptionText: { fontSize: 16, color: '#1A237E' },

    bottomBar: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    mainBtn: { borderRadius: 14, overflow: 'hidden' },
    btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
    mainBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },

    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#FFF' },
    successIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F8E9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 10 },
    successSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
    idCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#E2E8F0' },
    idLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    idValue: { fontSize: 24, fontWeight: '800', color: '#0D47A1' },
    successActions: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    actionBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 12, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
    timeEstimate: { fontSize: 12, color: '#94A3B8', marginTop: 20 },
});
