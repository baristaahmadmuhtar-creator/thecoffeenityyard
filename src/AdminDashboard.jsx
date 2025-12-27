import React, { useEffect, useState, useMemo } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, updateDoc, deleteDoc, setDoc, arrayUnion, arrayRemove, getDocs } from 'firebase/firestore';
import { 
    Edit, Save, X, Trash2, Plus, Loader2, Search, 
    LayoutGrid, List, Package, AlertTriangle, CheckCircle, 
    Minus, Ban, Tags, Layers, Download
} from 'lucide-react'; 
import toast from 'react-hot-toast';

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
        <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            <Icon size={24} className={color.replace('bg-', 'text-').replace('10', '600')} />
        </div>
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        </div>
    </div>
);

const Input = ({ label, type = "text", value, onChange, required = false, isTextArea = false, placeholder = "" }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}{required && <span className="text-red-500">*</span>}</label>
        {isTextArea ? (
             <textarea 
                value={value} 
                onChange={onChange} 
                className="w-full p-3 bg-old-lace border border-slate-200 rounded-xl focus:ring-2 focus:ring-flag-red focus:border-flag-red transition outline-none font-medium font-sans"
                rows="3"
                placeholder={placeholder}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full p-3 bg-old-lace border border-slate-200 rounded-xl focus:ring-2 focus:ring-flag-red focus:border-flag-red transition outline-none font-medium font-sans"
            />
        )}
    </div>
);

