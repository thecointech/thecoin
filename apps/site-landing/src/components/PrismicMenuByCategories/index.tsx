import React from "react";
import { Checkbox, Label, List, Rail, SemanticFLOATS } from "semantic-ui-react";
import { GreaterThanMobileSegment, MobileSegment } from "@thecointech/media-context";
import { useSearchParams } from "react-router";
import styles from "./index.module.less";

type Props = {
  categories: string[],
  idForMenu: string,
  railPosition: SemanticFLOATS,
}

export const CategoryMenu = ({ categories, idForMenu, railPosition }: Props) => {

  const sortedCategories = [...categories].sort();
  return (
    <>
      <GreaterThanMobileSegment>
        <Rail position={railPosition}>
          <div id={idForMenu}>
            <List divided relaxed size={"massive"} className={"x2spaceBefore"}>
              {sortedCategories.map((entry) => <CategoryMenuEntry key={entry} name={entry} />)}
            </List>
          </div>
        </Rail>
      </GreaterThanMobileSegment>

      <MobileSegment>
        <div id={idForMenu}>
          <List divided relaxed size={"massive"} className={"x10spaceBefore x8spaceAfter"}>
            {sortedCategories.map((entry) => <CategoryMenuEntry key={entry} name={entry} />)}
          </List>
        </div>
      </MobileSegment>
    </>
  );
};


const CategoryMenuEntry = ({ name }: { name: string }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get selected categories from URL
  const selectedCategories = new Set(searchParams.getAll('category'));

  const handleToggle = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }

    // Update URL search params
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category'); // Clear all category params
    newSelected.forEach(cat => newParams.append('category', cat));
    setSearchParams(newParams);
  };

  const isChecked = (
    selectedCategories.size === 0 ||
    selectedCategories.has(name)
  );

  return (
    <List.Item>
      <label className={styles.categoryRow}>
        <Label>{name}</Label>
        <Checkbox
          className={styles.categoryCB}
          checked={isChecked}
          onChange={() => handleToggle(name)}
        />
      </label>
  </List.Item>
  );
};
