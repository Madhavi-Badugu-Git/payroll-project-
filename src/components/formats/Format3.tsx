"use client";
import Image from "next/image";
export default function PayslipTable() {
  const earningsDeductions: [string, string, string, string][] = [
    ["Basic", "11613", "Professional Tax", "200"],
    ["House Rent Allowance", "4645", "Income Tax", "0"],
    ["Conveyance Allowance", "1161", "", ""],
    ["Leave Travel Allowance", "1742", "", ""],
    ["Medical Allowance", "871", "", ""],
    ["Special Allowance", "4065", "", ""],
    ["Education Allowance", "4645", "", ""],
    ["Bonus", "290", "", ""],
    ["Gross Total :", "29032", "Net Salary :", "28832"],
  ];

  return (
    <div className="w-[1000px] min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="w-full max-w-5xl bg-white border border-gray-300 shadow-lg p-6">

        {/* Logo & Company Info */}
        <div className="grid grid-cols-2 border border-gray-400 mb-4">
          <div className="flex justify-center items-center p-4 border-r border-gray-400">
            <Image
              src="/payroll/imglogo.png"
              alt="TriNitS Technologies Logo"
              width={120}
              height={60}
              unoptimized
              style={{
                objectFit: "contain",
                display: "block"
              }}
            />
          </div>
          <div className="text-center p-4">
            <h2 className="text-lg font-bold text-red-600">TriNitS Technologies</h2>
            <p>Naidupeta, Nellore,<br />524421, Andhra Pradesh.</p>
            <p className="mt-1">
              Pay Slip for the month of{" "}
              <span className="font-semibold">2025-08-04</span>
            </p>
          </div>
        </div>

        {/* Single Unified Table */}
        <table className="w-full border border-gray-400 text-sm border-collapse">
          <tbody>
            {/* Company Name */}
            <tr>
              <td colSpan={4} className="p-2 font-bold text-center border-b border-gray-400">
                TriNits Technologies
              </td>
            </tr>

            {/* Employee Info */}
            <tr className="border-b border-gray-400">
              <td className="p-2 font-bold border-r border-gray-400">EMP Name</td>
              <td className="p-2 border-r border-gray-400">TriNitS0</td>
              <td className="p-2 font-bold border-r border-gray-400">EMP NO</td>
              <td className="p-2">TRINITS-1</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="p-2 font-bold border-r border-gray-400">Designation</td>
              <td className="p-2 border-r border-gray-400">Software Engineer</td>
              <td className="p-2 font-bold border-r border-gray-400">Bank Details</td>
              <td className="p-2">50202238836</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="p-2 font-bold border-r border-gray-400">PAN</td>
              <td className="p-2 border-r border-gray-400">PAN34162</td>
              <td className="p-2 font-bold border-r border-gray-400">Date Of Month/Year</td>
              <td className="p-2">2025-08-04</td>
            </tr>
            <tr className="border-b border-gray-400">
              <td className="p-2 font-bold border-r border-gray-400">NWD</td>
              <td className="p-2 border-r border-gray-400">30</td>
              <td className="p-2 font-bold border-r border-gray-400">Date of Joining</td>
              <td className="p-2">2025-05-07</td>
            </tr>

            {/* Earnings & Deductions Header */}
            <tr className="border-b border-gray-400 bg-gray-100">
              <td className="p-2 border-r border-gray-400 text-left" colSpan={2}>
                Gross Earnings
              </td>
              <td className="p-2 border-r border-gray-400 text-left" colSpan={2}>
                Deductions
              </td>
            </tr>
            <tr className="border-b border-gray-400 bg-gray-50">
              <td className="p-2 border-r border-gray-400">Description</td>
              <td className="p-2 border-r border-gray-400 text-right">Monthly Gross INR</td>
              <td className="p-2 border-r border-gray-400">Description</td>
              <td className="p-2 text-right">Monthly Deductions INR</td>
            </tr>

            {/* Earnings & Deductions Rows */}
            {earningsDeductions.map(([earnDesc, earnAmt, dedDesc, dedAmt], i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="p-2 border-r border-gray-300">{earnDesc || "\u00A0"}</td>
                <td className="p-2 border-r border-gray-300 text-right">{earnAmt || "\u00A0"}</td>
                <td className="p-2 border-r border-gray-300">{dedDesc || "\u00A0"}</td>
                <td className="p-2 text-right">{dedAmt || "\u00A0"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Note */}
        <div className="bg-green-600 text-white text-center text-xs p-2 mt-4">
          Note: This is a system generated payslip and does not require seal or signature
        </div>
      </div>
    </div>
  );
}
