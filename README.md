# Pintura React Native Component

This package exports a Pintura WebView wrapper component to make it easier to use Pintura with React Native (compatible with Expo).

```
npm install @pqina/react-native-pintura
```

Post install the Pintura React Native component does two things:

-   It creates a `pintura.html` file in the Pintura React Native npm package folder, this file is used as a WebView source.
-   It copies the `pintura.html` file to the `android/app/src/main/assets` folder so it can be loaded by Android, iOS doesn't require this step.

The install script can be run again by calling `npm rebuild` which is needed after updating `@pqina/pintura` or `@pqina/pintura-video`

React Native example projects:

-   https://github.com/pqina/pintura-example-react-native
-   https://github.com/pqina/pintura-example-react-native-expo
-   https://github.com/pqina/pintura-example-react-native-typescript-expo

Visit https://pqina.nl/pintura for more details.
