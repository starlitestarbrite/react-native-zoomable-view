# @openspacelabs/react-native-zoomable-view

A view component for react-native with pinch to zoom, tap to move and double tap to zoom capability.
You can zoom everything, from normal images, text and more complex nested views.

This library is a fork of https://www.npmjs.com/package/@dudigital/react-native-zoomable-view.

This is the v3 rewrite of this package, with `react-native-reanimated` and `react-native-gesture-handler`. It is still a work in progress at the time of writing.

## Still to do

- Implement one-finger drag gesture

## Preview

![](https://thumbs.gfycat.com/PalatableMeanGnat-size_restricted.gif)

## Getting started

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props](#props)
- [Methods](#methods)
- [Pan Responder Hooks](#pan-responder-hooks)
- [Example](#example)

### Installation

1. `yarn add @openspacelabs/react-native-zoomable-view`

2. Important: set up `react-native-reanimated` v2 which includes native modules. Installation instructions are available here:

https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation

### Basic Usage

This component is based on react-natives View, enhanced by panresponders and other events to make it zoomable.
Therefore no platform specific configuration needs to be done.

Just use it as a drop in component instead of a normal view.

Import ReactNativeZoomableView:

```JSX
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
```

Use the component:

```JSX
<ReactNativeZoomableView
   maxZoom={1.5}
   minZoom={0.5}
   zoomStep={0.5}
   initialZoom={1}
   style={{
      padding: 10,
      backgroundColor: 'red',
   }}
>
   <Text>This is the content</Text>
</ReactNativeZoomableView>
```

### Example

Here is a full drop in example you can use in Expo, after installing the package.

```JSX
import * as React from 'react';

import { StyleSheet, View, Text, Image } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>ReactNativeZoomableView</Text>
      <View style={{ borderWidth: 5, flexShrink: 1, height: 500, width: 310 }}>
        <ReactNativeZoomableView maxZoom={30}>
          <Image
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            source={{ uri: 'https://via.placeholder.com/400x200.png' }}
          />
        </ReactNativeZoomableView>
      </View>
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
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
```

### Props

#### Options

These options can be used to limit and change the zoom behavior.

| name        | type                | description                                                                            | default   |
| ----------- | ------------------- | -------------------------------------------------------------------------------------- | --------- |
| zoomEnabled | boolean             | Can be used to enable or disable the zooming dynamically                               | true      |
| initialZoom | number              | Initial zoom level on startup                                                          | 1.0       |
| maxZoom     | number              | Maximum possible zoom level (zoom in). Can be set to `null` to allow unlimited zooming | 1.5       |
| minZoom     | number              | Minimum possible zoom level (zoom out)                                                 | 0.5       |
| scaleValue  | SharedValue<number> | A shared value that can be used to scale child components                              | undefined |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
