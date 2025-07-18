// import React, { useEffect, useState } from "react";
// import Sidebar from "../../components/admin/Sidebar";
// import { getLoads } from "../../services/admin/adminapi";

// interface ILoad {
//     material: string,
//     quantity: string,
//     transportationRent: string,
//     createdAt: Date,
// }


// const Load: React.FC = () => {

//     const [loads, setLoads] = useState<ILoad[]>([]);
//     const [page, setPage] = useState<number>(1);
//     const [totalPages, setTotalPages] = useState<number>(10);
//     const limit = 7;

//     useEffect(() => {
//         const findLoads = async () => {
//             try {
//                 const response: any = await getLoads(page, limit);
//                 // Convert createdAt to a Date object
//                 const formattedLoads = response.loadData.map((load: any) => ({
//                     ...load,
//                     createdAt: new Date(load.createdAt),
//                 }));
//                 setLoads(formattedLoads || []);
//                 setTotalPages(response.totalPages)
//             } catch (error) {
//                 console.log(error);
//             }
//         };
//         findLoads();
//     }, [page]);

//     console.log(loads);


//     return (
//         <>
//             <div className="flex min-h-screen bg-gray-50">
//                 <Sidebar />

//                 <div className="min-h-screen w-full bg-blue-50 flex justify-center p-6 pt-10">
//                     <div className="w-full h-fit bg-white rounded-lg shadow-md p-4">
//                         <div className="flex items-center justify-between bg-gray-100 text-lg p-3 rounded-md text-gray-600 font-bold">
//                             <div className="w-1/5">Material</div>
//                             <div className="w-1/4">Quantity</div>
//                             <div className="w-1/5">TransportationRent</div>
//                             <div className="w-1/6">Date</div>
//                             {/* <div className="w-1/6">Details</div> */}
//                         </div>

//                         {loads.map((load, index) => (
//                             <div key={index} className="flex items-center justify-between bg-white p-3 my-2 font-semibold rounded-md shadow-sm">
//                                 <div className="w-1/5 flex items-center">{load.material}</div>
//                                 <div className="w-1/4">{load.quantity}</div>
//                                 <div className="w-1/5">{load.transportationRent}</div>
//                                 <div className="w-1/6">{new Date(load.createdAt).toLocaleDateString()}</div>
//                                 {/* <div className="w-1/6">
//                                     <button className="px-4 py-1 bg-blue-500 text-white rounded-full">Details</button>
//                                 </div> */}
//                             </div>
//                         ))}

//                         {/* Pagination aligned right */}
//                         <div className="flex justify-center mt-6">
//                             <div className="inline-flex rounded-md shadow-sm">
//                                 <button
//                                     onClick={() => setPage(page - 1)}
//                                     disabled={page === 1}
//                                     className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md
//                             ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
//                                 >
//                                     Prev
//                                 </button>

//                                 {Array.from({ length: totalPages }, (_, i) => i + 1)
//                                     .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
//                                     .map((p) => (
//                                         <button
//                                             key={p}
//                                             onClick={() => setPage(p)}
//                                             className={`px-3 py-2 mx-1 text-sm rounded-md font-medium border border-gray-300
//                                     ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
//                                         >
//                                             {p}
//                                         </button>
//                                     ))}

//                                 <button
//                                     onClick={() => setPage(page + 1)}
//                                     disabled={page === totalPages}
//                                     className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md
//                             ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
//                                 >
//                                     Next
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//         </>
//     )
// }

// export default Load;



import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { getLoads } from "../../services/admin/adminapi"; // must accept search and dates
import toast from "react-hot-toast";

interface ILoad {
    material: string,
    quantity: string,
    transportationRent: string,
    createdAt: Date,
}

const Load: React.FC = () => {
    const [loads, setLoads] = useState<ILoad[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(10);
    const [search, setSearch] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [dateError, setDateError] = useState('');
    const limit = 7;

    const [debouncedSearch, setDebouncedSearch] = useState(search);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                setDateError("Start date cannot be after end date.");
            } else {
                setDateError(""); // No error
            }
        }
    }, [startDate, endDate]);

    useEffect(() => {
        const findLoads = async () => {
            try {
                if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
                    toast.error("Start date cannot be after end date.");
                    return;
                }
                const response: any = await getLoads(page, limit, debouncedSearch, startDate, endDate);
                const formattedLoads = response.loadData.map((load: any) => ({
                    ...load,
                    createdAt: new Date(load.createdAt),
                }));
                setLoads(formattedLoads || []);
                setTotalPages(response.totalPages);
            } catch (error) {
                console.log(error);
            }
        };
        findLoads();
    }, [page, debouncedSearch, startDate, endDate]);

    console.log(startDate);
    console.log(endDate);
    console.log(search);



    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="min-h-screen w-full bg-blue-50 flex justify-center p-6 pt-10">
                <div className="w-full h-fit bg-white rounded-lg shadow-md p-4">
                    {/* 🔍 Filter Section */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search by material"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-3 py-2 border rounded-md w-1/4"
                        />
                        <input
                            type="date"
                            value={startDate}
                            disabled={!!dateError}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                            max={new Date().toISOString().split("T")[0]}
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                            max={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    {dateError && (
                        <p className="text-red-500 text-sm mt-2">{dateError}</p>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between bg-gray-100 text-lg p-3 rounded-md text-gray-600 font-bold">
                        <div className="w-1/5">Material</div>
                        <div className="w-1/4">Quantity</div>
                        <div className="w-1/5">Transportation Rent</div>
                        <div className="w-1/6">Date</div>
                    </div>

                    {/* Rows */}
                    {loads.map((load, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 my-2 font-semibold rounded-md shadow-sm">
                            <div className="w-1/5">{load.material}</div>
                            <div className="w-1/4">{load.quantity}</div>
                            <div className="w-1/5">{load.transportationRent}</div>
                            <div className="w-1/6">{new Date(load.createdAt).toLocaleDateString()}</div>
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-center mt-6">
                        <div className="inline-flex rounded-md shadow-sm">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md
                                    ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                                .map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`px-3 py-2 mx-1 text-sm rounded-md font-medium border border-gray-300
                                            ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {p}
                                    </button>
                                ))}

                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md
                                    ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Load;
