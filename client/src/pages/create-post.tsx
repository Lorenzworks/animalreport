import { useState } from "react";
import Navbar from "@/components/navbar";
import CreatePostModal from "@/components/create-post-modal";

export default function CreatePost() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Share Your Pet's Story</h1>
          <p className="text-gray-600 mb-6">Upload photos and videos to connect with other pet lovers</p>
          <CreatePostModal open={showModal} onClose={() => setShowModal(true)} />
        </div>
      </div>
    </div>
  );
}
