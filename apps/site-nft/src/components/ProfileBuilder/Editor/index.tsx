import React, { useEffect } from 'react';
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor, { ImageEditorComponent, ThemeConfig, EditorCore } from '@toast-ui/react-image-editor';
import styles from './styles.module.less';

import border from '../images/border.png';

const myTheme: ThemeConfig = {
  // Theme object to extends default dark theme.
};

export type Props = {
  ref?: React.RefObject<ImageEditorComponent>,
  showFrame?: boolean,
  years?: [number, number],
  tokenId?: number,
};

export const Editor = ({showFrame, years, tokenId} : Props) => {

  const editorRef = React.createRef<ImageEditorComponent>();

  useEffect(() => { toggleFrame(editorRef.current?.getInstance(), showFrame); }, [editorRef.current, showFrame])
  useEffect(() => { toggleTokenId(editorRef.current?.getInstance(), tokenId); }, [editorRef.current, tokenId])
  useEffect(() => { toggleYears(editorRef.current?.getInstance(), years); }, [editorRef.current, years?.[0], years?.[1]])

  return (
    <div id={styles.wrapper}>
      <ImageEditor
        ref={editorRef}
        includeUI={{
          loadImage: {
            path: "https://gateway.pinata.cloud/ipfs/QmZ9m3cW2jc7pRtvnmXwKDCSJ6GBuv2i33MnWjdb8jR81U",
            name: 'SampleImage',
          },
          theme: myTheme,
          menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
          initMenu: 'filter',
          uiSize: {
            width: '1000px',
            height: '800px',
          },
          menuBarPosition: 'bottom',
        }}
        cssMaxHeight={800}
        cssMaxWidth={1000}
        selectionStyle={{
          cornerSize: 20,
          rotatingPointOffset: 70,
        }}
        usageStatistics={true}
      />
    </div>
  )
}

async function toggleFrame(editor?: EditorCore, withFrame?: boolean) {
  console.log(`WithFrame: ${withFrame}`);
  if (!editor) return;
  if (withFrame) {
    const img = document.createElement("img");
    img.src = border;
    const r = await editor?.addImageObject(img.src);
    console.log('BorderAdded' + r);
  }
}

async function toggleYears(editor?: EditorCore, years?: [number, number]) {
  if (!editor) return;
  if (years) {
    const r = await editor.addText(years[0].toString(), {
      position: { x: 300, y: 10}
    });
    editor.deactivateAll();
    console.log('Text Added' + r);
  }

}

async function toggleTokenId(editor?: EditorCore, tokenId?: number) {
  if (!editor) return;

  if (tokenId) {
    const r = await editor.addText(`#${tokenId}`, {
      position: { x: 300, y: 400}
    });
    editor.discardSelection();
    console.log('Text Added' + r);
  }
}

