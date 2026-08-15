import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@react-monorepo/ui'

import type { GuideTableData } from '../../content/guides'

function GuideTable({ data }: { data: GuideTableData }) {
  return (
    <figure className="mt-6">
      <div className="overflow-x-auto rounded-[10px] border border-[#dddddd]">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-[#f7f7f7]">
            <TableRow className="hover:bg-transparent">
              {data.columns.map((column) => (
                <TableHead
                  key={column}
                  className="whitespace-nowrap px-3.5 py-2.5 text-[13px] font-semibold text-[#222222]"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.join('|')} className="hover:bg-transparent">
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={`${row.join('|')}-${cellIndex}`}
                    className={`px-3.5 py-2.5 text-sm leading-6 ${
                      cellIndex === 0 ? 'font-medium text-[#222222]' : 'text-[#3f3f3f]'
                    }`}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.caption !== undefined && (
        <figcaption className="mt-2 text-xs leading-5 text-[#6a6a6a]">{data.caption}</figcaption>
      )}
    </figure>
  )
}

export default GuideTable
