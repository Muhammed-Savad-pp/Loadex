import React, { useCallback, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { useEffect } from "react";
import { getTransporter, updateTransporterBlockandUnblock } from "../../services/admin/adminapi";
import toast from "react-hot-toast";
import DataTable from "../../components/admin/DataTable";
import { debounce } from "lodash";

export interface ITransporter {
    _id: string
    transporterName: string;
    email: string;
    phone: string;
    isBlocked: boolean;
    profileImage: string;
}
const Transporter: React.FC = () => {

    const [transporter, setTransporter] = useState<ITransporter[]>([])
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number>(10);
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    const limit = 7;

    const debounceSearch = useCallback(
        debounce((value: string) => {
            setDebouncedSearch(value);
        }, 1000),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        debounceSearch(e.target.value)
    }



    useEffect(() => {

        const fetchTransporter = async () => {

            const response: any = await getTransporter(debouncedSearch, page, limit)
            setTransporter(response.transporterData);
            setTotalPages(response.totalPages)

        }

        fetchTransporter()

    }, [page, debouncedSearch])

    

    const handleBlockUnBlock = async (id: string) => {
        try {

            const response: any = await updateTransporterBlockandUnblock(id);
            toast.success(response);

            setTransporter((prev) =>
                prev.map((transporter) =>
                    transporter._id === id ? { ...transporter, isBlocked: !transporter.isBlocked } : transporter
                ))

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong')
        }
    }

    const columns = [
        { header: "Name", key: "transporterName" as keyof ITransporter },
        { header: "Email", key: "email" as keyof ITransporter },
        { header: "Mobile", key: "phone" as keyof ITransporter },
    ];


    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />

                <div className="min-h-screen w-full bg-blue-50   p-6 pt-10">
                    <div className="mb-4 flex justify-between">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={handleSearchChange}
                            className="p-2 border rounded-md w-80"
                        />
                    </div>
                    < DataTable data={transporter} columns={columns} handleBlockUnBlock={handleBlockUnBlock} />

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

export default Transporter