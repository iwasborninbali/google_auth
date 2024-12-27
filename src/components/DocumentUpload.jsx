'use client';

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

export default function DocumentUpload({ documents, onUpload, formData, hireId }) {
  const [uploading, setUploading] = useState({})
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const uploadFile = async (file, docType) => {
    try {
      setUploading(prev => ({ ...prev, [docType]: true }))

      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Пользователь не авторизован')

      // Формируем путь для файла
      const timestamp = new Date().getTime()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${documents.find(d => d.type === docType).title}_${timestamp}.${fileExtension}`
      
      const filePath = `${user.id}/${hireId}/${formData.companyName}/${formData.employeeName}/${documents.find(d => d.type === docType).title}/${fileName}`

      // Загружаем файл
      const { error: uploadError, data } = await supabase.storage
        .from('hire')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Получаем публичную ссылку на файл
      const { data: { publicUrl } } = supabase.storage
        .from('hire')
        .getPublicUrl(filePath)

      onUpload(docType, publicUrl)
      toast.success(`${documents.find(d => d.type === docType).title} успешно загружен`)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(`Ошибка при загрузке ${documents.find(d => d.type === docType).title}`)
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }))
    }
  }

  const onDrop = useCallback((acceptedFiles, docType) => {
    if (acceptedFiles?.[0]) {
      uploadFile(acceptedFiles[0], docType)
    }
  }, [])

  if (!hireId) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ошибка: ID заявки не найден</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {documents.map(({ type, title, description }) => {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop: (files) => onDrop(files, type),
          maxFiles: 1,
          multiple: false,
          accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
          }
        })

        return (
          <div key={type} className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              <input {...getInputProps()} />
              {uploading[type] ? (
                <p className="text-gray-500">Загрузка...</p>
              ) : isDragActive ? (
                <p className="text-blue-500">Перетащите файл сюда</p>
              ) : (
                <p className="text-gray-500">
                  Перетащите файл сюда или кликните для выбора
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

