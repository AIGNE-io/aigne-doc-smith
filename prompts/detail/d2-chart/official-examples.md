以下是 d2 官方提供的一些示例，拥有比较好的展示效果，在实际生成图表的时候，可以参考官方示例的使用方式，来提升图表的表现力

- Bank Securities
  ```d2
  bank: {
    style.fill: white
    Corporate:   {
      style.fill: white
      app14506: Data Source\ntco:      100,000\nowner: Lakshmi  {
        style:  {
          fill: '#fce7c6'
        }
      }
    }
    Equities:   {
      app14491: Risk Global\ntco:      600,000\nowner: Wendy  {
        style:  {
          fill: '#f6c889'
        }
      }
      app14492: Credit guard\ntco:      100,000\nowner: Lakshmi  {
        style:  {
          fill: '#fce7c6'
        }
      }
      app14520: Seven heaven\ntco:      100,000\nowner: Tomos  {
        style:  {
          fill: '#fce7c6'
        }
      }
      app14522: Apac Ace\ntco:      400,000\nowner: Wendy  {
        style:  {
          fill: '#f9d8a7'
        }
      }
      app14527: Risk Global\ntco:      900,000\nowner: Tomos  {
        style:  {
          fill: '#f4b76c'
        }
      }
    }
    Securities:   {
      style.fill: white
      app14517: Zone out\ntco:      500,000\nowner: Wendy  {
        style:  {
          fill: '#f6c889'
        }
      }
    }
    Finance:   {
      style.fill: white
      app14488: Credit guard\ntco:      700,000\nowner: India  {
        style:  {
          fill: '#f6c889'
        }
      }
      app14502: Ark Crypto\ntco:    1,500,000\nowner: Wendy  {
        style:  {
          fill: '#ed800c'
        }
      }
      app14510: Data Solar\ntco:    1,200,000\nowner: Deepak  {
        style:  {
          fill: '#f1a64f'
        }
      }
    }
    Risk:   {
      style.fill: white
      app14490: Seven heaven\ntco:            0\nowner: Joesph  {
        style:  {
          fill: '#fce7c6'
        }
      }
      app14507: Crypto Bot\ntco:    1,100,000\nowner: Wendy  {
        style:  {
          fill: '#f1a64f'
        }
      }
    }
    Funds:   {
      style.fill: white
      app14497: Risk Global\ntco:      500,000\nowner: Joesph  {
        style:  {
          fill: '#f6c889'
        }
      }
    }
    Fixed Income:   {
      style.fill: white
      app14523: ARC3\ntco:      600,000\nowner: Wendy  {
        style:  {
          fill: '#f6c889'
        }
      }
      app14500: Acmaze\ntco:      100,000\nowner: Tomos  {
        style:  {
          fill: '#fce7c6'
        }
      }
    }
  }
  bank.Risk.app14490 -> bank.Equities.app14527: client master
  bank.Equities.app14491 -> bank.Equities.app14527: greeks  {
    style:  {
      stroke-dash: 5
      animated: true
      stroke: red
    }
  }
  bank.Funds.app14497 -> bank.Equities.app14520: allocations  {
    style:  {
      stroke-dash: 5
      animated: true
      stroke: brown
    }
  }
  bank.Equities.app14527 -> bank.Corporate.app14506: trades  {
    style:  {
      stroke-dash: 5
      animated: false
      stroke: blue
    }
  }
  bank.Fixed Income.app14523 -> bank.Equities.app14491: orders  {
    style:  {
      stroke-dash: 10
      animated: false
      stroke: green
    }
  }
  bank.Finance.app14488 -> bank.Equities.app14527: greeks  {
    style:  {
      stroke-dash: 5
      animated: true
      stroke: red
    }
  }
  bank.Equities.app14527 -> bank.Equities.app14522: orders  {
    style:  {
      stroke-dash: 10
      animated: false
      stroke: green
    }
  }
  bank.Equities.app14522 -> bank.Finance.app14510: orders  {
    style:  {
      stroke-dash: 10
      animated: false
      stroke: green
    }
  }
  bank.Equities.app14527 -> bank.Finance.app14502: greeks  {
    style:  {
      stroke-dash: 5
      animated: true
      stroke: red
    }
  }
  bank.Equities.app14527 -> bank.Risk.app14507: allocations  {
    style:  {
      stroke-dash: 5
      animated: true
      stroke: brown
    }
  }
  bank.Securities.app14517 -> bank.Equities.app14492: trades  {
    style:  {
      stroke-dash: 5
      animated: false
      stroke: blue
    }
  }
  bank.Equities.app14522 -> bank.Fixed Income.app14500: security reference
  ```
