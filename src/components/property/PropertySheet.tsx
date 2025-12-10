import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePropertyDetails } from '@/hooks/useProperties';
import { Property } from '@/models/types';
import { formatDate, getRelativeTime } from '@/utils/dateUtils';
import { getStatusStyle, getLeadStatusStyle } from '@/utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PropertySheetProps {
  property: Property;
  onClose: () => void;
  onKnockDoor: () => void;
  onCreateLead: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PropertySheet({
  property,
  onClose,
  onKnockDoor,
  onCreateLead,
}: PropertySheetProps) {
  const insets = useSafeAreaInsets();
  const { data: details, isLoading } = usePropertyDetails(property.Id);
  const [activeTab, setActiveTab] = useState<'details' | 'related'>('details');

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </View>
    );
  }

  const fullProperty = details?.property || property;
  const events = fullProperty?.Events?.records || details?.events || [];
  const leads = fullProperty?.Leads__r?.records || details?.leads || [];
  const projects = fullProperty?.Projects__r?.records || [];

  // Get most recent event
  const recentEvent = events[0];
  const dispositionStatus = recentEvent?.Disposition_Status__c || 'N/A';
  const daysAgo = recentEvent?.CreatedDate ? getRelativeTime(recentEvent.CreatedDate) : null;
  const submittedBy = recentEvent?.Submitted_By__r?.Name || 'N/A';

  // Format address
  const address = fullProperty.Street__c ||
    fullProperty.Property_Street__c ||
    fullProperty.Address__c?.split(',')[0] ||
    'Unknown Address';

  const fullAddress = [
    fullProperty.City__c,
    fullProperty.State__c,
    fullProperty.Postal_Code__c,
  ].filter(Boolean).join(', ');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dragHandle} />
        <Text style={styles.title} numberOfLines={2}>
          {address}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'related' && styles.activeTab]}
          onPress={() => setActiveTab('related')}
        >
          <Text style={[styles.tabText, activeTab === 'related' && styles.activeTabText]}>
            Related
          </Text>
          {(events.length > 0 || leads.length > 0) && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{events.length + leads.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >

        {activeTab === 'details' ? (
          <>
            {/* Address Section */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionLabel}>Address</Text>
                  <Text style={styles.sectionValue}>{address}</Text>
                  <Text style={styles.sectionSubValue}>{fullAddress}</Text>
                </View>
                {projects.length > 0 && (
                  <View style={styles.projectBadge}>
                    <Text style={styles.projectBadgeText}>Has Project</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Owner Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Owner</Text>
              <Text style={styles.sectionValue}>
                {fullProperty.Owner_1_Name_Full__c || 'N/A'}
              </Text>
              {fullProperty.Owner_2_Name_Full__c && (
                <Text style={styles.sectionSubValue}>
                  {fullProperty.Owner_2_Name_Full__c}
                </Text>
              )}
            </View>

            {/* Property Info Grid */}
            <View style={styles.gridSection}>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.sectionLabel}>Existing Roof Type</Text>
                  <Text style={styles.sectionValue}>
                    {fullProperty.Existing_Roof_Type__c || 'N/A'}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.sectionLabel}>Existing Siding</Text>
                  <Text style={styles.sectionValue}>
                    {fullProperty.Existing_Siding__c || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <Text style={styles.sectionLabel}>Solar On Property</Text>
                  <Text style={styles.sectionValue}>
                    {fullProperty.Has_Solar_On_Roof__c || 'N/A'}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.sectionLabel}>Year Built</Text>
                  <Text style={styles.sectionValue}>
                    {fullProperty.Year_Built_Primary_Structure__c || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Most Recent Event */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>Most Recent Activity</Text>
                {recentEvent && (
                  <View style={styles.eventMeta}>
                    <Text style={styles.eventMetaText}>{daysAgo}</Text>
                    <Text style={styles.eventMetaText}>By: {submittedBy}</Text>
                  </View>
                )}
              </View>
              <View style={styles.dispositionBadge}>
                <Text style={styles.dispositionText}>{dispositionStatus}</Text>
              </View>
              {recentEvent?.Description && (
                <Text style={styles.eventDescription}>{recentEvent.Description}</Text>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Events */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Events ({events.length})</Text>
              {events.length === 0 ? (
                <Text style={styles.emptyText}>No events found</Text>
              ) : (
                events.slice(0, 5).map((event: any) => (
                  <View key={event.Id} style={styles.listItem}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemTitle}>{event.Subject}</Text>
                      <View style={[
                        styles.statusBadge,
                        getStatusStyle(event.Disposition_Status__c)
                      ]}>
                        <Text style={styles.statusText}>
                          {event.Disposition_Status__c || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.listItemMeta}>
                      {formatDate(event.CreatedDate)} • {event.Submitted_By__r?.Name || 'N/A'}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Leads */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Leads ({leads.length})</Text>
              {leads.length === 0 ? (
                <Text style={styles.emptyText}>No leads found</Text>
              ) : (
                leads.slice(0, 5).map((lead: any) => (
                  <View key={lead.Id} style={styles.listItem}>
                    <View style={styles.listItemHeader}>
                      <Text style={styles.listItemTitle}>
                        {lead.Name || `${lead.FirstName || ''} ${lead.LastName || ''}`.trim() || 'Unnamed Lead'}
                      </Text>
                      <View style={[styles.statusBadge, getLeadStatusStyle(lead.Status)]}>
                        <Text style={styles.statusText}>{lead.Status || 'New'}</Text>
                      </View>
                    </View>
                    <Text style={styles.listItemMeta}>
                      {lead.Lead_Type__c || 'Standard'} • {formatDate(lead.CreatedDate)}
                    </Text>
                  </View>
                ))
              )}
            </View>

            {/* Projects */}
            {projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Projects ({projects.length})</Text>
                {projects.slice(0, 3).map((project: any) => (
                  <View key={project.Id} style={styles.listItem}>
                    <Text style={styles.listItemTitle}>{project.Name}</Text>
                    <Text style={styles.listItemMeta}>
                      Stage: {project.Project_Stage__c || 'Not Started'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Action Buttons - iOS Style */}
      <View style={[styles.actionContainer, { paddingBottom: Math.max(insets.bottom, 24) + 10 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onKnockDoor}
          activeOpacity={0.8}
        >
          <Ionicons name="hand-left" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Knock Door</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={22} color="#8E8E93" />
            <Text style={styles.secondaryButtonText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onCreateLead}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add" size={22} color="#007AFF" />
            <Text style={[styles.secondaryButtonText, { color: '#007AFF' }]}>Lead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.8, // Fixed height to prevent layout issues
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },


  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 180, // Ensure content clears the absolute footer
  },

  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionContent: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sectionValue: {
    fontSize: 15,
    color: '#111827',
  },
  sectionSubValue: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  projectBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  projectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  gridSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
  },
  eventMeta: {
    alignItems: 'flex-end',
  },
  eventMetaText: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  dispositionBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  dispositionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  eventDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 12,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  listItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  listItemMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34, // Safe area bottom
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
    zIndex: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  secondaryButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '500',
  },
});

