'use client';
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DocumentUpload({ documents = [], onUpload }) {
  const [uploadedDocs, setUploadedDocs] = useState({})

  const handleFileUpload = (docType) => (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const newDocs = { ...uploadedDocs, [docType]: file }
      setUploadedDocs(newDocs)
      onUpload?.(newDocs)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-platform-secondary">
        Загрузка документов
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {documents.map(({ type, title, description }) => (
          <Card key={type} className="border-platform-primary/20">
            <CardHeader className="bg-platform-bg-light">
              <CardTitle className="text-platform-secondary">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor={type}>
                  {uploadedDocs[type] ? 'Файл загружен' : 'Выберите файл'}
                </Label>
                <Input
                  id={type}
                  type="file"
                  onChange={handleFileUpload(type)}
                  className="cursor-pointer"
                  required={type !== 'workBook'} />
                {uploadedDocs[type] && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Загружен файл: {uploadedDocs[type]?.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

