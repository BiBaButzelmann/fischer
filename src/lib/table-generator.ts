type ColumnIdentifier = string;

type TableColumn = {
  identifier: ColumnIdentifier;
  title: string;
  width: number;
  alignment: "left" | "center" | "right";
  collapseBorder?: boolean;
};

export class TableGenerator {
  private readonly columnsMap: Record<ColumnIdentifier, TableColumn> = {};
  private readonly columns: TableColumn[] = [];
  private readonly rows: Record<ColumnIdentifier, string>[] = [];

  addColumn(
    identifier: ColumnIdentifier,
    title: string,
    width: number,
    alignment: "left" | "center" | "right",
    collapseBorder: boolean = false,
  ) {
    const column = {
      identifier,
      title,
      width,
      alignment,
      collapseBorder,
    };
    this.columns.push(column);
    this.columnsMap[identifier] = column;
  }

  addRowValues(data: { id: ColumnIdentifier; data: string }[]) {
    this.rows.push(Object.fromEntries(data.map(({ id, data }) => [id, data])));
  }

  padCellValue(identifier: ColumnIdentifier, value: string): string {
    const { alignment, width } = this.columnsMap[identifier];

    if (alignment === "left") {
      return value.padEnd(width, " ");
    }
    if (alignment === "right") {
      return value.padStart(width, " ");
    }
    if (alignment === "center") {
      const padding = Math.floor((width - value.length) / 2);
      return value.padStart(padding + value.length, " ").padEnd(width, " ");
    }
    throw new Error("Invalid alignment");
  }

  generateHeader() {
    let header = "";
    for (const [i, column] of this.columns.entries()) {
      header += this.padCellValue(column.identifier, column.title);
      if (!column.collapseBorder && i < this.columns.length - 1) {
        header += " ";
      }
    }
    return header;
  }

  generateRow(values: Record<ColumnIdentifier, string>) {
    let row = "";
    for (const [i, column] of this.columns.entries()) {
      row += this.padCellValue(
        column.identifier,
        values[column.identifier] ?? "",
      );
      if (!column.collapseBorder && i < this.columns.length - 1) {
        row += " ";
      }
    }
    return row;
  }

  generateRows() {
    return this.rows.map((row) => this.generateRow(row)).join("\n");
  }

  generateTable() {
    const header = this.generateHeader();
    const rows = this.generateRows();
    return `${header}\n${rows}`;
  }
}
