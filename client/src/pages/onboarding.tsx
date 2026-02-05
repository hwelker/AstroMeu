import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, ChevronRight, ChevronLeft, Stars, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ZodiacIcon } from "@/components/ZodiacIcon";
import { getZodiacSign, zodiacDescriptions, type ZodiacSign } from "@/lib/zodiac";
import { insertUserSchema } from "@shared/schema";

const formSchema = insertUserSchema.extend({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().min(10, "WhatsApp inválido").max(15),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  birthCity: z.string().min(2, "Cidade de nascimento é obrigatória"),
  termsAccepted: z.boolean().refine((val) => val === true, "Você deve aceitar os termos"),
});

type FormData = z.infer<typeof formSchema>;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [previewSign, setPreviewSign] = useState<ZodiacSign | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      birthDate: "",
      birthTime: "",
      birthCity: "",
      voicePreference: "feminine",
      termsAccepted: false,
    },
  });

  const createUser = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("userId", data.id);
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleBirthDateChange = (date: string) => {
    form.setValue("birthDate", date);
    if (date) {
      const sign = getZodiacSign(date);
      setPreviewSign(sign);
    } else {
      setPreviewSign(null);
    }
  };

  const onSubmit = (data: FormData) => {
    createUser.mutate(data);
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await form.trigger(["fullName", "email", "whatsapp"]);
    } else if (step === 2) {
      isValid = await form.trigger(["birthDate", "birthCity"]);
    }
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-medium text-foreground">AstroMeu</h1>
            <p className="text-muted-foreground mt-1">
              Sua orientação astrológica personalizada
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-colors ${
                  s === step
                    ? "bg-indigo-500"
                    : s < step
                    ? "bg-indigo-200 dark:bg-indigo-800"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {step === 1 && (
                <Card className="border-0 shadow-lg shadow-indigo-100/50 dark:shadow-none">
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center mb-4">
                      <Stars className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                      <h2 className="text-lg font-medium">Vamos nos conhecer</h2>
                      <p className="text-sm text-muted-foreground">
                        Conte um pouco sobre você
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Seu nome"
                              {...field}
                              data-testid="input-full-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="(11) 99999-9999"
                              {...field}
                              data-testid="input-whatsapp"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      className="w-full"
                      onClick={nextStep}
                      data-testid="button-next-step-1"
                    >
                      Continuar
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card className="border-0 shadow-lg shadow-indigo-100/50 dark:shadow-none">
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center mb-4">
                      <Moon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                      <h2 className="text-lg font-medium">Seus dados astrológicos</h2>
                      <p className="text-sm text-muted-foreground">
                        Para criar seu mapa astral
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de nascimento</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={(e) => handleBirthDateChange(e.target.value)}
                              data-testid="input-birth-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {previewSign && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                        <ZodiacIcon sign={previewSign} size="md" />
                        <div>
                          <p className="font-medium text-indigo-700 dark:text-indigo-300">{previewSign}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {zodiacDescriptions[previewSign]}
                          </p>
                        </div>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="birthTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Hora de nascimento{" "}
                            <span className="text-muted-foreground font-normal">(opcional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              data-testid="input-birth-time"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Melhora a precisão do mapa astral
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade de nascimento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="São Paulo, SP"
                              {...field}
                              data-testid="input-birth-city"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={prevStep}
                        data-testid="button-prev-step-2"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={nextStep}
                        data-testid="button-next-step-2"
                      >
                        Continuar
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="border-0 shadow-lg shadow-indigo-100/50 dark:shadow-none">
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center mb-4">
                      <Sun className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                      <h2 className="text-lg font-medium">Preferências finais</h2>
                      <p className="text-sm text-muted-foreground">
                        Personalize sua experiência
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="voicePreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferência de voz para os áudios</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-4"
                              data-testid="radio-group-voice"
                            >
                              <Label
                                htmlFor="voice-feminine"
                                className="flex-1 cursor-pointer"
                                data-testid="label-voice-feminine"
                              >
                                <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                                  field.value === "feminine"
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                                    : "border-border"
                                }`}>
                                  <RadioGroupItem value="feminine" id="voice-feminine" data-testid="radio-voice-feminine" />
                                  <span>Feminina</span>
                                </div>
                              </Label>
                              <Label
                                htmlFor="voice-masculine"
                                className="flex-1 cursor-pointer"
                                data-testid="label-voice-masculine"
                              >
                                <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                                  field.value === "masculine"
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                                    : "border-border"
                                }`}>
                                  <RadioGroupItem value="masculine" id="voice-masculine" data-testid="radio-voice-masculine" />
                                  <span>Masculina</span>
                                </div>
                              </Label>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              Li e aceito os{" "}
                              <a href="#" className="text-indigo-500 underline">
                                termos de uso
                              </a>{" "}
                              e a{" "}
                              <a href="#" className="text-indigo-500 underline">
                                política de privacidade
                              </a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={prevStep}
                        data-testid="button-prev-step-3"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createUser.isPending}
                        data-testid="button-submit-onboarding"
                      >
                        {createUser.isPending ? "Criando..." : "Começar Jornada"}
                        <Sparkles className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-muted-foreground">
        AstroMeu - Orientação astrológica personalizada
      </footer>
    </div>
  );
}
