import React, { useMemo } from 'react'
import { useTable } from 'react-table'
import { useHistory } from "react-router-dom"

import '../../styles/table.scss'

export default function UsersTable({ data, setRowClicked }) {

  let history = useHistory()
 
  const columns = useMemo(
    () => [
      {
        Header: 'Id',
        accessor: 'id',
      },
      {
        Header: 'First name',
        accessor: 'first_name',
      },
      {
        Header: 'Last name',
        accessor: 'last_name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Gender',
        accessor: 'gender',
      },
      {
        Header: 'Ip address',
        accessor: 'ip_address',
      },
      {
        Header: 'Total clicks',
        accessor: 'total_clicks',
      },
      {
        Header: 'Total page views',
        accessor: 'total_page_views',
      }
    ],
    []
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data })

  return (
    <div className="table">
      <table id="t01" {...getTableProps()}>
        <thead id="th01">
          {// Loop over the header rows
          headerGroups.map(headerGroup => (
          // Apply the header row props
            <tr {...headerGroup.getHeaderGroupProps()}>
            {// Loop over the headers in each row
            headerGroup.headers.map(column => (
            // Apply the header cell props
            <th {...column.getHeaderProps()}>
            {// Render the header
            column.render('Header')}
            </th>
            ))}
            </tr>
          ))}
        </thead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {// Loop over the table rows
          rows.map(row => {
          // Prepare the row for display
            prepareRow(row)
            return (
              // Apply the row props
              <tr {...row.getRowProps()} onClick={() => {
                const { id, first_name, last_name } = row.original
                setRowClicked(prevState => {return {...prevState, id, first_name, last_name }})
                history.push(`/users/${id}`)
                }}>
                {// Loop over the rows cells
                row.cells.map(cell => {
                  // Apply the cell props
                  return (
                    <td {...cell.getCellProps()}>
                      {// Render the cell contents
                      cell.render('Cell')}
                  </td>
                  )
                })}
            </tr>
          )
          })}
        </tbody>
      </table>
    </div>
  )
}