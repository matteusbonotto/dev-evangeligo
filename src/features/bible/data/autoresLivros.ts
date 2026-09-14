/**
 * Autor/contexto de cada um dos 66 livros — Tier A de "quem fala" (T-041/
 * ADR-036), pedido explícito do usuário: "quero uma possibilidade de
 * identificar quem está falando na biblia... tipo um icone de informações,
 * com detalhes do tipo, contexto, cultura, lingua original, escritor". Ao
 * contrário de `data/falasEspeciais.ts` (fala de Jesus/Deus DENTRO do
 * texto), este arquivo é sobre quem ESCREVEU o livro — sempre disponível,
 * qualquer versículo de qualquer livro tem uma entrada aqui.
 *
 * Autoria/datação seguem a posição tradicional/conservadora (consistente
 * com a hermenêutica reformada do projeto — Sola Scriptura, alta visão de
 * inspiração — ver `IA/agents/teologia-reformada.md`), não a hipótese
 * documentária ou datações tardias da crítica histórica liberal. Quando a
 * autoria é genuinamente incerta mesmo na tradição conservadora (Jó,
 * Ester, Hebreus, Juízes/Rute), isso é dito explicitamente em vez de
 * forçar um nome — `autorId` fica de fora nesses casos (sem biografia
 * "confirmada" para alguém que não temos certeza de que existiu daquele
 * jeito). Pendente validação doutrinária formal pelo agente
 * `teologia-reformada`, mesmo padrão de pendência de ADR-007/ADR-032.
 */

export interface InfoLivro {
  codigo: string;
  autor: string;
  /** Referencia `Biografia.id` (`../data/biografias.ts`) só quando o autor tem biografia própria curada. */
  autorId?: string;
  periodoAproximado: string;
  idiomaOriginal: "Hebraico" | "Aramaico" | "Hebraico e Aramaico" | "Grego";
  genero: string;
  contextoHistoricoCultural: string;
}

