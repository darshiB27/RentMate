// Edit Property Listing Page
// Purpose: Fetches existing stay details, prepopulates form fields, and submits changes via multipart FormData.
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPropertyById, updatePropertyRequest } from '../features/properties/services/propertyApi.js';

const propertyFormSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters.')
    .max(100, 'Title cannot exceed 100 characters.'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters.')
    .max(2000, 'Description cannot exceed 2000 characters.'),
  price: z.coerce
    .number()
    .min(1, 'Monthly price must be greater than zero.'),
  type: z.enum(['PG', 'Hostel', 'Flat'], {
    errorMap: () => ({ message: 'Select a valid property type.' }),
  }),
  sharingType: z.enum(['single', 'double', 'triple', 'quad', 'other'], {
    errorMap: () => ({ message: 'Select a sharing type.' }),
  }),
  genderCategory: z.enum(['boys', 'girls', 'unisex'], {
    errorMap: () => ({ message: 'Select a gender category.' }),
  }),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity.'),
  longitude: z.coerce
    .number()
    .min(-180)
    .max(180),
  latitude: z.coerce
    .number()
    .min(-90)
    .max(90),
  address: z.object({
    street: z.string().min(1, 'Street address is required.'),
    locality: z.string().min(1, 'Locality is required.'),
    city: z.string().min(1, 'City is required.'),
    state: z.string().min(1, 'State is required.'),
    zipCode: z.string().min(1, 'Zip code is required.'),
  }),
});

const AVAILABLE_AMENITIES = [
  'WiFi', 'AC', 'Power Backup', 'Laundry', 'Gym', 
  'Geyser', 'TV', 'CCTV Security', 'Parking', 'Housekeeping'
];

