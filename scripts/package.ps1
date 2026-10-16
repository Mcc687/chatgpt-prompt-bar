$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $projectRoot "manifest.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$distDir = Join-Path $projectRoot "dist"
$zipPath = Join-Path $distDir ("chatgpt-prompt-bar-v" + $manifest.version + ".zip")

New-Item -ItemType Directory -Path $distDir -Force | Out-Null
if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

$runtimeFiles = @(
  (Join-Path $projectRoot "manifest.json"),
  (Join-Path $projectRoot "popup.html"),
  (Join-Path $projectRoot "popup.css"),
  (Join-Path $projectRoot "popup.js"),
  (Join-Path $projectRoot "README.md"),
  (Join-Path $projectRoot "PRIVACY.md"),
  (Join-Path $projectRoot "LICENSE"),
  (Join-Path $projectRoot "src")
)

Compress-Archive -LiteralPath $runtimeFiles -DestinationPath $zipPath -CompressionLevel Optimal
Write-Output $zipPath
