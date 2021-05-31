import React, { useRef, useState } from 'react'
import { Icon } from 'semantic-ui-react';
import styles from './styles.module.less';

type Props = {
  disabled: boolean;
  onFileAdded: (file: File|undefined) => void,
}

export const Upload = (props: Props) => {
  const [highlight, setHighlight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openFileDialog = () => {
    if (props.disabled) return
    fileInputRef.current?.click()
  }

  const onFilesAdded = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (props.disabled) return
    props.onFileAdded(event.target.files?.[0])
  }

  const onDragOver = () => {
    if (props.disabled) return
    setHighlight(true);
  }

  const onDragLeave = () => setHighlight(false);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (props.disabled) return;
    props.onFileAdded(event.dataTransfer.files?.[0])
    setHighlight(false);
  }

 return (
   <div
     className={`${styles.Dropzone} ${highlight ? styles.Highlight : ''}`}
     onDragOver={onDragOver}
     onDragLeave={onDragLeave}
     onDrop={onDrop}
     onClick={openFileDialog}
     style={{ cursor: props.disabled ? 'default' : 'pointer' }}
   >
     <input
       ref={fileInputRef}
       className={styles.FileInput}
       type="file"
       multiple
       onChange={onFilesAdded}
     />
     <Icon name='cloud upload' size='massive' />
     <span>Upload Image to Sign</span>
    </div>
  )
}
