import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { CartProvider } from './context/CartContext';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';

// --- LAZY LOAD COMPONENTS ---
const AdminGuard = lazy(() => import('./AdminGuard').then(module => ({ default: module.AdminGuard })));
const MigrateMenu = lazy(() => import('./MigrateMenu').then(module => ({ default: module.MigrateMenu })));
const AIPlanner = lazy(() => import('./components/AIPlanner').then(module => ({ default: module.AIPlanner })));
const PreOrderForm = lazy(() => import('./components/PreOrderForm').then(module => ({ default: module.PreOrderForm })));
const BulkInfoModal = lazy(() => import('./components/BulkInfoModal').then(module => ({ default: module.BulkInfoModal })));

import { Navbar } from './components/Navbar';
import { MenuSection } from './components/MenuSection';
import { CartDrawer } from './components/CartDrawer';

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-[100]">
    <Loader2 className="animate-spin text-amber-500" size={40} />
  </div>
);

// --- KOMPONEN TAMPILAN UTAMA (CUSTOMER) ---
// Dipisahkan agar Navbar/Footer tidak bocor ke halaman Admin
function CustomerLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBulkInfoOpen, setIsBulkInfoOpen] = useState(false);

  return (
    <div className="antialiased font-sans bg-white">
      <Helmet>
        <title>The Coffeennity Yard | Bulk & Event Orders, Made Simple</title>
        <meta name="description" content="Order bulk food effortlessly for your events. Pizza, Pasta, Waffles, and Coffee catering in Brunei with AI Planner assistance." />
        <meta name="keywords" content="catering brunei, bulk order, pizza, pasta, coffee, event food" />
      </Helmet>

      <Navbar 
        openCart={() => setIsCartOpen(true)} 
        openAI={() => setIsAIOpen(true)} 
        openBulkInfo={() => setIsBulkInfoOpen(true)} 
      />
      
      <main className="pt-20 md:pt-24">
        <MenuSection /> 
      </main>

      <footer className="bg-zinc-950 text-zinc-600 py-12 text-center text-sm border-t border-zinc-900">
        <p>&copy; {new Date().getFullYear()} The Coffeennity Yard. All rights reserved.</p>
      </footer>

      {/* MODALS */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <Suspense fallback={null}>
        {isAIOpen && <AIPlanner onClose={() => setIsAIOpen(false)} />}
        {isCheckoutOpen && <PreOrderForm onClose={() => setIsCheckoutOpen(false)} />}
        {isBulkInfoOpen && <BulkInfoModal isOpen={isBulkInfoOpen} onClose={() => setIsBulkInfoOpen(false)} />}
      </Suspense>
    </div>
  );
}

// --- APP UTAMA ---
function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Route untuk Halaman Migrasi */}
            <Route path="/migrate" element={<MigrateMenu />} />

            {/* Route untuk Admin Dashboard */}
            <Route path="/admin/*" element={
              <>
                <Helmet>
                  <title>Admin Dashboard | The Coffeennity Yard</title>
                  <meta name="robots" content="noindex" />
                </Helmet>
                <AdminGuard />
              </>
            } />

            {/* Route Utama (Halaman Depan/Customer) */}
            <Route path="/*" element={<CustomerLayout />} />
          </Routes>
        </Suspense>

      </CartProvider>
    </HelmetProvider>
  );
}

export default App;