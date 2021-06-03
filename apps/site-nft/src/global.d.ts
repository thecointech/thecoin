declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg';

declare module '*.jpg';

declare module '*.png';

declare module '@toast-ui/react-image-editor' {
  import ImageEditor, { IThemeConfig } from 'tui-image-editor';

  class ImageEditorComponent {
    getInstance() : ImageEditor
  }

  type Props = {
    ref?: React.RefObject<ImageEditorComponent>,
  } & ConstructorParameters<typeof ImageEditor>[1];

  export type EditorCore = ImageEditor;
  export type ThemeConfig = IThemeConfig;
  export default function BaseImageEditor(props: Props): JSX.Element;
}

declare module 'randomhex' {
  export default (len: number) => string;
}

type MaybeString = string | undefined;
type MaybeNumber = number | undefined;
