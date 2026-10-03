# 量不完的海岸线

这是一个面向中学生、教师和普通公众的中文科学科普单页网站，主题是从多尺度海岸线测量认识尺度效应、海岸线悖论、幂函数和分形维数。

## 当前版本

当前版本已完成第六阶段审校：9个Section、响应式视觉系统、真实研究图片、6个最终数据CSV、7类Chart.js图表、SVG尺度模拟和基础导航均已建立。

## 项目目标

通过“提出问题—亲手测量—寻找规律—检验模型—讨论边界—联系现实”的叙事，让读者理解：测量结果不仅与对象本身有关，也与观察它时使用的尺度有关。

## 内容结构

1. 首页 Hero
2. 看似简单的问题
3. 我们真的去量了一条海岸线
4. 尺子真的越小，测得越长吗
5. 这些数据，有没有数学规律
6. 不同边界，对尺度的响应一样吗
7. R² = 0.99，就一定可靠吗
8. 尺子是不是越小越好
9. 海岸线只是开始

## 技术栈

- HTML5语义化结构
- CSS3响应式布局与设计变量
- 原生JavaScript基础交互
- 本地Chart.js 4.4.7
- 不依赖构建工具、框架或服务器端代码

## 文件结构

```text
fractal-coastline-web/
├─ index.html
├─ README.md
├─ AGENTS.md
├─ SOURCE_AUDIT.md
├─ SOURCE_DIFF_TABLE.md
├─ SITE_PLAN.md
├─ assets/
│  ├─ css/style.css
│  ├─ js/main.js
│  ├─ js/charts.js
│  ├─ vendor/chart.umd.min.js
│  └─ images/
├─ data/
└─ docs/
```

## 本地运行

本网站不能通过直接双击`index.html`的`file://`方式完整运行，因为交互图表需要通过`fetch`读取CSV。请通过本地HTTP Server或GitHub Pages访问。

Windows本地运行：

```bat
cd /d path\to\fractal-coastline-web
python -m http.server 8000
```

然后访问：

`http://localhost:8000/`

也可以双击项目根目录中的`启动科普网页.bat`，它会自动切换到脚本所在目录、启动HTTP Server并打开默认浏览器。

直接使用`file://`打开时，静态HTML和CSS可能显示，但CSV驱动的交互图表会因浏览器本地文件安全限制而无法读取数据；这不属于网站数据或图表逻辑故障。

## 数据来源

网页研究数字来自`docs/研究报告20260929.docx`。研究方案只用于理解研究设计，不作为最终数据来源。花椰菜处理文档作为补充方法资料；与最终报告冲突时，以最终报告为准。

## 研究结果来源说明

当前静态骨架中展示的数字包括ArcGIS自然岸线64.557 km、126.683 km；模型比较R²=0.86、0.75、0.99；五组分形维数；留出验证误差6.48%、12.48%、4.91%、10.90%；10 m和5 m补测结果。所有数字均已在`SOURCE_AUDIT.md`中审计。

## GitHub Pages部署方法

1. 将项目根目录推送到GitHub仓库。
2. 在仓库Settings → Pages中选择部署分支和根目录。
3. 保持`index.html`位于仓库根目录，使用相对路径资源。

当前项目不需要服务器端代码、数据库或API key。

## 公开仓库说明

公开仓库不包含完整原始研究资料。网页中的研究数据来源于最终研究报告确认结果；Section 02互动模块为科普模拟，不属于真实研究数据。

License：待项目作者确认。

## 图片版权与来源说明

网页使用真实研究资料的网页展示副本，图片来源和处理方式记录在`IMAGE_AUDIT.md`与`CAULIFLOWER_ASSET_AUDIT.md`中。原始科研图片和TIFF文件保留在原始研究目录。

## 图表与运行审计

图表数据来源、图表形式和科学限制见`CHART_AUDIT.md`。Chart.js本地加载、CSV HTTP状态、图表实例和响应式运行结果见`CHART_RUNTIME_AUDIT.md`。

## 真实研究资料说明

第三阶段已将真实研究资料整理到`assets/images/research/`。网页展示使用的是原始研究资料的网页副本：Sentinel-2 TIFF生成保持比例的PNG/WebP展示副本；自然岸线、人工岸线和花椰菜图片按语义化文件名整理。WebP仅用于无裁剪的网页加载优化，原始PNG、原始TIFF等科研文件保留在原始研究目录，没有被网页版本覆盖。

研究数据CSV依据最终研究报告整理，未从研究方案补数，也没有插值、外推或反推缺失值。具体来源和逐项核对结果见`IMAGE_AUDIT.md`、`DATA_AUDIT.md`和`CAULIFLOWER_ASSET_AUDIT.md`。

## 科普模拟与真实研究数据的区别

Section 02的“你来量一量海岸线”使用固定SVG曲线和模拟单位，只用于解释尺度变小时如何捕捉更多边界细节。它不是渤海湾真实岸线，不代表实际长度，不读取研究CSV，也不用于计算真实分形维数或模型参数。

真实研究图表使用`data/`目录中的最终报告确认CSV；两套数据和脚本彼此独立。

## 科学内容审校

最终阶段审校记录见`FINAL_CONTENT_AUDIT.md`。图表运行、互动测试和部署准备分别见`CHART_RUNTIME_AUDIT.md`、`INTERACTION_AUDIT.md`和`DEPLOYMENT_CHECKLIST.md`。
