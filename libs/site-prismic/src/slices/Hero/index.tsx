// ./src/slices/Hero/index.tsx

import { Content } from "@prismicio/client";
import { SliceComponentProps, PrismicText } from "@prismicio/react";
import { RichText } from "@/components/RichText";
import { PrismicNextImage } from "@prismicio/next";

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero = ({ slice }: HeroProps) => {
  return (
    <section

      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <PrismicNextImage
        field={slice.primary.image}
        sizes="100vw"

        alt=""
      />
      <div>
        <h1>
          <PrismicText field={slice.primary.title} />
        </h1>
        <RichText field={slice.primary.description} />
      </div>
    </section>
  );
};

export default Hero;
