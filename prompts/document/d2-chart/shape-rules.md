# D2 图表绘制 Shape 选择指南与 Prompt 模板

## 一、D2 Shape 类型与使用场景

### 基础 Shape 类型
- **rectangle** (默认): 通用节点、组件、系统模块
- **square**: 数据库、存储、配置项
- **circle**: 用户、角色、状态节点
- **oval**: 开始/结束节点、事件
- **diamond**: 决策节点、条件判断
- **parallelogram**: 输入/输出、数据流
- **hexagon**: 准备、预处理步骤
- **cylinder**: 数据库、数据存储
- **queue**: 消息队列、缓冲区
- **package**: 模块、包、容器
- **step**: 流程步骤
- **callout**: 注释、说明
- **stored_data**: 存储的数据
- **person**: 用户、角色
- **diamond**: 判断、网关
- **document**: 文档、报告
- **multiple_document**: 多个文档
- **class**: 类定义
- **sql_table**: 数据库表
- **image**: 图片、媒体

## 二、针对不同图表类型的 Prompt 模板

### 1. 系统架构图 Prompt
```
请使用 D2 语法绘制系统架构图，遵循以下 shape 选择规则：
- 用户/角色使用 person 或 circle
- 前端应用使用 rectangle
- API/服务使用 rectangle 
- 数据库使用 cylinder 或 sql_table
- 缓存使用 queue
- 外部服务使用 package
- 负载均衡器使用 diamond

示例结构：
用户 -> 前端 -> API网关 -> 微服务 -> 数据库
```

### 2. 流程图 Prompt
```
请使用 D2 语法绘制流程图，严格按照以下 shape 约定：
- 开始/结束节点：oval
- 处理步骤：rectangle
- 判断节点：diamond
- 输入/输出：parallelogram
- 准备步骤：hexagon
- 文档生成：document
- 数据存储：cylinder

连接线使用箭头表示流向，判断节点要标注 yes/no 分支。
```

### 3. 数据流图 Prompt
```
使用 D2 绘制数据流图，shape 选择原则：
- 外部实体：square
- 数据处理：circle
- 数据存储：stored_data 或 cylinder
- 数据流：带标签的箭头连接
- 数据文件：document

确保数据流方向清晰，标注数据类型和流向。
```

### 4. 组织架构图 Prompt
```
创建组织架构图，使用以下 D2 shape 规范：
- 高层管理：person (设置较大尺寸)
- 部门负责人：person
- 团队/部门：package
- 具体角色：circle
- 外部合作方：rectangle (虚线边框)

使用层次布局，体现汇报关系。
```

## 三、通用优化 Prompt 模板

### 基础模板
```
请使用 D2 语法创建 [图表类型]，要求：

1. **Shape 选择原则**：
   - 根据元素功能选择最合适的 shape
   - 保持同类元素使用相同 shape
   - 重要元素可以使用特殊 shape 突出

2. **样式要求**：
   - 使用合适的颜色区分不同类型的元素
   - 重要路径使用加粗或特殊颜色
   - 添加适当的标签和注释

3. **布局优化**：
   - 使用合理的布局算法 (dagre, elk等)
   - 避免连线交叉
   - 保持整体美观和可读性

4. **语法规范**：
   - 使用正确的 D2 语法
   - 节点命名简洁明了
   - 连接关系清晰表达

请提供完整的 D2 代码。
```

### 高级定制模板
```
创建专业级 D2 图表，具体要求：

**图表信息**：[描述你要创建的图表]

**定制要求**：
1. **Shape 策略**：
   - 为每种元素类型指定最佳 shape
   - 列出 shape 选择理由
   - 确保视觉一致性

2. **颜色方案**：
   - 使用企业级配色
   - 不同模块用不同颜色区分
   - 突出关键路径

3. **高级功能**：
   - 添加图标 (如需要)
   - 使用容器分组相关元素
   - 添加交互提示 (tooltip)

4. **性能考虑**：
   - 节点数量控制在合理范围
   - 避免过于复杂的嵌套

输出格式：
- D2 代码
- Shape 选择说明
- 使用建议
```

## 四、特定场景 Prompt 示例

### 网络拓扑图
```
绘制网络拓扑图，shape 使用规范：
- 路由器：diamond
- 交换机：rectangle  
- 服务器：rectangle (填充色)
- 终端设备：circle
- 防火墙：hexagon
- 云服务：package
- 网络连接：实线
- 无线连接：虚线
```

### 微服务架构图
```
设计微服务架构图：
- API Gateway：diamond
- 微服务：rectangle
- 数据库：cylinder
- 缓存：queue
- 消息队列：queue (不同颜色)
- 负载均衡：parallelogram
- 监控服务：circle
- 外部服务：package (虚线边框)
```

### 业务流程图
```
业务流程建模：
- 开始事件：oval (绿色)
- 结束事件：oval (红色)  
- 用户任务：rectangle
- 系统任务：rectangle (不同颜色)
- 网关决策：diamond
- 并行网关：diamond (特殊标记)
- 数据对象：document
- 消息流：虚线箭头
```
