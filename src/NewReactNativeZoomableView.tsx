import React, { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { pinchTranslate, pinchDragTranslate } from './helper/pinchTranslate';

export const NewReactNativeZoomableView = ({
  children,
  scaleValue,
}: {
  children: React.ReactNode;
  scaleValue: SharedValue<number>;
}) => {
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

  const updateProps = ({ scale }) => {
    'worklet';

    if (scaleValue) scaleValue.value = scale;
  };

  const pinchGesture = Gesture.Pinch()
    .onBegin((event) => {
      'worklet';
      pinchStart.x.value = event.focalX;
      pinchStart.y.value = event.focalY;
    })
    .onUpdate((event) => {
      'worklet';
      eventScale.value = event.scale;

      updateProps({
        scale: last.scale.value * event.scale,
      });

      pinchDrag.x.value = event.focalX - pinchStart.x.value;
      pinchDrag.y.value = event.focalY - pinchStart.y.value;
    })
    .onEnd(() => {
      'worklet';
      const lastScale = last.scale.value;
      const scale = lastScale * eventScale.value;
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

    const lastScale = last.scale.value;
    const scale = last.scale.value * eventScale.value;

    // Zoom offset
    const { x, y } = pinchTranslate(last, scale, pinchStart, layout);

    // Pinch drag offset comes after the scale
    const { x: dragX, y: dragY } = pinchDragTranslate(
      lastPinchDrag,
      pinchDrag,
      lastScale,
      eventScale
    );

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale },
        { translateX: dragX },
        { translateY: dragY },
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
