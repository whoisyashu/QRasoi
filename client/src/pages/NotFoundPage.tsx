import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-orange-100 text-[#F97316] rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <UtensilsCrossed className="w-10 h-10" />
      </div>

      <h1 className="font-heading font-extrabold text-5xl text-[#334155] mb-2">404</h1>
      <h2 className="font-heading font-bold text-2xl text-[#334155] mb-3">Page Not Found</h2>
      <p className="text-sm text-[#6B7280] max-w-md mb-8 leading-relaxed">
        The page or food menu route you are looking for does not exist or has been moved.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};