const LISTA: InfoLivro[] = [
  {
    codigo: "GEN",
    autor: "Moisés",
    autorId: "moises",
    periodoAproximado: "Composto durante o Êxodo, c. 1446-1406 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Lei (Pentateuco) — narrativa das origens",
    contextoHistoricoCultural:
      "Escrito para o povo de Israel recém-saído do Egito, explicando a criação, a queda, o dilúvio e as origens dos patriarcas (Abraão, Isaque, Jacó, José) como fundamento da identidade e da aliança de Israel com Deus.",
  },
  {
    codigo: "EXO",
    autor: "Moisés",
    autorId: "moises",
    periodoAproximado: "c. 1446-1406 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Lei (Pentateuco) — narrativa e legislação",
    contextoHistoricoCultural:
      "Relata a libertação de Israel da escravidão no Egito, a travessia do Mar Vermelho e o estabelecimento da aliança do Sinai — o evento fundador da nação de Israel.",
  },
  {
    codigo: "LEV",
    autor: "Moisés",
    autorId: "moises",
    periodoAproximado: "c. 1446-1406 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Lei (Pentateuco) — código sacerdotal",
    contextoHistoricoCultural:
      "Manual sacerdotal para o culto no tabernáculo recém-construído: sacrifícios, pureza ritual e santidade — como um povo liberto do Egito deveria viver em comunhão com um Deus santo.",
  },
  {
    codigo: "NUM",
    autor: "Moisés",
    autorId: "moises",
    periodoAproximado: "c. 1446-1406 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Lei (Pentateuco) — narrativa e censo",
    contextoHistoricoCultural:
      "Cobre os 40 anos de peregrinação de Israel no deserto entre o Sinai e as planícies de Moabe, incluindo a rebelião que adiou a entrada na terra prometida.",
  },
  {
    codigo: "DEU",
    autor: "Moisés",
    autorId: "moises",
    periodoAproximado: "c. 1406 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Lei (Pentateuco) — discursos de despedida",
    contextoHistoricoCultural:
      "Últimos discursos de Moisés à nova geração de Israel, nas planícies de Moabe, renovando a aliança antes da entrada na terra prometida sob a liderança de Josué.",
  },
  {
    codigo: "JOS",
    autor: "Josué",
    autorId: "josue",
    periodoAproximado: "c. 1400-1370 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Histórico",
    contextoHistoricoCultural:
      "Narra a conquista e a divisão da terra de Canaã entre as 12 tribos de Israel, sob a liderança de Josué, sucessor de Moisés.",
  },
  {
    codigo: "JDG",
    autor: "Desconhecido (tradição judaica antiga sugere Samuel)",
    periodoAproximado: "c. 1050-1000 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Histórico",
    contextoHistoricoCultural:
      "Cobre o período caótico entre Josué e a monarquia, marcado pelo ciclo de pecado-opressão-clamor-libertação através de juízes como Débora, Gideão e Sansão.",
  },
  {
    codigo: "RUT",
    autor: "Desconhecido (tradição judaica antiga sugere Samuel)",
    periodoAproximado: "c. 1000 a.C. (narra eventos do período dos juízes)",
    idiomaOriginal: "Hebraico",
    genero: "Histórico — narrativa curta",
    contextoHistoricoCultural:
      "História de lealdade e redenção de uma mulher moabita que se torna bisavó do rei Davi, mostrando a inclusão de estrangeiros fiéis no povo de Deus.",
  },
  {
    codigo: "1SA",
    autor: "Desconhecido (tradição judaica antiga sugere Samuel/Natã/Gade)",
    periodoAproximado: "c. 1000-900 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Histórico",
    contextoHistoricoCultural:
      "Narra a transição de Israel dos juízes para a monarquia: o profeta Samuel, o rei Saul e a ascensão de Davi.",
  },
  {
    codigo: "2SA",
    autor: "Desconhecido (tradição judaica antiga sugere Natã/Gade)",
    periodoAproximado: "c. 950-900 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Histórico",
    contextoHistoricoCultural:
      "O reinado de Davi: suas vitórias, a aliança davídica (2 Sm 7) e suas falhas morais (Bate-Seba), com consequências para toda a sua casa.",
  },
  {
    codigo: "1KI",
    autor: "Desconhecido (tradição judaica antiga sugere Jeremias)",
    periodoAproximado: "c. 560-540 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Histórico",
    contextoHistoricoCultural:
      "Do apogeu do reinado de Salomão (templo de Jerusalém) até a divisão do reino em Israel (norte) e Judá (sul) e o ministério de Elias.",
  },
  {
    codigo: "2KI",
    autor: "Desconhecido (tradição judaica antiga sugere Jeremias)",
    periodoAproximado: "c. 560-540 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Histórico",
    contextoHistoricoCultural:
      "A decadência espiritual dos dois reinos, culminando na queda de Israel para a Assíria (722 a.C.) e de Judá para a Babilônia (586 a.C.).",
  },
  {
    codigo: "1CH",
    autor: "Esdras (tradicional)",
    autorId: "esdras",
    periodoAproximado: "c. 450-400 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Histórico — genealógico",
    contextoHistoricoCultural:
      "Reconta a história de Israel desde Adão até Davi através de genealogias e do reinado de Davi, escrito para o povo que retornou do exílio reconectar-se com sua identidade e o culto no templo.",
  },
  {
    codigo: "2CH",
    autor: "Esdras (tradicional)",
    autorId: "esdras",
    periodoAproximado: "c. 450-400 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Histórico",
    contextoHistoricoCultural:
      "Reconta o reinado de Salomão até o exílio babilônico, com foco no templo e na dinastia davídica, encerrando com o decreto de Ciro permitindo o retorno.",
  },
  {
    codigo: "EZR",
    autor: "Esdras",
    autorId: "esdras",
    periodoAproximado: "c. 460-440 a.C.",
    idiomaOriginal: "Hebraico e Aramaico",
    genero: "Histórico",
    contextoHistoricoCultural:
      "O retorno do exílio babilônico e a reconstrução do templo de Jerusalém, e a reforma espiritual liderada pelo sacerdote-escriba Esdras.",
  },
  {
    codigo: "NEH",
    autor: "Neemias",
    autorId: "neemias",
    periodoAproximado: "c. 430-400 a.C.",
    idiomaOriginal: "Hebraico e Aramaico",
    genero: "Histórico — memórias pessoais",
    contextoHistoricoCultural:
      "A reconstrução dos muros de Jerusalém liderada por Neemias, copeiro do rei persa, e a renovação da aliança sob a liderança conjunta com Esdras.",
  },
  {
    codigo: "EST",
    autor: "Desconhecido",
    periodoAproximado: "c. 470-460 a.C. (narra eventos no império persa)",
    idiomaOriginal: "Hebraico",
    genero: "Histórico — narrativa",
    contextoHistoricoCultural:
      "Uma judia torna-se rainha da Pérsia e intervém para salvar seu povo de um extermínio planejado — o único livro do AT que não menciona o nome de Deus diretamente, mostrando sua providência oculta.",
  },
  {
    codigo: "JOB",
    autor: "Desconhecido",
    periodoAproximado:
      "Incerto — narra eventos possivelmente do tempo dos patriarcas",
    idiomaOriginal: "Hebraico",
    genero: "Poético — sapiencial",
    contextoHistoricoCultural:
      "Debate poético sobre o sofrimento do justo e a soberania de Deus diante do mal, culminando na resposta de Deus a Jó desde o meio da tempestade (Jó 38-41).",
  },
  {
    codigo: "PSA",
    autor: "Diversos salmistas (principalmente Davi)",
    autorId: "davi",
    periodoAproximado:
      "c. 1400-400 a.C. (coletânea composta ao longo de séculos)",
    idiomaOriginal: "Hebraico",
    genero: "Poético — hinos e orações",
    contextoHistoricoCultural:
      "Coletânea de 150 hinos, lamentos e orações usados no culto de Israel, atribuídos a vários autores (Davi, Asafe, os filhos de Corá, Salomão, Moisés e outros).",
  },
  {
    codigo: "PRO",
    autor: "Salomão (principal) e outros sábios",
    autorId: "salomao",
    periodoAproximado: "c. 970-700 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Poético — sapiencial",
    contextoHistoricoCultural:
      "Coletânea de provérbios práticos para viver com sabedoria e temor do Senhor, atribuída principalmente a Salomão, com seções finais de outros sábios.",
  },
  {
    codigo: "ECC",
    autor: "Salomão (tradicional)",
    autorId: "salomao",
    periodoAproximado: "c. 940-930 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Poético — sapiencial/reflexivo",
    contextoHistoricoCultural:
      'Reflexão de "o Pregador" sobre a vaidade da vida vivida "debaixo do sol" (sem referência a Deus), concluindo que temer a Deus e guardar seus mandamentos é o dever de todo ser humano.',
  },
  {
    codigo: "SNG",
    autor: "Salomão (tradicional)",
    autorId: "salomao",
    periodoAproximado: "c. 970-930 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Poético — poema de amor",
    contextoHistoricoCultural:
      "Poema lírico celebrando o amor conjugal, lido na tradição reformada tanto em seu sentido literal quanto como figura do amor de Cristo pela igreja.",
  },
  {
    codigo: "ISA",
    autor: "Isaías",
    autorId: "isaias",
    periodoAproximado: "c. 740-680 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (maior)",
    contextoHistoricoCultural:
      "Ministrou em Judá durante a ascensão da Assíria, anunciando juízo pela idolatria e injustiça, mas também consolo e a esperança messiânica mais detalhada do AT (Is 53).",
  },
  {
    codigo: "JER",
    autor: "Jeremias",
    autorId: "jeremias",
    periodoAproximado: "c. 627-580 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (maior)",
    contextoHistoricoCultural:
      'O "profeta chorão" ministrou nos últimos anos de Judá antes da queda de Jerusalém para a Babilônia (586 a.C.), anunciando o juízo iminente e a nova aliança (Jr 31).',
  },
  {
    codigo: "LAM",
    autor: "Jeremias (tradicional)",
    autorId: "jeremias",
    periodoAproximado: "c. 586 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Poético — lamento",
    contextoHistoricoCultural:
      "Cinco poemas lamentando a destruição de Jerusalém e do templo pelos babilônios, expressando luto profundo sem perder a esperança na fidelidade de Deus (Lm 3:22-23).",
  },
  {
    codigo: "EZK",
    autor: "Ezequiel",
    autorId: "ezequiel",
    periodoAproximado: "c. 593-571 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (maior)",
    contextoHistoricoCultural:
      "Sacerdote levado ao exílio na Babilônia, profetizou ali por meio de visões (a glória de Deus, o vale de ossos secos) sobre o juízo e a restauração futura de Israel.",
  },
  {
    codigo: "DAN",
    autor: "Daniel",
    autorId: "daniel",
    periodoAproximado: "c. 605-535 a.C.",
    idiomaOriginal: "Hebraico e Aramaico",
    genero: "Profético — apocalíptico",
    contextoHistoricoCultural:
      "Nobre judeu exilado que serviu em cargos de destaque nas cortes babilônica e persa, registrando tanto narrativas de fidelidade (a cova dos leões) quanto visões apocalípticas sobre os impérios futuros.",
  },
  {
    codigo: "HOS",
    autor: "Oséias",
    autorId: "oseias",
    periodoAproximado: "c. 755-715 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor)",
    contextoHistoricoCultural:
      "Profetizou ao reino do Norte (Israel) pouco antes de sua queda, usando seu próprio casamento com uma mulher infiel como figura viva da infidelidade de Israel e do amor perseverante de Deus.",
  },
  {
    codigo: "JOL",
    autor: "Joel",
    autorId: "joel",
    periodoAproximado: "Incerto — possivelmente c. 835 a.C. ou pós-exílio",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor)",
    contextoHistoricoCultural:
      'Usa uma praga de gafanhotos como figura do "Dia do Senhor", chamando à contrição e prometendo o derramamento do Espírito (Jl 2:28-32, citado em Atos 2).',
  },
  {
    codigo: "AMO",
    autor: "Amós",
    autorId: "amos",
    periodoAproximado: "c. 760-750 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor)",
    contextoHistoricoCultural:
      "Pastor de Tecoa (Judá) enviado para profetizar contra a injustiça social e a hipocrisia religiosa no próspero, mas corrupto, reino do Norte.",
  },
  {
    codigo: "OBA",
    autor: "Obadias",
    autorId: "obadias",
    periodoAproximado: "Incerto — possivelmente logo após 586 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor) — o mais curto do AT",
    contextoHistoricoCultural:
      'Anuncia o juízo contra Edom por sua hostilidade e cumplicidade na queda de Jerusalém, afirmando que "o reino será do Senhor" (Ob 21).',
  },
  {
    codigo: "JON",
    autor: "Jonas",
    autorId: "jonas",
    periodoAproximado: "c. 780-750 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor) — narrativa",
    contextoHistoricoCultural:
      "Profeta que fugiu do chamado de pregar a Nínive (capital assíria, inimiga de Israel), sendo engolido por um grande peixe, e depois ressentido com a misericórdia de Deus para com os ninivitas arrependidos.",
  },
  {
    codigo: "MIC",
    autor: "Miquéias",
    autorId: "miqueias",
    periodoAproximado: "c. 735-700 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor)",
    contextoHistoricoCultural:
      "Contemporâneo de Isaías, profetizou contra a injustiça social em Judá e anunciou que o Messias nasceria em Belém (Mq 5:2, citado em Mt 2:6).",
  },
  {
    codigo: "NAH",
    autor: "Naum",
    autorId: "naum",
    periodoAproximado: "c. 663-612 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor)",
    contextoHistoricoCultural:
      "Anuncia a queda iminente de Nínive (capital assíria) como juízo de Deus contra sua crueldade — cumprida em 612 a.C.",
  },
  {
    codigo: "HAB",
    autor: "Habacuque",
    autorId: "habacuque",
    periodoAproximado: "c. 609-598 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor) — diálogo",
    contextoHistoricoCultural:
      'Profeta que questiona a Deus sobre usar a violenta Babilônia para julgar Judá, concluindo com a afirmação de fé "o justo viverá pela sua fé" (Hc 2:4, citado em Rm 1:17).',
  },
  {
    codigo: "ZEP",
    autor: "Sofonias",
    autorId: "sofonias",
    periodoAproximado: "c. 640-609 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor)",
    contextoHistoricoCultural:
      'Profetizou durante o reinado de Josias em Judá, anunciando o "Dia do Senhor" como juízo universal, mas terminando com a promessa de restauração e alegria (Sf 3:17).',
  },
  {
    codigo: "HAG",
    autor: "Ageu",
    autorId: "ageu",
    periodoAproximado: "520 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor)",
    contextoHistoricoCultural:
      "Exortou os judeus recém-retornados do exílio a retomarem a construção do templo, interrompida por 16 anos de desânimo e oposição.",
  },
  {
    codigo: "ZEC",
    autor: "Zacarias",
    autorId: "zacarias",
    periodoAproximado: "c. 520-480 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor) — apocalíptico",
    contextoHistoricoCultural:
      "Contemporâneo de Ageu, encorajou a reconstrução do templo com visões noturnas e profecias messiânicas detalhadas (o rei manso montado num jumentinho, Zc 9:9, citado em Mt 21:5).",
  },
  {
    codigo: "MAL",
    autor: "Malaquias",
    autorId: "malaquias",
    periodoAproximado: "c. 460-430 a.C.",
    idiomaOriginal: "Hebraico",
    genero: "Profético (menor) — último do AT",
    contextoHistoricoCultural:
      "Último profeta do AT, repreendeu o povo e os sacerdotes por negligência espiritual, e anunciou a vinda de um mensageiro que prepararia o caminho do Senhor (Ml 3:1, cumprido em João Batista).",
  },
  {
    codigo: "MAT",
    autor: "Mateus (o apóstolo, também chamado Levi)",
    autorId: "mateus",
    periodoAproximado: "c. 50-70 d.C.",
    idiomaOriginal: "Grego",
    genero: "Evangelho",
    contextoHistoricoCultural:
      "Escrito primariamente para leitores de origem judaica, enfatiza como Jesus cumpre as profecias do Antigo Testamento e é o Rei messiânico prometido, organizando o ensino de Jesus em 5 grandes discursos.",
  },
  {
    codigo: "MRK",
    autor: "João Marcos",
    autorId: "marcos",
    periodoAproximado: "c. 55-65 d.C.",
    idiomaOriginal: "Grego",
    genero: "Evangelho",
    contextoHistoricoCultural:
      "O evangelho mais curto e de ritmo mais rápido, tradicionalmente baseado na pregação do apóstolo Pedro em Roma, apresenta Jesus como o Servo sofredor que age e cumpre sua missão até a cruz.",
  },
  {
    codigo: "LUK",
    autor: "Lucas",
    autorId: "lucas",
    periodoAproximado: "c. 60-62 d.C.",
    idiomaOriginal: "Grego",
    genero: "Evangelho — pesquisa histórica",
    contextoHistoricoCultural:
      "Médico e companheiro de viagem de Paulo, escreveu um relato historiográfico cuidadoso (Lc 1:1-4) dirigido a Teófilo, com atenção especial aos pobres, às mulheres e aos marginalizados alcançados por Jesus.",
  },
  {
    codigo: "JHN",
    autor: 'João (o apóstolo, "o discípulo amado")',
    autorId: "joao",
    periodoAproximado: "c. 85-95 d.C.",
    idiomaOriginal: "Grego",
    genero: "Evangelho — teológico",
    contextoHistoricoCultural:
      'Escrito mais tarde que os outros três evangelhos, com propósito declarado explícito (Jo 20:31): que os leitores creiam que Jesus é o Cristo, o Filho de Deus, organizado em torno de 7 "sinais" e longos discursos.',
  },
  {
    codigo: "ACT",
    autor: "Lucas",
    autorId: "lucas",
    periodoAproximado: "c. 62-64 d.C.",
    idiomaOriginal: "Grego",
    genero: "Histórico",
    contextoHistoricoCultural:
      "Continuação do Evangelho de Lucas, narra a expansão da igreja de Jerusalém até Roma pelo poder do Espírito Santo, do Pentecostes às viagens missionárias de Paulo.",
  },
  {
    codigo: "ROM",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 57 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — doutrinária",
    contextoHistoricoCultural:
      "Escrita de Corinto a uma igreja que Paulo ainda não tinha visitado, é a exposição mais sistemática do evangelho no NT — pecado, justificação pela fé, santificação e a soberania de Deus na eleição (Rm 9-11) — base fundamental da teologia reformada.",
  },
  {
    codigo: "1CO",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 53-54 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pastoral/corretiva",
    contextoHistoricoCultural:
      "Escrita para corrigir divisões, imoralidade e abusos na Ceia do Senhor numa igreja em Corinto, cidade portuária greco-romana conhecida por sua riqueza e imoralidade.",
  },
  {
    codigo: "2CO",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 55-56 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pessoal/apologética",
    contextoHistoricoCultural:
      "A mais pessoal das cartas de Paulo, defendendo seu apostolado contra falsos mestres em Corinto e descrevendo seus próprios sofrimentos pelo evangelho.",
  },
  {
    codigo: "GAL",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 48-55 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — doutrinária/polêmica",
    contextoHistoricoCultural:
      "Escrita contra mestres judaizantes que exigiam a circuncisão dos gentios convertidos, defendendo com veemência a justificação pela fé somente, sem as obras da lei.",
  },
  {
    codigo: "EPH",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 60-62 d.C. (prisão em Roma)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — doutrinária",
    contextoHistoricoCultural:
      "Escrita da prisão, celebra o plano eterno de Deus de unir judeus e gentios em um só corpo (a igreja) e descreve a Armadura de Deus (Ef 6:10-18) para a batalha espiritual.",
  },
  {
    codigo: "PHP",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 60-62 d.C. (prisão em Roma)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pessoal/afetuosa",
    contextoHistoricoCultural:
      "Carta de gratidão e alegria à igreja de Filipos apesar da prisão de Paulo, com o hino cristológico da humilhação e exaltação de Cristo (Fp 2:6-11).",
  },
  {
    codigo: "COL",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 60-62 d.C. (prisão em Roma)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — doutrinária/corretiva",
    contextoHistoricoCultural:
      "Combate um sincretismo filosófico-religioso ameaçando a igreja de Colossos, exaltando a supremacia e suficiência absolutas de Cristo (Cl 1:15-20).",
  },
  {
    codigo: "1TH",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado:
      "c. 50-51 d.C. (provavelmente a carta mais antiga de Paulo)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pastoral",
    contextoHistoricoCultural:
      "Escrita pouco depois de fundar a igreja de Tessalônica, encoraja os cristãos perseguidos e esclarece dúvidas sobre a volta de Cristo e os que já morreram.",
  },
  {
    codigo: "2TH",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 51-52 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pastoral/corretiva",
    contextoHistoricoCultural:
      'Corrige um ensino falso de que o "Dia do Senhor" já teria chegado, e exorta contra a ociosidade na expectativa da volta de Cristo.',
  },
  {
    codigo: "1TI",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 62-64 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pastoral",
    contextoHistoricoCultural:
      'Uma das "cartas pastorais", instrui Timóteo, jovem líder da igreja em Éfeso, sobre organização eclesiástica, qualificações de líderes e combate a falsos ensinos.',
  },
  {
    codigo: "2TI",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 66-67 d.C. (pouco antes da morte de Paulo)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pessoal/testamentária",
    contextoHistoricoCultural:
      'Última carta de Paulo, escrita da prisão em Roma pouco antes de seu martírio, exortando Timóteo a perseverar fielmente e "guardar o bom depósito" da fé.',
  },
  {
    codigo: "TIT",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 62-64 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pastoral",
    contextoHistoricoCultural:
      "Instrui Tito, deixado para organizar as igrejas em Creta, sobre a nomeação de presbíteros e a relação entre a graça de Deus e as boas obras.",
  },
  {
    codigo: "PHM",
    autor: "Paulo",
    autorId: "paulo",
    periodoAproximado: "c. 60-62 d.C. (prisão em Roma)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pessoal, a mais curta de Paulo",
    contextoHistoricoCultural:
      'Apelo pessoal a Filemom para receber de volta seu escravo fugitivo Onésimo, agora convertido, "não mais como escravo, mas... como irmão amado" (Fm 16).',
  },
  {
    codigo: "HEB",
    autor: "Desconhecido (tradicionalmente associado a Paulo, sem consenso)",
    periodoAproximado: "Antes de 70 d.C. (o templo ainda estava de pé)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — sermão doutrinário",
    contextoHistoricoCultural:
      "Escrita a cristãos de origem judaica tentados a voltar ao judaísmo sob pressão, argumenta a superioridade absoluta de Cristo sobre anjos, Moisés e o sistema sacrificial levítico.",
  },
  {
    codigo: "JAS",
    autor: "Tiago (irmão de Jesus, líder da igreja de Jerusalém)",
    autorId: "tiago",
    periodoAproximado:
      "c. 44-49 d.C. (possivelmente a carta mais antiga do NT)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — sapiencial/prática",
    contextoHistoricoCultural:
      "Carta prática e direta, no estilo da literatura de sabedoria do AT, sobre como a fé genuína se prova em obras concretas — provações, favoritismo, controle da língua, cuidado com os pobres.",
  },
  {
    codigo: "1PE",
    autor: "Pedro",
    autorId: "pedro",
    periodoAproximado: "c. 62-64 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pastoral",
    contextoHistoricoCultural:
      "Escrita a cristãos espalhados pela Ásia Menor enfrentando perseguição e sofrimento, encorajando-os com a esperança viva da ressurreição de Cristo e o exemplo do próprio sofrimento de Cristo.",
  },
  {
    codigo: "2PE",
    autor: "Pedro",
    autorId: "pedro",
    periodoAproximado: "c. 65-68 d.C. (pouco antes da morte de Pedro)",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — testamentária/corretiva",
    contextoHistoricoCultural:
      "Escrita perto do fim da vida de Pedro, adverte contra falsos mestres e zombadores que negavam a volta de Cristo, afirmando a certeza da promessa divina.",
  },
  {
    codigo: "1JN",
    autor: "João (o apóstolo)",
    autorId: "joao",
    periodoAproximado: "c. 85-95 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pastoral/doutrinária",
    contextoHistoricoCultural:
      "Combate um proto-gnosticismo que negava a humanidade real de Cristo, dando testes práticos (obediência, amor fraternal, doutrina correta) para discernir a fé genuína.",
  },
  {
    codigo: "2JN",
    autor: "João (o apóstolo)",
    autorId: "joao",
    periodoAproximado: "c. 85-95 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pessoal, muito curta",
    contextoHistoricoCultural:
      'Bilhete de advertência a uma "senhora eleita" (uma igreja local, provavelmente) para não receber falsos mestres itinerantes que negavam a encarnação de Cristo.',
  },
  {
    codigo: "3JN",
    autor: "João (o apóstolo)",
    autorId: "joao",
    periodoAproximado: "c. 85-95 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — pessoal, a mais curta do NT",
    contextoHistoricoCultural:
      "Bilhete pessoal a Gaio, elogiando sua hospitalidade a missionários itinerantes, em contraste com a atitude autoritária e inospitaleira de Diótrefes.",
  },
  {
    codigo: "JUD",
    autor: "Judas (irmão de Jesus e de Tiago)",
    autorId: "judas-irmao-de-jesus",
    periodoAproximado: "c. 65-80 d.C.",
    idiomaOriginal: "Grego",
    genero: "Carta (epístola) — polêmica",
    contextoHistoricoCultural:
      "Carta curta e vigorosa contra falsos mestres que infiltravam as igrejas pervertendo a graça de Deus em libertinagem, terminando com a conhecida doxologia (Jd 24-25).",
  },
  {
    codigo: "REV",
    autor: "João (o apóstolo)",
    autorId: "joao",
    periodoAproximado: "c. 95 d.C. (reinado de Domiciano)",
    idiomaOriginal: "Grego",
    genero: "Apocalíptico — profético",
    contextoHistoricoCultural:
      "Escrito por João exilado na ilha de Patmos, revela em linguagem simbólica a vitória final de Cristo sobre o mal, para encorajar igrejas sob perseguição a perseverarem até o fim.",
  },
];

const MAPA = new Map<string, InfoLivro>(
  LISTA.map((info) => [info.codigo, info]),
);

export function obterInfoLivro(codigo: string): InfoLivro | undefined {
  return MAPA.get(codigo.toUpperCase());
}
