// "use client";

// import { useState } from "react";
// import AppLayout from "../../../AppLayout";



// export default function ReimbursementForm() {
//     const [type, setType] = useState("");
//     const [date, setDate] = useState("");
//     const [amount, setAmount] = useState("");
//     const [description, setDescription] = useState("");

//     const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         // Handle form submission logic here
//         console.log({ type, date, amount });
//     };

//     return (
//         <AppLayout>
//             <div className="min-h-screen bg-gray-50 p-6">
//                 <div className="bg-white shadow-md rounded-xl p-6 w-[900px] mx-auto">
//                     <h1 className="text-xl font-bold mb-4">Claim a Reimbursement</h1>

//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         {/* Type */}
//                         <div>
//                             <label className="block mb-1 text-sm font-medium">Type</label>
//                             <select
//                                 value={type}
//                                 onChange={(e) => setType(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-lg p-2"
//                                 required
//                             >
//                                 <option value="">Please pick a type</option>
//                                 <option value="Travel">Travel</option>
//                                 <option value="Hotel & Accommodation">Hotel & Accommodation</option>
//                                 <option value="Food">Food</option>
//                                 <option value="Medical">Medical</option>
//                                 <option value="Telephone">Telephone</option>
//                                 <option value="Fuel">Fuel</option>
//                                 <option value="Imprest">Imprest</option>
//                                 <option value="Other">Other</option>
//                             </select>
//                         </div>

//                         {/* Date */}
//                         <div>
//                             <label className="block mb-1 text-sm font-medium">Date</label>
//                             <input
//                                 type="date"
//                                 value={date}
//                                 onChange={(e) => setDate(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-lg p-2"
//                                 required
//                             />
//                         </div>

//                         {/* Amount */}
//                         <div>
//                             <label className="block mb-1 text-sm font-medium">Amount</label>
//                             <input
//                                 type="number"
//                                 value={amount}
//                                 onChange={(e) => setAmount(e.target.value)}
//                                 placeholder="Enter amount"
//                                 className="w-full border border-gray-300 rounded-lg p-2"
//                                 required
//                             />
//                         </div>
//                         <div>
//                             <label className="block mb-1 text-sm font-medium">Description</label>
//                             <textarea
//                                 value={description}
//                                 onChange={(e) => setDescription(e.target.value)}
//                                 placeholder="Enter description"
//                                 className="w-full border border-gray-300 rounded-lg p-2 h-28 resize-none focus:ring-2"
//                                 required
//                             />
//                         </div>

//                         {/* Submit */}
//                         <button
//                             type="submit"
//                             className="bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700"
//                         >
//                             Request Reimbursement
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }
