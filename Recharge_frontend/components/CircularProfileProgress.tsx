import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProfileProgressProps {
  size?: number;
  strokeWidth?: number;
  percentage: number;
  children: React.ReactNode;
  progressColor?: string;
  backgroundColor?: string;
}

export const CircularProfileProgress: React.FC<CircularProfileProgressProps> = ({
  size = 50,
  strokeWidth = 3,
  percentage = 0,
  children,
  progressColor = "#0D47A1",
  backgroundColor = "rgba(13, 71, 161, 0.1)",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const animatedValue = useRef(new Animated.Value(percentage)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: percentage,
      tension: 20,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  svg: {
    position: "absolute",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
});
