'use client';
import Image from 'next/image';
import React from 'react';
const PayslipPage: React.FC = () => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#000',
        maxWidth: '900px',
        margin: 'auto',
        boxShadow: 'blue',
        border: '1px solid gray ',
        borderRadius: '6px',
      }}
    >
      {/* Header */}
      <div
        style={{
          width: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Image
          src='/payroll/imglogo.png'
          alt='TriNitS Technologies Logo'
          width={120}
          height={60}
          unoptimized
          style={{
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h2 className='text-4xl m-0 text-red-600'>TriNitS Technologies 0</h2>
          <p style={{ fontSize: '15px', margin: 0 }}>
            Naidupeta 0, Nellore 0, Andhra Pradesh, 524421.
          </p>
          <h3 style={{ fontSize: '20px', margin: '0' }}> Payslip for the month of 2025-08-04</h3>
        </div>
      </div>

      {/* Employee Info Table */}
      <table style={tableStyle}>
        <tbody>
          <tr>
            <td style={tdStyle}>Name:</td>
            <td style={borderRightStyle}>TriNitS0</td>
            <td style={tdStyle}>Employee No:</td>
            <td style={tdStyle}>TRINITS-1</td>
          </tr>
          <tr>
            <td style={tdStyle}>Joining Date:</td>
            <td style={borderRightStyle}>07 Feb 2022</td>
            <td style={tdStyle}>Bank Name:</td>
            <td style={tdStyle}>Indian Bank</td>
          </tr>
          <tr>
            <td style={tdStyle}>Designation:</td>
            <td style={borderRightStyle}>Software Engineer</td>
            <td style={tdStyle}>Bank Account No:</td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={tdStyle}>Department:</td>
            <td style={borderRightStyle}>Gumps</td>
            <td style={tdStyle}>PAN Number:</td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={tdStyle}>Location:</td>
            <td style={borderRightStyle}>Naidupeta 0</td>
            <td style={tdStyle}>PF No:</td>
            <td style={tdStyle}>1001034467</td>
          </tr>
          <tr>
            <td style={tdStyle}>Effective Work Days:</td>
            <td style={borderRightStyle}>30</td>
            <td style={tdStyle}>PF UAN:</td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={tdStyle}>LOP:</td>
            <td style={borderRightStyle}>0</td>
            <td style={tdStyle}>SL Closing Balance:</td>
            <td style={tdStyle}>0.5</td>
          </tr>
          <tr>
            <td style={tdStyle}>OTHERS:</td>
            <td style={borderRightStyle}>0</td>
            <td style={tdStyle}>PL Closing Balance:</td>
            <td style={tdStyle}>0.5</td>
          </tr>
        </tbody>
      </table>

      {/* Salary Table */}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Earnings</th>
            <th style={{ ...thStyle, paddingLeft: '30px' }}>Full</th>
            <th style={{ ...thStyle, borderRight: '1px solid black' }}>Actual</th>
            <th style={thStyle}>Deductions</th>
            <th style={thStyle}>Actual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>BASIC</td>
            <td style={tdStyle}>11613</td>
            <td style={borderRightStyle}>11613</td>
            <td style={tdStyle}>PF</td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={tdStyle}>HRA</td>
            <td style={tdStyle}>4645</td>
            <td style={borderRightStyle}>4645</td>
            <td style={tdStyle}>PROF TAX</td>
            <td style={tdStyle}>200</td>
          </tr>
          <tr>
            <td style={tdStyle}>SPECIAL ALLOWANCE</td>
            <td style={tdStyle}>4065</td>
            <td style={borderRightStyle}>4065</td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={tdStyle}>LTA</td>
            <td style={tdStyle}>871</td>
            <td style={borderRightStyle}>871</td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={tdStyle}>BUSINESS ATTIRE</td>
            <td style={tdStyle}></td>
            <td style={borderRightStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={tdStyle}>FOOD COUPON</td>
            <td style={tdStyle}></td>
            <td style={borderRightStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={tdStyle}>BOOKS AND PERIODICALS</td>
            <td style={tdStyle}></td>
            <td style={borderRightStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
          </tr>
          <tr>
            <td style={bottomCell}>PROFESSIONAL ALLOWANCE</td>
            <td style={bottomCell}>1161</td>
            <td style={{ ...bottomCell, borderRight: '1px solid black' }}>1161</td>
            <td style={bottomCell}></td>
            <td style={bottomCell}></td>
          </tr>
          <tr style={{ fontWeight: 'bold' }}>
            <td style={bottomCell}>Total Earnings: INR</td>
            <td style={bottomCell}>29032</td>
            <td style={borderRightStyle}>29032</td>
            <td style={bottomCell}>Total Deductions: INR</td>
            <td style={bottomCell}>200</td>
          </tr>
          <tr>
            <td style={bottomCell}>
              Net Pay for the month ( Total Earnings - Total Deductions ): <strong>28832</strong> (
              <strong>28832</strong>)
            </td>
            <td style={bottomCell}></td>
            <td style={bottomCell}></td>
            <td style={bottomCell}></td>
            <td style={bottomCell}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #000',
  marginTop: '10px',
};

const tdStyle: React.CSSProperties = {
  padding: '8px',
  textAlign: 'left',
};

const thStyle: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid #000',
  textAlign: 'left',
};

const borderRightStyle: React.CSSProperties = {
  padding: '8px',
  borderRight: '1px solid black',
};

const bottomCell: React.CSSProperties = {
  borderBottom: '1px solid #000',
  padding: '8px',
};

export default PayslipPage;
