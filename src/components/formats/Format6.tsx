'use client';

import Image from 'next/image';
import React from 'react';
const PayslipPage: React.FC = () => {
  return (
    <div
      style={{
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#000',
        border: '1px solid gray',
        width: 'fit-content',
        margin: '20px auto',
      }}
    >
      {/* Company Info */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Image
          src='/payroll/imglogo.png'
          alt='TriNitS Technologies Logo'
          width={180}
          height={80}
          unoptimized
          style={{
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <div
          style={{
            textAlign: 'center',
            flex: 1,
            marginTop: '-50px', // move upward
          }}
        >
          <div className='text-right'>
            <h2 className='text-lg font-bold text-red-600'>TriNitS Technologies</h2>
            <p className='text-sm'>
              Naidupeta 0, Nellore 0,
              <br />
              Andhra Pradesh, 524421
            </p>
          </div>
        </div>
      </div>

      {/* Employee Details Table */}
      <table
        style={{
          width: '900px',
          borderCollapse: 'collapse',
          marginBottom: '20px',
          border: '1px solid #000',
        }}
      >
        <tbody>
          <tr>
            <th style={cellStyle}>Name:</th>
            <th style={cellWithDivider}>TriNitSO</th>
            <th style={cellStyle}>Employee No:</th>
            <th style={cellStyle}>TRINITS-1</th>
          </tr>
          <tr>
            <td style={cell}>Name:</td>
            <td style={cell}>TriNitS0</td>
            <td style={cell}>Department:</td>
            <td style={cell}>CTO-Office</td>
          </tr>
          <tr>
            <td style={cell}>Date of Joining:</td>
            <td style={cell}>15 Jul 2022</td>
            <td style={cell}>Designation:</td>
            <td style={cell}>Software engineer</td>
          </tr>
          <tr>
            <td style={cell}>Bank Name:</td>
            <td style={cell}>HDFC</td>
            <td style={cell}>Total Days:</td>
            <td style={cell}>0</td>
          </tr>
          <tr>
            <td style={cell}>Bank Acc. No:</td>
            <td style={cell}>98799876688</td>
            <td style={cell}>LOP:</td>
            <td style={cell}>0</td>
          </tr>
          <tr>
            <td style={cell}>PF No:</td>
            <td style={cell}>BG/BNG/989989</td>
            <td style={cell}>PF UAN:</td>
            <td style={cell}>101779530896</td>
          </tr>
          <tr>
            <td style={cell}>ESI No:</td>
            <td style={cell}>-</td>
            <td style={cell}>Work Days:</td>
            <td style={cell}>30</td>
          </tr>
          <tr>
            <td style={cell}>PAN No:</td>
            <td style={cell}>EPPP0583H</td>
            <td style={cell}>Effective Work Days:</td>
            <td style={cell}>30</td>
          </tr>
        </tbody>
      </table>

      {/* Earnings and Deductions Table */}
      <table
        style={{
          width: '900px',
          border: '1px solid #000',
          marginBottom: '20px',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr
            style={{
              fontWeight: 'bold',
              borderBottom: '1px solid black',
              borderTop: '1px solid black',
            }}
          >
            <td style={{ borderLeft: 'none', borderRight: 'none', padding: '8px' }}>Earnings</td>
            <td style={{ borderRight: '1px solid black', padding: '8px' }}>Rs </td>
            <td style={{ borderLeft: 'none', borderRight: 'none', padding: '8px' }}>Deductions</td>
            <td style={{ borderLeft: 'none', borderRight: 'none', padding: '8px' }}>Rs</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={noBorderCell}>BASIC</td>
            <td style={{ borderRight: '1px solid black', padding: '8px' }}>11613 </td>
            <td style={noBorderCell}>PF</td>
            <td style={noBorderCell}>-</td>
          </tr>
          <tr>
            <td style={noBorderCell}>HRA</td>
            <td style={{ borderRight: '1px solid black', padding: '8px' }}>4645 </td>
            <td style={noBorderCell}>INCOME TAX</td>
            <td style={noBorderCell}>-</td>
          </tr>
          <tr>
            <td style={noBorderCell}>FBP SALARY</td>
            <td style={{ borderRight: '1px solid black', padding: '8px' }}>871 </td>
            <td style={noBorderCell}>PROF TAX</td>
            <td style={noBorderCell}>200</td>
          </tr>
          <tr>
            <td style={noBorderCell}>BONUS</td>
            <td style={{ borderRight: '1px solid black', padding: '8px' }}>4065 </td>
            <td style={noBorderCell}></td>
            <td style={noBorderCell}></td>
          </tr>
          <tr>
            <td style={noBorderCell}>SPECIAL ALLOWANCE</td>
            <td style={{ borderRight: '1px solid black', padding: '8px' }}> </td>
            <td style={noBorderCell}></td>
            <td style={noBorderCell}></td>
          </tr>
          <tr
            style={{
              fontWeight: 'bold',
              borderBottom: '1px solid black',
              borderTop: '1px solid black',
            }}
          >
            <td style={{ borderLeft: 'none', borderRight: 'none', padding: '8px' }}>
              Total Earnings: INR
            </td>
            <td style={{ borderLeft: 'none', borderRight: '1px solid black', padding: '8px' }}>
              29032
            </td>
            <td style={{ borderLeft: 'none', borderRight: 'none', padding: '8px' }}>
              Total Deductions: INR
            </td>
            <td style={{ borderLeft: 'none', borderRight: 'none', padding: '8px' }}>200</td>
          </tr>
        </tbody>
      </table>

      {/* Net Pay */}
      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Net Pay : Rs. 28832 (Rupees ... Only)</p>
    </div>
  );
};

/* Styles */
const cell: React.CSSProperties = {
  border: '1px solid #000',
  padding: '6px 8px',
  textAlign: 'left',
};

const noBorderCell: React.CSSProperties = {
  padding: '6px 8px',
  textAlign: 'left',
};
const cellStyle: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid #000', // only horizontal line
  borderLeft: 'none',
  borderRight: 'none',
  textAlign: 'left',
};

const cellWithDivider: React.CSSProperties = {
  ...cellStyle,
  borderRight: '1px solid #000', // adds the one vertical line
};
export default PayslipPage;
