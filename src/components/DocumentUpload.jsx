'use client';

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'sonner'
import { Check, Upload, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

// Функция для транслитерации русского текста
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

  // Приводим текст к нижнему регистру перед обработкой
  return text.toLowerCase()
    .split('')
    .map(char => ru[char] || char)
    .join('');
}

// Функция для очистки строки (убирает пробелы и спецсимволы)
function sanitizePath(str) {
  if (!str) return '';
  
  const transliterated = transliterate(str);
  return transliterated
    .replace(/[^a-z0-9_]/g, '_') // оставляем только латинские буквы, цифры и _
    .replace(/_+/g, '_') // убираем множественные _
    .replace(/^_|_$/g, '') // убираем _ в начале и конце
    || 'file'; // если строка пустая, используем 'file'
}

export default function DocumentUpload({ documents, onUpload, formData, hireId, existingFiles = {} }) {
  const [uploading, setUploading] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState(existingFiles)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Инициализируем состояние uploadedFiles с existingFiles при монтировании
  useEffect(() => {
    setUploadedFiles(existingFiles);
  }, [existingFiles]);

  const uploadFile = async (file, docType) => {
    try {
      setUploading(prev => ({ ...prev, [docType]: true }))

      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Пользователь не авторизован')

      // Формируем путь для файла
      const timestamp = new Date().getTime()
      const fileExtension = file.name.split('.').pop().toLowerCase()
      const docTitle = sanitizePath(documents.find(d => d.type === docType).title)
      const fileName = `${docTitle}_${timestamp}.${fileExtension}`
      
      // Очищаем и проверяем все части пути
      const pathParts = [
        user.id,
        hireId,
        sanitizePath(formData.companyName || 'company'),
        sanitizePath(formData.employeeName || 'employee'),
        docTitle,
        fileName
      ];

      // Проверяем, что все части пути валидны
      if (pathParts.some(part => !part)) {
        throw new Error('Некорректный путь файла')
      }

      const filePath = pathParts.join('/')
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

      // Сохраняем информацию о загруженном файле
      setUploadedFiles(prev => ({
        ...prev,
        [docType]: {
          name: file.name,
          url: publicUrl,
          timestamp: new Date().toLocaleString()
        }
      }))

      onUpload(docType, publicUrl)
      toast.success(`${documents.find(d => d.type === docType).title} успешно загружен`)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(`Ошибка при загрузке ${documents.find(d => d.type === docType).title}`)
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }))
    }
  }

  const removeFile = (docType) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[docType]
      return newFiles
    })
    onUpload(docType, null)
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

        const uploadedFile = uploadedFiles[type]

        return (
          <div key={type} className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">
              {title}
              {uploadedFile && (
                <span className="ml-2 text-sm text-green-600">✓ Загружено</span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            
            {uploadedFile ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      {uploadedFile.timestamp && (
                        <p className="text-xs text-gray-500">Загружено: {uploadedFile.timestamp}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(type)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                `}
              >
                <input {...getInputProps()} />
                {uploading[type] ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="w-5 h-5 animate-bounce" />
                    <p className="text-gray-500">Загрузка...</p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-blue-500">Перетащите файл сюда</p>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="text-gray-500">
                      Перетащите файл сюда или кликните для выбора
                    </p>
                    <p className="text-xs text-gray-400">
                      Поддерживаемые форматы: PDF, PNG, JPG, JPEG
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

