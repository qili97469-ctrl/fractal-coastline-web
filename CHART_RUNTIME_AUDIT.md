# Chart.js运行时审计

审计时间：2026-10-03

本次检查使用项目根目录启动的本地HTTP服务器，并通过真实Chrome运行页面。未使用`file://`作为支持运行方式。

## 运行环境结论

- HTTP Server环境：通过，Chart.js正常加载，6个CSV正常读取，`charts.js`正常执行，7类图表正常显示。
- `file://`环境：不作为支持运行方式。浏览器会限制页面通过`fetch`读取本地CSV，因此直接双击`index.html`时图表不能读取数据；这不是网站故障。

## 资源加载

| 项目 | URL/文件 | HTTP状态 | 运行状态 |
|---|---|---:|---|
| Chart.js | `assets/vendor/chart.umd.min.js` | 200 | 本地加载成功，版本4.4.7 |
| charts.js | `assets/js/charts.js` | 200 | 初始化成功 |
| ArcGIS CSV | `data/coastline_arcgis.csv` | 200 | 读取11行 |
| 圆规步测 CSV | `data/coastline_compass.csv` | 200 | 读取9行 |
| 花椰菜 CSV | `data/cauliflower.csv` | 200 | 读取8行 |
| 分形维数 CSV | `data/fractal_dimension.csv` | 200 | 读取5行 |
| 模型验证 CSV | `data/model_validation.csv` | 200 | 读取4行 |
| 10/5 m补测 CSV | `data/fine_scale_arcgis.csv` | 200 | 读取4行 |

## 图表实例

| 图表 | Canvas ID | 运行状态 | fallback |
|---|---|---|---|
| ArcGIS尺度—长度 | `arcgisChart` | Chart实例创建成功 | 已隐藏 |
| 圆规步测尺度—长度 | `compassChart` | Chart实例创建成功 | 已隐藏 |
| 花椰菜尺度—长度 | `cauliflowerChart` | Chart实例创建成功 | 已隐藏 |
| 双对数散点/拟合图 | `logChart` | Chart实例创建成功 | 已隐藏 |
| 分形维数比较 | `dimensionChart` | Chart实例创建成功 | 已隐藏 |
| 留出验证 | `validationChart` | Chart实例创建成功 | 已隐藏 |
| 10/5 m补测 | `fineScaleChart` | Chart实例创建成功 | 已隐藏 |

## 运行时日志与错误

- `Chart.js loaded 4.4.7`已实际出现。
- `init started`已实际出现。
- 六个CSV均成功读取，行数分别为11、9、8、5、4、4。
- 七个Chart实例均创建成功。
- 未发现`Chart is not defined`、404、fetch失败、canvas为空、`canvas already in use`或其他浏览器Console错误。
- fallback只在失败路径显示；本次成功运行中7个fallback全部隐藏。

## 响应式运行检查

| 视口宽度 | 七个图表显示 | fallback可见数 | 横向溢出 |
|---:|---|---:|---|
| 375 px | 是 | 0 | 否 |
| 768 px | 是 | 0 | 否 |
| 1280 px | 是 | 0 | 否 |
| 1440 px | 是 | 0 | 否 |

## 修复结论

故障原因为页面依赖远程Chart.js CDN，且原fallback逻辑在初始化失败时直接替换canvas，导致页面只能显示fallback。现已改为本地`assets/vendor/chart.umd.min.js`，使用相对URL加载CSV，并在Chart实例创建成功后隐藏fallback、失败时才显示fallback。研究数据CSV未修改。
