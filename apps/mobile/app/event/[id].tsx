import React, { useState } from 'react';
import {
  ScrollView, View, StyleSheet, useColorScheme, TouchableOpacity, Modal, Image
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
    emoji: '🚀',
    posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000',
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
    isTeamEvent: true,
  },
  f1: {
    id: 'f1',
    title: 'WEB-A-THON 2.0 — Registrations Open!',
    organizer: 'Metaverse',
    emoji: '🌐',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/web-a-thon-20--lpus-next-big-hackathon-6aa2c8e7f28decc1178eb634-1789162899017.png',
    description: 'LPU’s Next Big Hackathon by Metaverse. Register now for ₹169.',
    location: 'LPU Main Auditorium, Block 38',
    startTime: 'Sep 25, 2026 — 9:00 AM',
    endTime: 'Sep 26, 2026 — 9:00 AM',
    category: 'hackathon',
    teamSize: '2–4 members',
    prize: '₹1,00,000',
    fee: '₹169',
    attendees: 412,
    maxAttendees: 2000,
    status: 'upcoming',
    tags: ['Web3', 'Hackathon'],
    tiers: [
      { name: 'General', price: '₹169', perks: ['Entry pass', 'Swag bag'] },
    ],
    isTeamEvent: true,
  },
  evt_webathon: {
    id: 'evt_webathon',
    title: 'WEB-A-THON 2.0 | LPU’s Next Big Hackathon',
    organizer: 'Metaverse',
    emoji: '🌐',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/web-a-thon-20--lpus-next-big-hackathon-6aa2c8e7f28decc1178eb634-1789162899017.png',
    description: 'LPU’s Next Big Hackathon by Metaverse. Register now for ₹169.',
    location: 'LPU Main Auditorium, Block 38',
    startTime: 'Sep 25, 2026 — 9:00 AM',
    endTime: 'Sep 26, 2026 — 9:00 AM',
    category: 'hackathon',
    teamSize: '2–4 members',
    prize: '₹1,00,000',
    fee: '₹169',
    attendees: 412,
    maxAttendees: 2000,
    status: 'upcoming',
    tags: ['Web3', 'Hackathon'],
    tiers: [
      { name: 'General', price: '₹169', perks: ['Entry pass', 'Swag bag'] },
    ],
    isTeamEvent: true,
  },
  f3: {
    id: 'f3',
    title: 'Code Heist Hackathon',
    organizer: 'Thryve',
    emoji: '💻',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTk4NjdlYjdmMTA4MzUwN2ZiOGRjZjkvMTc4ODUyODAxMzE3Ml82NjYyNDE0ZjcwOWU4NGZjMTI5YWFhZTVmZWU2MGI1MC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19',
    description: 'Thryve is hosting a new Hackathon on Sep 18! Build something amazing.',
    location: 'Block 32',
    startTime: 'Sep 18, 2026 — 9:00 AM',
    endTime: 'Sep 19, 2026 — 9:00 AM',
    category: 'hackathon',
    teamSize: '1–3 members',
    prize: '₹50,000',
    fee: '₹179',
    attendees: 320,
    maxAttendees: 500,
    status: 'upcoming',
    tags: ['AI', 'Security'],
    tiers: [
      { name: 'General', price: '₹179', perks: ['Entry pass', 'Swag bag'] },
    ],
    isTeamEvent: true,
  },
  evt_codeheist: {
    id: 'evt_codeheist',
    title: 'Code Heist Hackathon',
    organizer: 'Thryve',
    emoji: '💻',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTk4NjdlYjdmMTA4MzUwN2ZiOGRjZjkvMTc4ODUyODAxMzE3Ml82NjYyNDE0ZjcwOWU4NGZjMTI5YWFhZTVmZWU2MGI1MC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19',
    description: 'Thryve is hosting a new Hackathon on Sep 18! Build something amazing.',
    location: 'Block 32',
    startTime: 'Sep 18, 2026 — 9:00 AM',
    endTime: 'Sep 19, 2026 — 9:00 AM',
    category: 'hackathon',
    teamSize: '1–3 members',
    prize: '₹50,000',
    fee: '₹179',
    attendees: 320,
    maxAttendees: 500,
    status: 'upcoming',
    tags: ['AI', 'Security'],
    tiers: [
      { name: 'General', price: '₹179', perks: ['Entry pass', 'Swag bag'] },
    ],
    isTeamEvent: true,
  },
  evt_code2career: {
    id: 'evt_code2career',
    title: 'Code2Career AI Hackathon',
    organizer: 'Coding Ninjas LPU',
    emoji: '🤖',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9jbHViL2V2ZW50L2NvZGUyY2FyZWVyLWFpLWhhY2thdGhvbi0xNzg4NzgzODY5ODQ4LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb3ZlciIsIndpZHRoIjo4MDB9fX0=',
    description: 'AI Hackathon by Coding Ninjas. Great for career building!',
    location: 'Block 34',
    startTime: 'Sep 18, 2026 — 10:00 AM',
    endTime: 'Sep 19, 2026 — 10:00 AM',
    category: 'hackathon',
    teamSize: '1–4 members',
    prize: '₹75,000',
    fee: '₹199',
    attendees: 540,
    maxAttendees: 800,
    status: 'upcoming',
    tags: ['AI/ML', 'Career'],
    tiers: [{ name: 'General', price: '₹199', perks: ['Entry pass'] }],
    isTeamEvent: true,
  },
  evt_anime: {
    id: 'evt_anime',
    title: 'Anime Night 2.0',
    organizer: 'Play2Unite',
    emoji: '🎌',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTlmZWJhY2ZlN2VlYThhYzZhMDU1ZWEvMTc4OTExMDY4MDMxN18wNjAzNWRiYzk2OTA0NDEyNmQzYjI3ZTk5OWVlOTUyZS5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19',
    description: 'Join us for Anime Night! Screening the latest movies and episodes.',
    location: 'Baldev Raj Mittal Auditorium',
    startTime: 'Sep 17, 2026 — 6:00 PM',
    endTime: 'Sep 17, 2026 — 9:00 PM',
    category: 'cultural',
    teamSize: 'Solo',
    prize: 'N/A',
    fee: '₹99',
    attendees: 800,
    maxAttendees: 1000,
    status: 'upcoming',
    tags: ['Anime', 'Screening'],
    tiers: [{ name: 'General', price: '₹99', perks: ['Entry pass'] }],
    isTeamEvent: false,
  },
  evt_goalrush: {
    id: 'evt_goalrush',
    title: 'GOAL RUSH',
    organizer: 'Gamers Guild',
    emoji: '⚽',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9jbHViL2V2ZW50L2dvbGQtcnVzaC0xNzg3OTk1MzE1OTA1LmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJmaXQiOiJjb3ZlciIsIndpZHRoIjo4MDB9fX0=',
    description: 'FIFA Esports tournament! Prove you are the best virtual manager.',
    location: 'Block 13',
    startTime: 'Sep 11, 2026 — 10:00 AM',
    endTime: 'Sep 12, 2026 — 5:00 PM',
    category: 'sports',
    teamSize: '5v5',
    prize: '₹20,000',
    fee: '₹499',
    attendees: 120,
    maxAttendees: 200,
    status: 'upcoming',
    tags: ['Esports', 'FIFA'],
    tiers: [{ name: 'Team Entry', price: '₹499', perks: ['Entry pass for 5'] }],
    isTeamEvent: true,
  },
  evt_paper: {
    id: 'evt_paper',
    title: 'Paper Mache workshop',
    organizer: 'RENOVA',
    emoji: '🎨',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/paper-mache-workshop-6a9fb8135d8f22c034998d3a-1789050928527.jpg',
    description: 'Learn the art of Paper Mache in this hands-on workshop.',
    location: 'Block 55 Art Studio',
    startTime: 'Sep 15, 2026 — 2:00 PM',
    endTime: 'Sep 15, 2026 — 5:00 PM',
    category: 'workshop',
    teamSize: 'Solo',
    prize: 'N/A',
    fee: '₹249',
    attendees: 45,
    maxAttendees: 60,
    status: 'upcoming',
    tags: ['Art', 'DIY'],
    tiers: [{ name: 'General', price: '₹249', perks: ['Materials included'] }],
    isTeamEvent: false,
  },
  evt_conference: {
    id: 'evt_conference',
    title: 'International conference',
    organizer: 'LPU',
    emoji: '🌍',
    posterUrl: 'https://onlytemptestingmacbease.s3.ap-south-1.amazonaws.com/public/event/6aa294ddf28decc1178e8c34/1789051516809_3fe46f88df53a3af1dbbf54ea9d469c4.png',
    description: 'Join global scholars and researchers in this international conference.',
    location: 'Shanti Devi Mittal Auditorium',
    startTime: 'Oct 29, 2026 — 9:00 AM',
    endTime: 'Oct 30, 2026 — 5:00 PM',
    category: 'academic',
    teamSize: 'Solo',
    prize: 'N/A',
    fee: '₹1999',
    attendees: 200,
    maxAttendees: 500,
    status: 'upcoming',
    tags: ['Academic', 'Conference'],
    tiers: [{ name: 'General', price: '₹1999', perks: ['Entry pass, Lunch, Kit'] }],
    isTeamEvent: false,
  },
  evt_flood: {
    id: 'evt_flood',
    title: 'Nepal flood relief collection drive',
    organizer: 'LPU',
    emoji: '🤝',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/eyJidWNrZXQiOiJvbmx5dGVtcHRlc3RpbmdtYWNiZWFzZSIsImtleSI6InB1YmxpYy9ldmVudC82YTk0MTU1MzdmMTA4MzUwN2ZiNzBmNzMvcG9zdGVyXzE3ODgwOTE0NjA3OTBfbmVwYWwtMTZfOS1jbGVhbi5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsiZml0IjoiY292ZXIiLCJ3aWR0aCI6ODAwfX19',
    description: 'Help us collect clothes, dry food, and supplies for the Nepal flood victims.',
    location: 'Uni Mall Ground',
    startTime: 'Sep 15, 2026 — 9:00 AM',
    endTime: 'Sep 20, 2026 — 5:00 PM',
    category: 'cultural',
    teamSize: 'Solo',
    prize: 'N/A',
    fee: 'Free',
    attendees: 500,
    maxAttendees: 5000,
    status: 'upcoming',
    tags: ['Charity', 'Social'],
    tiers: [{ name: 'Donation Pass', price: 'Free', perks: ['Contribute items'] }],
    isTeamEvent: false,
  },
  evt_warzone: {
    id: 'evt_warzone',
    title: 'Warzone3',
    organizer: 'Electra',
    emoji: '🎮',
    posterUrl: 'https://onlytemptestingmacbease.s3.ap-south-1.amazonaws.com/public/club/event/warzone3-1789137532269.jpg',
    description: 'Call of Duty Warzone tournament! Bring your squad.',
    location: 'Block 25 Gaming Arena',
    startTime: 'Sep 24, 2026 — 11:00 AM',
    endTime: 'Sep 24, 2026 — 8:00 PM',
    category: 'sports',
    teamSize: 'Squad',
    prize: '₹10,000',
    fee: '₹169',
    attendees: 150,
    maxAttendees: 200,
    status: 'upcoming',
    tags: ['Esports', 'Gaming'],
    tiers: [{ name: 'Squad Entry', price: '₹169', perks: ['Squad Pass'] }],
    isTeamEvent: true,
  },
  evt_lights: {
    id: 'evt_lights',
    title: 'lights out',
    organizer: 'Untangle',
    emoji: '✨',
    posterUrl: 'https://d33g7orf12ceoo.cloudfront.net/public/club/event/poster/lights-out-6a8a8b80ab033ae5a7011699-1788167034184.png',
    description: 'A glowing night filled with music, dance, and cultural performances.',
    location: 'Baldev Raj Mittal Unipolis',
    startTime: 'Sep 15, 2026 — 7:00 PM',
    endTime: 'Sep 15, 2026 — 11:00 PM',
    category: 'cultural',
    teamSize: 'Solo',
    prize: 'N/A',
    fee: '₹292',
    attendees: 300,
    maxAttendees: 800,
    status: 'upcoming',
    tags: ['Cultural', 'Night'],
    tiers: [{ name: 'General', price: '₹292', perks: ['Entry pass'] }],
    isTeamEvent: false,
  }
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((s) => s.getColors(systemColorScheme));
  const [showTicket, setShowTicket] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Instantly use mock data with placeholder image instead of waiting for API/DB
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
        <View style={[styles.banner, { backgroundColor: theme.primaryContainer, overflow: 'hidden' }]}>
          {event.posterUrl ? (
             <>
               <Image source={{ uri: event.posterUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' }} />
               <View style={{ position: 'absolute', bottom: 12, right: 12 }}>
                 <Badge label={event.category?.toUpperCase() || 'EVENT'} variant="xp" />
               </View>
             </>
          ) : (
             <>
               <Text style={{ fontSize: 64 }}>{event.emoji || '📅'}</Text>
               <Badge label={event.category?.toUpperCase() || 'EVENT'} variant="xp" />
             </>
          )}
        </View>

        {/* Title section */}
        <View style={styles.titleSection}>
          <Text variant="headline-lg">{event.title}</Text>
          <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 4 }}>{event.organizer}</Text>
        </View>

        {/* Meta row */}
        <View style={styles.metaCards}>
          {[
            { icon: '📅', label: 'Start', value: event.startTime },
            { icon: '📍', label: 'Location', value: event.location },
            { icon: '👥', label: 'Team', value: event.teamSize },
            { icon: '🏆', label: 'Prize', value: event.prize },
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
          <Text variant="body-md" color="onSurfaceVariant">{event.description || 'No description provided.'}</Text>
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
            {event.isTeamEvent ? (
              <Button
                title=" Register with SquadUp Team"
                onPress={() => { setIsRegistered(true); setShowTicket(true); }}
              />
            ) : null}
            <Button
              title="Register Solo"
              variant={event.isTeamEvent ? "secondary" : "primary"}
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
