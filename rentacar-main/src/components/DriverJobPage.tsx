import React, { useState, useEffect, FormEvent, useContext } from "react";
import {AuthContext} from "../context/authContext";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./header";
import AddDriverJobForm from "./AddDriverJobForm";
import DriverJobTable from "./DriverJobTable";
import RequestedDriverJobTable from "./RequestedDriverJobTable";
import Footer from "./Footer";
import "../css/FooterFitsPage.css"

export interface Job {
    _id: string;
    title: string;
    description: string;
    pay: string;
    taken: boolean;
    acceptedByEmail: string;
}

export interface RequestedJob {
    _id: string;
    driversNeeded: number;
    budget: string;
    daysRequired: number;
    contactNumber: string;
    description: string;
}

const DriverJobPage: React.FC = () => {

    const [jobs, setJobs] = useState<Job[]>([]);
    const [requestedJobs, setRequestedJobs] = useState<RequestedJob[]>([]);
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobPay, setJobPay] = useState("");
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [showAddJobForm, setShowAddJobForm] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const { isAdmin } = useContext(AuthContext);

    const handleSidebarToggle = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
    };

    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`);
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const fetchRequestedJobs = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/requested-driver-jobs`); // Adjust based on API route
            setRequestedJobs(response.data);
        } catch (error) {
            console.error("Error fetching requested jobs:", error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);


    const updateJob = async (job: Job) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/jobs/${job._id}`, { title: jobTitle, description: jobDescription, pay: jobPay, taken: job.taken });
            fetchJobs();
        } catch (error) {
            console.error("Error updating job:", error);
        }
    };

    const deleteJob = async (jobId: string) => {
        console.log(`Deleting job with ID: ${jobId}`);  // Debugging line
        if (window.confirm(`Are you sure you want to delete the job?`)) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/jobs/${jobId}`);
                setJobs((prevState) => prevState.filter(job => job._id !== jobId));
            } catch (error) {
                console.error("Error deleting job:", error);
            }
        }
    };

    const deleteRequestedJob = async (jobId: string) => {
        if (window.confirm(`Are you sure you want to delete the requested job?`)) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/requested-driver-jobs/${jobId}`);
                setRequestedJobs((prevState) => prevState.filter(job => job._id !== jobId));
            } catch (error) {
                console.error("Error deleting requested job:", error);
            }
        }
    };

    const selectJob = (job: Job) => {
        setSelectedJob(job);
        setJobTitle(job.title);
        setJobDescription(job.description);
        setJobPay(job.pay);
    };

    const handleUpdateJob = async (e: FormEvent) => {
        e.preventDefault();
        if (selectedJob) {
            await updateJob({ ...selectedJob, title: jobTitle, description: jobDescription, pay: jobPay });
            resetJobForm();
        }
    };

    const resetJobForm = () => {
        setSelectedJob(null);
        setJobTitle("");
        setJobDescription("");
        setJobPay("");
    };

    const handleJobAdded = () => {
        setShowAddJobForm(false);
        fetchJobs();
    };

    const handleCancel = () => {
        resetJobForm();
    };
    return (
        <div style={{ marginTop: '30px' }} className="flex-container min-h-screen flex flex-col">
            {isAdmin ? (
                <div>
                    <Sidebar onToggle={handleSidebarToggle} />
                    <div className="min-h-screen bg-gray-800 text-white SizeScreen">
                        <Header sidebarCollapsed={isSidebarCollapsed}/>
                        <main className="flex-grow bg-gray-800 text-white p-4 flex-box">
                            <h1 className="text-4xl font-bold py-8 text-center">Admin Panel</h1>

                            <div className="flex justify-center">
                                {showAddJobForm && <AddDriverJobForm onJobAdded={handleJobAdded}/>}
                            </div>

                            <div>
                                <div className="flex flex-col mb-4">
                                    <h2 className="text-2xl font-bold text-center">Jobs</h2>
                                    <button
                                        className="bg-blue-500 w-40 hover:bg-blue-700 text-white font-bold py-2 self-center px-4 rounded focus:outline-none focus:shadow-outline"
                                        onClick={() => setShowAddJobForm(!showAddJobForm)}
                                    >
                                        {showAddJobForm ? 'Cancel' : 'Add a new Job'}
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <DriverJobTable jobs={jobs} selectJob={selectJob} deleteJob={deleteJob}/>
                                </div>
                            </div>


                            {selectedJob && (
                                <div className="p-4 bg-gray-700 rounded-lg">
                                    <h2 className="text-xl font-bold text-center mb-4">Update Job</h2>
                                    <form onSubmit={handleUpdateJob} className="space-y-4">
                                        <div>
                                            <label className="block text-white">Title:</label>
                                            <input
                                                type="text"
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-600 rounded-lg focus:outline-none focus:shadow-outline text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white">Description:</label>
                                            <textarea
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-600 rounded-lg focus:outline-none focus:shadow-outline text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white">Pay:</label>
                                            <input
                                                type="text"
                                                value={jobPay}
                                                onChange={(e) => setJobPay(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-600 rounded-lg focus:outline-none focus:shadow-outline text-white"
                                            />
                                        </div>
                                        <div className="flex justify-center space-x-4">
                                            <button
                                                type="submit"
                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                            >
                                                Update Job
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            <div>
                                <h2 className="text-3xl font-bold py-6">Requested Jobs</h2>
                                <RequestedDriverJobTable jobs={requestedJobs} deleteJob={deleteRequestedJob}/>
                            </div>
                        </main>
                        <Footer/>
                    </div>
                </div>
            ) : (
                <h1 className="text-4xl font-bold py-8 text-center">You are not authorized to view this page.</h1>
            )}
        </div>
    );
};

export default DriverJobPage