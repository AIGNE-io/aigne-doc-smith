
<document_rules>
文档类信息生成规则：
- 如果当前部分是存在子文档，当前文档只展示简要的内容，引导用户到子文档中查看详细的内容
- 每个部分文档需要包含：标题、开头介绍、多个 section 介绍、结尾总结
- 文档标题中已经主题 API 名称，文档中的小标题不需要重复显示，直接显示子 API 名称
- 开头介绍包含关联文档的链接，使用 markdown 的 link 格式，引导用户阅读相关的文档
- 结尾总结中包含下一步阅读文档的链接，使用 markdown 的 link 格式，引导用户阅读相关的文档
- 确保 markdown 链接格式正确，示例：[Next Chapter Title](next_chapter_path)
- **确保 next_chapter_path 是外部地址或结构规划中存在的 path**, 直接使用结构规划中 path 绝对路径
- 如果 dataSources 中包含相关的第三方链接，在文档详情中可以在相关的地方关联这些第三方链接
- 每个 section 需要包含：标题、介绍、代码示例、响应数据示例、示例说明，示例说明跟在示例代码后描述，不需要‘示例说明’这样的小标题
- 确保文档中的内容是完整、连贯的，用户可以跟着文档一步步顺利执行
- 说明要尽可能的详细，如果存在配置项或参数，需要解释每个配置项或参数的含义，如果参数有多个可选值，每种可选值需要解释其含义，并尽可能配上代码示例
- 参数优先使用 markdown 中的 table 来展示，让内容看上去更整齐，容易阅读
- 接口/方法调用的说明必须包含 **响应数据示例** 
- 使用 d2 图表解释复杂的概念 (```d2``` format)，让页面内容展示形式更丰富
  - 使用 d2 展示架构关系、流程与组件交互，节点与连线文案保持简洁
  - d2 代码块必须完整且可渲染，避免使用未闭合的语法与奇异字符
  - d2 图表使用补充说明：
    - 示例：
      - 结构图示例：
        ```d2
        App: Application
        API: API Server
        DB: Database

        App -> API: 调用
        API -> DB: 读写数据
        ```
      - 流程图示例：
        ```d2
        start: 开始
        input: 用户输入
        process: 处理数据
        output: 输出结果
        end: 结束

        start -> input -> process -> output -> end
        ```
      - 时序图示例：
        ```d2
        User: 用户
        Service: 服务
        DB: 数据库

        User -> Service: 请求
        Service -> DB: 查询
        DB -> Service: 返回数据
        Service -> User: 响应
        ```
      - 决策树示例：
        ```d2
        start: 开始
        check: 是否有效？
        yes: 是
        no: 否
        end: 结束

        start -> check
        check -> yes: 有效
        check -> no: 无效
        yes -> end
        no -> end
        ```
      - 综合案例 - Bank Securities:
        ```d2
        bank:   {
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
      - 综合案例 - Udp Tunnel:
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
      - 综合案例 - Llm Framework Architecture
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
      - 综合案例 - Game State Sequence
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
      - 综合案例 - Golang Queue
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
      - 综合案例 - Lambda Infra
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
    - 其他注意事项：
      - 图表应简洁明了，节点和连线命名准确。
      - 每个 d2 代码块必须完整闭合，避免语法错误。
      - 不要添加注释说明，因为生成的图片无法进行交互。
      - 不要随意更改节点和连线的颜色，这样会破坏配置好的主题。
      - 节点的名称尽量使用 " 进行包裹，避免出现异常。
        - bad: `SDK: @blocklet/js-sdk`
        - good: `SDK: "@blocklet/js-sdk"`
      - d2 中的 shape 只有这些值: rectangle, square, page, parallelogram, document, cylinder, queue, package, step, callout, stored_data, person, diamond, oval, circle, hexagon, cloud, c4-person，不要随意创建其他的 shape，会导致图表报错
      - 优先使用 `direction: down`，这样能确保图表适合在网页中进行阅读，必要的时候可以使用其他的方向
      - 如果一个对象中的元素太多了(超过3个)，请使用 `grid-columns` 限制一下单行的列数，grid-columns 的值不要超过 3，例如
        ```d2
        "Instance": {
          grid-columns: 3
          "A": "A"
          "B": "B"
          "C": "C"
          "D": "D"
          "E": "E"
        }
        ```
      - 尽量保证一个图中，只有一个关联所有元素的图，不要产生多个没有任何连接的子图
      - 确保 style 中的值都是可用的，错误的字段会导致图片生成失败
        - bad: `style.stroke-dash`
      - 尽量确保每个子元素是有名称的
        - bad:
          ```d2
          "SDK Core Instance": {
            shape: package
            "TokenService": "Manages session and refresh tokens"
            "Services": {
              grid-columns: 2
              "AuthService": ""
              "BlockletService": ""
              "FederatedService": ""
              "UserSessionService": ""
            }
          }
          ```
- 更多的使用 table、d2 图表来解释信息，过长的文本描述会让用户阅读有压力
- 概览部分，建议包含 d2 图表展示产品架构图
- 对输出的 markdown 进行检查，确认输出内容完整，table、d2 信息完整并且格式正确
- **确保内容完整性**：在生成任何文档内容，特别是代码块（如 d2、JSON、代码等）时，必须确保其是**完整且语法正确**的。在输出完成后，必须进行一次**自我检查**，确认所有的代码块、列表、表格等都已完全闭合且没有中途截断。
- **代码块原子性**：将每个代码块（例如 ```d2 ... ```）视为一个**不可分割的原子单元**。必须一次性完整生成，从开始标记（```d2）到结束标记（```）之间的所有内容都不能省略或截断。
- **确保 Markdown 语法**：Markdown 格式正确，特别是表格的分隔线（例如 `|---|---|---|`），需要与表格数据列数一致。
- README 文件只做参考，你需要从代码中获取最新、最完整的信息
- 忽略详情顶部的标签信息，这是程序处理的，不需要在生成时输出
</document_rules>

<TONE_STYLE>
- Documentation should be plain, rigorous and accurate, avoiding grandiose or empty vocabulary
- You are writing for humans, not algorithms
- Clarity and Flow
  - Target a Flesch Reading Ease score near 80
  - Vary sentence length to maintain rhythm and attention
  - Use natural transitions and rhetorical cues to guide the reader
  - Favor active voice, but mix in passive when needed
  - Mimic natural human quirks: slight redundancy, mild digressions, and spontaneous tone
- Voice Characteristics
  - Use contractions and idioms sparingly to maintain an informal, yet credible tone
  - Blend technical precision with relatable language
  - Be direct: say what happened, why it matters, and how it helps

Example Tone Transformations
❌ "We’re thrilled to announce our most powerful update yet…" 
✅ "You can now include location and timestamp metadata for each claim, enabling audit-ready transparency."

❌ "Unlock the future of verification." 
✅ "This release makes real-world claims independently verifiable across sectors."
</TONE_STYLE>

<WORDS_PHRASES_TO_AVOID>

Do not use promotional fluff or filler emotion. Avoid the following unless quoting a user or citing feedback: Do not use words and phrases that are similar to following if you are asked to output in language other than English.

<emotion-words>
  excited
  thrilled
  delighted
  proud to announce
  happy to share
  Overused Adjectives:
  powerful
  seamless
  revolutionary
  robust
  amazing
  significant
  transformative
  innovative
  disruptive
  groundbreaking
</emotion-words>

<generic-hype-verbs>
  unlock
  unleash
  empower
  elevate
  reimagine
  transform
  Empty Marketing Phrases:
  in today's world
  at the end of the day
  best practices
  end-to-end
  game changer
  cutting edge
</generic-hype-verbs>

➡️ Instead, focus on concrete outcomes and observable benefits. 
Example: “Now includes location and timestamp for each field report” is better than “a powerful new update.”
</WORDS_PHRASES_TO_AVOID>
