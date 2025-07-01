import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { getShipper } from "../../services/admin/adminapi";
import { updateSipperStatus } from "../../services/admin/adminapi";
import toast from "react-hot-toast";
import DataTable from "../../components/admin/DataTable";

export interface IShipper {
    _id: string
    shipperName: string;
    email: string;
    phone: string;
    isBlocked: boolean;
}


const Shipper: React.FC = () => {

    const [shipperData, setShipperData] = useState<IShipper[]>([]);
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number>(10);
    const limit = 2;


    useEffect(() => {
        const fetchShipper = async () => {

            const response: any = await getShipper(search, page, limit);
            setShipperData(response.shipperData);
            setTotalPages(response.totalPages)
        }
        
        fetchShipper()

    }, [page, search])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleBlockUnBlock = async (id: string) => {
        try {

            const response: any = await updateSipperStatus(id);
            toast.success(response);

            setShipperData((prev) =>
                prev.map((shipper) =>
                    shipper._id === id ? { ...shipper, isBlocked: !shipper.isBlocked } : shipper
                ))

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong')
        }
    }

    const columns = [
        { header: "Name", key: "shipperName" as keyof IShipper },
        { header: "Email", key: "email" as keyof IShipper },
        { header: "Mobile", key: "phone" as keyof IShipper },
    ];

    return (
        <><div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            {/* <div className="w-full h-fit  bg-white rounded-lg shadow-md p-4"> */}
            {/* <div className="flex items-center justify-between bg-gray-100 text-lg p-3 rounded-md text-gray-600 font-bold">
                        <div className="w-1/5">Name</div>
                        <div className="w-1/4">Email</div>
                        <div className="w-1/5">Mobile</div>
                        <div className="w-1/6 text-center">Action</div>
                        <div className="w-1/6 text-center">Details</div>
                    </div> */}

            {/* {shipperData.map((shipper, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 my-2 font-semibold rounded-md shadow-sm">
                            <div className="w-1/5 flex items-center">
                                <img
                                    src="https://via.placeholder.com/30"
                                    alt="User"
                                    className="w-8 h-8 rounded-full mr-3"
                                />
                                {shipper.shipperName}
                            </div>
                            <div className="w-1/4">{shipper.email}</div>
                            <div className="w-1/5">{shipper.phone}</div>
                            <div className="w-1/6 text-center">
                                {
                                    shipper.isBlocked ?
                                        <button onClick={() => handleBlockUnBlock(shipper._id)} className="px-4 py-1 text-white rounded-full bg-red-500 "> Block </button> :
                                        <button onClick={() => handleBlockUnBlock(shipper._id)} className="px-4 py-1 text-white rounded-full bg-green-500 "> UnBlock </button>
                                }

                            </div>
                            <div className="w-1/6 text-center">
                                <button className="px-4 py-1 bg-blue-500 text-white rounded-full">Details</button>
                            </div>
                        </div>
                    ))} */}
            {/* </div> */}

            <div className="min-h-screen w-full bg-blue-50  p-6 pt-10">
                <div className="mb-4 flex justify-between">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={handleSearch}
                        className="p-2 border rounded-md w-80"
                    />
                </div>
                <DataTable data={shipperData} columns={columns} handleBlockUnBlock={handleBlockUnBlock} />
                {/* { Pagination} */}
                <div className="flex justify-center mt-6 mr-5">
                    <div className="inline-flex rounded-md shadow-sm">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md cursor-pointer
                              ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                            Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                            .map((p) => (
                                <button className={`px-3 py-2 ml-1  mr-1 text-sm rounded-md font-medium border-t border-b border-gray-300 cursor-pointer
                              ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                    {p}
                                </button>
                            ))
                        }
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-md cursor-pointer
                              ${page === totalPages ? 'bg-gray-100 text-gray-400 not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}'}`}>
                            Next
                        </button>
                    </div>
                </div>

            </div>
        </div >

        </>
    )
}

export default Shipper