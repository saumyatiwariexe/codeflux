import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Filter, FeGaussianBlur, FeComposite, Circle, Path, Rect } from 'react-native-svg';
import { View } from 'react-native';

export function PioneerBadgeIcon({ size = 72 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="bg-grad-pioneer" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6C63FF" />
            <Stop offset="100%" stopColor="#43E97B" />
          </LinearGradient>
          <LinearGradient id="glass-pioneer" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="45" fill="none" stroke="url(#bg-grad-pioneer)" strokeWidth="4" />
        <Circle cx="50" cy="50" r="42" fill="#121324" />
        <Circle cx="50" cy="50" r="38" fill="url(#glass-pioneer)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />
        <Path 
          d="M50 25 L55.5 39.5 L71 40 L58.5 50.5 L62.5 66 L50 58 L37.5 66 L41.5 50.5 L29 40 L44.5 39.5 Z" 
          fill="url(#bg-grad-pioneer)" 
          stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" 
        />
      </Svg>
    </View>
  );
}

export function SocialBadgeIcon({ size = 72 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="bg-grad-social" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B6B" />
            <Stop offset="100%" stopColor="#FF8E53" />
          </LinearGradient>
          <LinearGradient id="glass-social" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        <Circle cx="50" cy="50" r="45" fill="none" stroke="url(#bg-grad-social)" strokeWidth="4" />
        <Circle cx="50" cy="50" r="42" fill="#121324" />
        <Circle cx="50" cy="50" r="38" fill="url(#glass-social)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />
        <Circle cx="40" cy="40" r="8" fill="none" stroke="url(#bg-grad-social)" strokeWidth="3" />
        <Path d="M25 65 Q40 50 55 65" fill="none" stroke="url(#bg-grad-social)" strokeWidth="3" strokeLinecap="round" />
        <Circle cx="65" cy="45" r="6" fill="none" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
        <Path d="M50 70 Q65 60 80 70" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
      </Svg>
    </View>
  );
}

export function QuestExplorationIcon({ size = 72 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg viewBox="0 0 100 100" width={size} height={size}>
        <Defs>
          <LinearGradient id="bg-grad-quest" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#43E97B" />
            <Stop offset="100%" stopColor="#38F9D7" />
          </LinearGradient>
          <LinearGradient id="glass-quest" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        <Rect x="5" y="5" width="90" height="90" rx="20" fill="none" stroke="url(#bg-grad-quest)" strokeWidth="3" />
        <Rect x="8" y="8" width="84" height="84" rx="16" fill="#0B0C14" />
        <Rect x="12" y="12" width="76" height="76" rx="12" fill="url(#glass-quest)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />
        <Path d="M50 25 C38 25 30 33 30 43 C30 58 50 75 50 75 C50 75 70 58 70 43 C70 33 62 25 50 25 Z" fill="url(#bg-grad-quest)" />
        <Circle cx="50" cy="42" r="7" fill="#0B0C14" />
        <Path d="M25 60 C30 75 40 85 50 75" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4,4" opacity="0.6" />
      </Svg>
    </View>
  );
}
