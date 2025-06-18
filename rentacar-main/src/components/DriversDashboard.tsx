import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "./header";
import { AuthContext } from "../context/authContext";
import Sidebar from "./Sidebar";
import Messages from "./Messages";

interface Job {
    _id: string;
    title: string;
    description: string;
    pay: string;
    taken: boolean;
    acceptedByName?: string;
    acceptedByEmail?: string;
}

const DriversDashboard: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [user, setUser] = useState<{ name: string; email: string; isVerifiedDriver: boolean } | null>(null);
    const { userId } = useContext(AuthContext);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentView, setCurrentView] = useState<'jobs' | 'messages'>('jobs');

    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`);
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const fetchUser = async () => {
        if (!userId) {
            console.error("User ID is missing.");
            return;
        }
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
            if (response.status === 200) {
                setUser(response.data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const acceptJob = async (jobId: string) => {
        if (!user) {
            console.error("User information is missing.");
            return;
        }

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}`, {
                taken: true,
                acceptedByName: user.name,
                acceptedByEmail: user.email
            });
            console.log("Job accepted successfully:", response.data);
            fetchJobs();
        } catch (error) {
            console.error("Error accepting job:", error);
        }
    };

    const cancelJob = async (jobId: string) => {
        if (!user) {
            console.error("User information is missing.");
            return;
        }

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}`, {
                taken: false,
                acceptedByName: null,
                acceptedByEmail: null
            });
            console.log("Job cancelled successfully:", response.data);
            fetchJobs();
        } catch (error) {
            console.error("Error cancelling job:", error);
        }
    };

    const handleSidebarToggle = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
    };

    useEffect(() => {
        fetchJobs();
        fetchUser();
    }, [userId]);

    const renderJobsContent = () => (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center text-white mb-6">Available Jobs</h1>

            {user && !user.isVerifiedDriver ? (
                <div className="text-center mt-10 bg-gray-700 p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Please email the following to example@email.com:</h2>
                    <ul className="list-disc list-inside mt-4 text-white">
                        <li>Full Name</li>
                        <li>Email</li>
                        <li>Front and Back of Licence</li>
                    </ul>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                        <thead className="bg-gray-800">
                        <tr>
                            <th className="py-3 px-4 text-white">Title</th>
                            <th className="py-3 px-4 text-white">Description</th>
                            <th className="py-3 px-4 text-white">Pay</th>
                            <th className="py-3 px-4 text-white">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {jobs.map((job: Job) => (
                            <tr key={job._id} className="border-b border-gray-600">
                                <td className="py-3 px-4 text-white">{job.title}</td>
                                <td className="py-3 px-4 text-white">{job.description}</td>
                                <td className="py-3 px-4 text-white">{job.pay}</td>
                                <td className="py-3 px-4">
                                    {!job.taken ? (
                                        <button
                                            onClick={() => acceptJob(job._id)}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        >
                                            Accept
                                        </button>
                                    ) : job.acceptedByEmail === user?.email ? (
                                        <button
                                            onClick={() => cancelJob(job._id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        >
                                            Cancel
                                        </button>
                                    ) : (
                                        <span className="text-white">Accepted by {job.acceptedByName}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-800">
            <Sidebar onToggle={handleSidebarToggle} isDriver={true} />
            <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300`}>
                <Header sidebarCollapsed={isSidebarCollapsed}/>
                <div className="p-4">
                    <nav className="mb-4">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setCurrentView('jobs')}
                                className={`px-4 py-2 rounded-lg ${
                                    currentView === 'jobs'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                Jobs
                            </button>
                            <button
                                onClick={() => setCurrentView('messages')}
                                className={`px-4 py-2 rounded-lg ${
                                    currentView === 'messages'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                Messages
                            </button>
                        </div>
                    </nav>

                    {currentView === 'jobs' && renderJobsContent()}
                    {currentView === 'messages' && <Messages />}
                </div>
            </div>
        </div>
    );
};

export default DriversDashboard;