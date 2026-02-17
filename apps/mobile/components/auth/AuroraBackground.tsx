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
      }),
      -1,
      true,
    );
  }, [duration, progress]);

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
      className="absolute overflow-hidden"
      style={[
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
    <View className="absolute inset-0" pointerEvents="none">
      <LinearGradient
        colors={['#212529', '#343A40', '#495057']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Warm coral orb */}
      <AnimatedOrb
        size={320}
        colors={['rgba(255, 107, 107, 0.4)', 'rgba(255, 204, 204, 0.3)']}
        initialX={-110}
        initialY={-60}
      />
      {/* Soft purple orb */}
      <AnimatedOrb
        size={260}
        colors={['rgba(155, 126, 189, 0.35)', 'rgba(195, 183, 208, 0.4)']}
        initialX={140}
        initialY={-140}
        delay={500}
        duration={8200}
      />
      {/* Warm yellow orb */}
      <AnimatedOrb
        size={220}
        colors={['rgba(255, 217, 61, 0.3)', 'rgba(255, 249, 194, 0.35)']}
        initialX={-20}
        initialY={280}
        delay={1000}
        duration={9000}
      />

      <View className="absolute inset-0 bg-neutral-900/40" />
    </View>
  );
}
