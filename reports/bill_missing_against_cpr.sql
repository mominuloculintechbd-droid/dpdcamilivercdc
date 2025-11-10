select b1.sa_id,S1.D1_SP_ID,S1.ADHOC_CHAR_VAL,d2.id_value MSn,b1.end_dt,b1.cre_dttm, s2.adhoc_char_val cpr 
from ci_bseg b1
inner join cisadm.ci_sa b on b.sa_id=b1.sa_id  and b.sa_type_cd='PPD' and b1.bseg_stat_flg='50'
inner join cisadm.ci_sa_sp c on b.sa_id=c.sa_id 
inner join cisadm.ci_Sp_char d on c.sp_id=d.sp_id 
inner join cisadm.d1_sp_char s1 on S1.ADHOC_CHAR_VAL=D.ADHOC_CHAR_VAL and s1.char_type_cd='CM_LEGCY' 
inner join cisadm.d1_sp_char s2 on S1.D1_SP_ID=s2.D1_SP_ID and s2.char_type_cd='CM_CPRLA' 
and s2.adhoc_char_val in ('17615461')
inner join cisadm.D1_INSTALL_EVT E1 on S1.D1_SP_ID=E1.D1_SP_ID AND E1.D1_REMOVAL_DTTM IS NULL 
inner join cisadm.D1_DVC_CFG d1 on d1.device_config_id=e1.device_config_id
inner join cisadm.d1_dvc_identifier d2 on d1.d1_device_id=d2.d1_device_id and d2.dvc_id_type_flg='D1SN'
where  b1.end_dt = (select max(end_dt) from ci_bseg where sa_id=b1.sa_id)
order by s2.adhoc_char_val