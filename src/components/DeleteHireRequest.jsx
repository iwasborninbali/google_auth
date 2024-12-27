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
    try {
      setIsDeleting(true);
      console.log('Deleting request:', request.id);
      
      const { error } = await supabase
        .from('hire')
        .update({ status: 'deleted' })
        .eq('id', request.id);

      if (error) throw error;
      
      toast.success('Заявка успешно удалена');
      setShowDeleteDialog(false);
      if (onRequestDeleted) {
        onRequestDeleted();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Ошибка при удалении заявки');
    } finally {
      setIsDeleting(false);
    }
  };

  if (request.status === 'draft') return null;

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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление заявки</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить заявку для компании "{request.company_name}"?
              Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 