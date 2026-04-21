import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[160] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-50 text-primary-900 rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-slate-900">Tu Bolsa</h3>
                  <p className="text-slate-400 text-sm">{cart.length} items seleccionados</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <ShoppingBag size={40} />
                  </div>
                  <div>
                    <p className="text-slate-800 font-serif text-xl">Tu bolsa está vacía</p>
                    <p className="text-slate-400 text-sm">¿Aún no has descubierto tus tesoros?</p>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-primary-900 font-bold text-sm hover:underline"
                  >
                    Seguir explorando
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex space-x-4 group">
                    <div className="w-20 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={item.images?.[0] || 'https://via.placeholder.com/150'} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-slate-800 leading-tight pr-4">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest">{item.category}</p>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex items-center space-x-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-400 hover:text-primary-900"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-400 hover:text-primary-900"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="font-serif text-primary-900 font-bold">${item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-serif text-slate-900">${cartTotal}</span>
                </div>
                <button className="w-full bg-primary-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-primary-900/10">
                  Finalizar Compra
                </button>
                <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
                  Envío gratuito en tu primera compra wellness
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