export const AdminDashboard = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState(["Foods", "Desserts", "Coffee", "Others"]); 
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
   
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCatManager, setShowCatManager] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
   
  const [formData, setFormData] = useState({
      name: '', description: '', 
      originalPrice: '', price: '', 
      stock: 50, category: '', 
      image: '', badge: '', minQty: 1, unit: 'Set', 
      isAvailable: true, options: '', mixLimit: '',
      prepTime: 24,
      allowDuplicate: true 
  });

  const formatBND = (amount) => new Intl.NumberFormat('en-BN', { style: 'currency', currency: 'BND' }).format(Number(amount) || 0);

  useEffect(() => {
    // Mengambil data real-time dari koleksi "menu"
    const unsubMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
          const idA = a.id.toString();
          const idB = b.id.toString();
          return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
      });
      setMenu(data);
      setLoading(false);
    });
    return () => unsubMenu();
  }, []);

  useEffect(() => {
      // Mengambil kategori dari koleksi "settings"
      const unsubCat = onSnapshot(doc(db, "settings", "categories"), (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.list && Array.isArray(data.list)) {
                  setCategories(data.list);
              }
          } else {
              setDoc(doc(db, "settings", "categories"), {
                  list: ["Foods", "Desserts", "Coffee", "Others"]
              });
          }
      });
      return () => unsubCat();
  }, []);

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

  // --- EXPORT FUNCTION (INI YANG BARU) ---
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
          allowDuplicate: data.allowDuplicate !== false, // Default true
          ...(data.options ? { options: data.options } : {})
        };
      });

      // Categories diambil dari state saat ini
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

      toast.success("Backup downloaded as menuData.js!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data.");
    }
  };

  const handleAddCategory = async (e) => {
      e.preventDefault();
      if(!newCategoryName.trim()) return;
      const catName = newCategoryName.trim();
       
      try {
          const catRef = doc(db, "settings", "categories");
          await updateDoc(catRef, {
              list: arrayUnion(catName)
          });
          toast.success(`Category "${catName}" added!`);
          setNewCategoryName("");
      } catch (error) {
          try {
             await setDoc(doc(db, "settings", "categories"), { list: [catName] }, { merge: true });
             toast.success(`Category "${catName}" created!`);
             setNewCategoryName("");
          } catch (err2) {
             toast.error("Failed to add category");
          }
      }
  };

  const handleDeleteCategory = async (catName) => {
      if(!confirm(`Delete category "${catName}"? Items in this category won't be deleted but might be hidden.`)) return;
      try {
          const catRef = doc(db, "settings", "categories");
          await updateDoc(catRef, {
              list: arrayRemove(catName)
          });
          toast.success("Category deleted");
      } catch (error) {
          toast.error("Failed to delete");
      }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || categories[0] || 'Foods',
      image: item.image || '',
      badge: item.badge || '',
      price: item.price || '',
      originalPrice: item.originalPrice || '', 
      stock: item.stock || 0,
      minQty: item.minQty || 1,
      unit: item.unit || 'Set',
      isAvailable: item.isAvailable !== false,
      mixLimit: item.mixLimit || '',
      options: item.options && item.options.choices ? item.options.choices.join(', ') : '',
      prepTime: item.prepTime !== undefined ? item.prepTime : 24,
      allowDuplicate: item.allowDuplicate !== false 
    });
  };

  const resetForm = () => {
      setFormData({ 
          name: '', description: '', originalPrice: '', price: '', 
          stock: 50, category: categories[0] || 'Foods', image: '', badge: '', 
          minQty: 1, unit: 'Set', isAvailable: true, options: '', mixLimit: '',
          prepTime: 24, allowDuplicate: true
      });
      setIsCreating(false);
      setEditingId(null);
  };

  const processOptions = (optionsStr) => {
      if (!optionsStr) return null;
      const choices = optionsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
      return choices.length > 0 ? { title: "Select Option", choices } : null;
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
       
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
          if (isCreating) {
              const newId = "ITEM-" + Math.floor(Date.now() / 1000);
              await setDoc(doc(db, "menu", newId), { ...payload, id: newId });
              toast.success("Item Created Successfully!");
          } else {
              await updateDoc(doc(db, "menu", String(editingId)), payload);
              toast.success("Item Updated Successfully!");
          }
          resetForm();
      } catch (error) {
          console.error(error);
          toast.error("Operation Failed: " + error.message);
      }
  };

  const handleDelete = async (id, name) => {
      if (!confirm(`Permanently delete "${name}"?`)) return;
      try {
          await deleteDoc(doc(db, "menu", String(id)));
          toast.success("Deleted successfully");
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-old-lace"><Loader2 className="animate-spin text-flag-red" size={40}/></div>;

  return (
    <div className="min-h-screen bg-old-lace p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight bbh-hegarty-regular">Dashboard</h1>
                <p className="text-slate-500 font-medium">Manage your inventory & pricing.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {/* BUTTON EXPORT BARU - INI YANG KEMARIN HILANG */}
                <button onClick={handleExportToCode} className="px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center gap-2 shadow-sm">
                    <Download size={20}/> Export JS
                </button>

                <button onClick={() => setShowCatManager(!showCatManager)} className="px-4 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-old-lace transition flex items-center gap-2 shadow-sm">
                    <Tags size={20}/> Categories
                </button>
                <button onClick={() => { resetForm(); setIsCreating(true); }} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-flag-red transition flex items-center gap-2 shadow-lg">
                    <Plus size={20}/> Add New Item
                </button>
            </div>
        </div>

        {/* CATEGORY MANAGER PANEL */}
        {showCatManager && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-almond-silk animate-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 bbh-hegarty-regular"><Tags className="text-flag-red"/> Manage Categories</h3>
                    <button onClick={() => setShowCatManager(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
                </div>
                 
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map(cat => (
                        <div key={cat} className="pl-4 pr-2 py-1.5 bg-old-lace rounded-full flex items-center gap-2 text-sm font-bold text-slate-700">
                            {cat}
                            <button onClick={() => handleDeleteCategory(cat)} className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition"><X size={14}/></button>
                        </div>
                    ))}
                </div>
                 
                <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="New category name (e.g. Foods)..." 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-grow p-3 bg-old-lace border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-flag-red font-sans"
                    />
                    <button type="submit" disabled={!newCategoryName.trim()} className="px-6 py-2 bg-flag-red text-white font-bold rounded-xl hover:bg-flag-red-2 disabled:opacity-50 transition">Add</button>
                </form>
            </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Items" value={stats.total} icon={Package} color="bg-blue-100 text-blue-600" />
            <StatCard title="Active Menu" value={stats.active} icon={CheckCircle} color="bg-green-100 text-green-600" />
            <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="bg-orange-100 text-orange-600" />
            <StatCard title="Out of Stock" value={stats.outOfStock} icon={Ban} color="bg-red-100 text-red-600" />
        </div>

        {/* CONTROLS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-30">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                <input type="text" placeholder="Search menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-old-lace border border-slate-200 rounded-xl focus:ring-2 focus:ring-flag-red transition outline-none font-sans"/>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
                 <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2.5 bg-old-lace border border-slate-200 rounded-xl font-bold text-sm text-slate-600 outline-none font-sans">
                     <option value="All">All Categories</option>
                     {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <div className="flex bg-old-lace p-1 rounded-xl shrink-0">
                     <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow text-flag-red' : 'text-slate-400'}`}><LayoutGrid size={20}/></button>
                     <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow text-flag-red' : 'text-slate-400'}`}><List size={20}/></button>
                 </div>
            </div>
        </div>

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMenu.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
                        <div className="h-48 relative overflow-hidden bg-old-lace">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={e => e.target.src="https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Image"}/>
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button onClick={() => startEdit(item)} className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-flag-red hover:text-white transition shadow-sm"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(item.id, item.name)} className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={16}/></button>
                            </div>
                            {item.originalPrice && item.originalPrice > item.price && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">
                                    SAVE {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                                </div>
                            )}
                            {item.badge && (
                                <div className="absolute bottom-2 left-2 bg-flag-red text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                    {item.badge}
                                </div>
                            )}
                        </div>
                         
                        <div className="p-5 flex-grow flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 line-clamp-1" title={item.name}>{item.name}</h3>
                                <div className="text-right">
                                    {item.originalPrice && item.originalPrice > item.price && (
                                        <span className="text-xs text-slate-400 line-through font-bold block">{formatBND(item.originalPrice)}</span>
                                    )}
                                    <span className="font-black text-flag-red text-lg">{formatBND(item.price)}</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-bold">{item.category}</p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className={`text-xs font-bold ${item.isAvailable ? 'text-green-600' : 'text-red-400'}`}>{item.isAvailable ? 'Active' : 'Hidden'}</span>
                                <div className="flex items-center gap-2 bg-old-lace rounded-lg p-1">
                                    <button onClick={() => adjustStock(item, -1)} className="p-1 hover:bg-white rounded shadow-sm transition"><Minus size={14}/></button>
                                    <span className="text-xs font-bold w-4 text-center">{item.stock}</span>
                                    <button onClick={() => adjustStock(item, 1)} className="p-1 hover:bg-white rounded shadow-sm transition"><Plus size={14}/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-old-lace border-b border-slate-200 text-xs uppercase text-slate-400 font-bold tracking-wider">
                        <tr>
                            <th className="p-5">Product</th>
                            <th className="p-5">Price (Normal / Bulk)</th>
                            <th className="p-5">Stock Control</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredMenu.map(item => (
                            <tr key={item.id} className="hover:bg-old-lace/50 transition-colors">
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover border border-slate-200" alt="" onError={e => e.target.src="https://placehold.co/150"}/>
                                        <div>
                                            <div className="font-bold text-slate-900">{item.name}</div>
                                            <div className="text-xs text-slate-400">ID: {item.id} • {item.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    {item.originalPrice && item.originalPrice > item.price && (
                                        <span className="text-xs text-slate-400 line-through mr-2">{formatBND(item.originalPrice)}</span>
                                    )}
                                    <span className="font-bold text-flag-red">{formatBND(item.price)}</span>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => adjustStock(item, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-old-lace hover:bg-almond-silk transition"><Minus size={14}/></button>
                                        <span className="font-bold text-slate-700">{item.stock}</span>
                                        <button onClick={() => adjustStock(item, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-old-lace hover:bg-green-100 transition"><Plus size={14}/></button>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                        {item.isAvailable ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <button onClick={() => startEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg mr-2"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* MODAL FORM (UNIFIED CREATE / EDIT) */}
      {(isCreating || editingId) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
             <form 
                onSubmit={handleSubmit} 
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
            >
                 <button type="button" onClick={resetForm} className="absolute top-6 right-6 p-2 rounded-full hover:bg-old-lace transition"><X size={20}/></button>
                 
                 <div className="flex items-center gap-3 mb-6">
                    {editingId && <div className="px-3 py-1 bg-almond-silk text-flag-red text-xs font-bold rounded-full">Editing Mode</div>}
                    <h2 className="text-2xl font-black text-slate-900 bbh-hegarty-regular">{isCreating ? 'Add New Product' : 'Edit Product'}</h2>
                 </div>
                 
                 <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required/>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-old-lace border border-slate-200 rounded-xl outline-none font-medium font-sans">
                                <option value="" disabled>Select Category</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} isTextArea/>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..."/>
                        <Input label="Badge (e.g. Save 10%)" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} placeholder="Optional"/>
                    </div>
                    
                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4 bg-old-lace p-4 rounded-xl border border-almond-silk">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Original Price</label>
                            <input type="number" placeholder="Optional" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-medium font-sans"/>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Selling Price <span className="text-red-500">*</span></label>
                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-medium font-sans"/>
                        </div>
                    </div>

                    {/* Inventory & Limits */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input label="Stock" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required/>
                        <Input label="Min Qty" type="number" value={formData.minQty} onChange={e => setFormData({...formData, minQty: e.target.value})} required/>
                        <Input label="Unit (e.g. Set)" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                        <Input label="Prep Time (Hours)" type="number" value={formData.prepTime} onChange={e => setFormData({...formData, prepTime: e.target.value})} placeholder="24"/>
                    </div>
                    
                    {/* MIX SETTINGS */}
                    <div className="bg-old-lace p-4 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers size={18} className="text-flag-red"/>
                            <span className="text-sm font-bold text-slate-700">Bundle / Mix Settings</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mix Limit</label>
                                 <input type="number" value={formData.mixLimit} onChange={e => setFormData({...formData, mixLimit: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-medium font-sans" placeholder="e.g. 3"/>
                             </div>
                             
                             <div className="flex flex-col gap-2 pt-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mix Type</label>
                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200 hover:border-flag-red transition">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.allowDuplicate} 
                                        onChange={e => setFormData({...formData, allowDuplicate: e.target.checked})} 
                                        className="w-5 h-5 text-flag-red rounded focus:ring-flag-red"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Allow Duplicate Variants?</span>
                                </label>
                                <p className="text-[10px] text-slate-400 leading-tight">If Checked: User can pick 2x Pizza A.<br/>If Unchecked: Only 1x per variant.</p>
                             </div>
                        </div>
                    </div>

                    {/* Options & Status */}
                    <div className="space-y-4">
                        <Input label="Options (Comma separated)" placeholder="e.g. Flavor A, Flavor B, Mixed" value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})}/>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Availability</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="status" checked={formData.isAvailable === true} onChange={() => setFormData({...formData, isAvailable: true})} className="w-5 h-5 text-flag-red"/>
                                    <span className="text-sm font-bold text-slate-700">Active (Visible)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="status" checked={formData.isAvailable === false} onChange={() => setFormData({...formData, isAvailable: false})} className="w-5 h-5 text-flag-red"/>
                                    <span className="text-sm font-bold text-slate-400">Hidden (Inactive)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-flag-red transition shadow-lg flex justify-center items-center gap-2 mt-4">
                        <Save size={20}/> {isCreating ? 'Publish Product' : 'Save Changes'}
                    </button>
                 </div>
             </form>
          </div>
      )}
    </div>
  );
};