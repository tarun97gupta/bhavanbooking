import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import dayjs from 'dayjs';
import colors from '../styles/colors';
import spacing from '../styles/spacing';
import enquiryService from '../services/api/enquiries';

const EnquiryFormScreen = ({ route, navigation }) => {
  const { packageId, packageName } = route.params;
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [visitingFrom, setVisitingFrom] = useState('');
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDayPress = (day) => {
    const selectedDate = day.dateString;

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // First selection or reset
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
      setMarkedDates({
        [selectedDate]: {
          startingDay: true,
          color: colors.primary,
          textColor: colors.white,
        },
      });
    } else if (checkInDate && !checkOutDate) {
      // Second selection
      if (dayjs(selectedDate).isBefore(dayjs(checkInDate))) {
        // Reset if selected date is before check-in
        setCheckInDate(selectedDate);
        setCheckOutDate(null);
        setMarkedDates({
          [selectedDate]: {
            startingDay: true,
            color: colors.primary,
            textColor: colors.white,
          },
        });
      } else {
        // Valid check-out date
        setCheckOutDate(selectedDate);
        const range = getDateRange(checkInDate, selectedDate);
        setMarkedDates(range);
      }
    }
  };

  const getDateRange = (start, end) => {
    const range = {};
    let currentDate = dayjs(start);
    const endDate = dayjs(end);

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
      const dateString = currentDate.format('YYYY-MM-DD');

      if (dateString === dayjs(start).format('YYYY-MM-DD')) {
        range[dateString] = {
          startingDay: true,
          color: colors.primary,
          textColor: colors.white,
        };
      } else if (dateString === dayjs(end).format('YYYY-MM-DD')) {
        range[dateString] = {
          endingDay: true,
          color: colors.primary,
          textColor: colors.white,
        };
      } else {
        range[dateString] = {
          color: colors.primaryLight || '#E8EEFB',
          textColor: colors.text,
        };
      }

      currentDate = currentDate.add(1, 'day');
    }

    return range;
  };

  const formatDateDisplay = (dateString) => {
    return dayjs(dateString).format('DD MMM YYYY');
  };

  const handleSubmitEnquiry = async () => {
    // Validation
    if (!name || name.trim().length < 3) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return;
    }

    if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      Alert.alert('Validation Error', 'Please select check-in and check-out dates');
      return;
    }

    // Optional email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    // Calculate number of nights
    const numberOfNights = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day');

    // Prepare enquiry data
    const enquiryData = {
      packageId,
      packageName,
      fullName: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email ? email.trim() : null,
      visitingFrom: visitingFrom ? visitingFrom.trim() : null,
      checkInDate: dayjs(checkInDate).format('DD-MM-YYYY'),
      checkOutDate: dayjs(checkOutDate).format('DD-MM-YYYY'),
      numberOfNights,
    };

    // Submit enquiry to backend
    setIsSubmitting(true);
    try {
      const result = await enquiryService.submitEnquiry(enquiryData);
      
      console.log('✅ Enquiry submitted:', result);

      // Navigate to success screen with submitted data
      navigation.navigate('EnquirySuccess', {
        enquiryData: {
          packageName,
          name,
          phoneNumber,
          email,
          visitingFrom,
          checkInDate: formatDateDisplay(checkInDate),
          checkOutDate: formatDateDisplay(checkOutDate),
          numberOfNights,
        },
        enquiryId: result.enquiry._id,
      });
    } catch (error) {
      console.error('❌ Error submitting enquiry:', error);
      Alert.alert(
        'Submission Failed',
        error.message || 'Failed to submit enquiry. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enquiry Form</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {/* Package Info */}
        <View style={styles.packageInfoCard}>
          <Text style={styles.packageLabel}>Enquiring for</Text>
          <Text style={styles.packageNameText}>
            {packageName.replace(' Booking', '').replace(' Package', '')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Date Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Select Dates <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(!showDatePicker)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateButtonText}>
                {checkInDate && checkOutDate
                  ? `${formatDateDisplay(checkInDate)} - ${formatDateDisplay(
                      checkOutDate
                    )}`
                  : 'Tap to select dates'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showDatePicker && (
              <View style={styles.calendarContainer}>
                <Calendar
                  minDate={dayjs().format('YYYY-MM-DD')}
                  onDayPress={handleDayPress}
                  markingType={'period'}
                  markedDates={markedDates}
                  theme={{
                    selectedDayBackgroundColor: colors.primary,
                    todayTextColor: colors.primary,
                    arrowColor: colors.primary,
                  }}
                />
                {checkInDate && checkOutDate && (
                  <Text style={styles.nightsInfo}>
                    {dayjs(checkOutDate).diff(dayjs(checkInDate), 'day')} night(s)
                    selected
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Full Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Email (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.optional}>(Optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Visiting From (Optional) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Visiting From <Text style={styles.optional}>(Optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your city or location"
              value={visitingFrom}
              onChangeText={setVisitingFrom}
              autoCapitalize="words"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitEnquiry}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color={colors.black} />
                <Text style={[styles.submitButtonText, { marginLeft: spacing.sm }]}>
                  Submitting...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Enquiry</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.black}
                  style={{ marginLeft: spacing.sm }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  packageInfoCard: {
    backgroundColor: colors.white,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: spacing.radiusMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  packageNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  optional: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  calendarContainer: {
    marginTop: spacing.md,
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
  },
  nightsInfo: {
    textAlign: 'center',
    padding: spacing.sm,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: colors.primaryLight,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md + 4,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnquiryFormScreen;

