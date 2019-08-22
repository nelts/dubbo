# @nelts/dubbo

service module using dubbo for nelts

# Usage

```bash
npm i @nelts/dubbo
```

# Swagger

微服务swagger方法，采用zookeeper自管理方案。通过微服务启动，收集`interface`与`method`信息上报到自定义`zookeeper`节点来完成数据上报。前端服务，可以通过读取这个节点信息来获得具体的接口与方法。

上报格式:

```
/swagger/{subject}/{interface}/exports/{base64 data}
```

分贝解析下参数：

- **subject** 总项目命名节点名
- **interface** 接口名
- **base64 data** 它是一个记录该接口下方法和参数的数组(最终base64化)，见以下参数格式。

base64 data 参数详解

```ts
type Base64DataType = {
  description?: string, // 该接口的描述
  group: string, // 组名 如果没有组，请使用字符串`-`
  version: string, // 版本名 如果没有版本，请使用字符串 `0.0.0`
  methods: {
    [name: string]: {
      summary?: string, // 方法描述，摘要
      input: Array<{ $class: string, $schema: JSONSCHEMA; }>, // 入参
      output: JSONSCHEMA // 出参
    }
  }
}
```

最终将数据base64后插入zookeeper的节点即可。


# License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, yunjie (Evio) shen
