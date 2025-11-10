select a.acct_id,sum(j.TOT_AMT)
from ci_acct a 
inner join ci_acct_char k on k.acct_id=a.acct_id and k.char_type_cd='CM_MTDIS' AND k.CHAR_VAL ='Y'
inner join ci_sa b on a.acct_id=b.acct_id and sa_type_cd='PPD' and sa_status_flg='20'
inner join ci_sa_sp c on c.sa_id=b.sa_id 
inner join ci_ft j on j.sa_id=b.sa_id and j.freeze_sw='Y'
inner join ci_sp d on d.sp_id = c.sp_id
inner join d1_sp_identifier e on e.id_value=d.sp_id and e.sp_id_type_flg = 'D1EI'
inner join d1_sp_char f on f.d1_sp_id=e.d1_sp_id and f.char_type_cd='CM_LEGCY'
inner join d1_install_evt g on g.d1_sp_id=f.d1_sp_id and g.bo_status_cd in ('CONN-COMM')
inner join d1_dvc_cfg h on h.DEVICE_CONFIG_ID=g.DEVICE_CONFIG_ID
inner join d1_dvc_identifier i on i.D1_DEVICE_ID=h.D1_DEVICE_ID
where a.acct_id not in (select acct_id from ci_acct_char where char_type_cd = 'CM_DISDT' and srch_char_val = to_char(sysdate,'YYYY-MM-DD'))
group by a.acct_id having sum(j.TOT_AMT)>=200