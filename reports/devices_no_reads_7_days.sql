select a.measr_comp_id,a.measr_comp_type_cd,a. most_recent_msrmt_dttm as LastReadRcvdDate,a.device_config_id,
s1.adhoc_char_val as custID, t1.id_value as MSN 
from d1_measr_comp a , D1_INSTALL_EVT C, d1_sp_char s1,D1_DVC_IDENTIFIER t1,D1_DVC_CFG F 
where a.measr_comp_type_cd in ('ES-KWH-TOT-1P-DAILY','ES-KWH-TOT-FWD-3P-DAILY') and 
(trunc(sysdate) - a.most_recent_msrmt_dttm)>7
and a.device_config_id=c.device_config_id
and c.D1_REMOVAL_DTTM IS NULL
and s1.d1_sp_id=C.D1_SP_ID
and s1.char_type_cd='CM_LEGCY' and s1.adhoc_char_val not like '%BAD%'
and f.d1_device_id=t1.d1_device_id 
and f.BO_STATUS_CD = 'ACTIVE' 
and f.device_config_id=a.device_config_id
and t1.dvc_id_type_flg='D1SN'