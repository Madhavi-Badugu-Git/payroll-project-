'use client';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DownloadIcon from '@mui/icons-material/Download';
import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef, useState } from 'react';

import Format1 from '@/components/formats/Format1';
import Format2 from '@/components/formats/Format2';
import Format3 from '@/components/formats/Format3';
import Format4 from '@/components/formats/Format4';
import Format5 from '@/components/formats/Format5';
import Format6 from '@/components/formats/Format6';
import AppLayout from '../AppLayout';

const formatComponents: Record<string, React.FC> = {
  format1: Format1,
  format2: Format2,
  format3: Format3,
  format4: Format4,
  format5: Format5,
  format6: Format6,
};

export default function PayslipPDFPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');

  const SelectedFormatComponent =
    selectedFormat !== 'pdf' ? formatComponents[selectedFormat] : null;

  const handleChangeFormat = (format: string) => setSelectedFormat(format);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const generatePDF = async () => {
    const input = contentRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, { useCORS: true, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight);
    return pdf;
  };

  const handleDownload = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save('payslip.pdf');
      setSuccessMessage('✅ PDF downloaded');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    handleClose();
  };

  const handleOpenPDF = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url);
      setSuccessMessage('📄 Opened PDF in new tab');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    handleClose();
  };

  const cellStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left',
  };

  const headerCellStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: '8px',
    border: '1px solid #ccc',
    textAlign: 'center',
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center px-5px pt-5px">
        <ButtonGroup
          variant="contained"
          color="primary"
          sx={{
            mr: 1,
            gap: 1,
            '& .MuiButton-root': { fontSize: '10px', padding: '8px 16px' }
          }}
        >
          <Button onClick={() => handleChangeFormat('format1')}>Format 1</Button>
          <Button onClick={() => handleChangeFormat('format2')}>Format 2</Button>
          <Button onClick={() => handleChangeFormat('format3')}>Format 3</Button>
          <Button onClick={() => handleChangeFormat('format4')}>Format 4</Button>
          <Button onClick={() => handleChangeFormat('format5')}>Format 5</Button>
          <Button onClick={() => handleChangeFormat('format6')}>Format 6</Button>
          <Button onClick={() => handleChangeFormat('pdf')}>Show PDF</Button>
        </ButtonGroup>
        <ButtonGroup variant="contained" color="success">
          <Button onClick={handleOpenPDF}>
            <DownloadIcon />
          </Button>
          <Button size="small" onClick={handleMenuClick}>
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={handleDownload}>Download PDF</MenuItem>
        </Menu>
      </div>
      {successMessage && (
        <div className="text-green-600 bg-green-100 border border-green-300 px-4 py-2 rounded mx-5 mt-2">
          {successMessage}
        </div>
      )}
      {SelectedFormatComponent ? (
        <div ref={contentRef} style={{ marginTop: '20px' }}>
          <SelectedFormatComponent />
        </div>
      ) : (
        <div ref={contentRef}>
          <h1
            style={{
              fontSize: '30px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#1E90FF',
              marginTop: '10px',
            }}
          >
            Monthly Salary Payslip – May 2025
          </h1>

          {/* Employee Info Table */}
          <div
            style={{
              padding: '20px',
              maxWidth: '1200px',
              margin: '0 auto',
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              color: '#333',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr>
                  <th colSpan={4} style={{
                    backgroundColor: '#FFD700',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    padding: '8px',
                  }}>
                    Trinits Technologies Payslip
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cellStyle}>Payslip for</td>
                  <td style={cellStyle}><strong>May</strong></td>
                  <td style={cellStyle}>Date</td>
                  <td style={cellStyle}>01/06/2025</td>
                </tr>
                <tr>
                  <td style={cellStyle}>Name</td>
                  <td style={cellStyle}><strong>Vikram Badugu</strong></td>
                  <td style={cellStyle}>Designation</td>
                  <td style={cellStyle}>Software Associate Intern</td>
                </tr>
                <tr>
                  <td style={cellStyle}>Location</td>
                  <td style={cellStyle}>Chennai</td>
                  <td style={cellStyle}>Department</td>
                  <td style={cellStyle}>Software</td>
                </tr>
                <tr>
                  <td style={cellStyle}>DOJ</td>
                  <td style={cellStyle}>24/03/2025</td>
                  <td style={cellStyle}>Grade/Band</td>
                  <td style={cellStyle}>Band 7</td>
                </tr>
                <tr>
                  <td style={cellStyle}>Attended Days</td>
                  <td style={cellStyle}>31</td>
                  <td style={cellStyle}>Arrear Days</td>
                  <td style={cellStyle}>0</td>
                </tr>
                <tr>
                  <td style={cellStyle}>No of Days/Month</td>
                  <td style={cellStyle}>31</td>
                  <td style={cellStyle}>Total Days</td>
                  <td style={cellStyle}>31</td>
                </tr>
              </tbody>
            </table>

            {/* Salary Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#FFD700' }}>
                  <th style={headerCellStyle}>Sr. No</th>
                  <th style={headerCellStyle}>Particular</th>
                  <th style={headerCellStyle}>Monthly</th>
                  <th style={headerCellStyle}>Actual Monthly Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={cellStyle}>1</td>
                  <td style={cellStyle}>Basic</td>
                  <td style={cellStyle}>1300</td>
                  <td style={cellStyle}>1300</td>
                </tr>
                <tr>
                  <td style={cellStyle}>2</td>
                  <td style={cellStyle}>HRA</td>
                  <td style={cellStyle}>240</td>
                  <td style={cellStyle}>240</td>
                </tr>
                <tr>
                  <td style={cellStyle}>3</td>
                  <td style={cellStyle}>Special Allowance</td>
                  <td style={cellStyle}>360</td>
                  <td style={cellStyle}>360</td>
                </tr>
                <tr>
                  <td style={cellStyle}>4</td>
                  <td style={cellStyle}>LTA</td>
                  <td style={cellStyle}>100</td>
                  <td style={cellStyle}>100</td>
                </tr>
                <tr style={{ fontWeight: 'bold', backgroundColor: '#FFD700' }}>
                  <td colSpan={2} style={cellStyle}>Total Salary</td>
                  <td style={cellStyle}>2000</td>
                  <td style={cellStyle}>2000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
