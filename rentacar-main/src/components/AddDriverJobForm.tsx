import React, { useState, FormEvent } from "react";
import axios from "axios";

interface AddDriverJobFormProps {
    onJobAdded: () => void;
}

const AddDriverJobForm: React.FC<AddDriverJobFormProps> = ({ onJobAdded }) => {
    const [title, setTitle] = useState("");
    const [pay, setPay] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const newJob = { title, pay, description, taken: false };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/jobs`, newJob);
            setTitle("");
            setPay("");
            setDescription("");
            onJobAdded();
        } catch (error) {
            console.error("Error adding job:", error);
        }
    };

    return (
        <div className="flex justify-center">
            <form className="w-full max-w-md" onSubmit={handleSubmit}>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2">
                            Job Title
                        </label>
                        <input
                            className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-600"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2">
                            Job Pay
                        </label>
                        <input
                            className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-600"
                            type="text"
                            value={pay}
                            onChange={(e) => setPay(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2">
                            Job Description
                        </label>
                        <input
                            className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-600"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Add Job
                </button>
            </form>
        </div>
    );
};

export default AddDriverJobForm;
