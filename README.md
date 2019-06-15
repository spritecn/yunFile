# 基于腾讯云 COS + CSF + apiGetway 实现线上对比后下载结果

## 已上线:[gsmf.fantansy.cn](gsmf.fantansy.cn)

##我先解释一下腾讯云的这些名词
	- COS：对象存储
	- CSF：云函数，ACE BAE 这类应用引擎纷纷倒下后，一直关注比较小型的，可以便捷执行python代码的小的环境，目前阿里，腾讯都推出了云函数，目前都能支持python2.7和python3.6
	- ApiGetway: api网关，提供网络接口，可以配合调用云函数，对api进求进行返回
	- 腾讯云 VS 阿里云：理论上 腾讯云 和 阿里云 框架下都可以实现本程序需求，可能会出山现一些配置一的不同，当然两家SDK也不一样，具体写代码的时候，涉及SDK的代码肯定不同

## 原始需求
	- 女朋友是做手机测试的，发测试报告的时候，需要对比手机里的运营商ID及对应名称和简称 是否和国际相关组织提供的数据对应，数据库行数超过2500条，并且手机里导出的数据顺序和数据库不对应，手工对比工作量太大
直接在本地对比其实比较简单，花了半小时就写好了本地对比的代码，但由于前段时间他们报告比较多，就有了把文件上传到线上，自动进行对比，对比后结果同步到线上，然后下载的想法

## 需求梳理
	- 文件上传
	- 文件对比
	- 文件列表
	- 文件删除
	- 数据库更新（暂末实现)
	- 访问限制 （暂末实现)

## 技术选型

### 后端：
	- python3.6（习惯了用python3.6就回不去python2.7了)
	- cso-python-sdk-v4 由于腾讯云存储官方对象存储不支持python3,找了一个非官方python3版本 https://github.com/itamaro/cos-python-sdk-v4/tree/python3
	- python标准模块csv

### 前端：
	- 前端框架：ZUI,http://zui.sexy/
	- zui-amdin 基于zui实现的后台管理页，前端界面直接套用了zui-admin,项目地址：https://gitee.com/mofer179/zui-admin
	- rivets.js 一个用来解决数据绑定的框架，比较实用，https://github.com/mikeric/rivets
	- 腾讯官方的cos的sdk https://github.com/tencentyun/cos-js-sdk-v4
### 目录结构:
	- gsmfweb	web静态文件
	- gsmfApi	cos密钥api
	- gsmf		对接cos上传下载api,及文件对比
		- compare.py 上传csv解析及和文本数据库对比
		- index.py 	对接cos上传下载api
		- db.txt	用于对比的文本数据库
###PS：
腾讯官方的sdk比较混乱，v5版本sdk居然和v4版本完全不兼容，完全不是一个东西，用的时候注意一下sdk版本,细看一下文档