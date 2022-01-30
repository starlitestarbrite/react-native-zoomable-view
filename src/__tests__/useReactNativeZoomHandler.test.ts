import { useSharedValue } from 'react-native-reanimated';
import { renderHook, act } from '@testing-library/react-hooks';

import { useReactNativeZoomHandler } from '../useReactNativeZoomHandler';

// A little test helper for this weird shared value syntax
const getSharedValue = (value) =>
  renderHook(() => useSharedValue<number>(value)).result.current;

const layoutEvent = { nativeEvent: { layout: { width: 100, height: 100 } } };

let animator;
beforeEach(() => {
  const scaleValue = getSharedValue(1);
  const { result } = renderHook(() =>
    useReactNativeZoomHandler({
      scaleValue,
      initialZoom: 1,
      maxZoom: 10,
      minZoom: 0.1,
    })
  );
  animator = result;
});

it('drags once', () => {
  act(() => {
    animator.current.onLayout(layoutEvent);
    animator.current.onDragUpdate({ translationX: 10, translationY: 10 });
  });

  expect(animator.current.animatedStyles.transform).toEqual([
    { translateX: 0 },
    { translateY: 0 },
    { scale: 1 },
    { translateX: 0 },
    { translateY: 0 },
    { translateX: 10 },
    { translateY: 10 },
  ]);
});

it('drags twice', () => {
  act(() => {
    animator.current.onLayout(layoutEvent);
    animator.current.onDragUpdate({ translationX: 10, translationY: 10 });
    animator.current.onDragUpdate({ translationX: -20, translationY: -20 });
  });

  expect(animator.current.animatedStyles.transform).toEqual([
    { translateX: 0 },
    { translateY: 0 },
    { scale: 1 },
    { translateX: 0 },
    { translateY: 0 },
    { translateX: -20 },
    { translateY: -20 },
  ]);
});

it('scales from the centre', () => {
  act(() => {
    animator.current.onLayout(layoutEvent);
    animator.current.onPinchUpdate({
      scale: 2,
      focalX: 50,
      focalY: 50,
      numberOfPointers: 2,
    });
  });

  expect(animator.current.animatedStyles.transform).toEqual([
    { translateX: 50 },
    { translateY: 50 },
    { scale: 2 },
    { translateX: 25 },
    { translateY: 25 },
    { translateX: 0 },
    { translateY: 0 },
  ]);
});

it('scales from a point', () => {
  act(() => {
    animator.current.onLayout(layoutEvent);
    animator.current.onPinchUpdate({
      scale: 2,
      focalX: 75,
      focalY: 75,
      numberOfPointers: 2,
    });
  });

  expect(animator.current.animatedStyles.transform).toEqual([
    { translateX: 50 },
    { translateY: 50 },
    { scale: 2 },
    { translateX: 37.5 },
    { translateY: 37.5 },
    { translateX: 0 },
    { translateY: 0 },
  ]);
});
