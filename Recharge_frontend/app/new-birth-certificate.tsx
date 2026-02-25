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
    // Child Details
    childName: string;
    gender: string;
    dob: string;
    timeOfBirth: string;
    placeOfBirth: "Hospital" | "Home" | "";
    hospitalName: string;
    registrationDate: string;

    // Father's Details
    fatherName: string;
    fatherAadhaar: string;
    fatherMobile: string;
    fatherOccupation: string;

    // Mother's Details
    motherName: string;
    motherAadhaar: string;
    motherMobile: string;
    motherOccupation: string;

    // Address Details
    houseNo: string;
    street: string;
    village: string;
    district: string;
    state: string;
    pincode: string;

    // Registration Type
    registrationType: "Normal" | "Late" | "";
    delayReason: string;

    declaration: boolean;
}

interface DocumentsState {
    hospitalReport: DocumentType | null;
    parentsAadhaar: DocumentType | null;
    addressProof: DocumentType | null;
    marriageCertificate: DocumentType | null;
    affidavit: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewBirthCertificateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [documents, setDocuments] = useState<DocumentsState>({
        hospitalReport: null,
        parentsAadhaar: null,
        addressProof: null,
        marriageCertificate: null,
        affidavit: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        childName: "",
        gender: "",
        dob: "",
        timeOfBirth: "",
        placeOfBirth: "",
        hospitalName: "",
        registrationDate: "",
        fatherName: "",
        fatherAadhaar: "",
        fatherMobile: "",
        fatherOccupation: "",
        motherName: "",
        motherAadhaar: "",
        motherMobile: "",
        motherOccupation: "",
        houseNo: "",
        street: "",
        village: "",
        district: "",
        state: "Maharashtra",
        pincode: "",
        registrationType: "",
        delayReason: "",
        declaration: false,
    });

