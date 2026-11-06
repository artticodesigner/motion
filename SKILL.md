---
name: motion
description: Transforma um vídeo falado (Reels/vertical) em vídeo com motion graphics no EffectCraft — transcreve a fala, cria cenas animadas com ícones, logos reais e desenhos sincronizados palavra a palavra, deixa o vídeo original em PiP no canto e volta pra tela cheia nos momentos de impacto. Use quando o usuário pedir "motion graphics", "motion no vídeo", "anima esse vídeo", "faz um motion desse vídeo", "vídeo com PiP", ou mencionar EffectCraft com um vídeo.
---

# Vídeo com motion graphics (EffectCraft)

Faça tudo do começo ao fim sem perguntar etapa por etapa. Só pergunte se precisar instalar programas ou se faltar algo essencial (caminho do vídeo, logo da marca).

## Estilo obrigatório (aprovado pelo usuário)

1. **0–5 s:** vídeo original em tela cheia, sem nada por cima.
2. **Depois:** o vídeo encolhe (animação suave de ~0,6 s) para um **PiP arredondado com borda ciano no canto superior direito**. O motion ocupa o resto da tela. O áudio original toca do início ao fim.
3. **Volte pra tela cheia** em 2–4 momentos de impacto (frase forte, pergunta, CTA), com um **selo animado** por cima: ícone num círculo + frase curta numa pílula escura, no topo da tela. Depois volte ao PiP.
4. **Final (~4 s):** tela cheia + CTA: logo da marca no topo numa pílula escura, botão "Link na bio" pulsando, animação de toque (ripple).
5. **Nunca cena só de texto e caixas.** Cada trecho da fala ganha visual próprio:
   - ícones vetoriais desenhados (sino tocando, relógio com ponteiros girando, engrenagem girando, calendário, pessoa, raio, documento, chat, avião de papel, megafone, check, X vermelho, coração, bandeira, carinha que muda de humor…)
   - **logos reais** de toda marca/rede citada (Instagram, TikTok, WhatsApp, Google, iFood…). Use os de `assets/` ou baixe do Wikimedia Commons/fonte oficial. Nada de logo desenhado à mão.
   - mini-cenas que ilustram a fala: celular com mensagem enviada → "visualizado" → "digitando…" → silêncio; notificações empilhando e empurrando outra; cards deslizando; régua/linha do tempo com nós e pulso de luz; documentos caindo numa pilha; traços que se desenham (trim paths); X riscando; check sendo desenhado
   - texto só como apoio: uma manchete curta por cena (≤ 5 palavras) + rótulos curtos
6. **Sincronia:** cada elemento entra no segundo exato da palavra correspondente (use `words.txt`).
   - **Selos e pílulas sempre centralizados na tela:** use a função `selo()` do `exemplo-build.jsx` (não posicione com x/largura fixos). Ela mede o texto, calcula a largura da pílula e centraliza o conjunto ícone + pílula em W/2, com o texto centrado dentro da pílula. Nunca posicione ícone, pílula e texto separados com coordenadas escritas à mão. Vale também para a pílula do CTA ("agende uma conversa", "a resposta te deu medo?").
7. **Revisão visual antes do render final:** confira que todo selo/pílula está centrado na horizontal (margens iguais dos dois lados) e sem sobra de espaço dentro da pílula; gere frames de todas as cenas, olhe e corrija sobreposições, textos estourando e conflitos com textos/legendas já queimados no vídeo original (eles costumam ficar no meio/topo; posicione selos e CTA longe deles).

## Vídeos longos (3 min ou mais): motion pontual

O estilo acima é pensado pra vídeos curtos (até ~1 min30). Em vídeos de **3 minutos pra cima**, motion o tempo todo cansa e apaga a pessoa falando. Inverta a proporção:

