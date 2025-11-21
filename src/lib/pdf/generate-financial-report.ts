import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Shift } from '@/store/useShiftsStore'

interface FinancialReportData {
  month: string
  year: number
  totalEarnings: number
  shiftsCount: number
  byInstitution: Array<{ name: string; value: number }>
  shifts: Shift[]
}

export function generateFinancialReportPDF(data: FinancialReportData): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Colors from Aurelo palette
  const primaryColor: [number, number, number] = [58, 123, 248] // #3A7BF8
  const accentColor: [number, number, number] = [143, 230, 255] // #8FE6FF
  const textColor: [number, number, number] = [11, 11, 15] // #0B0B0F
  const mutedColor: [number, number, number] = [100, 116, 139] // #64748B

  // Header with gradient effect (simulated)
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  // Logo area (placeholder)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Aurelo', 20, 25)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Relatório Financeiro', 20, 32)

  // Month and year
  doc.text(`${data.month} ${data.year}`, 170, 25, { align: 'right' })
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 170, 32, { align: 'right' })

  // Reset text color
  doc.setTextColor(...textColor)

  let yPos = 50

  // Summary Card
  doc.setFillColor(247, 249, 252) // Light background
  doc.roundedRect(20, yPos, 170, 30, 3, 3, 'F')
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo do Mês', 30, yPos + 10)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total de Ganhos:`, 30, yPos + 18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text(`R$ ${data.totalEarnings.toFixed(2)}`, 100, yPos + 18)
  
  doc.setTextColor(...textColor)
  doc.setFont('helvetica', 'normal')
  doc.text(`Plantões Confirmados:`, 30, yPos + 24)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.shiftsCount}`, 100, yPos + 24)

  yPos += 40

  // By Institution Table
  if (data.byInstitution.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Ganhos por Instituição', 20, yPos)

    yPos += 10

    autoTable(doc, {
      startY: yPos,
      head: [['Instituição', 'Valor (R$)']],
      body: data.byInstitution.map(item => [
        item.name,
        item.value.toFixed(2)
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [247, 249, 252],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: 20, right: 20 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Detailed Shifts Table
  if (data.shifts.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Extrato Detalhado', 20, yPos)

    yPos += 10

    const shiftsData = data.shifts
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .map(shift => {
        const date = new Date(shift.start_time)
        return [
          date.toLocaleDateString('pt-BR'),
          date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          shift.institution_name || 'Sem vínculo',
          shift.estimated_value ? `R$ ${shift.estimated_value.toFixed(2)}` : '-',
        ]
      })

    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Horário', 'Instituição', 'Valor']],
      body: shiftsData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [247, 249, 252],
      },
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 80 },
        3: { cellWidth: 35, halign: 'right' },
      },
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...mutedColor)
    doc.text(
      `Página ${i} de ${pageCount} - Aurelo - Relatório Financeiro`,
      105,
      285,
      { align: 'center' }
    )
  }

  return doc.output('blob')
}

