'use client';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DownloadIcon from '@mui/icons-material/Download';
import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef, useState } from 'react';
import AppLayout from '../AppLayout';

// Common cell style
const cellStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
};

// Table header style
const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 'bold',
  textAlign: 'left',
};

export default function PayslipPDFPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [successMessage, setSuccessMessage] = useState('');

  const generatePDF = async () => {
    const input = contentRef.current;
    if (!input) return;

    const canvas = await html2canvas(input, {
      useCORS: true,
      scale: 2,
    });

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
      setSuccessMessage('✅  Payslips PDF downloaded successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    handleClose();
  };

  const handleOpenPDF = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      const pdfBlob = pdf.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
      window.open(pdfURL);
      setSuccessMessage('📄 PDF opened in new tab!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    handleClose();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppLayout>
      <div style={{ padding: '30px' }}>
        {/* Dropdown-style Download Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '30px',
            marginRight: '10px',
          }}
        >
          <ButtonGroup variant='contained' color='success'>
            <Button onClick={handleOpenPDF}>
              <DownloadIcon />
            </Button>
            <Button size='small' onClick={handleMenuClick}>
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleDownload}>Download PDF</MenuItem>
          </Menu>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div
            style={{
              backgroundColor: 'success',
              color: '#155724',
              border: '1px solid #c3e6cb',
              padding: '10px 20px',
              borderRadius: '5px',
              marginTop: '5px',
              maxWidth: '300px',
              marginLeft: 'auto',
              marginRight: '10px',
              fontSize: '16px',
            }}
          >
            {successMessage}
          </div>
        )}
        <h1
          style={{
            fontSize: '30px',
            fontWeight: 'bold',
            marginLeft: 'auto',
            marginTop: '0px',
            paddingTop: '0px',
            color: '#1E90FF',
          }}
        >
          Monthly Salary Payslip – May 2025
        </h1>
        {/* PDF Content */}
        <div
          ref={contentRef}
          style={{
            padding: '20px',
            maxWidth: '1200px',
            marginLeft: 'auto',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#333',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '24px',
            }}
          >
            <thead>
              <tr>
                <th
                  colSpan={6}
                  style={{
                    backgroundColor: '#FFD700',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    padding: '8px',
                  }}
                >
                  Trinits Technologies payslip
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle}>Payslip for</td>
                <td style={cellStyle}>
                  <strong>May</strong>
                </td>
                <td style={cellStyle}>Date</td>
                <td style={cellStyle}>01/06/2025</td>
              </tr>
              <tr>
                <td style={cellStyle}>Name</td>
                <td style={cellStyle}>
                  <strong>Vikram Badugu</strong>
                </td>
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

          {/* Salary Info Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#FFD700' }}>
                <th style={headerCellStyle}>Sr. No </th>
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
                <td colSpan={2} style={cellStyle}>
                  Total Salary
                </td>
                <td style={cellStyle}>2000</td>
                <td style={cellStyle}>2000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
