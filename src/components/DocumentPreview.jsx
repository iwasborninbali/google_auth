'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink, Eye } from 'lucide-react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

export default function DocumentPreview({ file, request }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const isImage = file.name.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = file.name.toLowerCase().endsWith('.pdf');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const getFileUrl = async () => {
    const path = `${request.user_id}/${request.id}/${request.company_name}/${request.employee_name}/${file.metadata?.documentType || 'unknown'}/${file.name}`;
    const { data } = supabase.storage
      .from('hire')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  const handlePreviewClick = async () => {
    if (!fileUrl) {
      const url = await getFileUrl();
      setFileUrl(url);
    }
    setIsPreviewOpen(true);
  };

  const handleOpenClick = async () => {
    if (!fileUrl) {
      const url = await getFileUrl();
      setFileUrl(url);
    }
    window.open(fileUrl, '_blank');
  };

  return (
    <>
      <div className="flex items-center p-3 border rounded-lg">
        <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
        <span className="flex-1 truncate">{file.name}</span>
        <div className="flex gap-2">
          {(isImage || isPDF) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviewClick}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenClick}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          {fileUrl && (
            isImage ? (
              <div className="relative w-full h-[600px]">
                <Image
                  src={fileUrl}
                  alt={file.name}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : isPDF && (
              <div className="w-full h-[600px]">
                <iframe
                  src={fileUrl}
                  title={file.name}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 