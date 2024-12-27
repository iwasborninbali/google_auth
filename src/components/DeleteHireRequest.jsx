'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteHireRequest({ request, onRequestDeleted }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleDelete = async () => {
    if (!request?.id) {
      console.error('No request ID provided');
      toast.error('Ошибка при удалении заявки: отсутствует ID');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Starting deletion for request:', request.id);
      
      const { data, error } = await supabase
        .from('hire')
        .update({ status: 'deleted' })
        .eq('id', request.id)
        .select()
        .single();

      console.log('Update result:', { data, error });

      if (error) {
        throw error;
      }
      
      toast.success('Заявка успешно удалена');
      setShowDeleteDialog(false);
      
      // Добавляем небольшую задержку перед редиректом
      setTimeout(() => {
        if (onRequestDeleted) {
          onRequestDeleted();
        }
      }, 500);
      
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Ошибка при удалении заявки');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!request || request.status === 'draft') return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-red-500 hover:text-red-700 hover:bg-red-100"
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[500px] p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Удаление заявки</AlertDialogTitle>
            <AlertDialogDescription className="text-base mt-2">
              Вы уверены, что хотите удалить заявку для компании "{request.company_name}"?
              Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel 
              disabled={isDeleting}
              className="mt-0"
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white mt-0"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 