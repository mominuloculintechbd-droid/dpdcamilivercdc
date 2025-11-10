select a.srch_char_val custID, g.id_value MSn , 
sum(audit_calc_amt),
e.D1_REMOVAL_DTTM AS Replacement_date,
MAX(b2.end_dt) AS Last_Bill_Date
from ci_bseg_calc_ln b1,ci_bseg b2 ,ci_sp_char a,ci_sa_sp b,ci_sa c,d1_sp_char d,d1_install_evt e,d1_dvc_cfg f,d1_dvc_identifier g
where  a.char_type_cd='CM_LEGCY' and a.srch_char_val in ('30415864') 
and d.char_type_cd='CM_LEGCY' and d.srch_char_val=a.srch_char_val
and d.d1_sp_id=e.d1_sp_id and e.device_config_id=f.device_config_id
and g.d1_device_id=f.d1_device_id and e.BO_STATUS_CD='REMOVE'
AND (e.D1_REMOVAL_DTTM IS NULL OR e.D1_REMOVAL_DTTM > =b2.end_dt)
and a.sp_id=b.sp_id and c.sa_id=b.sa_id and c.sa_type_cd='PPD' 
and c.sa_Status_flg='20' and b1.bseg_id=b2.bseg_id and b2.sa_id=c.sa_id  AND b2.bseg_stat_flg='50'  
and b1.calc_rule_cd not in ('SUM_OF_CHARGES','CM_SUM_OF_CHG','CM_INSTLMENT_AMT','CM_MTR_RENT','DMD_CHR_LT_MT','DMD_CHR_LT_MT','CM_MTR_RENT',
'CM_INSTLMENT_AMT','ADD_LD_CHR','E_LTARES_NLL','E_TM_NLL')
and trunc(b2.end_dt) < = '11-Nov-2024'
group by a.srch_char_val, g.id_value,e.D1_REMOVAL_DTTM