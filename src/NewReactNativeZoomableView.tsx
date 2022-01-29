import React, { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export const NewReactNativeZoomableView = ({ children }) => {
  const [layout, setLayout] = useState({ height: 0, width: 0 });
  const pinchStart = { x: useSharedValue(0), y: useSharedValue(0) };
  const eventScale = useSharedValue(1);
  const last = {
    x: useSharedValue(0),
    y: useSharedValue(0),
    scale: useSharedValue(1),
  };
  const pinchDrag = { x: useSharedValue(0), y: useSharedValue(0) };
  const lastPinchDrag = { x: useSharedValue(0), y: useSharedValue(0) };

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

  const zoomGesture = Gesture.Pinch()
    .onBegin((event) => {
      'worklet';
      pinchStart.x.value = event.focalX;
      pinchStart.y.value = event.focalY;
    })
    .onUpdate((event) => {
      'worklet';
      eventScale.value = event.scale;
      pinchDrag.x.value = event.focalX - pinchStart.x.value;
      pinchDrag.y.value = event.focalY - pinchStart.y.value;
    })
    .onEnd(() => {
      'worklet';
      const lastScale = last.scale.value;
      const newScale = lastScale * eventScale.value;

      last.x.value = calcZoomCenter(
        last.x.value,
        lastScale,
        newScale,
        pinchStart.x.value,
        layout.width
      );

      last.y.value = calcZoomCenter(
        last.y.value,
        lastScale,
        newScale,
        pinchStart.y.value,
        layout.height
      );

      last.scale.value = newScale;
      eventScale.value = 1;
      lastPinchDrag.x.value += pinchDrag.x.value / newScale;
      lastPinchDrag.y.value += pinchDrag.y.value / newScale;
      pinchDrag.x.value = 0;
      pinchDrag.y.value = 0;
    });

  const animatedStyles = useAnimatedStyle(() => {
    let { width: origWidth, height: origHeight } = layout;
    if (!origWidth) return {};

    const lastScale = last.scale.value;
    const newScale = lastScale * eventScale.value;

    const newX = calcZoomCenter(
      last.x.value,
      lastScale,
      newScale,
      pinchStart.x.value,
      origWidth
    );

    const newY = calcZoomCenter(
      last.y.value,
      lastScale,
      newScale,
      pinchStart.y.value,
      origHeight
    );

    return {
      transform: [
        { translateX: newX },
        { translateY: newY },
        { scale: newScale },
        {
          translateX:
            lastPinchDrag.x.value +
            pinchDrag.x.value / (lastScale * eventScale.value),
        },
        {
          translateY:
            lastPinchDrag.y.value +
            pinchDrag.y.value / (lastScale * eventScale.value),
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(zoomGesture, dragGesture)}>
      <Animated.View onLayout={(e) => setLayout(e.nativeEvent.layout)}>
        <Animated.View style={[animatedStyles]}>{children}</Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const calcZoomCenter = (
  lastX: number,
  lastScale: number,
  newScale: number,
  pinchX: number,
  origWidth: number
) => {
  'worklet';
  const lastWidth = origWidth * lastScale;
  const pinchRelX = pinchX - lastX - origWidth / 2;
  const pinchRatio = pinchRelX / lastWidth;

  return lastX + lastWidth * pinchRatio + origWidth * -pinchRatio * newScale;
};
