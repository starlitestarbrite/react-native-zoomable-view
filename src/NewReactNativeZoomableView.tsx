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
      const oldScale = last.scale.value;
      const newScale = oldScale * eventScale.value;

      const oldWidth = layout.width * oldScale;
      const newWidth = layout.width * newScale;

      last.scale.value = newScale;
      last.width.value = newWidth;
      last.x.value = last.x.value - oldWidth / 2 + newWidth / 2;
      eventScale.value = 1;
    });

  const animatedStyles = useAnimatedStyle(() => {
    let { width } = layout;
    if (!width) return {};

    const lastX = last.x.value;
    const lastScale = last.scale.value;
    const scaledWidth = width * lastScale;

    return {
      transform: [
        { translateX: lastX },
        { translateX: scaledWidth * (-1 / 2) },
        { scale: lastScale * eventScale.value },
        { translateX: width * (1 / 2) },
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
