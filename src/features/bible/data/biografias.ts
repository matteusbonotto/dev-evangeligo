/**
 * Metadados leves de biografia dos autores/personagens recorrentes
 * referenciados por `data/autoresLivros.ts` (`autorId`) e
 * `data/falasNomeadas.ts` (`biografiaId`) — Tier A/B de "quem fala"
 * (T-041/ADR-036). O conteúdo NARRATIVO longo ("quem foi Pedro, como
 * morreu") não é escrito à mão aqui — vem ao vivo da Wikipédia em
 * português (`biografiaExterna.ts`, pedido explícito do usuário: "pode
 * pegar de uma fonte segura e válida na internet"). Este arquivo guarda só
 * o essencial para ancorar isso: o papel da pessoa no texto bíblico, as
 * referências que sustentam esse papel (o "posso confirmar pelo
 * versículo" pedido pelo usuário) e o título exato do artigo na Wikipédia
 * (`wikipediaTitulo`, conferido item a item contra a API ao vivo antes de
 * gravar aqui — não adivinhado).
 *
 * Campos estruturados opcionais (T-049/ADR-042, item 1.3 do plano de UX do
 * painel de leitura — "quero uma forma agrupada e organizada... onde
 * viveu, como morreu, filho de, fez oq, escreveu"): `ondeViveu`/
 * `comoMorreu`/`filhoDe`/`escreveu`, cada um só preenchido quando há base
 * textual/histórica razoável — "o que fez" já é coberto por `papel`, sem
 * precisar de um campo redundante. Quando a morte não é narrada na Bíblia,
 * o valor deixa isso explícito e rotula tradição extra-bíblica como
 * tradição (nunca apresentada como fato bíblico) — mesmo cuidado
 * doutrinário já praticado no resto do app (`teologia-reformada`).
 */

export interface Biografia {
  id: string;
  nome: string;
  /** Curto — o papel dessa pessoa no texto (não uma biografia completa). */
  papel: string;
  referenciasBiblicasChave: string[];
  /** Título exato do artigo em pt.wikipedia.org, usado por `obterResumoWikipedia`. */
  wikipediaTitulo: string;
  /** Região/cidade onde viveu — quando conhecida. */
  ondeViveu?: string;
  /** Como morreu — texto bíblico quando narrado; tradição extra-bíblica sempre rotulada como tal. */
  comoMorreu?: string;
  /** Filiação/parentesco quando a Bíblia especifica. */
  filhoDe?: string;
  /** Livro(s)/carta(s) que escreveu, quando aplicável. */
  escreveu?: string;
}

