// ======================================================
// NZAJI
// DASHBOARD DO PROTÓTIPO
// LEITURA ONLINE VIA THINGSPEAK
// ======================================================


// ======================================================
// CONFIGURAÇÕES
// ======================================================

const CAPACIDADE_PROTOTIPO = 6.0;
const LIMITE_ENCHIMENTO = 90;

const CHANNEL_ID = "3480939";

const URL_THINGSPEAK =
    "https://api.thingspeak.com/channels/" +
    CHANNEL_ID +
    "/feeds.json?results=1";


// Guarda o último registo recebido para não duplicar
// pontos no histórico.
let ultimoEntryId = null;


// ======================================================
// GRÁFICO
// ======================================================

const graph =
    document.getElementById("graph");

const canvas =
    document.createElement("canvas");

canvas.width = 1100;
canvas.height = 340;

graph.appendChild(canvas);

const ctx =
    canvas.getContext("2d");


let historicoConsumo = [];
let historicoHora = [];
let historicoNivel = [];

const MAX_PONTOS = 10;


// ======================================================
// BLOQUEIO DO SLIDER NO PROTÓTIPO REAL
// ======================================================

function atualizarBloqueioNivel() {

    const seletor =
        document.getElementById(
            "reservatorioSelect"
        );

    const slider =
        document.getElementById(
            "nivelInput"
        );

    const prototipoReal =
        seletor.value === "prototipo";

    slider.disabled =
        prototipoReal;

    slider.style.opacity =
        "1";

    slider.style.cursor =
        prototipoReal
            ? "not-allowed"
            : "pointer";

    slider.title =
        prototipoReal
            ? "Leitura em tempo real — controlada pelo NZAJI Cloud"
            : "Arraste para simular o nível do reservatório";
}


// ======================================================
// DESENHAR GRÁFICO
// ======================================================

function desenharGrafico() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.font =
        "bold 28px Arial";

    ctx.fillStyle =
        "#333";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "Histórico de Consumo",
        canvas.width / 2,
        34
    );

    if (
        historicoConsumo.length < 2
    ) {

        ctx.font =
            "18px Arial";

        ctx.fillStyle =
            "#777";

        ctx.fillText(
            "A recolher dados reais do NZAJI...",
            canvas.width / 2,
            170
        );

        return;
    }

    const margemEsquerda = 85;
    const margemDireita = 1030;

    const topo = 65;
    const base = 245;


    // --------------------------------------------------
    // EIXOS
    // --------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(
        margemEsquerda,
        topo
    );

    ctx.lineTo(
        margemEsquerda,
        base
    );

    ctx.lineTo(
        margemDireita,
        base
    );

    ctx.strokeStyle =
        "#555";

    ctx.lineWidth =
        2;

    ctx.stroke();


    // --------------------------------------------------
    // ESCALA DO GRÁFICO
    // --------------------------------------------------

    let maxConsumo =
        Math.max(
            ...historicoConsumo,
            0.1
        );

    maxConsumo =
        maxConsumo * 1.2;


    // --------------------------------------------------
    // LINHAS HORIZONTAIS
    // --------------------------------------------------

    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            topo +
            i *
            ((base - topo) / 4);

        const valor =
            maxConsumo -
            (
                maxConsumo *
                i /
                4
            );

        ctx.beginPath();

        ctx.moveTo(
            margemEsquerda,
            y
        );

        ctx.lineTo(
            margemDireita,
            y
        );

        ctx.strokeStyle =
            "#dddddd";

        ctx.lineWidth =
            1;

        ctx.stroke();

        ctx.font =
            "13px Arial";

        ctx.fillStyle =
            "#555";

        ctx.textAlign =
            "right";

        ctx.fillText(
            valor.toFixed(2) + " L",
            75,
            y + 5
        );
    }


    // --------------------------------------------------
    // LINHA DO GRÁFICO
    // --------------------------------------------------

    ctx.beginPath();

    historicoConsumo.forEach(
        (valor, index) => {

            const largura =
                margemDireita -
                margemEsquerda;

            const x =
                margemEsquerda +
                (
                    index /
                    (
                        historicoConsumo.length - 1
                    )
                ) *
                largura;

            const alturaUtil =
                base -
                topo;

            const y =
                base -
                (
                    valor /
                    maxConsumo
                ) *
                alturaUtil;

            if (
                index === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );
            }

            else {

                ctx.lineTo(
                    x,
                    y
                );
            }
        }
    );

    ctx.strokeStyle =
        "#2d7ef7";

    ctx.lineWidth =
        4;

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";

    ctx.stroke();


    // --------------------------------------------------
    // PONTOS E HORAS
    // --------------------------------------------------

    historicoConsumo.forEach(
        (valor, index) => {

            const largura =
                margemDireita -
                margemEsquerda;

            const x =
                margemEsquerda +
                (
                    index /
                    (
                        historicoConsumo.length - 1
                    )
                ) *
                largura;

            const alturaUtil =
                base -
                topo;

            const y =
                base -
                (
                    valor /
                    maxConsumo
                ) *
                alturaUtil;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#2d7ef7";

            ctx.fill();

            ctx.font =
                "12px Arial";

            ctx.fillStyle =
                "#333";

            ctx.textAlign =
                "center";

            ctx.fillText(
                historicoHora[index],
                x,
                270
            );
        }
    );
}