1. **Tela cheia é o estado padrão.** O vídeo original fica em tela cheia na maior parte do tempo; o motion (PiP + cenas) entra só em momentos pontuais.
2. **Meta:** motion em ~25–35% da duração, no máximo. Cada janela de motion dura ~8–20 s, com pelo menos 20–30 s de tela cheia entre uma e outra.
3. **O que merece motion:** conceito que precisa ser visualizado (processo, passo a passo, comparação, número, lista), dado ou estatística, história com personagens/marcas. Explicação simples, opinião e conversa ficam em tela cheia.
4. **Selos animados** (ícone + frase curta) continuam valendo nos momentos de impacto em tela cheia, mas poucos e espaçados.
5. **Estrutura:** 0–5 s tela cheia (igual ao estilo normal) → tela cheia por padrão → janelas de motion pontuais → CTA final em tela cheia (~4 s, igual ao estilo normal).
6. **No `build.jsx`:** o array `cuts` fica com poucas janelas `PIP` curtas (cada uma abre com `PIP` e fecha com `FULL`); o resto é `FULL`. Logo do topo, etiqueta e barra de progresso aparecem só dentro das janelas de motion. Use o mesmo `selo()` e os mesmos helpers.
7. **Roteiro:** em vez de dividir a fala inteira em blocos, escolha primeiro as janelas (liste início, fim e o que vai ilustrar) e só então desenhe as cenas. Em caso de dúvida se um trecho merece motion, deixe em tela cheia.
8. **Revisão:** gere frames só das janelas de motion e dos selos/CTA, mas confira também as transições PiP ↔ tela cheia.

## Identidade visual (Arttico, padrão)

Se o projeto tiver `marca/design-guide.md` preenchido, ele tem prioridade. Senão:
- Fundo `#010030`, cards `#001145` / `#122461`, ciano `#38d7ff`, ciano claro `#a3e3f0`, branco; vermelho `#FF5566` só para "errado/riscado"
- Fonte **Inter** (Bold/SemiBold/Medium), já embutida no EffectCraft
- Fundo: solid navy + brilho ciano desfocado se movendo devagar + grade sutil (opacidade 4–6%)
- Durante o motion: logo branco no topo esquerdo + tag pequena em caps com tracking, barra de progresso fina no rodapé
- Logo: `assets/logo-arttico.png` (branco, fundo transparente)

## Fluxo

