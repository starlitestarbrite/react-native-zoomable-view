import { SharedValue } from 'react-native-reanimated';

// This calculates the drag offset from the pinch (todo: and pan) gestures
export const pinchDragTranslate = (
  lastPinchDrag: { x: SharedValue<number>; y: SharedValue<number> },
  pinchDrag: { x: SharedValue<number>; y: SharedValue<number> },
  lastScale: number,
  eventScale: SharedValue<number>
  // TODO: Implement
  // lastDrag: { x: SharedValue<number>; y: SharedValue<number> },
  // drag: { x: SharedValue<number>; y: SharedValue<number> },
) => {
  'worklet';

  const scale = lastScale * eventScale.value;

  return {
    x: lastPinchDrag.x.value + pinchDrag.x.value / scale,
    y: lastPinchDrag.y.value + pinchDrag.y.value / scale,
  };
};
