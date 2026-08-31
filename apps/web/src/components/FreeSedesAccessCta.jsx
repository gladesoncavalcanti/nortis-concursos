import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { claimFreeSedesAccess } from '@/api/enrollments.js';

const FreeSedesAccessCta = ({
  className = '',
  variant = 'default',
  size = 'default',
  label = 'Acessar gratuitamente',
  onClaimed,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClick = async () => {
    if (isLoading || isClaiming) return;

    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    setIsClaiming(true);
    const { error } = await claimFreeSedesAccess();

    if (error) {
      toast.error(error);
      setIsClaiming(false);
      return;
    }

    setIsClaiming(false);
    toast.success('Acesso gratuito liberado na sua Central Nortis.');
    await onClaimed?.();
    navigate('/minha-conta');
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || isClaiming}
      className={className}
    >
      {isClaiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
      {isClaiming ? 'Liberando acesso...' : label}
      {!isClaiming && <ArrowRight className="h-4 w-4" />}
    </Button>
  );
};

export default FreeSedesAccessCta;
