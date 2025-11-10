-- Define start and end date for the report

DEFINE START_DATE = TO_DATE('01-SEP-2025', 'DD-MON-YYYY');

DEFINE END_DATE = TO_DATE('4-SEP-2025', 'DD-MON-YYYY');
 
WITH 

-- 1. Active customer count (static across all days)

ACTIVE_CUSTOMERS AS (

  SELECT COUNT(*) AS total

  FROM F1_SVC_TASK A

  JOIN F1_SVC_TASK_REL_OBJ B ON A.F1_SVC_TASK_ID = B.F1_SVC_TASK_ID

  JOIN CI_SA C ON B.PK_VALUE1 = C.ACCT_ID

  JOIN CI_SA_SP D ON C.SA_ID = D.SA_ID

  JOIN D1_SP_IDENTIFIER E ON D.SP_ID = E.ID_VALUE

  JOIN D1_INSTALL_EVT F ON E.D1_SP_ID = F.D1_SP_ID

  JOIN D1_DVC_CFG G ON F.DEVICE_CONFIG_ID = G.DEVICE_CONFIG_ID

  JOIN D1_DVC_IDENTIFIER H ON G.D1_DEVICE_ID = H.D1_DEVICE_ID

  WHERE TRIM(A.BUS_OBJ_CD) = 'CmPrepayBillerTaskDPDC'

    AND TRIM(B.MAINT_OBJ_CD) = 'ACCOUNT'

    AND C.SA_TYPE_CD = 'PPD'

    AND C.START_DT < &END_DATE

    AND E.SP_ID_TYPE_FLG = 'D1EI'

    AND F.D1_REMOVAL_DTTM IS NULL

    AND H.DVC_ID_TYPE_FLG = 'D1SN'

    AND LENGTH(H.ID_VALUE) = 8

),
 
-- 2. Date series generator

DATES AS (

  SELECT &START_DATE + LEVEL - 1 AS report_date

  FROM dual

  CONNECT BY LEVEL <= (&END_DATE - &START_DATE + 1)

),
 
-- 3. Daily billed customers

BILLING AS (

  SELECT END_DT AS report_date, COUNT(*) AS billed_customers

  FROM CI_BSEG

  WHERE END_DT BETWEEN &START_DATE AND &END_DATE

    AND BSEG_STAT_FLG = '50'

  GROUP BY END_DT

),
 
-- 4. Daily kWh reads (only where MSRMT_DTTM = CRE_DTTM)

KWH_READS AS (

  SELECT TRUNC(E.MSRMT_DTTM) AS report_date, COUNT(D.ID_VALUE) AS kwh_reads_received

  FROM D1_MSRMT PARTITION (P2025SEP) E

  JOIN D1_MEASR_COMP_IDENTIFIER A ON E.MEASR_COMP_ID = A.MEASR_COMP_ID

  JOIN D1_MEASR_COMP B ON A.MEASR_COMP_ID = B.MEASR_COMP_ID

  JOIN D1_DVC_CFG C ON B.DEVICE_CONFIG_ID = C.DEVICE_CONFIG_ID

  JOIN D1_DVC_IDENTIFIER D ON C.D1_DEVICE_ID = D.D1_DEVICE_ID

  WHERE TRUNC(E.MSRMT_DTTM) BETWEEN &START_DATE AND &END_DATE

    AND TRUNC(E.CRE_DTTM) = TRUNC(E.MSRMT_DTTM)

    AND A.ID_VALUE = 'kWh Daily'

    AND D.DVC_ID_TYPE_FLG = 'D1SN'

  GROUP BY TRUNC(E.MSRMT_DTTM)

)
 
-- 5. Final report combining all

SELECT 

  D.report_date,

  AC.total AS active_customers,

  NVL(B.billed_customers, 0) AS billed_customers,

  (AC.total - NVL(B.billed_customers, 0)) AS unbilled_customers,

  ROUND(((AC.total - NVL(B.billed_customers, 0)) / AC.total) * 100, 2) AS percent_unbilled,

  NVL(K.kwh_reads_received, 0) AS kwh_reads_received,

  ROUND(NVL(K.kwh_reads_received, 0) / AC.total * 100, 2) AS percent_reads_received,

  ROUND(NVL(B.billed_customers, 0) / AC.total * 100, 2) AS percent_billed

FROM DATES D

CROSS JOIN ACTIVE_CUSTOMERS AC

LEFT JOIN BILLING B ON D.report_date = B.report_date

LEFT JOIN KWH_READS K ON D.report_date = K.report_date

ORDER BY D.report_date