SELECT
    e.adhoc_char_val       legacy_cpr_customer_id,
    0                      customer_num,
    c.msrmt_dttm           reading_date,
    c.bill_cycle_cd        bill_cycle_code,
    1                      time_cycle_code,
    1                      tod_code,
    'kWH'                  reading_type_code,
    'B'                    purpose_of_rdng,
    'Not Applicable'       meter_type_code,
    'E'                    batch_process_flag,
    0                      cls_reading,
    0                      cum_num,
    'Not Applicable'       meter_num,
    SUM(c.msrmt_val)       loss_consumption
FROM
    cisadm.d1_sp_char         a,
    cisadm.d1_install_evt     b,
    (
        SELECT
            a.device_config_id,
            b.measr_comp_id,
            to_char(b.msrmt_dttm - 1, 'MON-YY')           msrmt_dttm,
            to_char(b.msrmt_dttm - 1, 'RRRRMM')           bill_cycle_cd,
            a.measr_comp_type_cd,
            b.msrmt_val
        FROM
            cisadm.d1_measr_comp    a,
            cisadm.d1_msrmt         b
        WHERE
                a.measr_comp_id = b.measr_comp_id
            AND a.measr_comp_type_cd IN ( 'ES-KWH-TOT-1P-DAILY', 'ES-KWH-TOT-FWD-3P-DAILY' ,
            'ST-KWH-TOT-1P-DAILY','ST-KWH-TOT-FWD-3P-DAILY','WS-KWH-TOT-1P-DAILY','WS-KWH-TOT-FWD-3P-DAILY')
            AND NOT EXISTS (
                SELECT
                    1
                FROM
                    cisadm.d1_measr_comp dmc
                WHERE
                        a.device_config_id = dmc.device_config_id
                    AND measr_comp_type_cd IN ( 'ES-KWH-TOD1-1P-DAILY', 'ES-KWH-TOD1-3P-DAILY', 'ES-KWH-TOD2-1P-DAILY', 'ES-KWH-TOD2-3P-DAILY',          
            'ST-KWH-TOD1-1P-DAILY','ST-KWH-TOD1-3P-DAILY', 'ST-KWH-TOD2-1P-DAILY', 'ST-KWH-TOD2-3P-DAILY',
             'WS-KWH-TOD1-1P-DAILY','WS-KWH-TOD1-3P-DAILY', 'WS-KWH-TOD2-1P-DAILY', 'WS-KWH-TOD2-3P-DAILY')
            )
AND msrmt_val > 0
            AND to_char(b.msrmt_dttm - 1, 'MON-YY') = :MON_YR
    )                  c,
    cisadm.d1_sp_char         d,
    cisadm.d1_sp_char         e,
    cisadm.d1_dvc_cfg         f,
    cisadm.d1_dvc_identifier  g
WHERE
        a.char_type_cd = 'CM-CPRCP'
    AND a.char_val = 'CPC'
    AND a.d1_sp_id = b.d1_sp_id
    AND b.device_config_id = c.device_config_id
    AND a.d1_sp_id = d.d1_sp_id
    AND d.char_type_cd = 'CM_LEGCY'
    AND a.d1_sp_id = e.d1_sp_id
    AND e.char_type_cd = 'CM_CPRLA'
    AND c.device_config_id = f.device_config_id
    AND f.d1_device_id = g.d1_device_id
    AND g.dvc_id_type_flg = 'D1SN'
GROUP BY
    e.adhoc_char_val,
    c.msrmt_dttm,
    c.bill_cycle_cd
UNION ALL
SELECT
    e.adhoc_char_val       legacy_cpr_customer_id,
    0                      customer_num,
    c.msrmt_dttm           reading_date,
    c.bill_cycle_cd        bill_cycle_code,
    2                      time_cycle_code,
    2                      tod_code,
    'kWH'                  reading_type_code,
    'B'                    purpose_of_rdng,
    'Not Applicable'       meter_type_code,
    'E'                    batch_process_flag,
    0                      cls_reading,
    0                      cum_num,
    'Not Applicable'       meter_num,
    SUM(c.msrmt_val)       loss_consumption
