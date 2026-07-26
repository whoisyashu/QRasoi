import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save, Store, Clock, Phone, MapPin } from 'lucide-react';

const settingsSchema = z.object({
  name: z.string().min(2, 'Restaurant name is required'),
  tagline: z.string().optional(),
  address: z.string().min(5, 'Restaurant address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  openingHours: z.string().min(2, 'Opening hours are required'),
  orderTimeoutMinutes: z.number().min(5, 'Minimum timeout is 5 minutes').max(60, 'Maximum timeout is 60 minutes'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const SettingsPage: React.FC = () => {
  const { restaurant, fetchRestaurantProfile, updateRestaurant } = useAuthStore();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: restaurant.name,
      tagline: restaurant.tagline || '',
      address: restaurant.address,
      phone: restaurant.phone,
      openingHours: restaurant.openingHours,
      orderTimeoutMinutes: restaurant.orderTimeoutMinutes,
    },
  });

  useEffect(() => {
    fetchRestaurantProfile().then(() => {
      reset({
        name: restaurant.name,
        tagline: restaurant.tagline || '',
        address: restaurant.address,
        phone: restaurant.phone,
        openingHours: restaurant.openingHours,
        orderTimeoutMinutes: restaurant.orderTimeoutMinutes,
      });
    });
  }, [fetchRestaurantProfile, reset, restaurant.id]);

  const onSubmit = async (data: SettingsFormData) => {
    const success = await updateRestaurant(data);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-heading font-extrabold text-2xl text-[#334155]">Restaurant Settings</h2>
        <p className="text-xs text-[#6B7280]">
          Manage your restaurant profile, contact details, and unpaid order expiration timeouts.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold">
          Settings updated successfully! Your digital QR menu reflects these changes.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-[#334155] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#F97316]" />
            <span>General Information</span>
          </h3>

          <Input
            label="Restaurant Name *"
            {...register('name')}
            error={errors.name?.message}
          />

          <Input
            label="Tagline / Specialty"
            {...register('tagline')}
            error={errors.tagline?.message}
          />

          <Input
            label="Address *"
            {...register('address')}
            error={errors.address?.message}
            leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone *"
              {...register('phone')}
              error={errors.phone?.message}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            />
            <Input
              label="Opening Hours *"
              {...register('openingHours')}
              error={errors.openingHours?.message}
              leftIcon={<Clock className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </Card>

        {/* Order Timeout Rules (Rule 26) */}
        <Card className="p-6 space-y-4 border-l-4 border-l-amber-500">
          <h3 className="font-bold text-base text-[#334155] flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Unpaid Order Auto-Expiration Timeout (Rule 26)</span>
          </h3>
          <p className="text-xs text-[#6B7280]">
            Pending orders where the customer does not visit the counter to pay will automatically expire after this timeout.
          </p>

          <Input
            label="Timeout Duration (Minutes) *"
            type="number"
            {...register('orderTimeoutMinutes', { valueAsNumber: true })}
            error={errors.orderTimeoutMinutes?.message}
          />
        </Card>

        <Button
          variant="primary"
          size="lg"
          type="submit"
          isLoading={isSubmitting}
          leftIcon={<Save className="w-5 h-5" />}
          className="font-bold"
        >
          Save Settings
        </Button>
      </form>
    </div>
  );
};
