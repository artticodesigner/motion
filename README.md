# motion: skill do Claude Code para vídeos com motion graphics

Transforma um vídeo falado (Reels vertical) num vídeo com motion graphics feito no **EffectCraft**:
- transcreve a fala com tempo por palavra
- mostra o vídeo original em tela cheia nos primeiros 5 s, depois em PiP no canto superior direito
- cria cenas animadas com ícones, logos reais e desenhos sincronizados com a fala
- volta pra tela cheia nos momentos de impacto e fecha com um CTA

Identidade visual padrão: Arttico (navy `#010030` + ciano `#38d7ff`, fonte Inter).

## Instalação

Funciona no Windows. Não precisa instalar nada antes:
- **EffectCraft:** se não estiver no PC, a skill baixa e instala sozinha a versão portátil oficial ([storytold/effectcraft](https://github.com/storytold/effectcraft)), conferindo o checksum e sem pedir admin (`scripts/instalar-effectcraft.ps1`).
- **Python, FFmpeg e faster-whisper:** o Claude instala na primeira vez, pedindo permissão.

No PowerShell:

```powershell
git clone https://github.com/artticodesigner/motion "$env:USERPROFILE\.claude\skills\motion"
```

Pra atualizar depois:

```powershell
git -C "$env:USERPROFILE\.claude\skills\motion" pull
```

## Como usar

No Claude Code, em qualquer pasta:

```
/motion C:\caminho\do\video.mp4
```

Ou peça em linguagem natural: "faz um motion desse vídeo: C:\...\video.mp4".

O resultado sai numa pasta `saida` ao lado do vídeo: o MP4 final, o projeto `.ecproj` editável no EffectCraft, o script `build.jsx` e os logos usados.

## Conteúdo

| Caminho | O que é |
|---|---|
| `SKILL.md` | instruções da skill: estilo, fluxo, notas técnicas do EffectCraft |
| `scripts/instalar-effectcraft.ps1` | acha o EffectCraft ou instala a versão portátil oficial (com checagem SHA-256) |
| `scripts/transcribe.py` | transcrição PT-BR com faster-whisper (tempo por palavra) |
| `references/exemplo-build.jsx` | script completo de um vídeo aprovado, usado como base |
| `assets/` | logos prontos: Arttico, Instagram, TikTok |
