import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useCallback } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return;
            await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotifIcon = (type: string) => {
        switch (type) {
            case 'alert': return 'alert-circle';
            case 'success': return 'checkmark-circle';
            case 'recharge': return 'phone-portrait';
            case 'wallet': return 'wallet';
            case 'kyc': return 'card';
            default: return 'information-circle';
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
            onPress={() => !item.is_read && handleMarkAsRead(item.id)}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name={getNotifIcon(item.type) as any}
                    size={26}
                    color={item.is_read ? "#9E9E9E" : "#0D47A1"}
                />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.created_at).toLocaleString('en-IN')}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="dark" />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <LinearGradient
                    colors={["#E1F5FE", "#B3E5FC", "#81D4FA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#0D47A1" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.actionButton}>
                        <Ionicons name="checkmark-done-outline" size={24} color="#0D47A1" />
                    </TouchableOpacity>
                </LinearGradient>

                {/* Content */}
                {loading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#0D47A1" />
                    </View>
                ) : notifications.length === 0 ? (
                    <View style={styles.content}>
                        <View style={styles.emptyStateContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="notifications-off-outline" size={64} color="#2196F3" />
                            </View>
                            <Text style={styles.emptyTitle}>No notifications yet</Text>
                            <Text style={styles.emptySubtitle}>
                                We'll let you know when something important happens.
                            </Text>

                            <TouchableOpacity style={styles.refreshButton} onPress={fetchNotifications}>
                                <Text style={styles.refreshButtonText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderNotification}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0D47A1']} />
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 55,
        paddingBottom: 18,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 8,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0D47A1',
    },
    actionButton: {
        padding: 5,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    listContainer: {
        padding: 16,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'flex-start',
    },
    unreadCard: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
    },
    iconContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    unreadText: {
        color: '#0D47A1',
        fontWeight: '700',
    },
    message: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
        lineHeight: 20,
    },
    time: {
        fontSize: 12,
        color: '#999999',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0D47A1',
        marginLeft: 8,
        marginTop: 6,
    },
    emptyStateContainer: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F1F8FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    refreshButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
        backgroundColor: '#E3F2FD',
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2196F3',
    },
});
