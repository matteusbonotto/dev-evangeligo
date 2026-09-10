import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/routePaths";

/**
 * Convenção de versionamento dos documentos legais (Termos/Privacidade):
 * - `version` é a data (ISO, AAAA-MM-DD) da última alteração MATERIAL do
 *   documento (mudança de sentido, direitos, prazos, coleta de dados etc.).
 *   Correções de digitação/formatação não exigem incrementar a versão.
 * - Sempre que `version` mudar, o fluxo de consentimento (T-005) deve
 *   solicitar novo aceite aos usuários que já haviam consentido com uma
 *   versão anterior, registrando o novo aceite na tabela `consentimentos`
 *   (ver `IA/docs/database.md` e `IA/docs/privacy.md`).
 * - `label` é apenas a data legível em pt-BR, para exibição na tela.
 */
export const LEGAL_DOCUMENT_VERSIONS = {
  terms: { version: "2026-08-24", label: "24 de agosto de 2026" },
  privacy: { version: "2026-08-24", label: "24 de agosto de 2026" },
} as const;

type LegalDocumentKind = keyof typeof LEGAL_DOCUMENT_VERSIONS;

type LegalBlock =
  { type: "p"; text: string } | { type: "list"; items: string[] };

type LegalSection = {
  id: string;
  heading: string;
  blocks: LegalBlock[];
};

function p(text: string): LegalBlock {
  return { type: "p", text };
}

function list(items: string[]): LegalBlock {
  return { type: "list", items };
}

