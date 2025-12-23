'use client';

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

// Map of MIME types to human-readable formats
const FILE_FORMATS = {
  'application/pdf': { name: 'PDF', icon: 'DocumentTextIcon', color: 'text-red-500' },
  'application/epub+zip': { name: 'EPUB', icon: 'BookOpenIcon', color: 'text-green-500' },
  'application/x-mobipocket-ebook': { name: 'MOBI', icon: 'BookOpenIcon', color: 'text-blue-500' },
  'application/zip': { name: 'ZIP', icon: 'ArchiveBoxIcon', color: 'text-yellow-500' },
  'application/x-rar-compressed': { name: 'RAR', icon: 'ArchiveBoxIcon', color: 'text-orange-500' },
  'audio/mpeg': { name: 'MP3', icon: 'MusicalNoteIcon', color: 'text-purple-500' },
  'audio/mp4': { name: 'M4A', icon: 'MusicalNoteIcon', color: 'text-purple-500' },
  'video/mp4': { name: 'MP4', icon: 'FilmIcon', color: 'text-pink-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { name: 'DOCX', icon: 'DocumentTextIcon', color: 'text-blue-600' },
  'application/msword': { name: 'DOC', icon: 'DocumentTextIcon', color: 'text-blue-600' },
};

// Accepted MIME types
const ACCEPTED_TYPES = Object.keys(FILE_FORMATS);

// Format bytes to human readable
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DigitalFileUpload({ files, setFiles, error, maxFiles = 5 }) {
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
    const maxSize = 100 * 1024 * 1024; // 100MB
    const newFiles = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        // Try to infer type from extension
        const ext = file.name.split('.').pop().toLowerCase();
        const extToType = {
          'pdf': 'application/pdf',
          'epub': 'application/epub+zip',
          'mobi': 'application/x-mobipocket-ebook',
          'zip': 'application/zip',
          'rar': 'application/x-rar-compressed',
          'mp3': 'audio/mpeg',
          'm4a': 'audio/mp4',
          'mp4': 'video/mp4',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'doc': 'application/msword',
        };
        
        if (!extToType[ext]) {
          alert(`${file.name} is not a supported file type. Supported: PDF, EPUB, MOBI, ZIP, RAR, MP3, M4A, MP4, DOC, DOCX`);
          continue;
        }
      }
      
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum file size is 100MB.`);
        continue;
      }
      
      if (files.length + newFiles.length >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        break;
      }
      
      newFiles.push(file);
    }
    
    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileInfo = (file) => {
    const format = FILE_FORMATS[file.type] || { 
      name: file.name.split('.').pop().toUpperCase(), 
      icon: 'DocumentIcon', 
      color: 'text-gray-500' 
    };
    return format;
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
          accept=".pdf,.epub,.mobi,.zip,.rar,.mp3,.m4a,.mp4,.doc,.docx"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon 
              name="CloudArrowUpIcon" 
              size={32} 
              className={dragActive ? 'text-primary' : 'text-muted-foreground'} 
            />
          </div>
          
          <div>
            <p className="text-foreground font-medium mb-1">
              {dragActive ? 'Drop files here' : 'Drag and drop digital files here'}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              or click to browse from your device
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Select Files
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            PDF, EPUB, MOBI, ZIP, RAR, MP3, M4A, MP4, DOC, DOCX • Max 100MB per file • Up to {maxFiles} files
          </p>
        </div>
      </div>
      
      {error && (
        <p className="text-error text-sm flex items-center gap-1">
          <Icon name="ExclamationCircleIcon" size={16} />
          {error}
        </p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Uploaded Files ({files.length})</p>
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {files.map((file, index) => {
              const fileInfo = getFileInfo(file);
              return (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-muted ${fileInfo.color}`}>
                    <Icon name={fileInfo.icon} size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
                        {fileInfo.name}
                      </span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-2 hover:bg-error/10 rounded-lg transition-colors group"
                    title="Remove file"
                  >
                    <Icon name="TrashIcon" size={18} className="text-muted-foreground group-hover:text-error" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <Icon name="InformationCircleIcon" size={20} className="text-accent flex-shrink-0" />
          <p className="text-sm text-foreground">
            These files will be securely stored and only accessible to customers who purchase your product.
          </p>
        </div>
      )}
    </div>
  );
}

DigitalFileUpload.propTypes = {
  files: PropTypes.array.isRequired,
  setFiles: PropTypes.func.isRequired,
  error: PropTypes.string,
  maxFiles: PropTypes.number
};

