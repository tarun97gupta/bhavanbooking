import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
    Linking,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import authService from '../../services/api/auth';
import { getUser, saveUser } from '../../utils/storage';

const ProfileScreen = ({ onLogout }) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Editable fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
        }, [])
    );

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userData = await getUser();
            if (userData) {
                setUser(userData);
                setFullName(userData.fullName || '');
                setEmail(userData.email || '');
                setPhoneNumber(userData.phoneNumber || '');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert('Permission Required', 'Please allow access to your photos to change profile picture');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                setProfileImage(result.assets[0].uri);
                // TODO: Upload to server
                Alert.alert('Success', 'Profile picture updated!');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSaveProfile = async () => {
        try {
            // Validation
            if (!fullName || fullName.trim().length < 3) {
                Alert.alert('Validation Error', 'Full name must be at least 3 characters');
                return;
            }

            if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)) {
                Alert.alert('Validation Error', 'Phone number must be exactly 10 digits');
                return;
            }

            setSaving(true);
            
            const result = await authService.updateProfile({
                fullName: fullName.trim(),
                email: email.trim() || null,
                phoneNumber: phoneNumber.trim(),
            });

            // Update local storage
            await saveUser(result.user);
            setUser(result.user);
            setIsEditing(false);
            
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset to original values
        setFullName(user?.fullName || '');
        setEmail(user?.email || '');
        setPhoneNumber(user?.phoneNumber || '');
        setIsEditing(false);
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: onLogout
                }
            ]
        );
    };

    const openUrl = (url) => {
        Linking.openURL(url).catch(err => {
            console.error('Failed to open URL:', err);
            Alert.alert('Error', 'Unable to open link');
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Picture Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity
                        style={styles.profileImageContainer}
                        onPress={handlePickImage}
                        activeOpacity={0.7}
                    >
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Ionicons name="person" size={48} color={colors.white} />
                            </View>
                        )}
                        <View style={styles.cameraIconContainer}>
                            <Ionicons name="camera" size={18} color={colors.white} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{user?.fullName || 'User'}</Text>
                    <Text style={styles.profilePhone}>{user?.phoneNumber || ''}</Text>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        {!isEditing ? (
                            <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                                <Ionicons name="pencil" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={fullName}
                            onChangeText={setFullName}
                            editable={isEditing}
                            placeholder="Enter your full name"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={email}
                            onChangeText={setEmail}
                            editable={isEditing}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.inputDisabled]}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            editable={isEditing}
                            placeholder="Enter 10 digit phone number"
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>

                    {isEditing && (
                        <View style={styles.editButtonRow}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancelEdit}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSaveProfile}
                                disabled={saving}
                                activeOpacity={0.7}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Alert.alert('Help', 'Help & FAQ coming soon')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="help-circle-outline" size={24} color={colors.text} />
                        <Text style={styles.menuItemText}>Help & FAQ</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Linking.openURL('tel:+911234567890')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="call-outline" size={24} color={colors.text} />
                        <Text style={styles.menuItemText}>Contact Support</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Alert.alert('Terms & Conditions', 'Terms coming soon')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="document-text-outline" size={24} color={colors.text} />
                        <Text style={styles.menuItemText}>Terms & Conditions</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="shield-checkmark-outline" size={24} color={colors.text} />
                        <Text style={styles.menuItemText}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.menuItem}>
                        <Ionicons name="information-circle-outline" size={24} color={colors.text} />
                        <Text style={styles.menuItemText}>App Version</Text>
                        <Text style={styles.versionText}>1.0.0</Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Ionicons name="log-out-outline" size={22} color={colors.white} />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

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

    // Header
    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
    },

    // Content
    scrollContent: {
        paddingBottom: spacing.xl,
    },

    // Profile Section
    profileSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        backgroundColor: colors.white,
        marginBottom: spacing.md,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    profilePhone: {
        fontSize: 14,
        color: colors.textSecondary,
    },

    // Section
    section: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },

    // Input
    inputContainer: {
        marginBottom: spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 15,
        color: colors.text,
        backgroundColor: colors.white,
    },
    inputDisabled: {
        backgroundColor: '#F9FAFB',
        color: colors.textSecondary,
    },

    // Edit Buttons
    editButtonRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: colors.textSecondary,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    saveButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.white,
    },

    // Menu Item
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuItemText: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        marginLeft: spacing.md,
    },
    versionText: {
        fontSize: 14,
        color: colors.textSecondary,
    },

    // Logout Button
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: colors.error,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.white,
    },
});

export default ProfileScreen;