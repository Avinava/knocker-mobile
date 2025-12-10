import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMyLeads } from '@/hooks/useLeads';
import { 
  useThisWeekAppointments,
  formatAppointmentTime,
  formatAppointmentDate,
  isAppointmentSoon,
} from '@/hooks/useAppointments';
import { useAuthStore } from '@/stores/authStore';
import { useDispositionStore } from '@/stores/dispositionStore';
import { DispositionType, Appointment } from '@/models/types';
import { formatRelativeDate } from '@/utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Disposition icons
const DISPOSITION_ICONS: Record<DispositionType, keyof typeof Ionicons.glyphMap> = {
  'Insurance Restoration': 'shield-outline',
  'Solar Replacement': 'sunny-outline',
  'Community Solar': 'people-outline',
};

// Appointment type icons
const APPOINTMENT_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Appointment': 'calendar-outline',
  'Inspection': 'search-outline',
  'Meeting': 'people-outline',
  'Follow-up': 'refresh-outline',
};

// Status colors for stats
const STATUS_COLORS = {
  New: '#10B981',
  Contacted: '#3B82F6',
  Qualified: '#F59E0B',
  Sold: '#059669',
  total: '#6B7280',
};

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

function StatCard({ title, value, icon, color, onPress }: StatCardProps) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