const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "aceitacao",
    heading: "1. Aceitação dos termos",
    blocks: [
      p(
        "Ao criar uma conta ou utilizar o EvangeliGO — incluindo o modo demonstração — você declara que leu, compreendeu e concorda com estes Termos de Uso e com a Política de Privacidade. Se você não concordar com qualquer parte destes termos, não utilize a plataforma.",
      ),
    ],
  },
  {
    id: "servico",
    heading: "2. O que é o EvangeliGO",
    blocks: [
      p(
        "O EvangeliGO é uma plataforma gamificada de estudo bíblico e teologia cristã reformada, com trilhas de estudo, aulas, quizzes, elementos de progressão (XP, níveis, sequências, conquistas, itens e armadura) e recursos sociais opcionais (feed de devocionais, chat com amigos, missões colaborativas).",
      ),
    ],
  },
  {
    id: "idade-minima",
    heading: "3. Idade mínima e uso por menores",
    blocks: [
      p(
        "O uso do EvangeliGO é destinado a pessoas com 13 anos ou mais. Usuários entre 13 e 18 anos devem utilizar a plataforma com o conhecimento e, quando exigido por lei, o consentimento de um responsável legal. Não coletamos intencionalmente dados de crianças menores de 13 anos; se identificarmos uma conta nessa condição, ela poderá ser suspensa e os dados excluídos. [Faixa etária sujeita a confirmação jurídica final antes do lançamento público.]",
      ),
    ],
  },
  {
    id: "cadastro",
    heading: "4. Cadastro e responsabilidade pela conta",
    blocks: [
      p(
        "Você é responsável por fornecer informações verdadeiras no cadastro, por manter a confidencialidade da sua senha e por todas as atividades realizadas em sua conta. Avise-nos imediatamente pelo canal da seção 13 em caso de uso não autorizado.",
      ),
    ],
  },
  {
    id: "demonstracao",
    heading: "5. Modo demonstração",
    blocks: [
      p(
        "O modo demonstração permite explorar a experiência completa do aplicativo sem criar conta, usando um usuário fictício. Nenhum progresso do modo demonstração é salvo de forma permanente ou associado a uma pessoa real.",
      ),
    ],
  },
  {
    id: "conduta",
    heading: "6. Conduta do usuário",
    blocks: [
      list([
        "Respeitar outros usuários em chats, feed de devocionais e missões colaborativas, mantendo um ambiente de comunhão saudável.",
        "Não publicar conteúdo ofensivo, discriminatório, ilegal ou que viole direitos de terceiros.",
        "Não tentar burlar mecanismos de segurança, autorização (RLS) ou limites técnicos da plataforma.",
        "Não usar a plataforma para fins comerciais não autorizados.",
      ]),
      p(
        "O descumprimento destas regras pode levar à suspensão ou ao encerramento da conta, conforme a seção 10.",
      ),
    ],
  },
  {
    id: "licenciamento-conteudo",
    heading: "7. Conteúdo bíblico e hinário — uso e licenciamento",
    blocks: [
      p(
        "O texto bíblico disponibilizado no EvangeliGO tem como base a tradução Almeida (edição a confirmar) e os hinos têm como base a Harpa Cristã. Esse conteúdo é disponibilizado para seu uso pessoal e não comercial dentro da plataforma, conforme os termos de licenciamento aplicáveis à edição utilizada — que serão formalmente validados antes da publicação pública de cada conteúdo (ver riscos registrados em `IA/memory/project-memory.md`). É proibido copiar, redistribuir, sublicenciar ou comercializar esse conteúdo fora do EvangeliGO.",
      ),
    ],
  },
  {
    id: "gamificacao-merito",
    heading: "8. Gamificação e mérito espiritual",
    blocks: [
      p(
        "Recursos como XP, níveis, ouro, sequências (streaks), corações, conquistas, itens e a 'Armadura de Deus' são ferramentas pedagógicas para incentivar hábito e constância no estudo. Eles NÃO representam, medem, concedem ou substituem mérito espiritual, salvação, aprovação de Deus ou maturidade na fé. Progresso no aplicativo não é indicador de crescimento espiritual real, que se dá pela graça, pela Palavra e pela comunhão com Deus e Sua igreja — nunca por obras humanas ou por desempenho no jogo.",
      ),
    ],
  },
  {
    id: "limitacao-responsabilidade",
    heading: "9. Isenções e limitações de responsabilidade",
    blocks: [
      p(
        "O conteúdo teológico do EvangeliGO reflete a tradição cristã reformada e tem finalidade educativa; não substitui aconselhamento pastoral, participação em uma igreja local ou orientação teológica individualizada. A plataforma é fornecida 'como está', sem garantia de disponibilidade ininterrupta ou de ausência total de erros.",
      ),
    ],
  },
  {
    id: "suspensao-encerramento",
    heading: "10. Suspensão e encerramento de conta",
    blocks: [
      p(
        "Podemos suspender ou encerrar contas que violem estes Termos. Você pode encerrar sua conta a qualquer momento; veja como em 'Exportação e exclusão de dados', na Política de Privacidade.",
      ),
    ],
  },
  {
    id: "alteracoes",
    heading: "11. Alterações destes termos",
    blocks: [
      p(
        "Podemos atualizar estes Termos para refletir mudanças legais, técnicas ou no serviço. Alterações materiais serão comunicadas e, quando exigido, solicitaremos novo aceite antes de você continuar usando a plataforma. A versão vigente e a data da última atualização estão sempre indicadas no topo deste documento.",
      ),
    ],
  },
  {
    id: "lei-aplicavel",
    heading: "12. Lei aplicável e foro",
    blocks: [
      p(
        "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de [cidade/comarca a definir] para dirimir eventuais controvérsias, ressalvado o foro de domicílio do consumidor quando aplicável por lei.",
      ),
    ],
  },
  {
    id: "contato",
    heading: "13. Contato",
    blocks: [
      p(
        "Dúvidas sobre estes Termos podem ser enviadas para [e-mail de contato a definir].",
      ),
    ],
  },
];

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "controlador",
    heading: "1. Controlador dos dados",
    blocks: [
      p(
        "O EvangeliGO é operado por [razão social e CNPJ do controlador a definir]. Esta seção será completada com a identificação formal do controlador antes do lançamento público, conforme exigido pela Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018).",
      ),
    ],
  },
  {
    id: "dados-coletados",
    heading: "2. Quais dados coletamos",
    blocks: [
      p(
        "Coletamos apenas os dados necessários para oferecer a experiência do EvangeliGO (princípio da minimização):",
      ),
      list([
        "Dados de cadastro e autenticação: nome, e-mail, data de nascimento e senha (armazenada de forma segura pelo Supabase Auth, nunca em texto puro); se você optar por login com Google, os dados básicos fornecidos pelo Google.",
        "Dados de preferências: estado civil e objetivo informados no onboarding, usados para personalizar sua jornada.",
        "Dados de progresso e uso: XP, nível, ouro, sequência (streak), aulas e trilhas concluídas, resultados de quiz, conquistas, itens e armadura equipada.",
        "Dados de engajamento religioso/doutrinário: trilhas e conteúdos estudados, marcações e anotações na Bíblia, hinos favoritos e respostas a quizzes doutrinários — este é um dado sensível segundo o art. 5º, II, da LGPD, por revelar convicção religiosa.",
        "Dados sociais, quando você usa esses recursos: mensagens de chat com amigos, publicações no feed de devocionais e participação em missões colaborativas.",
      ]),
    ],
  },
  {
    id: "base-legal",
    heading: "3. Base legal para o tratamento",
    blocks: [
      p(
        "Tratamos dados de cadastro, preferências e uso com base na execução do contrato de uso do serviço e no seu consentimento (art. 7º, I e V, da LGPD). Como o conteúdo religioso/doutrinário que você consome e produz dentro do app é dado sensível, seu tratamento tem como base o seu consentimento livre, informado, específico e destacado (art. 11, I, da LGPD), obtido no cadastro e registrado de forma auditável — ver a seção 8.",
      ),
    ],
  },
  {
    id: "finalidade",
    heading: "4. Para que usamos seus dados",
    blocks: [
      list([
        "Autenticar sua conta e manter sua sessão.",
        "Personalizar trilhas, recomendações e sua jornada de estudo.",
        "Calcular e exibir seu progresso, XP, conquistas e itens.",
        "Viabilizar recursos sociais que você optar por usar (chat, feed, missões colaborativas).",
        "Cumprir obrigações legais e responder a solicitações dos titulares de dados.",
        "Melhorar a plataforma, preferencialmente a partir de métricas agregadas e anônimas.",
      ]),
    ],
  },
  {
    id: "compartilhamento",
    heading: "5. Com quem compartilhamos dados",
    blocks: [
      p(
        "Compartilhamos dados apenas com operadores estritamente necessários ao funcionamento do serviço, como o Supabase (hospedagem de banco de dados e autenticação), sob obrigações contratuais de confidencialidade e segurança. Nunca vendemos seus dados a terceiros, para nenhuma finalidade. Podemos compartilhar dados quando exigido por lei ou ordem judicial.",
      ),
    ],
  },
  {
    id: "dados-sensiveis",
    heading: "6. Cuidado redobrado com dado sensível (religioso)",
    blocks: [
      p(
        "Reconhecemos que dados sobre convicção religiosa são dados sensíveis (art. 5º, II, da LGPD) e recebem tratamento com cuidado redobrado: coleta mínima, acesso restrito ao próprio titular por meio de autorização no banco de dados (Row Level Security) e nunca são usados para fins discriminatórios nem compartilhados para publicidade de terceiros.",
      ),
    ],
  },
  {
    id: "direitos",
    heading: "7. Seus direitos como titular",
    blocks: [
      p(
        "Nos termos dos arts. 17 a 22 da LGPD, você pode solicitar, a qualquer momento:",
      ),
      list([
        "Confirmação da existência de tratamento e acesso aos seus dados.",
        "Correção de dados incompletos, inexatos ou desatualizados.",
        "Portabilidade dos seus dados a outro fornecedor de serviço.",
        "Exclusão dos dados tratados com base no seu consentimento.",
        "Revogação do consentimento, a qualquer momento.",
        "Informação sobre as entidades com as quais compartilhamos seus dados.",
        "Oposição a tratamento realizado em desacordo com a lei.",
      ]),
      p(
        "Para exercer qualquer um desses direitos, entre em contato pelo canal da seção 14. Responderemos em até [15 dias corridos — prazo sujeito a confirmação jurídica final], podendo haver prorrogação justificada.",
      ),
    ],
  },
  {
    id: "consentimento",
    heading: "8. Consentimento: como é registrado",
    blocks: [
      p(
        "No cadastro, você aceita explicitamente estes Termos e esta Política. Esse aceite é registrado de forma auditável, associado ao seu usuário, com data/hora e à versão exata dos documentos aceitos — permitindo comprovar quando e o que foi consentido (ver a tabela `consentimentos` em `IA/docs/database.md`). Caso os documentos sejam alterados de forma material, solicitaremos um novo consentimento antes de você continuar usando funcionalidades que dependam dele.",
      ),
    ],
  },
  {
    id: "retencao",
    heading: "9. Prazo de retenção dos dados",
    blocks: [
      p(
        "Mantemos seus dados enquanto sua conta estiver ativa. Após a exclusão da conta, retemos por até [90 dias corridos — prazo sujeito a confirmação jurídica final] apenas os dados estritamente necessários para cumprimento de obrigação legal ou regulatória, exercício regular de direitos em processo judicial ou administrativo, ou prevenção a fraude; findo esse prazo, os dados são eliminados ou anonimizados de forma definitiva. Dados sensíveis de engajamento religioso/doutrinário seguem o mesmo prazo e não são mantidos além dele para nenhuma outra finalidade.",
      ),
    ],
  },
  {
    id: "exportacao-exclusao",
    heading: "10. Exportação e exclusão de dados",
    blocks: [
      p(
        "Você pode solicitar a exportação de todos os seus dados pessoais em formato JSON e a exclusão definitiva da sua conta a partir das configurações do aplicativo (funcionalidade em desenvolvimento) ou pelo canal de contato da seção 14. O contrato técnico desse mecanismo — quais dados são exportados, o que dispara a exclusão e o que acontece com dados sensíveis — está documentado em `IA/docs/privacy.md`.",
      ),
    ],
  },
  {
    id: "seguranca",
    heading: "11. Segurança da informação",
    blocks: [
      p(
        "Adotamos medidas técnicas e organizacionais para proteger seus dados: autorização por Row Level Security (RLS) em todas as tabelas do banco, tráfego criptografado (HTTPS), senhas nunca armazenadas em texto puro e chaves de acesso privilegiado (`service_role`) nunca expostas no aplicativo.",
      ),
    ],
  },
  {
    id: "menores",
    heading: "12. Menores de idade",
    blocks: [
      p(
        "Assim como nos Termos de Uso, o EvangeliGO é destinado a pessoas com 13 anos ou mais; entre 13 e 18 anos, o uso deve ocorrer com o conhecimento e, quando exigido por lei, o consentimento de um responsável legal, nos termos do art. 14 da LGPD. [Sujeito a confirmação jurídica final.]",
      ),
    ],
  },
  {
    id: "alteracoes",
    heading: "13. Alterações desta política",
    blocks: [
      p(
        "Podemos atualizar esta Política para refletir mudanças legais, técnicas ou no serviço. Mudanças materiais serão comunicadas e, quando aplicável, solicitaremos novo consentimento. A versão vigente e a data da última atualização estão sempre indicadas no topo deste documento.",
      ),
    ],
  },
  {
    id: "contato",
    heading: "14. Contato e encarregado (DPO)",
    blocks: [
      p(
        "Para exercer seus direitos, tirar dúvidas sobre esta Política ou registrar reclamações, entre em contato pelo e-mail [e-mail de contato/DPO a definir]. Antes do lançamento público, esse canal e a identificação do encarregado de proteção de dados (DPO) serão formalizados.",
      ),
    ],
  },
];

