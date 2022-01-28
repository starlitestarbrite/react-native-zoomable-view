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

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // TODO: Save previous transform
  // const savedPinchTranslate = { x: useSharedValue(0), y: useSharedValue(0) };
  const translateOrigin = { x: useSharedValue(0), y: useSharedValue(0) };
  const previousTranslateOrigin = {
    x: useSharedValue(0),
    y: useSharedValue(0),
  };
  const offsetFromFocal = { x: useSharedValue(0), y: useSharedValue(0) };
  const translation = { x: useSharedValue(0), y: useSharedValue(0) };
  const origin = { x: useSharedValue(0), y: useSharedValue(0) };

  const zoomGesture = Gesture.Pinch()
    .onBegin((e) => {
      'worklet';

      // Get the point where we started pinching
      // pinchStart.x.value = event.focalX;
      // pinchStart.y.value = event.focalY;

      // TODO: add previous transform
      // pinchStart.x.value +=
      // pinchStart.y.value +=

      origin.x.value = e.focalX;
      origin.y.value = e.focalY;

      offsetFromFocal.x.value = origin.x.value;
      offsetFromFocal.y.value = origin.y.value;
      previousTranslateOrigin.x.value = origin.x.value;
      previousTranslateOrigin.y.value = origin.y.value;
    })
    .onUpdate((e) => {
      'worklet';

      pinchPosition.x.value = e.focalX - pinchStart.x.value;
      pinchPosition.y.value = e.focalY - pinchStart.y.value;

      translateOrigin.x.value =
        previousTranslateOrigin.x.value + e.focalX - offsetFromFocal.x.value;
      translateOrigin.y.value =
        previousTranslateOrigin.y.value + e.focalY - offsetFromFocal.y.value;

      translation.x.value = translateOrigin.x.value - origin.x.value;
      translation.y.value = translateOrigin.y.value - origin.y.value;

      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      'worklet';

      // savedScale.value = scale.value;

      // TODO: Save previous transform
      // savedPinchTranslate.x.value =
      // savedPinchTranslate.y.value =
    });

  const animatedStyles = useAnimatedStyle(() => {
    // const { width, height } = layout;
    // const pinchX = pinchStart.x.value / width;
    // const pinchY = pinchStart.y.value / height;

    const left = -layout.width / 2;
    const top = -layout.height / 2;
    const xTransform = left + pinchPosition.x.value;
    const yTransform = top + pinchPosition.y.value;

    return {
      transform: [
        { translateX: translation.x.value },
        {
          translateY: translation.y.value,
        },

        // { translateX: pinchPosition.x.value },
        // { translateY: pinchPosition.y.value },
        // { translateX: dragOffset.x.value },
        // { translateY: dragOffset.y.value },

        // // Reset the transform before translating and scaling
        { translateX: xTransform },
        { translateY: yTransform },

        { scale: scale.value },

        // // Reapply the trasnform after translating and scaling
        { translateX: -xTransform },
        { translateY: -yTransform },
      ],
    };
  }, [pinchStart, pinchPosition, layout]);

  return (
    <GestureDetector gesture={Gesture.Simultaneous(zoomGesture, dragGesture)}>
      <Animated.View onLayout={(e) => setLayout(e.nativeEvent.layout)}>
        <Animated.View style={animatedStyles}>{children}</Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
