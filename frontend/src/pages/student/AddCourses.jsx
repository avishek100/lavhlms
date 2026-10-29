import React, { useState } from 'react';

function AddCourses() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [video, setVideo] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ title, description, price, video });
        // Here you can add API integration to send data to the backend
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold">Add Course</h1>
            <form className="bg-white p-6 rounded-lg shadow-md mt-4" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Course Title</label>
                    <input type="text" className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea className="w-full p-2 border rounded" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Price</label>
                    <input type="number" className="w-full p-2 border rounded" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Upload Video</label>
                    <input type="file" className="w-full p-2 border rounded" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} required />
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Course</button>
            </form>
        </div>
    );
}
export  default AddCourses;