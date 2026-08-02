"use client";
import React, { type FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicLink, SliceComponentProps } from "@prismicio/react";
import styles from "./index.module.css";
import { Header, Table as SemanticUITable } from "semantic-ui-react";
import { RichText } from "@/components";

/**
 * Props for `Table`.
 */
export type TableProps = SliceComponentProps<Content.TableSlice>;

/**
 * Component for "Table" Slices.
 */
const Table: FC<TableProps> = ({ slice }) => {
  const data = slice.primary.table_data;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className={styles.tableContainer}
    >
      {
        slice.primary.title && (
          <Header size="tiny" className={styles.caption}>{slice.primary.title}</Header>
        )
      }
      <SemanticUITable>
        {data?.head && (
          <SemanticUITable.Header>
            {
              data.head.rows.map(row => (
                <SemanticUITable.Row key={row.key}>
                  {
                    row.cells.map(cell => <TableCell key={cell.key} cell={cell} />)
                  }
                </SemanticUITable.Row>
              ))
            }
          </SemanticUITable.Header>
        )}
        {data?.body && (
          <SemanticUITable.Body>
            {
              data.body.rows.map((row) => (
                <SemanticUITable.Row key={row.key}>
                  {
                    row.cells.map(cell => <TableCell key={cell.key} cell={cell} />)
                  }
                </SemanticUITable.Row>
              ))
            }
          </SemanticUITable.Body>
        )}
      </SemanticUITable>
      {slice.primary.source?.text && (
        <div className={styles.source}>
          Source: <PrismicLink field={slice.primary.source} />
        </div>
      )}
    </section>
  );
};

const TableCell: FC<{ cell: any }> = ({ cell }) => {
  const Component = cell.type == "header" ? SemanticUITable.HeaderCell : SemanticUITable.Cell;
  return (
    <Component>
      <RichText field={cell.content} />
    </Component>
  );
};

export default Table;
