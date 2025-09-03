import React, { FormEvent, useState } from "react";

interface UpdateCarFormProps {
    make: string;
    model: string;
    year: string;
    description: string;
    price: string;
    CarForReason: string;
    onMakeChange: (value: string) => void;
    onModelChange: (value: string) => void;
    onYearChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    onCarForReasonChange: (value: string) => void;
    onUpdateCar: (e: FormEvent) => void;
    onCancel: () => void;
    onImagesChange: (files: FileList) => void;
    currentImages?: string[];
}

const UpdateCarForm: React.FC<UpdateCarFormProps> = ({
                                                         make,
                                                         model,
                                                         year,
                                                         description,
                                                         price,
                                                         CarForReason,
                                                         onMakeChange,
                                                         onModelChange,
                                                         onYearChange,
                                                         onDescriptionChange,
                                                         onPriceChange,
                                                         onCarForReasonChange,
                                                         onUpdateCar,
                                                         onCancel,
                                                         onImagesChange,
                                                         currentImages
                                                     }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Safely coerce props to strings so fields always "autofill" when data arrives
    const safeMake = make ?? "";
    const safeModel = model ?? "";
    const safeYear = year ?? "";
    const safeDescription = description ?? "";
    const safePrice = price ?? "";
    const safeCarForReason = CarForReason ?? "";

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!safeMake.trim()) newErrors.make = "Make is required.";
        if (!safeModel.trim()) newErrors.model = "Model is required.";

        const yearNum = Number(safeYear);
        if (!safeYear.trim()) {
            newErrors.year = "Year is required.";
        } else if (!Number.isFinite(yearNum) || yearNum < 1886 || yearNum > new Date().getFullYear() + 1) {
            newErrors.year = "Enter a valid year.";
        }

        if (!safeDescription.trim()) newErrors.description = "Description is required.";

        const priceNum = Number(safePrice);
        if (!safePrice.trim()) {
            newErrors.price = "Price is required.";
        } else if (!Number.isFinite(priceNum) || priceNum <= 0) {
            newErrors.price = "Enter a valid positive price.";
        }

        if (!safeCarForReason.trim()) newErrors.CarForReason = "Please select a reason.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onUpdateCar(e);
    };

    const handleMakeChange = (v: string) => {
        if (errors.make) setErrors(prev => ({ ...prev, make: "" }));
        onMakeChange(v);
    };
    const handleModelChange = (v: string) => {
        if (errors.model) setErrors(prev => ({ ...prev, model: "" }));
        onModelChange(v);
    };
    const handleYearChange = (v: string) => {
        if (errors.year) setErrors(prev => ({ ...prev, year: "" }));
        onYearChange(v);
    };
    const handleDescriptionChange = (v: string) => {
        if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
        onDescriptionChange(v);
    };
    const handlePriceChange = (v: string) => {
        if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
        onPriceChange(v);
    };
    const handleCarForReasonChange = (v: string) => {
        if (errors.CarForReason) setErrors(prev => ({ ...prev, CarForReason: "" }));
        onCarForReasonChange(v);
    };

    return (
        <div className="mt-8 flex justify-center">
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-center">
                    Update Car Information
                </h2>
                <form className="w-full max-w-md" onSubmit={handleSubmit}>
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2"
                                htmlFor="edit-make"
                            >
                                Make
                            </label>
                            <input
                                className={`appearance-none block w-full bg-gray-700 text-white border ${errors.make ? "border-red-500" : "border-gray-600"} rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-gray-600`}
                                id="edit-make"
                                type="text"
                                value={safeMake}
                                onChange={(e) => handleMakeChange(e.target.value)}
                                required
                                aria-invalid={!!errors.make}
                                aria-describedby={errors.make ? "edit-make-error" : undefined}
                            />
                            {errors.make && (
                                <p id="edit-make-error" className="text-red-400 text-xs mt-1">{errors.make}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2"
                                htmlFor="edit-model"
                            >
                                Model
                            </label>
                            <input
                                className={`appearance-none block w-full bg-gray-700 text-white border ${errors.model ? "border-red-500" : "border-gray-600"} rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-gray-600`}
                                id="edit-model"
                                type="text"
                                value={safeModel}
                                onChange={(e) => handleModelChange(e.target.value)}
                                required
                                aria-invalid={!!errors.model}
                                aria-describedby={errors.model ? "edit-model-error" : undefined}
                            />
                            {errors.model && (
                                <p id="edit-model-error" className="text-red-400 text-xs mt-1">{errors.model}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2"
                                htmlFor="edit-year"
                            >
                                Year
                            </label>
                            <input
                                className={`appearance-none block w-full bg-gray-700 text-white border ${errors.year ? "border-red-500" : "border-gray-600"} rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-gray-600`}
                                id="edit-year"
                                type="number"
                                value={safeYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                                required
                                aria-invalid={!!errors.year}
                                aria-describedby={errors.year ? "edit-year-error" : undefined}
                            />
                            {errors.year && (
                                <p id="edit-year-error" className="text-red-400 text-xs mt-1">{errors.year}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2"
                                htmlFor="edit-description"
                            >
                                Description
                            </label>
                            <input
                                className={`appearance-none block w-full bg-gray-700 text-white border ${errors.description ? "border-red-500" : "border-gray-600"} rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-gray-600`}
                                id="edit-description"
                                type="text"
                                value={safeDescription}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                required
                                aria-invalid={!!errors.description}
                                aria-describedby={errors.description ? "edit-description-error" : undefined}
                            />
                            {errors.description && (
                                <p id="edit-description-error" className="text-red-400 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2"
                                htmlFor="edit-price"
                            >
                                Price
                            </label>
                            <input
                                className={`appearance-none block w-full bg-gray-700 text-white border ${errors.price ? "border-red-500" : "border-gray-600"} rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-gray-600`}
                                id="edit-price"
                                type="text"
                                value={safePrice}
                                onChange={(e) => handlePriceChange(e.target.value)}
                                required
                                aria-invalid={!!errors.price}
                                aria-describedby={errors.price ? "edit-price-error" : undefined}
                            />
                            {errors.price && (
                                <p id="edit-price-error" className="text-red-400 text-xs mt-1">{errors.price}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2"
                                htmlFor="edit-CarForReason"
                            >
                                Car For Reason
                            </label>
                            <select
                                className={`appearance-none block w-full bg-gray-700 text-white border ${errors.CarForReason ? "border-red-500" : "border-gray-600"} rounded py-3 px-4 mb-1 leading-tight focus:outline-none focus:bg-gray-600`}
                                id="edit-CarForReason"
                                value={safeCarForReason}
                                onChange={(e) => handleCarForReasonChange(e.target.value)}
                                required
                                aria-invalid={!!errors.CarForReason}
                                aria-describedby={errors.CarForReason ? "edit-carforreason-error" : undefined}
                            >
                                <option value="" disabled>Select reason for the car</option>
                                <option value="MusicVideo">Music Video</option>
                                <option value="Chauffeur">Chauffeur</option>
                            </select>
                            {errors.CarForReason && (
                                <p id="edit-carforreason-error" className="text-red-400 text-xs mt-1">{errors.CarForReason}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-300 text-xs font-bold mb-2"
                                htmlFor="edit-images"
                            >
                                Images
                            </label>
                            <input
                                className="appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-gray-600"
                                id="edit-images"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        onImagesChange(e.target.files);
                                    }
                                }}
                            />
                            {currentImages && currentImages.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-gray-300 text-xs font-bold mb-2">Current Images:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {currentImages.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={`${process.env.REACT_APP_API_URL}${image}`}
                                                    alt={`Current car image ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                        type="submit"
                    >
                        Update Car
                    </button>
                    <button
                        className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={onCancel}
                        type="button"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateCarForm;