select sum(l.AUDIT_CALC_AMT) from ci_bseg partition(p2022jul)b
inner join ci_bseg_calc_ln l on b.bseg_id = l.bseg_id and l.calc_rule_cd ='CM_MTR_RENT'
where trunc(b.start_dt) >= TO_DATE('01-07-2022', 'DD-MM-YYYY') and 
trunc(b.end_dt) <= TO_DATE('31-07-2022', 'DD-MM-YYYY') and b.bseg_stat_flg='50';