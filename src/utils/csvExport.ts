export const exportToCSV = (
  headers: string[],
  rows: (string | number)[][][],
  filename: string
) => {
  const escape = (val: string | number) =>
    `"${String(val).replace(/"/g, '""')}"`

  const csvContent = [headers.map(escape), ...rows.map(r => r.map(c => escape(c[0])))]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Simpler overload
export const downloadCSV = (
  headers: string[],
  rows: (string | number)[][],
  filename: string
) => {
  const escape = (val: string | number) =>
    `"${String(val).replace(/"/g, '""')}"`

  const csvContent = [headers, ...rows]
    .map(row => row.map(escape).join(','))
    .join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}