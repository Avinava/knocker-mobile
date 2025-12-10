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
import { useAuthStore } from '@/stores/authStore';
import { useDispositionStore } from '@/stores/dispositionStore';
import { DispositionType } from '@/models/types';
import { formatRelativeDate } from '@/utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Disposition icons
const DISPOSITION_ICONS: Record<DispositionType, keyof typeof Ionicons.glyphMap> = {
  'Insurance Restoration': 'shield-outline',
  'Solar Replacement': 'sunny-outline',
  'Community Solar': 'people-outline',
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

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { selectedDisposition } = useDispositionStore();
  const { data: leads = [], isLoading, refetch, isRefetching } = useMyLeads();

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
            onRefresh={refetch}
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
});
