<h1>Pedido de Namoro</h1>

<p>Um pedido de namoro contado como uma história em rolagem (scrollytelling), desenhado como uma folha de caderno. Não precisa instalar nada: é só abrir o <code>index.html</code> ou publicar a pasta no GitHub Pages.</p>

https://github.com/user-attachments/assets/75850435-680e-4c24-8c63-400dc9e7b93a

<h2>Como funciona</h2>

<ol>
  <li><b>Envelope:</b> ao rolar, o selo estoura, a aba abre e a carta voa em direção à tela.</li>
  <li><b>História:</b> a tela fica presa enquanto cada cena entra. O rabisco se desenha, as letras surgem do desfoque, os detalhes coloridos estalam com efeito de mola e a cor do fundo vai mudando.</li>
  <li><b>Pergunta:</b> as letras de "Quer namorar comigo?" caem com efeito elástico.
    <ul>
      <li>No computador, o botão "Não" foge do mouse.</li>
      <li>No celular, cada toque no "Não" troca o texto dele, deixa o botão menor e o "Sim" maior, até o "Não" cair.</li>
    </ul>
  </li>
  <li><b>Sim:</b> a música começa, o bonequinho se desenha e manda um "biu", e as peças do coração caem quicando até montar o coração. Tocar nos coraçõezinhos faz eles estourarem.</li>
</ol>

<h2>Tecnologia</h2>

<ul>
  <li><a href="https://gsap.com">GSAP 3.13</a> com os plugins ScrollTrigger, SplitText, DrawSVG e Physics2D: coreografia, texto, traços e gravidade dos confetes.</li>
  <li><a href="https://lenis.darkroom.engineering">Lenis</a>: rolagem com inércia no computador. No celular, a rolagem continua sendo a do próprio aparelho.</li>
</ul>

<p>As bibliotecas vêm por CDN. Sem internet, a página mostra as cenas uma embaixo da outra, sem animação, e continua funcionando.</p>

<h2>Como personalizar</h2>

<ul>
  <li><b>Frases da história:</b> estão no <code>index.html</code>, em cada <code>&lt;section class="cena"&gt;</code>. A cor de fundo de cada cena fica no atributo <code>data-cor</code>.</li>
  <li><b>Frases do botão "Não" no celular:</b> ficam em <code>FRASES_NAO</code>, no começo do <code>js/love.js</code>.</li>
  <li><b>Música:</b> troque o arquivo <code>MP3/1.mp3</code>.</li>
</ul>
