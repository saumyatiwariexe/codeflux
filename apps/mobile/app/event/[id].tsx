import React, { useState } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useThemeStore } from '../../stores/useThemeStore';

const MOCK_EVENT_DETAIL: Record<string, any> = {
  evt_hacklpu: {
    id: 'evt_hacklpu',
    title: 'HackLPU 2026: National Innovation Odyssey',
    organizer: 'School of Computer Science & DSW',
    emoji: '',
    description: "India's biggest university hackathon with ₹15,00,000 in prizes across 8 challenge tracks — AI/ML, Web3, IoT, Robotics, FinTech, EdTech, HealthTech, and Open Innovation. 48 hours of hacking, mentorship from industry leaders, and networking with 2,000 students from across India.",
    location: 'LPU Main Auditorium, Block 38 — Shatabdi Hall',
    startTime: 'Sat, Sep 13, 2026 — 9:00 AM',
    endTime: 'Mon, Sep 15, 2026 — 9:00 AM',
    category: 'hackathon',
    teamSize: '2–4 members',
    prize: '₹15,00,000',
    fee: 'Free Entry',
    attendees: 842,
    maxAttendees: 2000,
    status: 'upcoming',
    tags: ['AI/ML', 'Web3', 'IoT', 'Robotics', 'FinTech'],
    tiers: [
      { name: 'General', price: '₹0', perks: ['Full 48h access', 'Meals included', 'Swag bag'] },
    ],
  },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const [showTicket, setShowTicket] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const event = MOCK_EVENT_DETAIL[id] ?? MOCK_EVENT_DETAIL['evt_hacklpu'];
  const mockBookingId = `TIX-${Date.now().toString(36).toUpperCase()}-LPU`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Back button */}
      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.surfaceContainerLow }]}>
          <Text variant="label-md" color="primary">← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: theme.primaryContainer }]}>
          <Text style={{ fontSize: 64 }}>{event.emoji}</Text>
          <Badge label={event.category.toUpperCase()} variant="xp" />
        </View>

        {/* Title section */}
        <View style={styles.titleSection}>
          <Text variant="headline-lg">{event.title}</Text>
          <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 4 }}>{event.organizer}</Text>
        </View>

        {/* Meta row */}
        <View style={styles.metaCards}>
          {[
            { icon: '', label: 'Start', value: event.startTime },
            { icon: '', label: 'Location', value: event.location },
            { icon: '', label: 'Team', value: event.teamSize },
            { icon: '', label: 'Prize', value: event.prize },
          ].map((m) => (
            <Card key={m.label} variant="default" style={styles.metaCard}>
              <Text style={{ fontSize: 18 }}>{m.icon}</Text>
              <Text variant="label-xs" color="onSurfaceVariant">{m.label}</Text>
              <Text variant="label-sm" numberOfLines={2}>{m.value}</Text>
            </Card>
          ))}
        </View>

        {/* Attendees */}
        <View style={[styles.attendeeBar, { backgroundColor: theme.surfaceContainerLow }]}>
          <Text variant="label-sm">{event.attendees.toLocaleString()} registered</Text>
          <View style={[styles.attendeeTrack, { backgroundColor: theme.surfaceContainerHigh }]}>
            <View style={[styles.attendeeFill, { backgroundColor: theme.primary, width: `${Math.min(100, (event.attendees / event.maxAttendees) * 100)}%` }]} />
          </View>
          <Text variant="label-sm" color="onSurfaceVariant">{event.maxAttendees.toLocaleString()} max</Text>
        </View>

        {/* Description */}
        <Card variant="default" style={{ padding: 16 }}>
          <Text variant="headline-sm" style={{ marginBottom: 8 }}>About</Text>
          <Text variant="body-md" color="onSurfaceVariant">{event.description}</Text>
        </Card>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {event.tags.map((t: string) => (
            <View key={t} style={[styles.tag, { backgroundColor: theme.surfaceContainerLow }]}>
              <Text variant="label-sm" color="onSurfaceVariant">{t}</Text>
            </View>
          ))}
        </View>

        {/* Ticket Tiers */}
        {event.tiers?.map((tier: any) => (
          <Card key={tier.name} variant="elevated" style={{ padding: 16 }}>
            <View style={styles.tierRow}>
              <View>
                <Text variant="headline-sm">{tier.name}</Text>
                <Text variant="body-sm" color="neonEmerald">{tier.price}</Text>
              </View>
            </View>
            <View style={{ gap: 4, marginTop: 8 }}>
              {tier.perks.map((p: string) => (
                <Text key={p} variant="label-sm" color="onSurfaceVariant">✓ {p}</Text>
              ))}
            </View>
          </Card>
        ))}

        {/* CTA */}
        {!isRegistered ? (
          <View style={{ gap: 10 }}>
            <Button
              title=" Register with SquadUp Team"
              onPress={() => { setIsRegistered(true); setShowTicket(true); }}
            />
            <Button
              title="Register Solo"
              variant="secondary"
              onPress={() => { setIsRegistered(true); setShowTicket(true); }}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.ticketBtn, { backgroundColor: theme.neonEmerald }]}
            onPress={() => setShowTicket(true)}
          >
            <Text variant="label-lg" style={{ color: '#0B3D20' }}> View My Ticket</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ---- QR Ticket Modal ---- */}
      <Modal visible={showTicket} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.ticketModal, { backgroundColor: theme.surfaceSpaceElevated }]}>
            <Text variant="headline-sm" style={{ textAlign: 'center' }}>Your Ticket</Text>
            <Text variant="body-sm" color="onSurfaceVariant" style={{ textAlign: 'center', marginTop: 4 }}>
              Show this at the venue entrance
            </Text>

            {/* Glassmorphism ticket card */}
            <View style={[styles.ticketCard, { backgroundColor: theme.primaryContainer, borderColor: theme.primary + '44' }]}>
              <Text style={{ fontSize: 40, textAlign: 'center' }}>{event.emoji}</Text>
              <Text variant="headline-sm" style={{ textAlign: 'center', marginTop: 8 }}>{event.title}</Text>
              <Text variant="label-sm" color="onSurfaceVariant" style={{ textAlign: 'center' }}>{event.startTime}</Text>

              {/* Mock QR code (grid pattern) */}
              <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]}>
                <View style={styles.qrGrid}>
                  {Array.from({ length: 64 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.qrCell,
                        { backgroundColor: (i * 7 + i * 13 + i * 3) % 4 === 0 ? '#000' : '#FFF' },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <Text variant="label-sm" style={{ textAlign: 'center', fontFamily: 'Inter', letterSpacing: 2, marginTop: 8 }}>
                {mockBookingId}
              </Text>
              <Badge label="General · Free" variant="xp" />
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceContainerHigh }]}
              onPress={() => setShowTicket(false)}
            >
              <Text variant="label-md" color="onSurfaceVariant">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  content: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  banner: { height: 200, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 12 },
  titleSection: {},
  metaCards: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaCard: { width: '47%', padding: 14, gap: 4 },
  attendeeBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14 },
  attendeeTrack: { flex: 1, height: 6, borderRadius: 3 },
  attendeeFill: { height: 6, borderRadius: 3 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketBtn: { height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  ticketModal: { padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, gap: 16 },
  ticketCard: {
    borderRadius: 20, padding: 20, borderWidth: 1,
    alignItems: 'center', gap: 8,
  },
  qrContainer: { width: 160, height: 160, borderRadius: 12, padding: 8, marginTop: 8 },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 144, height: 144 },
  qrCell: { width: 18, height: 18 },
  closeBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
