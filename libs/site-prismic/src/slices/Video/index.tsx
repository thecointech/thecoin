import React, { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { validate } from 'uuid';
import { Message } from 'semantic-ui-react';
/**
 * Props for `Video`.
 */
export type VideoProps = SliceComponentProps<Content.VideoSlice>;

/**
 * Component for "Video" Slices.
 */
const Video: FC<VideoProps> = ({ slice }) => {
  if (!validate(slice.primary.video_id ?? '')) {
    return <Message error header="Video ID is required">Video ID {slice.primary.video_id} is invalid</Message>;
  }
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        <iframe src={`https://player.mediadelivery.net/embed/637569/${slice.primary.video_id}?loop=false&muted=false&preload=true&responsive=true`}
          loading="lazy"
          style={{ border: '0', position: 'absolute', top: 0, height: '100%', width: '100%' }}
          allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
          allowFullScreen={true}
        />
      </div>
    </section>
  );
};

export default Video;
