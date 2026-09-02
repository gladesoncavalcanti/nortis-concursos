import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, X, Loader2, ShieldCheck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAsaasCheckout } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';
import ProductCover from '@/components/ProductCover.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_BUYER = {
  name: '',
  email: '',
};

// Dados mínimos para identificar o pedido na Nortis. CPF, telefone,
// endereço e dados de pagamento são coletados diretamente na página
// hospedada da Asaas.
const REQUIRED_BUYER_FIELDS = [
  'name',
  'email',
];

function getBuyerValidationError(buyer) {
  for (const field of REQUIRED_BUYER_FIELDS) {
    if (!buyer[field] || !String(buyer[field]).trim()) {
      return 'Preencha seu nome e e-mail para iniciar o pagamento.';
    }
  }
  if (!EMAIL_REGEX.test(buyer.email)) {
    return 'Informe um e-mail válido.';
  }
  return null;
}

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [buyer, setBuyer] = useState(EMPTY_BUYER);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateBuyerField = (field) => (e) => {
    setBuyer((prev) => ({ ...prev, [field]: e.target.value }));
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

    const effectiveBuyer = isAuthenticated ? { ...buyer, name: buyer.name || user?.name } : buyer;
    const validationError = getBuyerValidationError(effectiveBuyer);
    if (validationError) {
      toast({
        title: 'Dados de pagamento incompletos',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      const items = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      toast({
        title: 'Iniciando checkout seguro...',
        description: 'Você será redirecionado para a página de pagamento da Asaas.',
      });

      const { checkoutUrl, error } = await createAsaasCheckout({
        items,
        buyer: {
          name: effectiveBuyer.name,
          email: effectiveBuyer.email,
        },
      });

      if (error || !checkoutUrl) {
        throw new Error(error || 'Não foi possível gerar o checkout.');
      }

      clearCart();
      window.location.href = checkoutUrl;
    } catch (error) {
      setIsCheckingOut(false);
      toast({
        title: 'Erro no Checkout',
        description: error.message || 'Houve um problema ao iniciar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
    }
  }, [cartItems, clearCart, toast, isAuthenticated, buyer, user]);

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
            className="absolute right-0 top-0 h-full max-h-screen w-full max-w-md bg-card text-card-foreground shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="shrink-0 p-6"
              style={{
                background: 'linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
                borderBottom: '1px solid rgba(211,165,47,0.25)',
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <h2
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
                >
                  <ShoppingCartIcon className="w-5 h-5" style={{ color: '#f1c85b' }} />
                  Seu carrinho
                </h2>
                <Button onClick={() => setIsCartOpen(false)} variant="ghost" size="icon" className="text-[#f4efe4] hover:bg-white/10">
                  <X />
                </Button>
              </div>
              <p className="text-xs text-[#f4efe4]/60">
                {cartItems.length > 0
                  ? `${itemCount} ${itemCount === 1 ? 'item' : 'itens'} · Revise seu pedido antes de finalizar a compra.`
                  : 'Revise seu pedido antes de finalizar a compra.'}
              </p>
            </div>

            {/* Região rolável: itens + dados de pagamento. O rodapé
                (Total + Finalizar Compra) fica fora daqui, sempre visível. */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-muted/30">
              <div className="p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center py-16 px-4">
                    <ShoppingCartIcon size={48} className="mb-4 opacity-20" />
                    <p className="font-semibold text-card-foreground mb-1">Seu carrinho está vazio.</p>
                    <p className="text-sm text-muted-foreground mb-6">Adicione a apostila para iniciar sua preparação.</p>
                    <Link to="/apostilas" onClick={() => setIsCartOpen(false)}>
                      <Button className="font-bold bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90">
                        Ver apostilas
                      </Button>
                    </Link>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.variant.id} className="flex items-center gap-4 bg-card border border-[hsl(var(--accent))]/25 p-4 rounded-xl shadow-sm">
                      {item.product.title?.includes('Nexo Social') ? (
                        <div className="w-20 h-20 shrink-0 border border-border rounded-lg overflow-hidden">
                          <ProductCover variant="thumbnail" />
                        </div>
                      ) : (
                        <img src={item.product.image} alt={item.product.title} className="w-20 h-20 object-cover rounded-lg border border-border" />
                      )}
                      <div className="flex-grow">
                        <h3 className="font-semibold text-card-foreground text-sm line-clamp-2 mb-1">{item.product.title}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{item.variant.title}</p>
                        <p className="text-sm text-[hsl(var(--primary))] font-bold">
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
                <div className="px-6 pb-6 bg-card border-t border-border pt-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Identificação do pedido
                    </label>
                    <div className="space-y-2">
                      <Input
                        value={buyer.name}
                        onChange={updateBuyerField('name')}
                        placeholder="Nome completo"
                      />
                      <Input
                        type="email"
                        value={buyer.email}
                        onChange={updateBuyerField('email')}
                        placeholder="Seu e-mail"
                      />
                      <p className="text-xs text-muted-foreground">
                        CPF, telefone, endereço e forma de pagamento serão informados apenas na página segura da Asaas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé fixo: Total + Finalizar Compra ficam sempre visíveis,
                independente de quantos campos de pagamento existam acima. */}
            {cartItems.length > 0 && (
              <div
                className="shrink-0 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                style={{
                  background: 'linear-gradient(90deg, #071622 0%, #071522 45%, #06121f 100%)',
                  borderTop: '1px solid rgba(211,165,47,0.3)',
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[#f4efe4]/70">
                    Total ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
                  </span>
                  <span
                    className="text-2xl font-bold tracking-tight"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: '#f4efe4' }}
                  >
                    {getCartTotal()}
                  </span>
                </div>
                <p className="text-[11px] text-[#f4efe4]/40 mb-4">Pagamento único.</p>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full font-bold py-6 text-lg bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent))]/90 transition-premium"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Redirecionando...
                    </>
                  ) : (
                    'Finalizar compra'
                  )}
                </Button>
                <div className="mt-4 space-y-1">
                  <p className="text-[11px] text-[#f4efe4]/50 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 shrink-0" style={{ color: '#f1c85b' }} />
                    Pagamento seguro via Asaas.
                  </p>
                  <p className="text-[11px] text-[#f4efe4]/50">Pix ou cartão, conforme disponibilidade.</p>
                  <p className="text-[11px] text-[#f4efe4]/50">Acesso ao PDF após confirmação do pagamento.</p>
                  <p className="text-[11px] text-[#f4efe4]/50">A Nortis não armazena dados de cartão.</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;
