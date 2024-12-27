'use client';
import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProgressBar } from './ProgressBar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DocumentUpload from './DocumentUpload'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const INITIAL_DATA = {
  companyName: "",
  employeeName: "",
  position: "",
  employmentType: "",
  workBook: "",
  workBookFile: null,
  passport: null,
  snils: null,
  inn: null,
  bankDetails: null
}

export default function MultiStepForm() {
  const [data, setData] = useState(INITIAL_DATA)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Get current user session
  const [user, setUser] = useState(null)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  function updateFields(fields) {
    setData(prev => ({ ...prev, ...fields }))
  }

  const steps = useMemo(() => [
    <CompanyStep key="company" {...data} updateFields={updateFields} />,
    <EmployeeNameStep key="employeeName" {...data} updateFields={updateFields} />,
    <PositionStep key="position" {...data} updateFields={updateFields} />,
    <EmploymentTypeStep key="employmentType" {...data} updateFields={updateFields} />,
    <WorkBookStep key="workBook" {...data} updateFields={updateFields} />,
    <DocumentUpload 
      key="documents"
      onUpload={(files) => {
        updateFields({
          passport: files.passport,
          snils: files.snils,
          inn: files.inn,
          bankDetails: files.bankDetails,
          ...(data.workBook !== 'none' ? { workBookFile: files.workBook } : {})
        })
      }}
      documents={[
        { type: 'passport', title: 'Паспорт', description: 'Загрузите скан или фото паспорта' },
        { type: 'snils', title: 'СНИЛС', description: 'Загрузите скан или фото СНИЛС' },
        { type: 'inn', title: 'ИНН', description: 'Загрузите скан или фото ИНН' },
        { type: 'bankDetails', title: 'Банковские реквизиты', description: 'Загрузите файл с банковскими реквизитами' },
        ...(data.workBook !== 'none' ? [{
          type: 'workBook',
          title: 'Трудовая книжка',
          description: `Загрузите скан ${data.workBook === 'paper' ? 'бумажной' : 'электронной'} трудовой книжки`
        }] : [])
      ]}
    />
  ], [data, updateFields])

  function next() {
    setCurrentStep(i => {
      if (i >= steps.length - 1) return i
      return i + 1
    })
  }

  function back() {
    setCurrentStep(i => {
      if (i <= 0) return i
      return i - 1
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (currentStep === steps.length - 1) {
      try {
        setLoading(true)
        const { error } = await supabase
          .from('hire')
          .insert({
            user_id: user?.id,
            company_name: data.companyName,
            employee_name: data.employeeName,
            position: data.position,
            employment_type: data.employmentType,
            work_book_type: data.workBook
          })

        if (error) throw error

        toast.success('Заявка успешно отправлена')
        router.push('/dashboard') // или куда вам нужно после успешной отправки
      } catch (error) {
        console.error('Error:', error)
        toast.error('Ошибка при отправке формы')
      } finally {
        setLoading(false)
      }
    } else {
      next()
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-platform-secondary">
        <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      </div>
      <div className="p-6">
        <form onSubmit={onSubmit}>
          {steps[currentStep]}
          <div className="mt-6 flex justify-between">
            {currentStep !== 0 && (
              <Button 
                type="button" 
                onClick={back} 
                variant="outline"
                className="border-platform-primary text-platform-primary hover:bg-platform-primary/10"
              >
                Назад
              </Button>
            )}
            <Button 
              type="submit" 
              className={`bg-platform-primary hover:bg-platform-primary/90 text-white ${currentStep === 0 ? "ml-auto" : ""}`}
              disabled={loading}
            >
              {currentStep === steps.length - 1 ? (loading ? "Отправка..." : "Отправить") : "Далее"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CompanyStep({
  companyName,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Наименование компании</h2>
      <Label htmlFor="companyName">Название компании</Label>
      <Input
        autoFocus
        required
        type="text"
        id="companyName"
        value={companyName}
        onChange={e => updateFields({ companyName: e.target.value })} />
    </div>)
  );
}

function EmployeeNameStep({
  employeeName,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Имя сотрудника</h2>
      <Label htmlFor="employeeName">Имя сотрудника</Label>
      <Input
        autoFocus
        required
        type="text"
        id="employeeName"
        value={employeeName}
        onChange={e => updateFields({ employeeName: e.target.value })} />
    </div>)
  );
}

function PositionStep({
  position,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Должность сотрудника</h2>
      <Label htmlFor="position">Должность</Label>
      <Input
        autoFocus
        required
        type="text"
        id="position"
        value={position}
        onChange={e => updateFields({ position: e.target.value })} />
    </div>)
  );
}

function EmploymentTypeStep({
  employmentType,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Тип трудоустройства</h2>
      <Label htmlFor="employmentType">Выберите тип трудоустройства</Label>
      <Select
        value={employmentType}
        onValueChange={(value) => updateFields({ employmentType: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Выберите тип трудоустройства" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="full-time">Полная занятость</SelectItem>
          <SelectItem value="part-time">Частичная занятость</SelectItem>
          <SelectItem value="contract">Контракт</SelectItem>
        </SelectContent>
      </Select>
    </div>)
  );
}

function WorkBookStep({
  workBook,
  updateFields
}) {
  return (
    (<div className="space-y-4">
      <h2 className="text-lg font-semibold">Наличие трудовой книжки</h2>
      <Label htmlFor="workBook">Выберите тип трудовой книжки</Label>
      <Select
        value={workBook}
        onValueChange={(value) => updateFields({ workBook: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Выберите тип трудовой книжки" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paper">Бумажная трудовая книжка</SelectItem>
          <SelectItem value="electronic">Электронная трудовая книжка</SelectItem>
          <SelectItem value="none">Отсутствует (Первое трудоустройство)</SelectItem>
        </SelectContent>
      </Select>
    </div>)
  );
}

