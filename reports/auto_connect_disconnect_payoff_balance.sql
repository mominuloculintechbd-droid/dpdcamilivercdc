select a.acct_id,b.sa_id,sum(j.TOT_AMT) PAYOFF_BALNCE,i.id_value MSN,f.srch_char_val OLD_CONSUMER_ID,
xyz.LATEST_PAYMENT,xyz.pay_amt,
g.bo_status_cd METER_STATUS,h.DEVICE_CONFIG_TYPE_CD phase
from ci_acct a 
inner join ci_acct_char k on k.acct_id=a.acct_id and k.char_type_cd='CM_MTDIS' AND k.CHAR_VAL ='Y'
inner join ci_sa b on a.acct_id=b.acct_id and sa_type_cd='PPD' and sa_status_flg='20'
inner join ci_sa_sp c on c.sa_id=b.sa_id 
inner join ci_ft j on j.sa_id=b.sa_id
inner join ci_sp d on d.sp_id = c.sp_id
left JOIN (
    SELECT DISTINCT
        acct_id,
        FIRST_VALUE(ILM_DT) OVER (PARTITION BY acct_id ORDER BY ILM_DT DESC) AS LATEST_PAYMENT,
        FIRST_VALUE(PAY_AMT) OVER (PARTITION BY acct_id ORDER BY ILM_DT DESC) AS PAY_AMT
    FROM ci_pay
    WHERE pay_status_flg = '50'
) xyz 
    ON xyz.acct_id = a.acct_id
inner join ci_sp_char e on e.sp_id=d.sp_id and e.char_type_cd='CM_LEGCY'
inner join d1_sp_char f on f.srch_char_val=e.srch_char_val and f.char_type_cd='CM_LEGCY'
inner join d1_install_evt g on g.d1_sp_id=f.d1_sp_id and g.d1_removal_dttm is null --and g.bo_status_cd not in ('DISCONN-COMM')
inner join d1_dvc_cfg h on h.DEVICE_CONFIG_ID=g.DEVICE_CONFIG_ID
inner join d1_dvc_identifier i on i.D1_DEVICE_ID=h.D1_DEVICE_ID
group by i.id_value ,f.srch_char_val,g.bo_status_cd,h.DEVICE_CONFIG_TYPE_CD,a.acct_id,b.sa_id,
xyz.LATEST_PAYMENT,xyz.pay_amt