import React, { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { pinchTranslate } from './helper/pinchTranslate';
import { pinchDragTranslate } from './helper/pinchDragTranslate';
import { clamp } from './helper/clamp';
import { ReactNativeZoomableViewProps } from './typings';

// A new implementaiton of ReactNativeZoomableView
// using react-native-gesture-handler and react-native-reanimated
// for better performance and much shorter code.

// TODO:
// - One-finger drag handler needs to be added to the animated value calculation

export const ReactNativeZoomableView = ({
  children,
  scaleValue,
  initialZoom = 1,
  maxZoom = 1.5,
  minZoom = 0.5,
  zoomEnabled = true,
}: ReactNativeZoomableViewProps) => {
  const [layout, setLayout] = useState({ height: 0, width: 0 });
  const pinchStart = { x: useSharedValue(0), y: useSharedValue(0) };
  const eventScale = useSharedValue(1);
  const last = {
    x: useSharedValue(0),
    y: useSharedValue(0),
    scale: useSharedValue(initialZoom),
  };
  const pinchDrag = { x: useSharedValue(0), y: useSharedValue(0) };
  const lastPinchDrag = { x: useSharedValue(0), y: useSharedValue(0) };

  const updateProps = ({ scale }) => {
    'worklet';
    if (scaleValue) scaleValue.value = scale;
  };

  const pinchGesture = Gesture.Pinch()
    .enabled(zoomEnabled)
    .onBegin((event) => {
      'worklet';
      pinchStart.x.value = event.focalX;
      pinchStart.y.value = event.focalY;
    })
    .onUpdate((event) => {
      'worklet';
      eventScale.value = clamp(event.scale, minZoom, maxZoom);
      // Max/min values
      let scale = clamp(last.scale.value * eventScale.value, minZoom, maxZoom);
      updateProps({ scale });
      pinchDrag.x.value = event.focalX - pinchStart.x.value;
      pinchDrag.y.value = event.focalY - pinchStart.y.value;
    })
    .onEnd(() => {
      'worklet';
      const lastScale = last.scale.value;
      let scale = clamp(lastScale * eventScale.value, minZoom, maxZoom);
      const { x, y } = pinchTranslate(last, scale, pinchStart, layout);
      last.x.value = x;
      last.y.value = y;
      last.scale.value = scale;
      updateProps({ scale });
      eventScale.value = 1;
      lastPinchDrag.x.value += pinchDrag.x.value / scale;
      lastPinchDrag.y.value += pinchDrag.y.value / scale;
      pinchDrag.x.value = 0;
      pinchDrag.y.value = 0;
    });

  const dragOffset = { x: useSharedValue(0), y: useSharedValue(0) };
  const dragStart = { x: useSharedValue(0), y: useSharedValue(0) };
  const dragGesture = Gesture.Pan()
    .enabled(zoomEnabled)
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

  const animatedStyles = useAnimatedStyle(() => {
    if (!layout.width || !layout.height) return {};

    let lastScale = clamp(last.scale.value, minZoom, maxZoom);
    let scale = clamp(last.scale.value * eventScale.value, minZoom, maxZoom);

    // Scale offset
    const { x: pinchOffsetTranslateX, y: pinchOffsetTranslateY } =
      pinchTranslate(last, scale, pinchStart, layout);

    // Pinch drag offset comes after the scale offset
    const { x: pinchPanX, y: pinchPanY } = pinchDragTranslate(
      lastPinchDrag,
      pinchDrag,
      lastScale,
      eventScale

      // TODO: we need to factor the single-finger drag translate
      // into this calculation somehow.
      // lastDragOffset,
      // dragOffset,
    );

    return {
      transform: [
        { translateX: pinchOffsetTranslateX },
        { translateY: pinchOffsetTranslateY },
        { scale },
        { translateX: pinchPanX },
        { translateY: pinchPanY },
      ],
    };
  });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, dragGesture)}>
      <Animated.View onLayout={(e) => setLayout(e.nativeEvent.layout)}>
        <Animated.View style={[animatedStyles]}>{children}</Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
