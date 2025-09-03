import React, { useState, FormEvent, useCallback, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

interface AddCarFormProps {
    onCarAdded: () => void;
    carToEdit?: any;
}

interface ImagePreview {
    id?: string;
    file?: File;
    url: string;
    isExisting?: boolean;
}

const AddCarForm: React.FC<AddCarFormProps> = ({ onCarAdded, carToEdit }) => {
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [CarForReason, setCarForReason] = useState("");
    const [images, setImages] = useState<ImagePreview[]>([]);
    const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (carToEdit) {
            setMake(carToEdit.make || "");
            setModel(carToEdit.model || "");
            setYear(carToEdit.year?.toString() || "");
            setDescription(carToEdit.description || "");
            setPrice(carToEdit.price?.toString() || "");
            setCarForReason(carToEdit.CarForReason || "");

            if (carToEdit.images) {
                const existingImages = carToEdit.images.map((img: string) => ({
                    url: `${process.env.REACT_APP_API_URL}${img}`,
                    isExisting: true,
                    id: img.split('/').pop()
                }));
                setImages(existingImages);
            }
        }
    }, [carToEdit]);

    const validateForm = (): boolean => {
        setError("");

        if (!make || !model || !year || !description || !price || !CarForReason) {
            setError("Please fill in all required fields");
            return false;
        }

        if (!images.length) {
            setError("Please add at least one image");
            return false;
        }

        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(year);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
            setError(`Year must be between 1900 and ${currentYear + 1}`);
            return false;
        }

        if (isNaN(Number(price)) || Number(price) <= 0) {
            setError("Please enter a valid price");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        const formData = new FormData();

        images.forEach((image) => {
            if (image.file) {
                formData.append("images", image.file);
            }
        });

        formData.append("deletedImages", JSON.stringify(deletedImageIds));
        formData.append("make", make);
        formData.append("model", model);
        formData.append("year", year);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("CarForReason", CarForReason);

        try {
            if (carToEdit) {
                await updateCar(formData);
            } else {
                await addCar(formData);
            }
            resetForm();
            onCarAdded();
        } catch (error) {
            setError("An error occurred while saving the car");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setMake("");
        setModel("");
        setYear("");
        setDescription("");
        setPrice("");
        setCarForReason("");
        setImages([]);
        setDeletedImageIds([]);
        setError("");
    };

    const addCar = async (formData: FormData) => {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/cars`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    };

    const updateCar = async (formData: FormData) => {
        await axios.put(
            `${process.env.REACT_APP_API_URL}/api/cars/${carToEdit._id}`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newImages = acceptedFiles.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    }, []);

    const removeImage = (index: number) => {
        const imageToRemove = images[index];
        if (imageToRemove.isExisting && imageToRemove.id) {
            setDeletedImageIds(prev => [...prev, imageToRemove.id!]);
        }
        if (!imageToRemove.isExisting && imageToRemove.url) {
            URL.revokeObjectURL(imageToRemove.url);
        }
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        }
    });

    return (
        <div className="flex justify-center">
            <form className="w-full max-w-md" onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-500 text-white rounded">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                        Make *
                    </label>
                    <input
                        type="text"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                        Model *
                    </label>
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                        Year *
                    </label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                        Description *
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                        rows={4}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                        Price * (£)
                    </label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                        Car For Reason *
                    </label>
                    <select
                        value={CarForReason}
                        onChange={(e) => setCarForReason(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                        required
                    >
                        <option value="">Select a reason</option>
                        <option value="MusicVideo">Music Video</option>
                        <option value="Chauffeur">Chauffeur</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">
                        Images *
                    </label>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed p-4 text-center mb-4 rounded cursor-pointer ${
                            isDragActive ? "border-blue-500 bg-blue-500 bg-opacity-10" : "border-gray-600"
                        }`}
                    >
                        <input {...getInputProps()} />
                        <p className="text-gray-300">
                            {isDragActive
                                ? "Drop the images here..."
                                : "Drag and drop images, or click to select files"}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                            Accepted formats: JPG, JPEG, PNG, WebP
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={image.url}
                                    alt={`Preview ${index}`}
                                    className="w-full h-32 object-cover rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors ${
                        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                    }`}
                >
                    {loading ? "Saving..." : (carToEdit ? "Update Car" : "Add Car")}
                </button>
            </form>
        </div>
    );
};

export default AddCarForm;