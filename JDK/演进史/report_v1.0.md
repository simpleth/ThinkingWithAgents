---
title: "JDK 演进史"
version: "v1.0"
date: 2026-04
tags: [jdk, java, evolution, lts, technology-history]
status: published
---

# JDK 演进史

---

## 概述

JDK（Java Development Kit）是 Java 技术的核心开发工具包，自 1995 年发布以来经历了多次重大演进。

---

## 正文

### JDK 1.0（1995 年）

- Java 语言首次公开发布
- 核心特性：面向对象、跨平台、垃圾回收

### JDK 1.1（1997 年）

- 新增内部类、反射、JDBC
- JavaBeans 规范

### J2SE 1.2（1998 年）

- 更名为 J2SE
- 新增 Swing、Collections 框架、JIT 编译器

### J2SE 1.3（2000 年）

- HotSpot JVM
- JavaSound、JPDA

### J2SE 1.4（2002 年）

- 新增正则表达式、异常链、NIO
- 集成 XML 解析

### Java SE 5（2004 年）

- 重大更新：泛型、注解、枚举、自动装箱
- For-each 循环、可变参数

### Java SE 6（2006 年）

- 脚本语言支持（JavaScript）
- 编译器 API、JDBC 4.0

### Java SE 7（2011 年）

- try-with-resources
- switch 支持字符串
- NIO.2、Fork/Join 框架

### Java SE 8（2014 年）⭐

- **Lambda 表达式**
- **Stream API**
- 新的日期时间 API
- 默认方法

### Java SE 9（2017 年）

- **模块系统（Project Jigsaw）**
- JShell（REPL）
- 私有接口方法

### Java SE 10（2018 年）

- 局部变量类型推断（var）
- 引入 6 个月发布周期

### Java SE 11（2018 年）⭐

- **LTS 版本**
- 移除 Java EE 和 CORBA
- 新的字符串方法

### Java SE 17（2021 年）⭐

- **LTS 版本**
- 密封类
- 模式匹配（instanceof）
- 文本块

### Java SE 21（2023 年）⭐

- **LTS 版本**
- **虚拟线程（Project Loom）**
- 模式匹配（switch）
- 记录类

---

## 总结

JDK 演进历程呈现以下趋势：

1. **语法简化**：从匿名类到 Lambda，再到虚拟线程
2. **模块化**：Java 9 引入模块系统
3. **发布加速**：从多年一版到 6 个月一版
4. **LTS 策略**：11、17、21 为长期支持版本