- Udp Tunnel
  ```d2
  shape: sequence_diagram

  backend_server
  local_server
  ssh_server
  other_server

  启动阶段: {
    local_server->ssh_server:ssh_login
    local_server<-ssh_server:ssh 登录成功
    local_server->ssh_server:sftp_copy 辅助转发服务器
    local_server->ssh_server:ssh  启动转发服务器
  }

  启动成功运行阶段:{
    other_server->ssh_server.a:请求udp packet{
      style.animated: true
      style.stroke: red
    }

    ssh_server.a->local_server.a:udp forward 发送给 udp client {
      style.animated: true
      style.stroke: red
    }

    local_server.a->backend_server.a: "udp 转发给 udp server"{
      style.animated: true
      style.stroke: red
    }

    backend_server.b->local_server.b:发送ok字符串给 udp的请求端{
      style.animated: true
      style.stroke: green
    }

    ssh_server.b<-local_server.b: 发送给 ssh 所在的 udp forawrd {
      style.animated: true
      style.stroke: green
    }

    other_server<-ssh_server.b:返回udp 请求回复{
      style.animated: true
      style.stroke:green
    }
    other_server.一次交互完成
  }
  ```
- Llm Framework Architecture
  ```d2
  vars: {
    d2-config: {
      theme-id: 3 # terrastruct
      sketch: true
      layout-engine: elk
    }
    colors: {
      c2: "#C7F1FF" # light turkuaz
      c3: "#B5AFF6" # dark purple
      c4: "#DEE1EB" # gray
      c5: "#88DCF7" # turkuaz
      c6: "#E4DBFE" # purple
    }
  }

  LangUnits: {
    style.fill: ${colors.c6}
    RegexVal: {
      ds
    }
    SQLSelect: {
      ds
    }
    PythonTr: {
      ds
    }
    langunit ₙ: {
      style.multiple: true
      style.stroke-dash: 10
      style.stroke: black
      style.animated: 1
      "... ds"
    }
  }

  LangUnits <- ExperimentHost.Dataset: "load dataset"
  Dataset UI -> LangUnits: "manage datasets"

  Dataset UI: {
    style.fill: ${colors.c4}
  }

  ExperimentHost: {
    style.fill: ${colors.c4}
    Experiment: {
      style.multiple: true
    }
    Dataset
    # Experiment <-> Dataset
  }
  ExperimentHost.Experiment -> Experiment

  Experiment.ModelConfigurations: {
    style.multiple: true
  }
  Experiment.LangUnit

  Experiment.ModelConfigurations -> ModelConfiguration

  ModelConfiguration.Prompting
  ModelConfiguration.Model
  ModelConfiguration.LangUnit
  ```
