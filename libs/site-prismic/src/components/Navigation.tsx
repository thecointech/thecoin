// ./src/components/Navigation.tsx

import { Client, Content, isFilled } from "@prismicio/client";
import { PrismicLink } from "@prismicio/react";
import type { JSX } from "react";

export const Navigation = async ({
  client,
}: {
  client: Client<Content.AllDocumentTypes>;
}): Promise<JSX.Element> => {
  const navigation = await client.getSingle("navigation");

  return (
    <nav>
      <ul>
        {isFilled.group(navigation.data.menu_items) &&
          navigation.data.menu_items.map((item, idx) => {
            return (
              <li key={`${idx}-${item.label}`}>
                <PrismicLink field={item.link}>{item.label}</PrismicLink>
              </li>
            );
          })}
      </ul>
    </nav>
  );
};
