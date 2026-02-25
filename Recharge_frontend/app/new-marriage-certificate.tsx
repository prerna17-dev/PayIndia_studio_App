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
    // Groom Details
    groomName: string;
    groomAadhaar: string;
    groomDob: string;
    groomAge: string;
    groomOccupation: string;
    groomMobile: string;
    groomEmail: string;

    // Bride Details
    brideName: string;
    brideAadhaar: string;
    brideDob: string;
    brideAge: string;
    brideOccupation: string;
    brideMobile: string;
    brideEmail: string;

    // Marriage Details
    dateOfMarriage: string;
    placeOfMarriage: string;
    marriageAddress: string;
    typeOfMarriage: "Religious" | "Court" | "Other" | "";

    // Witness 1
    w1Name: string;
    w1Aadhaar: string;
    w1Address: string;
    w1Mobile: string;

    // Witness 2
    w2Name: string;
    w2Aadhaar: string;
    w2Address: string;
    w2Mobile: string;

    declaration: boolean;
    finalConfirmation: boolean;
}

interface DocumentsState {
    groomAadhaarDoc: DocumentType | null;
    brideAadhaarDoc: DocumentType | null;
    invitationCard: DocumentType | null;
    venueProof: DocumentType | null;
    marriagePhotos: DocumentType | null;
    w1AadhaarDoc: DocumentType | null;
    w2AadhaarDoc: DocumentType | null;
    w1Photo: DocumentType | null;
    w2Photo: DocumentType | null;
    addressProof: DocumentType | null;
    [key: string]: DocumentType | null;
}

