<#
  Garante que o EffectCraft (CLI) está disponível e imprime o caminho do effectcraft-cli.exe na última linha.

  VERSÃO FIXA: só existe UMA versão aceita (variável $Version abaixo) e o SHA-256 dela está gravado neste arquivo.
  - Se já existir um effectcraft-cli.exe EXATAMENTE nessa versão (em qualquer pasta conhecida), só mostra o caminho.
  - Qualquer outra versão encontrada é ignorada (não é usada nem apagada).
  - Se não existir, baixa direto do GitHub oficial (storytold/effectcraft) a versão fixa, confere o SHA-256 gravado aqui
    (se não bater, a instalação é cancelada) e extrai em %LOCALAPPDATA%\Programs\EffectCraft (sem precisar de admin).
  - NUNCA procura "a versão mais recente" e nunca atualiza sozinho. Para trocar de versão é preciso editar $Version e $Sha256
    neste arquivo de propósito (pegue os SHA-256 na página do release).
  Uso: powershell -ExecutionPolicy Bypass -File instalar-effectcraft.ps1 [-InstallDir <pasta>] [-Force]
       (-Force reinstala a versão fixa mesmo que já exista)
#>
param(
  [string]$InstallDir = (Join-Path $env:LOCALAPPDATA "Programs\EffectCraft"),
  [switch]$Force
)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# ───────── versão fixa e checksums (EffectCraft v0.21.1) ─────────
$Version = "0.21.1"
$Sha256 = @{
  "x64"   = "598e8c78483f00926f1b9f88c055f53e4c771f824f06a52ad02ab18be5c66213"
  "arm64" = "fd96b43b3821647db66213c8059345ea6f02d2d8479c7449f24c45813e53083a"
  "x86"   = "88cf701d6239ba2475c46770fb90effba54806971ffdd01c58ab56f95d204a3c"
}

function Get-CliVersion($exe) {
  try { $o = (& $exe --version 2>$null | Select-Object -First 1); return ("$o" -replace '^\s*effectcraft-cli\s+', '').Trim() } catch { return $null }
}

function Find-Cli {
  $roots = @(
    $InstallDir,
    "$env:ProgramFiles\ArtCraft\EffectCraft",
    "$env:ProgramFiles\EffectCraft",
    "$env:LOCALAPPDATA\Programs\ArtCraft",
    "$env:LOCALAPPDATA\Programs\EffectCraft"
  )
  foreach ($r in $roots) {
    if ($r -and (Test-Path $r)) {
      foreach ($hit in (Get-ChildItem $r -Recurse -Filter "effectcraft-cli.exe" -ErrorAction SilentlyContinue)) {
        if ((Get-CliVersion $hit.FullName) -eq $Version) { return $hit.FullName }
      }
    }
  }
  return $null
}

if (-not $Force) {
  $found = Find-Cli
  if ($found) { Write-Host "EffectCraft $Version já instalado."; Write-Output $found; exit 0 }
}

$arch = switch ($env:PROCESSOR_ARCHITECTURE) { "ARM64" { "arm64" } "x86" { "x86" } default { "x64" } }
$expected = $Sha256[$arch]
if (-not $expected) { throw "Arquitetura $arch sem checksum cadastrado; instalação cancelada." }
$name = "effectcraft-$Version-windows-$arch-portable.zip"
$url = "https://github.com/storytold/effectcraft/releases/download/v$Version/$name"

$tmp = Join-Path $env:TEMP ("effectcraft-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force $tmp | Out-Null
$zip = Join-Path $tmp $name
Write-Host "Baixando EffectCraft v$Version ($name)..."
$ProgressPreference = "SilentlyContinue"
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -Headers @{ "User-Agent" = "motion-skill" }

$actual = (Get-FileHash $zip -Algorithm SHA256).Hash
if ($actual.ToLower() -ne $expected.ToLower()) {
  Remove-Item $tmp -Recurse -Force
  throw "SHA-256 NÃO confere (esperado $expected, veio $actual). Nada foi instalado."
}
Write-Host "Checksum OK."

if (Test-Path $InstallDir) { Remove-Item $InstallDir -Recurse -Force }
New-Item -ItemType Directory -Force $InstallDir | Out-Null
Expand-Archive -Path $zip -DestinationPath $InstallDir -Force
Remove-Item $tmp -Recurse -Force

$cli = Get-ChildItem $InstallDir -Recurse -Filter "effectcraft-cli.exe" | Select-Object -First 1
if (-not $cli) { throw "O pacote foi extraído, mas não tem effectcraft-cli.exe em $InstallDir." }
$got = Get-CliVersion $cli.FullName
if ($got -ne $Version) { throw "Versão instalada ($got) diferente da esperada ($Version)." }
Write-Host "EffectCraft v$Version instalado em $InstallDir"
Write-Output $cli.FullName
