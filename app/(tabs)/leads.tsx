import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyLeads } from '@/hooks/useLeads';
import { formatRelativeDate } from '@/utils/dateUtils';
import { Lead, DispositionType } from '@/models/types';
import { LeadFormSheet } from '@/components/leads/LeadFormSheet';
import { DISPOSITION_TYPES } from '@/utils/constants';

// Status badge colors
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  New: { bg: '#DCFCE7', text: '#166534' },
  Contacted: { bg: '#DBEAFE', text: '#1E40AF' },
  Qualified: { bg: '#FEF3C7', text: '#92400E' },
  Unqualified: { bg: '#FEE2E2', text: '#991B1B' },
  Sold: { bg: '#D1FAE5', text: '#065F46' },
  Closed: { bg: '#E5E7EB', text: '#374151' },
};

// Lead type icons
const LEAD_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Insurance Restoration': 'shield-outline',
  'Solar Replacement': 'sunny-outline',
  'Community Solar': 'people-outline',
};

interface LeadCardProps {
  lead: Lead;
  onPress: (lead: Lead) => void;
  onCall: (phone: string) => void;
  onEmail: (email: string) => void;
}

function LeadCard({ lead, onPress, onCall, onEmail }: LeadCardProps) {
  const statusColor = STATUS_COLORS[lead.Status] || STATUS_COLORS.New;
  const typeIcon = LEAD_TYPE_ICONS[lead.Lead_Type__c] || 'person-outline';

  const fullName = [lead.FirstName, lead.LastName].filter(Boolean).join(' ') || 'Unknown';
  const address = [lead.Street, lead.City, lead.State].filter(Boolean).join(', ');

  return (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => onPress(lead)}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.leadTypeIcon}>
            <Ionicons name={typeIcon} size={16} color="#6B7280" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {fullName}
            </Text>
            {lead.Company && (
              <Text style={styles.cardCompany} numberOfLines={1}>
                {lead.Company}
              </Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
          <Text style={[styles.statusText, { color: statusColor.text }]}>
            {lead.Status}
          </Text>
        </View>
      </View>

      {/* Address */}
      {address && (
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#9CA3AF" />
          <Text style={styles.addressText} numberOfLines={1}>
            {address}
          </Text>
        </View>
      )}

      {/* Contact Actions */}
      <View style={styles.contactRow}>
        {lead.Phone && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => onCall(lead.Phone!)}
          >
            <Ionicons name="call-outline" size={16} color="#3B82F6" />
            <Text style={styles.contactButtonText}>{lead.Phone}</Text>
          </TouchableOpacity>
        )}
        {lead.Email && (
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => onEmail(lead.Email!)}
          >
            <Ionicons name="mail-outline" size={16} color="#3B82F6" />
            <Text style={styles.contactButtonText} numberOfLines={1}>
              {lead.Email}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {formatRelativeDate(lead.CreatedDate)}
        </Text>
        <View style={styles.leadTypeBadge}>
          <Text style={styles.leadTypeText}>{lead.Lead_Type__c}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LeadsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<DispositionType | 'All'>('All');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading, refetch, isRefetching } = useMyLeads();

  // Filter leads based on search and type
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Filter by type
    if (selectedType !== 'All') {
      filtered = filtered.filter((lead) => lead.Lead_Type__c === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((lead) => {
        const fullName = `${lead.FirstName || ''} ${lead.LastName || ''}`.toLowerCase();
        const company = (lead.Company || '').toLowerCase();
        const email = (lead.Email || '').toLowerCase();
        const phone = (lead.Phone || '').toLowerCase();
        const address = `${lead.Street || ''} ${lead.City || ''} ${lead.State || ''}`.toLowerCase();

        return (
          fullName.includes(query) ||
          company.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          address.includes(query)
        );
      });
    }

    return filtered;
  }, [leads, selectedType, searchQuery]);

  const handleLeadPress = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadForm(true);
  }, []);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Could not open phone app');
    });
  }, []);

  const handleEmail = useCallback((email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Error', 'Could not open email app');
    });
  }, []);

  const handleCloseLeadForm = useCallback(() => {
    setShowLeadForm(false);
    setSelectedLead(null);
  }, []);

  const renderLead = useCallback(
    ({ item }: { item: Lead }) => (
      <LeadCard
        lead={item}
        onPress={handleLeadPress}
        onCall={handleCall}
        onEmail={handleEmail}
      />
    ),
    [handleLeadPress, handleCall, handleEmail]
  );

  const ListHeader = () => (
    <View style={styles.filterContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search leads..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter */}
      <View style={styles.typeFilterContainer}>
        <TouchableOpacity
          style={[
            styles.typeFilterButton,
            selectedType === 'All' && styles.typeFilterButtonSelected,
          ]}
          onPress={() => setSelectedType('All')}
        >
          <Text
            style={[
              styles.typeFilterText,
              selectedType === 'All' && styles.typeFilterTextSelected,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {DISPOSITION_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeFilterButton,
              selectedType === type && styles.typeFilterButtonSelected,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Ionicons
              name={LEAD_TYPE_ICONS[type]}
              size={14}
              color={selectedType === type ? '#3B82F6' : '#6B7280'}
            />
            <Text
              style={[
                styles.typeFilterText,
                selectedType === type && styles.typeFilterTextSelected,
              ]}
            >
              {type.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
      </Text>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedType !== 'All' ? 'No Matches Found' : 'No Leads Yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedType !== 'All'
          ? 'Try adjusting your search or filters'
          : 'Start knocking doors and capturing leads'}
      </Text>
      {!searchQuery && selectedType === 'All' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => setShowLeadForm(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.emptyButtonText}>Create Lead</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading leads...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Leads</Text>
          <Text style={styles.headerSubtitle}>
            {leads.length} total • {filteredLeads.length} shown
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => refetch()}
            disabled={isRefetching}
          >
            {isRefetching ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Ionicons name="refresh" size={22} color="#3B82F6" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowLeadForm(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderLead}
        keyExtractor={(item) => item.Id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Lead Form Modal */}
      <LeadFormSheet
        visible={showLeadForm}
        onClose={handleCloseLeadForm}
        lead={selectedLead}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  filterContainer: {
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 10,
  },
  typeFilterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  typeFilterButtonSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  typeFilterText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  typeFilterTextSelected: {
    color: '#3B82F6',
  },
  resultsCount: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  leadCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  leadTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  cardCompany: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  contactButtonText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
    maxWidth: 140,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  leadTypeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  leadTypeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 6,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
