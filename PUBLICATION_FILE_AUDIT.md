# Public Publication File Audit

本文件记录第七阶段公开发布前的文件范围审计。仓库目标为公开发布网页运行版本，不包含完整原始研究资料。

## A. 公开必需

- `index.html`
- `404.html`
- `README.md`
- `.gitignore`
- `assets/css/`
- `assets/js/`
- `assets/vendor/chart.umd.min.js`
- `assets/images/research/`中的网页展示副本
- `data/`中的最终报告确认CSV

## B. 公开可选

- `AGENTS.md`
- `SOURCE_AUDIT.md`
- `SOURCE_DIFF_TABLE.md`
- `FINAL_CONTENT_AUDIT.md`
- `FINAL_SITE_AUDIT.md`
- `DEPLOYMENT_CHECKLIST.md`
- `CHART_RUNTIME_AUDIT.md`
- `INTERACTION_AUDIT.md`
- `启动科普网页.bat`

这些文件不参与网站运行，但可帮助读者理解项目范围、科学限制和部署方式。

## C. 不公开

- `docs/`中的研究方案和最终研究报告
- 原始TIFF/TIF影像
- 原始Excel文件
- 微信缓存目录及其中的原始文件
- 完整花椰菜研究目录及其中不属于网页运行的文件
- `RAW_DATA_AUDIT.md`
- `RAW_TO_FINAL_TRACE.md`
- `IMAGE_AUDIT.md`
- `CAULIFLOWER_ASSET_AUDIT.md`
- `DATA_AUDIT.md`
- `CHART_AUDIT.md`

这些内容保留在本地，用于研究追溯或内部审计，不进入公开仓库。

## D. 需要人工确认

- 研究图片的公开展示授权与版权说明；
- License仍为“待项目作者确认”；
- 公开仓库建立后，需人工确认仓库归属、public可见性和GitHub Pages配置。

## 审计结论

`.gitignore`会排除`docs/`、原始Excel/TIFF、原始追溯文件、临时文件和环境文件。公开提交前仍需再次检查`git status`及staging列表，确保没有私密来源或原始大文件。
