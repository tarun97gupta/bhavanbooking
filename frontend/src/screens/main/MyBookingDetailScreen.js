import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import bookingService from '../../services/api/bookings';

dayjs.extend(customParseFormat);

const MyBookingDetailScreen = ({ navigation, route }) => {
    const { bookingId } = route.params;
    const insets = useSafeAreaInsets();
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const result = await bookingService.fetchBookingById(bookingId);
            setBooking(result.booking);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            Alert.alert('Error', error.message || 'Failed to load booking details', [
                { text: 'Go Back', onPress: () => navigation.goBack() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            let date = dayjs(dateString, 'DD-MM-YYYY', true);
            if (!date.isValid()) {
                date = dayjs(dateString);
            }
            return date.format('ddd, MMM D');
        } catch (error) {
            return dateString;
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'confirmed':
            case 'checked_in':
                return {
                    label: 'CONFIRMED',
                    message: 'Your Booking is',
                    color: colors.success,
                    bgColor: colors.successLight,
                };
            case 'checked_out':
                return {
                    label: 'COMPLETED',
                    message: 'Your Booking is',
                    color: colors.primary,
                    bgColor: colors.primaryLight,
                };
            case 'cancelled':
                return {
                    label: 'CANCELLED',
                    message: 'Your Booking is',
                    color: colors.error,
                    bgColor: colors.errorLight,
                };
            case 'pending':
                return {
                    label: 'PENDING PAYMENT',
                    message: 'Your Booking is',
                    color: colors.warning,
                    bgColor: '#FEF3C7',
                };
            default:
                return {
                    label: status?.toUpperCase(),
                    message: 'Your Booking is',
                    color: colors.textSecondary,
                    bgColor: '#F0F0F0',
                };
        }
    };

    const handleCallProperty = () => {
        const phoneNumber = '+911234567890'; // Replace with actual property phone
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleCancelBooking = () => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookingService.cancelBooking(bookingId, 'Cancelled by user');
                            Alert.alert('Success', 'Booking cancelled successfully', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to cancel booking');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading booking details...</Text>
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <Text style={styles.errorText}>Booking not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusConfig = getStatusConfig(booking.status);
    const canCancel = ['confirmed', 'pending'].includes(booking.status);
    const numberOfNights = booking.numberOfDays || 0;

    // Get resources info
    const totalRooms = booking.resources?.filter(r => r.facilityType === 'guest_room')
        .reduce((sum, r) => sum + r.quantity, 0) || 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backIconButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                    <Text style={styles.bookingId}>Booking ID: {booking.bookingReferenceId}</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Badge */}
                <View style={[styles.statusContainer, { backgroundColor: statusConfig.bgColor }]}>
                    <Text style={styles.statusMessage}>{statusConfig.message}</Text>
                    <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                        {statusConfig.label}
                    </Text>
                </View>

                {/* Package Card */}
                <View style={styles.packageCard}>
                    <View style={styles.packageHeader}>
                        <View style={styles.packageInfo}>
                            <Text style={styles.packageName}>
                                {booking.packageId?.name || 'Package'}
                            </Text>
                            <Text style={styles.packageDescription}>
                                {booking.packageId?.shortDescription || booking.packageId?.description || ''}
                            </Text>
                            
                            {totalRooms > 0 && (
                                <View style={styles.roomsInfo}>
                                    <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
                                    <Text style={styles.roomsText}>
                                        {totalRooms} {totalRooms === 1 ? 'room' : 'rooms'} included
                                    </Text>
                                </View>
                            )}
                        </View>

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

                    {/* Location */}
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                        <Text style={styles.locationText}>
                            14-1-378, Darus Salam, Aghapura, Hyderabad, Telangana 500006
                        </Text>
                    </View>
                </View>

                {/* Check-in / Check-out */}
                <View style={styles.datesCard}>
                    <View style={styles.dateColumn}>
                        <Text style={styles.dateLabel}>CHECK-IN</Text>
                        <Text style={styles.dateValue}>{formatDateDisplay(booking.checkInDate)}</Text>
                        <Text style={styles.timeValue}>3:00 PM</Text>
                    </View>

                    <View style={styles.nightsContainer}>
                        <Text style={styles.nightsText}>{numberOfNights} Night{numberOfNights !== 1 ? 's' : ''}</Text>
                    </View>

                    <View style={styles.dateColumn}>
                        <Text style={styles.dateLabel}>CHECK-OUT</Text>
                        <Text style={styles.dateValue}>{formatDateDisplay(booking.checkOutDate)}</Text>
                        <Text style={styles.timeValue}>11:00 AM</Text>
                    </View>
                </View>

                {/* Guest Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Booking details Shared to</Text>
                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{booking.guestDetails?.fullName || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{booking.guestDetails?.email || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{booking.guestDetails?.phoneNumber || 'N/A'}</Text>
                    </View>
                </View>

                {/* Contact Property */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Property</Text>
                    <Text style={styles.contactDescription}>
                        Discuss changes to your booking or enquire about payments and refunds.
                    </Text>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={handleCallProperty}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="call-outline" size={18} color={colors.primary} />
                        <Text style={styles.callButtonText}>Call +91 1234567890</Text>
                    </TouchableOpacity>
                </View>

                {/* Cancellation Policy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                    <Text style={styles.policyText}>
                        {booking.packageId?.bookingRules?.cancellationPolicy || 
                        'Cancellation charges may apply as per property policy. Contact property for details.'}
                    </Text>
                </View>

                {/* Amount Paid */}
                <View style={styles.section}>
                    <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Total Amount Paid</Text>
                        <Text style={styles.amountValue}>
                            ₹{booking.pricing?.finalAmount?.toLocaleString('en-IN') || '0'}
                        </Text>
                    </View>
                    <View style={styles.amountRow}>
                        <Text style={styles.paymentStatusLabel}>Payment Status</Text>
                        <Text style={[styles.paymentStatusValue, 
                            { color: booking.payment?.status === 'paid' ? colors.success : colors.warning }
                        ]}>
                            {booking.payment?.status === 'paid' ? '✓ Paid' : 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* Cancel Button (if applicable) */}
                {canCancel && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelBooking}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: spacing.xl }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 14,
        color: colors.textSecondary,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        marginBottom: spacing.md,
    },
    backButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    backButtonText: {
        color: colors.white,
        fontWeight: '600',
    },

    // Header
    header: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    backIconButton: {
        marginRight: spacing.md,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    bookingId: {
        fontSize: 12,
        color: colors.white,
        opacity: 0.9,
        marginTop: 2,
    },

    // Content
    scrollContent: {
        padding: spacing.lg,
    },

    // Status
    statusContainer: {
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    statusMessage: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 4,
    },
    statusLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    // Package Card
    packageCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    packageHeader: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    packageInfo: {
        flex: 1,
        marginRight: spacing.md,
    },
    packageName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    packageDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
        marginBottom: spacing.sm,
    },
    roomsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    roomsText: {
        fontSize: 13,
        color: colors.textSecondary,
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
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
    },
    locationText: {
        flex: 1,
        fontSize: 13,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
        lineHeight: 18,
    },

    // Dates Card
    datesCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dateColumn: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    timeValue: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    nightsContainer: {
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    nightsText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },

    // Section
    section: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    detailText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: spacing.sm,
    },

    // Contact Property
    contactDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
        marginBottom: spacing.md,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: spacing.sm,
    },
    callButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
    },

    // Policy
    policyText: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 20,
    },

    // Amount
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    amountLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    amountValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    paymentStatusLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    paymentStatusValue: {
        fontSize: 14,
        fontWeight: '600',
    },

    // Cancel Button
    cancelButton: {
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.error,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
    },
});

export default MyBookingDetailScreen;

