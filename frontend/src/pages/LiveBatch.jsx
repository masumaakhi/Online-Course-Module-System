// import React, { useState } from 'react';

// const LiveBatch = ({ courseId }) => {
//   const [loading, setLoading] = useState(false);
//   const [batchData, setBatchData] = useState({
//     batchName: '',
//     startTime: '',
//     meetingLink: '',
//     days: []
//   });

//   const weekDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

//   const handleDayToggle = (day) => {
//     setBatchData(prev => ({
//       ...prev,
//       days: prev.days.includes(day) 
//         ? prev.days.filter(d => d !== day) 
//         : [...prev.days, day]
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       // আপনার API এন্ডপয়েন্ট অনুযায়ী এখানে ফেচ কল হবে
//       // মনে রাখবেন, লাইভ ব্যাচের জন্য ব্যাকএন্ডে আলাদা মডেল বা ফিল্ড থাকা লাগবে
//       const response = await fetch(`/api/courses/${courseId}/live-batch`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify(batchData)
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert('Live Batch Created Successfully!');
//       }
//     } catch (error) {
//       console.error("Error creating live batch:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Create Live Batch</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
        
//         {/* ব্যাচের নাম */}
//         <div>
//           <label className="block text-sm font-medium">Batch Name</label>
//           <input 
//             type="text" 
//             className="w-full p-2 border rounded" 
//             placeholder="e.g. Batch 01 - MERN Stack"
//             onChange={(e) => setBatchData({...batchData, batchName: e.target.value})}
//             required
//           />
//         </div>

//         {/* ক্লাসের সময় */}
//         <div>
//           <label className="block text-sm font-medium">Class Time</label>
//           <input 
//             type="time" 
//             className="w-full p-2 border rounded" 
//             onChange={(e) => setBatchData({...batchData, startTime: e.target.value})}
//             required
//           />
//         </div>

//         {/* লাইভ লিঙ্ক */}
//         <div>
//           <label className="block text-sm font-medium">Meeting Link (Zoom/Google Meet)</label>
//           <input 
//             type="url" 
//             className="w-full p-2 border rounded" 
//             placeholder="https://zoom.us/j/..."
//             onChange={(e) => setBatchData({...batchData, meetingLink: e.target.value})}
//             required
//           />
//         </div>

//         {/* বার নির্বাচন (Days) */}
//         <div>
//           <label className="block text-sm font-medium mb-2">Class Days</label>
//           <div className="flex flex-wrap gap-2">
//             {weekDays.map(day => (
//               <button
//                 key={day}
//                 type="button"
//                 onClick={() => handleDayToggle(day)}
//                 className={`px-3 py-1 text-xs rounded-full border ${
//                   batchData.days.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-100'
//                 }`}
//               >
//                 {day}
//               </button>
//             ))}
//           </div>
//         </div>

//         <button 
//           type="submit" 
//           disabled={loading}
//           className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
//         >
//           {loading ? 'Creating...' : 'Launch Live Batch'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default LiveBatch;


import React from 'react'

const LiveBatch = () => {
  return (
    <div className='text-3xl text-center pt-5 mt-3'>The Live Batch feature is coming very soon!</div>
  )
}

export default LiveBatch;