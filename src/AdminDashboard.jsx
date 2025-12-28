import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { db, storage } from './firebase'; 
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, arrayUnion, arrayRemove, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
    Edit, Save, X, Trash2, Plus, Loader2, Search, 
    LayoutGrid, List, Package, AlertTriangle, CheckCircle, 
    Minus, Ban, Tags, Layers, Download, Image as ImageIcon, Camera, Eye, MoreHorizontal, Upload, Link as LinkIcon,
    Sparkles, Power, EyeOff, Box, Coffee
} from 'lucide-react'; 
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color, shadowColor }) => (
    <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-lg ${shadowColor} flex items-center gap-4 hover:-translate-y-1 transition-all duration-300`}>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            <Icon size={24} className={color.replace('bg-', 'text-').replace('10', '600')} />
        </div>
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
    </div>
);

const Input = ({ label, type = "text", value, onChange, required = false, isTextArea = false, placeholder = "", ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex gap-1 ml-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        {isTextArea ? (
             <textarea 
                value={value} 
                onChange={onChange} 
                className="w-full p-4 bg-old-lace/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-flag-red/10 focus:border-flag-red transition outline-none font-medium font-sans"
                rows="3"
                placeholder={placeholder}
                {...props}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full p-4 bg-old-lace/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-flag-red/10 focus:border-flag-red transition outline-none font-medium font-sans"
                {...props}
            />
        )}
    </div>
);

const StatsOverview = ({ stats }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Items" value={stats.total} icon={Package} color="bg-blue-100 text-blue-600" shadowColor="shadow-blue-500/10" />
        <StatCard title="Active Menu" value={stats.active} icon={CheckCircle} color="bg-green-100 text-green-600" shadowColor="shadow-green-500/10" />
        <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="bg-orange-100 text-orange-600" shadowColor="shadow-orange-500/10" />
        <StatCard title="Out of Stock" value={stats.outOfStock} icon={Ban} color="bg-red-100 text-red-600" shadowColor="shadow-red-500/10" />
    </div>
);

const CategoryManager = ({ isOpen, onClose, categories, onAdd, onDelete }) => {
    const [newCategoryName, setNewCategoryName] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            onAdd(newCategoryName.trim());
            setNewCategoryName("");
        }
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white animate-in slide-in-from-top-4 mb-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 font-heading"><Tags className="text-flag-red"/> Manage Categories</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                {categories.map(cat => (
                    <div key={cat} className="pl-4 pr-2 py-1.5 bg-old-lace rounded-full flex items-center gap-2 text-sm font-bold text-slate-700 border border-almond-silk">
                        {cat}
                        <button onClick={() => onDelete(cat)} className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition" aria-label={`Delete ${cat}`}><X size={14}/></button>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2 relative z-10">
                <input type="text" placeholder="New category name..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-grow p-3 bg-white border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-flag-red font-sans"/>
                <button type="submit" disabled={!newCategoryName.trim()} className="px-6 py-2 bg-flag-red text-white font-bold rounded-xl hover:bg-flag-red-2 disabled:opacity-50 transition shadow-lg shadow-flag-red/20">Add</button>
            </form>
        </div>
    );
};

const ProductFormModal = ({ isOpen, onClose, initialData, categories, onSubmit }) => {
    const [formData, setFormData] = useState(initialData);
    const [productType, setProductType] = useState('single'); // 'single' | 'bundle'
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
            // Determine type based on mixLimit
            if (initialData.mixLimit && Number(initialData.mixLimit) > 1) {
                setProductType('bundle');
            } else {
                setProductType('single');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setFormData(prev => ({ ...prev, image: url }));
            toast.success("Image uploaded!");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation
        if (Number(formData.price) < 0) return toast.error("Price cannot be negative");
        if (Number(formData.stock) < 0) return toast.error("Stock cannot be negative");
        
        // Critical: If type is Bundle, Options are MANDATORY
        if (productType === 'bundle') {
            if (!formData.options || formData.options.trim().length === 0) {
                return toast.error("For Bundles, you MUST provide 'Package Choices' (e.g. Pizza A, Pizza B) so customers can select.");
            }
        }

        // Prepare payload based on type
        const submitData = { ...formData };
        if (productType === 'single') {
            submitData.mixLimit = null;
            submitData.allowDuplicate = true; // Reset default
        }
        
        onSubmit(submitData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
             <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 custom-scrollbar border border-white/50">
                 <button type="button" onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-old-lace transition"><X size={20}/></button>
                 
                 <div className="flex flex-col gap-1 mb-6">
                    <div className="flex items-center gap-3">
                        {formData.id && <div className="px-3 py-1 bg-almond-silk text-flag-red text-xs font-bold rounded-full">Editing Mode</div>}
                        <h2 className="text-2xl font-black text-slate-900 font-heading">{formData.id ? 'Edit Product' : 'Add New Product'}</h2>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {/* TYPE TOGGLE */}
                    <div className="bg-old-lace p-1.5 rounded-2xl flex gap-1 border border-almond-silk/50">
                        <button 
                            type="button"
                            onClick={() => setProductType('single')}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                productType === 'single' 
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-100' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Coffee size={18}/> Standard Item
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                setProductType('bundle');
                                if (!formData.unit || formData.unit === 'Set') setFormData({...formData, unit: 'Bundle'});
                            }}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                productType === 'bundle' 
                                ? 'bg-flag-red text-white shadow-md shadow-flag-red/20' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <Box size={18}/> Package / Bundle
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder={productType === 'bundle' ? "e.g. Family Feast Bundle" : "e.g. Latte"}/>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-old-lace/50 border border-slate-200 rounded-2xl outline-none font-medium font-sans focus:ring-4 focus:ring-flag-red/10 focus:border-flag-red transition">
                                <option value="" disabled>Select Category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} isTextArea placeholder="Describe the taste, ingredients, or what's included..."/>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Image Source</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={e => setFormData({...formData, image: e.target.value})}
                                    placeholder="https://..."
                                    className="flex-grow p-4 bg-old-lace/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-flag-red/10 focus:border-flag-red transition outline-none font-medium font-sans text-xs"
                                />
                                <label className={`flex items-center justify-center p-4 bg-slate-900 text-white rounded-2xl cursor-pointer hover:bg-flag-red transition shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {isUploading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20}/>}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading}/>
                                </label>
                            </div>
                        </div>
                        <Input label="Badge (e.g. Best Seller)" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} placeholder="Optional"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-old-lace p-4 rounded-2xl border border-almond-silk">
                        <Input label="Original Price (Before Disc.)" type="number" min="0" step="0.01" placeholder="Optional" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})}/>
                        <Input label="Selling Price" type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required/>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input label="Stock" type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required/>
                        <Input label="Min Qty" type="number" min="1" value={formData.minQty} onChange={e => setFormData({...formData, minQty: e.target.value})} required/>
                        <Input label="Unit" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="e.g. Set"/>
                        <Input label="Prep Time (Hours)" type="number" min="0" value={formData.prepTime} onChange={e => setFormData({...formData, prepTime: e.target.value})} placeholder="24"/>
                    </div>

                    {/* BUNDLE SPECIFIC SETTINGS */}
                    {productType === 'bundle' && (
                        <div className="bg-slate-5 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                                <Layers size={18} className="text-flag-red"/>
                                <span className="text-sm font-bold text-slate-800">Package Configuration</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                 <Input 
                                    label="Items in Bundle" 
                                    type="number" 
                                    min="2" 
                                    value={formData.mixLimit} 
                                    onChange={e => setFormData({...formData, mixLimit: e.target.value})} 
                                    placeholder="How many choices?"
                                    required={productType === 'bundle'}
                                 />
                                 <div className="flex flex-col gap-2 pt-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Constraints</label>
                                    <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-xl border border-slate-200 hover:border-flag-red transition h-[52px]">
                                        <input type="checkbox" checked={formData.allowDuplicate} onChange={e => setFormData({...formData, allowDuplicate: e.target.checked})} className="w-5 h-5 text-flag-red rounded focus:ring-flag-red"/>
                                        <span className="text-sm font-bold text-slate-700">Allow Duplicates?</span>
                                    </label>
                                 </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">
                                *Set "Items in Bundle" to define how many selections the customer must make (e.g. 3 for a "3 Pizza Bundle").
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Input 
                            label={productType === 'bundle' ? "Package Choices (Required)" : "Variations (Comma separated)"} 
                            placeholder={productType === 'bundle' ? "e.g. Pepperoni, Cheese, Hawaiian (REQUIRED)" : "e.g. Small, Large, Less Sugar"} 
                            value={formData.options} 
                            onChange={e => setFormData({...formData, options: e.target.value})}
                            required={productType === 'bundle'}
                        />
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Availability</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-green-50 p-3 rounded-xl border border-green-100 flex-1 justify-center hover:bg-green-100 transition">
                                    <input type="radio" name="status" checked={formData.isAvailable === true} onChange={() => setFormData({...formData, isAvailable: true})} className="w-5 h-5 text-green-600"/>
                                    <span className="text-sm font-bold text-green-700">Active (Visible)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1 justify-center hover:bg-slate-100 transition">
                                    <input type="radio" name="status" checked={formData.isAvailable === false} onChange={() => setFormData({...formData, isAvailable: false})} className="w-5 h-5 text-slate-400"/>
                                    <span className="text-sm font-bold text-slate-500">Hidden (Inactive)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-flag-red transition-all shadow-xl hover:shadow-flag-red/30 flex justify-center items-center gap-2 mt-4 active:scale-95">
                        <Save size={20}/> {formData.id ? 'Save Changes' : 'Publish Product'}
                    </button>
                 </div>
             </form>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const AdminDashboard = () => {
  // STATE DASHBOARD TABS
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'gallery' | 'ai'

  // STATE MENU
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState(["Foods", "Desserts", "Coffee", "Potluck", "Others"]); // Added Potluck
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showCatManager, setShowCatManager] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // EDIT STATE
  const [editingItem, setEditingItem] = useState(null);

  // STATE GALLERY
  const [gallery, setGallery] = useState([]);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', caption: '' });
  const [imageFiles, setImageFiles] = useState([]); 
  const [imagePreviews, setImagePreviews] = useState([]); 
  const [isUploading, setIsUploading] = useState(false);

  // STATE AI
  const [aiSettings, setAiSettings] = useState({ isUnderMaintenance: false });

  const formatBND = (amount) => new Intl.NumberFormat('en-BN', { style: 'currency', currency: 'BND' }).format(Number(amount) || 0);

  // --- EFFECTS ---
  useEffect(() => {
    const unsubMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
          // Robust Sorting: Handles Numeric and String IDs correctly (Unified with User Hook)
          const numA = parseFloat(a.id.replace(/[^0-9.]/g, ''));
          const numB = parseFloat(b.id.replace(/[^0-9.]/g, ''));
          
          if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
          }
          return String(a.id).localeCompare(String(b.id), undefined, { numeric: true, sensitivity: 'base' });
      });
      setMenu(data);
      setLoading(false);
    }, (error) => {
        console.error("Menu fetch error:", error);
        toast.error("Failed to load menu data");
        setLoading(false);
    });
    return () => unsubMenu();
  }, []);

  useEffect(() => {
      const unsubCat = onSnapshot(doc(db, "settings", "categories"), (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.list && Array.isArray(data.list)) {
                  setCategories(data.list);
              }
          } else {
              setDoc(doc(db, "settings", "categories"), {
                  list: ["Foods", "Desserts", "Coffee", "Potluck", "Others"]
              });
          }
      });
      return () => unsubCat();
  }, []);

  useEffect(() => {
    const unsubGallery = onSnapshot(collection(db, "gallery"), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setGallery(data);
    });
    return () => unsubGallery();
  }, []);

  useEffect(() => {
      const unsubAI = onSnapshot(doc(db, "settings", "ai"), (docSnap) => {
          if (docSnap.exists()) {
              setAiSettings(docSnap.data());
          } else {
              // Create default
              setDoc(doc(db, "settings", "ai"), { isUnderMaintenance: false });
          }
      });
      return () => unsubAI();
  }, []);

  // --- COMPUTED ---
  const filteredMenu = useMemo(() => {
      return menu.filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(item.id).toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCat = filterCategory === "All" || item.category === filterCategory;
          return matchesSearch && matchesCat;
      });
  }, [menu, searchTerm, filterCategory]);

  const stats = useMemo(() => {
      return {
          total: menu.length,
          lowStock: menu.filter(i => i.stock > 0 && i.stock <= 5).length,
          outOfStock: menu.filter(i => i.stock === 0).length,
          active: menu.filter(i => i.isAvailable).length
      }
  }, [menu]);

  // --- HANDLERS ---
  const handleExportToCode = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "menu"));
      const items = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          originalPrice: parseFloat(data.originalPrice || 0),
          price: parseFloat(data.price || 0),
          category: data.category,
          image: data.image,
          badge: data.badge || "",
          minQty: parseInt(data.minQty || 1),
          unit: data.unit || "Set",
          mixLimit: data.mixLimit ? parseInt(data.mixLimit) : null,
          prepTime: parseInt(data.prepTime || 24),
          allowDuplicate: data.allowDuplicate !== false, 
          ...(data.options ? { options: data.options } : {})
        };
      });

      const fileContent = `
export const CATEGORIES = ${JSON.stringify(["All", ...categories], null, 2)};

export const MENU_ITEMS = ${JSON.stringify(items, null, 2)};
      `.trim();

      const blob = new Blob([fileContent], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "menuData.js";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data.");
    }
  };

  const handleAddCategory = async (catName) => {
      try {
          const catRef = doc(db, "settings", "categories");
          await updateDoc(catRef, { list: arrayUnion(catName) });
          toast.success(`Category "${catName}" added!`);
      } catch (error) {
          try {
             await setDoc(doc(db, "settings", "categories"), { list: [catName] }, { merge: true });
             toast.success(`Category "${catName}" created!`);
          } catch (err2) {
             toast.error("Failed to add category");
          }
      }
  };

  const handleDeleteCategory = async (catName) => {
      if(!confirm(`Delete category "${catName}"?`)) return;
      try {
          const catRef = doc(db, "settings", "categories");
          await updateDoc(catRef, { list: arrayRemove(catName) });
          toast.success("Category deleted");
      } catch (error) {
          toast.error("Failed to delete");
      }
  };

  const openEditModal = (item) => {
    setEditingItem({
      ...item,
      id: item.id,
      originalPrice: item.originalPrice || '',
      mixLimit: item.mixLimit || '',
      options: item.options && item.options.choices ? item.options.choices.join(', ') : '',
      allowDuplicate: item.allowDuplicate !== false
    });
    setIsCreating(true);
  };

  const openCreateModal = () => {
      setEditingItem({ 
          name: '', description: '', originalPrice: '', price: '', 
          stock: 50, category: categories[0] || 'Foods', image: '', badge: '', 
          minQty: 1, unit: 'Set', isAvailable: true, options: '', mixLimit: '',
          prepTime: 24, allowDuplicate: true
      });
      setIsCreating(true);
  };

  const processOptions = (optionsStr) => {
      if (!optionsStr) return null;
      const choices = optionsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
      return choices.length > 0 ? { title: "Select Option", choices } : null;
  };

  const handleProductSubmit = async (formData) => {
      const payload = {
          ...formData,
          price: Number(formData.price),
          originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
          stock: Number(formData.stock),
          minQty: Number(formData.minQty),
          mixLimit: formData.mixLimit ? Number(formData.mixLimit) : null,
          options: processOptions(formData.options),
          prepTime: Number(formData.prepTime),
          allowDuplicate: formData.allowDuplicate,
          updatedAt: new Date()
      };

      try {
          if (!formData.id) {
              const newId = "ITEM-" + Math.floor(Date.now() / 1000);
              await setDoc(doc(db, "menu", newId), { ...payload, id: newId });
              toast.success("Item Created!");
          } else {
              await updateDoc(doc(db, "menu", String(formData.id)), payload);
              toast.success("Item Updated!");
          }
          setIsCreating(false);
          setEditingItem(null);
      } catch (error) {
          toast.error("Operation Failed: " + error.message);
      }
  };

  const handleDelete = async (id, name) => {
      if (!confirm(`Delete "${name}"?`)) return;
      try {
          await deleteDoc(doc(db, "menu", String(id)));
          toast.success("Deleted");
      } catch (error) {
          toast.error("Delete failed");
      }
  };

  const adjustStock = async (item, amount) => {
      const newStock = Math.max(0, item.stock + amount);
      if (newStock === item.stock) return;
      const docRef = doc(db, "menu", String(item.id));
      await updateDoc(docRef, { stock: newStock });
  };

  const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      if (editingGalleryItem) {
          const file = files[0];
          setImageFiles([file]);
          setImagePreviews([URL.createObjectURL(file)]);
      } else {
          setImageFiles(files);
          const previews = files.map(file => URL.createObjectURL(file));
          setImagePreviews(previews);
          setGalleryForm(prev => ({ ...prev, imageUrl: '' }));
      }
  };

  const openGalleryModal = (item = null) => {
      setEditingGalleryItem(item);
      setGalleryForm({ 
          imageUrl: item ? item.imageUrl : '', 
          caption: item ? item.caption : '' 
      });
      setImageFiles([]);
      setImagePreviews(item ? [item.imageUrl] : []);
      setIsGalleryModalOpen(true);
  };

  const handleGallerySubmit = async (e) => {
      e.preventDefault();
      
      const hasFiles = imageFiles.length > 0;
      const hasUrl = galleryForm.imageUrl.trim().length > 0;

      if (!hasFiles && !hasUrl) {
          toast.error("Please select image(s) or provide a URL");
          return;
      }

      setIsUploading(true);
      try {
          if (editingGalleryItem) {
              // --- EDIT MODE ---
              let finalImageUrl = galleryForm.imageUrl;

              if (hasFiles) {
                  const file = imageFiles[0];
                  const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
                  const snapshot = await uploadBytes(storageRef, file);
                  finalImageUrl = await getDownloadURL(snapshot.ref);
              }

              const docRef = doc(db, "gallery", editingGalleryItem.id);
              await updateDoc(docRef, {
                  imageUrl: finalImageUrl,
                  caption: galleryForm.caption
              });
              toast.success("Photo updated!");
          } else {
              // --- CREATE MODE ---
              if (hasFiles) {
                  const uploadPromises = imageFiles.map(async (file) => {
                      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
                      const snapshot = await uploadBytes(storageRef, file);
                      const url = await getDownloadURL(snapshot.ref);
                      
                      return addDoc(collection(db, "gallery"), {
                          imageUrl: url,
                          caption: galleryForm.caption, 
                          createdAt: new Date()
                      });
                  });
                  
                  await Promise.all(uploadPromises);
                  toast.success(`${imageFiles.length} photos added!`);
              } else {
                  await addDoc(collection(db, "gallery"), {
                      imageUrl: galleryForm.imageUrl,
                      caption: galleryForm.caption,
                      createdAt: new Date()
                  });
                  toast.success("Photo added!");
              }
          }

          setGalleryForm({ imageUrl: '', caption: '' });
          setImageFiles([]);
          setImagePreviews([]);
          setEditingGalleryItem(null);
          setIsGalleryModalOpen(false);
      } catch (error) {
          console.error("Gallery error:", error);
          toast.error("Operation failed");
      } finally {
          setIsUploading(false);
      }
  };

  const handleDeleteGalleryImage = async (id) => {
      if(!confirm("Are you sure you want to remove this photo?")) return;
      try {
          await deleteDoc(doc(db, "gallery", id));
          toast.success("Photo removed");
      } catch (error) {
          toast.error("Failed to remove photo");
      }
  };

  const toggleAIMaintenance = async () => {
      try {
          const newState = !aiSettings.isUnderMaintenance;
          await updateDoc(doc(db, "settings", "ai"), { isUnderMaintenance: newState });
          toast.success(`AI Planner is now ${newState ? 'Under Maintenance' : 'Active'}`);
      } catch (err) {
          toast.error("Failed to update AI settings");
      }
  };

  const toggleAIExclusion = async (item) => {
      try {
          const docRef = doc(db, "menu", item.id);
          const newValue = !item.excludeFromAI;
          await updateDoc(docRef, { excludeFromAI: newValue });
          toast.success(newValue ? "Removed from AI" : "Added to AI");
      } catch(err) {
          toast.error("Failed to update item");
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-old-lace"><Loader2 className="animate-spin text-flag-red" size={40}/></div>;

  return (
    <div className="min-h-screen bg-old-lace p-4 md:p-8 font-sans text-slate-800 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-almond-silk/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-flag-red/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-heading">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Inventory & Content Management</p>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Link to="/" target="_blank" className="flex-grow md:flex-grow-0 px-5 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-white shadow-sm hover:border-flag-red hover:text-flag-red transition flex items-center justify-center gap-2">
                        <Eye size={20}/> Live Site
                    </Link>

                    {activeTab === 'menu' && (
                        <>
                            <button onClick={handleExportToCode} className="hidden md:flex px-5 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition items-center gap-2 shadow-lg shadow-green-600/20 active:scale-95">
                                <Download size={20}/> Export
                            </button>
                            <button onClick={() => setShowCatManager(!showCatManager)} className="px-5 py-3 bg-white text-slate-700 font-bold rounded-2xl border border-white shadow-sm hover:bg-old-lace transition flex items-center gap-2">
                                <Tags size={20}/> Categories
                            </button>
                            <button onClick={openCreateModal} className="flex-grow md:flex-grow-0 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-flag-red transition flex items-center justify-center gap-2 shadow-lg hover:shadow-flag-red/20 active:scale-95">
                                <Plus size={20}/> New Item
                            </button>
                        </>
                    )}
                    {activeTab === 'gallery' && (
                        <button onClick={() => openGalleryModal(null)} className="flex-grow md:flex-grow-0 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-flag-red transition flex items-center justify-center gap-2 shadow-lg hover:shadow-flag-red/20 active:scale-95">
                            <Plus size={20}/> Add Photo
                        </button>
                    )}
                </div>
            </div>

            <div className="flex border-b border-slate-200 overflow-x-auto">
                <button onClick={() => setActiveTab('menu')} className={`px-6 py-3 font-bold text-sm transition-all border-b-4 shrink-0 ${activeTab === 'menu' ? 'border-flag-red text-flag-red' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Menu Manager</button>
                <button onClick={() => setActiveTab('gallery')} className={`px-6 py-3 font-bold text-sm transition-all border-b-4 shrink-0 ${activeTab === 'gallery' ? 'border-flag-red text-flag-red' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Gallery Manager</button>
                <button onClick={() => setActiveTab('ai')} className={`px-6 py-3 font-bold text-sm transition-all border-b-4 shrink-0 ${activeTab === 'ai' ? 'border-flag-red text-flag-red' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>AI Manager</button>
            </div>
        </div>

        {/* === MENU MANAGER CONTENT === */}
        {activeTab === 'menu' && (
            <>
                <CategoryManager isOpen={showCatManager} onClose={() => setShowCatManager(false)} categories={categories} onAdd={handleAddCategory} onDelete={handleDeleteCategory} />
                <StatsOverview stats={stats} />

                {/* CONTROLS */}
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-white flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <input type="text" placeholder="Search menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-flag-red transition outline-none font-sans font-medium"/>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 outline-none font-sans flex-grow md:flex-grow-0 cursor-pointer hover:bg-white transition">
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
                            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-flag-red' : 'text-slate-400'}`}><LayoutGrid size={20}/></button>
                            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition ${viewMode === 'list' ? 'bg-white shadow-sm text-flag-red' : 'text-slate-400'}`}><List size={20}/></button>
                        </div>
                    </div>
                </div>

                {/* GRID VIEW */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMenu.map(item => (
                            <div key={item.id} className="bg-white rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(202,34,42,0.1)] transition-all duration-300 overflow-hidden group flex flex-col">
                                <div className="h-48 relative overflow-hidden bg-old-lace">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={e => e.target.src="https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image"}/>
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button onClick={() => openEditModal(item)} className="p-2 bg-white/90 backdrop-blur rounded-xl hover:bg-flag-red hover:text-white transition shadow-sm"><Edit size={16}/></button>
                                        <button onClick={() => handleDelete(item.id, item.name)} className="p-2 bg-white/90 backdrop-blur rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={16}/></button>
                                    </div>
                                    {item.originalPrice && item.originalPrice > item.price && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">
                                            SAVE {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                                        </div>
                                    )}
                                    {/* Bundle Indicator */}
                                    {item.mixLimit && Number(item.mixLimit) > 1 && (
                                        <div className="absolute bottom-2 left-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                            <Layers size={12} className="text-pastry-yellow"/> Bundle
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-800 line-clamp-1 text-lg" title={item.name}>{item.name}</h3>
                                        <div className="text-right">
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <span className="text-xs text-slate-400 line-through font-bold block">{formatBND(item.originalPrice)}</span>
                                            )}
                                            <span className="font-black text-flag-red text-lg">{formatBND(item.price)}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-bold bg-slate-50 w-fit px-2 py-1 rounded-md">{item.category}</p>
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.isAvailable ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>{item.isAvailable ? 'Active' : 'Hidden'}</span>
                                        <div className="flex items-center gap-2 bg-old-lace rounded-xl p-1">
                                            <button onClick={() => adjustStock(item, -1)} className="p-1 hover:bg-white rounded-lg shadow-sm transition text-slate-500 hover:text-red-500"><Minus size={16}/></button>
                                            <span className="text-sm font-black w-6 text-center text-slate-800">{item.stock}</span>
                                            <button onClick={() => adjustStock(item, 1)} className="p-1 hover:bg-white rounded-lg shadow-sm transition text-slate-500 hover:text-green-600"><Plus size={16}/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LIST VIEW - Mobile Optimized */}
                {viewMode === 'list' && (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                                <thead className="bg-old-lace/50 border-b border-slate-200 text-xs uppercase text-slate-400 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-5">Product</th>
                                        <th className="p-5">Price</th>
                                        <th className="p-5">Stock Control</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right sticky right-0 bg-old-lace/50 md:static shadow-[-5px_0_10px_rgba(0,0,0,0.05)] md:shadow-none">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredMenu.map(item => (
                                        <tr key={item.id} className="hover:bg-old-lace/30 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <img src={item.image} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm bg-old-lace" alt="" onError={e => e.target.src="https://placehold.co/150"}/>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                                                            {item.mixLimit && Number(item.mixLimit) > 1 && (
                                                                <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Bundle</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{item.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="font-black text-flag-red">{formatBND(item.price)}</span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => adjustStock(item, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-500 transition"><Minus size={14}/></button>
                                                    <span className="font-bold text-slate-700 w-6 text-center">{item.stock}</span>
                                                    <button onClick={() => adjustStock(item, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-green-100 text-slate-500 hover:text-green-600 transition"><Plus size={14}/></button>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>{item.isAvailable ? 'Active' : 'Hidden'}</span>
                                            </td>
                                            <td className="p-5 text-right sticky right-0 bg-white md:static shadow-[-5px_0_10px_rgba(0,0,0,0.02)] md:shadow-none group-hover:bg-old-lace/30">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18}/></button>
                                                    <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* === GALLERY MANAGER CONTENT === */}
        {activeTab === 'gallery' && (
            <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-white">
                    <h3 className="font-bold text-xl text-slate-800 mb-6 font-heading flex items-center gap-2"><ImageIcon className="text-flag-red"/> Gallery Preview</h3>
                    
                    {gallery.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 bg-old-lace/50 rounded-3xl border border-dashed border-slate-300">
                            <Camera size={48} className="mx-auto mb-3 opacity-30"/>
                            <p className="font-medium">No photos in gallery yet. Add some!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {gallery.map(img => (
                                <div key={img.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-white shadow-sm bg-old-lace">
                                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                    
                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                        <button onClick={() => openGalleryModal(img)} className="bg-white text-slate-900 p-3 rounded-full hover:bg-flag-red hover:text-white transition shadow-lg hover:scale-110 active:scale-95" title="Edit Caption">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteGalleryImage(img.id)} className="bg-white text-red-600 p-3 rounded-full hover:bg-red-600 hover:text-white transition shadow-lg hover:scale-110 active:scale-95" title="Delete Photo">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Caption Badge */}
                                    {img.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                            <p className="text-white text-[10px] font-medium truncate text-center">{img.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* === AI MANAGER CONTENT === */}
        {activeTab === 'ai' && (
            <div className="space-y-6">
                {/* Global AI Switch */}
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-white flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${aiSettings.isUnderMaintenance ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 font-heading">AI Planner Status</h3>
                            <p className="text-slate-500 text-sm font-medium">
                                {aiSettings.isUnderMaintenance 
                                    ? "Maintenance Mode: AI is currently disabled for customers." 
                                    : "Active: AI Planner is available for customers."}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={toggleAIMaintenance}
                        className={`px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center gap-3 active:scale-95 ${
                            aiSettings.isUnderMaintenance 
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' 
                            : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                        }`}
                    >
                        <Power size={20} />
                        {aiSettings.isUnderMaintenance ? "Activate AI" : "Disable (Maintenance)"}
                    </button>
                </div>

                {/* AI Menu Exclusion List */}
                <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-sm border border-white overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <EyeOff className="text-slate-400" size={20}/>
                            <h3 className="font-bold text-lg text-slate-800 font-heading">Menu Visibility Control</h3>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                            {menu.filter(i => i.excludeFromAI).length} Hidden from AI
                        </span>
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-0">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-old-lace/50 text-xs uppercase text-slate-400 font-bold tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="p-5 pl-8">Product</th>
                                    <th className="p-5 text-center">AI Visibility</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {menu.map(item => (
                                    <tr key={item.id} className="hover:bg-old-lace/30 transition-colors">
                                        <td className="p-4 pl-8">
                                            <div className="flex items-center gap-3">
                                                <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-old-lace border border-white" alt="" onError={e => e.target.src="https://placehold.co/100"}/>
                                                <div>
                                                    <div className="font-bold text-slate-900 line-clamp-1">{item.name}</div>
                                                    <div className="text-xs text-slate-400">{item.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => toggleAIExclusion(item)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                    item.excludeFromAI 
                                                    ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-white hover:text-green-600 hover:border-green-200' 
                                                    : 'bg-green-50 text-green-700 border-green-100 hover:bg-white hover:text-red-500 hover:border-red-100'
                                                }`}
                                            >
                                                {item.excludeFromAI ? "Excluded from AI" : "Visible to AI"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </div>

      <ProductFormModal 
        isOpen={isCreating} 
        onClose={() => setIsCreating(false)} 
        initialData={editingItem || {}} 
        categories={categories}
        onSubmit={handleProductSubmit}
      />

      {/* MODAL FORM: ADD/EDIT GALLERY IMAGE */}
      {isGalleryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
             <form onSubmit={handleGallerySubmit} className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full relative animate-in zoom-in-95 duration-200 border border-white/50">
                 <button type="button" onClick={() => setIsGalleryModalOpen(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-old-lace transition"><X size={20}/></button>
                 <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-black text-slate-900 font-heading">{editingGalleryItem ? 'Edit Photo' : 'Add Photo(s)'}</h2>
                 </div>
                 <div className="space-y-6">
                    <div className="p-4 bg-old-lace/50 border border-slate-200 rounded-2xl space-y-4 relative">
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-white transition-colors relative overflow-hidden group ${editingGalleryItem ? 'pointer-events-none opacity-80' : ''}`}>
                            {imagePreviews.length > 0 ? (
                                imagePreviews.length === 1 ? (
                                    <img src={imagePreviews[0]} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Preview"/>
                                ) : (
                                    <div className="absolute inset-0 w-full h-full p-2 grid grid-cols-3 gap-2 overflow-y-auto bg-slate-50">
                                        {imagePreviews.map((src, i) => (
                                            <img key={i} src={src} className="w-full h-full object-cover rounded-lg border border-slate-200" alt={`preview ${i}`} />
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                    <p className="mb-2 text-sm text-slate-500 font-bold"><span className="text-flag-red">Click to upload</span> {editingGalleryItem ? '' : 'multiple'}</p>
                                    <p className="text-xs text-slate-400">JPG, PNG, WEBP</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple={!editingGalleryItem} // Allow multiple if adding new
                                capture={editingGalleryItem ? "environment" : undefined}
                                className="hidden" 
                                onChange={handleFileChange} 
                                disabled={!!editingGalleryItem}
                            />
                        </label>
                        
                        {!editingGalleryItem && (
                            <>
                                <div className="relative flex items-center gap-2">
                                    <div className="h-px bg-slate-200 flex-grow"></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">OR USE URL</span>
                                    <div className="h-px bg-slate-200 flex-grow"></div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <LinkIcon size={16} className="text-slate-400 shrink-0"/>
                                    <input 
                                        type="text" 
                                        placeholder="Paste image link..." 
                                        value={galleryForm.imageUrl} 
                                        onChange={e => {
                                            setGalleryForm({...galleryForm, imageUrl: e.target.value});
                                            if(e.target.value) { setImageFiles([]); setImagePreviews([]); }
                                        }} 
                                        className="w-full bg-transparent outline-none text-sm font-bold text-slate-600 placeholder:text-slate-300"
                                    />
                                </div>
                            </>
                        )}
                        {editingGalleryItem && <p className="text-xs text-center text-slate-400 font-medium">Image editing disabled. To change image, delete and add new.</p>}
                    </div>

                    <Input label="Caption (Applies to all)" value={galleryForm.caption} onChange={e => setGalleryForm({...galleryForm, caption: e.target.value})} placeholder="Happy customer!"/>
                    
                    <button type="submit" disabled={isUploading || (!imageFiles.length && !galleryForm.imageUrl)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-flag-red transition shadow-xl hover:shadow-flag-red/30 flex justify-center items-center gap-2 mt-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUploading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20}/>} 
                        {isUploading ? 'Uploading...' : (editingGalleryItem ? 'Update Caption' : `Upload ${imageFiles.length > 0 ? imageFiles.length + ' Photo(s)' : 'Photo'}`)}
                    </button>
                 </div>
             </form>
          </div>
      )}

    </div>
  );
};