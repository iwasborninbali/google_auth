import MultiStepForm from '@/components/MultiStepForm'

export default function Home() {
  return (
    (<main className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Форма регистрации сотрудника</h1>
      <MultiStepForm />
    </main>)
  );
}

