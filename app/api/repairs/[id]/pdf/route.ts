import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/local-db'
import { formatDate, getStatusLabel } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repair = await localDb.getRepairById(params.id)
    const settings = await localDb.getSettings()

    if (!repair) {
      return NextResponse.json(
        { error: 'Reparación no encontrada' },
        { status: 404 }
      )
    }

    // Get technician info manually
    let technicianName = '-'
    if (repair.assignedTechnicianId) {
      const technicians = await localDb.getTechnicians()
      const tech = technicians.find(t => t.id === repair.assignedTechnicianId)
      if (tech) {
        technicianName = tech.name
      }
    }

    // Format Service Conditions for HTML (preserve line breaks)
    const formattedConditions = (settings?.serviceConditions || '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('<br>')

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reparación ${repair.operationNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
      line-height: 1.4;
      font-size: 14px;
      max-width: 210mm; /* A4 width */
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
      color: #000;
    }
    
    .header p {
      font-size: 14px;
      color: #666;
    }
    
    .grid-container {
      display: flex;
      justify-content: space-between;
      gap: 40px;
      margin-bottom: 30px;
    }
    
    .column {
      flex: 1;
    }
    
    h3 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #000;
    }
    
    .info-row {
      margin-bottom: 8px;
    }
    
    .label {
      font-weight: bold;
      margin-right: 5px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .description {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      min-height: 80px;
    }
    
    .conditions {
      margin-top: 40px;
      font-size: 10px;
      text-align: justify;
      color: #555;
    }
    
    .conditions h4 {
      text-align: center;
      font-size: 12px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .conditions p {
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .signatures {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
      gap: 40px;
    }
    
    .signature-box {
      flex: 1;
      text-align: center;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
    
    .signature-title {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 40px;
      text-transform: uppercase;
    }

    .signature-name {
        margin-top: 40px;
        font-weight: bold;
    }

    .signature-date {
        font-size: 12px;
        color: #666;
    }
    
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Comprobante de Reparación</h1>
    <p>Nº Operativa: ${repair.operationNumber}</p>
  </div>
  
  <div class="grid-container">
    <div class="column">
      <h3>Datos del Cliente</h3>
      <div class="info-row"><span class="label">Nombre:</span> ${repair.customerName || '-'} ${repair.customerSurname || ''}</div>
      <div class="info-row"><span class="label">Teléfono:</span> ${repair.customerPhone}</div>
      <div class="info-row"><span class="label">Email:</span> ${repair.customerEmail}</div>
    </div>
    
    <div class="column">
      <h3>Datos del Equipo</h3>
      <div class="info-row"><span class="label">Marca:</span> ${repair.brand || '-'}</div>
      <div class="info-row"><span class="label">Modelo:</span> ${repair.model || '-'}</div>
      <div class="info-row"><span class="label">Nº Serie:</span> ${repair.serialNumber || '-'}</div>
    </div>
  </div>
  
  <div class="section">
    <h3>Datos de la Reparación</h3>
    <div class="info-row"><span class="label">Fecha de ingreso:</span> ${formatDate(repair.entryDate)}</div>
    <div class="info-row"><span class="label">Técnico asignado:</span> ${technicianName}</div>
    <div class="info-row"><span class="label">Estado:</span> ${getStatusLabel(repair.status)}</div>
    <div class="info-row"><span class="label">Nº Factura:</span> ${repair.invoiceNumber || 'No'}</div>
  </div>
  
  <div class="section">
    <h3>Motivo de la Intervención</h3>
    <div class="description">
      ${repair.issueDescription || 'No especificado'}
    </div>
  </div>
  
  <div class="conditions">
    <h4>Condiciones del Servicio</h4>
    ${settings?.serviceConditions
        ? settings.serviceConditions.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')
        : '<p>No hay condiciones de servicio definidas.</p>'}
  </div>
  
  <div class="conditions" style="text-align: center; margin-top: 20px; font-style: italic;">
    <p>Al firmar este documento, el cliente acepta las condiciones del servicio descritas anteriormente.</p>
  </div>
  
  <div class="signatures">
    <div class="signature-box" style="border-top: none;">
      <div class="signature-title">FIRMA DEL CLIENTE</div>
      <div style="height: 60px; border-bottom: 1px solid #ccc; margin-bottom: 5px;"></div>
      <div class="signature-name">${repair.customerName} ${repair.customerSurname}</div>
      <div class="signature-date">Fecha: ${formatDate(new Date())}</div>
    </div>
    
    <div class="signature-box" style="border-top: none;">
      <div class="signature-title">FIRMA DE LA EMPRESA</div>
      <div style="height: 60px; border-bottom: 1px solid #ccc; margin-bottom: 5px;"></div>
      <div class="signature-name">${technicianName === '-' ? 'SAT' : technicianName}</div>
      <div class="signature-date">Fecha: ${formatDate(new Date())}</div>
    </div>
  </div>
  
  <script>
    window.onload = function() {
      // Small delay to ensure styles are loaded
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    )
  }
}
