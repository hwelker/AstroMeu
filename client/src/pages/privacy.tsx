import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/")}
          data-testid="button-privacy-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-2xl" data-testid="text-privacy-title">Política de Privacidade</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Última atualização: {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <h3 className="text-lg font-medium mt-6">1. Informações que Coletamos</h3>

            <h4 className="text-base font-medium mt-4">1.1 Informações Fornecidas por Você</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dados de cadastro:</strong> nome, email, WhatsApp</li>
              <li><strong>Dados astrológicos:</strong> data, hora e local de nascimento</li>
              <li><strong>Fotos:</strong> foto de perfil e foto do parceiro (opcional)</li>
              <li><strong>Preferências:</strong> voz preferida para áudios, horário de notificação</li>
              <li><strong>Conteúdo:</strong> mensagens no chat, entradas do diário</li>
            </ul>

            <h4 className="text-base font-medium mt-4">1.2 Informações Coletadas Automaticamente</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Endereço IP e localização aproximada</li>
              <li>Tipo de dispositivo e navegador</li>
              <li>Horários de acesso e uso</li>
              <li>Páginas visualizadas e ações realizadas</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">2. Como Usamos Suas Informações</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Serviço principal:</strong> Gerar mapas astrais, áudios personalizados, análises de compatibilidade</li>
              <li><strong>IA e personalização:</strong> Treinar e melhorar respostas do chat astrológico</li>
              <li><strong>Comunicação:</strong> Enviar áudios diários via WhatsApp, notificações importantes</li>
              <li><strong>Pagamentos:</strong> Processar assinaturas e cobranças</li>
              <li><strong>Melhorias:</strong> Analisar uso para melhorar a plataforma</li>
              <li><strong>Suporte:</strong> Responder dúvidas e resolver problemas</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">3. Compartilhamento de Dados</h3>
            <p>
              Nós NÃO vendemos seus dados pessoais. Compartilhamos informações apenas com:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Processadores de pagamento:</strong> Para cobranças (Stripe/Cakto)</li>
              <li><strong>WhatsApp API:</strong> Para envio de áudios diários</li>
              <li><strong>OpenAI/Anthropic:</strong> Para processamento de chat (dados anonimizados quando possível)</li>
              <li><strong>Serviços de infraestrutura:</strong> Hospedagem e banco de dados</li>
              <li><strong>Autoridades:</strong> Quando exigido por lei</li>
            </ul>

            <h3 className="text-lg font-medium mt-6">4. Uso de IA (Inteligência Artificial)</h3>
            <p>
              <strong>Importante:</strong> Utilizamos modelos de IA para:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gerar respostas no chat astrológico</li>
              <li>Criar scripts dos áudios diários</li>
              <li>Analisar entradas do diário e detectar padrões</li>
            </ul>
            <p className="mt-2">
              Suas conversas podem ser processadas por estes serviços. Não compartilhe informações
              extremamente sensíveis ou confidenciais no chat.
            </p>

            <h3 className="text-lg font-medium mt-6">5. Armazenamento e Segurança</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados armazenados em servidores seguros</li>
              <li>Conexões criptografadas (HTTPS/TLS)</li>
              <li>Senhas com hash seguro (se implementarmos login tradicional)</li>
              <li>Backups regulares</li>
              <li>Acesso restrito apenas para equipe autorizada</li>
            </ul>
            <p className="mt-2">
              <strong>Importante:</strong> Nenhum sistema é 100% seguro. Mantenha sua senha privada.
            </p>

            <h3 className="text-lg font-medium mt-6">6. Seus Direitos (LGPD)</h3>
            <p>Você tem direito de:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acessar:</strong> Ver quais dados temos sobre você</li>
              <li><strong>Corrigir:</strong> Atualizar dados incorretos</li>
              <li><strong>Deletar:</strong> Solicitar exclusão da conta e dados</li>
              <li><strong>Portar:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Revogar:</strong> Retirar consentimento a qualquer momento</li>
              <li><strong>Opor-se:</strong> Discordar de certos usos dos dados</li>
            </ul>
            <p className="mt-2">
              Para exercer seus direitos, entre em contato: privacidade@astromeu.com.br
            </p>

            <h3 className="text-lg font-medium mt-6">7. Retenção de Dados</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados de conta: Mantidos enquanto conta estiver ativa</li>
              <li>Histórico de chat: 90 dias após última mensagem</li>
              <li>Entradas do diário: 1 ano após criação</li>
              <li>Áudios diários: 30 dias</li>
              <li>Dados de pagamento: 5 anos (obrigação legal)</li>
            </ul>
            <p className="mt-2">
              Após exclusão da conta, dados pessoais são removidos em até 30 dias,
              exceto quando exigido por lei.
            </p>

            <h3 className="text-lg font-medium mt-6">8. Cookies e Rastreamento</h3>
            <p>Usamos cookies para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Manter você logado</li>
              <li>Lembrar preferências</li>
              <li>Analisar uso da plataforma (Google Analytics - opcional)</li>
            </ul>
            <p className="mt-2">
              Você pode desabilitar cookies nas configurações do navegador, mas isso pode
              afetar funcionalidades.
            </p>

            <h3 className="text-lg font-medium mt-6">9. Menores de Idade</h3>
            <p>
              O AstroMeu é destinado a maiores de 18 anos. Não coletamos intencionalmente
              dados de menores. Se identificarmos, deletaremos imediatamente.
            </p>

            <h3 className="text-lg font-medium mt-6">10. Transferência Internacional</h3>
            <p>
              Alguns de nossos fornecedores estão nos EUA. Ao usar o
              serviço, você concorda com transferência de dados para estes países, que possuem
              proteções de privacidade equivalentes.
            </p>

            <h3 className="text-lg font-medium mt-6">11. Alterações nesta Política</h3>
            <p>
              Podemos atualizar esta política ocasionalmente. Mudanças significativas serão
              notificadas por email. Recomendamos revisar periodicamente.
            </p>

            <h3 className="text-lg font-medium mt-6">12. Contato - Encarregado de Dados (DPO)</h3>
            <p>
              Para questões sobre privacidade ou exercer seus direitos:<br />
              Email: privacidade@astromeu.com.br
            </p>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-lg mt-6">
              <p className="text-sm font-medium mb-2">Dúvidas sobre Privacidade?</p>
              <p className="text-sm text-muted-foreground">
                Estamos comprometidos com a transparência. Se tiver qualquer dúvida sobre
                como tratamos seus dados, entre em contato conosco.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
