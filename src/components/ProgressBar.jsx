import { Progress } from "@/components/ui/progress"

export function ProgressBar({
  currentStep,
  totalSteps
}) {
  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-white text-sm">
        <span>Шаг {currentStep + 1} из {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-white/20" 
        indicatorClassName="bg-platform-primary" 
      />
    </div>
  );
}

