import React, { useMemo } from 'react';
import './DataTable.css';

const DataTable = ({ 
  columns, 
  data, 
  onRowClick, 
  responsive = true,
  striped = true,
  hover = true,
  className = '' 
}) => {
  const tableClass = useMemo(() => {
    const classes = ['data-table'];
    if (striped) classes.push('table-striped');
    if (hover) classes.push('table-hover');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [striped, hover, className]);

  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key];
  };

  if (!data || data.length === 0) {
    return null;
  }

  const tableContent = (
    <table className={tableClass}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th 
              key={column.key} 
              style={{ width: column.width }}
              className={column.className}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr 
            key={row._id || index}
            onClick={() => onRowClick && onRowClick(row)}
            className={onRowClick ? 'clickable-row' : ''}
          >
            {columns.map((column) => (
              <td 
                key={column.key}
                className={column.className}
              >
                {renderCell(row, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (responsive) {
    return (
      <div className="table-responsive">
        {tableContent}
      </div>
    );
  }

  return tableContent;
};

export default DataTable;