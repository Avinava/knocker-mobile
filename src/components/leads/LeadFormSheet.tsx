import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads';
import { useDispositionStore } from '@/stores/dispositionStore';
import { Lead, Property, CreateLeadRequest } from '@/models/types';
import { DISPOSITION_TYPES } from '@/utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const leadFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  leadType: z.enum(['Insurance Restoration', 'Solar Replacement', 'Community Solar']),
  status: z.string().default('New'),
  description: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormSheetProps {
  visible: boolean;
  onClose: () => void;
  property?: Property | null;
  lead?: Lead | null; // For editing existing lead
}

const LEAD_STATUS_OPTIONS = [
  { label: 'New', value: 'New' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Qualified', value: 'Qualified' },
  { label: 'Unqualified', value: 'Unqualified' },
];

export function LeadFormSheet({ visible, onClose, property, lead }: LeadFormSheetProps) {
  const insets = useSafeAreaInsets();
  const { selectedDisposition } = useDispositionStore();
  const { mutate: createLead, isPending: isCreating } = useCreateLead();
  const { mutate: updateLead, isPending: isUpdating } = useUpdateLead();
  
  const isEditing = !!lead;
  const isPending = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      leadType: selectedDisposition,
      status: 'New',
      description: '',
    },
  });

  // Pre-fill form when editing or using property data
  useEffect(() => {
    if (lead) {
      // Editing existing lead
      setValue('firstName', lead.FirstName || '');
      setValue('lastName', lead.LastName || '');
      setValue('email', lead.Email || '');
      setValue('phone', lead.Phone || '');
      setValue('company', lead.Company || '');
      setValue('street', lead.Street || '');
      setValue('city', lead.City || '');
      setValue('state', lead.State || '');
      setValue('postalCode', lead.PostalCode || '');
      setValue('leadType', (lead.Lead_Type__c as any) || selectedDisposition);
      setValue('status', lead.Status || 'New');
      setValue('description', lead.Description || '');
    } else if (property) {
      // Pre-fill from property
      setValue('street', property.Street__c || property.Property_Street__c || '');
      setValue('city', property.City__c || property.Property_City__c || '');
      setValue('state', property.State__c || property.Property_State__c || '');
      setValue('postalCode', property.Postal_Code__c || property.Property_Zip__c || '');
      
      // Parse owner name if available
      const ownerName = property.Owner_1_Name_Full__c || '';
      const nameParts = ownerName.split(' ');
      if (nameParts.length >= 2) {
        setValue('firstName', nameParts[0]);
        setValue('lastName', nameParts.slice(1).join(' '));
      } else if (nameParts.length === 1) {
        setValue('lastName', nameParts[0]);
      }
    }
  }, [lead, property, setValue, selectedDisposition]);

  // Sync disposition from store when opening
  useEffect(() => {
    if (visible && !lead) {
      setValue('leadType', selectedDisposition);
    }
  }, [visible, selectedDisposition, lead, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: LeadFormData) => {
    const leadData: CreateLeadRequest = {
      FirstName: data.firstName,
      LastName: data.lastName,
      Email: data.email || undefined,
      Phone: data.phone || undefined,
      Company: data.company || undefined,
      Street: data.street || undefined,
      City: data.city || undefined,
      State: data.state || undefined,
      PostalCode: data.postalCode || undefined,
      Status: data.status,
      Lead_Type__c: data.leadType,
      Property__c: property?.Id,
      Disposition_Type__c: data.leadType,
      Description: data.description || undefined,
    };

    if (isEditing && lead) {
      updateLead(
        { leadId: lead.Id, data: leadData },
        {
          onSuccess: () => {
            handleClose();
          },
          onError: (error: any) => {
            Alert.alert('Error', error.message || 'Failed to update lead');
          },
        }
      );
    } else {
      createLead(leadData, {
        onSuccess: () => {
          handleClose();
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to create lead');
        },
      });
    }
  };

  const selectedLeadType = watch('leadType');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { height: SCREEN_HEIGHT * 0.92 }]}>
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {isEditing ? 'Edit Lead' : 'New Lead'}
              </Text>
              {property && (
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {property.Street__c || property.Property_Street__c || 'Unknown Address'}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={30} color="#E5E7EB" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Lead Type */}
            <View style={styles.section}>
              <Text style={styles.label}>
                Lead Type <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="leadType"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipContainer}>
                    {DISPOSITION_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip,
                          value === type && styles.chipSelected
                        ]}
                        onPress={() => onChange(type)}
                      >
                        <Text style={[
                          styles.chipText,
                          value === type && styles.chipTextSelected
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Name Row */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.firstName && styles.inputError]}
                      placeholder="John"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="words"
                    />
                  )}
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName.message}</Text>
                )}
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.input, errors.lastName && styles.inputError]}
                      placeholder="Doe"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="words"
                    />
                  )}
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName.message}</Text>
                )}
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.section}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="john@example.com"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Phone</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="(555) 123-4567"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                  />
                )}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Company</Text>
              <Controller
                control={control}
                name="company"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Company name"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>

            {/* Address Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.sectionHeaderText}>Address</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Street</Text>
              <Controller
                control={control}
                name="street"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="123 Main St"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>City</Text>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="City"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="words"
                    />
                  )}
                />
              </View>

              <View style={styles.halfField}>
                <Text style={styles.label}>State</Text>
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="State"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="characters"
                      maxLength={2}
                    />
                  )}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Postal Code</Text>
              <Controller
                control={control}
                name="postalCode"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="12345"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                )}
              />
            </View>

            {/* Status */}
            <View style={styles.section}>
              <Text style={styles.label}>Status</Text>
              <Controller
                control={control}
                name="status"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipContainer}>
                    {LEAD_STATUS_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.chip,
                          value === option.value && styles.chipSelected
                        ]}
                        onPress={() => onChange(option.value)}
                      >
                        <Text style={[
                          styles.chipText,
                          value === option.value && styles.chipTextSelected
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Add notes about the lead..."
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>

            {/* Spacer for bottom padding */}
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer / Submit Button */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <TouchableOpacity
              style={[styles.submitButton, isPending && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name={isEditing ? "checkmark-circle" : "person-add"} size={20} color="white" />
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Update Lead' : 'Create Lead'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#2563EB',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