export default function NewMarriageCertificateScreen() {
    const router = useRouter();

    // State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState("");

    const [documents, setDocuments] = useState<DocumentsState>({
        groomAadhaarDoc: null,
        brideAadhaarDoc: null,
        invitationCard: null,
        venueProof: null,
        marriagePhotos: null,
        w1AadhaarDoc: null,
        w2AadhaarDoc: null,
        w1Photo: null,
        w2Photo: null,
        addressProof: null,
    });

    const [formData, setFormData] = useState<FormDataType>({
        groomName: "", groomAadhaar: "", groomDob: "", groomAge: "", groomOccupation: "", groomMobile: "", groomEmail: "",
        brideName: "", brideAadhaar: "", brideDob: "", brideAge: "", brideOccupation: "", brideMobile: "", brideEmail: "",
        dateOfMarriage: "", placeOfMarriage: "", marriageAddress: "", typeOfMarriage: "",
        w1Name: "", w1Aadhaar: "", w1Address: "", w1Mobile: "",
        w2Name: "", w2Aadhaar: "", w2Address: "", w2Mobile: "",
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
                router.replace("/marriage-certificate-services");
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [currentStep]);

    const REQUIRED_DOCS = [
        { id: 'groomAadhaarDoc', name: 'Groom Aadhaar *', icon: 'card-account-details', color: '#1565C0', hint: 'Front & Back side' },
        { id: 'brideAadhaarDoc', name: 'Bride Aadhaar *', icon: 'card-account-details-outline', color: '#D81B60', hint: 'Front & Back side' },
        { id: 'invitationCard', name: 'Wedding Invitation *', icon: 'email-outline', color: '#E65100', hint: 'Clearly visible card' },
        { id: 'venueProof', name: 'Venue Proof *', icon: 'home-map-marker', color: '#2E7D32', hint: 'Receipt / Letterhead' },
        { id: 'marriagePhotos', name: 'Marriage Photos *', icon: 'camera-outline', color: '#7B1FA2', hint: 'Couple photos' },
        { id: 'w1AadhaarDoc', name: 'Witness 1 Aadhaar *', icon: 'card-text-outline', color: '#1A237E', hint: 'Full identity proof' },
        { id: 'w2AadhaarDoc', name: 'Witness 2 Aadhaar *', icon: 'card-text-outline', color: '#1A237E', hint: 'Full identity proof' },
        { id: 'w1Photo', name: 'Witness 1 Photo *', icon: 'account-outline', color: '#1A237E', hint: 'Passport size' },
        { id: 'w2Photo', name: 'Witness 2 Photo *', icon: 'account-outline', color: '#1A237E', hint: 'Passport size' },
        { id: 'addressProof', name: 'Address Proof *', icon: 'map-marker-radius', color: '#455A64', hint: 'Light Bill / Voter ID' },
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
                    [docType]: { name: file.name, size: file.size, uri: file.uri }
                }));
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document");
        }
    };

    const formatDate = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, "");
        let formatted = cleaned;
        if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        if (cleaned.length > 4) formatted = formatted.slice(0, 5) + "/" + cleaned.slice(4, 8);
        return formatted;
    };

    const calculateAge = (dob: string) => {
        if (dob.length !== 10) return "";
        const [d, m, y] = dob.split("/").map(Number);
        const birthDate = new Date(y, m - 1, d);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    const handleDobChange = (field: 'groomDob' | 'brideDob', value: string) => {
        const formatted = formatDate(value);
        const ageField = field === 'groomDob' ? 'groomAge' : 'brideAge';
        const age = calculateAge(formatted);
        setFormData({ ...formData, [field]: formatted, [ageField]: age });
    };

    const handleContinue = () => {
        if (currentStep === 1) {
            const { groomName, groomAadhaar, groomAge, brideName, brideAadhaar, brideAge, dateOfMarriage, placeOfMarriage, w1Name, w1Aadhaar, w1Mobile, w2Name, w2Aadhaar, w2Mobile, declaration } = formData;

            if (!groomName || groomAadhaar.length !== 12 || !brideName || brideAadhaar.length !== 12 || !dateOfMarriage || !placeOfMarriage || !declaration) {
                Alert.alert("Required", "Please fill all mandatory details and accept declaration");
                return;
            }

            if (parseInt(groomAge) < 21) {
                Alert.alert("Ineligible", "Groom must be at least 21 years old");
                return;
            }
            if (parseInt(brideAge) < 18) {
                Alert.alert("Ineligible", "Bride must be at least 18 years old");
                return;
            }

            if (!w1Name || w1Aadhaar.length !== 12 || w1Mobile.length !== 10 || !w2Name || w2Aadhaar.length !== 12 || w2Mobile.length !== 10) {
                Alert.alert("Witness Required", "Please fill correct details for both witnesses (12-digit Aadhaar, 10-digit Mobile)");
                return;
            }

            setCurrentStep(2);
        } else if (currentStep === 2) {
            const missing = REQUIRED_DOCS.filter(doc => !documents[doc.id]);
            if (missing.length > 0) {
                Alert.alert("Documents Required", "Please upload all mandatory documents");
                return;
            }
            setCurrentStep(3);
        } else {
            if (!formData.finalConfirmation) {
                Alert.alert("Confirmation", "Please confirm that all details are accurate");
                return;
            }
            setIsSubmitting(true);
            setTimeout(() => {
                const refId = "MARR" + Math.random().toString(36).substr(2, 9).toUpperCase();
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
                    <Text style={styles.successSubtitle}>Your Marriage Certificate application has been received successfully.</Text>
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
                    <TouchableOpacity style={styles.mainBtn} onPress={() => router.replace("/marriage-certificate-services")}>
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
                        if (currentStep > 1) setCurrentStep(currentStep - 1);
                        else router.replace("/marriage-certificate-services");
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>New Marriage Certificate</Text>
                        <Text style={styles.headerSubtitle}>Apply for fresh certificate</Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {renderStepIndicator()}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {currentStep === 1 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Groom Details" icon="person" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input value={formData.groomName} onChangeText={(v: string) => setFormData({ ...formData, groomName: v })} placeholder="Enter Groom full name" icon="person-outline" />
                                <Label text="Aadhaar Number *" />
                                <Input value={formData.groomAadhaar} onChangeText={(v: string) => setFormData({ ...formData, groomAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Date of Birth *" />
                                        <Input value={formData.groomDob} onChangeText={(v: string) => handleDobChange('groomDob', v)} placeholder="DD/MM/YYYY" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Age" />
                                        <Input value={formData.groomAge} editable={false} placeholder="Age" />
                                    </View>
                                </View>
                                <Label text="Occupation *" />
                                <Input value={formData.groomOccupation} onChangeText={(v: string) => setFormData({ ...formData, groomOccupation: v })} placeholder="Groom's Occupation" icon="briefcase-outline" />
                                <Label text="Mobile Number *" />
                                <Input value={formData.groomMobile} onChangeText={(v: string) => setFormData({ ...formData, groomMobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />

                                <Label text="Email (Optional)" />
                                <Input value={formData.groomEmail} onChangeText={(v: string) => setFormData({ ...formData, groomEmail: v })} placeholder="Email address" icon="mail-outline" />
                            </View>

                            <SectionTitle title="Bride Details" icon="person-outline" />
                            <View style={styles.formCard}>
                                <Label text="Full Name (as per Aadhaar) *" />
                                <Input value={formData.brideName} onChangeText={(v: string) => setFormData({ ...formData, brideName: v })} placeholder="Enter Bride full name" icon="person-outline" />
                                <Label text="Aadhaar Number *" />
                                <Input value={formData.brideAadhaar} onChangeText={(v: string) => setFormData({ ...formData, brideAadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" icon="card-outline" keyboardType="number-pad" maxLength={12} />
                                <View style={styles.inputRow}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Label text="Date of Birth *" />
                                        <Input value={formData.brideDob} onChangeText={(v: string) => handleDobChange('brideDob', v)} placeholder="DD/MM/YYYY" keyboardType="number-pad" maxLength={10} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label text="Age" />
                                        <Input value={formData.brideAge} editable={false} placeholder="Age" />
                                    </View>
                                </View>
                                <Label text="Occupation *" />
                                <Input value={formData.brideOccupation} onChangeText={(v: string) => setFormData({ ...formData, brideOccupation: v })} placeholder="Bride's Occupation" icon="briefcase-outline" />
                                <Label text="Mobile Number *" />
                                <Input value={formData.brideMobile} onChangeText={(v: string) => setFormData({ ...formData, brideMobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" icon="phone-portrait-outline" keyboardType="number-pad" maxLength={10} />

                                <Label text="Email (Optional)" />
                                <Input value={formData.brideEmail} onChangeText={(v: string) => setFormData({ ...formData, brideEmail: v })} placeholder="Email address" icon="mail-outline" />
                            </View>

                            <SectionTitle title="Marriage Details" icon="heart" />
                            <View style={styles.formCard}>
                                <Label text="Date of Marriage *" />
                                <Input value={formData.dateOfMarriage} onChangeText={(v: string) => setFormData({ ...formData, dateOfMarriage: formatDate(v) })} placeholder="DD/MM/YYYY" icon="calendar-outline" keyboardType="number-pad" maxLength={10} />
                                <Label text="Place of Marriage (Venue Name) *" />
                                <Input value={formData.placeOfMarriage} onChangeText={(v: string) => setFormData({ ...formData, placeOfMarriage: v })} placeholder="e.g. Dream Garden Hall" icon="business-outline" />
                                <Label text="Marriage Location Address *" />
                                <Input value={formData.marriageAddress} onChangeText={(v: string) => setFormData({ ...formData, marriageAddress: v })} placeholder="Complete address of venue" icon="location-outline" multiline />
                                <Label text="Type of Marriage *" />
                                <View style={styles.radioGroup}>
                                    {["Religious", "Court", "Other"].map(t => (
                                        <TouchableOpacity key={t} style={[styles.chip, formData.typeOfMarriage === t && styles.chipActive]} onPress={() => setFormData({ ...formData, typeOfMarriage: t as any })}>
                                            <Text style={[styles.chipText, formData.typeOfMarriage === t && styles.chipTextActive]}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <SectionTitle title="Witness Details" icon="people" />
                            <View style={styles.formCard}>
                                <Label text="Witness 1 - Full Name *" />
                                <Input value={formData.w1Name} onChangeText={(v: string) => setFormData({ ...formData, w1Name: v })} placeholder="Witness 1 Name" icon="person-outline" />
                                <Label text="Witness 1 - Aadhaar *" />
                                <Input value={formData.w1Aadhaar} onChangeText={(v: string) => setFormData({ ...formData, w1Aadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" keyboardType="number-pad" maxLength={12} icon="card-outline" />

                                <Label text="Witness 1 - Mobile *" />
                                <Input value={formData.w1Mobile} onChangeText={(v: string) => setFormData({ ...formData, w1Mobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" keyboardType="number-pad" maxLength={10} icon="phone-portrait-outline" />

                                <View style={{ height: 15 }} />

                                <Label text="Witness 2 - Full Name *" />
                                <Input value={formData.w2Name} onChangeText={(v: string) => setFormData({ ...formData, w2Name: v })} placeholder="Witness 2 Name" icon="person-outline" />
                                <Label text="Witness 2 - Aadhaar *" />
                                <Input value={formData.w2Aadhaar} onChangeText={(v: string) => setFormData({ ...formData, w2Aadhaar: v.replace(/\D/g, '').substring(0, 12) })} placeholder="12-digit Aadhaar" keyboardType="number-pad" maxLength={12} icon="card-outline" />

                                <Label text="Witness 2 - Mobile *" />
                                <Input value={formData.w2Mobile} onChangeText={(v: string) => setFormData({ ...formData, w2Mobile: v.replace(/\D/g, '').substring(0, 10) })} placeholder="10-digit mobile" keyboardType="number-pad" maxLength={10} icon="phone-portrait-outline" />
                            </View>

                            <TouchableOpacity style={styles.declarationRow} onPress={() => setFormData({ ...formData, declaration: !formData.declaration })}>
                                <Ionicons name={formData.declaration ? "checkbox" : "square-outline"} size={24} color={formData.declaration ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>We declare that the above marriage details are true and legally valid.</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {currentStep === 2 && (
                        <View style={styles.stepWrapper}>
                            <SectionTitle title="Upload Documents" icon="document-text" />
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
                            <ReviewItem title="Groom Details" data={[
                                { label: "Name", value: formData.groomName },
                                { label: "Aadhaar", value: formData.groomAadhaar },
                                { label: "Age", value: formData.groomAge },
                            ]} onEdit={() => setCurrentStep(1)} />
                            <ReviewItem title="Bride Details" data={[
                                { label: "Name", value: formData.brideName },
                                { label: "Aadhaar", value: formData.brideAadhaar },
                                { label: "Age", value: formData.brideAge },
                            ]} onEdit={() => setCurrentStep(1)} />
                            <ReviewItem title="Marriage Info" data={[
                                { label: "Date", value: formData.dateOfMarriage },
                                { label: "Venue", value: formData.placeOfMarriage },
                                { label: "Type", value: formData.typeOfMarriage },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewItem title="Witness 1" data={[
                                { label: "Name", value: formData.w1Name },
                                { label: "Aadhaar", value: formData.w1Aadhaar },
                                { label: "Mobile", value: formData.w1Mobile },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <ReviewItem title="Witness 2" data={[
                                { label: "Name", value: formData.w2Name },
                                { label: "Aadhaar", value: formData.w2Aadhaar },
                                { label: "Mobile", value: formData.w2Mobile },
                            ]} onEdit={() => setCurrentStep(1)} />

                            <TouchableOpacity style={[styles.declarationRow, { marginTop: 20 }]} onPress={() => setFormData({ ...formData, finalConfirmation: !formData.finalConfirmation })}>
                                <Ionicons name={formData.finalConfirmation ? "checkbox" : "square-outline"} size={24} color={formData.finalConfirmation ? "#0D47A1" : "#94A3B8"} />
                                <Text style={styles.declarationLabel}>I confirm that all submitted documents are genuine and the marriage has been solemnized legally.</Text>
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
        {icon && <Ionicons name={icon} size={18} color="#94A3B8" style={{ marginRight: 10 }} />}
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
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', marginRight: 8, marginBottom: 8 },
    chipActive: { borderColor: '#0D47A1', backgroundColor: '#E3F2FD' },
    chipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    chipTextActive: { color: '#0D47A1', fontWeight: '700' },
    radioGroup: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
    declarationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 4 },
    declarationLabel: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20, fontWeight: '500' },
    docList: { gap: 12 },
    docUploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    docUploadCardActive: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
    docIconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    docTextContent: { flex: 1, marginLeft: 15 },
    docTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    docHint: { fontSize: 12, color: '#64748B', marginTop: 2 },
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
