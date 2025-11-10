SELECT a.acct_id, b.sa_id, i.id_value MSN, f.srch_char_val OLD_CONSUMER_ID,
       SUM(x.BILL_SQ) total_consumption, SUM(y.CALC_AMT) total_bill,
       bc.entity_name PERSON_NAME
FROM ci_acct a 
INNER JOIN ci_sa b ON a.acct_id = b.acct_id 
    AND b.sa_type_cd = 'PPD' 
    AND b.sa_status_flg = '20'
INNER JOIN ci_bseg w ON w.sa_id = b.sa_id 
    AND w.bseg_stat_flg = '50'
    AND w.start_dt >= DATE '2025-07-01' 
    AND w.end_dt <= DATE '2025-07-31'
INNER JOIN ci_bseg_sq x ON x.bseg_id = w.bseg_id 
    AND x.uom_cd = 'KWH' 
    AND x.TOU_CD NOT IN ('ON','OFF') 
    AND x.sqi_cd != 'TOT_MNTH_CONS'
INNER JOIN ci_bseg_calc y ON y.bseg_id = w.bseg_id 
INNER JOIN ci_sa_sp c ON c.sa_id = b.sa_id 
INNER JOIN ci_sp d ON d.sp_id = c.sp_id
INNER JOIN ci_prem_char xy ON xy.prem_id = d.prem_id 
    AND xy.char_type_cd = 'CM_NOCS' 
    --AND xy.char_val = 'E1'
INNER JOIN ci_sp_char e ON e.sp_id = d.sp_id 
    AND e.char_type_cd = 'CM_LEGCY'
INNER JOIN d1_sp_char f ON f.srch_char_val = e.srch_char_val 
    AND f.char_type_cd = 'CM_LEGCY'
INNER JOIN d1_install_evt g ON g.d1_sp_id = f.d1_sp_id 
    AND g.d1_removal_dttm IS NULL
INNER JOIN d1_dvc_cfg h ON h.DEVICE_CONFIG_ID = g.DEVICE_CONFIG_ID
INNER JOIN d1_dvc_identifier i ON i.D1_DEVICE_ID = h.D1_DEVICE_ID
INNER JOIN ci_acct_per ab ON ab.acct_id = a.acct_id
INNER JOIN CI_PER_NAME bc ON bc.per_id = ab.per_id
GROUP BY a.acct_id, b.sa_id, i.id_value, f.srch_char_val, bc.entity_name;