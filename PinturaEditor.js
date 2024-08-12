import { WebView } from 'react-native-webview';
import { View, Platform } from 'react-native';
import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { Asset } from 'expo-asset';

const upperCaseFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// This allows passing functions to webview
const getFunctionParts = (fn) => {
    const fnStr = fn.toString();
    const params = fnStr.match(/^(?:function [a-z]*)?\(([ ,a-z_0-9]*)/i);
    const body = fnStr.match(/^(?:.*?=>|function.*?{)(.+)/is);
    return {
        body: body ? body[1].replace(/}$/, '').trim() : '',
        params: params ? params[1] : '',
    };
};

// This replaces undefined values and in outgoing messages so they're not lost
const stringifyMessage = (obj) =>
    JSON.stringify(obj, (k, v) => {
        if (v === undefined) return '__UNDEFINED__';
        if (typeof v === 'function') {
            const { params, body } = getFunctionParts(v);
            if (!body && !params) return undefined;
            return '__FUNCTION__' + params + '____' + body;
        }
        return v;
    });

// This restores undefined values in incoming messages
const deepReplaceValues = (obj, replacer) => {
    let out = Array.isArray(obj) ? [...obj] : { ...obj };
    Object.entries(out).forEach(([key, value]) => {
        if (Array.isArray(value) || typeof value === 'object') {
            out[key] = deepReplaceValues(value, replacer);
        } else {
            out[key] = replacer(key, value);
        }
    });
    return out;
};

const replaceValues = (key, value) => (value === '__UNDEFINED__' ? undefined : value);

const parseMessage = (str) => deepReplaceValues(JSON.parse(str), replaceValues);

/* eslint-disable @typescript-eslint/no-var-requires */
const Editor = forwardRef((props, ref) => {
    const { style, styleRules, ...options } = props;
    const [source, setSource] = useState({});
    const webViewRef = useRef(null);

    // options map used to filter out options that are set multiple times
    const [propMap] = useState(new Map());

    // this sets up proxy so we can call functions on the editor instance
    useEffect(() => {
        const handler = {
            get: (target, prop) => {
                if (prop === 'history') return new Proxy({ group: 'history' }, handler); // eslint-disable-line no-undef
                return (...args) => {
                    const name = [target.group, prop].filter(Boolean).join('.');
                    webViewRef.current.postMessage(
                        stringifyMessage({
                            editorFunction: [name, ...args],
                        })
                    );
                };
            },
        };

        ref.current.editor = new Proxy({}, handler); // eslint-disable-line no-undef
    }, [webViewRef, ref]);

    // this passes options to the editor
    useEffect(() => {
        const editorOptions = {};

        for (key of Object.keys(options)) {
            const currentValue = propMap.get(key);
            const newValue = options[key];

            // skip new value!
            if (newValue === currentValue) {
                continue;
            }

            // set new value
            editorOptions[key] = newValue;

            // remember this value so we can compare in next prop update
            propMap.set(key, newValue);
        }
        webViewRef.current.postMessage(stringifyMessage({ editorOptions }));
    }, [webViewRef, options]);

    // clear propmap on unmount
    useEffect(() => {
        return () => {
            propMap.clear();
        };
    }, []);

    // this passes style rules to the editor
    useEffect(() => {
        webViewRef.current.postMessage(stringifyMessage({ editorStyleRules: styleRules }));
    }, [webViewRef, styleRules]);

    // load editor template
    useEffect(() => {
        const template = require('./bin/pintura.html'); // eslint-disable-line no-undef
        Platform.OS === 'android'
            ? Asset.loadAsync(template).then(([{ localUri }]) => {
                  setSource({
                      uri: localUri,
                  });
              })
            : setSource(template);
    }, []);

    return (
        <View ref={ref} style={{ ...style, backgroundColor: 'transparent' }}>
            <WebView
                ref={webViewRef}
                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                javaScriptEnabled={true}
                scrollEnabled={false}
                domStorageEnabled={true}
                allowFileAccess={true}
                allowFileAccessFromFileURLs={true}
                allowUniversalAccessFromFileURLs={true}
                allowsLinkPreview={false}
                allowsInlineMediaPlayback={true}
                automaticallyAdjustContentInsets={false}
                originWhitelist={['*']}
                textZoom={100}
                source={source}
                onMessage={async (event) => {
                    // message from WebView
                    const { type, detail } = parseMessage(event.nativeEvent.data);

                    // webview ready, lets send over first batch of options
                    if (type === 'webviewloaded') {
                        return webViewRef.current.postMessage(
                            stringifyMessage({
                                editorStyleRules: styleRules,
                                editorOptions: options,
                            })
                        );
                    }

                    // if is log
                    if (type === 'log')
                        return console.log(detail.map((d) => JSON.stringify(d)).join(', ')); // eslint-disable-line no-undef

                    // get handler
                    const handler = options[`on${upperCaseFirstLetter(type)}`];

                    // call handler
                    handler && handler(detail);
                }}
            />
        </View>
    );
});

export default Editor;
