import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  onSelect?: () => void;
}

export function PlanCard({
  name,
  price,
  description,
  features,
  isPopular,
  isCurrent,
  onSelect,
}: PlanCardProps) {
  const planId = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        isPopular && "border-indigo-500 border-2 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20"
      )}
      data-testid={`card-plan-${planId}`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-bl-lg rounded-tr-none rounded-br-none rounded-tl-none">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="space-y-1">
          <h3 className="font-medium text-lg" data-testid={`text-plan-name-${planId}`}>{name}</h3>
          <p className="text-sm text-muted-foreground" data-testid={`text-plan-description-${planId}`}>{description}</p>
        </div>
        <div className="pt-4">
          <span className="text-3xl font-semibold" data-testid={`text-plan-price-${planId}`}>{price}</span>
          <span className="text-muted-foreground">/mês</span>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3" data-testid={`text-plan-feature-${planId}-${index}`}>
              <div className="shrink-0 mt-0.5">
                <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Check className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isPopular ? "default" : isCurrent ? "secondary" : "outline"}
          onClick={onSelect}
          disabled={isCurrent}
          data-testid={`button-select-plan-${planId}`}
        >
          {isCurrent ? "Plano Atual" : "Escolher Plano"}
        </Button>
      </CardFooter>
    </Card>
  );
}