1. **Localizar ferramentas**
   - **EffectCraft:** rode `powershell -NoProfile -ExecutionPolicy Bypass -File "<pasta da skill>/scripts/instalar-effectcraft.ps1"`. Use a **última linha** da saída como caminho do `effectcraft-cli.exe`. Só vale um EffectCraft **exatamente na versão 0.21.1**: se existir, o script só devolve o caminho; qualquer outra versão é ignorada. Se não existir, ele instala sozinho, **sem perguntar ao usuário**: baixa direto do GitHub oficial (`storytold/effectcraft`) a versão portátil **fixa 0.21.1**, confere o SHA-256 gravado no próprio script (se não bater, cancela) e extrai em `%LOCALAPPDATA%\Programs\EffectCraft`, sem precisar de admin. **Nunca atualize o EffectCraft nem baixe "a versão mais recente"**, e não edite a versão/checksums do script: essa é uma regra de segurança do projeto. O `-Force` apenas reinstala a mesma versão fixa.
   - Python 3.12 (`%LOCALAPPDATA%\Programs\Python\Python312\python.exe`), ffmpeg, `faster-whisper`. Se faltar, peça permissão e instale: `winget install Python.Python.3.12`, `winget install Gyan.FFmpeg`, `python -m pip install faster-whisper numpy`. O PATH não atualiza no shell atual: use caminhos completos (ffmpeg fica em `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg*\*\bin\`).
   - Não use o Whisper do FilmCraft: o download de modelos é bloqueado nessa build.
2. **Probe do vídeo:** `ffprobe` (resolução, fps, duração). Extraia 1 frame (`ffmpeg -ss 2 -frames:v 1`) e olhe onde estão a pessoa e as legendas queimadas.
3. **Transcrever:** `python -I scripts/transcribe.py "<video>" "<scratch>"` gera `transcript.txt`, `transcript.json` e `words.txt`. Leia os arquivos com a ferramenta Read (o console estraga acentos). Corrija erros óbvios pelo contexto (nomes de marca, "CRM", "follow-up").
4. **Roteiro de cenas:** divida a fala em blocos de 3–8 s. Para cada bloco, defina: manchete, visual principal (ícones/logos/mini-cena), palavras-gatilho com tempo, e se é PiP ou tela cheia.
5. **Escrever o build.jsx** (na pasta de trabalho, não dentro da skill) partindo de `references/exemplo-build.jsx`. No topo, ajuste `SKILL_DIR` para o caminho real desta skill (com barras `/`) e `VID` para o vídeo. O exemplo é o (vídeo aprovado, com helpers prontos: `place`, `anim`, `moveTo`, `txt`, ícones `ic*`, `phone`, `notifCard`, `leadCard`, `nodeIcon`, estados FULL/PIP via `cuts`). Troque caminhos, textos, tempos e cenas. Reaproveite e crie ícones novos conforme o conteúdo.
6. **Build:** `effectcraft-cli script build.jsx --empty --save-as projeto.ecproj`
7. **Frames de teste:** `effectcraft-cli render-frame --project projeto.ecproj --comp "<nome>" --time S --max-side 640 --out f.png` para ~15 momentos. Junte numa folha com `ffmpeg ... -filter_complex hstack=inputs=5` e olhe. Corrija e repita.
8. **Render:** `effectcraft-cli render --project projeto.ecproj --comp "<nome>" --out "<pasta do vídeo>/saida/<nome>-motion.mp4" --format h264 --bitrate 14000 --audio on --progress` (~3 min para 55 s). Confira com ffprobe que tem vídeo + áudio e a duração certa.
9. **Entregar:** salve em `saida/` o MP4, o `.ecproj`, o `build.jsx` e os logos usados. Resuma as cenas e aponte o que o usuário deve conferir (palavras incertas da transcrição, nomes).

## Notas técnicas do EffectCraft (testadas)

- `script` roda JS com o modelo de objetos do After Effects: `app.project.importFile(new ImportOptions(new File(path)))`, `items.addComp(nome,w,h,1,dur,fps)`, `layers.add/addShape/addText/addSolid`, `property("Transform")`, `setValueAtTime`, `setTemporalEaseAtKey(k,[new KeyframeEase(0,75)],[...])`, `valueAtTime`, `numKeys`, `.expression`, `moveToBeginning/moveToEnd`, `inPoint/outPoint`.
- **PiP:** escala = `largura_pip / largura_original * 100`. Cantos arredondados = shape layer retângulo (tamanho da comp) como **track matte alpha** logo acima do vídeo (`video.trackMatteType = TrackMatteType.ALPHA; matte.enabled = false`). Anime escala, posição e `Roundness` do matte junto com o vídeo (roundness 0 em tela cheia, ~150 no PiP). A borda ciano é outro shape acima, com fade.
- **Agrupar:** use **precomps** (comp por ícone/card, duração = comp principal, `startTime = 0`, assim os keyframes internos usam o tempo do principal). Parent não herda opacidade, então não serve para fade de grupo.
- **Shapes:** `"ADBE Vector Group"` → `property("Contents").addProperty(...)`: `"ADBE Vector Shape - Rect"` (Size, Roundness, Position), `"- Ellipse"`, `"- Star"` (Type 1, Points, Outer/Inner Radius), `"- Group"` (Path = `new Shape()` com vertices/inTangents/outTangents/closed), `"ADBE Vector Graphic - Fill"`, `"- Stroke"` (Color, Stroke Width, Line Cap 2 = redondo), `"- G-Fill"`, `"ADBE Vector Filter - Trim"` (animar End 0→100 desenha o traço). Tracejado: `stroke.property("Dashes").addProperty("ADBE Vector Stroke Dash 1")`.
- **Gradiente:** `gfill.property("Colors").setValue({colors:[[0,[r,g,b,1]],[1,[r,g,b,1]]], opacities:[[0,1],[1,1]]})`
- **Ordem:** dentro de um shape layer, o primeiro grupo adicionado fica por cima. Para empilhar com segurança, use um layer por elemento, criado de baixo para cima.
- **Funcionam:** expressões (`time*90`, `value+[0,Math.sin(time*10)*7]`, decaimento de sino `Math.sin(t*16)*22*Math.exp(-t*1.1)`, ripple com `%1`), keyframes de Path (morph) e de cor, Gaussian Blur (`"ADBE Gaussian Blur 2"`).
- **Texto:** `td = layer.property("Source Text").value; td.fontFamily="Inter"; td.fontStyle="Bold"; td.fontSize; td.fillColor; td.justification; td.tracking` e depois `setValue(td)`.
- **Ordem das camadas no final:** monte o motion, depois `video.moveToBeginning(); matte.moveToBeginning(); borda.moveToBeginning();` e só então crie os overlays de tela cheia (precisam ficar acima do vídeo).
- **Logos:** Instagram em `Special:FilePath/Instagram_logo_2016.svg?width=600` (Commons). O TikTok colorido não existe no Commons, só preto (`Tiktok_logo.png`): pinte o glifo de ciano `#25F4EE`, vermelho `#FE2C55` e branco com `ffmpeg geq` (mantendo o alpha) e sobreponha com ~6 px de deslocamento sobre um quadrado preto arredondado. Já pronto em `assets/tiktok.png`. Imagens webp: converta para png com ffmpeg antes de importar. Downloads: use User-Agent genérico, nunca o e-mail do usuário.