- 综合案例 - Terraform Resources:
  ```d2
  vars: {
    d2-config: {
      layout-engine: elk
    }
  }

  *.style.font-size: 22
  *.*.style.font-size: 22

  title: |md
    # Terraform resources (v1.0.0)
  | {near: top-center}

  direction: right

  project_connection: {
    style: {
      fill: "#C5C6C7"
      stroke: grey
    }
  }

  privatelink_endpoint: {tooltip: Datasource only}
  group
  group_partial_permissions
  service_token
  job: {
    style: {
      fill: "#ACE1AF"
      stroke: green
    }
  }

  conns: Connections (will be removed in the future,\nuse global_connection) {
    bigquery_connection
    fabric_connection
    connection

    bigquery_connection.style.fill: "#C5C6C7"
    fabric_connection.style.fill: "#C5C6C7"
    connection.style.fill: "#C5C6C7"
  }
  conns.style.fill: "#C5C6C7"

  env_creds: Environment Credentials {
    grid-columns: 2
    athena_credential
    databricks_credential
    snowflake_credential
    bigquery_credential
    fabric_credential
    postgres_credential: {tooltip: Is used for Redshift as well}
    teradata_credential
  }

  service_token -- project: can scope to {
    style: {
      stroke-dash: 3
    }
  }
  group -- project
  group_partial_permissions -- project
  user_groups -- group
  user_groups -- group_partial_permissions
  project -- environment
  project -- snowflake_semantic_layer_credential
  job -- environment
  job -- environment_variable_job_override
  notification -- job
  partial_notification -- job

  webhook -- job: triggered by {
    style: {
      stroke-dash: 3
    }
  }
  environment -- global_connection
  environment -- conns
  global_connection -- privatelink_endpoint
  global_connection -- oauth_configuration

  environment -- env_creds
  conns -- privatelink_endpoint
  project -- project_repository
  lineage_integration -- project
  project_repository -- repository
  environment -- environment_variable
  environment -- partial_environment_variable
  environment -- extended_attributes
  environment -- semantic_layer_configuration
  model_notifications -- environment

  project -- project_connection {
    style: {
      stroke: "#C5C6C7"
    }
  }
  project_connection -- conns {
    style: {
      stroke: "#C5C6C7"
    }
  }

  (job -- *)[*].style.stroke: green
  (* -- job)[*].style.stroke: green

  account_level_settings: "Account level settings" {
    account_features
    ip_restrictions_rule
    license_map
    partial_license_map
  }
  account_level_settings.style.fill-pattern: dots
  ```
- Game State Sequence
  ```d2
  shape: sequence_diagram

  User
  Session
  Lua

  User."Init"

  User.t1 -> Session.t1: "SetupFight()"
  Session.t1 -> Session.t1: "Create clean fight state"
  Session.t1 -> Lua: "Trigger OnPlayerTurn"
  User.t1 <- Session.t1

  User."Repeat"

  User.mid -> Session.mid: "PlayerCastHand() etc."
  Session.mid -> Lua: "Trigger OnDamage etc."
  User.mid <- Session.mid

  User.t2 -> Session.t2: "FinishPlayerTurn()"
  Session.t2 -> Lua: "Trigger OnTurn"
  Session.t2 -> Session.t2: "Update and remove status effects"
  Session.t2 -> Lua: "Trigger OnPlayerTurn"
  User.t2 <- Session.t2
  ```
