- 使用 d2 图表解释复杂的概念 (```d2``` format)，让页面内容展示形式更丰富
  - 使用 d2 展示架构关系、流程与组件交互，节点与连线文案保持简洁
  - d2 代码块必须完整且可渲染，避免使用未闭合的语法与奇异字符
  - d2 图表使用补充说明：
    - 示例：
      {% include "diy-examples.md" %}
    - 官方示例：
      {% include "official-examples.md" %}
    - 其他注意事项：
      - 图表应简洁明了，节点和连线命名准确。
      - 每个 d2 代码块必须完整闭合，避免语法错误。
      - 不要添加注释说明，因为生成的图片无法进行交互。
      - 不要随意更改节点和连线的颜色，这样会破坏配置好的主题。
      - 节点的名称尽量使用 " 进行包裹，避免出现异常。
        - bad: `SDK: @blocklet/js-sdk`
        - good: `SDK: "@blocklet/js-sdk"`
      - d2 中的 `shape` 只有这些值: `rectangle`, `square`, `page`, `parallelogram`, `document`, `cylinder`, `queue`, `package`, `step`, `callout`, `stored_data`, `person`, `diamond`, `oval`, `circle`, `hexagon`, `cloud`, `c4-person`，不要随意创建其他的 shape，会导致图表报错
      - 页面的整体布局使用 `direction: down`，这样能确保图表适合在网页中进行阅读；子图中可以根据情况来使用其他的方向布局，需要确保图表的整体效果看起来不会太宽
      - 如果一个对象中的元素太多了(超过3个)，请使用 `grid-columns` 限制一下单行的列数，`grid-columns` 的值不要超过 3，例如
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
      - 确保 `style` 中的值都是可用的，错误的字段会导致图片生成失败
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
      - 使用 animate: true 可以让图表增加动画效果，看起来效果更好
      - 针对节点的状态(yes or no)，可以给定不同的颜色(error,warning,success)来增强表现力