desenharGrafico();


// ======================================================
// DATA E HORA
// ======================================================

function atualizarHora() {

    const agora =
        new Date();

    const data =
        agora.toLocaleDateString(
            "pt-PT"
        );

    const hora =
        agora.toLocaleTimeString(
            "pt-PT"
        );

    document.getElementById(
        "updateTime"
    ).innerHTML =
        "🟢 Atualizado: " +
        data +
        " | " +
        hora;
}


atualizarHora();


setInterval(
    atualizarHora,
    1000
);


// ======================================================
// FORMATAÇÃO VISUAL
// ======================================================

function formatarTextoSistema(valor) {

    const textos = {

        AUTOMATICO:
            "Automático",

        MANUAL:
            "Manual",

        CRITICO:
            "Crítico",

        BAIXO:
            "Baixo",

        NORMAL:
            "Normal",

        ALTO:
            "Alto",

        LIGADO:
            "Ligado",

        DESLIGADO:
            "Desligado"
    };

    return (
        textos[valor] ||
        valor
    );
}


// ======================================================
// CORES DINÂMICAS
// ======================================================

function aplicarEstadoVisual(
    estado,
    enchimento
) {

    const estadoReservatorio =
        document.getElementById(
            "estadoReservatorio"
        );

    const estadoEnchimento =
        document.getElementById(
            "estadoEnchimento"
        );

    const estadoGeral =
        document.getElementById(
            "estadoGeral"
        );

    estadoReservatorio.classList.remove(
        "estado-critico",
        "estado-baixo",
        "estado-normal",
        "estado-alto"
    );

    estadoEnchimento.classList.remove(
        "enchimento-ligado",
        "enchimento-desligado"
    );

    estadoGeral.classList.remove(
        "estado-geral-critico",
        "estado-geral-atencao",
        "estado-geral-normal",
        "estado-geral-estavel"
    );

    if (
        estado === "CRITICO"
    ) {

        estadoReservatorio.classList.add(
            "estado-critico"
        );

        estadoGeral.classList.add(
            "estado-geral-critico"
        );
    }

    else if (
        estado === "BAIXO"
    ) {

        estadoReservatorio.classList.add(
            "estado-baixo"
        );

        estadoGeral.classList.add(
            "estado-geral-atencao"
        );
    }

    else if (
        estado === "NORMAL"
    ) {

        estadoReservatorio.classList.add(
            "estado-normal"
        );

        estadoGeral.classList.add(
            "estado-geral-normal"
        );
    }

    else if (
        estado === "ALTO"
    ) {

        estadoReservatorio.classList.add(
            "estado-alto"
        );

        estadoGeral.classList.add(
            "estado-geral-estavel"
        );
    }

    if (
        enchimento === "LIGADO"
    ) {

        estadoEnchimento.classList.add(
            "enchimento-ligado"
        );
    }

    else {

        estadoEnchimento.classList.add(
            "enchimento-desligado"
        );
    }
}


