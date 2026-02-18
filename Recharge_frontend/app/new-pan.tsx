import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface UploadedDoc {
    name: string;
    size?: number;
    uri: string;
}

export default function NewPANScreen() {
    const router = useRouter();

    // Form State
    const [currentStep, setCurrentStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');

    // Document uploads
    const [aadhaarDoc, setAadhaarDoc] = useState<UploadedDoc | null>(null);
    const [addressProof, setAddressProof] = useState<UploadedDoc | null>(null);
    const [dobProof, setDobProof] = useState<UploadedDoc | null>(null);
    const [photo, setPhoto] = useState<UploadedDoc | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = 3;

    // Document picker
    const pickDocument = async (type: 'aadhaar' | 'address' | 'dob') => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
            });

            if (result.canceled === false && result.assets && result.assets[0]) {
                const doc = {
                    name: result.assets[0].name,
                    size: result.assets[0].size,
                    uri: result.assets[0].uri,
                };

                if (type === 'aadhaar') setAadhaarDoc(doc);
                else if (type === 'address') setAddressProof(doc);
                else if (type === 'dob') setDobProof(doc);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    // Photo picker
    const pickPhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow access to photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            setPhoto({
                name: 'photo.jpg',
                uri: result.assets[0].uri,
            });
        }
    };

    const canProceedStep1 = fullName.trim() && fatherName.trim() && motherName.trim() &&
        dob.trim() && mobile.length === 10 && email.includes('@') &&
        aadhaarNumber.length === 12 && address.trim() &&
        city.trim() && pincode.length === 6;

    const canProceedStep2 = !!(aadhaarDoc && addressProof && dobProof && photo);

    const canSubmit = canProceedStep2;

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert(
                'Application Submitted',
                'Your PAN application has been submitted successfully. You will receive acknowledgement on your registered email.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New PAN Application</Text>
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

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* STEP 1: Details */}
                        {currentStep === 1 && (
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Personal Details</Text>
                                <Text style={styles.stepSubtitle}>Provide information for PAN card application</Text>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Full Name</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your full name"
                                            value={fullName}
                                            onChangeText={setFullName}
                                        />
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={styles.formLabel}>Father's Name</Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Father's name"
                                                value={fatherName}
                                                onChangeText={setFatherName}
                                            />
                                        </View>
                                    </View>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={styles.formLabel}>Mother's Name</Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Mother's name"
                                                value={motherName}
                                                onChangeText={setMotherName}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={styles.formLabel}>Date of Birth</Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="DD/MM/YYYY"
                                                value={dob}
                                                onChangeText={setDob}
                                                keyboardType="numeric"
                                                maxLength={10}
                                            />
                                        </View>
                                    </View>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={styles.formLabel}>Mobile Number</Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="10 digit number"
                                                value={mobile}
                                                onChangeText={setMobile}
                                                keyboardType="phone-pad"
                                                maxLength={10}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Email Address</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter email address"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <Text style={styles.subSectionTitle}>Address & Aadhaar</Text>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Aadhaar Number</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="12 digit Aadhaar"
                                            value={aadhaarNumber}
                                            onChangeText={setAadhaarNumber}
                                            keyboardType="numeric"
                                            maxLength={12}
                                        />
                                    </View>
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Full Address</Text>
                                    <View style={[styles.formInput, { minHeight: 80 }]}>
                                        <TextInput
                                            style={[styles.input, { textAlignVertical: 'top' }]}
                                            placeholder="Room/Flat No, Building, Street"
                                            value={address}
                                            onChangeText={setAddress}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={styles.formLabel}>City</Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="City"
                                                value={city}
                                                onChangeText={setCity}
                                            />
                                        </View>
                                    </View>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={styles.formLabel}>Pincode</Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Pincode"
                                                value={pincode}
                                                onChangeText={setPincode}
                                                keyboardType="numeric"
                                                maxLength={6}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* STEP 2: Documents */}
                        {currentStep === 2 && (
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Documents</Text>
                                <Text style={styles.stepSubtitle}>Upload proofs and photograph</Text>

                                <View style={styles.documentCard}>
                                    <View style={styles.documentHeader}>
                                        <Ionicons name="card-outline" size={24} color="#4CAF50" />
                                        <View style={styles.documentInfo}>
                                            <Text style={styles.documentTitle}>Aadhaar Card</Text>
                                            <Text style={styles.documentSubtitle}>Required for identity verification</Text>
                                        </View>
                                    </View>
                                    {aadhaarDoc && (
                                        <View style={styles.uploadedFile}>
                                            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                                            <Text style={styles.uploadedFileName} numberOfLines={1}>{aadhaarDoc.name}</Text>
                                            <TouchableOpacity onPress={() => setAadhaarDoc(null)}>
                                                <Ionicons name="close-circle" size={20} color="#FF5252" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument('aadhaar')}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#2196F3" />
                                        <Text style={styles.uploadButtonText}>Upload Aadhaar</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.documentCard}>
                                    <View style={styles.documentHeader}>
                                        <Ionicons name="location-outline" size={24} color="#4CAF50" />
                                        <View style={styles.documentInfo}>
                                            <Text style={styles.documentTitle}>Address Proof</Text>
                                            <Text style={styles.documentSubtitle}>Utility bill or Bank statement</Text>
                                        </View>
                                    </View>
                                    {addressProof && (
                                        <View style={styles.uploadedFile}>
                                            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                                            <Text style={styles.uploadedFileName} numberOfLines={1}>{addressProof.name}</Text>
                                            <TouchableOpacity onPress={() => setAddressProof(null)}>
                                                <Ionicons name="close-circle" size={20} color="#FF5252" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument('address')}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#2196F3" />
                                        <Text style={styles.uploadButtonText}>Upload Address Proof</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.documentCard}>
                                    <View style={styles.documentHeader}>
                                        <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
                                        <View style={styles.documentInfo}>
                                            <Text style={styles.documentTitle}>DOB Proof</Text>
                                            <Text style={styles.documentSubtitle}>Birth certificate or School LC</Text>
                                        </View>
                                    </View>
                                    {dobProof && (
                                        <View style={styles.uploadedFile}>
                                            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                                            <Text style={styles.uploadedFileName} numberOfLines={1}>{dobProof.name}</Text>
                                            <TouchableOpacity onPress={() => setDobProof(null)}>
                                                <Ionicons name="close-circle" size={20} color="#FF5252" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument('dob')}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#2196F3" />
                                        <Text style={styles.uploadButtonText}>Upload DOB Proof</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.documentCard}>
                                    <View style={styles.documentHeader}>
                                        <Ionicons name="camera-outline" size={24} color="#4CAF50" />
                                        <View style={styles.documentInfo}>
                                            <Text style={styles.documentTitle}>Passport Photo</Text>
                                            <Text style={styles.documentSubtitle}>Recent color photo</Text>
                                        </View>
                                    </View>
                                    {photo && (
                                        <View style={styles.uploadedFile}>
                                            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                                            <Text style={styles.uploadedFileName} numberOfLines={1}>{photo.name}</Text>
                                            <TouchableOpacity onPress={() => setPhoto(null)}>
                                                <Ionicons name="close-circle" size={20} color="#FF5252" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <TouchableOpacity style={styles.uploadButton} onPress={pickPhoto}>
                                        <Ionicons name="camera-outline" size={20} color="#2196F3" />
                                        <Text style={styles.uploadButtonText}>Upload Photo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* STEP 3: Review */}
                        {currentStep === 3 && (
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Review Application</Text>
                                <Text style={styles.stepSubtitle}>Verify your details before submission</Text>

                                <View style={styles.reviewCard}>
                                    <Text style={styles.reviewCardTitle}>Personal Details</Text>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Full Name</Text>
                                        <Text style={styles.reviewValue}>{fullName}</Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Father's Name</Text>
                                        <Text style={styles.reviewValue}>{fatherName}</Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>DOB</Text>
                                        <Text style={styles.reviewValue}>{dob}</Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Mobile</Text>
                                        <Text style={styles.reviewValue}>+91 {mobile}</Text>
                                    </View>
                                </View>

                                <View style={styles.reviewCard}>
                                    <Text style={styles.reviewCardTitle}>Address & Aadhaar</Text>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Aadhaar</Text>
                                        <Text style={styles.reviewValue}>{aadhaarNumber}</Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Address</Text>
                                        <Text style={styles.reviewValue} numberOfLines={2}>{address}</Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>City & Pincode</Text>
                                        <Text style={styles.reviewValue}>{city}, {pincode}</Text>
                                    </View>
                                </View>

                                <View style={styles.reviewCard}>
                                    <Text style={styles.reviewCardTitle}>Documents Uploaded</Text>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Aadhaar Card</Text>
                                        <Text style={styles.reviewValue}>{aadhaarDoc ? 'Yes' : 'No'}</Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Address Proof</Text>
                                        <Text style={styles.reviewValue}>{addressProof ? 'Yes' : 'No'}</Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>DOB Proof</Text>
                                        <Text style={styles.reviewValue}>{dobProof ? 'Yes' : 'No'}</Text>
                                    </View>
                                    <View style={styles.reviewRow}>
                                        <Text style={styles.reviewLabel}>Passport Photo</Text>
                                        <Text style={styles.reviewValue}>{photo ? 'Yes' : 'No'}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    {currentStep > 1 && (
                        <TouchableOpacity
                            style={styles.backNavBtn}
                            onPress={() => setCurrentStep(currentStep - 1)}
                        >
                            <Ionicons name="arrow-back" size={18} color="#666" />
                            <Text style={styles.backNavText}>Back</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.nextBtn,
                            (currentStep === 1 && !canProceedStep1) ||
                                (currentStep === 2 && !canProceedStep2)
                                ? styles.nextBtnDisabled
                                : {},
                        ]}
                        disabled={
                            (currentStep === 1 && !canProceedStep1) ||
                            (currentStep === 2 && !canProceedStep2) ||
                            isSubmitting
                        }
                        onPress={() => {
                            if (currentStep < 3) setCurrentStep(currentStep + 1);
                            else handleSubmit();
                        }}
                    >
                        <LinearGradient
                            colors={['#4CAF50', '#2E7D32']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextBtnGradient}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.nextBtnText}>
                                        {currentStep === 3 ? 'Confirm & Submit' : 'Continue'}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FA" },
    safeArea: { flex: 1 },
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F5F7FA",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1A1A1A",
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    stepIndicator: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    stepItem: {
        alignItems: "center",
        justifyContent: "center",
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
        marginTop: 4,
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: "#E0E0E0",
        marginHorizontal: 8,
        marginBottom: 15,
    },
    stepLineActive: {
        backgroundColor: "#4CAF50",
    },

    scrollContent: {
        paddingBottom: 100,
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
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    input: {
        fontSize: 15,
        color: "#1A1A1A",
    },
    formRow: {
        flexDirection: "row",
        gap: 12,
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

    // Bottom Navigation
    bottomNav: {
        flexDirection: "row",
        padding: 20,
        paddingBottom: 30,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        gap: 12,
    },
    backNavBtn: {
        flex: 0.4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
        borderRadius: 16,
        paddingVertical: 14,
    },
    backNavText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#666",
    },
    nextBtn: {
        flex: 1,
        borderRadius: 16,
        overflow: "hidden",
    },
    nextBtnDisabled: {
        opacity: 0.5,
    },
    nextBtnGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 16,
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
});