import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Material } from '../types';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase'; // your Firestore instance
import { Plus, BookOpen } from 'lucide-react';
import MaterialReader from './MaterialReader';

const UploadMaterials: React.FC = () => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'pdf' | 'text'>('pdf');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [readTime, setReadTime] = useState(10);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const storage = getStorage();

  // Load existing materials from Firestore
  useEffect(() => {
    const fetchMaterials = async () => {
      const snapshot = await getDocs(collection(db, 'materials'));
      const data: Material[] = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Material) }));
      setMaterials(data);
    };
    fetchMaterials();
  }, []);

  const handleUpload = async () => {
    if (!title) return alert('Enter a title');

    let contentUrl = '';
    if (type === 'pdf') {
      if (!file) return alert('Select a file');
      const storageRef = ref(storage, `materials/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed', 
          null, 
          (error) => reject(error),
          async () => {
            contentUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    } else {
      contentUrl = textContent;
    }

    // Save metadata to Firestore
    const docRef = await addDoc(collection(db, 'materials'), {
      title,
      type,
      content: contentUrl,
      readTimeMinutes: readTime,
    });

    const newMaterial: Material = {
      id: docRef.id,
      title,
      type,
      content: contentUrl,
      readTimeMinutes: readTime,
    };

    setMaterials([...materials, newMaterial]);
    setTitle('');
    setFile(null);
    setTextContent('');
    setReadTime(10);
    setType('pdf');
    alert('Material uploaded!');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold">Upload Material</h2>

        <input
          type="text"
          placeholder="Title"
          className="border p-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex space-x-2 items-center">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={type === 'pdf'}
              onChange={() => setType('pdf')}
            />
            <span>PDF</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={type === 'text'}
              onChange={() => setType('text')}
            />
            <span>Text</span>
          </label>
        </div>

        {type === 'pdf' ? (
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
        ) : (
          <textarea
            className="border p-2 rounded w-full h-32"
            placeholder="Write or paste text content"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
        )}

        <input
          type="number"
          placeholder="Read time (minutes)"
          className="border p-2 rounded w-40"
          value={readTime}
          onChange={(e) => setReadTime(Number(e.target.value))}
        />

        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-indigo-700"
          onClick={handleUpload}
        >
          <Plus size={16} />
          <span>Upload</span>
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Materials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition"
              onClick={() => setSelectedMaterial(mat)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{mat.title}</h3>
                <BookOpen size={18} />
              </div>
              <p className="text-gray-500 text-sm">{mat.type.toUpperCase()} - {mat.readTimeMinutes} min</p>
            </div>
          ))}
        </div>
      </div>

      {selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl overflow-hidden shadow-lg relative">
            <button
              onClick={() => setSelectedMaterial(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            <MaterialReader material={selectedMaterial} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadMaterials;