FROM
    cisadm.d1_sp_char         a,
    cisadm.d1_install_evt     b,
    (
        SELECT
            a.device_config_id,
            to_char(b.msrmt_dttm - 1, 'MON-YY')           msrmt_dttm,
            to_char(b.msrmt_dttm - 1, 'RRRRMM')           bill_cycle_cd,
            a.measr_comp_type_cd,
            b.msrmt_val
        FROM
            cisadm.d1_measr_comp    a,
            cisadm.d1_msrmt         b
        WHERE
                a.measr_comp_id = b.measr_comp_id
            AND a.measr_comp_type_cd IN ( 'ES-KWH-TOD1-1P-DAILY', 'ES-KWH-TOD1-3P-DAILY' ,
            'ST-KWH-TOT-1P-DAILY','ST-KWH-TOT-FWD-3P-DAILY','WS-KWH-TOT-1P-DAILY','WS-KWH-TOT-FWD-3P-DAILY')
            AND msrmt_val > 0
            AND to_char(b.msrmt_dttm - 1, 'MON-YY') = :MON_YR
    )                  c,
    cisadm.d1_sp_char         d,
    cisadm.d1_sp_char         e,
    cisadm.d1_dvc_cfg         f,
    cisadm.d1_dvc_identifier  g
WHERE
        a.char_type_cd = 'CM-CPRCP'
    AND a.char_val = 'CPC'
    AND a.d1_sp_id = b.d1_sp_id
    AND b.device_config_id = c.device_config_id
    AND a.d1_sp_id = d.d1_sp_id
    AND d.char_type_cd = 'CM_LEGCY'
    AND a.d1_sp_id = e.d1_sp_id
    AND e.char_type_cd = 'CM_CPRLA'
    AND c.device_config_id = f.device_config_id
    AND f.d1_device_id = g.d1_device_id
    AND g.dvc_id_type_flg = 'D1SN'
GROUP BY
    e.adhoc_char_val,
    c.msrmt_dttm,
    c.bill_cycle_cd
UNION ALL
SELECT
    e.adhoc_char_val       legacy_cpr_customer_id,
    0                      customer_num,
    c.msrmt_dttm           reading_date,
    c.bill_cycle_cd        bill_cycle_code,
    3                      time_cycle_code,
    2                      tod_code,
    'kWH'                  reading_type_code,
    'B'                    purpose_of_rdng,
    'Not Applicable'       meter_type_code,
    'E'                    batch_process_flag,
    0                      cls_reading,
    0                      cum_num,
    'Not Applicable'       meter_num,
    SUM(c.msrmt_val)       loss_consumption
FROM
    cisadm.d1_sp_char         a,
    cisadm.d1_install_evt     b,
    (
        SELECT
            a.device_config_id,
            to_char(b.msrmt_dttm - 1, 'MON-YY')           msrmt_dttm,
            to_char(b.msrmt_dttm - 1, 'RRRRMM')           bill_cycle_cd,
            a.measr_comp_type_cd,
            b.msrmt_val
        FROM
            cisadm.d1_measr_comp    a,
            cisadm.d1_msrmt         b
        WHERE
                a.measr_comp_id = b.measr_comp_id
            AND a.measr_comp_type_cd IN ( 'ES-KWH-TOD2-1P-DAILY', 'ES-KWH-TOD2-3P-DAILY',
'ST-KWH-TOD2-1P-DAILY', 'ST-KWH-TOD2-3P-DAILY' ,'WS-KWH-TOD2-1P-DAILY', 'WS-KWH-TOD2-3P-DAILY' )
            AND msrmt_val > 0
            AND to_char(b.msrmt_dttm - 1, 'MON-YY') = :MON_YR
    )                  c,
    cisadm.d1_sp_char         d,
    cisadm.d1_sp_char         e,
    cisadm.d1_dvc_cfg         f,
    cisadm.d1_dvc_identifier  g
WHERE
        a.char_type_cd = 'CM-CPRCP'
    AND a.char_val = 'CPC'
    AND a.d1_sp_id = b.d1_sp_id
    AND b.device_config_id = c.device_config_id
    AND a.d1_sp_id = d.d1_sp_id
    AND d.char_type_cd = 'CM_LEGCY'
    AND a.d1_sp_id = e.d1_sp_id
    AND e.char_type_cd = 'CM_CPRLA'
    AND c.device_config_id = f.device_config_id
    AND f.d1_device_id = g.d1_device_id
    AND g.dvc_id_type_flg = 'D1SN'
GROUP BY
    e.adhoc_char_val,
    c.msrmt_dttm,
    c.bill_cycle_cd
ORDER BY
    1