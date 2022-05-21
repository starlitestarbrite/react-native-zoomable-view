import * as React from 'react';
import { StyleSheet, View, Text, Image, Animated, Button } from 'react-native';
// @ts-ignore
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { debounce } from 'lodash';

export default function App() {
  const zoomAnimatedValue = React.useRef(new Animated.Value(1)).current;
  const scale = Animated.divide(1, zoomAnimatedValue);
  const [showMarkers, setShowMarkers] = React.useState(true);

  const [staticPinPosition, setStaticPinPosition] = React.useState({
    x: 0,
    y: 0,
  });
  const staticPinPositionRef = React.useRef<Animated.ValueXY | null>(
    new Animated.ValueXY({ x: 0, y: 0 })
  ).current;

  const updatePositionState = debounce(
    (value: { x: number; y: number } | null) => {
      if (!value) {
        return setStaticPinPosition(null);
      }
      const { x, y } = value;
      setStaticPinPosition({ x, y });
    },
    100
  );

  React.useEffect(() => {
    const listener = staticPinPositionRef.addListener(updatePositionState);
    return () => {
      staticPinPositionRef.removeListener(listener);
    };
  });

  const [size, setSize] = React.useState({ width: 0, height: 0 });

  return (
    <View style={styles.container}>
      <Text>ReactNativeZoomableView ({JSON.stringify(staticPinPosition)})</Text>
      <View
        style={styles.box}
        onLayout={(e) => {
          setSize(e.nativeEvent.layout);
        }}
      >
        <ReactNativeZoomableView
          staticPinPosition={{
            left: size.width / 2 - 10,
            top: size.height / 2 - 10,
          }}
          onStaticPinPositionChange={(position) => {
            if (position) {
              staticPinPositionRef.setValue(position);
            } else {
              updatePositionState(null);
            }
          }}
          // staticPinIcon={
          //   <View
          //     style={{
          //       width: 20,
          //       height: 20,
          //       backgroundColor: 'green',
          //       borderRadius: 12,
          //     }}
          //   />
          // }
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
              [20, 40, 60, 80].map((left) =>
                [20, 40, 60, 80].map((top) => (
                  <Animated.View
                    key={`${left}x${top}`}
                    // These markers will move and zoom with the image, but will retain their size
                    // becuase of the scale transformation.
                    style={[
                      styles.marker,
                      { left: `${left}%`, top: `${top}%` },
                      { transform: [{ scale }] },
                    ]}
                  />
                ))
              )}
          </View>
        </ReactNativeZoomableView>
      </View>
      <Button
        title={`${showMarkers ? 'Hide' : 'Show'} markers`}
        onPress={() => setShowMarkers((value) => !value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contents: {
    flex: 1,
    alignSelf: 'stretch',
  },
  box: {
    borderWidth: 5,
    flexShrink: 1,
    height: 600,
    width: 480,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  marker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
  },
});
