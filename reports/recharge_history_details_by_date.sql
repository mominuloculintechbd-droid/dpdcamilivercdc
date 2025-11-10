SELECT t2.pay_dt,t1.tender_amt ,t3.tndr_source_cd,t4.descr , D.adhoc_Char_val custID,h.id_value MSN,P.CHAR_VAL NOCS, l.descr
FROM CI_PAY_TNDR T1 ,CI_PAY_EVENT T2 , CI_TNDR_CTL t3,CI_TNDR_SRCE_L t4,
cisadm.ci_acct a ,cisadm.ci_sa b ,cisadm.ci_sa_sp c,cisadm.ci_Sp_char d ,CISADM.D1_SP_CHAR e,
d1_install_evt f,d1_dvc_cfg g,d1_dvc_identifier h,d1_Sp_identifier s1,CI_PREM_CHAR p,ci_char_val_l l
where T1.PAY_EVENT_ID=T2.PAY_EVENT_ID AND T2.ilm_dt='26-Mar-2024'
and t1.tndr_ctl_id=t3.tndr_ctl_id
and t3.tndr_source_cd=t4.tndr_source_cd 
AND a.acct_id=b.acct_id and b.sa_id=c.sa_id and c.sp_id=d.sp_id
and b.sa_type_cd='PPD' and d.char_type_cd='CM_LEGCY' 
and e.adhoc_Char_val=D.adhoc_Char_val and e.char_type_cd='CM_LEGCY'
and e.d1_sp_id=f.d1_sp_id and f.device_config_id=g.device_config_id
and g.d1_device_id=h.d1_device_id and h.dvc_id_type_flg='D1SN'
and e.d1_sp_id=s1.d1_sp_id and s1.SP_ID_TYPE_FLG='D1EP'
AND S1.ID_VALUE=p.PREM_ID
and p.char_type_cd='CM_NOCS' and p.char_val=l.char_val
and A.ACCT_ID=t1.payor_acct_id