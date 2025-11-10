-- NOCS Balance Summary
-- Shows sum of positive and negative balances grouped by NOCS
SELECT
    nocsDescr AS nocs_name,
    NOCS AS nocs_code,
    COUNT(*) AS total_customers,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS positive_balance,
    SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) AS negative_balance,
    SUM(amount) AS net_balance
FROM (
    SELECT
        table1.*,
        (SELECT SUM(q1.tot_amt)
         FROM ci_ft q1, cisadm.ci_acct a, cisadm.ci_sa b, cisadm.ci_sa_sp c, cisadm.ci_sp_char d
         WHERE q1.sa_id = b.sa_id
           AND a.acct_id = b.acct_id
           AND b.sa_id = c.sa_id
           AND c.sp_id = d.sp_id
           AND b.sa_type_cd = 'PPD'
           AND d.char_type_cd = 'CM_LEGCY'
           AND freeze_sw = 'Y'
           AND d.adhoc_char_val = table1.custid
           AND b.SA_STATUS_FLG = '20'
        ) amount,
        (SELECT MAX(p1.ilm_dt)
         FROM CI_PAY_EVENT p1, CI_PAY_TNDR p2, cisadm.ci_acct a, cisadm.ci_sa b, cisadm.ci_sa_sp c, cisadm.ci_sp_char d
         WHERE p1.pay_event_id = p2.pay_event_id
           AND p2.payor_acct_id = a.acct_id
           AND a.acct_id = b.acct_id
           AND b.sa_id = c.sa_id
           AND c.sp_id = d.sp_id
           AND b.sa_type_cd = 'PPD'
           AND d.char_type_cd = 'CM_LEGCY'
           AND d.adhoc_char_val = table1.custid
           AND b.SA_STATUS_FLG = '20'
        ) LastPayDate
    FROM (
        SELECT
            s1.adhoc_char_val custID,
            d2.id_value,
            TRUNC(s2.cre_dttm) migrationDate,
            e1.d1_install_dttm,
            f1.id_value TransformerCode,
            r1.id_value feeder,
            l2.descr100,
            (SELECT r3.id_value
             FROM D1_FACILITY_IDENTIFIER r3
             WHERE facility_id = (
                 SELECT network_node
                 FROM D1_NW_NODE
                 WHERE network_location_id = (
                     SELECT n1.network_location_id
                     FROM D1_FACILITY_IDENTIFIER f2, D1_NW_LOC n1, d1_facility d3
                     WHERE f2.facility_id = d3.facility_id
                       AND d3.facility_id = r1.facility_id
                       AND n1.facility_id = d3.facility_id
                       AND d3.bus_obj_cd = 'CM-Feeder'
                 )
             )
            ) Substation,
            P.CHAR_VAL NOCS,
            l.descr nocsDescr
        FROM d1_sp_char s1,
             d1_sp s2,
             d1_install_evt e1,
             d1_dvc_cfg d1,
             d1_dvc_identifier d2,
             D1_FACILITY_IDENTIFIER f1,
             d1_facility f3,
             d1_sp_facility f2,
             D1_FACILITY_IDENTIFIER r1,
             D1_NW_NODE n2,
             D1_NW_LOC n1,
             D1_FACILITY_L l2,
             d1_sp_identifier s3,
             CI_PREM_CHAR p,
             ci_char_val_l l
        WHERE s1.char_type_cd = 'CM_LEGCY'
          AND s2.d1_sp_id = s3.d1_sp_id
          AND s3.SP_ID_TYPE_FLG = 'D1EP'
          AND e1.d1_removal_dttm IS NULL
          AND S3.ID_VALUE = p.PREM_ID
          AND l.descr IN (
              'Adabor',
              'Banasree',
              'Banglabazar',
              'Bangshal',
              'Demra',
              'Dhanmondi',
              'Fatulla',
              'Jigatola',
              'Kazla',
              'Khilgaon',
              'Mugdapara',
              'Paribag',
              'Postogola',
              'Rajarbag',
              'Satmasjid',
              'Shere-e-Bangla Nagar',
              'Shytaklakha'
          )
          AND p.char_type_cd = 'CM_NOCS'
          AND p.char_val = l.char_val
          AND s1.d1_sp_id = e1.d1_sp_id
          AND s1.d1_sp_id = s2.d1_sp_id
          AND d1.device_config_id = e1.device_config_id
          AND dvc_id_type_flg = 'D1SN'
          AND d2.d1_device_id = d1.d1_device_id
          AND f2.d1_sp_id = s1.d1_sp_id
          AND f3.bus_obj_cd = 'D1-Transformer'
          AND f2.facility_id = f1.facility_id
          AND f3.facility_id = f1.facility_id
          AND n1.facility_id = f1.facility_id
          AND n1.network_location_id = n2.network_location_id
          AND n2.network_node = r1.facility_id
          AND r1.facility_id = l2.facility_id
    ) table1
    WHERE CUSTID NOT LIKE '%BAD'
      AND CUSTID NOT LIKE '%DUP'
      AND ID_VALUE NOT LIKE '%BAD'
      AND ID_VALUE NOT LIKE '%D%'
      AND ID_VALUE NOT LIKE '%RP%'
      AND ID_VALUE NOT LIKE '%DEMO%'
      AND ID_VALUE NOT LIKE '%DIFF%'
)
WHERE amount IS NOT NULL
GROUP BY nocsDescr, NOCS
ORDER BY nocsDescr