// ======================================================
// ESTADO / ALERTAS
// ======================================================

function atualizarEstado(
    estado,
    nivel,
    enchimento,
    modo
) {

    let alerta = "";
    let seguranca = "";
    let risco = "";
    let mensagem = "";
    let recomendacao = "";
    let estadoGeral = "";

    if (
        estado === "CRITICO"
    ) {

        alerta =
            "🔴 Estado: Crítico<br>Risco de interrupção: Alto";

        seguranca =
            "CRÍTICA";

        risco =
            "Alto";

        estadoGeral =
            "Crítico";

        if (
            enchimento === "LIGADO"
        ) {

            mensagem =
                "Nível crítico detectado. O sistema iniciou automaticamente o enchimento do reservatório.";

            recomendacao =
                "Manter o sistema em operação e acompanhar a recuperação do nível.";
        }

        else {

            mensagem =
                "Nível crítico detectado e o enchimento não está ativo.";

            recomendacao =
                "Verificar o sistema de abastecimento.";
        }
    }

    else if (
        estado === "BAIXO"
    ) {

        alerta =
            "🟡 Estado: Baixo<br>Monitorização recomendada";

        seguranca =
            "BAIXA";

        risco =
            "Moderado";

        estadoGeral =
            "Atenção";

        mensagem =
            "O reservatório encontra-se com nível baixo e requer acompanhamento.";

        recomendacao =
            "Acompanhar a evolução do nível e o funcionamento do enchimento.";
    }

    else if (
        estado === "NORMAL"
    ) {

        alerta =
            "🟢 Estado: Normal<br>Risco de interrupção: Baixo";

        seguranca =
            "NORMAL";

        risco =
            "Baixo";

        estadoGeral =
            "Normal";

        mensagem =
            "O reservatório encontra-se dentro da faixa normal de operação.";

        recomendacao =
            "Nenhuma intervenção necessária.";
    }

    else if (
        estado === "ALTO"
    ) {

        alerta =
            "🔵 Estado: Alto<br>Nível próximo do limite operacional";

        seguranca =
            "ALTA";

        risco =
            "Muito baixo";

        estadoGeral =
            "Estável";

        if (
            enchimento === "DESLIGADO"
        ) {

            mensagem =
                "O reservatório atingiu um nível elevado e o enchimento encontra-se desligado.";

            recomendacao =
                "Sistema dentro da condição esperada de operação.";
        }

        else {

            mensagem =
                "Nível elevado detectado enquanto o enchimento permanece ativo.";

            recomendacao =
                "Acompanhar o desligamento automático do enchimento.";
        }
    }

    else {

        alerta =
            "⚪ Estado: Indefinido";

        seguranca =
            "--";

        risco =
            "--";

        estadoGeral =
            "Indefinido";

        mensagem =
            "Estado do reservatório não identificado.";

        recomendacao =
            "Verificar os dados recebidos pelo sistema.";
    }

    document.getElementById(
        "alertaSistema"
    ).innerHTML =
        alerta;

    document.getElementById(
        "segurancaReservatorio"
    ).textContent =
        seguranca;

    document.getElementById(
        "riscoIA"
    ).textContent =
        risco;

    document.getElementById(
        "mensagemAI"
    ).textContent =
        mensagem;

    document.getElementById(
        "recomendacaoAI"
    ).textContent =
        recomendacao;

    document.getElementById(
        "estadoGeral"
    ).textContent =
        estadoGeral;

    document.getElementById(
        "modoSistema"
    ).textContent =
        formatarTextoSistema(
            modo
        );

    aplicarEstadoVisual(
        estado,
        enchimento
    );
}


// ======================================================
// TENDÊNCIA
// ======================================================

