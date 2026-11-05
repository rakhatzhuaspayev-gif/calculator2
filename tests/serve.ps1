# Serves index.html on http://localhost:8765.
param([int]$Port = 8765)

$page = Join-Path $PSScriptRoot '..\index.html'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving http://localhost:$Port/"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $response = $context.Response
    if ($context.Request.Url.AbsolutePath -eq '/') {
        $bytes = [IO.File]::ReadAllBytes($page)
        $response.ContentType = 'text/html; charset=utf-8'
        $response.Headers.Add('Cache-Control', 'no-store')
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.Close()
}
