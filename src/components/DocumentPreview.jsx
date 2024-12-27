'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink, Eye, X } from 'lucide-react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

// Функция для транслитерации русского текста (копируем из DocumentUpload.jsx)
function transliterate(text) {
  if (!text) return '';
  
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '_', '-': '_', '.': '_'
  };

  return text.toLowerCase()
    .split('')
    .map(char => ru[char] || char)
    .join('');
}

// Функция для очистки строки (копируем из DocumentUpload.jsx)
function sanitizePath(str) {
  if (!str) return '';
  
  const transliterated = transliterate(str);
  return transliterated
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    || 'file';
}

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
    // Определяем тип документа из имени файла
    let docType = 'unknown';
    if (file.name.includes('passport')) docType = 'passport';
    if (file.name.includes('snils')) docType = 'snils';
    if (file.name.includes('inn')) docType = 'inn';
    if (file.name.includes('bankDetails')) docType = 'bankDetails';
    if (file.name.includes('workBook')) docType = 'workBookFile';

    const pathParts = [
      request.user_id,
      request.id,
      sanitizePath(request.company_name || 'company'),
      sanitizePath(request.employee_name || 'employee'),
      docType,
      file.name
    ];

    const path = pathParts.join('/');
    console.log('Getting file URL for path:', path);

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

  const handleClose = () => {
    setIsPreviewOpen(false);
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

      <Dialog open={isPreviewOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle>{file.name}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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