import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, X, Tag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initializeCheckout } from '@/api/EcommerceApi';
import { useToast } from '@/hooks/use-toast';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [coupon, setCoupon] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = () => {
    if (!coupon) return;
    setIsApplyingCoupon(true);
    setTimeout(() => {
      if (coupon.toUpperCase() === 'BEMVINDO10' || coupon.toUpperCase() === 'COMBO20') {
        toast({
          title: 'Cupom Aplicado!',
          description: 'O desconto será refletido no checkout.',
        });
      } else {
        toast({
          title: 'Cupom Inválido',
          description: 'Este cupom não existe ou expirou.',
          variant: 'destructive'
        });
      }
      setIsApplyingCoupon(false);
      setCoupon('');
    }, 600);
  };

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione apostilas antes de finalizar a compra.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const items = cartItems.map(item => ({
        variant_id: item.variant.id,
        quantity: item.quantity,
      }));

      const successUrl = `${window.location.origin}/success`;
      const cancelUrl = window.location.href;

      toast({
        title: 'Iniciando checkout seguro...',
        description: 'Você será redirecionado em instantes.',
      });

      const { url } = await initializeCheckout({ items, successUrl, cancelUrl });

      clearCart();
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Erro no Checkout',
        description: 'Houve um problema ao iniciar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
    }
  }, [cartItems, clearCart, toast]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/60 z-50 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-card text-card-foreground shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border bg-[hsl(var(--primary))] text-white">
              <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-[hsl(var(--secondary))]" />
                Seu Carrinho
              </h2>
              <Button onClick={() => setIsCartOpen(false)} variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <X />
              </Button>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-muted/30">
              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <ShoppingCartIcon size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Seu carrinho está vazio.</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.variant.id} className="flex items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
                    <img src={item.product.image} alt={item.product.title} className="w-20 h-20 object-cover rounded-lg border border-border" />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-card-foreground text-sm line-clamp-2 mb-1">{item.product.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{item.variant.title}</p>
                      <p className="text-sm text-[hsl(var(--secondary))] font-bold">
                        {item.variant.sale_price_formatted || item.variant.price_formatted}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center border border-border rounded-md bg-muted/50">
                        <Button onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))} size="sm" variant="ghost" className="h-8 px-2 text-card-foreground hover:bg-muted">-</Button>
                        <span className="px-2 text-sm font-medium">{item.quantity}</span>
                        <Button onClick={() => updateQuantity(item.variant.id, item.quantity + 1)} size="sm" variant="ghost" className="h-8 px-2 text-card-foreground hover:bg-muted">+</Button>
                      </div>
                      <Button onClick={() => removeFromCart(item.variant.id)} size="sm" variant="ghost" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 text-xs h-6 px-2">Remover</Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border bg-card">
                <div className="mb-6">
                  <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Cupom de Desconto
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Ex: BEMVINDO10" 
                      className="uppercase"
                    />
                    <Button 
                      onClick={handleApplyCoupon}
                      disabled={!coupon || isApplyingCoupon}
                      variant="outline"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 text-card-foreground">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-bold text-[hsl(var(--secondary))]">{getCartTotal()}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] text-white hover:text-[hsl(var(--primary))] font-bold py-6 text-lg transition-colors">
                  Finalizar Compra
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;