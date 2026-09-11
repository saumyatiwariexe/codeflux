import React, { useState } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity,
  TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useThemeStore } from '../../stores/useThemeStore';

type LFTab = 'lost' | 'found' | 'myItems';

const CATEGORY_ICONS: Record<string, string> = {
  electronics: 'phone-portrait',
  bag: 'bag',
  wallet: 'wallet',
  id_card: 'card',
  keys: 'key',
  clothing: 'shirt',
  books: 'book',
  other: 'help-circle',
};

const MOCK_LOST = [
  {
    id: 'l1', category: 'electronics',
    title: 'Black OnePlus 12R',
    description: 'Lost near cafeteria around 1 PM. Cracked screen protector.',
    location: 'Main Cafeteria Block',
    time: '3h ago', reporterName: 'Aarav S.',
    aiMatch: { score: 82, foundTitle: 'Found Android phone near Block 34' },
  },
  {
    id: 'l2', category: 'id_card',
    title: 'LPU Student ID Card — Priya Krishnan',
    description: 'Needed for hostel access. Please contact if found.',
    location: 'Library 2nd Floor',
    time: '6h ago', reporterName: 'Priya K.',
    aiMatch: null,
  },
  {
    id: 'l3', category: 'wallet',
    title: 'Brown leather wallet',
    description: 'Lost during evening sports session. Had ₹200 and ID inside.',
    location: 'Sports Complex',
    time: '1 day ago', reporterName: 'Rohan M.',
    aiMatch: null,
  },
];

const MOCK_FOUND = [
  {
    id: 'f1', category: 'electronics',
    title: 'Android phone — black, cracked back',
    description: 'Found on bench outside Block 34. Still has battery.',
    location: 'Block 34 entrance bench',
    time: '1h ago', reporterName: 'Neha S.',
  },
  {
    id: 'f2', category: 'keys',
    title: 'Key ring with 3 keys + Scooty remote',
    description: 'Found near parking lot A, Block 16 area.',
    location: 'Parking Lot A, Block 16',
    time: '4h ago', reporterName: 'Karan A.',
  },
];

const CATEGORY_OPTIONS = [
  { key: 'electronics', label: 'Electronics' },
  { key: 'bag', label: 'Bag' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'id_card', label: 'ID Card' },
  { key: 'keys', label: 'Keys' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'books', label: 'Books' },
  { key: 'other', label: 'Other' },
];

