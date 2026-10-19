(function () {
    'use strict';

    // --- TEXTOS FÁCEIS DE TROCAR ---
    // Cada toque no "Não" (no celular) mostra a próxima frase. Depois da última, o botão some.
    const FRASES_NAO = ['Não', 'Tem certeza?', 'Pensa bem…', 'Olha que eu choro 🥺', 'Última chance!', 'Tá bom, sem "não" então 🙃'];
    const CORACOES = ['❤️', '🩷', '🧡', '💛', '💚', '💙', '🩵', '💜', '🤍', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🫶', '💌'];

    // O GIF tem 341 quadros de 30 ms: o coração só começa depois do "biu".
    const DURACAO_GIF = 10300;

    const $ = (id) => document.getElementById(id);
    const limitar = (v, min, max) => Math.min(max, Math.max(min, v));
    const aleatorio = (min, max) => min + Math.random() * (max - min);
    const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const temGsap = !!(window.gsap && window.ScrollTrigger && window.SplitText && window.DrawSVGPlugin && window.Physics2DPlugin);
    if (temGsap) {
        gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Physics2DPlugin);
    } else {
        // sem internet para o CDN: a página vira uma folha simples, mas tudo continua funcionando
        document.documentElement.classList.remove('anima');
    }

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const pergunta = $('pergunta');
    const sim = $('sim');
    const nao = $('nao');
    const festa = $('festa');
    const musica = $('musica');
    const desenho = $('desenho');
    const coracao = $('coracao');
    const final = $('final');
    const mudo = $('mudo');

    // --- SOM E VIBRAÇÃO ---
    let audioCtx = null;

    function prepararSom() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function plop(volume, grave) {
        if (!audioCtx || audioCtx.state !== 'running') return;
        const agora = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const ganho = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(grave ? 160 : 220 + Math.random() * 60, agora);
        osc.frequency.exponentialRampToValueAtTime(50, agora + 0.1);
        ganho.gain.setValueAtTime(volume, agora);
        ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.2);
        osc.connect(ganho);
        ganho.connect(audioCtx.destination);
        osc.start(agora);
        osc.stop(agora + 0.2);
    }

    function vibrar(ms) {
        if (navigator.vibrate) navigator.vibrate(ms);
    }

    mudo.addEventListener('click', () => {
        musica.muted = !musica.muted;
        mudo.textContent = musica.muted ? '🔇' : '🔊';
        mudo.setAttribute('aria-label', musica.muted ? 'Ligar música' : 'Silenciar música');
    });

    $('reiniciar').addEventListener('click', () => {
        musica.pause();
        window.location.reload();
    });

    function criarPetalas() {
        const container = $('petalas');
        if (semMovimento || container.childElementCount) return;
        const quantidade = window.innerWidth < 700 ? 18 : 30;
        for (let i = 0; i < quantidade; i++) {
            const petala = document.createElement('div');
            const tamanho = Math.random() * 15 + 10;
            petala.className = 'petala';
            petala.style.left = Math.random() * 100 + 'vw';
            petala.style.width = tamanho + 'px';
            petala.style.height = tamanho * 1.25 + 'px';
            petala.style.opacity = Math.random() * 0.5 + 0.5;
            petala.style.animationDuration = Math.random() * 10 + 8 + 's';
            petala.style.animationDelay = Math.random() * 12 + 's';
            container.appendChild(petala);
        }
    }

    // --- O CORAÇÃO DE PECINHAS ---
    // Formato e posição de cada peça (os mesmos do projeto original).
    const FORMATOS = [
        [[0, 1], [0, 0], [-1, 0], [-1, -1]], [[0, 1], [0, 0], [-1, 0], [0, -1]],
        [[-1, 1], [0, 0], [-1, 0], [-1, -1]], [[0, 1], [0, 0], [-1, 0], [-1, -1]],
        [[-1, 1], [0, 0], [-1, 0], [0, -1]], [[0, -1], [0, 0], [-1, 0], [1, -1]],
        [[-1, -1], [0, 0], [-1, 0], [1, 0]], [[-1, 1], [0, 0], [-1, 0], [-1, -1]],
        [[0, -1], [0, 0], [-1, 0], [1, 0]], [[-1, 1], [0, 0], [-1, 0], [1, 0]],
        [[2, 0], [0, 0], [-1, 0], [1, 0]], [[0, 1], [0, 0], [-1, 0], [0, -1]],
        [[0, 1], [0, 0], [-1, 0], [-1, -1]], [[1, 1], [0, 0], [-1, 0], [1, 0]],
        [[1, -1], [0, 0], [-1, 0], [1, 0]], [[-1, -1], [0, 0], [-1, 0], [1, 0]],
        [[0, 1], [0, 0], [-1, 0], [0, -1]], [[0, 1], [0, 0], [-1, 0], [-1, -1]],
        [[0, -1], [0, 0], [-1, 0], [1, 0]], [[1, -1], [0, 0], [-1, 0], [1, 0]],
        [[0, 1], [0, 0], [-1, 0], [-1, -1]], [[1, 1], [0, 0], [-1, 0], [1, 0]],
        [[0, 2], [0, 0], [0, 1]]
    ];
    const POSICOES = [
        [5, 3], [5, 1], [3, 4], [3, 2], [3, -1], [2, 5], [2, 1], [1, -1],
        [1, -3], [1, 2], [0, 3], [0, 0], [-1, -4], [0, -2], [-2, 4], [-2, 2],
        [-2, 0], [-3, -2], [-4, 0], [-3, 5], [-5, 3], [-4, 1], [-6, 1]
    ];

    // Converte para colunas/linhas de uma grade 13 x 11 e monta de baixo para cima,
    // como num Tetris de verdade.
    const PECAS = FORMATOS.map((formato, i) => {
        const [ox, oy] = POSICOES[i];
        const celulas = formato.map(([cx, cy]) => [6 + ox - cx, 5 - oy - cy]);
        return { celulas, fundo: Math.max(...celulas.map((c) => c[1])), meio: celulas.reduce((s, c) => s + c[0], 0) / celulas.length };
    }).sort((a, b) => b.fundo - a.fundo || Math.abs(a.meio - 6) - Math.abs(b.meio - 6));

    const TOTAL_QUADRADOS = PECAS.reduce((s, p) => s + p.celulas.length, 0);

    function dimensionarCoracao() {
        const celular = window.innerWidth <= 700;
        const palco = coracao.parentElement;
        const larguraLivre = palco.clientWidth - (celular ? 0 : desenho.offsetWidth + 24);
        const alturaLivre = window.innerHeight * (celular ? 0.36 : 0.55);
        const u = Math.floor(limitar(Math.min(larguraLivre / 13, alturaLivre / 11), 14, 44));
        coracao.style.setProperty('--u', u + 'px');
        return u;
    }

    function criarPeca(peca, aoEstourar) {
        const el = document.createElement('div');
        el.className = 'peca';
        peca.celulas.forEach(([x, y]) => {
            const q = document.createElement('button');
            q.type = 'button';
            q.className = 'quadrado';
            q.tabIndex = -1;
            q.setAttribute('aria-hidden', 'true');
            q.style.setProperty('--x', x);
            q.style.setProperty('--y', y);
            if (aoEstourar) q.addEventListener('click', aoEstourar);
            el.appendChild(q);
        });
        coracao.appendChild(el);
        return el;
    }

    function carregarDesenho(depois) {
        let comecou = false;
        const comecar = (espera) => {
            if (comecou) return;
            comecou = true;
            setTimeout(depois, espera);
        };
        desenho.onload = () => comecar(DURACAO_GIF);
        desenho.onerror = () => comecar(800);
        // recarrega o GIF para ele se desenhar do começo
        desenho.src = 'images/biubiubiu.gif?v=' + Date.now();
    }

    if (!temGsap) {
        modoSimples();
        return;
    }

    // =====================================================================
    // A partir daqui, tudo é coreografado com GSAP.
    // =====================================================================

    // --- ROLAGEM COM INÉRCIA (Lenis) ---
    let lenis = null;
    if (window.Lenis) {
        lenis = new Lenis({
            duration: 1.3,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.9
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
        gsap.ticker.lagSmoothing(0);
        lenis.scrollTo(0, { immediate: true });
    }
    ScrollTrigger.config({ ignoreMobileResize: true });

    // --- CORAÇÕEZINHOS E CONFETES ---
    function soltarCoracao(x, y) {
        const el = document.createElement('div');
        el.className = 'voa';
        el.textContent = sortear(CORACOES);
        document.body.appendChild(el);
        gsap.set(el, { x, y, xPercent: -50, yPercent: -50, scale: 0 });
        gsap.to(el, { scale: 1.3, duration: 0.45, ease: 'back.out(3)' });
        gsap.to(el, { y: y - 80, autoAlpha: 0, duration: 0.8, delay: 0.15, ease: 'power1.in', onComplete: () => el.remove() });
    }

    // explosão com gravidade de verdade (Physics2D)
    function explosao(x, y, quantidade) {
        for (let i = 0; i < quantidade; i++) {
            const el = document.createElement('div');
            el.className = 'voa';
            el.textContent = sortear(CORACOES);
            document.body.appendChild(el);
            const duracao = aleatorio(1.4, 2.3);
            gsap.set(el, { x, y, xPercent: -50, yPercent: -50, scale: aleatorio(0.6, 1.25) });
            gsap.to(el, {
                duration: duracao,
                rotate: aleatorio(-360, 360),
                physics2D: { velocity: aleatorio(380, 850), angle: aleatorio(205, 335), gravity: 1150 },
                onComplete: () => el.remove()
            });
            gsap.to(el, { autoAlpha: 0, duration: 0.4, delay: duracao - 0.4 });
        }
    }

    let ultimoPonteiro = 'mouse';
    document.addEventListener('pointerdown', (e) => {
        ultimoPonteiro = e.pointerType;
        prepararSom();
        if (e.target.closest('.quadrado, .mudo')) return;
        soltarCoracao(e.clientX, e.clientY);
    });

    // --- HISTÓRIA (scrollytelling) ---
    const trilho = $('trilho');
    const palco = $('palco');
    const cenas = gsap.utils.toArray('.cena');
    trilho.style.setProperty('--cenas', cenas.length);

    // rabisquinhos que flutuam em camadas (os mais "perto" passam mais rápido)
    const FORMAS_ENFEITE = [
        'M20 34 C 4 22, 6 8, 15 9 C 17 10, 19 12, 20 15 C 21 12, 23 10, 25 9 C 34 8, 36 22, 20 34 Z',
        'M20 4 L24 15 L36 16 L27 24 L30 36 L20 29 L10 36 L13 24 L4 16 L16 15 Z',
        'M20 6 L20 34 M6 20 L34 20 M10 10 L30 30 M30 10 L10 30',
        'M6 26 C 2 16, 14 10, 18 16 C 20 6, 34 8, 32 18 C 40 20, 36 32, 28 30 L10 30 C 6 30, 4 28, 6 26 Z',
        'M8 30 C 8 12, 32 12, 30 24 C 28 32, 16 30, 18 22 C 19 18, 24 18, 24 22'
    ];
    const CORES_ENFEITE = ['#f4a3b8', '#9cc3f0', '#f5c76a', '#c3a8f0'];
    // [x em %, altura inicial em vh, tamanho em px, profundidade, forma]
    const ENFEITES = [
        [6, 12, 34, 0.5, 0], [84, 8, 28, 0.8, 1], [70, 40, 40, 0.4, 3], [14, 70, 26, 1.1, 2],
        [90, 80, 36, 0.6, 0], [40, 110, 30, 0.9, 4], [8, 140, 40, 0.5, 1], [78, 150, 26, 1.2, 2],
        [55, 185, 34, 0.7, 0], [20, 210, 28, 1.0, 3], [88, 230, 40, 0.5, 4], [35, 260, 30, 0.8, 1],
        [66, 290, 28, 1.1, 0], [12, 310, 36, 0.6, 2], [92, 340, 30, 0.9, 3], [48, 360, 26, 0.7, 1]
    ];

    const PERCURSO = { trigger: trilho, start: 'top top', end: 'bottom bottom' };

    ENFEITES.forEach(([x, y, tamanho, profundidade, forma], i) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 40 40');
        svg.setAttribute('class', 'enfeite');
        svg.style.left = x + '%';
        svg.style.width = tamanho + 'px';
        svg.style.height = tamanho + 'px';
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', FORMAS_ENFEITE[forma]);
        path.style.stroke = CORES_ENFEITE[i % CORES_ENFEITE.length];
        svg.appendChild(path);
        $('enfeites').appendChild(svg);

        // camada 5: parallax ligado à rolagem
        gsap.fromTo(svg,
            { y: () => (y / 100) * window.innerHeight },
            {
                y: () => ((y - profundidade * 330) / 100) * window.innerHeight,
                rotate: (i % 2 ? 1 : -1) * (60 + i * 10),
                ease: 'none',
                scrollTrigger: { ...PERCURSO, scrub: 0.6, invalidateOnRefresh: true }
            });
        gsap.from(path, { scale: 0, transformOrigin: '50% 50%', duration: 1.1, delay: 0.8 + i * 0.05, ease: 'elastic.out(1, 0.4)' });
        if (!semMovimento) {
            gsap.to(path, { rotate: aleatorio(-25, 25), x: aleatorio(-6, 6), transformOrigin: '50% 50%', duration: aleatorio(1.6, 3), repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2 });
        }
    });

    gsap.to('.progresso__coracao', { top: '100%', ease: 'none', scrollTrigger: { ...PERCURSO, scrub: true } });

    // detalhes coloridos "estalam" com mola de verdade (no tempo, não na rolagem)
    function estalar(alvos, tl) {
        const indo = !tl.scrollTrigger || tl.scrollTrigger.direction >= 0;
        if (indo) {
            gsap.fromTo(alvos, { scale: 0 }, { scale: 1, duration: 1.2, ease: 'elastic.out(1.2, 0.3)', stagger: 0.08, overwrite: true });
        } else {
            gsap.to(alvos, { scale: 0, duration: 0.25, ease: 'power2.in', overwrite: true });
        }
    }

    function coreografarAbertura(tl, cena, divisoes) {
        const titulo = SplitText.create(cena.querySelector('.abertura__titulo'), { type: 'words,chars' });
        divisoes.push(titulo);
        const envelope = cena.querySelector('.envelope');
        const selo = cena.querySelector('.envelope__selo');
        const dica = cena.querySelector('.abertura__dica');

        // entrada ao abrir a página: o envelope cai quicando e o título pula letra por letra
        gsap.timeline({ delay: 0.25 })
            .from(envelope, { y: -window.innerHeight * 0.7, rotate: -25, scale: 0.6, duration: 1.4, ease: 'bounce.out' })
            .from(selo, { scale: 0, transformOrigin: '50% 50%', duration: 1.1, ease: 'elastic.out(1.2, 0.3)' }, 0.9)
            .from(titulo.chars, { autoAlpha: 0, y: 70, rotate: () => aleatorio(-30, 30), scale: 0.3, duration: 1.2, ease: 'elastic.out(1, 0.5)', stagger: 0.03 }, 0.5)
            .from(dica, { autoAlpha: 0, y: 20, duration: 0.6 }, 1.4);
        if (!semMovimento) gsap.to(dica.querySelector('span'), { y: 6, repeat: -1, yoyo: true, duration: 0.7, ease: 'sine.inOut' });

        // rolando: o selo estoura, a aba abre, a carta sobe e voa na sua direção
        tl.to(dica, { autoAlpha: 0, y: 30, duration: 0.3 }, 0)
            .to(selo, { scale: 1.5, transformOrigin: '50% 50%', duration: 0.25, ease: 'power2.out' }, 0)
            .to(selo, { scale: 0, rotate: 200, y: -80, duration: 0.35, ease: 'back.in(2)' }, 0.25)
            .to('.envelope__aba', { scaleY: 0, transformOrigin: '50% 0%', duration: 0.35, ease: 'power2.in' }, 0.35)
            .fromTo('.envelope__aba-aberta', { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.35, ease: 'back.out(2)' }, 0.7)
            .to('.envelope__carta', { y: -100, duration: 0.7, ease: 'power2.inOut' }, 0.95)
            .to(titulo.chars, { yPercent: -130, autoAlpha: 0, filter: 'blur(10px)', stagger: { each: 0.012, from: 'center' }, duration: 0.5, ease: 'power2.in' }, 0.95)
            .to('.envelope__parte', { y: 320, rotate: 8, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'power2.in' }, 1.55)
            .to('.envelope__carta', { scale: 4, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.9, ease: 'power2.in' }, 1.6);
    }

    function coreografarCena(tl, cena, t, ultima, pequeno, divisoes) {
        const rabisco = cena.querySelector('.rabisco');
        const tracos = cena.querySelectorAll('.traco');
        const detalhes = cena.querySelectorAll('.preenche, .bochecha');
        // no celular as palavras inteiras se mexem (menos elementos = sem engasgo)
        const divisao = SplitText.create(cena.querySelector('.cena__texto'), { type: pequeno ? 'words' : 'words,chars' });
        divisoes.push(divisao);
        const pedacos = pequeno ? divisao.words : divisao.chars;
        gsap.set(detalhes, { scale: 0, transformOrigin: '50% 50%' });

        // camada 1: entrada do desenho com sobra elástica
        // camada 2: o traço se desenha
        // camada 3: texto cinematográfico (blur + Y + escala)
        // camada 4: a cor do fundo se funde com a da cena
        tl.set(cena, { autoAlpha: 1 }, t - 0.05)
            .to(palco, { backgroundColor: cena.dataset.cor, duration: 1.3, ease: 'sine.inOut' }, t - 0.5)
            .fromTo(rabisco,
                { autoAlpha: 0, y: 180, scale: 0.4, rotate: -18, filter: 'blur(0px)' },
                { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 1, ease: 'back.out(1.7)' }, t)
            .from(tracos, { drawSVG: '0%', duration: 1.2, stagger: 0.12, ease: 'power1.inOut' }, t + 0.1)
            .fromTo(pedacos,
                { autoAlpha: 0, yPercent: 130, scale: 0.3, rotate: 12, filter: 'blur(14px)' },
                { autoAlpha: 1, yPercent: 0, scale: 1, rotate: 0, filter: 'blur(0px)', duration: 0.7, stagger: pequeno ? 0.07 : 0.018, ease: 'power3.out' }, t + 0.3)
            .call(estalar, [detalhes, tl], t + 1.3);

        if (ultima) {
            // a seta desce apontando para a pergunta e o fundo volta ao papel
            tl.to(palco, { backgroundColor: '#fcfdff', duration: 0.8, ease: 'sine.inOut' }, t + 2)
                .to(rabisco, { y: 50, duration: 0.8, ease: 'sine.inOut' }, t + 2);
            return t + 2.8;
        }

        const saida = t + 2.4;
        tl.to(rabisco, { y: -200, scale: 1.4, rotate: 12, autoAlpha: 0, filter: 'blur(10px)', duration: 0.9, ease: 'power2.in' }, saida)
            .to(pedacos, { yPercent: -110, scale: 1.15, autoAlpha: 0, filter: 'blur(12px)', duration: 0.6, stagger: pequeno ? 0.04 : 0.008, ease: 'power2.in' }, saida)
            .set(cena, { autoAlpha: 0 }, saida + 1.05);
        // a próxima cena entra enquanto esta ainda está saindo
        return saida + 0.55;
    }

    const mm = gsap.matchMedia();
    mm.add({ pequeno: '(max-width: 700px)', grande: '(min-width: 701px)' }, (contexto) => {
        const { pequeno } = contexto.conditions;
        const divisoes = [];
        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { ...PERCURSO, scrub: pequeno ? 0.8 : 1.2 }
        });

        coreografarAbertura(tl, cenas[0], divisoes);
        let t = 2.3;
        cenas.slice(1).forEach((cena, i, lista) => {
            t = coreografarCena(tl, cena, t, i === lista.length - 1, pequeno, divisoes);
        });

        return () => divisoes.forEach((d) => d.revert());
    });

    // --- PERGUNTA ---
    let pronta = false;
    let insistencia = null;
    let timerInsistir = null;

    const tituloPergunta = SplitText.create('#pergunta-titulo', { type: 'words,chars' });
    gsap.set(tituloPergunta.chars, { autoAlpha: 0 });
    gsap.set([sim, nao], { scale: 0, '--escala': 1 });

    ScrollTrigger.create({
        trigger: pergunta,
        start: 'top 60%',
        once: true,
        onEnter: () => {
            musica.preload = 'auto';
            gsap.timeline()
                .fromTo(tituloPergunta.chars,
                    { autoAlpha: 0, y: -180, rotate: () => aleatorio(-45, 45), scale: 0.3 },
                    { autoAlpha: 1, y: 0, rotate: 0, scale: 1, duration: 1.4, ease: 'elastic.out(1, 0.45)', stagger: 0.045 })
                .to([sim, nao], { scale: 1, duration: 1.1, ease: 'elastic.out(1.1, 0.4)', stagger: 0.15 }, '-=0.9')
                .add(() => {
                    pronta = true;
                    agendarInsistencia();
                });
        }
    });

    function agendarInsistencia() {
        timerInsistir = setTimeout(() => {
            if (semMovimento) return;
            insistencia = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })
                .to(sim, { keyframes: { x: [0, -8, 8, -6, 6, -3, 0], rotate: [0, -3, 3, -2, 2, -1, 0] }, duration: 0.6, ease: 'none' });
        }, 5000);
    }

    function pararInsistencia() {
        clearTimeout(timerInsistir);
        if (!insistencia) return;
        insistencia.kill();
        insistencia = null;
        gsap.set(sim, { x: 0, rotate: 0 });
    }

    // No computador o "Não" foge do mouse com mola; no toque ele vai perdendo a força.
    const vaga = document.createElement('span');
    vaga.setAttribute('aria-hidden', 'true');
    let fugindo = false;
    let tentativas = 0;

    document.addEventListener('pointermove', (e) => {
        if (!pronta || e.pointerType === 'touch' || nao.hidden || !festa.hidden) return;
        const r = nao.getBoundingClientRect();
        const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
        const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
        if (Math.hypot(dx, dy) < 70) fugir(e.clientX, e.clientY);
    });

    function fugir(px, py) {
        const r = nao.getBoundingClientRect();
        if (!fugindo) {
            // guarda o lugar do botão para o "Sim" não pular junto
            vaga.style.cssText = `display:inline-block;width:${r.width}px;height:${r.height}px`;
            nao.after(vaga);
            gsap.set(nao, { position: 'fixed', left: r.left, top: r.top, margin: 0, zIndex: 50 });
            fugindo = true;
        }
        const folga = 16;
        const maxX = window.innerWidth - r.width - folga;
        const maxY = window.innerHeight - r.height - folga;
        let melhor = null;
        for (let i = 0; i < 25; i++) {
            const x = folga + Math.random() * Math.max(0, maxX - folga);
            const y = folga + Math.random() * Math.max(0, maxY - folga);
            const dist = Math.hypot(x + r.width / 2 - px, y + r.height / 2 - py);
            if (!melhor || dist > melhor.dist) melhor = { x, y, dist };
            if (dist > 260) break;
        }
        gsap.to(nao, { left: melhor.x, top: melhor.y, duration: 0.55, ease: 'back.out(2.5)', overwrite: 'auto' });
        gsap.fromTo(nao, { rotate: aleatorio(-35, 35) }, { rotate: 0, duration: 1, ease: 'elastic.out(1, 0.3)' });
    }

    function soltarNao() {
        if (!fugindo) return;
        gsap.killTweensOf(nao, 'left,top');
        gsap.set(nao, { clearProps: 'position,left,top,margin,zIndex' });
        vaga.remove();
        fugindo = false;
    }

    ScrollTrigger.create({ trigger: pergunta, start: 'top bottom', end: 'bottom top', onLeave: soltarNao, onLeaveBack: soltarNao });

    function escalar() {
        tentativas++;
        vibrar(25);
        pararInsistencia();
        gsap.to(sim, { '--escala': Math.min(1 + tentativas * 0.22, 2.1), duration: 1, ease: 'elastic.out(1, 0.4)' });
        gsap.to(nao, { '--escala': Math.max(1 - tentativas * 0.12, 0.5), duration: 0.5, ease: 'power3.out' });

        if (tentativas < FRASES_NAO.length) {
            nao.textContent = FRASES_NAO[tentativas];
            gsap.fromTo(nao, { rotate: -14 }, { rotate: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)' });
        } else {
            sim.textContent = 'Sim! 💖';
            gsap.to(nao, {
                y: window.innerHeight * 0.6,
                rotate: 60,
                autoAlpha: 0,
                duration: 0.8,
                ease: 'power2.in',
                onComplete: () => { nao.hidden = true; }
            });
        }
    }

    nao.addEventListener('click', (e) => {
        if (!pronta) return;
        if (ultimoPonteiro === 'touch') {
            escalar();
            return;
        }
        const r = nao.getBoundingClientRect();
        fugir(r.left + r.width / 2, r.top + r.height / 2);
        if (e.detail === 0) sim.focus();
    });

    // --- COMEMORAÇÃO ---
    let tituloFesta = null;
    let montagem = null;
    let batida = null;
    let estourados = 0;

    sim.addEventListener('click', (e) => {
        if (!pronta) return;
        prepararSom();
        musica.play().catch(() => {});
        vibrar([30, 40, 60]);
        const r = sim.getBoundingClientRect();
        const cx = limitar(e.clientX || r.left + r.width / 2, 0, window.innerWidth);
        const cy = limitar(e.clientY || r.top + r.height / 2, 0, window.innerHeight);
        abrirFesta(cx, cy);
    });

    function abrirFesta(cx, cy) {
        soltarNao();
        pararInsistencia();
        if (lenis) lenis.stop();
        document.body.classList.add('is-locked');
        festa.hidden = false;

        const raio = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) + 20;
        tituloFesta = tituloFesta || SplitText.create('#festa-titulo', { type: 'words,chars' });
        gsap.set(final, { autoAlpha: 0, y: 30 });

        gsap.timeline()
            .fromTo(festa,
                { clipPath: `circle(0px at ${cx}px ${cy}px)` },
                { clipPath: `circle(${raio}px at ${cx}px ${cy}px)`, duration: 1.1, ease: 'power3.inOut', onComplete: () => gsap.set(festa, { clearProps: 'clipPath' }) })
            .fromTo(tituloFesta.chars,
                { autoAlpha: 0, y: -140, rotate: () => aleatorio(-40, 40), scale: 0.3 },
                { autoAlpha: 1, y: 0, rotate: 0, scale: 1, duration: 1.3, ease: 'elastic.out(1, 0.45)', stagger: 0.05 }, 0.55)
            .fromTo(desenho,
                { autoAlpha: 0, scale: 0.5, rotate: -10 },
                { autoAlpha: 1, scale: 1, rotate: 0, duration: 1, ease: 'elastic.out(1, 0.5)' }, 0.7);

        explosao(cx, cy, 36);
        criarPetalas();
        dimensionarCoracao();
        window.addEventListener('resize', dimensionarCoracao);
        carregarDesenho(() => montarCoracao(false));
    }

    function montarCoracao(rapido) {
        if (montagem) montagem.kill();
        if (batida) {
            batida.kill();
            batida = null;
        }
        gsap.set(coracao, { scale: 1 });
        coracao.replaceChildren();
        coracao.classList.remove('brilho');
        gsap.set(final, { autoAlpha: 0, y: 30 });
        estourados = 0;

        const u = dimensionarCoracao();
        const passo = rapido ? 0.09 : 0.24;
        montagem = gsap.timeline({ onComplete: terminarCoracao });
        PECAS.forEach((peca, i) => {
            const el = criarPeca(peca, explodir);
            // cada peça cai e quica até encaixar
            montagem.fromTo(el,
                { y: -(peca.fundo + 6) * u, rotate: aleatorio(-30, 30), autoAlpha: 0 },
                { y: 0, rotate: 0, autoAlpha: 1, duration: 0.95, ease: 'bounce.out', immediateRender: true }, i * passo);
            montagem.call(plop, [0.12, true], i * passo + 0.35);
        });
    }

    function terminarCoracao() {
        coracao.classList.add('brilho');
        if (!semMovimento) {
            // tum-tum
            batida = gsap.timeline({ repeat: -1, repeatDelay: 0.55 })
                .to(coracao, { scale: 1.07, duration: 0.13, ease: 'power2.out' })
                .to(coracao, { scale: 1, duration: 0.15, ease: 'power1.in' })
                .to(coracao, { scale: 1.045, duration: 0.12, ease: 'power2.out' })
                .to(coracao, { scale: 1, duration: 0.45, ease: 'power2.out' });
        }
        gsap.to(final, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
        const r = coracao.getBoundingClientRect();
        explosao(r.left + r.width / 2, r.top + r.height / 2, 28);
        vibrar([40, 80, 40]);
    }

    function explodir(e) {
        const q = e.currentTarget;
        if (q.dataset.estourado) return;
        q.dataset.estourado = '1';
        prepararSom();
        plop(0.5);
        vibrar(15);
        gsap.to(q, { scale: 1.8, autoAlpha: 0, duration: 0.25, ease: 'back.in(3)', onComplete: () => q.classList.add('estourado') });

        const r = q.getBoundingClientRect();
        const cores = ['#f4a3b8', '#ffc7d4', '#d9607f'];
        for (let i = 0; i < 14; i++) {
            const p = document.createElement('div');
            p.className = 'particula';
            p.style.background = cores[i % cores.length];
            document.body.appendChild(p);
            gsap.set(p, { x: r.left + r.width / 2, y: r.top + r.height / 2, xPercent: -50, yPercent: -50 });
            gsap.to(p, {
                duration: aleatorio(0.6, 1),
                scale: 0,
                physics2D: { velocity: aleatorio(150, 420), angle: aleatorio(0, 360), gravity: 600 },
                onComplete: () => p.remove()
            });
        }

        if (++estourados === TOTAL_QUADRADOS) {
            if (batida) batida.pause();
            setTimeout(() => $('remontar').focus(), 400);
        }
    }

    $('remontar').addEventListener('click', () => montarCoracao(true));

    // as fontes mudam o tamanho das letras: recalcula as posições quando chegarem
    if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

    // --- MODO SIMPLES (sem GSAP) ---
    function modoSimples() {
        let toques = 0;
        nao.addEventListener('click', () => {
            toques = Math.min(toques + 1, FRASES_NAO.length - 1);
            nao.textContent = FRASES_NAO[toques];
        });
        sim.addEventListener('click', () => {
            prepararSom();
            musica.play().catch(() => {});
            festa.hidden = false;
            document.body.classList.add('is-locked');
            dimensionarCoracao();
            carregarDesenho(() => {
                PECAS.forEach((peca) => criarPeca(peca));
                coracao.classList.add('brilho');
            });
        });
        $('remontar').hidden = true;
    }
})();
