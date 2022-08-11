import React, { useRef, useState } from 'react';
import { View, Text, Image, Animated, Button } from 'react-native';
// @ts-ignore
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { styles } from './style';

export default function App() {
  const zoomAnimatedValue = useRef(new Animated.Value(1)).current;
  const scale = Animated.divide(1, zoomAnimatedValue);
  const [showMarkers, setShowMarkers] = useState(true);
  const [size, setSize] = useState<{ width: number; height: number }>();

  // Use layout event to get centre point, to set the pin
  const [pin, setPin] = useState({ x: 0, y: 0 });
  // Debounce the change event to avoid layout event firing too often while dragging
  const debouncedUpdatePin = debounce(setPin, 100);

  const staticPinPosition = size
    ? { left: size.width / 2, top: size.height / 2 }
    : undefined;

  return (
    <View style={styles.container}>
      <Text>ReactNativeZoomableView</Text>
      <View style={styles.box} onLayout={(e) => setSize(e.nativeEvent.layout)}>
        <ReactNativeZoomableView
          // Where to put the pin in the content view
          staticPinPosition={staticPinPosition}
          // Callback that returns the position of the pin
          // on the actual source image
          onStaticPinPositionChange={debouncedUpdatePin}
          maxZoom={30}
          initialZoom={1.5}
          // Give these to the zoomable view so it can apply the boundaries around the actual content.
          // Need to make sure the content is actually centered and the width and height are
          // measured when it's rendered naturally. Not the intrinsic sizes.
          // For example, an image with an intrinsic size of 400x200 will be rendered as 300x150 in this case.
          // Therefore, we'll feed the zoomable view the 300x100 size.
          contentWidth={300}
          contentHeight={150}
          panBoundaryPadding={500}
          zoomAnimatedValue={zoomAnimatedValue}
        >
          <View style={styles.contents}>
            <Image
              style={styles.img}
              source={{ uri: 'https://placekitten.com/400/200' }}
            />

            {showMarkers &&
              ['20%', '40%', '60%', '80%'].map((left) =>
                ['20%', '40%', '60%', '80%'].map((top) => (
                  <Animated.View
                    key={`${left}x${top}`}
                    // These markers will move and zoom with the image, but will retain their size
                    // because of the scale transformation.
                    style={[
                      styles.marker,
                      { left, top, transform: [{ scale }] },
                    ]}
                  />
                ))
              )}
          </View>
        </ReactNativeZoomableView>
      </View>
      <Text>
        Static pin position:{' '}
        {pin ? `${Math.round(pin.x)}, ${Math.round(pin.y)}` : 'Off map'}
      </Text>
      <Button
        title={`${showMarkers ? 'Hide' : 'Show'} markers`}
        onPress={() => setShowMarkers((value) => !value)}
      />
    </View>
  );
}

function debounce(func, wait, immediate = false) {
  var timeout;
  return function () {
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(this, args);
    }, wait);
    if (immediate && !timeout) func.apply(this, args);
  };
}
