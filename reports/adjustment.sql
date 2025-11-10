select s1.ADHOC_CHAR_VAL as customer_id,d2.id_value MSN,a.adj_type_cd,a.adj_amt,a.comments,k.char_val as NOCS_code,l.descr AS NOCS_NAME from ci_adj a 
inner join ci_sa b on a.sa_id=b.sa_id and a.adj_type_cd in('CM_CRADJ','CM_ADMTR')
inner join cisadm.ci_sa_sp c on b.sa_id=c.sa_id and b.sa_type_cd='PPD'
inner join cisadm.ci_Sp_char d on c.sp_id=d.sp_id 
inner join cisadm.d1_sp_char s1 on S1.ADHOC_CHAR_VAL=D.ADHOC_CHAR_VAL and s1.char_type_cd='CM_LEGCY' 
inner join d1_install_evt e1 on e1.d1_sp_id=s1.d1_sp_id 
inner join d1_dvc_cfg d1 on e1.device_config_id=d1.device_config_id
inner join d1_dvc_identifier d2 on d1.d1_device_id=d2.d1_device_id
inner join ci_sp s on s.sp_id=c.sp_id
inner join ci_prem_char k on k.prem_id=s.prem_id
inner join CI_CHAR_VAL_L l on k.char_val=l.char_val
where s1.ADHOC_CHAR_VAL in ('17736352') and k.char_type_cd='CM_NOCS';