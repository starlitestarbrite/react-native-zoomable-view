import React, { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export const NewReactNativeZoomableView = ({ children }) => {
  const [layout, setLayout] = useState({ height: 0, width: 0 });

  const pinchStart = {
    x: useSharedValue(0),
    y: useSharedValue(0),
  };
  const eventScale = useSharedValue(1);

  const last = {
    x: useSharedValue(0),
    y: useSharedValue(0),
    scale: useSharedValue(1),
  };

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
    });

  const animatedStyles = useAnimatedStyle(() => {
    if (!layout.width || !layout.height) return {};

    const lastScale = last.scale.value;
    const newScale = lastScale * eventScale.value;

    const newX = calcZoomCenter(
      last.x.value,
      lastScale,
      newScale,
      pinchStart.x.value,
      layout.width
    );

    const newY = calcZoomCenter(
      last.y.value,
      lastScale,
      newScale,
      pinchStart.y.value,
      layout.height
    );

    return {
      transform: [
        { translateX: newX },
        { translateY: newY },
        { scale: newScale },
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
          {children}
          <Rect top={'0%'} height={'25%'} color={'red'} />
          <Rect top={'25%'} height={'25%'} color={'green'} />
          <Rect top={'50%'} height={'25%'} color={'blue'} />
          <Rect top={'75%'} height={'25%'} color={'wheat'} />
        </Animated.View>
        <Rect top={'0%'} height={'25%'} color={'red'} />
        <Rect top={'25%'} height={'25%'} color={'green'} />
        <Rect top={'50%'} height={'25%'} color={'blue'} />
        <Rect top={'75%'} height={'25%'} color={'wheat'} />
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

const Rect = ({
  top,
  height,
  color,
}: {
  top: number | string;
  height: number | string;
  color: string;
}) => (
  <View
    style={{
      position: 'absolute',
      top: top,
      left: 0,
      width: 300,
      height: height,
      backgroundColor: color,
    }}
  />
);
