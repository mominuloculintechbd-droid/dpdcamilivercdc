select a.srch_char_val custID, g.id_value MSn , sum(audit_calc_amt)--,b2.end_dt
from ci_bseg_calc_ln b1,ci_bseg b2 ,ci_sp_char a,ci_sa_sp b,ci_sa c,d1_sp_char d,d1_install_evt e,d1_dvc_cfg f,d1_dvc_identifier g
where  a.char_type_cd='CM_LEGCY' and a.srch_char_val in ('30235122') 
and d.char_type_cd='CM_LEGCY' and d.srch_char_val=a.srch_char_val
and d.d1_sp_id=e.d1_sp_id and e.device_config_id=f.device_config_id
and g.d1_device_id=f.d1_device_id and e.BO_STATUS_CD='CONN-COMM'
and a.sp_id=b.sp_id and c.sa_id=b.sa_id and c.sa_type_cd='PPD' 
and c.sa_Status_flg='20' and b1.bseg_id=b2.bseg_id and b2.sa_id=c.sa_id  AND b2.bseg_stat_flg='50'  
and b1.calc_rule_cd in ('SUM_OF_CHARGES','CM_SUM_OF_CHG')
and trunc(b2.end_dt) < = '03-Sep-24' 
group by a.srch_char_val, g.id_value---,b2.end_dt
order by b2.end_dt asc;