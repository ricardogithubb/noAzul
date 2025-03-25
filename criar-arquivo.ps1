$rootFolder = "D:\Meus Arquivos\Projetos\noAzul"

# Criar pasta raiz se não existir
if (!(Test-Path $rootFolder)) {
    New-Item -ItemType Directory -Path $rootFolder
}

# Criar arquivos HTML
$files = @("index.html", "dashboard.html", "receitas.html", "despesas.html", "transacoes.html", "categorias.html", "orcamentos.html")
foreach ($file in $files) {
    New-Item -ItemType File -Path "$rootFolder\$file" -Force
}

# Criar pastas CSS e JS
$folders = @("css", "js", "img")
foreach ($folder in $folders) {
    $path = "$rootFolder\$folder"
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path
    }
}

# Criar arquivos CSS
$cssFiles = @("style.css", "dashboard.css", "receitas.css", "despesas.css", "transacoes.css", "categorias.css", "orcamentos.css")
foreach ($file in $cssFiles) {
    New-Item -ItemType File -Path "$rootFolder\css\$file" -Force
}

# Criar arquivos JS
$jsFiles = @("script.js", "dashboard.js", "receitas.js", "despesas.js", "transacoes.js", "categorias.js", "orcamentos.js")
foreach ($file in $jsFiles) {
    New-Item -ItemType File -Path "$rootFolder\js\$file" -Force
}

Write-Host "Estrutura de arquivos e pastas criada com sucesso!"
