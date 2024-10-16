import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "./header";
import { AuthContext } from "../context/authContext";

interface Job {
    _id: string;
    title: string;
    description: string;
    pay: string;
    taken: boolean;
    acceptedByName?: string; // Optional field for accepted name
    acceptedByEmail?: string; // Optional field for accepted email
}

const DriversDashboard: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [user, setUser] = useState<{ name: string; email: string; isVerifiedDriver: boolean } | null>(null); // User state with isVerifiedDriver
    const { userId } = useContext(AuthContext);

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
                setUser(response.data);  // Ensure isVerifiedDriver is part of the user data
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
            console.log("Job accepted successfully:", response.data); // Log the response data
            fetchJobs(); // Refresh jobs data after accepting
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
            console.log("Job cancelled successfully:", response.data); // Log the response data
            fetchJobs(); // Refresh jobs data after cancelling
        } catch (error) {
            console.error("Error cancelling job:", error);
        }
    };

    useEffect(() => {
        fetchJobs();
        fetchUser(); // Fetch user information on component mount
    }, []);

    return (
        <div className="container mx-auto mt-20">
            <Header />
            <h1 className="text-3xl font-bold text-center">Drivers Dashboard</h1>

            {/* Check if the user is a verified driver */}
            {user && !user.isVerifiedDriver ? (
                <div className="text-center mt-10">
                    <h2 className="text-xl font-bold">Please email the following to example@email.com:</h2>
                    <ul className="list-disc list-inside mt-4">
                        <li>Full Name</li>
                        <li>Email</li>
                        <li>Front and Back of Licence</li>
                    </ul>
                </div>
            ) : (
                <div className="overflow-x-auto mt-10">
                    <table className="min-w-full bg-white">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Title</th>
                            <th className="py-2 px-4 border-b">Description</th>
                            <th className="py-2 px-4 border-b">Pay</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {jobs.map((job: Job) => (
                            <tr key={job._id}>
                                <td className="py-2 px-4 border-b">{job.title}</td>
                                <td className="py-2 px-4 border-b">{job.description}</td>
                                <td className="py-2 px-4 border-b">{job.pay}</td>
                                <td className="py-2 px-4 border-b">
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
                                        <span>Accepted by {job.acceptedByName}</span>
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
};

export default DriversDashboard;
