import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type OrbProps = {
  delay?: number;
  duration?: number;
  size: number;
  colors: [string, string];
  initialX: number;
  initialY: number;
};

const AnimatedOrb = ({
  delay = 0,
  duration = 9000,
  size,
  colors,
  initialX,
  initialY,
}: OrbProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.inOut(Easing.quad),
        delay,
      }),
      -1,
      true,
    );
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: initialX + progress.value * 30 },
      { translateY: initialY + progress.value * -25 },
      { scale: 0.9 + progress.value * 0.2 },
    ],
    opacity: 0.25 + progress.value * 0.35,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orb,
        { width: size, height: size, borderRadius: size / 2 },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <AnimatedBlurView intensity={80} style={StyleSheet.absoluteFillObject} />
    </Animated.View>
  );
};

export function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#010205', '#020617', '#031227']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <AnimatedOrb
        size={320}
        colors={['rgba(37, 99, 235, 0.65)', 'rgba(147, 197, 253, 0.45)']}
        initialX={-110}
        initialY={-60}
      />
      <AnimatedOrb
        size={260}
        colors={['rgba(14, 165, 233, 0.55)', 'rgba(59, 130, 246, 0.6)']}
        initialX={140}
        initialY={-140}
        delay={500}
        duration={8200}
      />
      <AnimatedOrb
        size={220}
        colors={['rgba(2, 132, 199, 0.5)', 'rgba(125, 211, 252, 0.55)']}
        initialX={-20}
        initialY={280}
        delay={1000}
        duration={9000}
      />

      <View style={styles.noise} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    overflow: 'hidden',
  },
  noise: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1, 3, 10, 0.4)',
  },
});
