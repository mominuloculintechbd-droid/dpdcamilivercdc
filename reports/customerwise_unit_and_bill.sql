select a.acct_id,b.sa_id,i.id_value MSN,f.srch_char_val OLD_CONSUMER_ID,sum(x.BILL_SQ) total_consumption,sum(y.CALC_AMT) total_bill,
bc.entity_name PERSON_NAME
from ci_acct a 
inner join ci_sa b on a.acct_id=b.acct_id and sa_type_cd='PPD' and sa_status_flg='20'
left join ci_bseg  w on w.sa_id=b.sa_id and bseg_stat_flg='50'
and w.start_dt>='01-sep-2024' and w.end_dt<='30-sep-2024' --and w.sa_id='6858308967' --enter start date and end date here 
inner join ci_bseg_sq x on x.bseg_id=w.bseg_id and x.uom_cd='KWH' and x.TOU_CD not in ('ON','OFF') and x.sqi_cd not in ('TOT_MNTH_CONS')
inner join ci_bseg_calc y on y.bseg_id=w.bseg_id 
inner join ci_sa_sp c on c.sa_id=b.sa_id 
inner join ci_sp d on d.sp_id = c.sp_id
inner join ci_prem_char xy on xy.prem_id=d.prem_id and xy.char_type_cd='CM_NOCS' and xy.char_val='E1'--:NOCS_NAME
inner join ci_sp_char e on e.sp_id=d.sp_id and e.char_type_cd='CM_LEGCY'
inner join d1_sp_char f on f.srch_char_val=e.srch_char_val and f.char_type_cd='CM_LEGCY'
inner join d1_install_evt g on g.d1_sp_id=f.d1_sp_id and g.d1_removal_dttm is null
inner join d1_dvc_cfg h on h.DEVICE_CONFIG_ID=g.DEVICE_CONFIG_ID
inner join d1_dvc_identifier i on i.D1_DEVICE_ID=h.D1_DEVICE_ID
inner join ci_acct_per ab on ab.acct_id=a.acct_id
inner join CI_PER_NAME bc on bc.per_id=ab.per_id
group by i.id_value ,f.srch_char_val,g.bo_status_cd,h.DEVICE_CONFIG_TYPE_CD,a.acct_id,b.sa_id,bc.entity_name