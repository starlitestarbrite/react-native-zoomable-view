import React, { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export const NewReactNativeZoomableView = ({ children }) => {
  const [layout, setLayout] = useState({ height: 0, width: 0 });

  const pinchStart = { x: useSharedValue(0) };
  const eventScale = useSharedValue(1);

  const last = {
    x: useSharedValue(0),
    scale: useSharedValue(1),
    width: useSharedValue(300),
  };

  const zoomGesture = Gesture.Pinch()
    .onBegin((event) => {
      'worklet';
      // Get the point where we started pinching
      pinchStart.x.value = event.focalX;
    })
    .onUpdate((event) => {
      'worklet';
      eventScale.value = event.scale;
    })
    .onEnd(() => {
      'worklet';
      const lastScale = last.scale.value;
      const newScale = lastScale * eventScale.value;

      const lastWidth = last.width.value;
      const newWidth = layout.width * newScale;

      const origWidth = layout.width;
      const lastX = last.x.value;
      const pinchX = pinchStart.x.value;
      const pinchRelX = pinchX - lastX - origWidth / 2;
      const pinchRatio = pinchRelX / lastWidth;

      last.scale.value = newScale;
      last.width.value = newWidth;
      last.x.value =
        lastX + lastWidth * pinchRatio + origWidth * -pinchRatio * newScale;
      eventScale.value = 1;
    });

  const animatedStyles = useAnimatedStyle(() => {
    let { width: origWidth } = layout;
    if (!origWidth) return {};

    const lastX = last.x.value;
    const lastScale = last.scale.value;
    const lastWidth = last.width.value;
    const pinchX = pinchStart.x.value;
    const pinchRelX = pinchX - lastX - origWidth / 2;
    const pinchRatio = pinchRelX / lastWidth;

    return {
      transform: [
        { translateX: lastX },
        { translateX: lastWidth * pinchRatio },
        { scale: lastScale * eventScale.value },
        { translateX: origWidth * -pinchRatio },
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
