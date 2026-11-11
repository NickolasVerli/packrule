$ErrorActionPreference = 'Stop'
$raizProjeto = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$pastaFerramentas = Join-Path $raizProjeto '.ferramentas'
$executavelMaven = Join-Path $pastaFerramentas 'apache-maven-3.9.11/bin/mvn.cmd'

if (-not (Test-Path -LiteralPath $executavelMaven)) {
    New-Item -ItemType Directory -Force -Path $pastaFerramentas | Out-Null
    $arquivoMaven = Join-Path $pastaFerramentas 'maven.zip'
    $enderecoMaven = 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.11/apache-maven-3.9.11-bin.zip'
    Invoke-WebRequest -UseBasicParsing -Uri $enderecoMaven -OutFile $arquivoMaven
    $somaEsperada = '03e2d65d4483a3396980629f260e25cac0d8b6f7f2791e4dc20bc83f9514db8d0f05b0479e699a5f34679250c49c8e52e961262ded468a20de0be254d8207076'
    if ((Get-FileHash -LiteralPath $arquivoMaven -Algorithm SHA512).Hash.ToLowerInvariant() -ne $somaEsperada) {
        throw 'A verificação SHA-512 do Maven falhou. O arquivo não será executado.'
    }
    Expand-Archive -LiteralPath $arquivoMaven -DestinationPath $pastaFerramentas -Force
}

Push-Location $PSScriptRoot
try {
    & $executavelMaven "-Dmaven.repo.local=$pastaFerramentas/m2" @args
    $codigoSaida = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $codigoSaida
