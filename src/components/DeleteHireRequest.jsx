'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';

export default function DeleteHireRequest({ request, onRequestDeleted }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('[DeleteHireRequest] Rendered with request:', request);

  if (!request || request.status === 'draft') {
    console.log('[DeleteHireRequest] No request or status is draft. Returning null.');
    return null;
  }

  const handleDelete = async () => {
    console.log('[DeleteHireRequest] handleDelete called');
    console.log('[DeleteHireRequest] Deleting request with id:', request.id);

    try {
      setIsDeleting(true);
      console.log('[DeleteHireRequest] Starting delete operation...');

      const { data, error } = await supabase
        .from('hire')
        .update({
          status: 'deleted'
        })
        .eq('id', request.id)
        .select()
        .single();

      if (error) {
        console.error('[DeleteHireRequest] Error updating request:', error);
        toast.error('Ошибка при архивации заявки');
        return;
      }

      console.log('[DeleteHireRequest] Update result:', data);
      toast.success('Заявка перемещена в архив');
      setConfirmDelete(false);

      if (onRequestDeleted) {
        console.log('[DeleteHireRequest] Calling onRequestDeleted callback...');
        onRequestDeleted();
      }
    } catch (e) {
      console.error('[DeleteHireRequest] Exception during delete:', e);
      toast.error('Ошибка при архивации заявки');
    } finally {
      setIsDeleting(false);
      console.log('[DeleteHireRequest] Delete operation completed');
    }
  };

  return (
    <div className="relative inline-block">
      {!confirmDelete && !isDeleting && (
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
          onClick={() => {
            console.log('[DeleteHireRequest] Confirm delete toggled ON');
            setConfirmDelete(true);
          }}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      )}

      {confirmDelete && !isDeleting && (
        <div className="absolute right-0 top-full mt-2 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2 z-50">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Удалить?
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('[DeleteHireRequest] Confirm delete toggled OFF');
              setConfirmDelete(false);
            }}
          >
            Отмена
          </Button>
        </div>
      )}

      {isDeleting && (
        <span className="ml-2 text-sm text-gray-500">Удаляем...</span>
      )}
    </div>
  );
} 