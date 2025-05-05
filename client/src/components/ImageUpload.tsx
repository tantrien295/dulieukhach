import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Hàm nén hình ảnh trước khi chuyển sang base64
const resizeImage = (file: File, maxWidth = 600, maxHeight = 450): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with quality 60% to reduce size further
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
  });
};

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
}

export default function ImageUpload({ onImagesUploaded }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    let newImages: string[] = [];
    let errors = 0;
    
    // Hiển thị toast loading
    toast({
      title: "Đang xử lý hình ảnh",
      description: "Vui lòng đợi trong khi hình ảnh được xử lý...",
    });
    
    for (const file of fileArray) {
      try {
        // Nén hình ảnh trước khi chuyển thành base64
        const resizedImage = await resizeImage(file, 600, 450);
        newImages.push(resizedImage);
      } catch (error) {
        console.error("Error processing image:", error);
        errors++;
      }
    }
    
    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesUploaded(updatedImages);
      
      toast({
        title: "Đã thêm hình ảnh",
        description: `Đã thêm ${newImages.length} hình ảnh${errors > 0 ? `, ${errors} lỗi` : ''}.`,
      });
    } else if (errors > 0) {
      toast({
        title: "Lỗi",
        description: "Không thể xử lý hình ảnh.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset the input so the same file can be selected again
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <div 
        className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
        onClick={handleButtonClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Bấm để tải lên hoặc kéo thả hình ảnh</p>
        <p className="text-xs text-gray-400 mt-1">File định dạng JPG, PNG hoặc GIF</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="h-24 w-full rounded-md overflow-hidden relative">
                <img
                  src={image}
                  alt={`Uploaded ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-70 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}