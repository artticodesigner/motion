<#
  Garante que o EffectCraft (CLI) está disponível e imprime o caminho do effectcraft-cli.exe na última linha.
  - Se já estiver instalado (ArtCraft, instalação MSI ou portátil anterior), só mostra o caminho.
  - Senão baixa a versão portátil mais recente do GitHub oficial (storytold/effectcraft),
    confere o SHA-256 publicado no release e extrai em %LOCALAPPDATA%\Programs\EffectCraft (sem precisar de admin).
  Uso: powershell -ExecutionPolicy Bypass -File instalar-effectcraft.ps1 [-InstallDir <pasta>] [-Force]
#>
param(
  [string]$InstallDir = (Join-Path $env:LOCALAPPDATA "Programs\EffectCraft"),
  [switch]$Force
)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

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
      $hit = Get-ChildItem $r -Recurse -Filter "effectcraft-cli.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($hit) { return $hit.FullName }
    }
  }
  $cmd = Get-Command effectcraft-cli -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

if (-not $Force) {
  $found = Find-Cli
  if ($found) { Write-Host "EffectCraft já instalado."; Write-Output $found; exit 0 }
}

$arch = switch ($env:PROCESSOR_ARCHITECTURE) { "ARM64" { "arm64" } "x86" { "x86" } default { "x64" } }
Write-Host "Buscando a versão mais recente do EffectCraft (windows-$arch)..."
$rel = Invoke-RestMethod -Uri "https://api.github.com/repos/storytold/effectcraft/releases/latest" -Headers @{ "User-Agent" = "motion-skill" }
$asset = $rel.assets | Where-Object { $_.name -match "^effectcraft-[\d\.]+-windows-$arch-portable\.zip$" } | Select-Object -First 1
if (-not $asset) { throw "Release $($rel.tag_name) não tem o pacote portátil windows-$arch." }

$tmp = Join-Path $env:TEMP ("effectcraft-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force $tmp | Out-Null
$zip = Join-Path $tmp $asset.name
Write-Host "Baixando $($asset.name) ($([math]::Round($asset.size / 1MB)) MB)..."
$ProgressPreference = "SilentlyContinue"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing -Headers @{ "User-Agent" = "motion-skill" }

# conferir o SHA-256 (digest do asset; se não houver, usa o SHA256SUMS.txt do release)
$expected = $null
if ($asset.digest -and $asset.digest -like "sha256:*") { $expected = $asset.digest.Substring(7) }
else {
  $sums = $rel.assets | Where-Object { $_.name -eq "SHA256SUMS.txt" } | Select-Object -First 1
  if ($sums) {
    $txt = (Invoke-WebRequest -Uri $sums.browser_download_url -UseBasicParsing -Headers @{ "User-Agent" = "motion-skill" }).Content
    if ($txt -is [byte[]]) { $txt = [Text.Encoding]::UTF8.GetString($txt) }
    $line = ($txt -split "`n") | Where-Object { $_ -match [regex]::Escape($asset.name) } | Select-Object -First 1
    if ($line) { $expected = ($line -split "\s+")[0] }
  }
}
if (-not $expected) { throw "Não achei o SHA-256 publicado para $($asset.name); instalação cancelada." }
$actual = (Get-FileHash $zip -Algorithm SHA256).Hash
if ($actual.ToLower() -ne $expected.ToLower()) { throw "SHA-256 não confere (esperado $expected, veio $actual). Instalação cancelada." }
Write-Host "Checksum OK."

if (Test-Path $InstallDir) { Remove-Item $InstallDir -Recurse -Force }
New-Item -ItemType Directory -Force $InstallDir | Out-Null
Expand-Archive -Path $zip -DestinationPath $InstallDir -Force
Remove-Item $tmp -Recurse -Force

$cli = Get-ChildItem $InstallDir -Recurse -Filter "effectcraft-cli.exe" | Select-Object -First 1
if (-not $cli) { throw "O pacote foi extraído, mas não tem effectcraft-cli.exe em $InstallDir." }
Write-Host "EffectCraft $($rel.tag_name) instalado em $InstallDir"
Write-Output $cli.FullName
