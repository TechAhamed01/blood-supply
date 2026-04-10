import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  blood_group: yup.string().required('Blood group is required'),
  units_requested: yup.number()
    .required('Units are required')
    .positive('Must be positive')
    .integer('Must be whole number')
    .max(100, 'Maximum 100 units per request'),
  emergency_flag: yup.boolean(),
  is_emergency_broadcast: yup.boolean(),
  notes: yup.string().max(500, 'Notes too long')
}).required();

const bloodGroups = ['O+', 'A+', 'B+', 'O-', 'A-', 'AB+', 'B-', 'AB-'];

const AllocationRequestForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      emergency_flag: false,
      notes: ''
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
          className={`input-field ${errors.blood_group ? 'border-red-500' : ''}`}
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
          Units Requested *
        </label>
        <input
          {...register('units_requested')}
          type="number"
          min="1"
          max="100"
          className={`input-field ${errors.units_requested ? 'border-red-500' : ''}`}
          placeholder="Enter number of units"
        />
        {errors.units_requested && (
          <p className="mt-1 text-xs text-red-600">{errors.units_requested.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          {...register('emergency_flag')}
          type="checkbox"
          id="emergency"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="emergency" className="ml-2 block text-sm text-gray-700">
          Emergency Request
        </label>
      </div>

      <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-100">
        <input
          {...register('is_emergency_broadcast')}
          type="checkbox"
          id="is_emergency_broadcast"
          className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <div className="ml-3 flex flex-col">
          <label htmlFor="is_emergency_broadcast" className="block text-sm font-bold text-red-800">
            Emergency Broadcast Override
          </label>
          <span className="text-xs text-red-600">Triggers an immediate system-wide push notification to all reachable blood banks.</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          {...register('notes')}
          rows="4"
          className={`input-field ${errors.notes ? 'border-red-500' : ''}`}
          placeholder="Any specific requirements..."
        />
        {errors.notes && (
          <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};

export default AllocationRequestForm;