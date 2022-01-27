import React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export const NewReactNativeZoomableView = ({
  children,
}: // width,
// height,
{
  children: React.ReactNode;
  // width: number;
  // height: number;
}) => {
  const pinchOrigin = { x: useSharedValue(0), y: useSharedValue(0) };
  const pinchTranslation = { x: useSharedValue(0), y: useSharedValue(0) };

  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // console.log({ width, height });

  // const rotation = useSharedValue(0);
  // const savedRotation = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    // .maxPointers(1)
    .onBegin(() => {
      // startX.value = e.x;
      // startY.value = e.y;
    })
    .onUpdate((e) => {
      'worklet';
      offsetX.value = e.translationX + startX.value;
      offsetY.value = e.translationY + startY.value;
    })
    .onEnd(() => {
      'worklet';
      // offsetX.value = withSpring(0, {
      //   stiffness: 60,
      //   overshootClamping: true,
      // });
      // offsetY.value = withSpring(0, {
      //   stiffness: 60,
      //   overshootClamping: true,
      // });
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    });

  const zoomGesture = Gesture.Pinch()
    .onBegin((event) => {
      pinchOrigin.x.value = event.focalX;
      pinchOrigin.y.value = event.focalY;
    })
    .onUpdate((event) => {
      'worklet';
      pinchTranslation.x.value = event.focalX - pinchOrigin.x.value;
      pinchTranslation.y.value = event.focalY - pinchOrigin.y.value;
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      'worklet';
      savedScale.value = scale.value;

      // scale.value = withSpring(event.scale, {
      //   stiffness: 100,
      //   overshootClamping: true,
      // });
    });

  const animatedStyles = useAnimatedStyle(() => {
    let translateX = offsetX.value + pinchTranslation.x.value;
    let translateY = offsetY.value + pinchTranslation.y.value;

    return {
      width: '100%',
      height: '100%',
      transform: [{ translateX }, { translateY }, { scale: scale.value }],
    };
  }, [pinchOrigin, pinchTranslation]);

  return (
    <GestureDetector gesture={Gesture.Simultaneous(zoomGesture, dragGesture)}>
      <Animated.View style={styles.contentWrapper}>
        <Animated.View style={animatedStyles}>{children}</Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    width: '100%',
    height: '100%',
    // backgroundColor: 'green',
  },
});
