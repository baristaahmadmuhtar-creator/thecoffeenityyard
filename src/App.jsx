import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import { CartProvider } from './context/CartContext';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from './components/ErrorBoundary';

const AdminGuard = lazy(() => import('./AdminGuard').then(module => ({ default: module.AdminGuard })));
const MigrateMenu = lazy(() => import('./MigrateMenu').then(module => ({ default: module.MigrateMenu })));
const AIPlanner = lazy(() => import('./components/AIPlanner').then(module => ({ default: module.AIPlanner })));
const PreOrderForm = lazy(() => import('./components/PreOrderForm').then(module => ({ default: module.PreOrderForm })));
const BulkInfoModal = lazy(() => import('./components/BulkInfoModal').then(module => ({ default: module.BulkInfoModal })));

import { Navbar } from './components/Navbar';
import { MenuSection } from './components/MenuSection';
import { GallerySection } from './components/GallerySection'; 
import { CartDrawer } from './components/CartDrawer';

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-old-lace z-[100]">
    <Loader2 className="animate-spin text-flag-red" size={40} />
  </div>
);

function CustomerLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBulkInfoOpen, setIsBulkInfoOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  const shouldHideNavbar = isCartOpen || isAIOpen || isCheckoutOpen || isBulkInfoOpen || isMenuModalOpen || isGalleryOpen;

  return (
    <div className="antialiased font-sans bg-old-lace min-h-screen flex flex-col">
      <Helmet>
        <title>The Coffeennity Yard | Bulk & Event Orders, Made Simple</title>
        <meta name="description" content="Elevate your events with The Coffeennity Yard. Bulk ordering for Pizza, Pasta, Waffles, and Artisanal Coffee in Brunei." />
        <link rel="canonical" href="https://yardorders.com" />
      </Helmet>

      {!shouldHideNavbar && (
        <Navbar 
            openCart={() => setIsCartOpen(true)} 
            openAI={() => setIsAIOpen(true)} 
            openBulkInfo={() => setIsBulkInfoOpen(true)}
            openGallery={() => setIsGalleryOpen(true)}
        />
      )}
      
      <main className="flex-grow pt-28 md:pt-32">
        <MenuSection onModalChange={setIsMenuModalOpen} /> 
      </main>

      <footer className="bg-white/60 backdrop-blur-xl border-t border-white py-12 px-6 mt-12 relative z-10">
        <div className="container mx-auto flex flex-col items-center justify-center text-center space-y-4">
            <div className="font-heading text-2xl text-flag-red tracking-tight opacity-90 select-none">
                THE YARD <span className="text-slate-900 text-lg">BULK ORDER.</span>
            </div>
            <p className="text-slate-500 font-medium text-sm max-w-md">
                Bulk & Event Orders, Made Simple.
            </p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pt-4">
                &copy; {new Date().getFullYear()} The Coffeennity Yard.
            </p>
        </div>
      </footer>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <GallerySection isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />

      <Suspense fallback={null}>
        {isAIOpen && <AIPlanner onClose={() => setIsAIOpen(false)} />}
        {isCheckoutOpen && <PreOrderForm onClose={() => setIsCheckoutOpen(false)} />}
        {isBulkInfoOpen && <BulkInfoModal isOpen={isBulkInfoOpen} onClose={() => setIsBulkInfoOpen(false)} />}
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <CartProvider>
          <Toaster 
            position="bottom-center" 
            toastOptions={{ 
                duration: 3000,
                style: {
                    background: '#334155',
                    color: '#fff',
                    borderRadius: '1rem',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                },
                success: {
                    style: { background: '#fff', color: '#15803d', border: '1px solid #dcfce7' },
                    iconTheme: { primary: '#15803d', secondary: '#fff' }
                },
                error: {
                    style: { background: '#fff', color: '#b91c1c', border: '1px solid #fee2e2' },
                    iconTheme: { primary: '#b91c1c', secondary: '#fff' }
                }
            }} 
          />
          
          <Analytics />

          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/migrate" element={<MigrateMenu />} />

              <Route path="/admin/*" element={
                <>
                  <Helmet>
                    <title>Admin Dashboard | The Coffeennity Yard</title>
                    <meta name="robots" content="noindex" />
                  </Helmet>
                  <AdminGuard />
                </>
              } />

              <Route path="/*" element={<CustomerLayout />} />
            </Routes>
          </Suspense>

        </CartProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;