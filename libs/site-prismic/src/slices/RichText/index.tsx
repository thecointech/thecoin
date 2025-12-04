import React from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { Container, Segment } from "semantic-ui-react";

/**
 * Props for `RichText`.
 */
export type RichTextProps = SliceComponentProps<Content.RichTextSlice>;

/**
 * Component for "RichText" Slices.
 * 
 * This component renders rich text content using semantic-ui-react
 * for consistent styling with the main site-landing application.
 */
const RichText = ({ slice }: RichTextProps): React.JSX.Element => {
    return (
        <Segment
            as="section"
            basic
            data-slice-type={slice.slice_type}
            data-slice-variation={slice.variation}
        >
            <Container text>
                <PrismicRichText field={slice.primary.content} />
            </Container>
        </Segment>
    );
};

export default RichText;
