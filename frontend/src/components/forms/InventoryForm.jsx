import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  blood_group: yup.string().required('Blood group is required'),
  units_available: yup.number()
    .required('Units are required')
    .positive('Must be positive')
    .integer('Must be whole number'),
  units_reserved: yup.number()
    .min(0, 'Cannot be negative')
    .integer('Must be whole number'),
  expiry_date: yup.date()
    .required('Expiry date is required')
    .min(new Date(), 'Expiry date must be in the future'),
}).required();

const bloodGroups = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-', 'AB-'];

const InventoryForm = ({ onSubmit, loading, initialData = null }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      units_reserved: 0
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Blood Group *
        </label>
        <select
          {...register('blood_group')}
          className="input-field"
          disabled={!!initialData}
        >
          <option value="">Select blood group</option>
          {bloodGroups.map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
        {errors.blood_group && (
          <p className="mt-1 text-xs text-red-600">{errors.blood_group.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Units Available *
        </label>
        <input
          {...register('units_available')}
          type="number"
          className="input-field"
          placeholder="Enter number of units"
        />
        {errors.units_available && (
          <p className="mt-1 text-xs text-red-600">{errors.units_available.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Units Reserved
        </label>
        <input
          {...register('units_reserved')}
          type="number"
          className="input-field"
          placeholder="Enter reserved units"
        />
        {errors.units_reserved && (
          <p className="mt-1 text-xs text-red-600">{errors.units_reserved.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expiry Date *
        </label>
        <input
          {...register('expiry_date')}
          type="date"
          className="input-field"
          min={new Date().toISOString().split('T')[0]}
        />
        {errors.expiry_date && (
          <p className="mt-1 text-xs text-red-600">{errors.expiry_date.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50"
      >
        {loading ? 'Saving...' : initialData ? 'Update Inventory' : 'Add Inventory'}
      </button>
    </form>
  );
};

export default InventoryForm;