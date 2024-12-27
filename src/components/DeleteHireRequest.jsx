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

  if (!request || request.status === 'draft') return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from('hire')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Заявка перемещена в архив');
      setConfirmDelete(false);
      if (onRequestDeleted) {
        onRequestDeleted();
      }
    } catch (error) {
      console.error('Error archiving request:', error);
      toast.error('Ошибка при архивации заявки');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative inline-block">
      {!confirmDelete && !isDeleting && (
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      )}

      {confirmDelete && (
        <div className="absolute right-0 top-full mt-2 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2 z-50">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm"
          >
            {isDeleting ? 'Удаление...' : 'Удалить?'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDelete(false)}
            className="text-sm"
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