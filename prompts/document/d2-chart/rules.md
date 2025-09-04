- 使用 d2 展示架构关系、流程与组件交互
- 使用 d2 图表解释复杂的概念 (```d2``` format)，让页面内容展示形式更丰富
  - 使用的 d2 的版本是 0.7.x，d2 官方的文档请查看 https://d2lang.com/tour/intro/
  - 图表应简洁明了，节点和连线命名准确，节点与连线文案保持简洁，不要太长
    - bad
      ```d2
      "TokenService": {
        label: "TokenService (Handles token storage & refresh)"
        shape: class
      }
      ```
    - good
      ```d2
      "TokenService": {
        label: "TokenService"
        shape: class
      }
      ```
  - 连线上的文字描述，尽量简洁明了，一般来说只需要使用单个词或两个词即可
    - bad:
      ```d2
      "User Login" -> "Session Creation": "User submits login form with credentials"
      ```
    - good:
      ```d2
      "User Login" -> "Session Creation": "login"
      ```
  - d2 代码块必须完整且可渲染，避免使用未闭合的语法与奇异字符，避免语法错误
  - 确保每一个节点都有 label 属性，用来表达节点的名称
  - 如果节点的 label 过长，则应该使用 `\n` 来进行换行
    - bad
      ```d2
      "AuthService": {
        label: "AuthService (Handles user authentication, profile management, privacy settings, and related actions)"
        shape: class
      }
      ```
    - good
      ```d2
      "AuthService": {
        label: "AuthService\n(Handles user authentication,\nprofile management, privacy settings,\nand related actions)"
        shape: class
      }
      ```
  - **非常重要** 如果节点的名称包含了特殊字符（如 `@`、` `、`/`, 空格等），请将名称中的特殊字符转换为 `-`，然后使用 label 来表达原始的名称，确保节点的名称一定不要使用 `"` 包裹
    - bad:
      ```d2
      "@blocklet/js-sdk": {
        shape: package

        TokenService: {
          shape: class
        }
      }
      ```
    - good:
      ```d2
      "blocklet-js-sdk": {
        shape: package
        label: "@blocklet/js-sdk

        TokenService: {
          shape: class
        }
      }
      ```
  - 必须确保每个节点和子节点是有名称的
    - bad:
      ```d2
      "SDK Core Instance": {
        shape: package
        "TokenService": "Manages session and refresh tokens"
        "Services": {
          grid-columns: 2
          "AuthService": ""
          "BlockletService": ""
        }
      }
      ```
    - good:
      ```d2
      "SDK Core Instance": {
        shape: package
        "TokenService": "Manages session and refresh tokens"
        "Services": {
          grid-columns: 2
          "AuthService": "AuthService"
          "BlockletService": "BlockletService"
        }
      }
      ```
  - 不要为节点添加 `tooltip`，保持简单即可
    - bad
      ```d2
      "AuthService": {
        label: "AuthService"
        tooltip: "Manages user profiles, privacy, and authentication actions"
        shape: class
      }
      ```
    - good
      ```d2
      "AuthService": {
        label: "AuthService"
        shape: class
      }
      ```
  - 不要随意给节点/连线填充颜色，除非节点/连线有明确的 yes/no 的状态，此时可以添加 `error`, `warning`, `success` 之类的颜色
    - bad
      ```d2
      "TokenService" {
        shape: class
        style.fill: "#fffbe6"
      }
      ```
    - good
      ```d2
      "TokenService" {
        shape: class
      }
      ```
  - 对于单个节点和连线，不要使用 `animate: true`，避免有些地方有，但有些地方没有的情况（看起来会很奇怪）
  - 连线的箭头方向必须正确，确保箭头指向关系的下游端
  - 连线的样式，尽量保持一致，不要有些实线，有些虚线的情况，除非有明确的区分意义
  - 页面的整体布局使用 `direction: down`，这样能确保图表适合在网页中进行阅读；子图中可以根据情况来使用其他的方向布局，需要确保图表的整体效果看起来不会太宽
    - bad:
      ```d2
      direction: right

      "online": {
        shape: circle
        style.fill: "#52c41a"
      }

      "offline": {
        shape: circle
        style.fill: "#faad14"
      }

      "expired": {
        shape: circle
        style.fill: "#ff4d4f"
      }

      "New Login" -> "online": "User authenticates"
      "online" -> "offline": "User closes app/browser"
      "online" -> "expired": "Token expires"
      "offline" -> "online": "User returns"
      "offline" -> "expired": "Extended inactivity"
      ```
    - good:
      ```d2
      direction: down

      "online": {
        shape: circle
        style.fill: "#52c41a"
      }

      "offline": {
        shape: circle
        style.fill: "#faad14"
      }

      "expired": {
        shape: circle
        style.fill: "#ff4d4f"
      }

      "New Login" -> "online": "User authenticates"
      "online" -> "offline": "User closes app/browser"
      "online" -> "expired": "Token expires"
      "offline" -> "online": "User returns"
      "offline" -> "expired": "Extended inactivity"
      ```
  - 如果一个节点中的字节点太多了(超过3个)，请使用 `grid-columns` 限制一下单行的列数，`grid-columns` 的值优先使用2，最大不要超过 3，例如
    - good:
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
      ```d2
      "Instance": {
        grid-columns: 2
        "A": "A"
        "B": "B"
        "C": "C"
        "D": "D"
      }
      ```
  - 每一个容器节点中，最好设置 `grid-columns`
    - bad:
      ```d2
      direction: down

      "SDK": "@blocklet/js-sdk" {
        shape: package
        
        "Core Instance": {
          shape: rectangle
          "BlockletSDK": "Main SDK Class"
        }
        
        "Services": {
          grid-columns: 3
          "AuthService": "User Authentication" {
            shape: class
          }
          "TokenService": "Token Management" {
            shape: class  
          }
          "UserSessionService": "Session Management" {
            shape: class
          }
          "BlockletService": "Blocklet Metadata" {
            shape: class
          }
          "FederatedService": "Federated Login" {
            shape: class
          }
        }
        
        "HTTP Clients": {
          grid-columns: 2
          "createAxios": "Axios-based Client" {
            shape: rectangle
          }
          "createFetch": "Fetch-based Client" {
            shape: rectangle
          }
        }
      }

      "Your App": "Application Code" {
        shape: rectangle
      }

      "Blocklet Services": "Remote APIs" {
        shape: cylinder
      }

      "Your App" -> "SDK": "Import & Use"
      "SDK" -> "Blocklet Services": "Authenticated Requests"
      "Blocklet Services" -> "SDK": "Responses & Tokens"
      ```
    - good:
      ```d2
      direction: down

      "SDK": "@blocklet/js-sdk" {
        shape: package
        grid-columns: 1
        
        "Core Instance": {
          shape: rectangle
          "BlockletSDK": "Main SDK Class"
        }
        
        "Services": {
          grid-columns: 3
          "AuthService": "User Authentication" {
            shape: class
          }
          "TokenService": "Token Management" {
            shape: class  
          }
          "UserSessionService": "Session Management" {
            shape: class
          }
          "BlockletService": "Blocklet Metadata" {
            shape: class
          }
          "FederatedService": "Federated Login" {
            shape: class
          }
        }
        
        "HTTP Clients": {
          grid-columns: 2
          "createAxios": "Axios-based Client" {
            shape: rectangle
          }
          "createFetch": "Fetch-based Client" {
            shape: rectangle
          }
        }
      }

      "Your App": "Application Code" {
        shape: rectangle
      }

      "Blocklet Services": "Remote APIs" {
        shape: cylinder
      }

      "Your App" -> "SDK": "Import & Use"
      "SDK" -> "Blocklet Services": "Authenticated Requests"
      "Blocklet Services" -> "SDK": "Responses & Tokens"
      ```
  - 必须保证一个图中，所有的节点都是有关联的，不需要为图表设置 legend，如果有节点不存在关联性，则应该移除这些节点，或者拆分成多个独立的图表
    - bad:
      ```d2
      direction: down

      "Your App": {
        shape: rectangle
      }

      "SDK Request Helper": {
        label: "@blocklet/js-sdk (createAxios / createFetch)"
        shape: package
      }

      "Blocklet Service": {
        shape: cylinder
      }

      "Token Refresh Endpoint": {
        label: "/api/did/refreshSession"
        shape: rectangle
      }

      "Your App" -> "SDK Request Helper": "1. Make API Call (e.g., /api/profile)"

      "SDK Request Helper" -> "Blocklet Service": "2. Adds Auth Header & Sends Request" {
        style {
          stroke-dash: 2
        }
      }

      "Success Path": {
        style.stroke: "#52c41a"

        "Blocklet Service" -> "SDK Request Helper": "3a. 200 OK (Token Valid)"
        "SDK Request Helper" -> "Your App": "4a. Returns Data"
      }


      "Token Renewal Path": {
        style.stroke: "#faad14"

        "Blocklet Service" -> "SDK Request Helper": "3b. 401 Unauthorized (Token Expired)"
        "SDK Request Helper" -> "Token Refresh Endpoint": "4b. Request New Token"
        "Token Refresh Endpoint" -> "SDK Request Helper": "5b. New Tokens"
        "SDK Request Helper" -> "Blocklet Service": "6b. Retry Original Request"
        "Blocklet Service" -> "SDK Request Helper": "7b. 200 OK" {
          style.stroke: "#52c41a"
        }
        "SDK Request Helper" -> "Your App": "8b. Returns Data Transparently" {
          style.stroke: "#52c41a"
        }
      }
      ```
    - good:
      ```d2
      direction: down

      "Your App": {
        shape: rectangle
      }

      "SDK Request Helper": {
        label: "@blocklet/js-sdk (createAxios / createFetch)"
        shape: package
      }

      "Blocklet Service": {
        shape: cylinder
      }

      "Token Refresh Endpoint": {
        label: "/api/did/refreshSession"
        shape: rectangle
      }

      "Your App" -> "SDK Request Helper": "1. Make API Call (e.g., /api/profile)"

      "SDK Request Helper" -> "Blocklet Service": "2. Adds Auth Header & Sends Request" {
        style {
          stroke-dash: 2
        }
      }
      ```
      ```d2
      "Success Path": {
        style.stroke: "#52c41a"

        "Blocklet Service" -> "SDK Request Helper": "3a. 200 OK (Token Valid)"
        "SDK Request Helper" -> "Your App": "4a. Returns Data"
      }
      ```
      ```d2
      "Token Renewal Path": {
        style.stroke: "#faad14"

        "Blocklet Service" -> "SDK Request Helper": "3b. 401 Unauthorized (Token Expired)"
        "SDK Request Helper" -> "Token Refresh Endpoint": "4b. Request New Token"
        "Token Refresh Endpoint" -> "SDK Request Helper": "5b. New Tokens"
        "SDK Request Helper" -> "Blocklet Service": "6b. Retry Original Request"
        "Blocklet Service" -> "SDK Request Helper": "7b. 200 OK" {
          style.stroke: "#52c41a"
        }
        "SDK Request Helper" -> "Your App": "8b. Returns Data Transparently" {
          style.stroke: "#52c41a"
        }
      }
      ```
  - 当有关联关系的节点，处于一个节点内部时，则它们的关联关系也应该写在节点内部
    - bad
      ```d2
      direction: down

      "@blocklet/js-sdk": {
        shape: package
        
        "Main SDK Instance": {
          shape: rectangle
          "BlockletSDK Class": "Main entry point"
          "getBlockletSDK()": "Singleton factory"
        }
        
        "HTTP Clients": {
          shape: rectangle
          grid-columns: 2
          "createAxios()": "Axios-based client"
          "createFetch()": "Fetch-based client"
        }
        
        "Core Services": {
          shape: rectangle
          grid-columns: 3
          "AuthService": "User authentication"
          "TokenService": "Token management"
          "BlockletService": "Blocklet metadata"
          "UserSessionService": "Session management"
          "FederatedService": "Federated login"
          "ComponentService": "Component utilities"
        }
      }

      "Main SDK Instance" -> "HTTP Clients": "Uses for requests"
      "Main SDK Instance" -> "Core Services": "Provides access to"
      "HTTP Clients" -> "Core Services": "Configured with"
      ```
    - good
      ```d2
      direction: down

      "@blocklet/js-sdk": {
        shape: package
        
        "Main SDK Instance": {
          shape: rectangle
          "BlockletSDK Class": "Main entry point"
          "getBlockletSDK()": "Singleton factory"
        }
        
        "HTTP Clients": {
          shape: rectangle
          grid-columns: 2
          "createAxios()": "Axios-based client"
          "createFetch()": "Fetch-based client"
        }
        
        "Core Services": {
          shape: rectangle
          grid-columns: 3
          "AuthService": "User authentication"
          "TokenService": "Token management"
          "BlockletService": "Blocklet metadata"
          "UserSessionService": "Session management"
          "FederatedService": "Federated login"
          "ComponentService": "Component utilities"
        }

        "Main SDK Instance" -> "HTTP Clients": "Uses for requests"
        "Main SDK Instance" -> "Core Services": "Provides access to"
        "HTTP Clients" -> "Core Services": "Configured with"
      }
      ```
    - bad:
      ```d2
      direction: down

      "Your App": {
        shape: rectangle
      }

      "SDK Request Helper": {
        label: "@blocklet/js-sdk (createAxios / createFetch)"
        shape: package
      }

      "Blocklet Service": {
        shape: cylinder
      }


      "Your App" -> "SDK Request Helper": "1. Make API Call (e.g., /api/profile)"

      "SDK Request Helper" -> "Blocklet Service": "2. Adds Auth Header & Sends Request" {
        style {
          stroke-dash: 2
        }
      }

      "Token Renewal Path": {
        style.stroke: "#faad14"

        "Blocklet Service" -> "SDK Request Helper": "3. 401 Unauthorized (Token Expired)"
        "SDK Request Helper" -> "Token Refresh Endpoint": "4. Request New Token"
        "Token Refresh Endpoint" -> "SDK Request Helper": "5. New Tokens Received"
        "SDK Request Helper" -> "Blocklet Service": "6. Retry Original Request with New Token"
        "Blocklet Service" -> "SDK Request Helper": "7. 200 OK" {
          style.stroke: "#52c41a"
        }
        "SDK Request Helper" -> "Your App": "8. Returns Data Transparently" {
          style.stroke: "#52c41a"
        }
      }
      ```
    - good:
      ```d2
      direction: down

      "Your App": {
        shape: rectangle
      }

      "SDK Request Helper": {
        label: "@blocklet/js-sdk (createAxios / createFetch)"
        shape: package
      }

      "Blocklet Service": {
        shape: cylinder
      }


      "Your App" -> "SDK Request Helper": "1. Make API Call (e.g., /api/profile)"

      "SDK Request Helper" -> "Blocklet Service": "2. Adds Auth Header & Sends Request" {
        style {
          stroke-dash: 2
        }
      }

      "Blocklet Service" -> "SDK Request Helper": "3. 401 Unauthorized (Token Expired)"
      "SDK Request Helper" -> "Token Refresh Endpoint": "4. Request New Token"
      "Token Refresh Endpoint" -> "SDK Request Helper": "5. New Tokens Received"
      "SDK Request Helper" -> "Blocklet Service": "6. Retry Original Request with New Token"
      "Blocklet Service" -> "SDK Request Helper": "7. 200 OK" {
        style.stroke: "#52c41a"
      }
      "SDK Request Helper" -> "Your App": "8. Returns Data Transparently" {
        style.stroke: "#52c41a"
      }
      ```
  - 如果整个图表只有一个容器节点，就不要增加这个容器节点，直接将内部的节点放在最外层
    - bad:
      ```d2
      direction: down

      "User Sessions Flow": {
        shape: package
        grid-columns: 1
        
        "User Login": {
          shape: person
          style.fill: "#e6f7ff"
        }
        
        "Session Creation": {
          shape: rectangle
          style.fill: "#f6ffed"
        }
        
        "Session Storage": {
          shape: cylinder
          style.fill: "#fff7e6"
        }
        
        "Multi-Device Access": {
          shape: package
          grid-columns: 3
          "Web Browser": {
            shape: rectangle
          }
          "Mobile App": {
            shape: rectangle
          }
          "Desktop App": {
            shape: rectangle
          }
        }
        "User Login" -> "Session Creation": "Authenticate"
        "Session Creation" -> "Session Storage": "Store session"
        "Session Storage" -> "Multi-Device Access": "Access from devices"
      }
      ```
    - good:
      ```d2
      direction: down

      "User Login": {
        shape: person
        style.fill: "#e6f7ff"
      }
      
      "Session Creation": {
        shape: rectangle
        style.fill: "#f6ffed"
      }
      
      "Session Storage": {
        shape: cylinder
        style.fill: "#fff7e6"
      }
      
      "Multi-Device Access": {
        shape: package
        grid-columns: 3
        "Web Browser": {
          shape: rectangle
        }
        "Mobile App": {
          shape: rectangle
        }
        "Desktop App": {
          shape: rectangle
        }
      }
      "User Login" -> "Session Creation": "Authenticate"
      "Session Creation" -> "Session Storage": "Store session"
      "Session Storage" -> "Multi-Device Access": "Access from devices"
      ```
  - 某些情况下，单纯的设置 `direction: down` 还无法控制图表的整体方向，可以再结合 `grid-columns: 1` 来进行设置
    - bad:
      ```d2
      direction: down

      "Your Application": {
        shape: rectangle
      }

      "@blocklet/js-sdk": {
        shape: package
        grid-columns: 1

        "AuthService": {
          shape: class
        }
      }

      "Blocklet API Endpoints": {
        shape: cylinder
        grid-columns: 2
        "/api/user/profile": {}
        "/api/user/privacy/config": {}
        "/api/user/notification/config": {}
        "/api/user/logout": {}
        "/api/user/follow/{did}": {}
        "/api/user": {}
      }

      "Your Application" -> "@blocklet/js-sdk".AuthService: "e.g., sdk.auth.getProfile()"
      "@blocklet/js-sdk".AuthService -> "Blocklet API Endpoints": "Makes authenticated API calls"
      ```
    - good:
      ```d2
      direction: down
      grid-columns: 1

      "Your Application": {
        shape: rectangle
      }

      "@blocklet/js-sdk": {
        shape: package
        grid-columns: 1

        "AuthService": {
          shape: class
        }
      }

      "Blocklet API Endpoints": {
        shape: cylinder
        grid-columns: 2
        "/api/user/profile": {}
        "/api/user/privacy/config": {}
        "/api/user/notification/config": {}
        "/api/user/logout": {}
        "/api/user/follow/{did}": {}
        "/api/user": {}
      }

      "Your Application" -> "@blocklet/js-sdk".AuthService: "e.g., sdk.auth.getProfile()"
      "@blocklet/js-sdk".AuthService -> "Blocklet API Endpoints": "Makes authenticated API calls"
      ```
  - **非常重要** 当容器节点中子节点个数与 `grid-columns` 值相同时，则应该去掉容器节点中的 `grid-columns` 字段
    - bad:
      ```d2
      "@blocklet/js-sdk": {
        shape: package
        grid-columns: 1

        "AuthService": {
          shape: class
        }
      }
      ```
    - good:
      ```d2
      "@blocklet/js-sdk": {
        shape: package

        "AuthService": {
          shape: class
        }
      }
      ```
    - bad:
      ```d2
      "Browser Storage": {
        shape: package
        grid-columns: 2

        "Cookies": {
          shape: document
          "Session Token": {}
        }

        "LocalStorage": {
          shape: stored_data
          "Refresh Token": {}
        }
      }
      ```
    - good:
      ```d2
      "Browser Storage": {
        shape: package

        "Cookies": {
          shape: document
          "Session Token": {}
        }

        "LocalStorage": {
          shape: stored_data
          "Refresh Token": {}
        }
      }
      ```
  - 当一个容器节点外部有节点与当前容器节点内部节点相互关联时，应该将这些节点放在同一层级
    - bad:
      ```d2
      direction: down

      "Federated Login Group": {
        shape: package

        "Master App": {
          shape: rectangle
          style.stroke: "#0052cc"
          style.stroke-width: 2
          "Provides central authentication"
        }

        "Member App 1 (Current App)": {
          shape: rectangle
          "User interacts here"
        }

        "Member App 2": {
          shape: rectangle
        }

        "Master App" -> "Member App 1 (Current App)": "Shares user session"
        "Master App" -> "Member App 2": "Shares user session"
      }

      User: {
        shape: person
      }

      User -> "Member App 1 (Current App)": "Logs in via Master App"
      ```
    - good:
      ```d2
      direction: down

      "Federated Login Group": {
        shape: package

        "Master App": {
          shape: rectangle
          style.stroke: "#0052cc"
          style.stroke-width: 2
          "Provides central authentication"
        }

        "Member App 1 (Current App)": {
          shape: rectangle
          "User interacts here"
        }

        "Member App 2": {
          shape: rectangle
        }

        "Master App" -> "Member App 1 (Current App)": "Shares user session"
        "Master App" -> "Member App 2": "Shares user session"

        User: {
          shape: person
        }

        User -> "Member App 1 (Current App)": "Logs in via Master App"
      }

      ```
  - **非常重要** 当存在多层容器节点嵌套时，外层的容器节点应该使用 `grid-columns: 1`
    - bad:
      ```d2
      direction: down

      "User Account": {
        shape: person
      }

      "Sessions": {
        shape: package
        grid-columns: 3

        "Web Browser Session": {
          shape: rectangle
          "IP: 192.168.1.10"
          "UA: Chrome on macOS"
          "Status: online"
        }

        "iOS App Session": {
          shape: rectangle
          "IP: 10.0.0.5"
          "UA: MyApp/1.2 iOS"
          "Status: online"
        }

        "Old Laptop Session": {
          shape: rectangle
          "IP: 172.16.0.20"
          "UA: Firefox on Windows"
          "Status: expired"
        }
      }

      "User Account" -> "Sessions": "Has multiple"
      ```
    - good:
      ```d2
      direction: down

      "User Account": {
        shape: person
      }

      "Sessions": {
        shape: package
        grid-columns: 1

        "Web Browser Session": {
          shape: rectangle
          "IP: 192.168.1.10"
          "UA: Chrome on macOS"
          "Status: online"
        }

        "iOS App Session": {
          shape: rectangle
          "IP: 10.0.0.5"
          "UA: MyApp/1.2 iOS"
          "Status: online"
        }

        "Old Laptop Session": {
          shape: rectangle
          "IP: 172.16.0.20"
          "UA: Firefox on Windows"
          "Status: expired"
        }
      }

      "User Account" -> "Sessions": "Has multiple"
      ```
  - 当一个节点容器中包含了其他的节点容器，建议使用 `grid-gap` 来增加各个节点容器的距离，尽量大于 `100`
    - bad:
      ```d2
      direction: down

      "Your Application": {
        shape: rectangle
      }

      "SDK: @blocklet/js-sdk": {
        shape: package
        grid-columns: 1

        "HTTP Clients": {
          shape: rectangle
          grid-columns: 2
          "createAxios()": "Axios-based client"
          "createFetch()": "Fetch-based client"
        }

        "Core Services": {
          shape: rectangle
          grid-columns: 3
          "AuthService": "User & Auth"
          "TokenService": "Token Management"
          "UserSessionService": "Session Data"
          "BlockletService": "Blocklet Metadata"
          "FederatedService": "Federated Login"
        }

        "HTTP Clients" -> "Core Services".TokenService: "Uses for auth tokens"
      }

      "Blocklet Services": {
        shape: cylinder
        "Remote APIs"
      }

      "Your Application" -> "SDK: @blocklet/js-sdk": "Imports & Initializes"
      "SDK: @blocklet/js-sdk" -> "Blocklet Services": "Makes authenticated requests"
      ```
    - bad:
      ```d2
      direction: down

      "Your Application": {
        shape: rectangle
      }

      "SDK: @blocklet/js-sdk": {
        shape: package
        grid-columns: 1
        grid-gap: 100

        "HTTP Clients": {
          shape: rectangle
          grid-columns: 2
          "createAxios()": "Axios-based client"
          "createFetch()": "Fetch-based client"
        }

        "Core Services": {
          shape: rectangle
          grid-columns: 3
          "AuthService": "User & Auth"
          "TokenService": "Token Management"
          "UserSessionService": "Session Data"
          "BlockletService": "Blocklet Metadata"
          "FederatedService": "Federated Login"
        }

        "HTTP Clients" -> "Core Services".TokenService: "Uses for auth tokens"
      }

      "Blocklet Services": {
        shape: cylinder
        "Remote APIs"
      }

      "Your Application" -> "SDK: @blocklet/js-sdk": "Imports & Initializes"
      "SDK: @blocklet/js-sdk" -> "Blocklet Services": "Makes authenticated requests"
      ```
  - 如果节点的 `shape: person`，则不要加任何其他内部的文字
    - bad:
      ```d2
      "User Account": {
        shape: person
        "did:z... (John Doe)"
      }
      ```
    - good:
      ```d2
      "User Account": {
        shape: person
      }
      ```
  - **非常重要** 在绘制连线的时候，一定要注意连接的节点的 ID 到底是什么，它可能有多个层级，但一定要弄清楚关系才能添加连线
    - bad:
      ```d2
      direction: down

      "User-Browser": {
        label: "User's Browser"
        shape: rectangle

        "React-App": {
          label: "Your React App"
          shape: rectangle

          "Uploader-Component": {
            label: "@blocklet/uploader"
            shape: package
          }
        }
      }

      "Blocklet-Server": {
        label: "Your Blocklet Server"
        shape: rectangle

        "Express-App": {
          label: "Your Express App"
          shape: rectangle

          "Uploader-Middleware": {
            label: "@blocklet/uploader-server"
            shape: package
          }
        }
      }

      "File-System": {
        label: "Storage\n(e.g., File System)"
        shape: cylinder
      }

      "Uploader-Component" -> "Uploader-Middleware": "HTTP POST Request\n(File Upload)"
      "Uploader-Middleware" -> "File-System": "Saves File"
      ```
    - good:
      ```d2
      direction: down

      "User-Browser": {
        label: "User's Browser"
        shape: rectangle

        "React-App": {
          label: "Your React App"
          shape: rectangle

          "Uploader-Component": {
            label: "@blocklet/uploader"
            shape: package
          }
        }
      }

      "Blocklet-Server": {
        label: "Your Blocklet Server"
        shape: rectangle

        "Express-App": {
          label: "Your Express App"
          shape: rectangle

          "Uploader-Middleware": {
            label: "@blocklet/uploader-server"
            shape: package
          }
        }
      }

      "File-System": {
        label: "Storage\n(e.g., File System)"
        shape: cylinder
      }

      User-Browser.React-App.Uploader-Component -> Blocklet-Server.Express-App.Uploader-Middleware: "HTTP POST Request\n(File Upload)"
      Blocklet-Server.Express-App.Uploader-Middleware -> "File-System": "Saves File"
      ```
  - 对于节点 shape 的选择，可以参考
    {% include "shape-rules.md" %}
  - 示例参考：
    {% include "diy-examples.md" %}
