import React from 'react';

export interface RequestedJob {
  _id: string;
  driversNeeded: number;
  budget: string;
  daysRequired: number;
  contactNumber: string;
  description: string;
}

interface RequestedDriverJobTableProps {
  jobs: RequestedJob[];
  deleteJob: (id: string) => void;
}

const RequestedDriverJobTable: React.FC<RequestedDriverJobTableProps> = ({ jobs, deleteJob }) => {
  const handleDelete = (id: string) => {
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
            <th className="px-4 py-2">Drivers Needed</th>
            <th className="px-4 py-2">Budget</th>
            <th className="px-4 py-2">Days Required</th>
            <th className="px-4 py-2">Contact Number</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr className="bg-gray-600 text-gray-300" key={job._id}>
              <td className="border px-4 py-2">{job.driversNeeded}</td>
              <td className="border px-4 py-2">{job.budget}</td>
              <td className="border px-4 py-2">{job.daysRequired}</td>
              <td className="border px-4 py-2">{job.contactNumber}</td>
              <td className="border px-4 py-2">{job.description}</td>
              <td className="border px-4 py-2">
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

export default RequestedDriverJobTable;