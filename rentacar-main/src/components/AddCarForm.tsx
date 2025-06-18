import React, { useState, FormEvent, useCallback, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

interface AddCarFormProps {
    onCarAdded: () => void;
    carToEdit?: any; // Add type definition based on your car model
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

    useEffect(() => {
        if (carToEdit) {
            setMake(carToEdit.make || "");
            setModel(carToEdit.model || "");
            setYear(carToEdit.year?.toString() || "");
            setDescription(carToEdit.description || "");
            setPrice(carToEdit.price?.toString() || "");
            setCarForReason(carToEdit.CarForReason || "");

            // Set existing images
            if (carToEdit.images) {
                const existingImages = carToEdit.images.map((img: any) => ({
                    id: img._id || img.id,
                    url: img.url,
                    isExisting: true
                }));
                setImages(existingImages);
            }
        }
    }, [carToEdit]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const formData = new FormData();

        // Append new images
        images.forEach((image, index) => {
            if (image.file) {
                formData.append("images", image.file);
            }
        });

        // Append deleted image IDs
        formData.append("deletedImages", JSON.stringify(deletedImageIds));

        formData.append("make", make);
        formData.append("model", model);
        formData.append("year", year);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("CarForReason", CarForReason);

        if (carToEdit) {
            await updateCar(formData);
        } else {
            await addCar(formData);
        }

        // Reset form
        resetForm();
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
    };

    const addCar = async (formData: FormData) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/cars`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            onCarAdded();
        } catch (error) {
            console.error("Error adding car:", error);
        }
    };

    const updateCar = async (formData: FormData) => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/cars/${carToEdit._id}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            onCarAdded();
        } catch (error) {
            console.error("Error updating car:", error);
        }
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
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        }
    });

    return (
        <div className="flex justify-center">
            <form className="w-full max-w-md" onSubmit={handleSubmit}>
                {/* Existing form fields remain the same */}

                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2">
                            Car Images
                        </label>
                        <div
                            {...getRootProps()}
                            className={`border-dashed border-2 p-4 text-center mb-4 ${
                                isDragActive ? "border-blue-500" : "border-gray-600"
                            }`}
                        >
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p>Drop the images here...</p>
                            ) : (
                                <p>Drag and drop images, or click to select files</p>
                            )}
                        </div>

                        {/* Image previews */}
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
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    {carToEdit ? 'Update Car' : 'Add Car'}
                </button>
            </form>
        </div>
    );
};

export default AddCarForm;