'use client';

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function ProductImageUpload({ images, setImages, error, maxImages = 6 }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const newFiles = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type. Please use JPEG, PNG, GIF, or WebP.`);
        continue;
      }
      
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        continue;
      }
      
      if (images.length + newFiles.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed.`);
        break;
      }
      
      newFiles.push(file);
    }
    
    if (newFiles.length > 0) {
      setImages([...images, ...newFiles]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    setImages(newImages);
  };

  const getImagePreview = (file) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : error 
              ? 'border-error bg-error/5' 
              : 'border-input hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon 
              name="PhotoIcon" 
              size={32} 
              className={dragActive ? 'text-primary' : 'text-muted-foreground'} 
            />
          </div>
          
          <div>
            <p className="text-foreground font-medium mb-1">
              {dragActive ? 'Drop images here' : 'Drag and drop images here'}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              or click to browse from your device
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Select Images
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            JPEG, PNG, GIF, WebP • Max 5MB per image • Up to {maxImages} images
          </p>
        </div>
      </div>
      
      {error && (
        <p className="text-error text-sm flex items-center gap-1">
          <Icon name="ExclamationCircleIcon" size={16} />
          {error}
        </p>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((file, index) => (
            <div 
              key={index} 
              className={`relative group rounded-lg overflow-hidden bg-muted border-2 ${
                index === 0 ? 'border-primary' : 'border-transparent'
              }`}
            >
              <div className="aspect-square">
                <AppImage
                  src={getImagePreview(file)}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                  Primary
                </div>
              )}
              
              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, 0)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Set as primary"
                  >
                    <Icon name="StarIcon" size={18} className="text-white" />
                  </button>
                )}
                
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Move left"
                  >
                    <Icon name="ChevronLeftIcon" size={18} className="text-white" />
                  </button>
                )}
                
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Move right"
                  >
                    <Icon name="ChevronRightIcon" size={18} className="text-white" />
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-error/80 hover:bg-error rounded-lg transition-colors"
                  title="Remove"
                >
                  <Icon name="TrashIcon" size={18} className="text-white" />
                </button>
              </div>
              
              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs truncate">{file.name}</p>
                <p className="text-white/70 text-xs">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {images.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {images.length} of {maxImages} images uploaded. First image will be used as the primary product image.
        </p>
      )}
    </div>
  );
}

ProductImageUpload.propTypes = {
  images: PropTypes.array.isRequired,
  setImages: PropTypes.func.isRequired,
  error: PropTypes.string,
  maxImages: PropTypes.number
};

