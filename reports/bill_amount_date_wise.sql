select sum(audit_calc_amt),a.srch_char_val custID, g.id_value MSn 
from ci_bseg_calc_ln b1,ci_bseg b2 ,ci_sp_char a,ci_sa_sp b,ci_sa c,d1_sp_char d,d1_install_evt e,d1_dvc_cfg f,d1_dvc_identifier g
where  a.char_type_cd='CM_LEGCY' and a.srch_char_val in ('30303385') 
and d.char_type_cd='CM_LEGCY' and d.srch_char_val=a.srch_char_val
and d.d1_sp_id=e.d1_sp_id and e.device_config_id=f.device_config_id
and g.d1_device_id=f.d1_device_id 
and a.sp_id=b.sp_id and c.sa_id=b.sa_id and c.sa_type_cd='PPD' 
and c.sa_Status_flg='20' and b1.bseg_id=b2.bseg_id and b2.sa_id=c.sa_id  AND b2.bseg_stat_flg='50'  --'2023978827'
and b1.calc_rule_cd not in ('CM_INSTLMENT_AMT','CM_MTR_RENT','DMD_CHR_LT_MT','DMD_CHR_LT_MT','CM_MTR_RENT','CM_INSTLMENT_AMT','ADD_LD_CHR')
and b2.end_dt < '01-09-2024'
group by a.srch_char_val, g.id_value