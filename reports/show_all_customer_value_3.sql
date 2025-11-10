select t1.sa_id, t1.bseg_id, t1.start_dt, t1.end_dt,sum(t2.AUDIT_CALC_AMT) AS DAILY_CHARGES,
t5.start_msrmt, t5.end_msrmt, t5.quantity, T6.AUDIT_CALC_AMT AS TOTAL_Monthly_AMOUNT ,
(select sum(tot_amt) from cisadm.ci_ft where accounting_dt <= t1.end_dt and t1.sa_id=sa_id) as Payoff_bal
from ci_bseg t1, ci_bseg_calc_ln t2
, c1_usage t3, d1_usage t4, d1_usage_scalar_dtl t5, ci_bseg_calc_ln t6 --, cisadm.ci_ft
where  t1.bseg_id=t2.bseg_id and 
t1.sa_id='6126385729' and t2.CALC_RULE_CD in ('CM_TOTALCHRGE','SUM_OF_CHARGES') and t1.end_dt between '01-apr-2023' and '30-apr-2023'
and t1.bseg_id=t3.bseg_id and t3.usage_id=t4.usg_ext_id and t4.d1_usage_id=t5.d1_usage_id
and t5.seq_num =1 and t1.bseg_id=t6.bseg_id and t6.seqno=(select max(m.seqno) from ci_bseg_calc_ln m where m.bseg_id=t6.bseg_id
and m.CALC_RULE_CD='E_TM_NLL')
group by t1.sa_id, t1.bseg_id, t1.start_dt, t1.end_dt,
t5.start_msrmt, t5.end_msrmt, t5.quantity, T6.AUDIT_CALC_AMT 
order by t1.end_dt desc