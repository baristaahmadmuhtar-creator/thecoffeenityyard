import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Camera, Image as ImageIcon, X, ZoomIn, AlertCircle } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const GallerySkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
                <ImageIcon className="text-slate-300 opacity-50" size={24}/>
            </div>
        ))}
    </div>
);

// This component now acts as a Modal/Overlay
export const GallerySection = ({ isOpen, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Lock scroll when Gallery Overlay is open
  useBodyScrollLock(isOpen);

  useEffect(() => {
    // Only fetch if open to save resources
    if (!isOpen) return;

    setLoading(true);
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(20)); // Increased limit for desktop
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setImages(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Gallery fetch error:", err);
        setError("Unable to load gallery.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-0 md:p-6">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Content Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-[2.5rem] bg-white md:overflow-hidden flex flex-col shadow-2xl border border-white/10"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-100 bg-white z-10 shrink-0">
                    <div>
                        <h2 className="text-3xl font-heading text-slate-900 leading-none">Captured Moments</h2>
                        <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
                            <Instagram size={14} className="text-flag-red"/> @thecoffeenityyard
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Grid */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-4 md:p-8 bg-old-lace/30">
                    {error ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <AlertCircle className="text-red-400 mb-2" size={32}/>
                            <p className="text-red-600 font-bold">Gallery unavailable.</p>
                        </div>
                    ) : loading ? (
                        <GallerySkeleton />
                    ) : images.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                            <Camera size={48} className="mb-4 opacity-20"/>
                            <p>No photos yet.</p>
                        </div>
                    ) : (
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                            {images.map((img, index) => (
                                <motion.div
                                    key={img.id}
                                    layoutId={`gallery-thumb-${img.id}`}
                                    onClick={() => setSelectedImage(img)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all cursor-zoom-in"
                                >
                                    <img 
                                        src={img.imageUrl} 
                                        alt={img.caption || "Customer moment"} 
                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ZoomIn className="text-white" size={24}/>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Lightbox Modal (Nested) */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/95 backdrop-blur-md"
                            onClick={() => setSelectedImage(null)}
                        />
                        
                        <motion.div 
                            layoutId={`gallery-thumb-${selectedImage.id}`}
                            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center pointer-events-none"
                        >
                            <div className="relative pointer-events-auto bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                                <img 
                                    src={selectedImage.imageUrl} 
                                    alt={selectedImage.caption} 
                                    className="max-h-[85vh] w-auto object-contain"
                                />
                            </div>
                            
                            {/* Caption Bar */}
                            <div className="mt-4 pointer-events-auto flex items-center gap-4">
                                {selectedImage.caption && (
                                    <span className="text-white font-medium bg-white/10 px-6 py-3 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                                        {selectedImage.caption}
                                    </span>
                                )}
                                <button 
                                    onClick={() => setSelectedImage(null)}
                                    className="p-3 bg-white text-black rounded-full hover:bg-slate-200 transition-colors shadow-lg active:scale-95"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};