function QuickAction({ title, subtitle, icon, color, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
}

function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const isSoon = isAppointmentSoon(appointment);
  const typeIcon = APPOINTMENT_TYPE_ICONS[appointment.Type] || 'calendar-outline';
  const dateLabel = formatAppointmentDate(appointment);
  const timeLabel = formatAppointmentTime(appointment);
  
  // Get display info
  const locationName = appointment.What?.Property_Street__c || appointment.What?.Name || 'Unknown Location';
  const contactName = appointment.Who?.Name;
  
  return (
    <TouchableOpacity
      style={[styles.appointmentCard, isSoon && styles.appointmentCardSoon]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.appointmentLeft}>
        <View style={[styles.appointmentIconContainer, isSoon && styles.appointmentIconContainerSoon]}>
          <Ionicons name={typeIcon} size={18} color={isSoon ? '#DC2626' : '#3B82F6'} />
        </View>
      </View>
      <View style={styles.appointmentContent}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentSubject} numberOfLines={1}>
            {appointment.Subject}
          </Text>
          {isSoon && (
            <View style={styles.soonBadge}>
              <Text style={styles.soonBadgeText}>Soon</Text>
            </View>
          )}
        </View>
        <Text style={styles.appointmentLocation} numberOfLines={1}>
          {locationName}
          {contactName ? ` • ${contactName}` : ''}
        </Text>
        <View style={styles.appointmentTimeRow}>
          <Ionicons name="time-outline" size={12} color="#6B7280" />
          <Text style={styles.appointmentTime}>{dateLabel} • {timeLabel}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedDisposition } = useDispositionStore();
  const { data: leads = [], isLoading: leadsLoading, refetch: refetchLeads, isRefetching: leadsRefetching } = useMyLeads();
  const { 
    data: appointments = [], 
    isLoading: appointmentsLoading, 
    refetch: refetchAppointments,
    isRefetching: appointmentsRefetching 
  } = useThisWeekAppointments();

  const isLoading = leadsLoading || appointmentsLoading;
  const isRefetching = leadsRefetching || appointmentsRefetching;

  const handleRefresh = () => {
    refetchLeads();
    refetchAppointments();
  };

  // Upcoming appointments (next 5)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((appt) => new Date(appt.StartDateTime) >= now)
      .slice(0, 5);
  }, [appointments]);

  // Calculate stats from leads
  const stats = useMemo(() => {
    const byStatus = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Sold: 0,
    };

    const byType: Record<string, number> = {
      'Insurance Restoration': 0,
      'Solar Replacement': 0,
      'Community Solar': 0,
    };

    leads.forEach((lead) => {
      // Count by status
      if (lead.Status in byStatus) {
        byStatus[lead.Status as keyof typeof byStatus]++;
      }
      // Count by type
      if (lead.Lead_Type__c in byType) {
        byType[lead.Lead_Type__c]++;
      }
    });

    // Today's leads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = leads.filter((lead) => {
      const createdDate = new Date(lead.CreatedDate);
      return createdDate >= today;
    }).length;

    // This week's leads
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekCount = leads.filter((lead) => {
      const createdDate = new Date(lead.CreatedDate);
      return createdDate >= weekStart;
    }).length;

    return {
      total: leads.length,
      byStatus,
      byType,
      today: todayCount,
      thisWeek: weekCount,
    };
  }, [leads]);

  // Recent leads (last 5)
  const recentLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.CreatedDate).getTime() - new Date(a.CreatedDate).getTime())
      .slice(0, 5);
  }, [leads]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.Name?.split(' ')[0] || 'there';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{firstName}!</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.dispositionBadge}>
              <Ionicons
                name={DISPOSITION_ICONS[selectedDisposition]}
                size={16}
                color="#3B82F6"
              />
              <Text style={styles.dispositionBadgeText}>
                {selectedDisposition.split(' ')[0]}
              </Text>
            </View>
          </View>
        </View>

        {/* Activity Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.activityCards}>
            <View style={styles.activityCard}>
              <Text style={styles.activityValue}>{stats.today}</Text>
              <Text style={styles.activityLabel}>Today</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityCard}>
              <Text style={styles.activityValue}>{stats.thisWeek}</Text>
              <Text style={styles.activityLabel}>This Week</Text>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityCard}>
              <Text style={styles.activityValue}>{stats.total}</Text>
              <Text style={styles.activityLabel}>Total Leads</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <View style={styles.appointmentCountBadge}>
                <Text style={styles.appointmentCountText}>{upcomingAppointments.length}</Text>
              </View>
            </View>
            <View style={styles.appointmentsContainer}>
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.Id}
                  appointment={appointment}
                  onPress={() => {
                    // Navigate to property if available
                    if (appointment.WhatId) {
                      router.push('/(tabs)/');
                    }
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* No Appointments Message */}
        {upcomingAppointments.length === 0 && !appointmentsLoading && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            </View>
            <View style={styles.emptyAppointments}>
              <Ionicons name="calendar-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyAppointmentsText}>No upcoming appointments</Text>
              <Text style={styles.emptyAppointmentsSubtext}>
                Schedule appointments with leads to see them here
              </Text>
            </View>
          </View>
        )}

        {/* Lead Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lead Status</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="New"
              value={stats.byStatus.New}
              icon="sparkles-outline"
              color={STATUS_COLORS.New}
              onPress={() => router.push('/(tabs)/leads')}
            />
            <StatCard
              title="Contacted"
              value={stats.byStatus.Contacted}
              icon="call-outline"
              color={STATUS_COLORS.Contacted}
              onPress={() => router.push('/(tabs)/leads')}
            />
            <StatCard
              title="Qualified"
              value={stats.byStatus.Qualified}
              icon="checkmark-circle-outline"
              color={STATUS_COLORS.Qualified}
              onPress={() => router.push('/(tabs)/leads')}
            />
            <StatCard
              title="Sold"
              value={stats.byStatus.Sold}
              icon="trophy-outline"
              color={STATUS_COLORS.Sold}
              onPress={() => router.push('/(tabs)/leads')}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <QuickAction
              title="Start Canvassing"
              subtitle="Open map and find properties"
              icon="map-outline"
              color="#3B82F6"
              onPress={() => router.push('/(tabs)/')}
            />
            <QuickAction
              title="View All Leads"
              subtitle={`${stats.total} leads total`}
              icon="people-outline"
              color="#10B981"
              onPress={() => router.push('/(tabs)/leads')}
            />
            <QuickAction
              title="Settings"
              subtitle="Manage your account"
              icon="settings-outline"
              color="#6B7280"
              onPress={() => router.push('/(tabs)/settings')}
            />
          </View>
        </View>

        {/* Recent Leads */}
        {recentLeads.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Leads</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/leads')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentLeadsContainer}>
              {recentLeads.map((lead) => (
                <TouchableOpacity
                  key={lead.Id}
                  style={styles.recentLeadItem}
                  onPress={() => router.push('/(tabs)/leads')}
                >
                  <View style={styles.recentLeadIcon}>
                    <Ionicons
                      name={DISPOSITION_ICONS[lead.Lead_Type__c as DispositionType] || 'person-outline'}
                      size={16}
                      color="#6B7280"
                    />
                  </View>
                  <View style={styles.recentLeadContent}>
                    <Text style={styles.recentLeadName} numberOfLines={1}>
                      {[lead.FirstName, lead.LastName].filter(Boolean).join(' ') || 'Unknown'}
                    </Text>
                    <Text style={styles.recentLeadMeta}>
                      {lead.Status} • {formatRelativeDate(lead.CreatedDate)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dispositionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  dispositionBadgeText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  activityCards: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  activityCard: {
    flex: 1,
    alignItems: 'center',
  },
  activityValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  activityLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  activityDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  recentLeadsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentLeadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentLeadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentLeadContent: {
    flex: 1,
  },
  recentLeadName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  recentLeadMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Appointment styles
  appointmentCountBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appointmentCardSoon: {
    backgroundColor: '#FEF2F2',
  },
  appointmentLeft: {
    marginRight: 12,
  },
  appointmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentIconContainerSoon: {
    backgroundColor: '#FEE2E2',
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  soonBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  soonBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  appointmentLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  appointmentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  appointmentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyAppointments: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyAppointmentsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyAppointmentsSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