export default function LostPulseScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const [activeTab, setActiveTab] = useState<LFTab>('lost');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportLocation, setReportLocation] = useState('');

  const openReport = (type: 'lost' | 'found') => {
    setReportType(type);
    setShowReportModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={theme.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text variant="headline-md">LostPulse</Text>
          <Text variant="body-sm" color="onSurfaceVariant">AI-powered lost &amp; found</Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[styles.reportBtn, { backgroundColor: theme.error + '22', borderColor: theme.error + '55' }]}
            onPress={() => openReport('lost')}
          >
            <Text variant="label-sm" style={{ color: theme.error }}>I Lost</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reportBtn, { backgroundColor: theme.neonEmerald + '22', borderColor: theme.neonEmerald + '55' }]}
            onPress={() => openReport('found')}
          >
            <Text variant="label-sm" style={{ color: theme.neonEmerald }}>I Found</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: theme.glassBorder }]}>
        {([['lost', 'Lost Items', MOCK_LOST.length], ['found', 'Found Items', MOCK_FOUND.length], ['myItems', 'My Items', 1]] as [LFTab, string, number][]).map(([key, label, count]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(key)}
          >
            <Text variant="label-sm" style={{ color: activeTab === key ? theme.primary : theme.onSurfaceVariant }}>
              {label} ({count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---- Lost Tab ---- */}
      {activeTab === 'lost' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {MOCK_LOST.map((item) => (
            <Card key={item.id} variant="default" style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View style={[styles.itemIcon, { backgroundColor: theme.errorContainer }]}>
                  <Ionicons name={(CATEGORY_ICONS[item.category] ?? 'help-circle') as any} size={22} color={theme.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="headline-sm">{item.title}</Text>
                  <Text variant="body-sm" color="onSurfaceVariant" numberOfLines={2}>{item.description}</Text>
                  <View style={styles.itemMeta}>
                    <Text variant="label-xs" color="onSurfaceVariant"> {item.location}</Text>
                    <Text variant="label-xs" color="onSurfaceVariant">{item.time}</Text>
                  </View>
                </View>
              </View>

              {/* AI Match Banner */}
              {item.aiMatch && (
                <View style={[styles.aiMatchBanner, { backgroundColor: theme.neonEmerald + '18', borderColor: theme.neonEmerald + '44' }]}>
                  <Ionicons name="flash" size={18} color={theme.neonEmerald} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text variant="label-sm" style={{ color: theme.neonEmerald }}>
                      {item.aiMatch.score}% match found!
                    </Text>
                    <Text variant="body-sm" color="onSurfaceVariant" numberOfLines={1}>{item.aiMatch.foundTitle}</Text>
                  </View>
                  <TouchableOpacity style={[styles.claimBtn, { backgroundColor: theme.neonEmerald }]}>
                    <Text variant="label-xs" style={{ color: '#0B3D20' }}>View →</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.itemFooter}>
                <View style={styles.reporterRow}>
                  <Avatar displayName={item.reporterName} size={20} />
                  <Text variant="label-xs" color="onSurfaceVariant" style={{ marginLeft: 6 }}>Reported by {item.reporterName}</Text>
                </View>
              </View>
            </Card>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ---- Found Tab ---- */}
      {activeTab === 'found' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {MOCK_FOUND.map((item) => (
            <Card key={item.id} variant="default" style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View style={[styles.itemIcon, { backgroundColor: theme.tertiaryContainer }]}>
                  <Ionicons name={(CATEGORY_ICONS[item.category] ?? 'help-circle') as any} size={22} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="headline-sm">{item.title}</Text>
                  <Text variant="body-sm" color="onSurfaceVariant" numberOfLines={2}>{item.description}</Text>
                  <View style={styles.itemMeta}>
                    <Text variant="label-xs" color="onSurfaceVariant"> {item.location}</Text>
                    <Text variant="label-xs" color="onSurfaceVariant">{item.time}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={[styles.thisIsMineBtn, { backgroundColor: theme.primary }]}>
                <Text variant="label-sm" style={{ color: theme.onPrimary }}> This is mine!</Text>
              </TouchableOpacity>
            </Card>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ---- My Items Tab ---- */}
      {activeTab === 'myItems' && (
        <View style={[styles.content, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="search" size={48} color={theme.onSurfaceVariant} style={{ opacity: 0.4 }} />
          <Text variant="headline-sm" style={{ marginTop: 12 }}>Your Reports</Text>
          <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>
            Items you've reported as lost or found appear here.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <Button title="I Lost Something" variant="primary" onPress={() => openReport('lost')} style={{ paddingHorizontal: 16 }} />
            <Button title="I Found Something" variant="secondary" onPress={() => openReport('found')} style={{ paddingHorizontal: 16 }} />
          </View>
        </View>
      )}

      {/* ---- Report Modal ---- */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modal, { backgroundColor: theme.surfaceSpaceElevated }]}>
            <Text variant="headline-sm">
              {reportType === 'lost' ? ' Report Lost Item' : ' Report Found Item'}
            </Text>

            {/* Category */}
            <Text variant="label-sm" color="onSurfaceVariant" style={{ marginTop: 16, marginBottom: 8 }}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORY_OPTIONS.map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.catChip, { backgroundColor: selectedCategory === c.key ? theme.primary : theme.surfaceContainerLow }]}
                    onPress={() => setSelectedCategory(c.key)}
                  >
                    <Ionicons name={(CATEGORY_ICONS[c.key] ?? 'help-circle') as any} size={16} color={selectedCategory === c.key ? theme.onPrimary : theme.onSurface} />
                    <Text variant="label-xs" style={{ color: selectedCategory === c.key ? theme.onPrimary : theme.onSurface, marginLeft: 4 }}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.glassBorder, marginTop: 16 }]}
              placeholder="Title (e.g. Black iPhone 15 Pro)"
              placeholderTextColor={theme.onSurfaceVariant}
              value={reportTitle}
              onChangeText={setReportTitle}
            />
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.glassBorder, marginTop: 8 }]}
              placeholder="Describe the item in detail..."
              placeholderTextColor={theme.onSurfaceVariant}
              value={reportDesc}
              onChangeText={setReportDesc}
              multiline
              textAlignVertical="top"
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceContainerLow, color: theme.onSurface, borderColor: theme.glassBorder, marginTop: 8 }]}
              placeholder={`${reportType === 'lost' ? 'Last seen' : 'Found'} location`}
              placeholderTextColor={theme.onSurfaceVariant}
              value={reportLocation}
              onChangeText={setReportLocation}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.surfaceContainerHigh }]}
                onPress={() => setShowReportModal(false)}
              >
                <Text variant="label-sm" color="onSurfaceVariant">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary, flex: 1 }]}
                onPress={() => setShowReportModal(false)}
              >
                <Text variant="label-sm" style={{ color: theme.onPrimary }}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  reportBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  content: { padding: 20, paddingBottom: 100, gap: 12 },
  itemCard: { padding: 16 },
  itemTop: { flexDirection: 'row', gap: 14 },
  itemIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  aiMatchBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 12 },
  claimBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  itemFooter: { marginTop: 12 },
  reporterRow: { flexDirection: 'row', alignItems: 'center' },
  thisIsMineBtn: { height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  input: { height: 52, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontFamily: 'Inter', borderWidth: 1 },
  textarea: { height: 80, paddingTop: 14 },
  modalBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
});
