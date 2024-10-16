import React, { useState } from 'react';

export interface Job {
    _id: string;
    title: string;
    description: string;
    pay: string;
    taken: boolean;
    acceptedByEmail: string;
}

interface DriverJobTableProps {
    jobs: Job[];
    selectJob: (job: Job) => void;
    deleteJob: (id: string) => void;
}

const DriverJobTable: React.FC<DriverJobTableProps> = ({ jobs, selectJob, deleteJob }) => {
    const [showMoreMap, setShowMoreMap] = useState<{ [id: string]: boolean }>({});

    const toggleShowMore = (id: string) => {
        setShowMoreMap(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const handleDelete = (id: string) => {
        console.log(`Attempting to delete job with id: ${id}`);  // Debugging line
        if (id) {
            deleteJob(id);
        } else {
            console.error('Job ID is undefined');
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-center table-auto">
                <thead>
                <tr className="bg-gray-700 text-gray-300">
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Pay</th>
                    <th className="px-4 py-2">Taken</th>
                    <th className="px-3 py-2">Accepted By</th>
                    <th className="px-4 py-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                {jobs.map((job) => (
                    <tr className="bg-gray-600 text-gray-300" key={job._id}>
                        <td className="border px-4 py-2">{job.title}</td>
                        <td className="border text-xs px-4 py-2">
                            <div>
                                {showMoreMap[job._id] ? job.description : `${job.description.substring(0, 50)}...`}
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mr-2"
                                    onClick={() => toggleShowMore(job._id)}
                                >
                                    {showMoreMap[job._id] ? "show less" : "read more"}
                                </button>
                            </div>
                        </td>
                        <td className="border px-4 py-2">{job.pay}</td>
                        <td className="border px-4 py-2">{job.taken ? "Yes" : "No"}</td>
                        <td className="border px-4 py-2">{job.acceptedByEmail}</td>
                        <td className="border px-4 py-2">
                            <button
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline mr-2"
                                onClick={() => selectJob(job)}
                            >
                                Update
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                                onClick={() => handleDelete(job._id)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DriverJobTable;
