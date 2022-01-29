import React, { useState } from 'react';
import { View } from 'react-native';
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
    width: useSharedValue(300),
    height: useSharedValue(500),
  };

  const pinchDrag = { x: useSharedValue(0), y: useSharedValue(0) };
  const lastPinchDrag = { x: useSharedValue(0), y: useSharedValue(0) };

  const zoomGesture = Gesture.Pinch()
    .onBegin((event) => {
      'worklet';
      // Get the point where we started pinching
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

      const lastWidth = last.width.value;
      const lastHeight = last.height.value;
      const newWidth = layout.width * newScale;
      const newHeight = layout.height * newScale;

      const origWidth = layout.width;
      const lastX = last.x.value;
      const lastY = last.y.value;
      const pinchX = pinchStart.x.value;
      const pinchRelX = pinchX - lastX - origWidth / 2;
      const pinchRatio = pinchRelX / lastWidth;

      last.scale.value = newScale;
      last.width.value = newWidth;
      last.height.value = newHeight;
      last.x.value =
        lastX + lastWidth * pinchRatio + origWidth * -pinchRatio * newScale;
      last.y.value =
        lastY + lastHeight * pinchRatio + origWidth * -pinchRatio * newScale;
      eventScale.value = 1;

      lastPinchDrag.x.value += pinchDrag.x.value / newScale;
      lastPinchDrag.y.value += pinchDrag.y.value / newScale;
      pinchDrag.x.value = 0;
      pinchDrag.y.value = 0;
    });

  const animatedStyles = useAnimatedStyle(() => {
    let { width: origWidth, height: origHeight } = layout;
    if (!origWidth) return {};

    const lastX = last.x.value;
    const lastY = last.x.value;
    const lastScale = last.scale.value;
    const lastWidth = last.width.value;
    const lastHeight = last.height.value;
    const pinchX = pinchStart.x.value;
    const pinchY = pinchStart.y.value;
    const pinchRelX = pinchX - lastX - origWidth / 2;
    const pinchRatio = pinchRelX / lastWidth;

    const pinchRelY = pinchY - lastY - origHeight / 2;
    const pinchRatioY = pinchRelY / lastHeight;

    return {
      transform: [
        { translateX: lastX },
        { translateX: lastWidth * pinchRatio },
        { translateY: lastY },
        // { translateY: lastHeight * pinchRatio },
        { scale: lastScale * eventScale.value },
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
        { translateX: origWidth * -pinchRatio },
        // { translateY: origWidth * -pinchRatioY },
      ],
    };
  });

  const debugAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: pinchStart.x.value - 10 }],
    };
  });

  return (
    <GestureDetector gesture={Gesture.Simultaneous(zoomGesture)}>
      <Animated.View onLayout={(e) => setLayout(e.nativeEvent.layout)}>
        <Animated.View style={[animatedStyles, { opacity: 0.5 }]}>
          {/* {children} */}
          <View style={{ width: '100%', height: '100%' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) =>
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((y) => (
                <View
                  key={`${x}-${y}`}
                  style={{
                    left: x * 30 - 10,
                    top: y * 30 - 10,
                    width: 10,
                    height: 10,
                    backgroundColor: 'red',
                    position: 'absolute',
                  }}
                />
              ))
            )}
          </View>
        </Animated.View>
        <Animated.View
          style={[
            debugAnimatedStyles,
            {
              width: 20,
              height: 20,
              borderRadius: 20,
              backgroundColor: 'yellow',
              position: 'absolute',
            },
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const Rect = ({
  left,
  width,
  color,
}: {
  left: number;
  width: number;
  color: string;
}) => (
  <View
    style={{
      position: 'absolute',
      left: left,
      top: 0,
      height: 490,
      width: width,
      backgroundColor: color,
    }}
  />
);
