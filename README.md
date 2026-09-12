# PackRule - Pré-Verificação de Conformidade de Embalagens

Plataforma web acadêmica de pré-verificação de conformidade de embalagens, desenvolvida para a Atividade de Estudo Programada (AEP) do 4º Semestre (2026.2) de Análise e Desenvolvimento de Sistemas.

## Requisitos do Sistema

Para o MVP da aplicação, foram definidos os seguintes requisitos essenciais:

* **R01 – Cadastro e gerenciamento de produtos:** O sistema deve permitir cadastrar, consultar, editar e excluir produtos, contendo pelo menos nome, categoria e descrição. Esse será o CRUD principal da aplicação e os dados deverão ser armazenados no banco de dados.
* **R02 – Cadastro de versões da embalagem:** O sistema deve permitir adicionar diferentes versões de embalagem a um produto, armazenando o número ou identificação da versão, nome do arquivo e data de envio. As versões anteriores não devem ser substituídas quando uma nova embalagem for adicionada.
* **R03 – Envio do arquivo da embalagem:** O sistema deve permitir enviar arquivos de embalagem nos formatos PDF, PNG ou JPG e relacionar cada arquivo ao produto e à versão correspondente.
* **R04 – Leitura básica do conteúdo:** O sistema deve permitir obter conteúdo textual básico da embalagem enviada para que essas informações possam ser utilizadas nas verificações. Quando a extração automática não for suficiente, o conteúdo deverá poder ser revisado antes da análise.
* **R05 – Seleção de mercados e data:** O sistema deve permitir selecionar um ou mais mercados suportados e informar uma data de referência para a análise da embalagem.
* **R06 – Cadastro e gerenciamento de regras:** O sistema deve permitir cadastrar, consultar, editar e excluir regras utilizadas nas verificações. Cada regra deverá possuir pelo menos título, descrição, tipo, mercado aplicável, categoria de produto, severidade, data de início da vigência e fonte.
* **R07 – Execução da análise:** O sistema deve permitir executar uma análise utilizando a versão de uma embalagem, os dados do produto, os mercados selecionados e a data de referência. O sistema deverá utilizar somente as regras compatíveis com o contexto da análise.
* **R08 – Apresentação dos resultados:** O sistema deve apresentar os resultados das verificações informando pelo menos a classificação, explicação, mercado relacionado e regra utilizada. Os resultados deverão utilizar as classificações Critical, Warning, Passed ou Manual Review.
* **R09 – Histórico de análises:** O sistema deve armazenar as análises realizadas e permitir consultar posteriormente os resultados vinculados ao produto e à versão da embalagem utilizada.

---

## Cronograma de Execução

O desenvolvimento do Packrule teve início em 11 de setembro de 2026, focado na entrega da primeira etapa da AEP. Após esta fase, o desenvolvimento será dividido entre os três integrantes para que frontend, backend e banco de dados avancem de maneira paralela.

| Data | Atividade | Responsável |
| :--- | :--- | :--- |
| **03/09/2026** | Definição e delimitação do escopo do projeto | José Luiz, Nickolas Verli e Gustavo Couto |
| **03/09/2026** | Levantamento das necessidades, requisitos e regras de negócio | José Luiz, Nickolas Verli e Gustavo Couto |
| **08/09/2026** | Modelagem e elaboração do Diagrama de Classes | José Luiz e Nickolas Verli |
| **08/09/2026** | Modelagem do banco de dados e elaboração do DER | Nickolas Verli e Gustavo Couto |
| **11/09/2026** | Criação e organização do repositório GitHub e README | Nickolas Verli |
| **11/09/2026** | Revisão e preparação do documento da 1ª entrega | José Luiz, Nickolas Verli e Gustavo Couto |