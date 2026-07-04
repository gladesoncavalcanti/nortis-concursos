import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, X, Tag, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createAsaasCheckout } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_BUYER = {
  name: '',
  email: '',
  cpfCnpj: '',
  phone: '',
  postalCode: '',
  address: '',
  addressNumber: '',
  complement: '',
  province: '',
  city: '',
  state: '',
};

// Campos exigidos pela Asaas para criar o checkout (customerData) —
// complement fica de fora de propósito, é o único opcional.
const REQUIRED_BUYER_FIELDS = [
  'name',
  'email',
  'cpfCnpj',
  'phone',
  'postalCode',
  'address',
  'addressNumber',
  'province',
  'city',
  'state',
];

function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function getBuyerValidationError(buyer) {
  for (const field of REQUIRED_BUYER_FIELDS) {
    if (!buyer[field] || !String(buyer[field]).trim()) {
      return 'Preencha todos os dados obrigatórios para pagamento.';
    }
  }
  if (!EMAIL_REGEX.test(buyer.email)) {
    return 'Informe um e-mail válido.';
  }
  const cpfCnpjDigits = onlyDigits(buyer.cpfCnpj);
  if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) {
    return 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.';
  }
  if (onlyDigits(buyer.postalCode).length !== 8) {
    return 'Informe um CEP válido (8 dígitos).';
  }
  if (buyer.state.trim().length !== 2) {
    return 'Informe a UF com 2 letras (ex: DF).';
  }
  return null;
}

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [coupon, setCoupon] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [buyer, setBuyer] = useState(EMPTY_BUYER);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const updateBuyerField = (field) => (e) => {
    setBuyer((prev) => ({ ...prev, [field]: e.target.value }));
  };

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
          ...effectiveBuyer,
          cpfCnpj: onlyDigits(effectiveBuyer.cpfCnpj),
          phone: onlyDigits(effectiveBuyer.phone),
          postalCode: onlyDigits(effectiveBuyer.postalCode),
          state: effectiveBuyer.state.trim().toUpperCase(),
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
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-border bg-[hsl(var(--primary))] text-white">
              <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                <ShoppingCartIcon className="w-5 h-5 text-[hsl(var(--secondary))]" />
                Seu Carrinho
              </h2>
              <Button onClick={() => setIsCartOpen(false)} variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <X />
              </Button>
            </div>

            {/* Região rolável: itens + cupom + dados de pagamento. O rodapé
                (Total + Finalizar Compra) fica fora daqui, sempre visível. */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-muted/30">
              <div className="p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center py-12">
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
                <div className="px-6 pb-6 bg-card border-t border-border pt-6">
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

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Dados para pagamento (exigidos pela Asaas)
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
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={buyer.cpfCnpj}
                          onChange={updateBuyerField('cpfCnpj')}
                          placeholder="CPF ou CNPJ"
                        />
                        <Input
                          value={buyer.phone}
                          onChange={updateBuyerField('phone')}
                          placeholder="Telefone"
                        />
                      </div>
                      <Input
                        value={buyer.postalCode}
                        onChange={updateBuyerField('postalCode')}
                        placeholder="CEP"
                      />
                      <Input
                        value={buyer.address}
                        onChange={updateBuyerField('address')}
                        placeholder="Endereço"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={buyer.addressNumber}
                          onChange={updateBuyerField('addressNumber')}
                          placeholder="Número"
                        />
                        <Input
                          value={buyer.complement}
                          onChange={updateBuyerField('complement')}
                          placeholder="Complemento (opcional)"
                        />
                      </div>
                      <Input
                        value={buyer.province}
                        onChange={updateBuyerField('province')}
                        placeholder="Bairro"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <Input
                            value={buyer.city}
                            onChange={updateBuyerField('city')}
                            placeholder="Cidade"
                          />
                        </div>
                        <Input
                          value={buyer.state}
                          onChange={updateBuyerField('state')}
                          placeholder="UF"
                          maxLength={2}
                          className="uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé fixo: Total + Finalizar Compra ficam sempre visíveis,
                independente de quantos campos de pagamento existam acima. */}
            {cartItems.length > 0 && (
              <div className="shrink-0 p-6 border-t border-border bg-card shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="flex justify-between items-center mb-4 text-card-foreground">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-bold text-[hsl(var(--secondary))]">{getCartTotal()}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] text-white hover:text-[hsl(var(--primary))] font-bold py-6 text-lg transition-colors"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Redirecionando...
                    </>
                  ) : (
                    'Finalizar Compra'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Pagamento via Pix ou cartão, processado com segurança pela Asaas. A Nortis não armazena dados de cartão.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;