import React, { useState } from 'react';

interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    description: string;
    price: string;
    CarForReason: string;
    images: string[];
}

interface CarTableProps {
    cars: Car[];
    selectCar: (car: Car) => void;
    deleteCar: (id: string) => void;
}

const CarTable: React.FC<CarTableProps> = ({ cars, selectCar, deleteCar }) => {
    const [showMoreMap, setShowMoreMap] = useState<{ [id: string]: boolean }>({});
    const [currentImageIndex, setCurrentImageIndex] = useState<{ [id: string]: number }>({});

    const toggleShowMore = (id: string) => {
        setShowMoreMap(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const nextImage = (carId: string, totalImages: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => ({
            ...prev,
            [carId]: ((prev[carId] || 0) + 1) % totalImages
        }));
    };

    const previousImage = (carId: string, totalImages: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => ({
            ...prev,
            [carId]: ((prev[carId] || 0) - 1 + totalImages) % totalImages
        }));
    };

    return (
        <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full text-center table-auto">
                <thead>
                <tr className="bg-gray-700 text-gray-300">
                    <th className="px-4 py-3">Images</th>
                    <th className="px-4 py-3">Details</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Actions</th>
                </tr>
                </thead>
                <tbody>
                {cars.map((car) => (
                    <tr key={car.id} className="bg-gray-600 text-gray-300 hover:bg-gray-500 transition-colors">
                        <td className="border px-4 py-4">
                            {car.images && car.images.length > 0 ? (
                                <div className="relative w-48 h-32 mx-auto">
                                    <img
                                        src={`${process.env.REACT_APP_API_URL?.replace(/\/api$/, '') || ''}${car.images[currentImageIndex[car.id] || 0]}`}
                                        alt={`${car.make} ${car.model}`}
                                        className="w-full h-full object-cover rounded"
                                    />


                                    {car.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => previousImage(car.id, car.images.length, e)}
                                                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-l px-2 py-1 hover:bg-opacity-75 transition-all"
                                            >
                                                ←
                                            </button>
                                            <button
                                                onClick={(e) => nextImage(car.id, car.images.length, e)}
                                                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-r px-2 py-1 hover:bg-opacity-75 transition-all"
                                            >
                                                →
                                            </button>
                                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                                {car.images.map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={`w-2 h-2 rounded-full ${
                                                            index === (currentImageIndex[car.id] || 0)
                                                                ? 'bg-white'
                                                                : 'bg-gray-400'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="w-48 h-32 bg-gray-700 rounded flex items-center justify-center">
                                    <span className="text-gray-400">No images</span>
                                </div>
                            )}
                        </td>
                        <td className="border px-4 py-4">
                            <div className="flex flex-col space-y-1">
                                <span className="font-bold">{car.make} {car.model}</span>
                                <span className="text-gray-400">Year: {car.year}</span>
                                <span className="text-gray-400">Type: {car.CarForReason}</span>
                            </div>
                        </td>
                        <td className="border px-4 py-4">
                            <div className="max-w-md mx-auto">
                                {showMoreMap[car.id]
                                    ? car.description
                                    : `${car.description.substring(0, 100)}${car.description.length > 100 ? '...' : ''}`
                                }
                                {car.description.length > 100 && (
                                    <button
                                        className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                                        onClick={() => toggleShowMore(car.id)}
                                    >
                                        {showMoreMap[car.id] ? "Show less" : "Read more"}
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="border px-4 py-4">
                            <span className="font-bold">£{car.price}</span>
                            <span className="block text-sm text-gray-400">
                                    {car.CarForReason === "Chauffeur" ? "per 6 hours" : "per hour"}
                                </span>
                        </td>
                        <td className="border px-4 py-4">
                            <div className="flex flex-col space-y-2">
                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
                                    onClick={() => selectCar(car)}
                                >
                                    Update
                                </button>
                                <button
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
                                    onClick={() => deleteCar(car.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CarTable;