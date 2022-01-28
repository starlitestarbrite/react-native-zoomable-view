import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  // withSpring,
} from 'react-native-reanimated';

export const NewReactNativeZoomableView = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // where this pinch started
  const pinchOrigin = { x: useSharedValue(0), y: useSharedValue(0) };
  // the translation we had at the start of this pinch
  // const pinchOriginTranslation = { x: useSharedValue(0), y: useSharedValue(0) };
  const pinchTranslation = { x: useSharedValue(0), y: useSharedValue(0) };

  const currentPinchFocus = { x: useSharedValue(0), y: useSharedValue(0) };

  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);

  const savedPinchTranslation = { x: useSharedValue(0), y: useSharedValue(0) };
  const savedScale = useSharedValue(1);

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .maxPointers(1)
    .onBegin(() => {})
    .onUpdate((e) => {
      'worklet';
      offsetX.value = e.translationX + startX.value;
      offsetY.value = e.translationY + startY.value;
    })
    .onEnd(() => {
      'worklet';
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    });

  const zoomGesture = Gesture.Pinch()
    .onBegin((event) => {
      pinchOrigin.x.value = event.focalX;
      pinchOrigin.y.value = event.focalY;
    })
    .onUpdate((event) => {
      'worklet';

      currentPinchFocus.x.value = event.focalX;
      currentPinchFocus.y.value = event.focalY;

      // // Pinch translatiopinchOriginTranslation.x.value is the gesture start translation plus the current translation
      // const pinchMoveX = event.focalX - pinchOrigin.x.value;
      // const pinchMoveY = event.focalY - pinchOrigin.y.value;
      // Add this translation to the original pinch translation
      // pinchTranslation.x.value = savedPinchTranslation.x.value + pinchMoveX;
      // pinchTranslation.y.value = savedPinchTranslation.y.value + pinchMoveY;

      // Multiply the scale
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;
      savedPinchTranslation.x.value = pinchTranslation.x.value;
      savedPinchTranslation.y.value = pinchTranslation.y.value;
    });

  const [layout, setLayout] = useState({ height: 10, width: 10 });

  const animatedStyles = useAnimatedStyle(() => {
    const { width, height } = layout;
    const pinchX = pinchTranslation.x.value / width;
    const pinchY = pinchTranslation.y.value / height;

    const offsetX = width - (width * scale.value) / 2;

    return {
      width: '100%',
      height: '100%',
      transform: [
        // pinch
        { translateX: width * (pinchX - 0.5) },
        { translateY: width * (pinchY - 0.5) },

        { scale: scale.value },
        { translateX: offsetX },
        { translateY: pinchY * height },

        { translateY: width * (0.5 - pinchY) },
        { translateX: width * (0.5 - pinchX) },

        // // pinch tranlsation
        // { translateX: pinchTranslation.x.value / scale.value },
        // { translateY: pinchTranslation.y.value / scale.value },

        // // drag
        // { translateX: offsetX.value / scale.value },
        // { translateY: offsetY.value / scale.value },
      ],
    };
  }, [pinchOrigin, pinchTranslation, layout]);

  return (
    <GestureDetector gesture={Gesture.Simultaneous(zoomGesture, dragGesture)}>
      <Animated.View
        style={styles.contentWrapper}
        onLayout={(e) => {
          setLayout(e.nativeEvent.layout);
        }}
      >
        <Animated.View style={animatedStyles}>{children}</Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    width: '100%',
    height: '100%',
  },
});