function calcularTendencia() {

    if (
        historicoNivel.length < 3
    ) {

        return "A recolher dados";
    }

    const primeiro =
        historicoNivel[0];

    const ultimo =
        historicoNivel[
            historicoNivel.length - 1
        ];

    const diferenca =
        ultimo -
        primeiro;

    if (
        diferenca > 2
    ) {

        return "⬆ Nível a subir";
    }

    if (
        diferenca < -2
    ) {

        return "⬇ Nível a descer";
    }

    return "→ Nível estável";
}


// ======================================================
// AUTONOMIA
// ======================================================

function calcularAutonomia(
    volume,
    caudal
) {

    if (
        caudal <= 0
    ) {

        return "Sem consumo";
    }

    const minutos =
        volume /
        caudal;

    if (
        minutos < 1
    ) {

        return "< 1 min";
    }

    if (
        minutos < 60
    ) {

        return (
            minutos.toFixed(1) +
            " min"
        );
    }

    const horas =
        minutos /
        60;

    return (
        horas.toFixed(1) +
        " h"
    );
}


// ======================================================
// RESERVATÓRIOS DE DEMONSTRAÇÃO
// ======================================================

const reservatorios = {

    imetro: {

        nivel: 62,
        volume: 12.4,
        estado: "NORMAL",
        autonomia: "5 Dias",
        seguranca: "NORMAL",

        mensagem:
            "Cenário demonstrativo do campus IMETRO.",

        recomendacao:
            "Monitorização regular recomendada."
    },

    centro: {

        nivel: 91,
        volume: 18.2,
        estado: "ALTO",
        autonomia: "11 Dias",
        seguranca: "ALTA",

        mensagem:
            "Cenário demonstrativo da Zona Centro.",

        recomendacao:
            "Nenhuma ação necessária."
    },

    norte: {

        nivel: 45,
        volume: 9.0,
        estado: "BAIXO",
        autonomia: "3 Dias",
        seguranca: "BAIXA",

        mensagem:
            "Cenário demonstrativo da Zona Norte.",

        recomendacao:
            "Preparar abastecimento."
    },

    sul: {

        nivel: 33,
        volume: 6.6,
        estado: "BAIXO",
        autonomia: "2 Dias",
        seguranca: "BAIXA",

        mensagem:
            "Cenário demonstrativo da Zona Sul.",

        recomendacao:
            "Acompanhar o nível do reservatório."
    }

};


// ======================================================
// SELETOR
// ======================================================

document.getElementById(
    "reservatorioSelect"
).addEventListener(
    "change",
    function () {

        const selecionado =
            this.value;

        atualizarBloqueioNivel();

        if (
            selecionado === "prototipo"
        ) {

            buscarDadosNZAJI();

            return;
        }

        const dados =
            reservatorios[
                selecionado
            ];

        document.getElementById(
            "nivelInput"
        ).value =
            dados.nivel;

        document.getElementById(
            "valorNivel"
        ).textContent =
            dados.nivel +
            "%";

        document.getElementById(
            "nivelAtualCard"
        ).textContent =
            dados.nivel +
            "%";

        document.getElementById(
            "volumeDisponivel"
        ).textContent =
            dados.volume.toFixed(2) +
            " L";

        document.getElementById(
            "autonomiaReservatorio"
        ).textContent =
            dados.autonomia;

        document.getElementById(
            "segurancaReservatorio"
        ).textContent =
            dados.seguranca;

        document.getElementById(
            "estadoReservatorio"
        ).textContent =
            formatarTextoSistema(
                dados.estado
            );

        document.getElementById(
            "estadoEnchimento"
        ).textContent =
            "Enchimento: Simulado";

        document.getElementById(
            "mensagemAI"
        ).textContent =
            dados.mensagem;

        document.getElementById(
            "recomendacaoAI"
        ).textContent =
            dados.recomendacao;

        document.getElementById(
            "consumoAcumulado"
        ).textContent =
            "--";

        document.getElementById(
            "caudalAtual"
        ).textContent =
            "--";

        document.getElementById(
            "modoSistema"
        ).textContent =
            "Simulação";

        document.getElementById(
            "estadoGeral"
        ).textContent =
            formatarTextoSistema(
                dados.estado
            );

        document.getElementById(
            "consumoIA"
        ).textContent =
            "Simulado";

        if (
            dados.estado === "ALTO" ||
            dados.estado === "NORMAL"
        ) {

            document.getElementById(
                "riscoIA"
            ).textContent =
                "Baixo";
        }

        else {

            document.getElementById(
                "riscoIA"
            ).textContent =
                "Moderado";
        }

        document.getElementById(
            "eficienciaIA"
        ).textContent =
            "Simulação";

        document.getElementById(
            "prevHoje"
        ).textContent =
            "Nível atual: " +
            dados.nivel +
            "%";

        document.getElementById(
            "prevAmanha"
        ).textContent =
            "Tendência: cenário demonstrativo";

        document.getElementById(
            "prev3Dias"
        ).textContent =
            "Dados: simulados";

        aplicarEstadoVisual(
            dados.estado,
            "DESLIGADO"
        );
    }
);


