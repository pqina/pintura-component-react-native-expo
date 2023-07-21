import * as React from 'react';

import { StyleProp, ViewStyle } from 'react-native/types';

import {
    PinturaEditorDefaultOptions,
    PinturaReadState,
    PinturaWriteState,
    PinturaImageState,
    PinturaEditor as PinturaEditorInstance,
    Shape,
    Vector,
    Size,
} from '@pqina/pintura';

interface PinturaComponentEvents {
    onInit?: (detail: PinturaEditorInstance) => void;
    onLoadstart?: () => void;
    onLoadabort?: (detail: PinturaReadState) => void;
    onLoaderror?: (detail: PinturaReadState) => void;
    onLoadprogress?: (detail: PinturaReadState) => void;
    onLoad?: (detail: { size: Size }) => void;
    onProcessstart?: () => void;
    onProcessabort?: (detail: PinturaWriteState) => void;
    onProcesserror?: (detail: PinturaWriteState) => void;
    onProcessprogress?: (detail: PinturaWriteState) => void;
    onProcess?: (detail: {
        /** Base64 encoded DataURL */
        dest: string;
        imageState: PinturaImageState;
    }) => void;
    onLoadpreview?: (detail: ImageData | ImageBitmap) => void;
    onReady?: () => void;
    onUpdate?: (detail: PinturaImageState) => void;
    onUndo?: (detail: number) => void;
    onRedo?: (detail: number) => void;
    onRevert?: () => void;
    onWritehistory?: () => void;
    onClose?: () => void;
    onDestroy?: () => void;
    onAddshape?: (detail: Shape) => void;
    onSelectshape?: (detail: Shape) => void;
    onUpdateshape?: (detail: Shape) => void;
    onRemoveshape?: (detail: Shape) => void;
    onMarkuptap?: (detail: { target?: Shape; position: Vector }) => void;
    onMarkupzoom?: (detail: number) => void;
    onMarkuppan?: (detail: Vector) => void;
    onZoom?: (detail: number) => void;
    onPan?: (detail: Vector) => void;
    onSelectstyle?: (detail: { [key: string]: unknown }) => void;
    onSelectutil?: (detail: string) => void;
    onSelectcontrol?: (detail: string) => void;
}

class PinturaEditor extends React.Component<
    {
        /** React Native styles assigned to <View> wrapping the editor */
        style?: StyleProp<ViewStyle>;

        /** CSS styles passed to editor webview */
        styleRules?: string;

        // readonly ref?: MutableRefObject<PinturaEditorRef>;
    } & PinturaEditorDefaultOptions &
        PinturaComponentEvents,
    any
> {
    editor: PinturaEditorInstance;
}

export default PinturaEditor;

/**
 * @deprecated The method should not be used
 */
export const localFileToDataURL: (url: string) => Promise<string>;
