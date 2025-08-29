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
