import { useRef } from 'react';
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { spacing, useTheme } from '../lib/theme';

const STEP = 5;
const MAX = 180;
const ITEM_HEIGHT = 40;
const VISIBLE = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE;
const PAD = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;
const OPTIONS = Array.from({ length: MAX / STEP + 1 }, (_, index) => index * STEP);

type DurationWheelProps = {
  value: number;
  onChange: (value: number) => void;
};

function labelFor(minutes: number) {
  return minutes === 0 ? 'None' : `${minutes} min`;
}

export function DurationWheel({ value, onChange }: DurationWheelProps) {
  const colors = useTheme();
  const initialOffset = useRef(Math.round(value / STEP) * ITEM_HEIGHT).current;
  const scrollY = useRef(new Animated.Value(initialOffset)).current;

  const handleEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.max(
      0,
      Math.min(OPTIONS.length - 1, Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT)),
    );
    onChange(OPTIONS[index]);
  };

  return (
    <View style={styles.wheel}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingVertical: PAD }}
        contentOffset={{ x: 0, y: initialOffset }}
        decelerationRate="fast"
        onMomentumScrollEnd={handleEnd}
        onScrollEndDrag={handleEnd}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
      >
        {OPTIONS.map((minutes, index) => {
          const inputRange = [
            (index - 2) * ITEM_HEIGHT,
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
            (index + 2) * ITEM_HEIGHT,
          ];
          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.25, 0.5, 1, 0.5, 0.25],
            extrapolate: 'clamp',
          });
          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.8, 0.9, 1, 0.9, 0.8],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View key={minutes} style={[styles.item, { opacity, transform: [{ scale }] }]}>
              <Text style={[styles.itemText, { color: colors.ink }]}>{labelFor(minutes)}</Text>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
      <View
        pointerEvents="none"
        style={[styles.band, { borderBottomColor: colors.line, borderTopColor: colors.line }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: ITEM_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
    top: PAD,
  },
  item: {
    alignItems: 'center',
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 19,
    fontWeight: '600',
  },
  wheel: {
    alignSelf: 'stretch',
    height: WHEEL_HEIGHT,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
});
