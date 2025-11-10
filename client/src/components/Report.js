import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const Report = ({ data }) => {
  const [filter, setFilter] = useState('');

  if (!data || data.length === 0) {
    return <p>No data available for this report.</p>;
  }

  const headers = Object.keys(data[0]);

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(filter.toLowerCase())
    )
  );

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Filter..."
        className="mb-4 p-2 border border-gray-300 rounded-md"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <TableCell key={colIndex}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Report;