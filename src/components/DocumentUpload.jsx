'use client';

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'

// Функция для транслитерации русского текста
function transliterate(text) {
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
    'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };
  return text.split('').map(char => ru[char] || char).join('');
}

// Функция для очистки строки (убирает пробелы и спецсимволы)
function sanitizePath(str) {
  return transliterate(str)
    .replace(/[^a-zA-Z0-9]/g, '_') // Заменяем все кроме букв и цифр на _
    .replace(/_+/g, '_')           // Убираем множественные _
    .replace(/^_|_$/g, '');        // Убираем _ в начале и конце
}

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
      const docTitle = sanitizePath(documents.find(d => d.type === docType).title)
      const fileName = `${docTitle}_${timestamp}.${fileExtension}`
      
      // Очищаем все части пути
      const filePath = [
        user.id,
        hireId,
        sanitizePath(formData.companyName),
        sanitizePath(formData.employeeName),
        docTitle,
        fileName
      ].join('/')

      console.log('Uploading file to path:', filePath)

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

