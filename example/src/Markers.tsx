import * as React from 'react';
import { StyleSheet } from 'react-native';

import Animated, {
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';

// These markers will move and zoom with the image, but will retain their size
// becuase of the scale transformation.
export const Markers = ({ zoom }: { zoom: SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 / zoom.value }],
  }));

  return (
    <>
      {[20, 40, 60, 80].map((left) =>
        [20, 40, 60, 80].map((top) => (
          <Animated.View
            key={`${left}x${top}`}
            style={[
              styles.marker,
              { left: `${left}%`, top: `${top}%` },
              animatedStyle,
            ]}
          />
        ))
      )}
    </>
  );
};

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
  },
});
