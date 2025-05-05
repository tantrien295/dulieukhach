import { useState, useRef, ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
}

export default function ImageUpload({ onImagesUploaded }: ImageUploadProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const processFiles = (files: FileList) => {
    if (previewImages.length >= MAX_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can only upload a maximum of ${MAX_IMAGES} images.`,
        variant: "destructive"
      });
      return;
    }
    
    const newFiles = Array.from(files).slice(0, MAX_IMAGES - previewImages.length);
    
    // Check file types and sizes
    const validFiles = newFiles.filter(file => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image type. Please use JPG, PNG or WebP.`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB size limit.`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Create image URLs
    const newImageUrls: string[] = [];
    
    validFiles.forEach(file => {
      // In a real app, you would upload these to cloud storage
      // For this demo, we'll just use local object URLs
      const imageUrl = URL.createObjectURL(file);
      newImageUrls.push(imageUrl);
    });
    
    setPreviewImages(prev => [...prev, ...newImageUrls]);
    onImagesUploaded([...previewImages, ...newImageUrls]);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const removeImage = (index: number) => {
    setPreviewImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      onImagesUploaded(newImages);
      return newImages;
    });
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Service Images</label>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center ${
          isDragging ? 'border-[#5C6BC0] bg-[#5C6BC0]/5' : 'border-neutral-light'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <Upload className="h-10 w-10 mx-auto text-neutral-medium" />
          <p className="text-sm text-neutral-dark">
            Drag and drop image files here, or click to browse
          </p>
          <p className="text-xs text-neutral-medium">
            (Before/After photos, maximum {MAX_IMAGES} images)
          </p>
          <button 
            type="button" 
            className="mt-2 px-4 py-2 bg-white border border-neutral-light rounded-md text-sm font-medium text-neutral-darkest hover:bg-[#F5F7FA]"
            onClick={handleBrowseClick}
          >
            Browse Files
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>
      
      {previewImages.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Selected Images</p>
          <div className="flex flex-wrap gap-2">
            {previewImages.map((imageUrl, index) => (
              <div key={index} className="relative">
                <img 
                  src={imageUrl} 
                  alt={`Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <button 
                  type="button"
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-neutral-light"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3 text-neutral-dark" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
