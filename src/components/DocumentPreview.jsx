'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink, Eye } from 'lucide-react';
import Image from 'next/image';

export default function DocumentPreview({ file, fileUrl }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isImage = file.name.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = file.name.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div className="flex items-center p-3 border rounded-lg">
        <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
        <span className="flex-1 truncate">{file.name}</span>
        <div className="flex gap-2">
          {isImage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isImage && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <div className="relative w-full h-[600px]">
              <Image
                src={fileUrl}
                alt={file.name}
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 