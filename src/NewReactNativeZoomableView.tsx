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
        pinchStart.x.value,
        layout.width
      );
      last.scale.value = newScale;
      eventScale.value = 1;
    });

  const animatedStyles = useAnimatedStyle(() => {
    let { width: origWidth } = layout;
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
      origWidth
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
          <Rect left={0} width={75} color={'red'} />
          <Rect left={75} width={75} color={'green'} />
          <Rect left={150} width={75} color={'blue'} />
          <Rect left={225} width={75} color={'wheat'} />
        </Animated.View>
        <Rect left={0} width={75} color={'red'} />
        <Rect left={75} width={75} color={'green'} />
        <Rect left={150} width={75} color={'blue'} />
        <Rect left={225} width={75} color={'wheat'} />
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
