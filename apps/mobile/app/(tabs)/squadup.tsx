import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, useColorScheme, TouchableOpacity, Animated, Dimensions, ScrollView, FlatList, LayoutAnimation, UIManager, Platform
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { HingeFeed, SwipeCardData } from '../../components/squad/HingeFeed';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { squadApi } from '../../services/api';

const { width: SCREEN_W } = Dimensions.get('window');

type Tab = 'discover' | 'matches' | 'teams';

const MOCK_DECK: SwipeCardData[] = [
  {
    id: 'profile_saumya',
    displayName: 'Saumya Tiwari',
    avatarUrl: { uri: 'https://saumyatiwari.vercel.app/images/hero/hero-portrait.png' },
    handle: 'saumyatiwari',
    department: 'BCA',
    year: 1,
    bio: 'Full Stack Dev, AR/VR builder & AI enthusiast. Founder of Elevecrafts. 1st Runner-Up at HackDiwas 3.0.',
    matchScore: 98,
    campusXp: 9500,
    level: 6,
    skills: [
      { skill: { name: 'Next.js' }, proficiency: 'expert' },
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Python', icon: 'language-python' }, proficiency: 'expert' },
      { skill: { name: 'WebXR' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' }
    ],
    prompts: [
      { question: 'A random fact I love is', answer: 'If a concept sounds impossible, it probably just needs more debugging.' },
      { question: 'I spend most of my money on', answer: 'Bad sleep, good music, and endless curiosity.' }
    ]
  },
  {
      id: 'new_p0',
      displayName: 'Aanya',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80' },
      handle: 'aanya_0',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p1',
      displayName: 'Elena',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80' },
      handle: 'elena_1',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p2',
      displayName: 'Chloe',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80' },
      handle: 'chloe_2',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p3',
      displayName: 'Maya',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80' },
      handle: 'maya_3',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p4',
      displayName: 'Sara',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80' },
      handle: 'sara_4',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p5',
      displayName: 'Nia',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80' },
      handle: 'nia_5',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p6',
      displayName: 'Rohan',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80' },
      handle: 'rohan_6',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p7',
      displayName: 'Marcus',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80' },
      handle: 'marcus_7',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p8',
      displayName: 'Dev',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80' },
      handle: 'dev_8',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p9',
      displayName: 'Liam',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80' },
      handle: 'liam_9',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p10',
      displayName: 'Kabir',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80' },
      handle: 'kabir_10',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
      id: 'new_p11',
      displayName: 'Alex',
      avatarUrl: { uri: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80' },
      handle: 'alex_11',
      department: 'General',
      year: 1,
      bio: 'Ready to build awesome things!',
      matchScore: Math.floor(Math.random() * 20) + 75,
      campusXp: Math.floor(Math.random() * 5000) + 1000,
      level: 1,
      skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'Node.js', icon: 'nodejs' }, proficiency: 'intermediate' },
      { skill: { name: 'MongoDB', icon: 'database' }, proficiency: 'beginner' }
    ],
      prompts: []
    },
  {
    id: 'profile_1',
    displayName: 'Isha Kashyap',
    avatarUrl: { uri: 'https://scontent.cdninstagram.com/v/t51.82787-19/801009494_18414773815158717_5594564488977709336_n.jpg?_nc_cat=101&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=TpAq0hhTdJUQ7kNvwHvlleP&_nc_oc=AdqR1VeAW7KeVkLLZSrc4WgeO_0wVn0ACTTVN7i4BSP31dKO6fCQNti7xI8V347-6iSiCFy6769URf8Kgj6PBLvf&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=VuR0igJGfNlEDas2q6DxBg&_nc_ss=7b6a8&oh=00_AQIIB2hK0yuN1Rh8r-N01FTIsFZzcyRAmWk_sgyC74TKpw&oe=6AAB602D' },
    handle: 'isha.kashyap',
    department: 'CSE',
    year: 3,
    bio: 'Over-caffeinated, thrift enthusiast, and always hunting for aesthetic corners in the city ☕🎞️',
    matchScore: 94,
    campusXp: 8400,
    level: 5,
    skills: [
      { skill: { name: 'React', icon: 'react' }, proficiency: 'expert' },
      { skill: { name: 'PyTorch', icon: 'brain' }, proficiency: 'intermediate' },
      { skill: { name: 'Python', icon: 'language-python' }, proficiency: 'expert' },
      { skill: { name: 'Docker', icon: 'docker' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'A shower thought I recently had', answer: 'If AI takes our jobs, who will buy the products the AI makes?' },
      { question: 'I geek out on', answer: 'Perfecting my vim setup and mechanical keyboards.' }
    ]
  },
  {
    id: 'profile_2',
    displayName: 'Oggy ji',
    avatarUrl: { uri: 'https://instagram.faip1-3.fna.fbcdn.net/v/t51.82787-19/696693993_18581656774015961_5114493508268997915_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby40MDAuYzIifQ&_nc_ht=instagram.faip1-3.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2gHm8FyhuHkU-2NJ5bRzgMlj007IuQBe2zU_AhD5VvW5Q9MjlAOJHIPxCk8cMFi4yooqwSkjQe635z6I3HEqWJu5&_nc_ohc=m_KPZAAnV0YQ7kNvwEALg10&_nc_gid=rp2Jy3ADR2DWP4TRhZgXuQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AQI38Xx72XtFeeWhUOiJnM71-wBelJS4ndZg48DXTvOz5w&oe=6AAB7673&_nc_sid=7a9f4b' },
    handle: 'oggy.ji',
    department: 'Design',
    year: 2,
    bio: 'Sneakers, street food trails, and spontaneous weekend drives to Himachal 🏔️👟',
    matchScore: 87,
    campusXp: 5200,
    level: 4,
    skills: [
      { skill: { name: 'Figma', icon: 'vector-curve' }, proficiency: 'expert' },
      { skill: { name: 'TailwindCSS', icon: 'tailwind' }, proficiency: 'expert' },
      { skill: { name: 'Motion Design' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'My most irrational fear', answer: 'Developers using inline styles.' },
      { question: 'Typical Sunday', answer: 'Over-caffeinated at Suto Cafe trying to finish a case study.' }
    ]
  },
  {
    id: 'profile_3',
    displayName: 'Tara Sen',
    avatarUrl: { uri: 'https://instagram.faip1-2.fna.fbcdn.net/v/t51.82787-19/778082010_18127933255781029_7292476422261340546_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.faip1-2.fna.fbcdn.net&_nc_cat=101&_nc_oc=Q6cZ2gHO_WHYhk2g7zTolL4098kz8aTQu2mMBnIlO2uENUv-TzWNUDsCnYa9X9zvscVpN2xKQ8S7YPwsjTvRwLr4p7pr&_nc_ohc=IGRcJboW800Q7kNvwHh2ewG&_nc_gid=OThlRaq1y-wAAnWgs7GTqw&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AQJZ_ddYebQo_qmQ93WER-VqzG9eJ6kz4O-QwJML1b759A&oe=6AAB6EB0&_nc_sid=7a9f4b' },
    handle: 'tara.senn',
    department: 'MBA',
    year: 1,
    bio: 'Probably romanticizing monsoon rains, reading Sally Rooney, or making pottery 🪴🌧️',
    matchScore: 79,
    campusXp: 3400,
    level: 3,
    skills: [
      { skill: { name: 'Product Management' }, proficiency: 'intermediate' },
      { skill: { name: 'Pitching' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'I am looking for', answer: 'A full-stack dev who can build an MVP in a weekend.' },
      { question: 'Best piece of advice', answer: 'Execution is everything.' }
    ]
  },
  {
    id: 'profile_4',
    displayName: 'Dhruv Nambiar',
    avatarUrl: { uri: 'https://instagram.faip1-3.fna.fbcdn.net/v/t51.2885-19/484957631_879684930877050_2654170992432989482_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.faip1-3.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2gGwqJFf9D0-eG--VAN3sIO42TyK07U6kFeo5qmqX6YGy_k_r5O-XRaNtmNHiIt3HKokGIED9civ4d5Lo9mIEfen&_nc_ohc=3r3G9kBZDXcQ7kNvwFDRjs-&_nc_gid=a7Ry3pMY3wSGYAhH4oU8hA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AQILCXRZAji7iHWBzT4Ywh5OsOLpLtwgSlbd7OY9Awuh-w&oe=6AAB593A&_nc_sid=7a9f4b' },
    handle: 'dhruv.nambiar',
    department: 'Journalism',
    year: 3,
    bio: 'Catch me at live gigs, playing bass badly, or rating South Indian filter coffee 🎸☕',
    matchScore: 82,
    campusXp: 4100,
    level: 4,
    skills: [
      { skill: { name: 'Copywriting' }, proficiency: 'expert' },
      { skill: { name: 'SEO' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'Together we could', answer: 'Write a killer pitch deck that actually gets funded.' },
    ]
  },
  {
    id: 'profile_5',
    displayName: 'Avani Deshmukh',
    avatarUrl: { uri: 'https://scontent.cdninstagram.com/v/t51.82787-19/774514111_17903136429513685_1958153174899390412_n.jpg?_nc_cat=100&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=D1nfe3m29bkQ7kNvwE9tcud&_nc_oc=Adr9QsaNe_Vxhd9wu71kTDQSHXFZcHuG859QoATYexExIVD_4IVHxBCrS3HPjLMfnqTylR8xGuOy1mJ6hl0Uxwug&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=QZYHCaoKzD86N6BTIuyemw&_nc_ss=7b6a8&oh=00_AQJshJ8WDWsQ8ZKsU4UtdJLDyypmEstHyaMYTw1akKQ1ow&oe=6AAB6831' },
    handle: 'avani.deshmukh',
    department: 'Mechanical',
    year: 4,
    bio: 'Architecture student | Sketches, heritage lanes, and endless Spotify listening sessions 🏛️🎧',
    matchScore: 88,
    campusXp: 9200,
    level: 6,
    skills: [
      { skill: { name: 'CAD' }, proficiency: 'expert' },
      { skill: { name: 'C++' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'My simple pleasure', answer: 'The smell of a fresh 3D print.' },
      { question: 'I want someone who', answer: 'Knows how to tune a PID controller.' }
    ]
  },
  {
    id: 'profile_6',
    displayName: 'Karan Singhal',
    avatarUrl: { uri: 'https://scontent.cdninstagram.com/v/t51.82787-19/754248038_18383521621201542_7369183745681061412_n.jpg?_nc_cat=102&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=7SSswNMe4n0Q7kNvwHIuEAB&_nc_oc=Adp-eIGuDZAWYlQp8UNqmfY5FGEQ_CABLhFPIqBjsdGP0V3hj-M38onDF_RG4aj2qt9R34CidqN1hpt9qPvNZbRR&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=JoHApiSIqzYN0VhB522jZA&_nc_ss=7b6a8&oh=00_AQIqqMZ0JMfZiEspDaOd-dXARtZyJzxbjVU8irIBMoLNag&oe=6AAB68B4' },
    handle: 'karansinghal.7',
    department: 'CSE',
    year: 2,
    bio: 'Gym enthusiast by morning, night-owl gamer, forever craving tandoori momos 🏋️♂️🎮',
    matchScore: 91,
    campusXp: 6100,
    level: 5,
    skills: [
      { skill: { name: 'Cybersecurity', icon: 'shield-lock' }, proficiency: 'expert' },
      { skill: { name: 'Linux', icon: 'linux' }, proficiency: 'expert' },
      { skill: { name: 'Bash', icon: 'bash' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'Don\'t hate me if I', answer: 'Explain why your password is terrible.' },
    ]
  },
  {
    id: 'profile_7',
    displayName: 'Divya Rajput',
    avatarUrl: { uri: 'https://scontent.cdninstagram.com/v/t51.82787-19/792069891_18076324073714951_6523634690938747192_n.jpg?_nc_cat=102&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=RIbxIxqnFgEQ7kNvwFnDWlP&_nc_oc=AdpfmWZuVLqHhqIOpR_JBJHDGvuwv8gA-g23nabOZckoZmMJT9NBMJjgiOBdtM_1BIheZXujZPe0Iupxfi2t3Sci&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=ygFw9tlIlQElELqIVutvnw&_nc_ss=7b6a8&oh=00_AQJBdBHPiK3f6xVbbYxqFTD72QRLVKI_QF4bt3b8D-CdgQ&oe=6AAB496E' },
    handle: 'divya_rajput',
    department: 'ECE',
    year: 3,
    bio: 'Golden hour junkie, baking cinnamon rolls, and curating chaotic photo dumps ✨🧁',
    matchScore: 85,
    campusXp: 5800,
    level: 4,
    skills: [
      { skill: { name: 'AWS', icon: 'aws' }, proficiency: 'expert' },
      { skill: { name: 'Kubernetes', icon: 'kubernetes' }, proficiency: 'expert' },
      { skill: { name: 'Docker', icon: 'docker' }, proficiency: 'intermediate' },
      { skill: { name: 'Github', icon: 'github' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'My biggest flex', answer: 'Setting up a Kubernetes cluster without crying.' },
    ]
  },
  {
    id: 'profile_8',
    displayName: 'Yash Vardhan',
    avatarUrl: { uri: 'https://scontent.cdninstagram.com/v/t51.2885-19/345052340_194186983446669_7434113337997344583_n.jpg?_nc_cat=104&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=eH-clMkLpJ8Q7kNvwHrvULe&_nc_oc=AdpH55KaxxVidQgwosoEY3PmK7q5ECSAZKZLrbosoUDvBgIfDw4umH6YOrOn5fq4iAF82NV8Z9x5qDnc2OMA-3Bg&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=7b6a8&oh=00_AQKLZe5j7U0L-sa66KYzr0LtRzlR5PZx6ygqqcoSUzB85g&oe=6AAB5B46' },
    handle: 'yashvardhan.raw',
    department: 'Law',
    year: 2,
    bio: 'Documenting everyday life through a 35mm lens. Big fan of indie hip-hop 📷🎙️',
    matchScore: 76,
    campusXp: 4500,
    level: 3,
    skills: [
      { skill: { name: 'Public Speaking' }, proficiency: 'expert' },
      { skill: { name: 'Research' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'We\'re the same type of weird if', answer: 'You read the fine print on software licenses.' },
    ]
  },
  {
    id: 'profile_9',
    displayName: 'Nandini Reddy',
    avatarUrl: { uri: 'https://instagram.faip1-3.fna.fbcdn.net/v/t51.82787-19/708442427_18085192550625737_3449238367970259265_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.faip1-3.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2gHbzd-z3U0tRIm_LCfDdJ5aHwkU733uyanLTKgxeOb_VHOecCTo5e8JaA10aPDrr1svRLql1f3mb5CukTzNbiT1&_nc_ohc=pGhndtPgyhoQ7kNvwFc2AU_&_nc_gid=gpf8jBC3VC0E7grxRZcrHA&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AQL4fPQiOUKw7Ymkq6WfIP_XD5rcabwda9qvcMFnOvcltg&oe=6AAB5D6B&_nc_sid=7a9f4b' },
    handle: 'nandini.reddyy',
    department: 'Data Science',
    year: 3,
    bio: 'Sunflowers, classical music, and finding peace away from the screen 🌻🎶',
    matchScore: 95,
    campusXp: 7700,
    level: 5,
    skills: [
      { skill: { name: 'Python', icon: 'language-python' }, proficiency: 'expert' },
      { skill: { name: 'Machine Learning', icon: 'robot-outline' }, proficiency: 'expert' },
      { skill: { name: 'SQL', icon: 'database' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'My love language is', answer: 'Clean datasets with no missing values.' },
    ]
  },
  {
    id: 'profile_10',
    displayName: 'Samarjit Roy',
    avatarUrl: { uri: 'https://instagram.faip1-3.fna.fbcdn.net/v/t51.2885-19/464981437_1562279321329156_8629665658080676907_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.faip1-3.fna.fbcdn.net&_nc_cat=1&_nc_oc=Q6cZ2gG-kROiZBoDdEf3B3S7CFIUzzbgc7AGynQwxz8Mwx-MSM-jRbx6ANWQQS_3QFJ3-Cr4QsF03Fa1DmUGqqvJR63_&_nc_ohc=A2Y0SsWFXroQ7kNvwHUEKX2&_nc_gid=uXZGbDPjhUf7nb2bye1SlQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AQKqv_QflXHbtM0ZPlZwFoj47KvPElCzJkHH9EoUx4SyRQ&oe=6AAB73E8&_nc_sid=7a9f4b' },
    handle: 'samarjit_roy',
    department: 'Architecture',
    year: 4,
    bio: 'Badminton, terrace sunsets, and searching for the best biryani in town 🏸🍛',
    matchScore: 80,
    campusXp: 8100,
    level: 5,
    skills: [
      { skill: { name: 'AutoCAD' }, proficiency: 'expert' },
      { skill: { name: '3D Modeling' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'I spend most of my money on', answer: 'Expensive coffee and rendering software.' },
    ]
  },
  {
    id: 'profile_11',
    displayName: 'Gauri Mathur',
    avatarUrl: { uri: 'https://scontent.cdninstagram.com/v/t51.82787-19/801582190_17984612949062173_5510978542619317394_n.jpg?_nc_cat=102&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=UTN8GmHBNbcQ7kNvwElUeQh&_nc_oc=AdpLQ5lsqRuSpdSbFgNXsl0mBmw5paCeWW1RhuvNrLyVc33s6XBJAb7PosIQer-gqnmg3ZryX0bJIR1yx-6L1XQa&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=OIyQDOmanlydW5QKr6l4iw&_nc_ss=7b6a8&oh=00_AQLSirFkD2RZzSjM3EJ1IujhMRq6Njv_nkTQPEaBmxWyWg&oe=6AAB7E11' },
    handle: 'gauri_mathur',
    department: 'CSE',
    year: 2,
    bio: 'Collecting tote bags, exploring book fairs, and drinking masala chai twice a day 📚☕',
    matchScore: 89,
    campusXp: 4900,
    level: 4,
    skills: [
      { skill: { name: 'Unity', icon: 'unity' }, proficiency: 'expert' },
      { skill: { name: 'C#', icon: 'language-csharp' }, proficiency: 'expert' },
      { skill: { name: 'Unreal Engine', icon: 'unreal' }, proficiency: 'intermediate' },
    ],
    prompts: [
      { question: 'A random fact I love is', answer: 'That Mario hits the block with his fist, not his head.' },
    ]
  },
  {
    id: 'profile_12',
    displayName: 'Pranav Hegde',
    avatarUrl: { uri: 'https://instagram.faip1-3.fna.fbcdn.net/v/t51.2885-19/271992592_992949367985554_3991927973230685165_n.jpg?efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby41MTUuYzIifQ&_nc_ht=instagram.faip1-3.fna.fbcdn.net&_nc_cat=110&_nc_oc=Q6cZ2gHk-QMFCTA59KIbNvU89NMwK8dxMIJ3qd3PNRQV9JklMQQkTYPU5Mmju42sB2_KNcfLgwH1EDdswa7EOpLiIjz_&_nc_ohc=9_BhRZx18A0Q7kNvwF4m4IL&_nc_gid=cu1cxinsT5turkWL0XhsGQ&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_AQIgvrUPUfURaMs9GV0NUnNKC2EyOM05AZsbI7c9KwNP_A&oe=6AAB73E7&_nc_sid=7a9f4b' },
    handle: 'pranav.hegde',
    department: 'Pharmacy',
    year: 1,
    bio: 'Tech, weekend football leagues, and listening to 2000s Bollywood on loop ⚽📻',
    matchScore: 72,
    campusXp: 2100,
    level: 2,
    skills: [
      { skill: { name: 'Research' }, proficiency: 'intermediate' },
      { skill: { name: 'Biology' }, proficiency: 'expert' },
    ],
    prompts: [
      { question: 'I\'m looking for', answer: 'A team building a med-tech startup for the upcoming hackathon.' },
    ]
  }
];

const MOCK_MATCHES = [
  { id: 'm1', name: 'Aarav Sharma', dept: 'CSE · Year 3', score: 94, lastMsg: 'Hey! Wanna team up for HackLPU?' },
  { id: 'm2', name: 'Priya Krishnan', dept: 'Design · Year 2', score: 87, lastMsg: 'Matched! I do UI/UX' },
];

export default function SquadUpScreen() {
  const systemColorScheme = useColorScheme();
  const theme = useThemeStore((state) => state.getColors(systemColorScheme));
  const user = useAuthStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  
  const [deck, setDeck] = useState<SwipeCardData[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const [deckRes, matchRes] = await Promise.all([
        squadApi.getDeck(),
        squadApi.getMatches()
      ]);
      
      console.log('Deck API response:', deckRes);
      console.log('Match API response:', matchRes);
      
      if (deckRes.success && deckRes.data) {
        setDeck(deckRes.data);
      }
      
      if (matchRes.success && matchRes.data) {
        const mappedMatches = matchRes.data.map((m: any) => ({
          id: m.id,
          name: m.otherProfile?.displayName || 'Unknown User',
          dept: `${m.otherProfile?.department || ''} · Year ${m.otherProfile?.year || 1}`,
          score: m.otherProfile?.matchScore || 85,
          lastMsg: 'Matched!',
          avatarUrl: m.otherProfile?.avatarUrl,
        }));
        setMatches(mappedMatches);
      }
    };
    fetchData();
  }, [user?.email]);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastMatch, setLastMatch] = useState<SwipeCardData | null>(null);
  const matchModalScale = useRef(new Animated.Value(0)).current;

  const handleLike = async (cardId: string, itemType: string, content: string, card: SwipeCardData) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDeck(prev => prev.filter(c => c.id !== cardId));
    
    const res = await squadApi.swipe(cardId, 'like');
    if (res.success && res.data?.isMatch) {
      setLastMatch(card);
      setShowMatchModal(true);
      Animated.spring(matchModalScale, { 
        toValue: 1, 
        stiffness: 250, 
        damping: 15, 
        useNativeDriver: true 
      }).start();
      
      // refresh matches
      const matchRes = await squadApi.getMatches();
      if (matchRes.success && matchRes.data) {
        const mappedMatches = matchRes.data.map((m: any) => ({
          id: m.id,
          name: m.otherProfile?.displayName || 'Unknown User',
          dept: `${m.otherProfile?.department || ''} · Year ${m.otherProfile?.year || 1}`,
          score: m.otherProfile?.matchScore || 85,
          lastMsg: 'Matched!',
          avatarUrl: m.otherProfile?.avatarUrl,
        }));
        setMatches(mappedMatches);
      }
    }
  };

  const handlePass = async (cardId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDeck(prev => prev.filter(c => c.id !== cardId));
    await squadApi.swipe(cardId, 'pass');
  };

  const dismissMatch = () => {
    Animated.timing(matchModalScale, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowMatchModal(false);
      matchModalScale.setValue(0);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surfaceSpaceDeep }]} edges={['top']}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: theme.glassBorder }]}>
        <Text variant="headline-sm" style={styles.title}>SquadUp</Text>
        <View style={styles.tabs}>
          {(['discover', 'matches', 'teams'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(t)}
            >
              <Text variant="label-sm" style={{ color: activeTab === t ? theme.primary : theme.onSurfaceVariant }}>
                {t === 'discover' ? 'Discover' : t === 'matches' ? `Matches ${matches.length}` : 'Teams'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ---- Discover Tab ---- */}
      {activeTab === 'discover' && (
        <View style={styles.deckContainer}>
          <HingeFeed 
            data={deck} 
            onLikeInteraction={handleLike} 
            onPass={handlePass} 
            onFeedEmpty={() => setDeck([])} 
          />
        </View>
      )}

      {/* ---- Matches Tab ---- */}
      {activeTab === 'matches' && (
        <ScrollView contentContainerStyle={styles.tabContent}>
          {matches.map((m) => (
            <Card key={m.id} variant="default" style={styles.matchCard}>
              <View style={styles.matchRow}>
                <Avatar displayName={m.name} size={52} showOnlineDot isOnline />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.matchHeader}>
                    <Text variant="headline-sm">{m.name}</Text>
                    <Badge label={` ${m.score}%`} variant="squad" />
                  </View>
                  <Text variant="body-sm" color="onSurfaceVariant">{m.dept}</Text>
                  <Text variant="label-sm" color="onSurfaceVariant" style={{ marginTop: 4 }} numberOfLines={1}>
                    {m.lastMsg}
                  </Text>
                </View>
              </View>
              <View style={styles.matchActions}>
                <TouchableOpacity style={[styles.msgBtn, { backgroundColor: theme.primaryContainer }]}>
                  <Text variant="label-sm" style={{ color: theme.primary }}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.msgBtn, { backgroundColor: theme.surfaceContainerHigh }]}>
                  <Text variant="label-sm" color="onSurfaceVariant">View Profile</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* ---- Teams Tab ---- */}
      {activeTab === 'teams' && (
        <View style={[styles.tabContent, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
          <Text variant="headline-sm" style={{ marginTop: 16 }}>No teams yet</Text>
          <Text variant="body-sm" color="onSurfaceVariant" style={{ marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }}>
            Match with 2+ people and form a team for a hackathon or project.
          </Text>
        </View>
      )}

      {/* ---- Match Celebration Modal ---- */}
      {showMatchModal && lastMatch && (
        <TouchableOpacity style={styles.modalBackdrop} onPress={dismissMatch} activeOpacity={1}>
          <Animated.View
            style={[styles.matchModal, { backgroundColor: theme.surfaceSpaceElevated, transform: [{ scale: matchModalScale }] }]}
          >
            <Text variant="headline-lg" style={{ textAlign: 'center', marginTop: 12 }}>You Matched!</Text>
            <Text variant="body-md" color="onSurfaceVariant" style={{ textAlign: 'center', marginTop: 6 }}>
              You and {lastMatch.displayName} both liked each other
            </Text>
            <View style={styles.matchModalAvatars}>
              <Avatar displayName="You" size={64} />
              <Ionicons name="add" size={24} color={theme.onSurfaceVariant} />
              <Avatar displayName={lastMatch.displayName} size={64} />
            </View>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: theme.primary }]}
              onPress={dismissMatch}
            >
              <Text variant="label-md" style={{ color: theme.onPrimary }}>Send First Message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismissMatch} style={{ marginTop: 12 }}>
              <Text variant="label-sm" color="onSurfaceVariant">Keep Discovering</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { paddingHorizontal: 20, paddingTop: 8, borderBottomWidth: 1 },
  title: { marginBottom: 12 },
  tabs: { flexDirection: 'row', gap: 24 },
  tab: { paddingBottom: 10 },
  deckContainer: { flex: 1 },
  emptyDeck: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  tabContent: { padding: 20, paddingBottom: 100 },
  matchCard: { padding: 16, marginBottom: 12 },
  matchRow: { flexDirection: 'row', alignItems: 'center' },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matchActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  msgBtn: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  matchModal: {
    margin: 24, borderRadius: 28, padding: 28,
    alignItems: 'center', width: SCREEN_W - 48,
  },
  matchModalAvatars: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20, marginBottom: 24 },
  modalBtn: { width: '100%', height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
