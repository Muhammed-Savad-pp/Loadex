import React, { useEffect, useState } from 'react';
import { Search, UserPlus, UserCheck, UserX } from 'lucide-react';
import Navbar from '../../components/Common/Navbar/Navbar';
import ProfileSidebar from '../../components/tranporter/ProfileSidebar';
import { fetchFollowerAndFollowingDetails } from '../../services/transporter/transporterApi';
import ProfileComponent from '../../components/tranporter/ProfileComponent';
import { followShipper } from '../../services/transporter/transporterApi';


interface UserCardProps {
    user: ITransporterFolloweres;
    onFollowUpdate: (shipperId: string) => void;
}

interface ITransporterFolloweres {
    _id: string;
    followers: string[];
    followings: string[];
    profileImage: string;
    shipperName: string;
    followsBack: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFollowUpdate }) => {
    const [isFollowing, setIsFollowing] = useState<boolean>(user.followsBack);
    const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

    const handleFollow = async (shipperId: string) => {
        await followShipper(shipperId);
        setIsFollowing(true);
        onFollowUpdate(shipperId)
    }

    console.log(isFollowing);
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center">
            <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden cursor-pointer" onClick={() => setShowProfileModal(true)}>
                    <img src={user.profileImage} alt={user.shipperName} className="w-full h-full object-cover" />
                </div>
                <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">{user.shipperName}</h3>
                </div>
            </div>

            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs backdrop-brightness-75 bg-opacity-50">
                    <div className="relative bg-white rounded-lg w-full max-w-md mx-4 md:mx-auto overflow-auto max-h-[90vh]">
                        <button
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-700"
                            onClick={() => setShowProfileModal(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Profile Component */}
                        <ProfileComponent
                            shipperId={user._id}
                        />
                    </div>
                </div>
            )}

            {
                user.followsBack ?
                    <button className='px-4 py-2 rounded-lg flex items-center bg-gray-100 text-gray-800'>
                        <UserCheck size={18} className='mr-1' />
                        Following
                    </button>
                    :
                    <button onClick={() => handleFollow(user._id)} className='px-4 py-2 rounded-lg flex items-center bg-blue-600 text-white'>
                        <UserPlus size={18} className='mr-1' />
                        Follow
                    </button>
            }
        </div>
    );
};

const Network: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [shipperData, setShipperData] = useState<ITransporterFolloweres[]>([]);
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [followingsCount, setFollowingsCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(20);
    const limit = 5;

    useEffect(() => {
        const getfollowersAndFollowingsDetails = async () => {
            const response: any = await fetchFollowerAndFollowingDetails(activeTab, searchTerm, page, limit);
            setShipperData(response.datas);
            setFollowersCount(response.followersCount);
            setFollowingsCount(response.followingsCount);
            setTotalPages(response.totalPages)
        }
        getfollowersAndFollowingsDetails();
    }, [activeTab, searchTerm, page])

    // const filteredData = activeTab === 'followers'
    //     ? transporterFollowers.filter(shipper =>
    //         shipper.shipperName.toLowerCase().includes(searchTerm.toLowerCase())
    //     )
    //     : transporterFollowings.filter(user =>
    //         user.shipperName.toLowerCase().includes(searchTerm.toLowerCase())
    //     );

    const handleFollowUpdate = (shipperId: string) => {
        // setTransporterFollowers(prev => 
        //     prev.map(user => 
        //         user._id === shipperId ? { ...user, followsBack: true }: user
        //     )
        // );
        // setTransporterFollowings(prev => 
        //     prev.map(user => 
        //         user._id === shipperId ? { ...user, followsBack: true } : user
        //     )
        // )
        setShipperData(prev =>
            prev.map(user =>
                user._id === shipperId ? { ...user, followsBack: true } : user
            )
        )
    }

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen bg-gray-100 mt-10">
                <ProfileSidebar />
                <div className="flex-1 p-6">
                    <div className="bg-white rounded-lg shadow-md p-6 mt-3">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Network</h1>
                        {/* Tabs */}
                        <div className="flex border-b mb-6">
                            <button
                                className={`pb-4 px-6 font-medium ${activeTab === 'followers'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500'
                                    }`}
                                onClick={() => { setActiveTab('followers') , setPage(1)}}
                            >
                                Followers ({followersCount})
                            </button>
                            <button
                                className={`pb-4 px-6 font-medium ${activeTab === 'following'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500'
                                    }`}
                                onClick={() => { setActiveTab('following'), setPage(1)}}
                            >
                                Following ({followingsCount})
                            </button>
                        </div>
                        <div className="flex justify-between mb-6">
                            <div className="relative w-64">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            {shipperData.length > 0 ? (
                                shipperData.map(user => (
                                    <UserCard key={user._id} user={user} onFollowUpdate={handleFollowUpdate} />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <UserX size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700">No users found</h3>
                                    <p className="text-gray-500">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    </div>

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
            </div>
        </>
    );
};

export default Network;


