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
 */

export interface Biografia {
  id: string;
  nome: string;
  /** Curto — o papel dessa pessoa no texto (não uma biografia completa). */
  papel: string;
  referenciasBiblicasChave: string[];
  /** Título exato do artigo em pt.wikipedia.org, usado por `obterResumoWikipedia`. */
  wikipediaTitulo: string;
}

const LISTA: Biografia[] = [
  {
    id: "jesus",
    nome: "Jesus Cristo",
    papel:
      "O Filho de Deus encarnado; centro da fé cristã e cumprimento das promessas messiânicas do Antigo Testamento.",
    referenciasBiblicasChave: ["João 1:1-14", "Filipenses 2:6-11"],
    wikipediaTitulo: "Jesus",
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
  },
  {
    id: "josue",
    nome: "Josué",
    papel:
      "Sucessor de Moisés; liderou a conquista e divisão da terra prometida.",
    referenciasBiblicasChave: ["Josué 1:1-9", "Josué 24:14-15"],
    wikipediaTitulo: "Josué",
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
  },
  {
    id: "salomao",
    nome: "Salomão",
    papel:
      "Filho de Davi, rei de Israel conhecido pela sabedoria; autor tradicional de Provérbios, Eclesiastes e Cantares.",
    referenciasBiblicasChave: ["1 Reis 3:5-14", "1 Reis 4:29-34"],
    wikipediaTitulo: "Salomão",
  },
  {
    id: "esdras",
    nome: "Esdras",
    papel:
      "Sacerdote e escriba que liderou a reforma espiritual dos judeus após o retorno do exílio babilônico.",
    referenciasBiblicasChave: ["Esdras 7:6-10"],
    wikipediaTitulo: "Esdras",
  },
  {
    id: "neemias",
    nome: "Neemias",
    papel:
      "Copeiro do rei persa que liderou a reconstrução dos muros de Jerusalém.",
    referenciasBiblicasChave: ["Neemias 1:1-4", "Neemias 6:15-16"],
    wikipediaTitulo: "Neemias",
  },
  {
    id: "isaias",
    nome: "Isaías",
    papel:
      "Profeta de Judá; anunciou juízo e a esperança messiânica mais detalhada do Antigo Testamento.",
    referenciasBiblicasChave: ["Isaías 6:1-8", "Isaías 53:1-12"],
    wikipediaTitulo: "Isaías",
  },
  {
    id: "jeremias",
    nome: "Jeremias",
    papel:
      '"Profeta chorão"; ministrou nos últimos anos de Judá antes da queda de Jerusalém.',
    referenciasBiblicasChave: ["Jeremias 1:4-10", "Jeremias 31:31-34"],
    wikipediaTitulo: "Jeremias",
  },
  {
    id: "ezequiel",
    nome: "Ezequiel",
    papel:
      "Sacerdote e profeta que ministrou no exílio babilônico por meio de visões simbólicas.",
    referenciasBiblicasChave: ["Ezequiel 1:1-3", "Ezequiel 37:1-14"],
    wikipediaTitulo: "Ezequiel",
  },
  {
    id: "daniel",
    nome: "Daniel",
    papel:
      "Nobre judeu exilado, fiel nas cortes babilônica e persa; recebeu visões apocalípticas.",
    referenciasBiblicasChave: ["Daniel 1:8-20", "Daniel 6:16-23"],
    wikipediaTitulo: "Daniel (profeta)",
  },
  {
    id: "oseias",
    nome: "Oséias",
    papel:
      "Profeta ao reino do Norte; usou seu próprio casamento como figura da infidelidade de Israel.",
    referenciasBiblicasChave: ["Oséias 1:2-3", "Oséias 3:1"],
    wikipediaTitulo: "Oseias (profeta)",
  },
  {
    id: "joel",
    nome: "Joel",
    papel:
      'Profeta que anunciou o "Dia do Senhor" e o derramamento futuro do Espírito.',
    referenciasBiblicasChave: ["Joel 2:28-32"],
    wikipediaTitulo: "Joel (profeta)",
  },
  {
    id: "amos",
    nome: "Amós",
    papel:
      "Pastor de Tecoa enviado para denunciar a injustiça social no reino do Norte.",
    referenciasBiblicasChave: ["Amós 1:1", "Amós 5:21-24"],
    wikipediaTitulo: "Amós (profeta)",
  },
  {
    id: "obadias",
    nome: "Obadias",
    papel: "Profeta que anunciou o juízo contra Edom.",
    referenciasBiblicasChave: ["Obadias 1:10-14"],
    wikipediaTitulo: "Obadias (profeta)",
  },
  {
    id: "jonas",
    nome: "Jonas",
    papel: "Profeta que fugiu do chamado de pregar a Nínive antes de obedecer.",
    referenciasBiblicasChave: ["Jonas 1:1-3", "Jonas 3:1-10"],
    wikipediaTitulo: "Jonas (profeta)",
  },
  {
    id: "miqueias",
    nome: "Miquéias",
    papel:
      "Contemporâneo de Isaías; anunciou o nascimento do Messias em Belém.",
    referenciasBiblicasChave: ["Miquéias 5:2", "Miquéias 6:8"],
    wikipediaTitulo: "Miqueias",
  },
  {
    id: "naum",
    nome: "Naum",
    papel: "Profeta que anunciou a queda de Nínive.",
    referenciasBiblicasChave: ["Naum 1:1-3"],
    wikipediaTitulo: "Naum (profeta)",
  },
  {
    id: "habacuque",
    nome: "Habacuque",
    papel:
      "Profeta que questionou a Deus sobre o uso da Babilônia para julgar Judá.",
    referenciasBiblicasChave: ["Habacuque 2:4", "Habacuque 3:17-19"],
    wikipediaTitulo: "Habacuque",
  },
  {
    id: "sofonias",
    nome: "Sofonias",
    papel:
      'Profeta no reinado de Josias; anunciou o "Dia do Senhor" e a restauração final.',
    referenciasBiblicasChave: ["Sofonias 1:14-18", "Sofonias 3:17"],
    wikipediaTitulo: "Sofonias (profeta)",
  },
  {
    id: "ageu",
    nome: "Ageu",
    papel:
      "Profeta que exortou os judeus retornados do exílio a reconstruírem o templo.",
    referenciasBiblicasChave: ["Ageu 1:1-11"],
    wikipediaTitulo: "Ageu",
  },
  {
    id: "zacarias",
    nome: "Zacarias",
    papel:
      "Profeta contemporâneo de Ageu; profetizou detalhadamente sobre o Messias.",
    referenciasBiblicasChave: ["Zacarias 9:9"],
    wikipediaTitulo: "Zacarias (profeta)",
  },
  {
    id: "malaquias",
    nome: "Malaquias",
    papel:
      "Último profeta do Antigo Testamento; anunciou o mensageiro que prepararia o caminho do Senhor.",
    referenciasBiblicasChave: ["Malaquias 3:1", "Malaquias 4:5-6"],
    wikipediaTitulo: "Malaquias",
  },
  {
    id: "mateus",
    nome: "Mateus (o apóstolo)",
    papel:
      "Ex-cobrador de impostos (também chamado Levi), um dos doze apóstolos; autor do Evangelho de Mateus.",
    referenciasBiblicasChave: ["Mateus 9:9", "Mateus 10:3"],
    wikipediaTitulo: "Mateus (evangelista)",
  },
  {
    id: "marcos",
    nome: "João Marcos",
    papel:
      "Companheiro de Paulo, Barnabé e Pedro; autor tradicional do Evangelho de Marcos, baseado na pregação de Pedro.",
    referenciasBiblicasChave: ["Atos 12:12", "Atos 12:25", "1 Pedro 5:13"],
    wikipediaTitulo: "João Marcos",
  },
  {
    id: "lucas",
    nome: "Lucas",
    papel:
      "Médico e companheiro de viagem de Paulo; autor do Evangelho de Lucas e de Atos dos Apóstolos.",
    referenciasBiblicasChave: ["Colossenses 4:14", "2 Timóteo 4:11"],
    wikipediaTitulo: "Lucas (evangelista)",
  },
  {
    id: "joao",
    nome: "João (o apóstolo)",
    papel:
      '"O discípulo amado", um dos doze apóstolos; autor do quarto Evangelho, de 1-3 João e do Apocalipse.',
    referenciasBiblicasChave: ["João 21:20-24", "Apocalipse 1:9"],
    wikipediaTitulo: "João (apóstolo)",
  },
  {
    id: "paulo",
    nome: "Paulo",
    papel:
      "Ex-perseguidor da igreja convertido no caminho de Damasco; apóstolo aos gentios, autor de 13 cartas do Novo Testamento.",
    referenciasBiblicasChave: ["Atos 9:1-19", "Atos 22:6-16", "Atos 26:12-18"],
    wikipediaTitulo: "Paulo de Tarso",
  },
  {
    id: "tiago",
    nome: "Tiago (irmão de Jesus)",
    papel:
      "Meio-irmão de Jesus, líder da igreja de Jerusalém; autor da carta de Tiago.",
    referenciasBiblicasChave: ["Mateus 13:55", "Atos 15:13-21", "Gálatas 1:19"],
    wikipediaTitulo: "Tiago, irmão de Jesus",
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
  },
  {
    id: "judas-irmao-de-jesus",
    nome: "Judas (irmão de Jesus)",
    papel: "Meio-irmão de Jesus e de Tiago; autor da carta de Judas.",
    referenciasBiblicasChave: ["Mateus 13:55", "Judas 1:1"],
    wikipediaTitulo: "Judas (irmão de Jesus)",
  },
  {
    id: "maria-mae-de-jesus",
    nome: "Maria, mãe de Jesus",
    papel:
      "Jovem de Nazaré escolhida para gerar o Messias; entoou o Magnificat (Lc 1:46-55).",
    referenciasBiblicasChave: ["Lucas 1:26-38", "Lucas 1:46-55"],
    wikipediaTitulo: "Maria, mãe de Jesus",
  },
  {
    id: "tome",
    nome: "Tomé",
    papel:
      'Um dos doze apóstolos; duvidou da ressurreição até ver as chagas de Jesus, então o confessou como "Senhor" e "Deus".',
    referenciasBiblicasChave: ["João 20:24-29"],
    wikipediaTitulo: "Tomé (apóstolo)",
  },
  {
    id: "estevao",
    nome: "Estêvão",
    papel:
      "Um dos sete primeiros diáconos; primeiro mártir cristão, apedrejado após seu discurso ao Sinédrio.",
    referenciasBiblicasChave: ["Atos 6:8-15", "Atos 7:54-60"],
    wikipediaTitulo: "Estêvão (mártir)",
  },
];

const MAPA = new Map<string, Biografia>(LISTA.map((b) => [b.id, b]));

export function obterBiografia(id: string): Biografia | undefined {
  return MAPA.get(id);
}
