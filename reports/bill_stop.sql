select b1.sa_id,b1.end_dt,D.ADHOC_CHAR_VAL CUSTID,ID_VALUE MSN from ci_bseg b1,cisadm.ci_sa b ,
cisadm.ci_sa_sp c,cisadm.ci_Sp_char d,cisadm.d1_sp_char s1,D1_INSTALL_EVT E1, D1_DVC_CFG d1 ,d1_dvc_identifier d2
where bseg_stat_flg='50'
and trunc(sysdate)-(b1.end_dt)>:days_threshold
and b1.end_dt = (select max(end_dt) from ci_bseg where sa_id=b1.sa_id)
and b.sa_id=c.sa_id and c.sp_id=d.sp_id and b.sa_type_cd='PPD'
and b.sa_id=b1.sa_id and s1.char_type_cd='CM_LEGCY' AND S1.ADHOC_CHAR_VAL=D.ADHOC_CHAR_VAL
AND S1.D1_SP_ID=E1.D1_SP_ID AND E1.D1_REMOVAL_DTTM IS NULL and d1.device_config_id=e1.device_config_id
and d1.d1_device_id=d2.d1_device_id and d2.dvc_id_type_flg='D1SN'