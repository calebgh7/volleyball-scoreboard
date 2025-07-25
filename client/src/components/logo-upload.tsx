import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Upload, X } from "lucide-react";

interface LogoUploadProps {
  teamId: number;
  currentLogo?: string | null;
  label: string;
  onLogoUpdate?: (teamId: number, logoUrl: string) => void;
}

export default function LogoUpload({ teamId, currentLogo, label, onLogoUpdate }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "File size must be less than 2MB",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a local URL for the uploaded file
      const logoUrl = URL.createObjectURL(file);
      
      if (onLogoUpdate) {
        onLogoUpdate(teamId, logoUrl);
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
          duration: 2000
        });
      } else {
        toast({
          title: "Note",
          description: "Logo update function not available",
          variant: "default",
          duration: 2000
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="text-center">
      <Card 
        className={`w-full h-24 border-2 border-dashed transition-colors cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : currentLogo 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-primary'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <div className="h-full flex items-center justify-center p-2">
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-1"></div>
              <p className="text-xs text-gray-500">Uploading...</p>
            </div>
          ) : currentLogo ? (
            <div className="text-center relative">
              <img 
                src={currentLogo} 
                alt={label}
                className="h-16 w-16 object-cover rounded mx-auto mb-1"
              />
              <p className="text-xs text-green-600">Uploaded</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          )}
        </div>
      </Card>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