    // Handle back navigation
    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
                return true;
            } else {
                router.replace("/birth-certificate-services");
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

    const formatTime = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + ":" + cleaned.slice(2, 4);
        return formatted;
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            // Step 1 Validation
            const { childName, gender, dob, timeOfBirth, placeOfBirth, fatherName, fatherAadhaar, fatherMobile, motherName, motherAadhaar, motherMobile, houseNo, village, district, pincode, registrationType } = formData;

            if (!childName || !gender || !dob || !timeOfBirth || !placeOfBirth || !registrationType) {
                Alert.alert("Required", "Please fill mandatory child and registration details");
                return;
            }
            if (placeOfBirth === "Hospital" && !formData.hospitalName) {
                Alert.alert("Required", "Please enter hospital name");
                return;
            }
            if (!fatherName || fatherAadhaar.length !== 12 || fatherMobile.length !== 10) {
                Alert.alert("Required", "Please fill mandatory father details correctly");
                return;
            }
            if (!motherName || motherAadhaar.length !== 12 || motherMobile.length !== 10) {
                Alert.alert("Required", "Please fill mandatory mother details correctly");
                return;
            }
            if (!houseNo || !village || !district || pincode.length !== 6) {
                Alert.alert("Required", "Please fill mandatory address details correctly");
                return;
            }
            if (registrationType === "Late" && !formData.delayReason) {
                Alert.alert("Required", "Please provide reason for late registration");
                return;
            }

            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Step 2 Validation
            if (!documents.hospitalReport || !documents.parentsAadhaar || !documents.addressProof) {
                Alert.alert("Documents Required", "Please upload all mandatory documents");
                return;
            }
            if (formData.registrationType === "Late" && !documents.affidavit) {
                Alert.alert("Document Required", "Affidavit is mandatory for late registration");
                return;
            }
            setCurrentStep(3);
        } else {
            // Step 3
            if (!formData.declaration) {
                Alert.alert("Required", "Please accept the declaration");
                return;
            }

            setIsSubmitting(true);
            setTimeout(() => {
                const refId = "BIRTH" + Math.random().toString(36).substr(2, 9).toUpperCase();
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
                    <Text style={styles.successSubtitle}>Your Birth Certificate application has been received successfully.</Text>

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

                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/birth-certificate-services")}>
                        <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.btnGrad}>
                            <Text style={styles.mainBtnText}>Return to Services</Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.timeEstimate}>Estimated Processing Time: 7-10 Working Days</Text>
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
                        else router.replace("/birth-certificate-services");
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Birth Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for registration</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Child Details" icon="person" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Child Full Name *" />
                                <Input value={formData.childName} onChangeText={(v: string) => setFormData({ ...formData, childName: v })} placeholder="Enter child name" icon="person-outline" />

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Gender *" />
                                        <View style={styles.radioGroup}>
                                            {["Male", "Female", "Other"].map(g => (
                                                <TouchableOpacity key={g} style={[styles.radioBtn, formData.gender === g && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, gender: g })}>
                                                    <Text style={[styles.radioText, formData.gender === g && styles.radioTextActive]}>{g}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Date of Birth *" />
                                        <Input value={formData.dob} onChangeText={(v: string) => setFormData({ ...formData, dob: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Time of Birth *" />
                                        <Input value={formData.timeOfBirth} onChangeText={(v: string) => setFormData({ ...formData, timeOfBirth: formatTime(v) })} placeholder="HH:MM" icon="time-outline" keyboardType="number-pad" maxLength={5} />
                                    </View>
                                </View>

                                <Label text="Place of Birth *" />
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>
                                    {["Hospital", "Home"].map(p => (
                                        <TouchableOpacity key={p} style={[styles.radioBtn, formData.placeOfBirth === p && styles.radioBtnActive]} onPress={() => setFormData({ ...formData, placeOfBirth: p as any })}>
                                            <Text style={[styles.radioText, formData.placeOfBirth === p && styles.radioTextActive]}>{p}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {formData.placeOfBirth === "Hospital" && (
                                    <>
                                        <Label text="Hospital Name *" />
                                        <Input value={formData.hospitalName} onChangeText={(v: string) => setFormData({ ...formData, hospitalName: v })} placeholder="Enter hospital name" icon="business-outline" />
                                    </>
                                )}

                                <Label text="Registration Date *" />
                                <Input value={formData.registrationDate} onChangeText={(v: string) => setFormData({ ...formData, registrationDate: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />
                            </View>

                            <SectionTitle title="Father's Details" icon="person-outline" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Full Name *" />
                                <Input value={formData.fatherName} onChangeText={(v: string) => setFormData({ ...formData, fatherName: v })} placeholder="Father's full name" icon="person-outline" />
                                <Label text="Aadhaar Number *" />
                                <Input value={formData.fatherAadhaar} onChangeText={(v: string) => setFormData({ ...formData, fatherAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Mobile Number *" />
                                        <Input value={formData.fatherMobile} onChangeText={(v: string) => setFormData({ ...formData, fatherMobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Occupation" />
                                        <Input value={formData.fatherOccupation} onChangeText={(v: string) => setFormData({ ...formData, fatherOccupation: v })} placeholder="Occupation" icon="briefcase-outline" />
                                    </View>
                                </View>
                            </View>

                            <SectionTitle title="Mother's Details" icon="person-outline" color="#1A237E" />
                            <View style={styles.formCard}>
                                <Label text="Full Name *" />
                                <Input value={formData.motherName} onChangeText={(v: string) => setFormData({ ...formData, motherName: v })} placeholder="Mother's full name" icon="person-outline" />
                                <Label text="Aadhaar Number *" />
                                <Input value={formData.motherAadhaar} onChangeText={(v: string) => setFormData({ ...formData, motherAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Mobile Number *" />
                                        <Input value={formData.motherMobile} onChangeText={(v: string) => setFormData({ ...formData, motherMobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Occupation" />
                                        <Input value={formData.motherOccupation} onChangeText={(v: string) => setFormData({ ...formData, motherOccupation: v })} placeholder="Occupation" icon="briefcase-outline" />
                                    </View>
                                </View>
                            </View>

                            <SectionTitle title="Residential Address" icon="home" color="#1A237E" />
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
                                        <Label text="District *" />
                                        <Input value={formData.district} onChangeText={(v: string) => setFormData({ ...formData, district: v })} placeholder="District" />
                                    </View>
                                </View>
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="State *" />
                                        <Input value={formData.state} onChangeText={(v: string) => setFormData({ ...formData, state: v })} placeholder="State" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Pincode *" />
                                        <Input value={formData.pincode} onChangeText={(v: string) => setFormData({ ...formData, pincode: v.replace(/\D/g, '').substring(0, 6) })} placeholder="6-digit" keyboardType="number-pad" maxLength={6} />
                                    </View>
                                </View>
                            </View>

                            <SectionTitle title="Registration Type" icon="options" color="#1A237E" />
                            <View style={styles.formCard}>
                                <View style={[styles.radioGroup, { marginBottom: 12 }]}>
                                    {[
                                        { id: "Normal", label: "Normal (On-time)" },
                                        { id: "Late", label: "Late Registration" }
                                    ].map(r => (
                                        <TouchableOpacity key={r.id} style={[styles.radioBtn, formData.registrationType === r.id && styles.radioBtnActive, { flex: 1 }]} onPress={() => setFormData({ ...formData, registrationType: r.id as any })}>
                                            <Text style={[styles.radioText, formData.registrationType === r.id && styles.radioTextActive]}>{r.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {formData.registrationType === "Late" && (
                                    <>
                                        <View style={styles.lateNotice}>
                                            <Ionicons name="warning-outline" size={16} color="#C62828" />
                                            <Text style={styles.lateNoticeText}>Affidavit is mandatory for late registration.</Text>
                                        </View>
                                        <Label text="Reason for Delay *" />
                                        <Input value={formData.delayReason} onChangeText={(v: string) => setFormData({ ...formData, delayReason: v })} placeholder="State reason for delay" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
                                    </>
                                )}
                            </View>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Mandatory Documents" icon="cloud-upload" color="#2E7D32" />
                            <View style={styles.docList}>
                                <DocUploadItem title="Hospital Birth Report" hindi="रुग्णालयातील जन्म नोंद अहवाल" isUploaded={!!documents.hospitalReport} filename={documents.hospitalReport?.name} onUpload={() => pickDocument('hospitalReport')} onRemove={() => removeDocument('hospitalReport')} />
                                <DocUploadItem title="Parents Aadhaar Card" hindi="दोघांचे आधार कार्ड" isUploaded={!!documents.parentsAadhaar} filename={documents.parentsAadhaar?.name} onUpload={() => pickDocument('parentsAadhaar')} onRemove={() => removeDocument('parentsAadhaar')} />
                                <DocUploadItem title="Address Proof" hindi="पत्त्याचा पुरावा" isUploaded={!!documents.addressProof} filename={documents.addressProof?.name} onUpload={() => pickDocument('addressProof')} onRemove={() => removeDocument('addressProof')} />
                            </View>

                            <SectionTitle title="Conditional Documents" icon="document-text" color="#1A237E" />
                            <View style={styles.docList}>
                                <DocUploadItem title="Parents Marriage Certificate" isUploaded={!!documents.marriageCertificate} filename={documents.marriageCertificate?.name} onUpload={() => pickDocument('marriageCertificate')} onRemove={() => removeDocument('marriageCertificate')} />
                                {formData.registrationType === "Late" && (
                                    <DocUploadItem title="Affidavit" hindi="शपथपत्र (उशिरा नोंदणी असल्यास)" isUploaded={!!documents.affidavit} filename={documents.affidavit?.name} onUpload={() => pickDocument('affidavit')} onRemove={() => removeDocument('affidavit')} required />
                                )}
                            </View>
                        </View>
                    )}

                    {currentStep === 3 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Review Your Details" icon="eye" color="#1A237E" />
                            <ReviewCard title="Child Info" editStep={1} onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Full Name" value={formData.childName} />
                                <ReviewItem label="Gender" value={formData.gender} />
                                <ReviewItem label="DOB" value={formData.dob} />
                                <ReviewItem label="Time of Birth" value={formData.timeOfBirth} />
                                <ReviewItem label="Place" value={formData.placeOfBirth + (formData.hospitalName ? ` (${formData.hospitalName})` : "")} />
                                <ReviewItem label="Reg. Type" value={formData.registrationType} />
                            </ReviewCard>

                            <ReviewCard title="Parents Info" editStep={1} onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Father" value={formData.fatherName} />
                                <ReviewItem label="Mother" value={formData.motherName} />
                                <ReviewItem label="Mobile" value={formData.fatherMobile} />
                            </ReviewCard>

                            <ReviewCard title="Address" editStep={1} onEdit={() => setCurrentStep(1)}>
                                <ReviewItem label="Address" value={`${formData.houseNo}, ${formData.street}, ${formData.village}, ${formData.district}, ${formData.state} - ${formData.pincode}`} />
                            </ReviewCard>

                            <ReviewCard title="Documents" editStep={2} onEdit={() => setCurrentStep(2)}>
                                <View style={styles.reviewDocList}>
                                    {Object.entries(documents).filter(([_, v]) => v).map(([k, v]) => (
                                        <View key={k} style={styles.reviewDocItem}>
                                            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                                            <Text style={styles.reviewDocName}>{v?.name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ReviewCard>

                            <TouchableOpacity style={styles.declarationBox} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <View style={[styles.checkBox, formData.declaration && styles.checkBoxActive]}>
                                    {formData.declaration && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                </View>
                                <Text style={styles.declarationText}>I declare that the information provided is true and correct as per civil registration laws.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>

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

    lateNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
    lateNoticeText: { fontSize: 12, color: '#C62828', fontWeight: '600' },

    docList: { gap: 12 },
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

    declarationBox: { flexDirection: 'row', marginTop: 20, gap: 12, alignItems: 'flex-start', padding: 4 },
    checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#0D47A1', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    checkBoxActive: { backgroundColor: '#0D47A1' },
    declarationText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },

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
