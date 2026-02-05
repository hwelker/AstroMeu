import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, ChevronRight, ChevronLeft, Stars, Moon, Sun, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ZodiacIcon } from "@/components/ZodiacIcon";
import { getZodiacSign, zodiacDescriptions, type ZodiacSign } from "@/lib/zodiac";
import { insertUserSchema } from "@shared/schema";
import { BrazilStateCitySelector } from "@/components/BrazilStateCitySelector";

const formSchema = insertUserSchema.extend({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().min(10, "WhatsApp inválido").max(15),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  birthCity: z.string().min(2, "Cidade de nascimento é obrigatória"),
  birthState: z.string().optional(),
  profilePhotoBase64: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, "Você deve aceitar os termos"),
});

type FormData = z.infer<typeof formSchema>;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [previewSign, setPreviewSign] = useState<ZodiacSign | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
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
      birthState: "",
      profilePhotoBase64: "",
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Foto muito grande",
          description: "A foto deve ter no máximo 2MB",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePhoto(base64);
        form.setValue("profilePhotoBase64", base64);
      };
      reader.readAsDataURL(file);
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
    <div className="min-h-screen bg-white dark:bg-background flex flex-col relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          onClick={() => setLocation("/login")}
          data-testid="button-go-to-login"
        >
          Já tem conta? Entrar
        </Button>
      </div>

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

                    <div className="flex flex-col items-center mb-2">
                      <div className="relative group">
                        <Avatar className="w-24 h-24 border-2 border-indigo-100">
                          {profilePhoto ? (
                            <AvatarImage src={profilePhoto} alt="Foto de perfil" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100">
                              <Camera className="h-8 w-8 text-indigo-400" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" data-testid="label-photo-upload">
                          <Upload className="h-6 w-6 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            data-testid="input-photo-upload"
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {profilePhoto ? "Clique para trocar" : "Adicionar foto de perfil"}
                      </p>
                      <p className="text-xs text-muted-foreground">(Opcional)</p>
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
                              value={field.value || ""}
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
                              value={field.value || ""}
                              data-testid="input-birth-time"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Melhora a precisão do mapa astral
                          </p>
                        </FormItem>
                      )}
                    />

                    <BrazilStateCitySelector
                      onStateChange={(state) => form.setValue("birthState", state)}
                      onCityChange={(city) => form.setValue("birthCity", city)}
                      selectedState={form.watch("birthState") || ""}
                      selectedCity={form.watch("birthCity") || ""}
                      label="Local de nascimento"
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
                          <FormLabel className="text-base">Gênero da voz do seu Recado Diário</FormLabel>
                          <p className="text-sm text-muted-foreground mb-3">
                            Escolha a voz que mais combina com você
                          </p>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value || "feminine"}
                              className="grid grid-cols-2 gap-4"
                              data-testid="radio-group-voice"
                            >
                              <Label
                                htmlFor="voice-feminine"
                                className="cursor-pointer"
                                data-testid="label-voice-feminine"
                              >
                                <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                                  field.value === "feminine"
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                                    : "border-border"
                                }`}>
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                                    <Sparkles className="h-7 w-7 text-white" />
                                  </div>
                                  <RadioGroupItem value="feminine" id="voice-feminine" className="sr-only" data-testid="radio-voice-feminine" />
                                  <div className="text-center">
                                    <p className="font-medium">Voz Feminina</p>
                                    <p className="text-xs text-muted-foreground mt-1">Suave e acolhedora</p>
                                  </div>
                                </div>
                              </Label>

                              <Label
                                htmlFor="voice-masculine"
                                className="cursor-pointer"
                                data-testid="label-voice-masculine"
                              >
                                <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                                  field.value === "masculine"
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                                    : "border-border"
                                }`}>
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                                    <Stars className="h-7 w-7 text-white" />
                                  </div>
                                  <RadioGroupItem value="masculine" id="voice-masculine" className="sr-only" data-testid="radio-voice-masculine" />
                                  <div className="text-center">
                                    <p className="font-medium">Voz Masculina</p>
                                    <p className="text-xs text-muted-foreground mt-1">Firme e tranquila</p>
                                  </div>
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
                              <a href="/terms" target="_blank" className="text-indigo-500 underline" data-testid="link-terms">
                                termos de uso
                              </a>{" "}
                              e a{" "}
                              <a href="/privacy" target="_blank" className="text-indigo-500 underline" data-testid="link-privacy">
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
        <a href="/terms" className="hover:text-indigo-500" data-testid="link-footer-terms">Termos de Uso</a>
        {" · "}
        <a href="/privacy" className="hover:text-indigo-500" data-testid="link-footer-privacy">Privacidade</a>
      </footer>
    </div>
  );
}
