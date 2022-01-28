import React, { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export const NewReactNativeZoomableView = ({
  children,
  // contentWidth,
  // contentHeight,
}) => {
  const [layout, setLayout] = useState({ height: 10, width: 10 });

  const dragOffset = { x: useSharedValue(0), y: useSharedValue(0) };
  const dragStart = { x: useSharedValue(0), y: useSharedValue(0) };
  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .maxPointers(1)
    .onBegin(() => {})
    .onUpdate((e) => {
      'worklet';
      dragOffset.x.value = e.translationX + dragStart.x.value;
      dragOffset.y.value = e.translationY + dragStart.y.value;
    })
    .onEnd(() => {
      'worklet';
      dragStart.x.value = dragOffset.x.value;
      dragStart.y.value = dragOffset.y.value;
    });

  const pinchStart = { x: useSharedValue(0), y: useSharedValue(0) };
  const pinchPosition = { x: useSharedValue(0), y: useSharedValue(0) };
  const pinchTransform = { x: useSharedValue(0), y: useSharedValue(0) };
  const scale = useSharedValue(1);

  const savedScale = useSharedValue(1);
  const savedPinchTransform = { x: useSharedValue(0), y: useSharedValue(0) };

  const zoomGesture = Gesture.Pinch()
    .onBegin((event) => {
      'worklet';

      // Get the point where we started pinching
      pinchStart.x.value = event.focalX;
      pinchStart.y.value = event.focalY;

      // TODO: add previous transform here
    })
    .onUpdate((event) => {
      'worklet';

      pinchPosition.x.value = event.focalX;
      pinchPosition.y.value = event.focalY;

      pinchTransform.x.value = event.focalX - pinchStart.x.value;
      pinchTransform.y.value = event.focalY - pinchStart.y.value;

      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      'worklet';

      savedScale.value = scale.value;
      // Save previous transform
      // TODO: add it to start of next transform
      savedPinchTransform.x.value = pinchTransform.x.value;
      savedPinchTransform.y.value = pinchTransform.y.value;
    });

  const animatedStyles = useAnimatedStyle(() => {
    const { width, height } = layout;
    const pinchX = pinchStart.x.value / width;
    const pinchY = pinchStart.y.value / height;

    return {
      transform: [
        { translateX: dragOffset.x.value / scale.value },
        { translateY: dragOffset.y.value / scale.value },

        // Reset the transform before translating and scaling
        { translateX: width * (pinchX - 0.5) },
        { translateY: height * (pinchY - 0.5) },

        { scale: scale.value },
        { translateX: pinchTransform.x.value / scale.value },
        { translateY: pinchTransform.y.value / scale.value },

        // Reapply the trasnform after translating and scaling
        { translateY: height * (0.5 - pinchY) },
        { translateX: width * (0.5 - pinchX) },
      ],
    };
  }, [pinchStart, pinchTransform, layout]);

  return (
    <GestureDetector gesture={Gesture.Simultaneous(zoomGesture, dragGesture)}>
      <Animated.View onLayout={(e) => setLayout(e.nativeEvent.layout)}>
        <Animated.View style={animatedStyles}>{children}</Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