- Golang Queue
  ```d2
  direction: right

  classes: {
    base: {
      style: {
        bold: true
        font-size: 28
      }
    }

    person: {
      shape: person
    }

    animated: {
      style: {
        animated: true
      }
    }

    multiple: {
      style: {
        multiple: true
      }
    }

    enqueue: {
      label: Enqueue Task
    }

    dispatch: {
      label: Dispatch Task
    }

    library: {
      style: {
        bold: true
        font-size: 32
        fill: PapayaWhip
        fill-pattern: grain
        border-radius: 8
        font: mono
      }
    }

    task: {
      style: {
        bold: true
        font-size: 32
      }
    }
  }

  user01: {
    label: User01
    class: [base; person; multiple]
  }

  user02: {
    label: User02
    class: [base; person; multiple]
  }

  user03: {
    label: User03
    class: [base; person; multiple]
  }

  user01 -> container.task01: {
    label: Create Task
    class: [base; animated]
  }
  user02 -> container.task02: {
    label: Create Task
    class: [base; animated]
  }
  user03 -> container.task03: {
    label: Create Task
    class: [base; animated]
  }

  container: Application {
    direction: right
    style: {
      bold: true
      font-size: 28
    }
    icon: https://icons.terrastruct.com/dev%2Fgo.svg

    task01: {
      icon: https://icons.terrastruct.com/essentials%2F092-graph%20bar.svg
      class: [task; multiple]
    }

    task02: {
      icon: https://icons.terrastruct.com/essentials%2F095-download.svg
      class: [task; multiple]
    }

    task03: {
      icon: https://icons.terrastruct.com/essentials%2F195-attachment.svg
      class: [task; multiple]
    }

    queue: {
      label: Queue Library
      icon: https://icons.terrastruct.com/dev%2Fgo.svg
      style: {
        bold: true
        font-size: 32
        fill: honeydew
      }

      producer: {
        label: Producer
        class: library
      }

      consumer: {
        label: Consumer
        class: library
      }

      database: {
        label: Ring\nBuffer
        shape: cylinder
        style: {
          bold: true
          font-size: 32
          fill-pattern: lines
          font: mono
        }
      }

      producer -> database
      database -> consumer
    }

    worker01: {
      icon: https://icons.terrastruct.com/essentials%2F092-graph%20bar.svg
      class: [task]
    }

    worker02: {
      icon: https://icons.terrastruct.com/essentials%2F095-download.svg
      class: [task]
    }

    worker03: {
      icon: https://icons.terrastruct.com/essentials%2F092-graph%20bar.svg
      class: [task]
    }

    worker04: {
      icon: https://icons.terrastruct.com/essentials%2F195-attachment.svg
      class: [task]
    }

    task01 -> queue.producer: {
      class: [base; enqueue]
    }
    task02 -> queue.producer: {
      class: [base; enqueue]
    }
    task03 -> queue.producer: {
      class: [base; enqueue]
    }
    queue.consumer -> worker01: {
      class: [base; dispatch]
    }
    queue.consumer -> worker02: {
      class: [base; dispatch]
    }
    queue.consumer -> worker03: {
      class: [base; dispatch]
    }
    queue.consumer -> worker04: {
      class: [base; dispatch]
    }
  }
  ```
- Lambda Infra
  ```d2
  direction: right

  github: GitHub {
    shape: image
    icon: https://icons.terrastruct.com/dev%2Fgithub.svg
    style: {
      font-color: green
      font-size: 30
    }
  }

  github_actions: GitHub Actions {
    lambda_action: Lambda Action {
      icon: https://icons.terrastruct.com/dev%2Fgithub.svg
      style.multiple: true
    }
    style: {
      stroke: blue
      font-color: purple
      stroke-dash: 3
      fill: white
    }
  }

  aws: AWS Cloud VPC {
    style: {
      font-color: purple
      fill: white
      opacity: 0.5
    }
    lambda01: Lambda01 {
      icon: https://icons.terrastruct.com/aws%2FCompute%2FAWS-Lambda.svg
      shape: parallelogram
      style.fill: "#B6DDF6"
    }
    lambda02: Lambda02 {
      icon: https://icons.terrastruct.com/aws%2FCompute%2FAWS-Lambda.svg
      shape: parallelogram
      style.fill: "#B6DDF6"
    }
    lambda03: Lambda03 {
      icon: https://icons.terrastruct.com/aws%2FCompute%2FAWS-Lambda.svg
      shape: parallelogram
      style.fill: "#B6DDF6"
    }
  }

  github -> github_actions: GitHub Action Flow {
    style: {
      animated: true
      font-size: 20
    }
  }
  github_actions -> aws.lambda01: Update Lambda {
    style: {
      animated: true
      font-size: 20
    }
  }
  github_actions -> aws.lambda02: Update Lambda {
    style: {
      animated: true
      font-size: 20
    }
  }
  github_actions -> aws.lambda03: Update Lambda {
    style: {
      animated: true
      font-size: 20
    }
  }

  explanation: |md
    ```yaml
    deploy_source:
      name: deploy lambda from source
      runs-on: ubuntu-latest
      steps:
        - name: checkout source code
          uses: actions/checkout@v3
        - name: default deploy
          uses: appleboy/lambda-action@v0.1.7
          with:
            aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
            aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            aws_region: ${{ secrets.AWS_REGION }}
            function_name: gorush
            source: example/index.js
    ```
  | {near: bottom-center}
  ```
