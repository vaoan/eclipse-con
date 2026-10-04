interface ChartTableProps {
  readonly caption: string;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

/** The table-view twin of a chart: the same numbers, readable without hover. */
export function ChartTable({
  caption,
  columns,
  rows,
}: Readonly<ChartTableProps>) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={columns[index]} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={columns[index]} className="numeric">
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
