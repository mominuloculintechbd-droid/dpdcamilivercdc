select  billing.msn, billing.CUSTID, billing.start_dt, billing.end_dt,
billing.daily_charges , billing.measr_comp_id,
(select min(m1.start_msrmt) from d1_usage_scalar_dtl m1 where m1.d1_usage_id=billing.usageid and m1.measr_comp_id=billing.measr_comp_id) as start_read,
(select max(m1.end_msrmt) from d1_usage_scalar_dtl m1 where m1.d1_usage_id=billing.usageid and m1.measr_comp_id=billing.measr_comp_id) as end_read,
billing.quantity , billing.TOTAL_MONTHLY_AMOUNT, billing.PAYOFF_BAL from 
(SELECT   T11.ID_VALUE AS MSN, (SELECT ADHOC_CHAR_VAL FROM CI_SP_CHAR WHERE CHAR_TYPE_CD='CM_LEGCY'  
AND ADHOC_CHAR_VAL=:F1) 
AS CUSTID, T12.CONTACT_VALUE AS MOBILE_NO,
T4.D1_USAGE_ID usageID, 
T1.START_DT, T1.END_DT, SUM(T2.AUDIT_CALC_AMT) AS DAILY_CHARGES,
t5.measr_comp_id, t5.quantity,
T6.AUDIT_CALC_AMT AS TOTAL_MONTHLY_AMOUNT ,
(SELECT SUM(TOT_AMT) FROM CI_FT WHERE ACCOUNTING_DT <= T1.END_DT AND T1.SA_ID=SA_ID) AS PAYOFF_BAL
FROM CI_BSEG T1
left join  CI_BSEG_CALC_LN T6 on t6.bseg_id=t1.bseg_id and t6.SEQNO=(SELECT MAX(M.SEQNO) FROM CI_BSEG_CALC_LN M 
WHERE M.BSEG_ID=t6.BSEG_ID AND M.CALC_RULE_CD='E_TM_NLL')
, CI_BSEG_CALC_LN T2
, C1_USAGE T3, D1_USAGE T4, D1_USAGE_PERIOD_SQ T5
, D1_US_CONTACT T7, D1_CONTACT_PHONE T8, D1_MEASR_COMP T9, D1_DVC_CFG T10, D1_DVC_IDENTIFIER T11,C1_PER_CONTDET T12
WHERE  T1.BSEG_ID=T2.BSEG_ID AND T1.BSEG_STAT_FLG<>'60' AND 
T4.US_ID=T7.US_ID AND T7.CONTACT_ID=T8.CONTACT_ID AND          
T5.MEASR_COMP_ID=T9.MEASR_COMP_ID AND T9.DEVICE_CONFIG_ID=T10.DEVICE_CONFIG_ID 
AND T10.D1_DEVICE_ID=T11.D1_DEVICE_ID AND T11.DVC_ID_TYPE_FLG='D1SN' AND
T1.SA_ID = (SELECT E3.SA_ID FROM CI_SA_SP E1,CI_SA E3 WHERE
SP_ID=(SELECT SP_ID FROM CI_SP_CHAR WHERE  CHAR_TYPE_CD='CM_LEGCY'  
AND ADHOC_CHAR_VAL=:F1)
AND E3.SA_TYPE_CD='PPD     ' AND E3.SA_ID=E1.SA_ID ) 
AND T12.per_id in (select per_id from ci_acct_per where acct_id in (select acct_id from ci_acct where acct_id in 
(select acct_id from ci_sa where sa_id =T1.SA_ID)))
and  t12.cnd_primary_flg='C1YS'
AND T2.CALC_RULE_CD IN ('CM_TOTALCHRGE','SUM_OF_CHARGES','E_LTECOP','E_LTECPK','E_LTC2CN','E_LTC1OP','E_LTC1PK') 
AND T1.END_DT BETWEEN  :F2 AND :F3
AND T1.BSEG_ID=T3.BSEG_ID AND T3.USAGE_ID=T4.USG_EXT_ID AND 
T4.D1_USAGE_ID=T5.D1_USAGE_ID
and  trim(t5.d1_tou_cd) is  null
and  trim(t5.d1_sqi_cd) is  null
and t5.d1_uom_cd='KWH'
GROUP BY T1.SA_ID, T1.BSEG_ID, T1.START_DT, T1.END_DT,
T4.D1_USAGE_ID,
T5.QUANTITY,
T6.AUDIT_CALC_AMT ,
T12.CONTACT_VALUE ,T11.ID_VALUE,T5.MEASR_COMP_ID
ORDER BY T1.END_DT ASC) billing