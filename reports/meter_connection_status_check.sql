-- Meter connection status check
-- Shows meters with DISCONN-COMM status
SELECT DISTINCT 
       --a.acct_id    AS customer_id,
       g.INSTALL_EVT_ID ,
       g.D1_SP_ID,
       g.DEVICE_CONFIG_ID,
       g.D1_INSTALL_DTTM ,
       g.D1_REMOVAL_DTTM,
       g.BUS_OBJ_CD,
       i.id_value   AS meter_no,
       g.bo_status_cd AS status
FROM d1_install_evt g
INNER JOIN d1_sp_char f 
    ON g.d1_sp_id = f.d1_sp_id
   AND f.char_type_cd = 'CM_LEGCY'
INNER JOIN d1_sp_identifier e 
    ON e.d1_sp_id = f.d1_sp_id
   AND e.sp_id_type_flg = 'D1EI'
INNER JOIN ci_sp d 
    ON d.sp_id = e.id_value
INNER JOIN ci_sa_sp c 
    ON c.sp_id = d.sp_id
INNER JOIN ci_sa b 
    ON b.sa_id = c.sa_id
INNER JOIN ci_acct a 
    ON a.acct_id = b.acct_id
INNER JOIN d1_dvc_cfg h 
    ON h.device_config_id = g.device_config_id
INNER JOIN d1_dvc_identifier i 
    ON i.d1_device_id = h.d1_device_id
WHERE g.bo_status_cd = 'DISCONN-COMM';