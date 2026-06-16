import{u as w,a as E,x as I,l as T,L as M}from"./index-De9yQw9v.js";const r={REQUIREMENT:"requirement",USER_RESEARCH:"user-research",COMPETITOR:"competitor",SOLUTION:"solution",PRD:"prd"},f=[{id:"q1",question:"你的目标用户是？",inputType:"select",options:["独立自由设计师","中小型设计团队 (5-20人)","大型企业设计部门 (20+人)"],allowSkip:!0,defaultAssumption:"通用设计师"},{id:"q2",question:"你的预算范围是？",inputType:"select",options:["< 5万","5-20万","> 20万"],allowSkip:!0,defaultAssumption:"中等预算 (5-20万)"},{id:"q3",question:"你希望优先实现哪些功能？",inputType:"select",options:["版本控制","团队协作","自动标注","设计规范管理"],allowSkip:!0,defaultAssumption:"核心功能全覆盖"}],R=[{id:"r1",title:"需求分析报告",content:`基于您的产品想法，核心需求已识别：

1. **核心痛点**：设计团队在协作过程中面临版本管理混乱、沟通效率低下、重复劳动严重等问题。

2. **功能模块拆解**：
   - 版本管理模块：自动追踪设计稿变更历史
   - 实时协作模块：支持多人同时编辑和评论
   - 智能标注模块：AI 自动生成设计标注
   - 规范管理模块：统一设计系统和组件库

3. **优先级排序**：版本管理 > 实时协作 > 智能标注 > 规范管理`},{id:"r2",title:"用户画像与场景分析",content:`目标用户分析：

**核心用户群体**：
- 独立设计师：需要简洁的版本管理，预算有限
- 中小型设计团队（5-20人）：协作效率是核心需求
- 大型企业设计部门：需要权限管理和合规性

**典型使用场景**：
1. 设计师完成初稿后，需要与团队分享并收集反馈
2. 多人同时修改同一个设计文件，需要实时同步
3. 客户需要查看设计历史，了解每个版本的迭代过程

**用户痛点**：现有工具要么协作功能弱，要么学习成本高，缺乏针对国内用户的设计习惯优化。`},{id:"r3",title:"竞品分析与差异化机会",content:`主要竞品分析：

**Figma**：优势在于强大的实时协作和云端编辑，但国内网络访问不稳定，且价格较高。

**蓝湖**：专注设计标注功能，界面简洁，但缺乏版本管理和深度协作能力。

**Abstract**：版本管理功能强大，但主要面向开发者，设计协作体验不佳。

**差异化机会**：
1. 本土化体验：符合国内设计师习惯的交互设计
2. 智能版本追踪：AI 辅助识别关键变更点
3. 灵活权限体系：支持细粒度的团队协作权限
4. 性能优化：针对国内网络环境优化访问速度`},{id:"r4",title:"产品方案与技术架构",content:`**产品方案设计**：

1. **智能版本管理**
   - 自动记录每次修改，生成版本时间线
   - 支持版本对比和一键回滚
   - AI 提炼版本变更摘要

2. **实时协作系统**
   - WebSocket 实现多人同时编辑
   - 评论和标注实时同步
   - 冲突检测与智能合并

3. **AI 辅助功能**
   - 自动标注设计元素（尺寸、颜色、字体）
   - 设计规范一致性检查
   - 智能命名和分组建议

4. **设计规范管理**
   - 组件库统一管理
   - 设计token系统
   - 跨项目规范复用

---

**技术架构选型**：

**前端技术栈**：React 18 + TypeScript + Vite，使用 Canvas/WebGL 实现高性能设计画布渲染。

**后端技术栈**：Node.js + NestJS + GraphQL，模块化架构易于维护。

**数据存储**：PostgreSQL（用户数据）、MongoDB（版本历史）、Redis（协作状态缓存）。

**基础设施**：WebSocket 实时通信、CDN+OSS 文件存储、消息队列处理异步任务。`},{id:"r5",title:"MVP 规划与商业模式",content:`**分阶段产品路线图**：

**第一阶段 - MVP（3个月）**：核心版本管理 + 基础实时协作 + 简单标注功能 + 基础权限管理。

**第二阶段（3个月）**：AI 自动标注 + 设计规范管理 + 高级协作功能。

**第三阶段（3个月）**：AI 高级功能 + 企业级功能 + 开放平台 API。

**发布策略**：先从独立设计师和小团队切入，快速迭代验证核心价值，再逐步拓展中大型企业客户。

---

**商业模式与定价**：

**免费版**：3个项目、5人团队，基础功能，降低试用门槛。

**专业版（¥99/人/月）**：无限项目和人数，完整协作功能 + AI标注。

**企业版（定制报价）**：私有化部署、SSO登录、审计日志、专属客户成功经理。

**增值服务**：设计资源商城、企业培训咨询、API调用计费。

**获客策略**：内容营销、SEO优化、设计师KOL合作、设计社区运营。`}];async function O(e,n){const{onLog:t,onProgress:o,onResult:i}=e;o(r.REQUIREMENT,"active"),t("Requirement Agent: 开始分析产品需求...","loading"),await n(1200),i(R[0]),o(r.REQUIREMENT,"completed"),t("Requirement Agent: 需求分析完成 ✔️","success"),await n(500)}async function L(e,n){const{onLog:t,onProgress:o,onQuestion:i,onResult:s}=e;o(r.USER_RESEARCH,"active"),t("User Research Agent: 开始分析目标用户...","loading"),await n(800);const g=await i(f[0]);await n(500),s(R[1]),o(r.USER_RESEARCH,"completed"),t(g.skipped?`User Research Agent: 目标用户 [假设: ${f[0].defaultAssumption}] ✔️`:"User Research Agent: 目标用户确认 ✔️","success"),await n(500)}async function v(e,n){const{onLog:t,onProgress:o,onResult:i}=e;o(r.COMPETITOR,"active"),t("Competitor Agent: 开始竞品分析...","loading"),await n(1500),i(R[2]),o(r.COMPETITOR,"completed"),t("Competitor Agent: 竞品分析完成 ✔️","success"),await n(500)}async function U(e,n){const{onLog:t,onProgress:o,onQuestion:i,onResult:s}=e;o(r.SOLUTION,"active"),t("Solution Agent: 开始设计产品方案...","loading"),await n(800),await i(f[1]),await n(500),t("Solution Agent: 功能规划中...","loading"),await n(800),s(R[3]),o(r.SOLUTION,"completed"),t("Solution Agent: 产品方案设计完成 ✔️","success"),await n(500)}async function h(e,n){const{onLog:t,onProgress:o,onQuestion:i,onResult:s}=e;o(r.PRD,"active"),t("PRD Agent: 开始生成PRD文档...","loading"),await n(800),await i(f[2]),await n(500),t("PRD Agent: 生成PRD文档中...","loading"),await n(1200),s(R[4]),o(r.PRD,"completed"),t("PRD Agent: PRD文档生成完成 ✔️","success"),await n(500)}async function C(e,n,t={}){const{onLog:o,onProgress:i,onComplete:s,onQuestion:g,onResult:a,onStepComplete:u}=n,{startFromStep:d=0}=t,S=c=>new Promise(P=>setTimeout(P,c)),y=[{id:1,name:"需求分析",execute:()=>O(n,S)},{id:2,name:"用户研究",execute:()=>L(n,S)},{id:3,name:"竞品分析",execute:()=>v(n,S)},{id:4,name:"方案设计",execute:()=>U(n,S)},{id:5,name:"PRD生成",execute:()=>h(n,S)}];try{for(let c=d;c<y.length;c++)await y[c].execute(),u&&c<y.length-1&&u(c+1);o("所有分析已完成！","success"),s()}catch(c){throw console.error("Mock analysis error:",c),c}}function Q(){let e;return{promise:new Promise(t=>{e=t}),resolve:e}}let A=null,p=null,l=!1,m=null;function x(){l=!1}function D(e){m=e}function q(e,n){A&&(A({answer:e,skipped:n}),A=null)}function N(e){p=e}function j(){const e=w(),n=E();let t=!1;const o=async(s=0)=>{if(l)return;l=!0;const g=e.originalIdea;if(!g){l=!1;return}console.log("[MockAnalysis] Starting analysis from step:",s,"progressUpdater:",!!p),s===0&&p&&(console.log("[MockAnalysis] Activating first step immediately"),p(r.REQUIREMENT,"active"));try{await C(g,{onLog:(a,u)=>{const d=u||M.INFO;e.addLog(a,d)},onProgress:(a,u,d)=>{p&&p(a,u,d)},onQuestion:async a=>{const{promise:u,resolve:d}=Q();return A=d,e.setQuestion(a),u},onResult:a=>{e.addResult({...a,order:e.results.length+1})},onComplete:()=>{e.completeAnalysis(),l=!1,n.currentProject&&n.clearAnalysisState(n.currentProject.id)},onStepComplete:a=>{n.currentProject&&(n.saveAnalysisState(n.currentProject.id,e,a),console.log("[MockAnalysis] Saved analysis state, currentStepIndex:",a))}},{startFromStep:s})}catch(a){console.error("Mock analysis error:",a),l=!1}},i=()=>{if(e.currentState==="analyzing"){const s=m!==null?m:e.results.length;m=null,o(s)}};I(()=>{t=!0,i()}),T(()=>e.currentState,(s,g)=>{s==="input"&&(l=!1),s==="completed"&&(l=!1),s==="analyzing"&&g!=="analyzing"&&t&&i()})}export{q as a,D as b,x as r,N as s,j as u};
