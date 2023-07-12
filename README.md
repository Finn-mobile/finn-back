# Finn Mobile - Um projeto para a disciplina de desenvolvimento mobile - UFRPE 2022.2

## Colaboradores :

- Felipe Bernard
- Filipe Paz
- João Leite
- Matheus Santos
- Thales Araujo

## Install

- Baixe e instale o Node JS na sua máquina

  - Deve retornar a versão do node :
    ```shell
    $ node -v
    ```
  - Deve retornar a versão do npm :
    ```shell
    $ npm -v
    ```

- Instale as dependencias
  ```shell
  $ npm install
  ```

## .env setup

- Usando o [.env_template](.env_template)
  - Crie um novo arquivo .env
  - Troque o coloque seus valores no lugar de user, password e your_db

## Usage

- Semeie o banco de dados
  ```shell
  $ npx prisma db seed
  ```
- Inicie o server
  ```shell
  $ npm run dev
  ```