export default function EditProperty() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [existingImages, setExistingImages] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      amenities: [],
    },
  });

  const selectedAmenities = watch('amenities');

  // Query property by ID
  const { data: propertyResponse, isLoading: isFetching } = useQuery({
    queryKey: ['propertyDetailEdit', id],
    queryFn: () => getPropertyById(id).then((res) => res.data?.data || {}),
    enabled: !!id,
  });

  // Reset form once property details load
  useEffect(() => {
    if (propertyResponse) {
      reset({
        title: propertyResponse.title,
        description: propertyResponse.description,
        price: propertyResponse.price,
        type: propertyResponse.type,
        sharingType: propertyResponse.sharingType,
        genderCategory: propertyResponse.genderCategory,
        amenities: propertyResponse.amenities || [],
        latitude: propertyResponse.location?.coordinates?.[1] ?? 12.9716,
        longitude: propertyResponse.location?.coordinates?.[0] ?? 77.5946,
        address: {
          street: propertyResponse.address?.street || '',
          locality: propertyResponse.address?.locality || '',
          city: propertyResponse.address?.city || '',
          state: propertyResponse.address?.state || '',
          zipCode: propertyResponse.address?.zipCode || '',
        },
      });
      setExistingImages(propertyResponse.images || []);
    }
  }, [propertyResponse, reset]);

  const updateMutation = useMutation({
    mutationFn: (formData) => updatePropertyRequest(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerProperties'] });
      queryClient.invalidateQueries({ queryKey: ['propertyDetailEdit', id] });
      queryClient.invalidateQueries({ queryKey: ['ownerPropertiesDashboard'] });
      navigate('/owner/properties');
    },
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setFileError('You can upload a maximum of 10 new images.');
      return;
    }
    setFileError('');
    setImageFiles(files);
  };

  const handleAmenityToggle = (amenity) => {
    const nextAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setValue('amenities', nextAmenities, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('type', data.type);
    formData.append('sharingType', data.sharingType);
    formData.append('genderCategory', data.genderCategory);
    formData.append('latitude', data.latitude);
    formData.append('longitude', data.longitude);
    formData.append('address', JSON.stringify(data.address));
    formData.append('amenities', JSON.stringify(data.amenities));

    // Append new files
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    updateMutation.mutate(formData);
  };

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
        Fetching stay listing details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Edit Stay Listing</h1>
          <p className="text-sm text-slate-400">Modify details, adjust coordinates, or append new photos.</p>
        </div>
        <Link to="/owner/properties" className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
          Back to Listings
        </Link>
      </div>

      {updateMutation.isError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-semibold">
          {updateMutation.error?.response?.data?.message || updateMutation.error?.message || 'Failed to update listing. Verify inputs.'}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Specs */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
            General Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Listing Title</label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.title && <p className="text-[10px] text-rose-500 font-bold">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Description</label>
              <textarea
                rows={4}
                {...register('description')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.description && <p className="text-[10px] text-rose-500 font-bold">{errors.description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent Price (₹)</label>
              <input
                type="number"
                {...register('price')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.price && <p className="text-[10px] text-rose-500 font-bold">{errors.price.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Property Type</label>
              <select
                {...register('type')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Flat">Flat</option>
              </select>
              {errors.type && <p className="text-[10px] text-rose-500 font-bold">{errors.type.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Sharing Configuration</label>
              <select
                {...register('sharingType')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="single">Single Sharing</option>
                <option value="double">Double Sharing</option>
                <option value="triple">Triple Sharing</option>
                <option value="quad">Quad sharing</option>
                <option value="other">Other/Full Flat</option>
              </select>
              {errors.sharingType && <p className="text-[10px] text-rose-500 font-bold">{errors.sharingType.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Gender Allocation</label>
              <select
                {...register('genderCategory')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="boys">Boys Only</option>
                <option value="girls">Girls Only</option>
                <option value="unisex">Unisex/Anyone</option>
              </select>
              {errors.genderCategory && <p className="text-[10px] text-rose-500 font-bold">{errors.genderCategory.message}</p>}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
            Address & Location Mapping
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Street Address</label>
              <input
                type="text"
                {...register('address.street')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.address?.street && <p className="text-[10px] text-rose-500 font-bold">{errors.address.street.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Locality/Area</label>
              <input
                type="text"
                {...register('address.locality')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.address?.locality && <p className="text-[10px] text-rose-500 font-bold">{errors.address.locality.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">City</label>
              <input
                type="text"
                {...register('address.city')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.address?.city && <p className="text-[10px] text-rose-500 font-bold">{errors.address.city.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">State</label>
              <input
                type="text"
                {...register('address.state')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.address?.state && <p className="text-[10px] text-rose-500 font-bold">{errors.address.state.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Zip Code</label>
              <input
                type="text"
                {...register('address.zipCode')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.address?.zipCode && <p className="text-[10px] text-rose-500 font-bold">{errors.address.zipCode.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Latitude Coordinate</label>
              <input
                type="number"
                step="0.000001"
                {...register('latitude')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.latitude && <p className="text-[10px] text-rose-500 font-bold">{errors.latitude.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Longitude Coordinate</label>
              <input
                type="number"
                step="0.000001"
                {...register('longitude')}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              {errors.longitude && <p className="text-[10px] text-rose-500 font-bold">{errors.longitude.message}</p>}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-50 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Provided Amenities
            </h3>
            {errors.amenities && <p className="text-[10px] text-rose-500 font-bold">{errors.amenities.message}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {AVAILABLE_AMENITIES.map((amenity) => {
              const isChecked = selectedAmenities?.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                    isChecked
                      ? 'bg-indigo-550 border-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo Gallery (Existing and new additions) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
            Gallery Photos Management
          </h3>

          {/* Existing Photos list */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Current Listing Photos</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-100">
                    <img src={url} alt={`Property page ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New uploads input */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-[10px] uppercase font-bold text-slate-400">Upload Additional Photos (Max 10)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-slate-250 border-dashed rounded-xl text-xs text-slate-550 focus:outline-hidden cursor-pointer"
            />
            {fileError && <p className="text-[10px] text-rose-500 font-bold">{fileError}</p>}

            {imageFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-slate-650 font-bold">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 items-center justify-end">
          <Link
            to="/owner/properties"
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Updating...' : 'Save Updates'}
          </button>
        </div>

      </form>
    </div>
  );
}
