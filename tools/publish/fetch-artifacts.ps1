param(
  [Parameter(Mandatory = $true)][string]$Version,
  [Parameter(Mandatory = $true)][string]$OutRoot,
  [Parameter(Mandatory = $true)][string]$ZipPath
)

# Stage matching files into a temp folder, flattened to <channel>/<file>.
# The platform segment isn't added here - fetch-winbuild-artifacts.sh already
# unzips this into a platform-scoped directory (artifacts/win32/...), and
# upload-artifacts-gcs.sh adds it again on the way to
# gs://<bucket>/harvester/<channel>/<platform>/<file>. <channel> is the first
# path segment under $OutRoot (e.g. prodbeta).
Write-Host "Staging artifacts matching *$Version* under $OutRoot (excluding development/devlive)..."
$staging = Join-Path $env:TEMP "thecoin-artifacts-staging"
Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $staging | Out-Null

# development/devlive builds are never uploaded/distributed - skip them.
$ExcludedChannels = 'development', 'devlive'

$files = Get-ChildItem -Path $OutRoot -Recurse -File | Where-Object {
  ($_.Name -like "*$Version*" -or $_.Name -eq 'RELEASES') -and
  ($ExcludedChannels -notcontains ($_.FullName.Substring($OutRoot.Length).TrimStart('\', '/') -split '[\\/]')[0])
}
$fileCount = ($files | Measure-Object).Count
Write-Host "Found $fileCount matching file(s)."

$copied = 0
foreach ($f in $files) {
  $rel = $f.FullName.Substring($OutRoot.Length).TrimStart('\', '/')
  $channel = ($rel -split '[\\/]')[0]
  $dest = Join-Path $staging (Join-Path $channel $f.Name)
  New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
  Copy-Item $f.FullName $dest
  $copied++
  if ($copied % 10 -eq 0 -or $copied -eq $fileCount) {
    Write-Host "Copied $copied/$fileCount files..."
  }
}
Write-Host "Copied $copied file(s). Compressing to $ZipPath..."

Compress-Archive -Path "$staging\*" -DestinationPath $ZipPath -Force
Remove-Item -Recurse -Force $staging
Write-Host "Compression complete: $ZipPath"
