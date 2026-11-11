$ErrorActionPreference = 'Stop'
$raizProjeto = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$pastaInstalacao = Join-Path $env:LOCALAPPDATA 'Programs/Tesseract-OCR'
$comandoDisponivel = Get-Command tesseract -ErrorAction SilentlyContinue
$candidatos = @(
    $env:OCR_COMANDO,
    (Join-Path $pastaInstalacao 'tesseract.exe'),
    (Join-Path $env:ProgramFiles 'Tesseract-OCR/tesseract.exe'),
    $comandoDisponivel.Source
)
$executavel = $candidatos | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Leaf) } | Select-Object -First 1

if (-not $executavel) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw 'Instale o Tesseract e configure OCR_COMANDO no .env. O winget não está disponível.'
    }
    & winget install --id tesseract-ocr.tesseract --version 5.5.3 --exact --source winget --silent `
        --override "/S /CurrentUser /D=$pastaInstalacao" `
        --accept-package-agreements --accept-source-agreements --disable-interactivity
    if ($LASTEXITCODE -ne 0) {
        throw "A instalação do Tesseract falhou com o código $LASTEXITCODE."
    }
    $executavel = Join-Path $pastaInstalacao 'tesseract.exe'
    if (-not (Test-Path -LiteralPath $executavel -PathType Leaf)) {
        throw 'O executável do Tesseract não foi encontrado após a instalação.'
    }
}

$pastaIdiomas = Join-Path (Split-Path -Parent $executavel) 'tessdata'
if (-not (Test-Path -LiteralPath $pastaIdiomas -PathType Container)) {
    New-Item -ItemType Directory -Force -Path $pastaIdiomas | Out-Null
}
$idiomas = @('por', 'eng', 'deu', 'spa', 'fra')
foreach ($idioma in $idiomas) {
    $arquivo = Join-Path $pastaIdiomas "$idioma.traineddata"
    if (-not (Test-Path -LiteralPath $arquivo -PathType Leaf)) {
        Invoke-WebRequest -UseBasicParsing `
            -Uri "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/4.1.0/$idioma.traineddata" `
            -OutFile $arquivo
    }
}

& $executavel --list-langs
if ($LASTEXITCODE -ne 0) {
    throw 'O Tesseract não conseguiu carregar os idiomas. A configuração do projeto não foi alterada.'
}

$arquivoConfiguracao = Join-Path $raizProjeto '.env'
$origemConfiguracao = if (Test-Path -LiteralPath $arquivoConfiguracao) {
    $arquivoConfiguracao
} else {
    Join-Path $raizProjeto '.env.example'
}
$linhas = @(Get-Content -LiteralPath $origemConfiguracao -Encoding UTF8)
$valores = [ordered]@{
    OCR_COMANDO = $executavel.Replace('\', '/')
    OCR_IDIOMAS = $idiomas -join '+'
}
foreach ($chave in $valores.Keys) {
    $encontrada = $false
    for ($indice = 0; $indice -lt $linhas.Length; $indice++) {
        if ($linhas[$indice].StartsWith("$chave=")) {
            $linhas[$indice] = "$chave=$($valores[$chave])"
            $encontrada = $true
        }
    }
    if (-not $encontrada) {
        $linhas += "$chave=$($valores[$chave])"
    }
}
[System.IO.File]::WriteAllLines($arquivoConfiguracao, [string[]]$linhas, [System.Text.UTF8Encoding]::new($false))
Write-Output 'OCR configurado para português, inglês, alemão, espanhol e francês. Reinicie o backend.'
