const fs = require('fs');
let code = fs.readFileSync('C:/retry/codeflux/apps/mobile/app/(tabs)/squadup.tsx', 'utf8');

// 1. Update imports
code = code.replace(
  "import { SwipeDeck } from '../../components/squad/SwipeDeck';\r\nimport { SwipeCardData } from '../../components/squad/SwipeCard';",
  "import { HingeFeed, SwipeCardData } from '../../components/squad/HingeFeed';"
);
code = code.replace(
  "import { SwipeDeck } from '../../components/squad/SwipeDeck';\nimport { SwipeCardData } from '../../components/squad/SwipeCard';",
  "import { HingeFeed, SwipeCardData } from '../../components/squad/HingeFeed';"
);

// 2. Update functions
const oldFuncs = `  const handleSwipeLeft = () => {
    // Pass logic
  };

  const handleSwipeRight = (card: SwipeCardData) => {
    // Like logic - 30% chance of a match for demo purposes
    if (Math.random() > 0.7) {
      setLastMatch(card);
      setShowMatchModal(true);
    }
  };`;

const newFuncs = `  const handleLike = (cardId: string, itemType: string, content: string, card: SwipeCardData) => {
    setDeck(prev => prev.filter(c => c.id !== cardId));
    if (Math.random() > 0.7) {
      setLastMatch(card);
      setShowMatchModal(true);
      Animated.spring(matchModalScale, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  const handlePass = (cardId: string) => {
    setDeck(prev => prev.filter(c => c.id !== cardId));
  };`;

code = code.replace(oldFuncs, newFuncs);
// try with different line endings if previous failed
code = code.replace(oldFuncs.replace(/\r\n/g, '\n'), newFuncs);
code = code.replace(oldFuncs.replace(/\n/g, '\r\n'), newFuncs);

// 3. Update component
const oldComp = `        <View style={styles.deckContainer}>
          <SwipeDeck 
            data={deck} 
            onSwipeLeft={handleSwipeLeft} 
            onSwipeRight={handleSwipeRight} 
            onDeckEmpty={() => setDeck([])} 
          />
        </View>`;

const newComp = `        <View style={styles.deckContainer}>
          <HingeFeed 
            data={deck} 
            onLikeInteraction={handleLike} 
            onPass={handlePass} 
            onFeedEmpty={() => setDeck([])} 
          />
        </View>`;

code = code.replace(oldComp, newComp);
code = code.replace(oldComp.replace(/\r\n/g, '\n'), newComp);
code = code.replace(oldComp.replace(/\n/g, '\r\n'), newComp);

fs.writeFileSync('C:/retry/codeflux/apps/mobile/app/(tabs)/squadup.tsx', code);
console.log('Successfully updated squadup.tsx');