const LISTA: Biografia[] = [
  {
    id: "jesus",
    nome: "Jesus Cristo",
    papel:
      "O Filho de Deus encarnado; centro da fé cristã e cumprimento das promessas messiânicas do Antigo Testamento.",
    referenciasBiblicasChave: ["João 1:1-14", "Filipenses 2:6-11"],
    wikipediaTitulo: "Jesus",
    ondeViveu:
      "Belém (nascimento), Nazaré (infância e juventude), Galileia e Judeia (ministério público)",
    comoMorreu:
      "Crucificado em Jerusalém sob o governador romano Pôncio Pilatos; ressuscitou ao terceiro dia (Mateus 27-28; Marcos 15-16; Lucas 23-24; João 19-20)",
    filhoDe:
      "Filho de Deus; concebido pelo Espírito Santo em Maria (Mateus 1:18-25; Lucas 1:26-38)",
  },
  {
    id: "deus",
    nome: "Deus Pai",
    papel:
      "O Deus trino revelado nas Escrituras — Criador, soberano sobre a história, que fala diretamente em momentos-chave da revelação.",
    referenciasBiblicasChave: ["Êxodo 3:14", "Mateus 3:17"],
    wikipediaTitulo: "Deus no Cristianismo",
  },
  {
    id: "moises",
    nome: "Moisés",
    papel:
      "Líder que tirou Israel do Egito e recebeu a Lei no Sinai; autor tradicional do Pentateuco.",
    referenciasBiblicasChave: [
      "Êxodo 3:1-10",
      "Êxodo 20:1-17",
      "Deuteronômio 34:5-7",
    ],
    wikipediaTitulo: "Moisés",
    ondeViveu:
      "Egito (nascimento e juventude), Midiã (exílio), deserto do Sinai (êxodo)",
    comoMorreu:
      "Morreu no Monte Nebo aos 120 anos, sem entrar em Canaã, e foi sepultado por Deus em local desconhecido (Deuteronômio 34:1-7)",
    filhoDe: "Filho de Anrão e Joquebede, da tribo de Levi (Êxodo 6:20)",
    escreveu: "Pentateuco (Gênesis a Deuteronômio), por tradição",
  },
  {
    id: "josue",
    nome: "Josué",
    papel:
      "Sucessor de Moisés; liderou a conquista e divisão da terra prometida.",
    referenciasBiblicasChave: ["Josué 1:1-9", "Josué 24:14-15"],
    wikipediaTitulo: "Josué",
    ondeViveu: "Egito e depois a terra de Canaã",
    comoMorreu:
      "Morreu aos 110 anos e foi sepultado em Timnate-Sera, em Efraim (Josué 24:29-30)",
    filhoDe: "Filho de Num, da tribo de Efraim (Números 13:8)",
    escreveu: "Livro de Josué, por tradição",
  },
  {
    id: "davi",
    nome: "Davi",
    papel:
      "Segundo rei de Israel; autor de muitos Salmos; recebeu a promessa de um trono eterno cumprida em Cristo.",
    referenciasBiblicasChave: [
      "1 Samuel 16:1-13",
      "2 Samuel 7:12-16",
      "Salmos 23",
    ],
    wikipediaTitulo: "Davi",
    ondeViveu: "Belém (nascimento), depois Jerusalém como rei",
    comoMorreu:
      "Morreu de velhice em Jerusalém, sucedido pelo filho Salomão (1 Reis 2:10-12)",
    filhoDe: "Filho de Jessé, de Belém (1 Samuel 16:1)",
    escreveu: "Muitos Salmos",
  },
  {
    id: "salomao",
    nome: "Salomão",
    papel:
      "Filho de Davi, rei de Israel conhecido pela sabedoria; autor tradicional de Provérbios, Eclesiastes e Cantares.",
    referenciasBiblicasChave: ["1 Reis 3:5-14", "1 Reis 4:29-34"],
    wikipediaTitulo: "Salomão",
    ondeViveu: "Jerusalém",
    comoMorreu:
      "Morreu em Jerusalém após 40 anos de reinado (1 Reis 11:42-43)",
    filhoDe: "Filho de Davi e Bate-Seba (2 Samuel 12:24)",
    escreveu:
      "Provérbios, Eclesiastes e Cantares dos Cânticos, por tradição",
  },
  {
    id: "esdras",
    nome: "Esdras",
    papel:
      "Sacerdote e escriba que liderou a reforma espiritual dos judeus após o retorno do exílio babilônico.",
    referenciasBiblicasChave: ["Esdras 7:6-10"],
    wikipediaTitulo: "Esdras",
    ondeViveu: "Babilônia, depois Jerusalém",
    filhoDe: "Descendente de Arão, da linhagem sacerdotal (Esdras 7:1-5)",
    escreveu: "Livro de Esdras, por tradição (e possivelmente Crônicas)",
  },
  {
    id: "neemias",
    nome: "Neemias",
    papel:
      "Copeiro do rei persa que liderou a reconstrução dos muros de Jerusalém.",
    referenciasBiblicasChave: ["Neemias 1:1-4", "Neemias 6:15-16"],
    wikipediaTitulo: "Neemias",
    ondeViveu: "Susã (corte persa), depois Jerusalém",
    filhoDe: "Filho de Hacalias (Neemias 1:1)",
    escreveu: "Livro de Neemias, por tradição",
  },
  {
    id: "isaias",
    nome: "Isaías",
    papel:
      "Profeta de Judá; anunciou juízo e a esperança messiânica mais detalhada do Antigo Testamento.",
    referenciasBiblicasChave: ["Isaías 6:1-8", "Isaías 53:1-12"],
    wikipediaTitulo: "Isaías",
    ondeViveu: "Jerusalém",
    comoMorreu:
      "Não registrado na Bíblia; tradição judaica posterior diz que foi serrado ao meio no reinado do rei Manassés",
    filhoDe: "Filho de Amoz (Isaías 1:1)",
    escreveu: "Livro de Isaías",
  },
  {
    id: "jeremias",
    nome: "Jeremias",
    papel:
      '"Profeta chorão"; ministrou nos últimos anos de Judá antes da queda de Jerusalém.',
    referenciasBiblicasChave: ["Jeremias 1:4-10", "Jeremias 31:31-34"],
    wikipediaTitulo: "Jeremias",
    ondeViveu: "Anatote e Jerusalém, depois levado ao Egito contra a vontade",
    comoMorreu:
      "Não registrado com certeza na Bíblia; tradição diz que foi apedrejado pelo próprio povo no Egito",
    filhoDe: "Filho de Hilquias, sacerdote de Anatote (Jeremias 1:1)",
    escreveu: "Livro de Jeremias e Lamentações, por tradição",
  },
  {
    id: "ezequiel",
    nome: "Ezequiel",
    papel:
      "Sacerdote e profeta que ministrou no exílio babilônico por meio de visões simbólicas.",
    referenciasBiblicasChave: ["Ezequiel 1:1-3", "Ezequiel 37:1-14"],
    wikipediaTitulo: "Ezequiel",
    ondeViveu: "Babilônia (exílio)",
    filhoDe: "Filho de Buzi, sacerdote (Ezequiel 1:3)",
    escreveu: "Livro de Ezequiel",
  },
  {
    id: "daniel",
    nome: "Daniel",
    papel:
      "Nobre judeu exilado, fiel nas cortes babilônica e persa; recebeu visões apocalípticas.",
    referenciasBiblicasChave: ["Daniel 1:8-20", "Daniel 6:16-23"],
    wikipediaTitulo: "Daniel (profeta)",
    ondeViveu: "Babilônia e Pérsia (exílio)",
    escreveu: "Livro de Daniel",
  },
  {
    id: "oseias",
    nome: "Oséias",
    papel:
      "Profeta ao reino do Norte; usou seu próprio casamento como figura da infidelidade de Israel.",
    referenciasBiblicasChave: ["Oséias 1:2-3", "Oséias 3:1"],
    wikipediaTitulo: "Oseias (profeta)",
    ondeViveu: "Reino do Norte (Israel)",
    filhoDe: "Filho de Beeri (Oséias 1:1)",
    escreveu: "Livro de Oséias",
  },
  {
    id: "joel",
    nome: "Joel",
    papel:
      'Profeta que anunciou o "Dia do Senhor" e o derramamento futuro do Espírito.',
    referenciasBiblicasChave: ["Joel 2:28-32"],
    wikipediaTitulo: "Joel (profeta)",
    ondeViveu: "Judá",
    filhoDe: "Filho de Petuel (Joel 1:1)",
    escreveu: "Livro de Joel",
  },
  {
    id: "amos",
    nome: "Amós",
    papel:
      "Pastor de Tecoa enviado para denunciar a injustiça social no reino do Norte.",
    referenciasBiblicasChave: ["Amós 1:1", "Amós 5:21-24"],
    wikipediaTitulo: "Amós (profeta)",
    ondeViveu: "Tecoa, em Judá — profetizou no reino do Norte",
    escreveu: "Livro de Amós",
  },
  {
    id: "obadias",
    nome: "Obadias",
    papel: "Profeta que anunciou o juízo contra Edom.",
    referenciasBiblicasChave: ["Obadias 1:10-14"],
    wikipediaTitulo: "Obadias (profeta)",
    escreveu: "Livro de Obadias",
  },
  {
    id: "jonas",
    nome: "Jonas",
    papel: "Profeta que fugiu do chamado de pregar a Nínive antes de obedecer.",
    referenciasBiblicasChave: ["Jonas 1:1-3", "Jonas 3:1-10"],
    wikipediaTitulo: "Jonas (profeta)",
    ondeViveu: "Gate-Hefer, na Galileia — enviado a Nínive",
    filhoDe: "Filho de Amitai (Jonas 1:1)",
    escreveu: "Livro de Jonas",
  },
  {
    id: "miqueias",
    nome: "Miquéias",
    papel:
      "Contemporâneo de Isaías; anunciou o nascimento do Messias em Belém.",
    referenciasBiblicasChave: ["Miquéias 5:2", "Miquéias 6:8"],
    wikipediaTitulo: "Miqueias",
    ondeViveu: "Moresete, em Judá",
    escreveu: "Livro de Miquéias",
  },
  {
    id: "naum",
    nome: "Naum",
    papel: "Profeta que anunciou a queda de Nínive.",
    referenciasBiblicasChave: ["Naum 1:1-3"],
    wikipediaTitulo: "Naum (profeta)",
    ondeViveu: "Elcós",
    escreveu: "Livro de Naum",
  },
  {
    id: "habacuque",
    nome: "Habacuque",
    papel:
      "Profeta que questionou a Deus sobre o uso da Babilônia para julgar Judá.",
    referenciasBiblicasChave: ["Habacuque 2:4", "Habacuque 3:17-19"],
    wikipediaTitulo: "Habacuque",
    ondeViveu: "Judá",
    escreveu: "Livro de Habacuque",
  },
  {
    id: "sofonias",
    nome: "Sofonias",
    papel:
      'Profeta no reinado de Josias; anunciou o "Dia do Senhor" e a restauração final.',
    referenciasBiblicasChave: ["Sofonias 1:14-18", "Sofonias 3:17"],
    wikipediaTitulo: "Sofonias (profeta)",
    ondeViveu: "Judá",
    filhoDe: "Bisneto do rei Ezequias, segundo Sofonias 1:1",
    escreveu: "Livro de Sofonias",
  },
  {
    id: "ageu",
    nome: "Ageu",
    papel:
      "Profeta que exortou os judeus retornados do exílio a reconstruírem o templo.",
    referenciasBiblicasChave: ["Ageu 1:1-11"],
    wikipediaTitulo: "Ageu",
    ondeViveu: "Jerusalém, após o retorno do exílio",
    escreveu: "Livro de Ageu",
  },
  {
    id: "zacarias",
    nome: "Zacarias",
    papel:
      "Profeta contemporâneo de Ageu; profetizou detalhadamente sobre o Messias.",
    referenciasBiblicasChave: ["Zacarias 9:9"],
    wikipediaTitulo: "Zacarias (profeta)",
    ondeViveu: "Jerusalém, após o retorno do exílio",
    filhoDe: "Filho de Baraquias, neto de Ido (Zacarias 1:1)",
    escreveu: "Livro de Zacarias",
  },
  {
    id: "malaquias",
    nome: "Malaquias",
    papel:
      "Último profeta do Antigo Testamento; anunciou o mensageiro que prepararia o caminho do Senhor.",
    referenciasBiblicasChave: ["Malaquias 3:1", "Malaquias 4:5-6"],
    wikipediaTitulo: "Malaquias",
    ondeViveu: "Jerusalém, após o retorno do exílio",
    escreveu: "Livro de Malaquias",
  },
  {
    id: "mateus",
    nome: "Mateus (o apóstolo)",
    papel:
      "Ex-cobrador de impostos (também chamado Levi), um dos doze apóstolos; autor do Evangelho de Mateus.",
    referenciasBiblicasChave: ["Mateus 9:9", "Mateus 10:3"],
    wikipediaTitulo: "Mateus (evangelista)",
    ondeViveu: "Cafarnaum, na Galileia",
    comoMorreu:
      "Não registrado na Bíblia; tradição da igreja antiga diz que morreu como mártir",
    escreveu: "Evangelho de Mateus",
  },
  {
    id: "marcos",
    nome: "João Marcos",
    papel:
      "Companheiro de Paulo, Barnabé e Pedro; autor tradicional do Evangelho de Marcos, baseado na pregação de Pedro.",
    referenciasBiblicasChave: ["Atos 12:12", "Atos 12:25", "1 Pedro 5:13"],
    wikipediaTitulo: "João Marcos",
    ondeViveu: "Jerusalém, depois viajou com Paulo/Barnabé e Pedro",
    comoMorreu: "Não registrado na Bíblia; tradição diz que morreu em Alexandria",
    filhoDe:
      "Filho de uma Maria de Jerusalém (Atos 12:12); primo de Barnabé (Colossenses 4:10)",
    escreveu: "Evangelho de Marcos",
  },
  {
    id: "lucas",
    nome: "Lucas",
    papel:
      "Médico e companheiro de viagem de Paulo; autor do Evangelho de Lucas e de Atos dos Apóstolos.",
    referenciasBiblicasChave: ["Colossenses 4:14", "2 Timóteo 4:11"],
    wikipediaTitulo: "Lucas (evangelista)",
    ondeViveu: "Provavelmente Antioquia; viajou com Paulo",
    comoMorreu: "Não registrado na Bíblia",
    escreveu: "Evangelho de Lucas e Atos dos Apóstolos",
  },
  {
    id: "joao",
    nome: "João (o apóstolo)",
    papel:
      '"O discípulo amado", um dos doze apóstolos; autor do quarto Evangelho, de 1-3 João e do Apocalipse.',
    referenciasBiblicasChave: ["João 21:20-24", "Apocalipse 1:9"],
    wikipediaTitulo: "João (apóstolo)",
    ondeViveu: "Galileia, depois Éfeso; exilado na ilha de Patmos",
    comoMorreu:
      "Tradição da igreja antiga: o único apóstolo a não morrer como mártir, falecendo de causas naturais em Éfeso já idoso",
    filhoDe: "Filho de Zebedeu, irmão de Tiago (Mateus 4:21)",
    escreveu: "Evangelho de João, 1-3 João e Apocalipse",
  },
  {
    id: "paulo",
    nome: "Paulo",
    papel:
      "Ex-perseguidor da igreja convertido no caminho de Damasco; apóstolo aos gentios, autor de 13 cartas do Novo Testamento.",
    referenciasBiblicasChave: ["Atos 9:1-19", "Atos 22:6-16", "Atos 26:12-18"],
    wikipediaTitulo: "Paulo de Tarso",
    ondeViveu:
      "Tarso (nascimento), Jerusalém (formação); depois viagens missionárias por todo o Mediterrâneo oriental",
    comoMorreu:
      "Não registrado no Novo Testamento; tradição da igreja antiga diz que foi decapitado em Roma sob o imperador Nero",
    escreveu: "13 cartas do Novo Testamento",
  },
  {
    id: "tiago",
    nome: "Tiago (irmão de Jesus)",
    papel:
      "Meio-irmão de Jesus, líder da igreja de Jerusalém; autor da carta de Tiago.",
    referenciasBiblicasChave: ["Mateus 13:55", "Atos 15:13-21", "Gálatas 1:19"],
    wikipediaTitulo: "Tiago, irmão de Jesus",
    ondeViveu: "Jerusalém",
    comoMorreu:
      "Não registrado no Novo Testamento; tradição (Flávio Josefo e a igreja antiga) diz que foi apedrejado em Jerusalém por ordem do sumo sacerdote",
    filhoDe: "Meio-irmão de Jesus, filho de Maria e José (Mateus 13:55)",
    escreveu: "Carta de Tiago",
  },
  {
    id: "pedro",
    nome: "Pedro",
    papel:
      "Pescador chamado por Jesus, um dos doze apóstolos e líder proeminente da igreja primitiva; autor de 1-2 Pedro.",
    referenciasBiblicasChave: [
      "Mateus 16:16-18",
      "Mateus 26:69-75",
      "João 21:15-19",
    ],
    wikipediaTitulo: "Pedro (apóstolo)",
    ondeViveu:
      "Betsaida e Cafarnaum, na Galileia; depois Jerusalém e, por fim, Roma",
    comoMorreu:
      "Não registrado no Novo Testamento; tradição antiga (Clemente de Roma, Tertuliano) diz que foi crucificado em Roma sob Nero, de cabeça para baixo a pedido próprio",
    filhoDe: "Filho de João (ou Jonas), irmão de André (João 1:42; Mateus 4:18)",
    escreveu: "1 e 2 Pedro",
  },
  {
    id: "judas-irmao-de-jesus",
    nome: "Judas (irmão de Jesus)",
    papel: "Meio-irmão de Jesus e de Tiago; autor da carta de Judas.",
    referenciasBiblicasChave: ["Mateus 13:55", "Judas 1:1"],
    wikipediaTitulo: "Judas (irmão de Jesus)",
    ondeViveu: "Jerusalém",
    filhoDe: "Meio-irmão de Jesus e de Tiago (Mateus 13:55)",
    escreveu: "Carta de Judas",
  },
  {
    id: "maria-mae-de-jesus",
    nome: "Maria, mãe de Jesus",
    papel:
      "Jovem de Nazaré escolhida para gerar o Messias; entoou o Magnificat (Lc 1:46-55).",
    referenciasBiblicasChave: ["Lucas 1:26-38", "Lucas 1:46-55"],
    wikipediaTitulo: "Maria, mãe de Jesus",
    ondeViveu: "Nazaré; depois Belém e Egito (fuga); de volta a Nazaré",
    comoMorreu: "Não registrado na Bíblia",
  },
  {
    id: "tome",
    nome: "Tomé",
    papel:
      'Um dos doze apóstolos; duvidou da ressurreição até ver as chagas de Jesus, então o confessou como "Senhor" e "Deus".',
    referenciasBiblicasChave: ["João 20:24-29"],
    wikipediaTitulo: "Tomé (apóstolo)",
    ondeViveu: "Galileia",
    comoMorreu:
      "Não registrado na Bíblia; tradição dos cristãos de São Tomé (Índia) diz que foi martirizado com uma lança perto da atual Chennai",
  },
  {
    id: "estevao",
    nome: "Estêvão",
    papel:
      "Um dos sete primeiros diáconos; primeiro mártir cristão, apedrejado após seu discurso ao Sinédrio.",
    referenciasBiblicasChave: ["Atos 6:8-15", "Atos 7:54-60"],
    wikipediaTitulo: "Estêvão (mártir)",
    ondeViveu: "Jerusalém",
    comoMorreu:
      "Apedrejado em Jerusalém logo após seu discurso ao Sinédrio (Atos 7:54-60) — narrado na própria Bíblia, não é tradição extra-bíblica",
  },
];

const MAPA = new Map<string, Biografia>(LISTA.map((b) => [b.id, b]));

export function obterBiografia(id: string): Biografia | undefined {
  return MAPA.get(id);
}
