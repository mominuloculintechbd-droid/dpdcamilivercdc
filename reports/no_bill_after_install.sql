select b.sa_id,b.START_DT,D.ADHOC_CHAR_VAL CUSTID,ID_VALUE MSN from cisadm.ci_sa b 
 left join ci_bseg n on b.sa_id=n.sa_id and n.BSEG_STAT_FLG='50'
 inner join cisadm.ci_sa_sp c on b.sa_id=c.sa_id and b.sa_type_cd='PPD' and sa_status_flg='20'
 inner join cisadm.ci_Sp_char d on c.sp_id=d.sp_id
 inner join cisadm.d1_sp_char s1 on S1.ADHOC_CHAR_VAL=D.ADHOC_CHAR_VAL
 inner join D1_INSTALL_EVT E1 on S1.D1_SP_ID=E1.D1_SP_ID
 inner join D1_DVC_CFG d1 on d1.device_config_id=e1.device_config_id
 inner join d1_dvc_identifier d2 on d1.d1_device_id=d2.d1_device_id
 where  s1.char_type_cd='CM_LEGCY' 
 AND E1.D1_REMOVAL_DTTM IS NULL 
 and d2.dvc_id_type_flg='D1SN' 
 and LENGTH(d2.ID_VALUE) = 8 
 and n.sa_id is null