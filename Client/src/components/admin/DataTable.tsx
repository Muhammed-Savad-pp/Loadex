
interface TableColumn<T> {
    header: string;
    key: keyof T;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    handleBlockUnBlock?: (id: string) => void;
}

const DataTable = <T extends { _id: string; isBlocked: boolean }>({
    data,
    columns,
    handleBlockUnBlock,
}: DataTableProps<T>) => {
    return (
        <div className="w-full h-fit bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between bg-gray-100 text-lg p-3 rounded-md text-gray-600 font-bold">
                {columns.map((col) => (
                    <div key={col.key as string} className={`w-1/5 ${col.className || ""}`}>
                        {col.header}
                    </div>
                ))}
                <div className="w-1/6 text-center">Action</div>
                {/* <div className="w-1/6 text-center">Details</div> */}
            </div>

            {data.map((item) => (
                <div key={item._id} className="flex items-center justify-between bg-white p-3 my-2 font-semibold rounded-md shadow-sm">
                    {columns.map((col) => (
                        <div key={col.key as string} className={`w-1/5 ${col.className || ""}`}>
                            {(col.key === "shipperName" || col.key === "transporterName") ? (
                                <div className="flex items-center">
                                    <img src={(item as any).profileImage || "https://via.placeholder.com/30"} alt="User" className="w-8 h-8 rounded-full mr-3" />
                                    {String(item[col.key])}
                                </div>
                            ) : (
                                String(item[col.key])
                            )}
                        </div>
                    ))}
                    {handleBlockUnBlock && (
                        <div className="w-1/6 text-center">
                            <button
                                onClick={() => handleBlockUnBlock(item._id)}
                                className={`px-4 py-1 text-white rounded-full ${item.isBlocked ? "bg-red-500" : "bg-green-500"}`}
                            >
                                {item.isBlocked ? "Unblock" : "Block"}
                            </button>
                        </div>
                    )}
                    {/* <div className="w-1/6 text-center"> 
                        <button className="px-4 py-1 bg-blue-500 text-white rounded-full">Details</button>
                    </div> */}
                </div>
            ))}
        </div>
    );
};

export default DataTable;
