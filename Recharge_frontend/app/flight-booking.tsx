import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    BackHandler,
    Modal,
    ActivityIndicator,
    Alert,
} from "react-native";

type TripType = "oneway" | "roundtrip";

interface City {
    code: string;
    name: string;
    airport: string;
}

const CITIES: City[] = [
    { code: "DEL", name: "Delhi", airport: "Indira Gandhi International" },
    { code: "BOM", name: "Mumbai", airport: "Chhatrapati Shivaji Maharaj" },
    { code: "BLR", name: "Bangalore", airport: "Kempegowda International" },
    { code: "MAA", name: "Chennai", airport: "Chennai International" },
    { code: "HYD", name: "Hyderabad", airport: "Rajiv Gandhi International" },
    { code: "CCU", name: "Kolkata", airport: "Netaji Subhas Chandra Bose" },
    { code: "AMD", name: "Ahmedabad", airport: "Sardar Vallabhbhai Patel" },
    { code: "PNQ", name: "Pune", airport: "Pune International" },
    { code: "GOI", name: "Goa", airport: "Dabolim Airport" },
    { code: "JAI", name: "Jaipur", airport: "Jaipur International" },
];

const CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First Class"];

export default function FlightBookingScreen() {
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                router.back();
                return true;
            };
            const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => backHandler.remove();
        }, [router])
    );

    const [tripType, setTripType] = useState<TripType>("oneway");
    const [fromCity, setFromCity] = useState<City | null>(null);
    const [toCity, setToCity] = useState<City | null>(null);
    const [departureDate, setDepartureDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
    const [cabinClass, setCabinClass] = useState("Economy");
    const [showCityModal, setShowCityModal] = useState(false);
    const [citySelectionFor, setCitySelectionFor] = useState<"from" | "to">("from");
    const [showPassengerModal, setShowPassengerModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [errors, setErrors] = useState({ from: "", to: "", date: "" });

    const handleSwapCities = () => {
        const temp = fromCity;
        setFromCity(toCity);
        setToCity(temp);
    };

    const handleCitySelect = (city: City) => {
        if (citySelectionFor === "from") {
            setFromCity(city);
            setErrors({ ...errors, from: "" });
        } else {
            setToCity(city);
            setErrors({ ...errors, to: "" });
        }
        setShowCityModal(false);
    };

    const handleDateSelect = (type: "departure" | "return") => {
        const date = new Date();
        if (type === "departure") {
            date.setDate(date.getDate() + 1);
        } else {
            date.setDate(date.getDate() + 5);
        }

        const dateStr = `${date.getDate()} ${date.toLocaleDateString('en', { month: 'short' })} ${date.getFullYear()}`;

        if (type === "departure") {
            setDepartureDate(dateStr);
            setErrors(prev => ({ ...prev, date: "" }));
        } else {
            setReturnDate(dateStr);
            setErrors(prev => ({ ...prev, date: "" }));
        }
    };

    const getTotalPassengers = () => passengers.adults + passengers.children + passengers.infants;

    const getPassengerText = () => {
        const total = getTotalPassengers();
        const parts = [];
        if (passengers.adults > 0) parts.push(`${passengers.adults} Adult${passengers.adults > 1 ? 's' : ''}`);
        if (passengers.children > 0) parts.push(`${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`);
        if (passengers.infants > 0) parts.push(`${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`);
        return parts.join(', ');
    };

    const handleSearch = () => {
        let hasError = false;
        const newErrors = { from: "", to: "", date: "" };

        if (!fromCity) {
            newErrors.from = "Select departure city";
            hasError = true;
        }
        if (!toCity) {
            newErrors.to = "Select arrival city";
            hasError = true;
        }
        if (!departureDate) {
            newErrors.date = "Select departure date";
            hasError = true;
        } else if (tripType === "roundtrip" && !returnDate) {
            newErrors.date = "Select return date";
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            Alert.alert("Redirecting", "Redirecting to secure travel partner...", [{ text: "OK" }]);
        }, 2000);
    };

    return (
        <View style={s.root}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <LinearGradient colors={['#1E88E5', '#1565C0']} style={s.headerGradient}>
                <SafeAreaView>
                    <View style={s.header}>
                        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={s.headerCenter}>
                            <Text style={s.headerTitle}>Flight Booking</Text>
                            <Text style={s.headerSub}>Domestic & International</Text>
                        </View>
                        <View style={s.headerRight} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
                <View style={s.tripTypeCard}>
                    <TouchableOpacity
                        style={[s.tripBtn, tripType === "oneway" && s.tripBtnActive]}
                        onPress={() => setTripType("oneway")}
                    >
                        <Text style={[s.tripText, tripType === "oneway" && s.tripTextActive]}>One Way</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.tripBtn, tripType === "roundtrip" && s.tripBtnActive]}
                        onPress={() => setTripType("roundtrip")}
                    >
                        <Text style={[s.tripText, tripType === "roundtrip" && s.tripTextActive]}>Round Trip</Text>
                    </TouchableOpacity>
                </View>

                <View style={s.card}>
                    <TouchableOpacity
                        style={s.row}
                        onPress={() => {
                            setCitySelectionFor("from");
                            setShowCityModal(true);
                        }}
                    >
                        <View style={s.iconCircle}>
                            <Ionicons name="airplane" size={20} color="#1E88E5" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>From</Text>
                            {fromCity ? (
                                <>
                                    <Text style={s.value}>{fromCity.name}</Text>
                                    <Text style={s.subValue}>{fromCity.code} • {fromCity.airport}</Text>
                                </>
                            ) : (
                                <Text style={s.placeholder}>Select departure city</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.from ? <Text style={s.error}>{errors.from}</Text> : null}

                    <TouchableOpacity style={s.swapBtn} onPress={handleSwapCities}>
                        <MaterialCommunityIcons name="swap-vertical" size={24} color="#1E88E5" />
                    </TouchableOpacity>

                    <View style={s.divider} />

                    <TouchableOpacity
                        style={s.row}
                        onPress={() => {
                            setCitySelectionFor("to");
                            setShowCityModal(true);
                        }}
                    >
                        <View style={s.iconCircle}>
                            <Ionicons name="location" size={20} color="#1E88E5" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>To</Text>
                            {toCity ? (
                                <>
                                    <Text style={s.value}>{toCity.name}</Text>
                                    <Text style={s.subValue}>{toCity.code} • {toCity.airport}</Text>
                                </>
                            ) : (
                                <Text style={s.placeholder}>Select arrival city</Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    {errors.to ? <Text style={s.error}>{errors.to}</Text> : null}
                </View>

                <View style={s.card}>
                    <TouchableOpacity style={s.row} onPress={() => handleDateSelect("departure")}>
                        <View style={s.iconCircle}>
                            <Ionicons name="calendar-outline" size={20} color="#1E88E5" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>Departure</Text>
                            <Text style={[s.value, !departureDate && s.placeholder]}>
                                {departureDate || "Select date"}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {tripType === "roundtrip" && (
                        <>
                            <View style={s.divider} />
                            <TouchableOpacity style={s.row} onPress={() => handleDateSelect("return")}>
                                <View style={s.iconCircle}>
                                    <Ionicons name="calendar-outline" size={20} color="#1E88E5" />
                                </View>
                                <View style={s.textContainer}>
                                    <Text style={s.label}>Return</Text>
                                    <Text style={[s.value, !returnDate && s.placeholder]}>
                                        {returnDate || "Select date"}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </>
                    )}
                    {errors.date ? <Text style={s.error}>{errors.date}</Text> : null}
                </View>

                <View style={s.card}>
                    <TouchableOpacity style={s.row} onPress={() => setShowPassengerModal(true)}>
                        <View style={s.iconCircle}>
                            <Ionicons name="people-outline" size={20} color="#1E88E5" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>Passengers</Text>
                            <Text style={s.value}>{getPassengerText()}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={s.divider} />

                    <TouchableOpacity style={s.row} onPress={() => setShowClassModal(true)}>
                        <View style={s.iconCircle}>
                            <MaterialCommunityIcons name="seat-passenger" size={20} color="#1E88E5" />
                        </View>
                        <View style={s.textContainer}>
                            <Text style={s.label}>Class</Text>
                            <Text style={s.value}>{cabinClass}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={s.searchBtn} onPress={handleSearch} disabled={isSearching}>
                    <LinearGradient colors={['#1E88E5', '#1565C0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.searchGrad}>
                        {isSearching ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="search" size={20} color="#FFF" />
                                <Text style={s.searchText}>Search Flights</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={s.infoBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#1565C0" />
                    <Text style={s.infoText}>Redirects to secure travel partner</Text>
                </View>
            </ScrollView>

            <Modal visible={showCityModal} transparent animationType="slide" onRequestClose={() => setShowCityModal(false)}>
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Select {citySelectionFor === "from" ? "Departure" : "Arrival"} City</Text>
                            <TouchableOpacity onPress={() => setShowCityModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {CITIES.map((city) => (
                                <TouchableOpacity key={city.code} style={s.modalItem} onPress={() => handleCitySelect(city)}>
                                    <View style={s.cityCode}>
                                        <Text style={s.cityCodeText}>{city.code}</Text>
                                    </View>
                                    <View style={s.cityInfo}>
                                        <Text style={s.cityName}>{city.name}</Text>
                                        <Text style={s.cityAirport}>{city.airport}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showPassengerModal} transparent animationType="slide" onRequestClose={() => setShowPassengerModal(false)}>
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Passengers</Text>
                            <TouchableOpacity onPress={() => setShowPassengerModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <View style={s.passengerList}>
                            {[
                                { key: 'adults' as const, label: 'Adults', sub: '12+ years', min: 1 },
                                { key: 'children' as const, label: 'Children', sub: '2-12 years', min: 0 },
                                { key: 'infants' as const, label: 'Infants', sub: 'Under 2', min: 0 },
                            ].map((p) => (
                                <View key={p.key} style={s.passengerRow}>
                                    <View>
                                        <Text style={s.passengerLabel}>{p.label}</Text>
                                        <Text style={s.passengerSub}>{p.sub}</Text>
                                    </View>
                                    <View style={s.counter}>
                                        <TouchableOpacity
                                            style={s.counterBtn}
                                            onPress={() => setPassengers({ ...passengers, [p.key]: Math.max(p.min, passengers[p.key] - 1) })}
                                        >
                                            <Ionicons name="remove" size={20} color="#1E88E5" />
                                        </TouchableOpacity>
                                        <Text style={s.counterValue}>{passengers[p.key]}</Text>
                                        <TouchableOpacity
                                            style={s.counterBtn}
                                            onPress={() => setPassengers({ ...passengers, [p.key]: Math.min(9, passengers[p.key] + 1) })}
                                        >
                                            <Ionicons name="add" size={20} color="#1E88E5" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={s.doneBtn} onPress={() => setShowPassengerModal(false)}>
                            <Text style={s.doneBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showClassModal} transparent animationType="slide" onRequestClose={() => setShowClassModal(false)}>
                <View style={s.modalBack}>
                    <View style={s.modal}>
                        <View style={s.modalHandle} />
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Cabin Class</Text>
                            <TouchableOpacity onPress={() => setShowClassModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        {CABIN_CLASSES.map((cls) => (
                            <TouchableOpacity
                                key={cls}
                                style={s.modalItem}
                                onPress={() => {
                                    setCabinClass(cls);
                                    setShowClassModal(false);
                                }}
                            >
                                <Text style={s.modalItemText}>{cls}</Text>
                                {cabinClass === cls && <Ionicons name="checkmark-circle" size={24} color="#1E88E5" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F7FA' },
    headerGradient: { paddingTop: 0 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
    headerRight: { width: 40 },
    scroll: { padding: 16 },
    tripTypeCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 4, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    tripBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    tripBtnActive: { backgroundColor: '#1E88E5' },
    tripText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    tripTextActive: { color: '#FFF' },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, position: 'relative' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF5FB', alignItems: 'center', justifyContent: 'center' },
    textContainer: { flex: 1 },
    label: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
    value: { fontSize: 16, fontWeight: '600', color: '#111827' },
    subValue: { fontSize: 12, color: '#6B7280', marginTop: 2 },
    placeholder: { fontSize: 15, color: '#9CA3AF' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
    swapBtn: { position: 'absolute', right: 16, top: 62, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#EBF5FB', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    error: { fontSize: 12, color: '#EF4444', marginTop: 8 },
    searchBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 12, shadowColor: '#1E88E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    searchGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    searchText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EBF5FB', borderRadius: 12, padding: 12 },
    infoText: { fontSize: 12, color: '#1565C0', flex: 1 },
    modalBack: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingBottom: 20 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalItemText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#111827' },
    cityCode: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EBF5FB', alignItems: 'center', justifyContent: 'center' },
    cityCodeText: { fontSize: 14, fontWeight: '700', color: '#1E88E5' },
    cityInfo: { flex: 1, marginLeft: 12 },
    cityName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
    cityAirport: { fontSize: 12, color: '#6B7280' },
    passengerList: { paddingHorizontal: 20, marginBottom: 16 },
    passengerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    passengerLabel: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
    passengerSub: { fontSize: 12, color: '#6B7280' },
    counter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    counterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EBF5FB', alignItems: 'center', justifyContent: 'center' },
    counterValue: { fontSize: 18, fontWeight: '700', color: '#111827', minWidth: 28, textAlign: 'center' },
    doneBtn: { backgroundColor: '#1E88E5', marginHorizontal: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    doneBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});