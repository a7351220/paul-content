---
name: weekly-market-research
description: Research weekly market candidates and validate claims, sources, prices, and data updates. Use the fixed-source workbench for discovery and original sources for verification or targeted missing evidence.
---

# 週報研究與查證

本 skill 負責候選、來源包、事實查核與數據更新。研究需理解的主題關係依 [共用框架](../market-video-story/references/story-framework.md)，此階段不分頁或寫口白。

## 取得材料

先讀指定材料、最新人工稿與已選題目；比對近期已做內容，舊題有新事實或新問題才延續。不重跑已完成的候選搜尋，也不固定市場配額或題數。

找候選優先使用工作台 `https://weekly-research-workbench.pages.dev` 及 API `https://weekly-rss.zeabur.app` 的 `/weekly`、`/sources`、`/source-context`；後者可能回傳 `articles` 陣列。`bundle` 找主題關係，`cluster` 查事件，`raw` 補遺漏材料。服務不可用或原文不足時記錄限制，改補原始資料，不把手動選題稱為系統排名。

排序考量來源、證據、交叉驗證、當週重要性與市場反應。分數只輔助決策；需解讀時讀 [scoring-v2.md](references/scoring-v2.md)，實作問題對照系統原始碼。查證或補件直接處理指定主張，不經候選排名。

## 驗證與記錄

公司結果查公告與申報，官方事件查主管機關或交易所，市場行情查歷史序列，預測與產業機制查原始研究，媒體補脈絡。人物、公司及機構的判斷保留歸屬。無法取得全文就記錄實際讀取範圍。

研究紀錄逐項連接主張與來源定位，保留公布日、資料期間、單位、比較基準、計算、事實／預估／解讀身分及衝突資料。行情與比較口徑唯一依 [數據與篇幅核算](../market-video-story/references/data-and-length.md)。查到指定截止點；收盤或修訂數據更新後，列出受影響主張及其解讀，供寫作一併校正。

證據須支持主張的實際範圍與因果，不把個案推成全體，不把指標或轉帳當成它未證明的行為。方法、固定門檻或交易規則須有來源或可重現推導。分歧保留雙方口徑；只暫停使用未受支持的主張。

查原圖是否可取得及其標題、圖例、座標、期間與單位。文字已證實不代表有可交付原圖；擷取與保存由製作階段依視覺參考處理。

## 輸出與完成

候選交題目、異常／問題、重要性、日期、來源與待查項。研究包交事件與原先預期、關鍵數字及比較基準、來源定位、支持或衝突的線索、重要材料採用建議、原圖可用性與實際缺口。查證交已證實、需修正、爭議與缺漏的結果；只補件時只回傳該結果與影響位置。

把研究紀錄保存於既有正式專案，完成當次輸出即結束本階段；後續依路由接續，不自行重新安排寫稿流程。