// ======================================================
// DADOS REAIS VIA THINGSPEAK
// ======================================================

async function buscarDadosNZAJI() {

    const reservatorioSelecionado =
        document.getElementById(
            "reservatorioSelect"
        ).value;

    if (
        reservatorioSelecionado !==
        "prototipo"
    ) {

        return;
    }

    try {

        const resposta =
            await fetch(
                URL_THINGSPEAK
            );

        if (
            !resposta.ok
        ) {

            throw new Error(
                "Resposta inválida do ThingSpeak"
            );
        }

        const respostaThingSpeak =
            await resposta.json();

        if (
            !respostaThingSpeak.feeds ||
            respostaThingSpeak.feeds.length === 0
        ) {

            throw new Error(
                "Nenhum dado disponível no ThingSpeak"
            );
        }

        const feed =
            respostaThingSpeak.feeds[0];


        // --------------------------------------------------
        // CONVERSÃO DOS 8 FIELDS
        // --------------------------------------------------

        const nivel =
            Number(
                feed.field1
            );

        const caudal =
            Number(
                feed.field2
            );

        const consumo =
            Number(
                feed.field3
            );

        const estado =
            feed.field4 || "--";

        const enchimento =
            feed.field5 === "1"
                ? "LIGADO"
                : "DESLIGADO";

        const modo =
            feed.field6 === "1"
                ? "MANUAL"
                : "AUTOMATICO";

        const nivelValido =
            feed.field7 === "1";

        let volume =
            Number(
                feed.field8
            );

        if (
            !Number.isFinite(volume)
        ) {

            volume =
                CAPACIDADE_PROTOTIPO *
                (
                    nivel /
                    100
                );
        }


        // --------------------------------------------------
        // SENSOR
        // --------------------------------------------------

        if (
            nivelValido === false
        ) {

            document.getElementById(
                "estadoReservatorio"
            ).textContent =
                "Sensor inválido";

            document.getElementById(
                "alertaSistema"
            ).innerHTML =
                "🔴 Falha de leitura<br>Verificar sensor de nível";

            return;
        }


        // --------------------------------------------------
        // NÍVEL
        // --------------------------------------------------

        document.getElementById(
            "nivelAtualCard"
        ).textContent =
            nivel.toFixed(1) +
            "%";

        document.getElementById(
            "valorNivel"
        ).textContent =
            nivel.toFixed(1) +
            "%";

        document.getElementById(
            "nivelInput"
        ).value =
            nivel;


        // --------------------------------------------------
        // VOLUME
        // --------------------------------------------------

        document.getElementById(
            "volumeDisponivel"
        ).textContent =
            volume.toFixed(2) +
            " L";


        // --------------------------------------------------
        // CAUDAL
        // --------------------------------------------------

        document.getElementById(
            "caudalAtual"
        ).textContent =
            caudal.toFixed(2) +
            " L/min";


        // --------------------------------------------------
        // CONSUMO
        // --------------------------------------------------

        document.getElementById(
            "consumoAcumulado"
        ).textContent =
            consumo.toFixed(3) +
            " L";


        // --------------------------------------------------
        // AUTONOMIA
        // --------------------------------------------------

        document.getElementById(
            "autonomiaReservatorio"
        ).textContent =
            calcularAutonomia(
                volume,
                caudal
            );


        // --------------------------------------------------
        // ESTADO
        // --------------------------------------------------

        document.getElementById(
            "estadoReservatorio"
        ).textContent =
            formatarTextoSistema(
                estado
            );


        // --------------------------------------------------
        // ENCHIMENTO
        // --------------------------------------------------

        document.getElementById(
            "estadoEnchimento"
        ).textContent =
            "Enchimento: " +
            formatarTextoSistema(
                enchimento
            );


        // --------------------------------------------------
        // INDICADOR DE FLUXO
        // --------------------------------------------------

        if (
            enchimento === "LIGADO"
        ) {

            document.getElementById(
                "consumoIA"
            ).textContent =
                "Pausado durante enchimento";
        }

        else if (
            caudal > 0
        ) {

            document.getElementById(
                "consumoIA"
            ).textContent =
                caudal.toFixed(2) +
                " L/min";
        }

        else {

            document.getElementById(
                "consumoIA"
            ).textContent =
                "Sem consumo";
        }


        // --------------------------------------------------
        // CONTROLO
        // --------------------------------------------------

        document.getElementById(
            "eficienciaIA"
        ).textContent =
            formatarTextoSistema(
                modo
            );


        // --------------------------------------------------
        // ESTADO / ALERTAS / ASSISTENTE
        // --------------------------------------------------

        atualizarEstado(
            estado,
            nivel,
            enchimento,
            modo
        );


        // --------------------------------------------------
        // HISTÓRICO DA SESSÃO
        // Só adiciona quando chega novo registo ThingSpeak
        // --------------------------------------------------

        const entryId =
            Number(
                feed.entry_id
            );

        if (
            entryId !== ultimoEntryId
        ) {

            ultimoEntryId =
                entryId;

            historicoConsumo.push(
                consumo
            );

            historicoNivel.push(
                nivel
            );

            const horaThingSpeak =
                new Date(
                    feed.created_at
                );

            historicoHora.push(
                horaThingSpeak.toLocaleTimeString(
                    "pt-PT",
                    {
                        hour:
                            "2-digit",

                        minute:
                            "2-digit",

                        second:
                            "2-digit"
                    }
                )
            );

            if (
                historicoConsumo.length >
                MAX_PONTOS
            ) {

                historicoConsumo.shift();

                historicoNivel.shift();

                historicoHora.shift();
            }

            desenharGrafico();
        }


        // --------------------------------------------------
        // TENDÊNCIA
        // --------------------------------------------------

        const tendencia =
            calcularTendencia();

        document.getElementById(
            "prevHoje"
        ).textContent =
            "Nível atual: " +
            nivel.toFixed(1) +
            "%";

        document.getElementById(
            "prevAmanha"
        ).textContent =
            "Tendência: " +
            tendencia;

        document.getElementById(
            "prev3Dias"
        ).textContent =
            "Dados: NZAJI Cloud";


        // --------------------------------------------------
        // CONSOLE
        // --------------------------------------------------

        console.log(
            "Dados recebidos do ThingSpeak:",
            feed
        );

    }

    catch (
        erro
    ) {

        console.error(
            "Erro ao receber dados do ThingSpeak:",
            erro
        );

        document.getElementById(
            "estadoReservatorio"
        ).textContent =
            "Sem comunicação";

        document.getElementById(
            "estadoEnchimento"
        ).textContent =
            "Enchimento: --";

        document.getElementById(
            "alertaSistema"
        ).innerHTML =
            "🔴 Comunicação indisponível<br>Verificar ligação à Internet";
    }
}


// ======================================================
// INÍCIO
// ======================================================

atualizarBloqueioNivel();

buscarDadosNZAJI();


// ======================================================
// ATUALIZAÇÃO AUTOMÁTICA
// ======================================================

setInterval(
    buscarDadosNZAJI,
    5000
);