const CLOSING_NOTE =
  "Este documento foi elaborado com apoio do papel de especialista jurídico do projeto e ainda passará por revisão formal de um(a) advogado(a) habilitado(a) antes do lançamento público do EvangeliGO. Trechos entre colchetes, como [a definir], serão substituídos após essa revisão e a formalização da pessoa jurídica responsável pelo tratamento de dados.";

export function LegalPage({ kind }: { kind: "terms" | "privacy" }) {
  const isPrivacy = kind === "privacy";
  const docKind: LegalDocumentKind = isPrivacy ? "privacy" : "terms";
  const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  const { label } = LEGAL_DOCUMENT_VERSIONS[docKind];

  return (
    <main className="legal-page">
      <Link className="back-link" to={ROUTE_PATHS.home}>
        ← Início
      </Link>
      <p className="eyebrow">EvangeliGO</p>
      <h1>{isPrivacy ? "Política de Privacidade" : "Termos de Uso"}</h1>
      <p>Versão vigente: {label}.</p>

      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`legal-${section.id}`}>
          <h2 id={`legal-${section.id}`}>{section.heading}</h2>
          {section.blocks.map((block, index) =>
            block.type === "p" ? (
              <p key={index}>{block.text}</p>
            ) : (
              <ul key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ),
          )}
        </section>
      ))}

      <h2>Revisão jurídica</h2>
      <p>{CLOSING_NOTE}</p>
    </main>
  );
}
