import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/")}
          data-testid="button-terms-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-terms-title">Termos de Uso - AstroMeu</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

            <h3 className="text-lg font-medium mt-6">1. Aceitação dos Termos</h3>
            <p>
              Ao acessar e usar o AstroMeu, você concorda em estar vinculado a estes Termos de Uso.
              Se você não concordar com alguma parte destes termos, não deve usar nosso serviço.
            </p>

            <h3 className="text-lg font-medium mt-6">2. Descrição do Serviço</h3>
            <p>
              O AstroMeu é uma plataforma de orientação astrológica que oferece:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Áudios diários personalizados baseados em seu mapa astral</li>
              <li>Chat com IA especializada em astrologia</li>
              <li>Análise de compatibilidade (planos premium)</li>
              <li>Diário astrológico com feedback personalizado (plano superior)</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">3. Cadastro e Conta</h3>
            <p>
              Para usar o AstroMeu, você precisa:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Ter pelo menos 18 anos de idade</li>
              <li>Fornecer informações verdadeiras e precisas</li>
              <li>Manter a confidencialidade da sua conta</li>
              <li>Notificar imediatamente sobre uso não autorizado</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">4. Planos e Pagamentos</h3>
            <p>
              Oferecemos três planos de assinatura:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Essência (R$ 29,90/mês):</strong> Funcionalidades básicas</li>
              <li><strong>Conexão (R$ 39,90/mês):</strong> Inclui Radar do Coração</li>
              <li><strong>Plenitude (R$ 59,90/mês):</strong> Acesso completo</li>
            </ul>
            <p className="mt-2">
              Pagamentos são processados mensalmente. Você pode cancelar a qualquer momento,
              mas não há reembolso proporcional do período atual.
            </p>

            <h3 className="text-lg font-medium mt-6">5. Uso Aceitável</h3>
            <p>Você concorda em NÃO:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usar o serviço para fins ilegais</li>
              <li>Compartilhar sua conta com terceiros</li>
              <li>Fazer engenharia reversa da plataforma</li>
              <li>Usar bots ou scripts automatizados</li>
              <li>Abusar do suporte ou chat</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">6. Natureza do Conteúdo</h3>
            <p>
              <strong>IMPORTANTE:</strong> O AstroMeu oferece orientação astrológica para fins de
              entretenimento e autoconhecimento. Nossas orientações NÃO substituem:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Aconselhamento médico ou psicológico profissional</li>
              <li>Aconselhamento jurídico</li>
              <li>Aconselhamento financeiro</li>
              <li>Tratamento de saúde mental</li>
            </ul>
            <p className="mt-2">
              Se você está enfrentando problemas sérios de saúde mental, relacionamento violento,
              ou situações de emergência, procure ajuda profissional imediatamente.
            </p>

            <h3 className="text-lg font-medium mt-6">7. Propriedade Intelectual</h3>
            <p>
              Todo conteúdo do AstroMeu (textos, áudios, designs, código) é propriedade da
              plataforma e protegido por leis de direitos autorais.
            </p>

            <h3 className="text-lg font-medium mt-6">8. Limitação de Responsabilidade</h3>
            <p>
              O AstroMeu não se responsabiliza por:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Decisões tomadas com base nas orientações astrológicas</li>
              <li>Problemas técnicos ou indisponibilidade temporária</li>
              <li>Perda de dados ou conteúdo</li>
              <li>Danos indiretos ou consequenciais</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">9. Cancelamento</h3>
            <p>
              Você pode cancelar sua assinatura a qualquer momento através do seu perfil.
              O cancelamento terá efeito ao final do período de cobrança atual.
            </p>
            <p className="mt-2">
              Nós podemos suspender ou encerrar sua conta se você violar estes termos.
            </p>

            <h3 className="text-lg font-medium mt-6">10. Alterações nos Termos</h3>
            <p>
              Podemos modificar estes termos a qualquer momento. Notificaremos você sobre
              mudanças significativas por email. O uso continuado após as mudanças constitui
              aceitação dos novos termos.
            </p>

            <h3 className="text-lg font-medium mt-6">11. Lei Aplicável</h3>
            <p>
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida
              nos tribunais do Brasil.
            </p>

            <h3 className="text-lg font-medium mt-6">12. Contato</h3>
            <p>
              Para questões sobre estes termos, entre em contato:<br />
              Email: contato@astromeu.com.br
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
