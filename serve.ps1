# Minimal static file server using HttpListener.
# Usage: powershell -ExecutionPolicy Bypass -File .\serve.ps1
param(
  [int]$Port = 8000,
  [string]$Root = $PSScriptRoot
)

$prefix  = "http://127.0.0.1:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.htm'  = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.ttf'  = 'font/ttf'
  '.txt'  = 'text/plain; charset=utf-8'
}

try {
  $listener.Start()
  Write-Host "Shankara POP dev server running at $prefix" -ForegroundColor Green
  Write-Host "Serving: $Root" -ForegroundColor DarkGray
  Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray

  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    try {
      $relative = [uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }

      $fullPath = Join-Path $Root $relative
      if ((Test-Path $fullPath) -and (Get-Item $fullPath).PSIsContainer) {
        $fullPath = Join-Path $fullPath 'index.html'
      }

      if (Test-Path $fullPath) {
        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
        $type = $mime[$ext]
        if (-not $type) { $type = 'application/octet-stream' }
        $res.ContentType = $type
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host ("200 {0}" -f $req.Url.AbsolutePath) -ForegroundColor DarkGreen
      } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $relative")
        $res.OutputStream.Write($msg, 0, $msg.Length)
        Write-Host ("404 {0}" -f $req.Url.AbsolutePath) -ForegroundColor DarkYellow
      }
    } catch {
      $res.StatusCode = 500
      $msg = [System.Text.Encoding]::UTF8.GetBytes("500: $($_.Exception.Message)")
      $res.OutputStream.Write($msg, 0, $msg.Length)
      Write-Host ("500 {0}: {1}" -f $req.Url.AbsolutePath, $_.Exception.Message) -ForegroundColor Red
    } finally {
      $res.OutputStream.Close()
    }
  }
} finally {
  if ($listener.IsListening) { $listener.Stop() }
  $listener.Close()
}
