import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import bookingService from '../../services/api/bookings';
import { generateRazorpayHTML } from '../../utils/razorpay';


const BookingConfirmationScreen = ({ route, navigation }) => {
    const {
        packageData,
        checkInDate,
        checkOutDate,
        numberOfNights,
        pricing,
        userDetails,
        roomQuantity, // ✅ Add roomQuantity param
    } = route.params;

    const insets = useSafeAreaInsets();
    const [processingPayment, setProcessingPayment] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [razorpayHTML, setRazorpayHTML] = useState('');
    const [bookingId, setBookingId] = useState(null);
    const [razorpayOrderId, setRazorpayOrderId] = useState(null);

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';

        try {
            const ddMmYyyyPattern = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
            const ddMmYyyyMatch = dateString.match(ddMmYyyyPattern);

            if (ddMmYyyyMatch) {
                const [, day, month, year] = ddMmYyyyMatch;
                const parsedDate = dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                return parsedDate.format('ddd, MMM D');
            } else if (dateString.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                return dayjs(dateString).format('ddd, MMM D');
            }

            return dayjs(dateString).format('ddd, MMM D');
        } catch (error) {
            return dateString;
        }
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return '';

        // If already in DD-MM-YYYY, return as is
        if (dateString.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
            return dateString;
        }

        // If YYYY-MM-DD, convert to DD-MM-YYYY
        if (dateString.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
            return dayjs(dateString).format('DD-MM-YYYY');
        }

        return dateString;
    };

    const getPackageImage = () => {
        if (packageData?.images && packageData.images.length > 0) {
            return packageData.images[0];
        }
        return `https://placehold.co/400x200/0D34B7/FFFFFF?text=${packageData?.name?.split(' ').slice(0, 2).join('+')}`;
    };

    const getRoomsCount = () => {
        if (!packageData?.includes?.resources) return 0;
        return packageData.includes.resources
            .filter((r) => r.resource.facilityType === 'guest_room')
            .reduce((sum, r) => sum + r.quantity, 0);
    };

    const getBasePrice = () => {
        return pricing?.basePrice || packageData?.pricing?.basePrice || 9000;
    };

    const getGSTAmount = () => {
        const base = getBasePrice() * (numberOfNights || 1);
        const gstPercentage = pricing?.gstPercentage || packageData?.pricing?.gstPercentage || 18;
        return Math.round((base * gstPercentage) / 100);
    };

    const getConvenienceFee = () => {
        return 0;
    };

    const getTotalAmount = () => {
        return pricing?.finalAmount || getBasePrice() * (numberOfNights || 1) + getGSTAmount() + getConvenienceFee();
    };

    const handleMakePayment = async () => {
        try {
            setProcessingPayment(true);

            // ♻️ RETRY: If we already have a booking, reuse it
            if (bookingId && razorpayOrderId) {
                console.log('♻️ Reusing existing booking:', bookingId);

                // Get stored order details from backend or reconstruct
                const razorpayConfig = {
                    orderId: razorpayOrderId,
                    amount: getTotalAmount() * 100, // Convert to paise
                    currency: 'INR',
                    key: process.env.EXPO_PUBLIC_RAZORPAY_KEY || 'rzp_test_XXXX', // Use key from first attempt
                    prefill: {
                        name: userDetails.fullName,
                        email: userDetails.email,
                        contact: `+91${userDetails.phoneNumber}`,
                    },
                    notes: {
                        bookingId: bookingId,
                        packageName: packageData.name,
                    },
                };

                const html = generateRazorpayHTML(razorpayConfig);
                setRazorpayHTML(html);
                setShowPaymentModal(true);
                setProcessingPayment(false);
                return;
            }

            // 📝 FIRST ATTEMPT: Create new booking
            console.log('📝 Creating NEW booking order...');

            const bookingData = {
                packageId: packageData._id,
                checkInDate: formatDateForAPI(checkInDate),
                checkOutDate: formatDateForAPI(checkOutDate),
                numberOfGuests: 1,
                guestDetails: {
                    fullName: userDetails.fullName,
                    phoneNumber: `+91${userDetails.phoneNumber}`,
                    email: userDetails.email,
                },
                specialRequests: '',
            };

            // ✅ Add roomQuantity for rooms_only packages
            if (packageData.category === 'rooms_only' && roomQuantity) {
                bookingData.roomQuantity = roomQuantity;
                console.log('🛏️ Room quantity:', roomQuantity);
            }

            const orderResult = await bookingService.createBookingOrder(bookingData);

            console.log('✅ Order created:', orderResult);

            // Store IDs for potential retry
            setBookingId(orderResult.booking.bookingId);
            setRazorpayOrderId(orderResult.razorpay.orderId);

            // Generate Razorpay HTML and open payment modal
            const razorpayConfig = {
                orderId: orderResult.razorpay.orderId,
                amount: orderResult.razorpay.amount,
                currency: orderResult.razorpay.currency,
                key: orderResult.razorpay.key,
                prefill: {
                    name: userDetails.fullName,
                    email: userDetails.email,
                    contact: `+91${userDetails.phoneNumber}`,
                },
                notes: {
                    bookingId: orderResult.booking.bookingId,
                    packageName: packageData.name,
                },
            };

            const html = generateRazorpayHTML(razorpayConfig);
            setRazorpayHTML(html);
            setShowPaymentModal(true);
            setProcessingPayment(false);

        } catch (error) {
            console.error('❌ Error creating order:', error);
            setProcessingPayment(false);

            let errorMessage = error.message || 'Failed to create booking order. Please try again.';

            if (errorMessage.includes('no longer available')) {
                errorMessage = 'This package is no longer available for the selected dates. Please select different dates.';
            }

            Alert.alert(
                'Order Creation Failed',
                errorMessage,
                [{ text: 'OK' }]
            );
        }
    };


    const handlePaymentResponse = async (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('💳 Payment response:', data);

            if (data.type === 'success') {
                // ✅ PAYMENT SUCCESS - Verify with backend
                setShowPaymentModal(false);
                setProcessingPayment(true);

                console.log('✅ Payment successful, verifying with backend...');

                const verifyResult = await bookingService.verifyPayment(
                    bookingId,
                    data.razorpay_order_id,
                    data.razorpay_payment_id,
                    data.razorpay_signature
                );

                console.log('✅ Payment verified:', verifyResult);
                setProcessingPayment(false);

                // Navigate to success screen
                navigation.replace('BookingSuccess', {
                    booking: verifyResult.booking,
                    packageData: packageData,
                });

            } else if (data.type === 'error') {
                // ❌ PAYMENT FAILED
                setShowPaymentModal(false);
                setProcessingPayment(false);

                let errorMessage = data.error?.description || 'Payment could not be completed.';
                let errorTitle = 'Payment Failed';

                if (data.error?.code === 'BAD_REQUEST_ERROR' &&
                    data.error?.reason === 'international_transaction_not_allowed') {
                    errorTitle = 'Card Not Supported';
                    errorMessage = 'International cards not enabled. Use Indian test card:\n\n5267 3181 8797 5449\nCVV: 123\nExpiry: 12/25';
                }

                Alert.alert(
                    errorTitle,
                    errorMessage,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Try Again', onPress: () => handleMakePayment() }
                    ]
                );
            } else if (data.type === 'dismissed') {
                // ❌ USER CANCELLED
                setShowPaymentModal(false);
                setProcessingPayment(false);

                Alert.alert(
                    'Payment Cancelled',
                    'You cancelled the payment. Would you like to try again?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Try Again', onPress: () => handleMakePayment() },
                    ]
                );
            }
        } catch (error) {
            console.error('❌ Error handling payment response:', error);
            setShowPaymentModal(false);
            setProcessingPayment(false);

            Alert.alert(
                'Payment Verification Failed',
                'There was an error verifying your payment. Please contact support.',
                [{ text: 'OK' }]
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Confirm Booking</Text>
                    <Text style={styles.headerSubtitle}>Review details before payment</Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Package Card */}
                <View style={styles.packageCard}>
                    <Image source={{ uri: getPackageImage() }} style={styles.packageImage} />
                    <View style={styles.packageInfo}>
                        <Text style={styles.packageName}>
                            {packageData.name.replace(' Booking', '').replace(' Package', '')}
                        </Text>

                        <View style={styles.bookingInfoRow}>
                            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                            <Text style={styles.bookingInfoText}>
                                {formatDateDisplay(checkInDate)} - {formatDateDisplay(checkOutDate)}
                            </Text>
                        </View>

                        {numberOfNights > 0 && (
                            <View style={styles.bookingInfoRow}>
                                <Ionicons name="moon-outline" size={16} color={colors.primary} />
                                <Text style={styles.bookingInfoText}>
                                    {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}
                                </Text>
                            </View>
                        )}

                        {getRoomsCount() > 0 && (
                            <View style={styles.bookingInfoRow}>
                                <Ionicons name="bed-outline" size={16} color={colors.primary} />
                                <Text style={styles.bookingInfoText}>{getRoomsCount()} rooms included</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Guest Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Guest Details</Text>

                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{userDetails.fullName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                        <Text style={styles.detailText}>+91 {userDetails.phoneNumber}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{userDetails.email}</Text>
                    </View>
                </View>

                {/* Property Rules */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Rules</Text>

                    <View style={styles.ruleItem}>
                        <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                        <Text style={styles.ruleText}>Alcohol consumption NOT allowed</Text>
                    </View>

                    <View style={styles.ruleItem}>
                        <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                        <Text style={styles.ruleText}>Smoking NOT allowed</Text>
                    </View>

                    <View style={styles.ruleItem}>
                        <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                        <Text style={styles.ruleText}>Pets not allowed</Text>
                    </View>
                </View>

                {/* Cancellation Policy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cancellation Policy</Text>

                    <View style={styles.policyItem}>
                        <Ionicons name="checkmark-outline" size={18} color={colors.success} />
                        <Text style={styles.policyText}>
                            <Text style={styles.policyBold}>Free cancellation</Text> up to{' '}
                            <Text style={styles.policyBold}>7 days</Text> before the event date.
                        </Text>
                    </View>

                    <View style={styles.policyItem}>
                        <Ionicons name="checkmark-outline" size={18} color={colors.success} />
                        <Text style={styles.policyText}>
                            <Text style={styles.policyBold}>50% refund</Text> if cancelled{' '}
                            <Text style={styles.policyBold}>3-6 days</Text> before the event.
                        </Text>
                    </View>

                    <View style={styles.policyItem}>
                        <Ionicons name="close-outline" size={18} color={colors.error} />
                        <Text style={styles.policyText}>
                            <Text style={styles.policyBold}>No refund</Text> if cancelled within{' '}
                            <Text style={styles.policyBold}>48 hours</Text> of the event.
                        </Text>
                    </View>

                    <View style={styles.policyItem}>
                        <Ionicons name="checkmark-outline" size={18} color={colors.success} />
                        <Text style={styles.policyText}>
                            Refunds (If applicable) will be processed within{' '}
                            <Text style={styles.policyBold}>5-7 working days</Text>.
                        </Text>
                    </View>

                    <View style={styles.policyItem}>
                        <Ionicons name="checkmark-outline" size={18} color={colors.success} />
                        <Text style={styles.policyText}>
                            Date changes are <Text style={styles.policyBold}>allowed once</Text>, subject to
                            availability.
                        </Text>
                    </View>
                </View>

                {/* Price Breakup */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Price Breakup</Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>
                            {numberOfNights || 1} X {packageData.name.replace(' Booking', '').replace(' Package', '')}
                        </Text>
                        <Text style={styles.priceValue}>
                            ₹{(getBasePrice() * (numberOfNights || 1)).toLocaleString('en-IN')}
                        </Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Hotel taxes</Text>
                        <Text style={styles.priceValue}>₹{getGSTAmount().toLocaleString('en-IN')}</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Convenience fee</Text>
                        <Text style={styles.priceValue}>₹{getConvenienceFee()}</Text>
                    </View>

                    <View style={styles.priceDivider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total amount payable</Text>
                        <Text style={styles.totalValue}>₹{getTotalAmount().toLocaleString('en-IN')}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Payment Button */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
                <TouchableOpacity
                    style={[styles.paymentButton, processingPayment && styles.paymentButtonDisabled]}
                    onPress={handleMakePayment}
                    disabled={processingPayment}
                    activeOpacity={0.8}
                >
                    {processingPayment ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Text style={styles.paymentButtonText}>Make Payment</Text>
                            <Text style={styles.paymentButtonAmount}>₹{getTotalAmount().toLocaleString('en-IN')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            {/* Razorpay Payment Modal */}
            <Modal
                visible={showPaymentModal}
                animationType="slide"
                onRequestClose={() => {
                    setShowPaymentModal(false);
                    Alert.alert('Payment Cancelled', 'You cancelled the payment.');
                }}
            >
                <View style={styles.modalContainer}>
                    <WebView
                        source={{ html: razorpayHTML }}
                        onMessage={handlePaymentResponse}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        scalesPageToFit={true}
                        style={styles.webview}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    // Header
    header: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.white,
        opacity: 0.9,
        marginTop: 2,
    },
    headerSpacer: {
        width: 40,
    },

    // Scroll View
    scrollView: {
        flex: 1,
    },

    // Package Card
    packageCard: {
        backgroundColor: colors.white,
        flexDirection: 'row',
        padding: spacing.md,
        margin: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    packageImage: {
        width: 100,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#E8E8E8',
    },
    packageInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    packageName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    bookingInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    bookingInfoText: {
        fontSize: 13,
        color: colors.text,
        marginLeft: spacing.xs,
        fontWeight: '500',
    },

    // Sections
    section: {
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.lg,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },

    // Guest Details
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingVertical: spacing.xs,
    },
    detailText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: spacing.sm,
        flex: 1,
    },

    // Rules
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingVertical: spacing.xs,
    },
    ruleText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: spacing.sm,
        flex: 1,
    },

    // Policy
    policyItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
        paddingVertical: spacing.xs,
    },
    policyText: {
        fontSize: 13,
        color: colors.text,
        marginLeft: spacing.sm,
        flex: 1,
        lineHeight: 19,
    },
    policyBold: {
        fontWeight: '600',
        color: colors.text,
    },

    // Price
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    priceLabel: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    priceValue: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    priceDivider: {
        height: 1,
        backgroundColor: '#E8E8E8',
        marginVertical: spacing.sm,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 15,
        color: colors.text,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 16,
        color: colors.text,
        fontWeight: 'bold',
    },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    paymentButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md + 2,
        paddingHorizontal: spacing.lg,
        borderRadius: spacing.radiusMd,
    },
    paymentButtonDisabled: {
        opacity: 0.6,
    },
    paymentButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    paymentButtonAmount: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Payment Modal
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    webview: {
        flex: 1,
    },
});

export default BookingConfirmationScreen;