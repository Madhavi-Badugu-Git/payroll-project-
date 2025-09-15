"use client";

import { useState } from "react";
import AppLayout from "../../../AppLayout";

interface ReimbursementRecord {
    type: string;
    date: string;
    amount: number;
    description: string;
}

export default function ReimbursementTablePage() {
    const [showForm, setShowForm] = useState(false);
    const [leaveRecords, setLeaveRecords] = useState<ReimbursementRecord[]>([]);
    const [form, setForm] = useState<ReimbursementRecord>({
        type: "",
        date: "",
        amount: 0,
        description: "",
    });
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [message, setMessage] = useState<string>(""); // ✅ message state

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "amount" ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editIndex !== null) {
            // update existing
            const updated = [...leaveRecords];
            updated[editIndex] = form;
            setLeaveRecords(updated);
            setEditIndex(null);
        } else {
            // add new
            setLeaveRecords((prev) => [...prev, form]);
        }
        setForm({ type: "", date: "", amount: 0, description: "" });
        setShowForm(false);
    };

    const handleEdit = (index: number) => {
        setForm(leaveRecords[index]);
        setEditIndex(index);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
    };

    const handleDelete = (index: number) => {
        const updated = leaveRecords.filter((_, i) => i !== index);
        setLeaveRecords(updated);
        setMessage("Successfully deleted!");
        setTimeout(() => setMessage(""), 2000);
    };

    // Helper to format date as dd-mm-yyyy
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="bg-white shadow-md rounded-xl p-6 w-[900px] mx-auto">
                    {message && (
                        <div className="flex justify-end">
                            <div className="w-[300px] mb-4 p-3 text-red-800 bg-red-100 border border-black-500 rounded-md shadow">
                                {message}
                            </div>
                        </div>
                    )}


                    {/* Heading + Apply Button */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Reimbursement Management</h1>
                        <button
                            onClick={() => {
                                setForm({ type: "", date: "", amount: 0, description: "" });
                                setEditIndex(null);
                                setShowForm(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
                        >
                            Add Reimbursement
                        </button>
                    </div>

                    {/* Form toggler */}
                    {showForm ? (
                        <form
                            onSubmit={handleSubmit}
                            className="bg-gray-50 p-4 w-[500px] rounded-md border border-gray-200 mb-6"
                        >
                            <div className="mb-2">
                                <label className="block text-gray-700 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="border rounded px-2 py-1 w-full"
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Food">Food</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Stationery">Stationery</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <label className="block text-gray-700 mb-1">Date</label>
                                <input
                                    name="date"
                                    type="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    className="border rounded px-2 py-1 w-full"
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-gray-700 mb-1">Amount</label>
                                <input
                                    name="amount"
                                    type="number"
                                    value={form.amount}
                                    onChange={handleChange}
                                    className="border rounded px-2 py-1 w-full"
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="border rounded px-2 py-1 w-full"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md mt-2"
                            >
                                {editIndex !== null ? "Update Reimbursement" : "Request Reimbursement"}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ml-2 mt-2"
                            >
                                Cancel
                            </button>
                        </form>
                    ) : (
                        // Table only shows when form is hidden
                        <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 text-sm text-gray-700">
                                <thead className="bg-gray-50">
                                    <tr className="text-xs uppercase tracking-wider text-gray-600">
                                        <th className="px-6 py-4 text-left">Type</th>
                                        <th className="px-6 py-4 text-left">Date</th>
                                        <th className="px-6 py-4 text-left">Amount</th>
                                        <th className="px-6 py-4 text-left">Description</th>
                                        <th className="px-6 py-4 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-gray-500">
                                                No Reimbursement records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        leaveRecords.map((r, i) => (
                                            <tr key={i} className="border-t border-gray-100">
                                                <td className="px-6 py-4">{r.type}</td>
                                                <td className="px-6 py-4">{formatDate(r.date)}</td>
                                                <td className="px-6 py-4">₹{r.amount}</td>
                                                <td className="px-6 py-4">{r.description}</td>
                                                <td className="px-6 py-4 space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(i)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(i)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
