import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
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
    uri: string;
}

const CORRECTION_TYPES = [
    { id: 'name', label: 'Name Correction', hindi: 'नाव दुरुस्ती', icon: 'person' },
    { id: 'dob', label: 'Date of Birth', hindi: 'जन्मतारीख', icon: 'calendar' },
    { id: 'address', label: 'Address Update', hindi: 'पत्ता बदल', icon: 'home' },
    { id: 'mobile', label: 'Mobile Number', hindi: 'मोबाईल नंबर', icon: 'call' },
    { id: 'father', label: "Father's Name", hindi: 'वडिलांचे नाव', icon: 'person' },
    { id: 'photo', label: 'Photo Update', hindi: 'फोटो बदल', icon: 'camera' },
];

export default function PANCorrectionScreen() {
    const router = useRouter();

    // Section 1: Verification States
    const [panNumber, setPanNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Section 2: Selection States
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    // Section 3: Form States
    const [newName, setNewName] = useState("");
    const [newDob, setNewDob] = useState("");
    const [newFatherName, setNewFatherName] = useState("");
    const [newEmail, setNewEmail] = useState("");

    // Section 4: Document States
    const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleType = (id: string) => {
        if (selectedTypes.includes(id)) {
            setSelectedTypes(selectedTypes.filter(t => t !== id));
        } else {
            setSelectedTypes([...selectedTypes, id]);
        }
    };

    const handleSendOtp = () => {
        if (panNumber.length !== 10 || mobileNumber.length !== 10) {
            Alert.alert("Error", "Please enter valid PAN and Mobile number");
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setIsOtpSent(true);
        }, 1500);
    };

    const handleVerifyOtp = () => {
        if (otp.length !== 6) {
            Alert.alert("Error", "Please enter 6-digit OTP");
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setIsOtpVerified(true);
        }, 1500);
    };

    const pickDocument = async (type: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
            });

            if (result.canceled === false && result.assets && result.assets[0]) {
                const doc = {
                    name: result.assets[0].name,
                    uri: result.assets[0].uri,
                };
                setUploadedDocs(prev => ({ ...prev, [type]: doc }));
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert("Success", "Request submitted successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>PAN Correction</Text>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* SECTION 1: Verification */}
                        {!isOtpVerified && (
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Verify Identity</Text>
                                <Text style={styles.sectionSubtitle}>Enter your details to proceed with correction</Text>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>PAN Number</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter 10-digit PAN"
                                            value={panNumber}
                                            onChangeText={(t) => setPanNumber(t.toUpperCase())}
                                            autoCapitalize="characters"
                                            maxLength={10}
                                            editable={!isOtpSent}
                                        />
                                    </View>
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={styles.formLabel}>Mobile Number</Text>
                                    <View style={styles.formInput}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="10-digit mobile number"
                                            value={mobileNumber}
                                            onChangeText={setMobileNumber}
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            editable={!isOtpSent}
                                        />
                                    </View>
                                </View>

                                {isOtpSent && (
                                    <View style={styles.otpSection}>
                                        <Text style={styles.formLabel}>Enter OTP</Text>
                                        <View style={styles.formInput}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="6-digit OTP"
                                                value={otp}
                                                onChangeText={setOtp}
                                                keyboardType="numeric"
                                                maxLength={6}
                                            />
                                        </View>
                                        <TouchableOpacity onPress={handleSendOtp}>
                                            <Text style={styles.resendText}>Resend OTP</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.actionBtn, isVerifying && styles.btnDisabled]}
                                    onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
                                    disabled={isVerifying}
                                >
                                    <LinearGradient
                                        colors={['#4CAF50', '#2E7D32']}
                                        style={styles.btnGradient}
                                    >
                                        {isVerifying ? (
                                            <ActivityIndicator color="#FFF" size="small" />
                                        ) : (
                                            <Text style={styles.btnText}>
                                                {isOtpSent ? 'Verify OTP' : 'Send OTP'}
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* SECTION 2: Correction Type Selection */}
                        {isOtpVerified && (
                            <>
                                <View style={styles.selectionSection}>
                                    <Text style={styles.sectionTitle}>Select Update Types</Text>
                                    <Text style={styles.sectionSubtitle}>Choose fields you wish to correct</Text>

                                    <View style={styles.grid}>
                                        {[
                                            { id: 'name', label: 'Full Name', icon: 'person-outline' },
                                            { id: 'dob', label: 'Date of Birth', icon: 'calendar-outline' },
                                            { id: 'father', label: "Father's Name", icon: 'people-outline' },
                                            { id: 'contact', label: 'Email/Mobile', icon: 'mail-outline' },
                                        ].map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[
                                                    styles.gridItem,
                                                    selectedTypes.includes(item.id) && styles.gridItemActive
                                                ]}
                                                onPress={() => toggleType(item.id)}
                                            >
                                                <Ionicons
                                                    name={item.icon as any}
                                                    size={24}
                                                    color={selectedTypes.includes(item.id) ? '#4CAF50' : '#666'}
                                                />
                                                <Text style={[
                                                    styles.gridLabel,
                                                    selectedTypes.includes(item.id) && styles.gridLabelActive
                                                ]}>
                                                    {item.label}
                                                </Text>
                                                {selectedTypes.includes(item.id) && (
                                                    <View style={styles.checkBadge}>
                                                        <Ionicons name="checkmark" size={12} color="#FFF" />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* SECTION 3: Dynamic Forms */}
                                {selectedTypes.length > 0 && (
                                    <View style={styles.formCard}>
                                        <Text style={styles.formCardTitle}>Correction Details</Text>

                                        {selectedTypes.includes('name') && (
                                            <View style={styles.formSection}>
                                                <Text style={styles.formLabel}>Correct Full Name</Text>
                                                <View style={styles.formInput}>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="Enter correct full name"
                                                        value={newName}
                                                        onChangeText={setNewName}
                                                    />
                                                </View>
                                            </View>
                                        )}

                                        {selectedTypes.includes('dob') && (
                                            <View style={styles.formSection}>
                                                <Text style={styles.formLabel}>Correct Date of Birth</Text>
                                                <View style={styles.formInput}>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="DD/MM/YYYY"
                                                        value={newDob}
                                                        onChangeText={setNewDob}
                                                        keyboardType="numeric"
                                                        maxLength={10}
                                                    />
                                                </View>
                                            </View>
                                        )}

                                        {selectedTypes.includes('father') && (
                                            <View style={styles.formSection}>
                                                <Text style={styles.formLabel}>Correct Father's Name</Text>
                                                <View style={styles.formInput}>
                                                    <TextInput
                                                        style={styles.input}
                                                        placeholder="Enter father's name"
                                                        value={newFatherName}
                                                        onChangeText={setNewFatherName}
                                                    />
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* SECTION 4: Document Uploads */}
                                {selectedTypes.length > 0 && (
                                    <View style={styles.docsSection}>
                                        <Text style={styles.sectionTitle}>Supporting Documents</Text>
                                        <Text style={styles.sectionSubtitle}>Upload proofs for the corrections</Text>

                                        <View style={styles.docCard}>
                                            <View style={styles.docInfo}>
                                                <Text style={styles.docTitle}>Identity Proof</Text>
                                                <Text style={styles.docSub}>Aadhaar/Passport/DL</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.uploadBtn, uploadedDocs['idProof'] && styles.uploadBtnDone]}
                                                onPress={() => pickDocument('idProof')}
                                            >
                                                <Ionicons
                                                    name={uploadedDocs['idProof'] ? "checkmark-circle" : "cloud-upload-outline"}
                                                    size={20}
                                                    color={uploadedDocs['idProof'] ? "#4CAF50" : "#2196F3"}
                                                />
                                                <Text style={[styles.uploadBtnText, uploadedDocs['idProof'] && styles.uploadBtnTextDone]}>
                                                    {uploadedDocs['idProof'] ? 'Uploaded' : 'Upload'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.docCard}>
                                            <View style={styles.docInfo}>
                                                <Text style={styles.docTitle}>Correction Proof</Text>
                                                <Text style={styles.docSub}>Birth Cert/Gazette/Marriage Cert</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.uploadBtn, uploadedDocs['proof'] && styles.uploadBtnDone]}
                                                onPress={() => pickDocument('proof')}
                                            >
                                                <Ionicons
                                                    name={uploadedDocs['proof'] ? "checkmark-circle" : "cloud-upload-outline"}
                                                    size={20}
                                                    color={uploadedDocs['proof'] ? "#4CAF50" : "#2196F3"}
                                                />
                                                <Text style={[styles.uploadBtnText, uploadedDocs['proof'] && styles.uploadBtnTextDone]}>
                                                    {uploadedDocs['proof'] ? 'Uploaded' : 'Upload'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
                                            onPress={handleSubmit}
                                            disabled={isSubmitting}
                                        >
                                            <LinearGradient
                                                colors={['#4CAF50', '#2E7D32']}
                                                style={styles.btnGradient}
                                            >
                                                {isSubmitting ? (
                                                    <ActivityIndicator color="#FFF" size="small" />
                                                ) : (
                                                    <Text style={styles.btnText}>Submit Correction</Text>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: { width: 40 },
    scrollContent: { padding: 20 },

    sectionCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
    sectionSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 24 },

    formSection: { marginBottom: 20 },
    formLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
    formInput: {
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#F9FAFB',
    },
    input: { fontSize: 15, color: '#111827', fontWeight: '500' },

    otpSection: { marginTop: 10, paddingBottom: 10 },
    resendText: {
        fontSize: 13,
        color: '#2196F3',
        fontWeight: '600',
        marginTop: 10,
        textAlign: 'right',
    },

    actionBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
    submitBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 30 },
    btnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    btnDisabled: { opacity: 0.7 },

    selectionSection: { marginBottom: 24 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
    gridItem: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    gridItemActive: { borderColor: '#4CAF50', backgroundColor: '#F0FDF4' },
    gridLabel: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginTop: 10 },
    gridLabelActive: { color: '#15803D' },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },

    formCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    formCardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 20 },

    docsSection: { marginBottom: 30 },
    docCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    docInfo: { flex: 1 },
    docTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
    docSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    uploadBtnDone: { backgroundColor: '#F0FDF4' },
    uploadBtnText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
    uploadBtnTextDone: { color: '#15803D' },
});