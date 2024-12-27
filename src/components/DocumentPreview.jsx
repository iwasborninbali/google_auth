'use client';

import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function DocumentPreview({ file, request }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.group(`DocumentPreview: file "${file?.name}"`);
  console.log('file object:', file);
  console.log('request:', request);
  console.groupEnd();

  const getFileUrl = async () => {
    const pathParts = [
      request.user_id,
      request.id,
      file.name
    ];

    const path = pathParts.join('/');
    console.log('[DocumentPreview] Getting public URL for path:', path);
    console.log('[DocumentPreview] Path parts:', pathParts);

    const { data, error } = supabase.storage
      .from('hire')
      .getPublicUrl(path);

    if (error) {
      console.error('[DocumentPreview] Error getting public URL:', error);
      return null;
    }

    console.log('[DocumentPreview] Public URL data:', data);
    return data.publicUrl;
  };

  const handleOpenClick = async () => {
    console.log('[DocumentPreview] handleOpenClick triggered');
    const url = await getFileUrl();
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('[DocumentPreview] Failed to get file URL');
    }
  };

  return (
    <div className="flex items-center p-3 border rounded-lg">
      <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
      <span className="flex-1 truncate">{file.name}</span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenClick}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 