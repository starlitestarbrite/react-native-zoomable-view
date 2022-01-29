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
    // width: useSharedValue(300),
    // height: useSharedValue(500),
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
      last.x.value = calcNewCenterOffsetAfterZoom(
        last.x.value,
        lastScale,
        newScale,
        pinchStart.x.value,
        layout.width
      );
      last.y.value = calcNewCenterOffsetAfterZoom(
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

    const newX = calcNewCenterOffsetAfterZoom(
      last.x.value,
      lastScale,
      newScale,
      pinchStart.x.value,
      origWidth
    );

    const newY = calcNewCenterOffsetAfterZoom(
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
      </Animated.View>
    </GestureDetector>
  );
};

const calcNewCenterOffsetAfterZoom = (
  lastCenterOffset: number, // x or y
  lastScale: number,
  newScale: number,
  // x or y
  // The focal point of the pinch gesture
  pinchFocalPoint: number,
  origSize: number // width or height
) => {
  'worklet';
  const lastSize = origSize * lastScale;
  const newSize = origSize * newScale;
  const lastCenterPosition = lastCenterOffset + origSize / 2;
  const pinchAndCenterDistance = pinchFocalPoint - lastCenterPosition;
  const pinchDistanceRatio = pinchAndCenterDistance / lastSize;

  return (
    // start out with the previous offset
    lastCenterOffset +
    // since react native zooms from the center of the object,
    // we move the this center to the pinch position
    lastSize * pinchDistanceRatio +
    // at the pinch position, we apply scale to get newSize,
    // then we move the zoom center back the same distance ratio,
    // but since the newSize is now scaled, the ratio brings us to the new center offset
    newSize * -pinchDistanceRatio
    // To make it easy to understand this math,
    // try visualizing with lastCenterOffset = 0 and pinchFocalPoint = 0 first
    // and start out with one of the 2 axes
  );
};
