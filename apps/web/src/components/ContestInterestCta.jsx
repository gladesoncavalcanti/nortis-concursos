import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { claimContestInterest } from '@/api/contestInterest.js';

const ContestInterestCta = ({
  contestSlug,
  contestTitle,
  className = '',
  variant = 'default',
  size = 'default',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);

  const handleClick = async () => {
    if (isLoading || isSubmitting) return;

    if (!isAuthenticated) {
      toast.info('Crie sua conta ou faça login para acompanhar este concurso.');
      navigate('/signup');
      return;
    }

    setIsSubmitting(true);
    const { error } = await claimContestInterest(contestSlug);
    setIsSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    setIsClaimed(true);
    toast.success(`Interesse registrado para ${contestTitle}.`);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || isSubmitting || isClaimed}
      className={className}
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isClaimed ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <BellPlus className="h-4 w-4" />
      )}
      {isSubmitting
        ? 'Registrando...'
        : isClaimed
          ? 'Interesse registrado'
          : 'Quero acompanhar este concurso'}
    </Button>
  );
};

export default ContestInterestCta;

