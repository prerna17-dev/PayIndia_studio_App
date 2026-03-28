import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import {
    Alert,
    Animated,
    BackHandler,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function SetPinScreen() {
    const router = useRouter();

    const [step, setStep] = useState<"ENTER" | "CONFIRM">("ENTER");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const stepRef = useRef(step);
    useEffect(() => {
        stepRef.current = step;
    }, [step]);

    useFocusEffect(
        React.useCallback(() => {
            // Reset state on focus
            setStep("ENTER");
            setPin("");
            setConfirmPin("");

            const backAction = () => {
                const currentStep = stepRef.current;
                if (currentStep === "CONFIRM") {
                    setStep("ENTER");
                    setConfirmPin("");
                    return true;
                } else {
                    router.push("/security");
                    return true;
                }
            };
            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => backHandler.remove();
        }, [router])
    );

    const shakeAnimation = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    useEffect(() => {
        if (step === "ENTER" && pin.length === 4) {
            setTimeout(() => setStep("CONFIRM"), 300);
        } else if (step === "CONFIRM" && confirmPin.length === 4) {
            handleSetPin();
        }
    }, [pin, confirmPin]);

    const handleSetPin = async () => {
        if (pin !== confirmPin) {
            shakeAnimation();
            setTimeout(() => {
                setConfirmPin("");
            }, 400);
            return;
        }

        try {
            await AsyncStorage.setItem("@user_app_pin", pin);
            Alert.alert("Success! ✅", "Your App PIN has been set.", [
                { text: "OK", onPress: () => router.replace("/security") },
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to save PIN.");
        }
    };

    const handleNumberPress = (num: string) => {
        if (step === "ENTER") {
            if (pin.length < 4) setPin(prev => prev + num);
        } else {
            if (confirmPin.length < 4) setConfirmPin(prev => prev + num);
        }
    };

    const handleBackspace = () => {
        if (step === "ENTER") {
            setPin(prev => prev.slice(0, -1));
        } else {
            setConfirmPin(prev => prev.slice(0, -1));
        }
    };

    const currentInput = step === "ENTER" ? pin : confirmPin;
    const title = step === "ENTER" ? "Set App PIN" : "Confirm PIN";
    const subtitle = step === "ENTER" ? "Create a 4-digit security PIN" : "Re-enter your 4-digit PIN";

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => {
                        if (step === "CONFIRM") {
                            setStep("ENTER");
                            setConfirmPin("");
                        } else {
                            router.push("/security");
                        }
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.placeholder} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={40} color="#0D47A1" />
                        </View>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
                        {[1, 2, 3, 4].map((indicator, index) => {
                            const isFilled = currentInput.length >= index + 1;
                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.dot,
                                        isFilled ? styles.dotFilled : styles.dotEmpty,
                                    ]}
                                />
                            );
                        })}
                    </Animated.View>

                    {step === "CONFIRM" && confirmPin.length === 4 && pin !== confirmPin && (
                        <Text style={styles.errorText}>PINs do not match. Try again.</Text>
                    )}
                </View>

                {/* Numpad */}
                <View style={styles.numpadContainer}>
                    {[
                        ['1', '2', '3'],
                        ['4', '5', '6'],
                        ['7', '8', '9'],
                        ['', '0', 'delete']
                    ].map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.numpadRow}>
                            {row.map((btn, btnIndex) => {
                                if (btn === '') {
                                    return <View key={btnIndex} style={styles.numpadButtonPlaceholder} />;
                                }
                                if (btn === 'delete') {
                                    return (
                                        <TouchableOpacity
                                            key={btnIndex}
                                            style={styles.numpadButton}
                                            onPress={handleBackspace}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="backspace-outline" size={28} color="#1A1A1A" />
                                        </TouchableOpacity>
                                    );
                                }
                                return (
                                    <TouchableOpacity
                                        key={btnIndex}
                                        style={styles.numpadButton}
                                        onPress={() => handleNumberPress(btn)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.numpadNumber}>{btn}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    safeArea: {
        flex: 1,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
        backgroundColor: "#F5F7FA",
        borderRadius: 12,
    },
    placeholder: {
        width: 34,
    },
    content: {
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#E3F2FD",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#64748B",
        marginBottom: 40,
        textAlign: "center",
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        marginBottom: 20,
        height: 30, // reserved height
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    dotEmpty: {
        borderWidth: 1.5,
        borderColor: "#CBD5E1",
        backgroundColor: "transparent",
    },
    dotFilled: {
        backgroundColor: "#0D47A1",
        borderWidth: 0,
        transform: [{ scale: 1.2 }],
    },
    errorText: {
        color: "#EF4444",
        fontSize: 14,
        marginTop: 10,
        fontWeight: "500",
    },
    numpadContainer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
        gap: 15,
    },
    numpadRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    numpadButton: {
        width: 75,
        height: 75,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    numpadButtonPlaceholder: {
        width: 75,
        height: 75,
    },
    numpadNumber: {
        fontSize: 28,
        fontWeight: "600",
        color: "#1E293B",
    },
});
