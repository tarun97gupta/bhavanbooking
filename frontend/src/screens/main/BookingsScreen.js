import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import bookingService from '../../services/api/bookings';

dayjs.extend(customParseFormat);

const BookingsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('all');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);

            let statusFilter = null;
            if (activeTab === 'confirmed') statusFilter = 'confirmed';
            if (activeTab === 'cancelled') statusFilter = 'cancelled';

            const result = await bookingService.fetchMyBookings(statusFilter);
            setBookings(result.bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Alert.alert('Error', error.message || 'Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [activeTab])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings(false);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleViewDetails = (booking) => {
        navigation.navigate('MyBookingDetail', { bookingId: booking._id });
    };

    const handleDownloadInvoice = (booking) => {
        // TODO: Implement invoice download
        Alert.alert('Download Invoice', 'Invoice download feature coming soon!');
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            let date = dayjs(dateString, 'DD-MM-YYYY', true);
            if (!date.isValid()) {
                date = dayjs(dateString);
            }
            return date.format('ddd, MMM D, YYYY');
        } catch (error) {
            return dateString;
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'confirmed':
            case 'checked_in':
                return {
                    label: 'Active',
                    color: colors.success,
                    bgColor: colors.success + '20',
                };
            case 'checked_out':
                return {
                    label: 'Completed',
                    color: colors.primary,
                    bgColor: colors.primary + '20',
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    color: colors.error,
                    bgColor: colors.error + '20',
                };
            case 'pending':
                return {
                    label: 'Pending',
                    color: colors.warning,
                    bgColor: colors.warning + '20',
                };
            default:
                return {
                    label: status,
                    color: colors.textSecondary,
                    bgColor: '#F0F0F0',
                };
        }
    };

    const renderBookingCard = (booking) => {
        const statusConfig = getStatusConfig(booking.status);
        const isCompleted = booking.status === 'checked_out';

        return (
            <View key={booking._id} style={styles.bookingCard}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                    </Text>
                </View>

                <View style={styles.cardContent}>
                    {/* Left: Package Image */}
                    <View style={styles.imageContainer}>
                        {booking.packageId?.images && booking.packageId.images.length > 0 ? (
                            <Image
                                source={{ uri: booking.packageId.images[0] }}
                                style={styles.packageImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.packageImage, styles.placeholderImage]}>
                                <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>

                    {/* Right: Booking Info */}
                    <View style={styles.infoContainer}>
                        {/* Package Name */}
                        <Text style={styles.packageName} numberOfLines={1}>
                            {booking.packageId?.name || 'N/A'}
                        </Text>

                        {/* Dates */}
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.infoText}>
                                {formatDateDisplay(booking.checkInDate)} - {formatDateDisplay(booking.checkOutDate)}
                            </Text>
                        </View>

                        {/* Check-in Time */}
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.infoText}>Check-in at 3:00 pm</Text>
                        </View>

                        {/* Total Amount */}
                        <Text style={styles.totalAmount}>
                            Total amount paid: ₹{booking.pricing?.finalAmount?.toLocaleString('en-IN') || '0'}
                        </Text>

                        {/* Action Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.viewDetailsButton}
                                onPress={() => handleViewDetails(booking)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.viewDetailsText}>View Details</Text>
                            </TouchableOpacity>

                            {isCompleted && (
                                <TouchableOpacity
                                    style={styles.downloadButton}
                                    onPress={() => handleDownloadInvoice(booking)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.downloadText}>Download Invoice</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Bookings</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                    onPress={() => handleTabChange('all')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                        ALL
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'confirmed' && styles.activeTab]}
                    onPress={() => handleTabChange('confirmed')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, activeTab === 'confirmed' && styles.activeTabText]}>
                        Confirmed
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
                    onPress={() => handleTabChange('cancelled')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>
                        Cancelled
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading bookings...</Text>
                </View>
            ) : bookings.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        {activeTab === 'all'
                            ? 'You haven\'t made any bookings yet.'
                            : activeTab === 'confirmed'
                            ? 'No confirmed bookings found.'
                            : 'No cancelled bookings found.'}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                >
                    {bookings.map((booking) => renderBookingCard(booking))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.white,
    },

    // Content
    scrollContent: {
        padding: spacing.lg,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 14,
        color: colors.textSecondary,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // Booking Card
    bookingCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        alignSelf: 'flex-start',
        margin: spacing.sm,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        flexDirection: 'row',
        padding: spacing.md,
        paddingTop: 0,
    },
    imageContainer: {
        marginRight: spacing.md,
    },
    packageImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    placeholderImage: {
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
    },
    packageName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    totalAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    viewDetailsButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.primary,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    downloadButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
    },
    downloadText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.white,
    },
});

export default BookingsScreen;